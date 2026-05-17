import axios from "axios";
import { installApiCache } from "./apiCache";

const apiClient = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5081",
  baseURL: "https://elearning-be-8pwa.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

installApiCache(apiClient);

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
