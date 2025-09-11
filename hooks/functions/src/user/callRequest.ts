import * as functions from "firebase-functions/v1";
import {ZEGO_APP_ID, ZEGO_SERVER_SECRET} from "../config";
import * as crypto from "crypto";

// Firebase UID (string) → Zego-compatible UID
const firebaseUIDtoZegoUID = (uid: string): number => {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = ((hash << 5) - hash) + uid.charCodeAt(i);
    hash |= 0;
  }
  return (hash >>> 0) || 1;
};

// Token generate
export const generateZegoToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Authentication required");
  if (!data.planId) throw new functions.https.HttpsError("invalid-argument", "'planId' required");

  const userId = firebaseUIDtoZegoUID(context.auth.uid);

  const payload = {
    app_id: ZEGO_APP_ID,
    user_id: userId,
    ctime: Math.floor(Date.now() / 1000),
    expire: 3600, // 1 hour
    nonce: Math.floor(Math.random() * 1000000),
  };

  const signature = crypto
    .createHmac("sha256", ZEGO_SERVER_SECRET)
    .update(JSON.stringify(payload))
    .digest("hex");

  const token = Buffer.from(JSON.stringify({...payload, sig: signature})).toString("base64");

  return {token};
});
