
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
// FIX: Using `any` for req/res as there are deep type conflicts between express/firebase-functions.
import express from "express";
import cors from "cors";
import {RtcTokenBuilder} from "zego-express-engine";
// FIX: Updated imports for cashfree-pg SDK to match modern versions.
import { Cashfree } from "cashfree-pg";
import * as crypto from "crypto";

admin.initializeApp();
const db = admin.firestore();

// FIX: Correctly configured the Cashfree SDK. The 'cashfree-pg' package expects
// 'api_key', 'api_secret', and 'env' for initialization.
const cashfree = new Cashfree({
    api_key: functions.config().cashfree.client_id,
    api_secret: functions.config().cashfree.client_secret,
    env: functions.config().cashfree.env === "PROD" ? "production" : "sandbox",
});

const firebaseUIDtoZegoUID = (uid: string): number => {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    const char = uid.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const uHash = hash >>> 0;
  return uHash === 0 ? 1 : uHash;
};

const processPurchase = async (paymentNotes: any, paymentId: string) => {
  const { userId, planType, planDetails } = paymentNotes;
  if (!userId) throw new Error("User ID missing in payment notes");

  const paymentRef = db.collection("processedPayments").doc(paymentId);
  const paymentDoc = await paymentRef.get();
  if (paymentDoc.exists) {
    console.log(`Payment ${paymentId} has already been processed.`);
    return;
  }

  const userRef = db.collection("users").doc(userId);
  const details = typeof planDetails === "string" ?
      JSON.parse(planDetails) : planDetails;

  if (planType === "mt") {
    const tokens = parseInt(details.tokens, 10);
    if (isNaN(tokens) || tokens <= 0) {
      throw new Error(`Invalid tokens value: ${details.tokens}`);
    }
    await userRef.update({
      tokens: admin.firestore.FieldValue.increment(tokens),
    });
    console.log(`Successfully added ${tokens} MT to user ${userId}`);
  } else {
    const newPlan = {
      ...details,
      id: `plan_${Date.now()}`,
      purchaseTimestamp: Date.now(),
      expiryTimestamp: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30-day expiry
    };
    await userRef.update({
      activePlans: admin.firestore.FieldValue.arrayUnion(newPlan),
    });
    console.log(`Successfully added plan ${newPlan.name} to user ${userId}`);
  }

  // Log to recharge history subcollection
  const rechargeHistoryRef = userRef.collection("rechargeHistory");
  await rechargeHistoryRef.add({
    timestamp: Date.now(),
    amount: details.price,
    planType: planType.toUpperCase(),
    planDetails: planType === "mt" ? `${details.tokens} MT` : details.name,
    status: "Success",
    paymentId: paymentId,
  });

  await paymentRef.set({processedAt: admin.firestore.FieldValue.serverTimestamp()});
};

const app = express();
app.use(cors({origin: true}));

// FIX: Cast `express.raw` to `any` to resolve type conflicts between Express and Firebase middleware.
app.post("/cashfreeWebhook", express.raw({type: "application/json"}) as any, async (req: any, res: any) => {
  try {
    const signature = req.headers["x-webhook-signature"] as string;
    const timestamp = req.headers["x-webhook-timestamp"] as string;
    const payload = req.body.toString();

    const secret = functions.config().cashfree.webhook_secret;
    const stringToSign = `${timestamp}${payload}`;
    const expectedSignature = crypto.createHmac("sha256", secret).update(stringToSign).digest("base64");

    if (signature !== expectedSignature) {
      console.error("Webhook signature verification failed.");
      return res.status(401).send("Unauthorized");
    }

    const data = JSON.parse(payload).data;
    if (data.order.order_status === "PAID") {
      const paymentNotes = data.order.order_meta.payment_notes;
      await processPurchase(paymentNotes, data.payment.cf_payment_id);
    }
    return res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).send("Internal Server Error");
  }
});

// FIX: Cast the Express app to 'any' to resolve the type mismatch with Firebase's onRequest handler.
export const api = functions.https.onRequest(app as any);

export const createCashfreeOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
  
  const { amount, planType, planDetails } = data;
  const userId = context.auth.uid;
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();

  if (!userData) throw new functions.https.HttpsError("not-found", "User not found.");

  const orderRequest = {
    order_id: `SAKOON_ORDER_${Date.now()}`,
    order_amount: amount,
    order_currency: "INR",
    customer_details: {
      customer_id: userId,
      customer_name: userData.name || "Sakoon User",
      customer_email: userData.email || "user@example.com",
      customer_phone: userData.mobile || "9999999999",
    },
    order_meta: {
      payment_notes: { userId, planType, planDetails: JSON.stringify(planDetails) },
    },
    // FIX: Add order expiry for v3 compatibility
    order_expiry_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };

  try {
    // FIX: Updated the API call to use 'cashfree.orders.create' which is the correct
    // method for the 'cashfree-pg' SDK, and accessed the session ID directly from the response.
    const response = await cashfree.orders.create(orderRequest);
    return { success: true, paymentSessionId: response.payment_session_id };
  } catch (error: any) {
    console.error("Cashfree order creation failed:", error.response?.data || error.message);
    throw new functions.https.HttpsError("internal", "Failed to create payment order.");
  }
});

export const generateZegoToken = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Authentication required.");

    const appID = parseInt(functions.config().zego.appid, 10);
    const serverSecret = functions.config().zego.secret;
    const userId = firebaseUIDtoZegoUID(context.auth.uid);
    const effectiveTimeInSeconds = 3600;
    const payload = "";

    const token = RtcTokenBuilder.buildTokenWithUid(appID, serverSecret, data.planId, userId, 0, effectiveTimeInSeconds, payload);
    return { token };
});

export const finalizeCallSession = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
    }
    const { consumedSeconds, associatedPlanId, isTokenSession, listenerName } = data;
    const userId = context.auth.uid;
    const userRef = db.collection("users").doc(userId);

    try {
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw new functions.https.HttpsError("not-found", "User not found.");
            }
            const userData = userDoc.data()!;
            const activePlans = (userData.activePlans || []).filter((p: any) => p.expiryTimestamp > Date.now());
            let deduction = "";
            let balanceAfter = "";

            if (!isTokenSession) {
                const planIndex = activePlans.findIndex((p: any) => p.id === associatedPlanId);
                if (planIndex !== -1 && activePlans[planIndex].type === "call") {
                    const plan = activePlans[planIndex];
                    const consumedMinutes = Math.ceil(consumedSeconds / 60);
                    plan.minutes = (plan.minutes || 0) - consumedMinutes;
                    if (plan.minutes < 0) plan.minutes = 0;
                    activePlans[planIndex] = plan;
                    
                    transaction.update(userRef, { activePlans });
                    deduction = `DT Plan Used (${consumedMinutes} min)`;
                    balanceAfter = `${plan.minutes} Min Left`;
                } else {
                    const consumedMinutes = Math.ceil(consumedSeconds / 60);
                    const tokenCost = consumedMinutes * 2;
                    if ((userData.tokens || 0) < tokenCost) {
                         throw new functions.https.HttpsError("failed-precondition", "Insufficient balance.");
                    }
                    transaction.update(userRef, { tokens: admin.firestore.FieldValue.increment(-tokenCost) });
                    deduction = `${tokenCost} MT (${consumedMinutes} min)`;
                    balanceAfter = `${(userData.tokens || 0) - tokenCost} MT`;
                }
            } else {
                 const consumedMinutes = Math.ceil(consumedSeconds / 60);
                 const tokenCost = consumedMinutes * 2;
                 if ((userData.tokens || 0) < tokenCost) {
                    throw new functions.https.HttpsError("failed-precondition", "Insufficient balance.");
                 }
                 transaction.update(userRef, { tokens: admin.firestore.FieldValue.increment(-tokenCost) });
                 deduction = `${tokenCost} MT (${consumedMinutes} min)`;
                 balanceAfter = `${(userData.tokens || 0) - tokenCost} MT`;
            }

            const usageHistoryRef = userRef.collection("usageHistory").doc();
            transaction.set(usageHistoryRef, {
                timestamp: Date.now(),
                type: "Call",
                consumed: consumedSeconds,
                deduction: deduction,
                balanceAfter: balanceAfter,
                listenerName: listenerName,
            });
        });
        return { success: true };
    } catch (error) {
        console.error("Error finalizing call session:", error);
        throw new functions.https.HttpsError("internal", "Failed to finalize call session.", error);
    }
});


export const deductUsage = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  
  const { type, messages, associatedPlanId, listenerName } = data;
  const userRef = db.collection("users").doc(context.auth.uid);

  let planIdToReturn = associatedPlanId;
  
  try {
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) throw new functions.https.HttpsError("not-found", "User not found.");
        
        const userData = userDoc.data()!;
        const activePlans = (userData.activePlans || []).filter((p: any) => p.expiryTimestamp > Date.now());
        const dtPlanIndex = activePlans.findIndex((p: any) => p.id === associatedPlanId && p.type === type);
        
        let deduction = "";
        let balanceAfter = "";

        if (dtPlanIndex !== -1) {
            const plan = activePlans[dtPlanIndex];
            plan.messages = (plan.messages || 0) - messages;
            if (plan.messages < 0) plan.messages = 0;
            activePlans[dtPlanIndex] = plan;
            
            transaction.update(userRef, { activePlans });
            deduction = "DT Plan Used";
            balanceAfter = `${plan.messages} Msgs Left`;
        } else {
            const tokenCost = messages * 0.5;
            if ((userData.tokens || 0) < tokenCost) {
                throw new functions.https.HttpsError("failed-precondition", "Insufficient balance.");
            }
            transaction.update(userRef, { tokens: admin.firestore.FieldValue.increment(-tokenCost) });
            deduction = `${tokenCost} MT`;
            balanceAfter = `${(userData.tokens || 0) - tokenCost} MT`;
            planIdToReturn = `mt_session_${Date.now()}`;
        }
        
        const usageHistoryRef = userRef.collection("usageHistory").doc();
        transaction.set(usageHistoryRef, {
            timestamp: Date.now(),
            type: "Chat",
            consumed: messages,
            deduction: deduction,
            balanceAfter: balanceAfter,
            listenerName: listenerName,
        });
      });
      return { success: true, planId: planIdToReturn };
  } catch (error) {
      console.error("Error deducting usage:", error);
      throw error;
  }
});

export const useFreeMessage = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
    const userRef = db.collection("users").doc(context.auth.uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) throw new functions.https.HttpsError("not-found", "User not found.");
    
    const freeMessages = userDoc.data()?.freeMessagesRemaining || 0;
    if (freeMessages <= 0) throw new functions.https.HttpsError("failed-precondition", "No free messages remaining.");

    await userRef.update({ freeMessagesRemaining: admin.firestore.FieldValue.increment(-1) });
    return { success: true, remaining: freeMessages - 1 };
});

export const addEarning = functions.https.onCall(async (data, context) => {
    // This can be expanded later with actual earning calculations.
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
    console.log("Recording earning:", data);
    return { success: true };
});
