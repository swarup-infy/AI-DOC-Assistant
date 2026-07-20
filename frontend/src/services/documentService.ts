import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function uploadDocument(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await API.post(
    "/upload/file",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

export async function getDocuments() {
  const response = await API.get("/documents");

  return response.data;
}

export async function deleteDocument(id: number) {
  const response = await API.delete(
    `/documents/${id}`
  );

  return response.data;
}