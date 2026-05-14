import apiClient from "./apiClient";

const toLessonFormData = (data: any) => {
  const formData = new FormData();
  formData.append("courseId", String(Number(data.courseId)));
  formData.append("title", data.title ?? "");
  formData.append("description", data.description ?? "");
  formData.append("videoUrl", data.videoUrl ?? "");
  formData.append("pdfUrl", data.pdfUrl ?? "");
  if (data.documentUrl) formData.append("documentUrl", data.documentUrl);
  if (data.documentName) formData.append("documentName", data.documentName);
  if (data.pdfFile instanceof File) formData.append("pdfFile", data.pdfFile);
  if (data.documentFile instanceof File) formData.append("documentFile", data.documentFile);
  return formData;
};

export const teacherApi = {
  getStats: () => apiClient.get("/api/teacher/stats/overview"),
  getStudents: () => apiClient.get("/api/teacher/students"),
  getLessons: () => apiClient.get("/api/teacher/lessons"),
  getFeedbacks: () => apiClient.get("/api/teacher/feedbacks"),
  createLesson: (data: any) => apiClient.post("/api/teacher/lessons", toLessonFormData(data), {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  updateLesson: (lessonId: number, data: any) => apiClient.put(`/api/teacher/lessons/${lessonId}`, toLessonFormData(data), {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  addStudent: (email: string) => apiClient.post("/api/teacher/students/add", JSON.stringify(email), {
    headers: { "Content-Type": "application/json" }
  }),
};
