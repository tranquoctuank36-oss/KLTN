import api from "./api";
import { ChatRequest, ChatResponse } from "@/types/chat";

export const chatService = {
  /**
   * Gửi tin nhắn và nhận phản hồi từ AI chatbot
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      console.log("[ChatService] Sending request:", request);
      const response = await api.post<ChatResponse>(
        "/chatbot/chat",
        request
      );
      console.log("[ChatService] Response received:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[ChatService] Error:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      throw error;
    }
  },
};
