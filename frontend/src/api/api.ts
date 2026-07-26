import axios, {
  AxiosError,
  AxiosHeaders,
} from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ??
    "http://127.0.0.1:8000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }

      if (config.headers instanceof AxiosHeaders) {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const status = error.response?.status;

    switch (status) {
      case 401:
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        break;

      case 403:
        console.error("Access denied.");
        break;

      case 404:
        console.error("Resource not found.");
        break;

      case 500:
        console.error("Internal server error.");
        break;

      default:
        break;
    }

    return Promise.reject(error);
  }
);

export default api;