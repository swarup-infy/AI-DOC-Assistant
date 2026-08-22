import api from "../api/api";

export type ChatMode =
  | "document"
  | "groq"
  | "smart";

export interface ChatRequest {
  question: string;
  mode: ChatMode;
  document_id?: number | null;
}

export interface Source {
  document_id: number;
  filename: string;
  page: number | null;
  similarity: number | null;
}

export interface ChatResponse {
  status: string;
  message?: string;
  question?: string;
  answer: string;
  mode?: ChatMode;
  sources: Source[];
  retrieved_chunks?: string[];
  response_time?: number;
  tokens_used?: number;
}

export interface ChatHistory {
  id: number;
  question: string;
  answer: string;
  mode: ChatMode;
  created_at: string;
}

export async function askAI(
  question: string,
  mode: ChatMode,
  documentId?: number | null
): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>(
    "/chat/",
    {
      question,
      mode,
      document_id: documentId ?? null,
    } satisfies ChatRequest
  );

  return data;
}

export async function regenerateAnswer(
  question: string,
  mode: ChatMode,
  documentId?: number | null
): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>(
    "/chat/regenerate",
    {
      question,
      mode,
      document_id: documentId ?? null,
    } satisfies ChatRequest
  );

  return data;
}

export async function summarizeDocument(
  documentId: number
) {
  const { data } = await api.post(
    `/chat/summarize/${documentId}`
  );

  return data;
}

export async function getChatHistory(): Promise<
  ChatHistory[]
> {
  const { data } = await api.get(
    "/chat/history"
  );

  return data;
}

export async function deleteChatHistory(
  id: number
) {
  const { data } = await api.delete(
    `/chat/history/${id}`
  );

  return data;
}

export async function clearChatHistory() {
  const { data } = await api.delete(
    "/chat/history"
  );

  return data;
}
