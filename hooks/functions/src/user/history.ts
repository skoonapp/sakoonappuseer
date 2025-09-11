import * as functions from "firebase-functions/v1";
import {db} from "../config";

// --- रीचार्ज हिस्ट्री प्राप्त करें ---
export const getRechargeHistory = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "प्रमाणीकरण आवश्यक है।");

  const snapshot = await db.collection("users").doc(context.auth.uid)
    .collection("rechargeHistory").orderBy("timestamp", "desc").limit(50).get();

  return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
});

// --- उपयोग हिस्ट्री प्राप्त करें ---
export const getUsageHistory = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "प्रमाणीकरण आवश्यक है।");

  const snapshot = await db.collection("users").doc(context.auth.uid)
    .collection("usageHistory").orderBy("timestamp", "desc").limit(50).get();

  return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
});
