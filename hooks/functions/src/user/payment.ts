import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import cors from "cors";
import * as crypto from "crypto";
import {db, cashfree, CASHFREE_WEBHOOK_SECRET} from "../config";
import {PaymentNotes, PlanDetails, TokenPlanDetails} from "./types";

// एक सफल खरीद को प्रोसेस करने के लिए सहायक फंक्शन
const processPurchase = async (paymentNotes: PaymentNotes, paymentId: string) => {
  const {userId, planType, planDetails} = paymentNotes;
  if (!userId) {
    throw new functions.https.HttpsError("invalid-argument", "Payment notes में User ID नहीं है।");
  }

  const paymentRef = db.collection("processedPayments").doc(paymentId);
  const userRef = db.collection("users").doc(userId);

  // Firestore Transaction का उपयोग करके डेटा को सुरक्षित रूप से अपडेट करें
  await db.runTransaction(async (transaction) => {
    const paymentDoc = await transaction.get(paymentRef);
    if (paymentDoc.exists) {
      functions.logger.warn(`Payment ${paymentId} पहले ही प्रोसेस हो चुका है।`);
      return;
    }

    const details = JSON.parse(planDetails);

    if (planType === "mt") {
      const tokenDetails = details as TokenPlanDetails;
      transaction.update(userRef, {tokens: admin.firestore.FieldValue.increment(tokenDetails.tokens)});
    } else { // planType === "dt"
      const dtDetails = details as PlanDetails;
      
      // FIX: Construct the newPlan object carefully to avoid undefined fields
      // which are not supported by Firestore and cause the transaction to fail.
      const newPlan: any = {
        id: `plan_${Date.now()}`,
        type: dtDetails.type,
        name: dtDetails.name,
        price: dtDetails.price,
        purchaseTimestamp: Date.now(),
        expiryTimestamp: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30-day expiry
      };

      if (dtDetails.minutes) {
        newPlan.minutes = dtDetails.minutes;
      }
      if (dtDetails.messages) {
        newPlan.messages = dtDetails.messages;
      }

      // Use set with merge to avoid errors for new users without activePlans array.
      transaction.set(userRef, {activePlans: admin.firestore.FieldValue.arrayUnion(newPlan)}, { merge: true });
    }

    const rechargeHistoryRef = userRef.collection("rechargeHistory").doc();
    transaction.set(rechargeHistoryRef, {
      timestamp: Date.now(),
      amount: details.price,
      planType: planType.toUpperCase(),
      planDetails: planType === "mt" ? `${details.tokens} MT` : details.name,
      status: "Success",
      paymentId: paymentId,
    });

    transaction.set(paymentRef, {processedAt: admin.firestore.FieldValue.serverTimestamp()});
  });
};

// --- Cashfree ऑर्डर बनाने के लिए Callable Function ---
export const createCashfreeOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "आपको लॉग इन होना चाहिए।");

  const {amount, planType, planDetails} = data;
  const userDoc = await db.collection("users").doc(context.auth.uid).get();
  if (!userDoc.exists) throw new functions.https.HttpsError("not-found", "User नहीं मिला।");
  const userData = userDoc.data()!;

  const orderRequest = {
    order_id: `SAKOON_ORDER_${Date.now()}`,
    order_amount: amount,
    order_currency: "INR",
    customer_details: {
      customer_id: context.auth.uid,
      customer_name: userData.name || "Sakoon User",
      customer_email: userData.email || "user@example.com",
      customer_phone: userData.mobile || "9999999999",
    },
    order_meta: {
      return_url: "https://example.com/return",
      notify_url: "https://example.com/notify",
      payment_methods: "",
    },
    // FIX: Stringify the inner planDetails object to ensure it's a string within the final JSON
    order_note: JSON.stringify({
      userId: context.auth.uid, 
      planType, 
      planDetails: JSON.stringify(planDetails)
    }),
    order_expiry_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };

  try {
    const response = await cashfree.PGCreateOrder(orderRequest);
    return {success: true, paymentSessionId: response.data.payment_session_id};
  } catch (error: any) {
    functions.logger.error("Cashfree ऑर्डर बनाने में विफल:", error.response?.data || error.message);
    throw new functions.https.HttpsError("internal", "पेमेंट ऑर्डर बनाने में विफल।");
  }
});

// --- Cashfree Webhook Handler ---
// FIX: Replaced Express app with a standard Cloud Function handler to resolve type conflicts.
const corsHandler = cors({origin: true});

export const webhookHandler = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const signature = req.headers["x-webhook-signature"] as string;
      const timestamp = req.headers["x-webhook-timestamp"] as string;

      // Use req.rawBody for signature verification, as Firebase automatically parses JSON bodies.
      const payload = req.rawBody.toString();
      const expectedSignature = crypto
        .createHmac("sha256", CASHFREE_WEBHOOK_SECRET)
        .update(`${timestamp}${payload}`)
        .digest("base64");

      if (signature !== expectedSignature) {
        res.status(401).send("Unauthorized");
        return;
      }

      // We can now safely use the parsed body from Firebase.
      const eventData = req.body;
      if (eventData.data.order.order_status === "PAID") {
        const paymentNotes = JSON.parse(eventData.data.order.order_note);
        const paymentId = eventData.data.payment.cf_payment_id.toString();
        await processPurchase(paymentNotes, paymentId);
      }

      res.status(200).send("Webhook received");
    } catch (error: any) {
      functions.logger.error("Webhook प्रोसेस करने में त्रुटि:", error);
      res.status(500).send("Internal Server Error");
    }
  });
});
