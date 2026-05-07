import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://elearningbe-nq9w.onrender.com";

// Public API client — no JWT token needed, used for public-facing pages
const publicClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const publicApi = {
  // Get all published courses (visible to everyone)
  getCourses: () => publicClient.get("/api/public/courses"),
  getCourseById: (id: string | number) => publicClient.get(`/api/public/courses/${id}`),

  // Get all news articles
  getNews: (limit: number = 100) => publicClient.get(`/api/public/news?limit=${limit}`),
  getNewsById: (id: string | number) => publicClient.get(`/api/public/news/${id}`),

  // Get homepage stats (total users, courses, lessons)
  getStats: () => publicClient.get("/api/public/stats"),
};
