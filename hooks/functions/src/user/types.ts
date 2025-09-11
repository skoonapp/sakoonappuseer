// Backend में इस्तेमाल होने वाले डेटा का स्ट्रक्चर

// DT प्लान का विवरण
export interface PlanDetails {
  type: "call" | "chat";
  name: string;
  price: number;
  minutes?: number;
  messages?: number;
}

// MT प्लान का विवरण
export interface TokenPlanDetails {
  tokens: number;
  price: number;
}

// यह जानकारी Cashfree को भेजी जाएगी ताकि पेमेंट कन्फर्म होने पर पता चल सके कि किसने और क्या खरीदा है।
export interface PaymentNotes {
  userId: string;
  planType: "mt" | "dt";
  planDetails: string; // यह एक stringified JSON होगा
}
