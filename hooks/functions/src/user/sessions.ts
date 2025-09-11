import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import {db} from "../config";
import {CALL_COST_MT_PER_MINUTE, CHAT_COST_MT_PER_MESSAGE} from "./constants";

// --- कॉल सेशन को अंतिम रूप देना (उपयोग में कटौती) ---
export const finalizeCallSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "प्रमाणीकरण आवश्यक है।");

  const {consumedSeconds, associatedPlanId, isTokenSession, listenerName} = data;
  const userRef = db.collection("users").doc(context.auth.uid);

  await db.runTransaction(async (t) => {
    const userDoc = await t.get(userRef);
    if (!userDoc.exists) throw new functions.https.HttpsError("not-found", "User नहीं मिला।");

    const userData = userDoc.data()!;
    const activePlans = (userData.activePlans || []).filter((p: any) => p.expiryTimestamp > Date.now());
    const consumedMinutes = Math.ceil(consumedSeconds / 60);
    let deduction = ""; let balanceAfter = "";

    const planIndex = activePlans.findIndex((p: any) => p.id === associatedPlanId && p.type === "call");

    if (!isTokenSession && planIndex !== -1) {
      const plan = activePlans[planIndex];
      plan.minutes = (plan.minutes || 0) - consumedMinutes;
      if (plan.minutes < 0) plan.minutes = 0;
      t.update(userRef, {activePlans});
      deduction = `DT Plan (${consumedMinutes} मिनट)`;
      balanceAfter = `${plan.minutes} मिनट बचे`;
    } else {
      const tokenCost = consumedMinutes * CALL_COST_MT_PER_MINUTE;
      if ((userData.tokens || 0) < tokenCost) throw new functions.https.HttpsError("failed-precondition", "अपर्याप्त टोकन।");
      t.update(userRef, {tokens: admin.firestore.FieldValue.increment(-tokenCost)});
      deduction = `${tokenCost} MT (${consumedMinutes} मिनट)`;
      balanceAfter = `${(userData.tokens || 0) - tokenCost} MT`;
    }

    const usageRef = userRef.collection("usageHistory").doc();
    t.set(usageRef, {timestamp: Date.now(), type: "Call", consumed: consumedSeconds, deduction, balanceAfter, listenerName});
  });
  return {success: true};
});

// --- चैट सेशन को अंतिम रूप देना (उपयोग में कटौती) ---
export const finalizeChatSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "प्रमाणीकरण आवश्यक है।");

  const {consumedMessages, listenerName} = data; // consumedMessages > 0
  if (consumedMessages <= 0) return {success: true};

  const userRef = db.collection("users").doc(context.auth.uid);
  await db.runTransaction(async (t) => {
    const userDoc = await t.get(userRef);
    if (!userDoc.exists) throw new functions.https.HttpsError("not-found", "User नहीं मिला।");

    const userData = userDoc.data()!;
    const activePlans = (userData.activePlans || []).filter((p: any) => p.expiryTimestamp > Date.now());
    let deduction = ""; let balanceAfter = "";

    // सबसे पहले चैट के लिए DT प्लान खोजें
    const chatPlanIndex = activePlans.findIndex((p: any) => p.type === "chat" && (p.messages || 0) > 0);
    if (chatPlanIndex !== -1) {
      const plan = activePlans[chatPlanIndex];
      plan.messages = (plan.messages || 0) - consumedMessages;
      if (plan.messages < 0) plan.messages = 0;
      t.update(userRef, {activePlans});
      deduction = `DT Plan (${consumedMessages} संदेश)`;
      balanceAfter = `${plan.messages} संदेश बचे`;
    } else {
      const tokenCost = consumedMessages * CHAT_COST_MT_PER_MESSAGE;
      if ((userData.tokens || 0) < tokenCost) throw new functions.https.HttpsError("failed-precondition", "अपर्याप्त टोकन।");
      t.update(userRef, {tokens: admin.firestore.FieldValue.increment(-tokenCost)});
      deduction = `${tokenCost} MT (${consumedMessages} संदेश)`;
      balanceAfter = `${(userData.tokens || 0) - tokenCost} MT`;
    }

    const usageRef = userRef.collection("usageHistory").doc();
    t.set(usageRef, {timestamp: Date.now(), type: "Chat", consumed: consumedMessages, deduction, balanceAfter, listenerName});
  });
  return {success: true};
});
