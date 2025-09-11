import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import {db} from "../config";

// --- एक मुफ्त संदेश का उपयोग करें ---
export const useFreeMessage = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "प्रमाणीकरण आवश्यक है।");
  const userRef = db.collection("users").doc(context.auth.uid);

  return db.runTransaction(async (t) => {
    const userDoc = await t.get(userRef);
    if (!userDoc.exists) throw new functions.https.HttpsError("not-found", "User नहीं मिला।");

    const freeMessages = userDoc.data()?.freeMessagesRemaining || 0;
    if (freeMessages <= 0) throw new functions.https.HttpsError("failed-precondition", "कोई मुफ्त संदेश नहीं बचा है।");

    t.update(userRef, {freeMessagesRemaining: admin.firestore.FieldValue.increment(-1)});
    return {success: true, remaining: freeMessages - 1};
  });
});
