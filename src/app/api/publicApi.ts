import axios from "axios";
import { installApiCache } from "./apiCache";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5081";

const publicClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

installApiCache(publicClient);

publicClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const publicApi = {
  getCourses: () => publicClient.get("/api/public/courses"),
  getCourseById: (id: string | number) => publicClient.get(`/api/public/courses/${id}`),

  getNews: (limit: number = 100) => publicClient.get(`/api/public/news?limit=${limit}`),
  getNewsById: (id: string | number) => publicClient.get(`/api/public/news/${id}`),

  getStats: () => publicClient.get("/api/public/stats"),
  getFeaturedTeachers: () => publicClient.get("/api/public/featured-teachers"),
  getTeachers: () => publicClient.get("/api/public/teachers"),

  getFeedbacks: (limit: number = 100) => publicClient.get(`/api/feedback?limit=${limit}`),
  createFeedback: (data: {
    courseId: number;
    teacherId?: number | null;
    rating: number;
    content: string;
  }) => publicClient.post("/api/feedback", data),
};
