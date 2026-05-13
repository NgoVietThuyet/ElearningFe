import apiClient from "./apiClient";

export const studentApi = {
  getStats: () => apiClient.get("/api/student/stats/overview"),
  getCourses: () => apiClient.get("/api/student/courses"),
  getLessons: () => apiClient.get("/api/student/lessons"),
  getLessonDetail: (lessonId: string | number) => apiClient.get(`/api/student/lessons/${lessonId}`),
};
