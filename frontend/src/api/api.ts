import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  "http://127.0.0.1:8000/api";

const AUTH_TOKEN_KEY = "access_token";
const USER_KEY = "user";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      localStorage.getItem(AUTH_TOKEN_KEY);

    if (token) {
      const headers =
        config.headers instanceof AxiosHeaders
          ? config.headers
          : new AxiosHeaders(config.headers);

      headers.set(
        "Authorization",
        `Bearer ${token}`
      );

      config.headers = headers;
    }

    return config;
  }
);

api.interceptors.response.use(
  (response) => response,

  (error: AxiosError) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const status =
      error.response?.status;

    if (status === 401) {
      localStorage.removeItem(
        AUTH_TOKEN_KEY
      );
      localStorage.removeItem(
        USER_KEY
      );

      const isAuthPage =
        ["/login", "/register"].includes(
          window.location.pathname
        );

      if (!isAuthPage) {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export const apiGet = api.get.bind(api);
export const apiPost = api.post.bind(api);
export const apiPut = api.put.bind(api);
export const apiPatch = api.patch.bind(api);
export const apiDelete = api.delete.bind(api);

export default api;