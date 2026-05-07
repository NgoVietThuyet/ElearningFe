import apiClient from "./apiClient";

export const teacherApi = {
  getStats: () => apiClient.get("/api/teacher/stats/overview"),
  getStudents: () => apiClient.get("/api/teacher/students"),
  getLessons: () => apiClient.get("/api/teacher/lessons"),
  getFeedbacks: () => apiClient.get("/api/teacher/feedbacks"),
  addStudent: (email: string) => apiClient.post("/api/teacher/students/add", JSON.stringify(email), {
    headers: { "Content-Type": "application/json" }
  }),
};
