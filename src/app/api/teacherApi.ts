import apiClient from "./apiClient";

const toLessonFormData = (data: any) => {
  const formData = new FormData();
  formData.append("courseId", String(Number(data.courseId)));
  formData.append("title", data.title ?? "");
  formData.append("description", data.description ?? "");
  formData.append("videoUrl", data.videoUrl ?? "");
  formData.append("pdfUrl", data.pdfUrl ?? "");
  if (data.arVrUrl) formData.append("arVrUrl", data.arVrUrl);
  if (data.documentUrl) formData.append("documentUrl", data.documentUrl);
  if (data.documentName) formData.append("documentName", data.documentName);
  if (data.pdfFile instanceof File) formData.append("pdfFile", data.pdfFile);
  if (data.documentFile instanceof File) formData.append("documentFile", data.documentFile);
  if (data.lessonPlanFile instanceof File) formData.append("lessonPlanFile", data.lessonPlanFile);
  if (data.slideFile instanceof File) formData.append("slideFile", data.slideFile);
  return formData;
};

export const teacherApi = {
  getStats: () => apiClient.get("/api/teacher/stats/overview"),
  getCourses: () => apiClient.get("/api/teacher/courses"),
  getStudents: () => apiClient.get("/api/teacher/students"),
  getLessons: () => apiClient.get("/api/teacher/lessons"),
  getLearningItems: (lessonId: number) => apiClient.get(`/api/teacher/lessons/${lessonId}/learning-items`),
  getFeedbacks: () => apiClient.get("/api/teacher/feedbacks"),
  createLesson: (data: any) => apiClient.post("/api/teacher/lessons", toLessonFormData(data), {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  updateLesson: (lessonId: number, data: any) => apiClient.put(`/api/teacher/lessons/${lessonId}`, toLessonFormData(data), {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  createLearningItem: (lessonId: number, data: { title: string; content: string }) =>
    apiClient.post(`/api/teacher/lessons/${lessonId}/learning-items`, data),
  enrollStudent: (courseId: number | string, email: string) => apiClient.post(`/api/teacher/courses/${courseId}/enroll`, JSON.stringify(email), {
    headers: { "Content-Type": "application/json" }
  }),
  addStudent: (email: string) => apiClient.post("/api/teacher/students/add", JSON.stringify(email), {
    headers: { "Content-Type": "application/json" }
  }),
};
