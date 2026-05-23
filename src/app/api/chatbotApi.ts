import apiClient from "./apiClient";

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export interface ChatResponse {
  reply: string;
  role: "model";
}

export const chatbotApi = {
  chat: (message: string, history: ChatMessage[], imageBase64?: string, imageMimeType?: string) => {
    return apiClient.post<ChatResponse>("/api/chatbot/chat", {
      message,
      history,
      imageBase64,
      imageMimeType,
    });
  },
};
