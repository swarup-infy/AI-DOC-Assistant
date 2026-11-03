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
  user_id: number;
  document_id: number | null;
  question: string;
  answer: string;
  mode: ChatMode;
  created_at: string;
  updated_at: string;
}

export interface ChatHistoryListResponse {
  status: "success";
  total: number;
  history: ChatHistory[];
}

export interface ClearChatHistoryResponse {
  status: "success";
  message: string;
  deleted_records: number;
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

export async function getChatHistory(
  limit = 100,
  documentId?: number | null
): Promise<ChatHistory[]> {
  const { data } = await api.get<ChatHistoryListResponse>("/history/", {
    params: {
      limit,
      ...(documentId ? { document_id: documentId } : {}),
    },
  });

  return data.history;
}

export async function deleteChatHistory(
  id: number
): Promise<ClearChatHistoryResponse> {
  const { data } = await api.delete<ClearChatHistoryResponse>(
    `/history/${id}`
  );

  return data;
}

export async function clearChatHistory(): Promise<ClearChatHistoryResponse> {
  const { data } = await api.delete<ClearChatHistoryResponse>("/history/");

  return data;
}
