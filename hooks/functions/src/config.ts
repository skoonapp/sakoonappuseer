import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { Cashfree } from "cashfree-pg";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export Firestore database instance
export const db = admin.firestore();

// Configure and export Cashfree SDK instance
// FIX: Using older SDK syntax as provided by user. Ensure config variables are set in Firebase.
export const cashfree = new (Cashfree as any)({
    appId: functions.config().cashfree.client_id,
    secretKey: functions.config().cashfree.client_secret,
    env: functions.config().cashfree.env === "PROD" ? "PROD" : "TEST",
});


// Export secrets from Firebase config
export const CASHFREE_WEBHOOK_SECRET = functions.config().cashfree.webhook_secret;
export const ZEGO_APP_ID = parseInt(functions.config().zego.appid, 10);
export const ZEGO_SERVER_SECRET = functions.config().zego.secret;
