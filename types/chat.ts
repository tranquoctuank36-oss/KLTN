export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory: ChatMessage[];
}

export interface ChatResponse {
  success: boolean;
  message: string;
  data: {
    reply: string;
    conversationHistory: ChatMessage[];
  };
  meta?: any;
}
