import apiClient from "./apiClient";

export const adminApi = {
  // Stats
  getOverviewStats: () => apiClient.get("/api/admin/stats/overview"),
  getGpaDistribution: () => apiClient.get("/api/admin/stats/gpa-distribution"),
  getRecentActivity: () => apiClient.get("/api/admin/stats/recent-activity"),

  // Users
  getAllUsers: () => apiClient.get("/api/admin/users/get_all"),
  getUserById: (id: number) => apiClient.get(`/api/admin/users/get_by_id/${id}`),
  createUser: (data: any) => apiClient.post("/api/admin/users/create", data),
  updateUser: (id: number, data: any) => apiClient.put(`/api/admin/users/update/${id}`, data),
  deleteUser: (id: number) => apiClient.delete(`/api/admin/users/delete/${id}`),

  // News
  getAllNews: () => apiClient.get("/api/admin/news/get_all"),
  getNewsById: (id: number) => apiClient.get(`/api/admin/news/get_by_id/${id}`),
  createNews: (data: { title: string; content: string }) => apiClient.post("/api/admin/news/create", data),
  updateNews: (id: number, data: { title: string; content: string }) => apiClient.put(`/api/admin/news/update/${id}`, data),
  deleteNews: (id: number) => apiClient.delete(`/api/admin/news/delete/${id}`),

  // Courses
  getAllCourses: () => apiClient.get("/api/admin/courses/get_all"),
  getCourseById: (id: number) => apiClient.get(`/api/admin/courses/get_by_id/${id}`),
  createCourse: (data: { title: string; description: string }) => apiClient.post("/api/admin/courses/create", data),
  updateCourse: (id: number, data: { title: string; description: string }) => apiClient.put(`/api/admin/courses/update/${id}`, data),
  deleteCourse: (id: number) => apiClient.delete(`/api/admin/courses/delete/${id}`),

  // Lessons
  getLessonsByCourse: (courseId: number) => apiClient.get(`/api/admin/lessons/get_by_course/${courseId}`),
  getLessonById: (id: number) => apiClient.get(`/api/admin/lessons/get_by_id/${id}`),
  createLesson: (data: { courseId: number; title: string; description: string; videoUrl: string; pdfUrl: string }) => apiClient.post("/api/admin/lessons/create", data),
  updateLesson: (id: number, data: { courseId: number; title: string; description: string; videoUrl: string; pdfUrl: string }) => apiClient.put(`/api/admin/lessons/update/${id}`, data),
  deleteLesson: (id: number) => apiClient.delete(`/api/admin/lessons/delete/${id}`),
};
