import api from "../api/api";

export type ChatMode = "document" | "gemini" | "smart";

export interface ChatRequest {
  question: string;
  mode: ChatMode;
}

export interface Source {
  document_name: string;
  page: number;
}

export interface ChatResponse {
  status: string;
  question: string;
  answer: string;
  retrieved_chunks?: string[];
  sources?: Source[];
}

export async function askAI(
  question: string,
  mode: ChatMode
): Promise<ChatResponse> {
  const response = await api.post("/chat/", {
    question,
    mode,
  });

  return response.data;
}