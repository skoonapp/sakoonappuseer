// ===================================================================================
// USER-SIDE FUNCTIONS (एंड-यूज़र के लिए)
// ===================================================================================

// Payment Functions (user/payment.ts से)
// यूज़र द्वारा पेमेंट शुरू करने के लिए और Webhook को संभालने के लिए।
import {createCashfreeOrder, webhookHandler} from "./user/payment";
export {createCashfreeOrder};
// Webhook को 'api' नाम से एक्सपोर्ट करना एक आम तरीका है
export const api = webhookHandler;

// Session Functions (user/sessions.ts से)
// कॉल और चैट खत्म होने पर मिनट/मैसेज काटने के लिए। यह सुरक्षा के लिए बहुत महत्वपूर्ण है।
import {finalizeCallSession, finalizeChatSession} from "./user/sessions";
export {finalizeCallSession, finalizeChatSession};

// Call Request Functions (user/callRequest.ts से)
import {generateZegoToken} from "./user/callRequest";
export {generateZegoToken};

// Chat Request Functions (user/chatRequest.ts से)
// यूज़र द्वारा मुफ्त संदेश का उपयोग करने के लिए।
import {useFreeMessage} from "./user/chatRequest";
export {useFreeMessage};

// History Functions (user/history.ts से)
// यूज़र को उसकी अपनी रीचार्ज और उपयोग की हिस्ट्री दिखाने के लिए।
import {getRechargeHistory, getUsageHistory} from "./user/history";
export {getRechargeHistory, getUsageHistory};

// User Functions (user/users.ts से)
// यूज़र को अपनी प्रोफाइल (जैसे नाम, शहर) अपडेट करने की अनुमति देने के लिए।
import {updateMyProfile} from "./user/users";
export {updateMyProfile};
