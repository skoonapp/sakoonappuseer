import * as functions from "firebase-functions/v1";
import {db} from "../config";

// --- यूज़र की प्रोफाइल जानकारी अपडेट करें ---
// यह फंक्शन सुनिश्चित करता है कि यूज़र केवल अपनी जानकारी ही बदल सकता है।
export const updateMyProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "प्रमाणीकरण आवश्यक है।");
  }

  const {name, city} = data;
  const userRef = db.collection("users").doc(context.auth.uid);

  await userRef.update({
    name: name,
    city: city,
    hasSeenWelcome: true, // सुनिश्चित करें कि स्वागत स्क्रीन दोबारा न दिखे
  });

  return {success: true};
});
