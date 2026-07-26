import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ??
    "http://127.0.0.1:8000/api",
  timeout: 30000,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export interface UploadResponse {
  message: string;
}

export interface Document {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export async function uploadDocument(
  file: File
): Promise<UploadResponse> {
  const formData = new FormData();

  formData.append("file", file);

  const { data } = await API.post<UploadResponse>(
    "/upload/file",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}

export async function getDocuments(): Promise<Document[]> {
  const { data } = await API.get("/documents");

  return data.documents ?? data;
}

export async function getDocument(
  id: number
): Promise<Document> {
  const { data } = await API.get(
    `/documents/${id}`
  );

  return data;
}

export async function deleteDocument(
  id: number
) {
  const { data } = await API.delete(
    `/documents/${id}`
  );

  return data;
}

export async function renameDocument(
  id: number,
  filename: string
) {
  const { data } = await API.put(
    `/documents/${id}`,
    {
      filename,
    }
  );

  return data;
}

export async function downloadDocument(
  id: number
) {
  const { data } = await API.get(
    `/documents/${id}/download`,
    {
      responseType: "blob",
    }
  );

  return data;
}

export default API;