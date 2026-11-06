import api from "../api/api";

export interface Document {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  updated_at?: string;
}

export interface UploadResponse {
  status: "success";
  message: string;
  document: Document;
  chunks: number;
}

export async function uploadDocument(
  file: File
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<UploadResponse>(
    "/upload/file",
    formData,
    {
      // Let the browser set the multipart boundary automatically.
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return data;
}

function normalizeDocuments(value: unknown): Document[] {
  if ( Array.isArray(value) ) {
    return value as Document[];
  }

  if (
    value &&
    typeof value === "object" &&
    "documents" in value
  ) {
    const documents = (value as { documents?: unknown }).documents;
    return Array.isArray(documents) ? (documents as Document[]) : [];
  }

  return [];
}

export async function getDocuments(): Promise<Document[]> {
  const { data } = await api.get<unknown>("/documents");
  return normalizeDocuments(data);
}

export async function getDocument(id: number): Promise<Document> {
  const { data } = await api.get<Document>(`/documents/${id}`);
  return data;
}

export async function deleteDocument(id: number) {
  const { data } = await api.delete(`/documents/${id}`);
  return data;
}

export async function renameDocument(id: number, filename: string) {
  const { data } = await api.put(`/documents/${id}`, { filename });
  return data;
}

export async function downloadDocument(id: number) {
  const { data } = await api.get(`/documents/${id}/download`, {
    responseType: "blob",
  });
  return data;
}

export default api;
