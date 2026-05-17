// Chat API layer — currently mock, swap with real backend later.
// Replace `sendChatMessage` and `fetchInitialMessages` with real HTTP/WS calls.

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string; // ISO
}

export interface SendMessagePayload {
  message: string;
  history: ChatMessage[];
}

export interface SendMessageResponse {
  reply: ChatMessage;
}

const ASSISTANT_NAME = "Rahhal AI";

const newId = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

const nowIso = () => new Date().toISOString();

export const createMessage = (role: ChatRole, content: string): ChatMessage => ({
  id: newId(),
  role,
  content,
  createdAt: nowIso(),
});

export const getInitialMessages = (): ChatMessage[] => [
  createMessage(
    "assistant",
    `Hi traveler! I'm ${ASSISTANT_NAME} ✈️ — your AI travel companion. Ask me anything: destinations, itineraries, budgets, or local tips.`
  ),
];

export const suggestedPrompts = [
  "Plan a 5-day trip to Japan",
  "Best beaches in the Mediterranean",
  "Budget tips for solo travelers",
  "Hidden gems in Cairo",
];

// --- Mock responses — replace with real backend call ---
const mockReplies = [
  "Great question! Here are a few ideas based on what travelers usually love:\n\n• Visit during shoulder season for better prices\n• Mix popular spots with one off-the-beaten-path day\n• Always reserve top restaurants 2–3 weeks ahead",
  "I'd recommend splitting your trip into 3 phases: arrival & culture, adventure, and relaxation. Want me to draft a sample itinerary?",
  "Based on similar trips on Rahhal, travelers usually budget around $80–$150/day excluding flights. Want a detailed breakdown?",
  "Sounds exciting! A few must-try experiences:\n\n1. Local food tour on day 1\n2. Sunrise viewpoint hike\n3. Evening market walk\n\nWant me to turn this into a full plan?",
];

const pickReply = (userText: string) => {
  const idx = Math.abs(userText.length) % mockReplies.length;
  return mockReplies[idx];
};

/**
 * Send a message to the chatbot.
 * TODO(backend): Replace with `fetch('/api/chat', { method: 'POST', body: ... })`
 */
export const sendChatMessage = async (
  payload: SendMessagePayload
): Promise<SendMessageResponse> => {
  // Simulate network latency
  await new Promise((res) => setTimeout(res, 700 + Math.random() * 600));
  return {
    reply: createMessage("assistant", pickReply(payload.message)),
  };
};
