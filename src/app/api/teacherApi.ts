import type { AxiosRequestConfig } from "axios";
import apiClient from "./apiClient";

const toLessonFormData = (data: any) => {
  const formData = new FormData();
  formData.append("courseId", String(Number(data.courseId)));
  formData.append("title", data.title ?? "");
  formData.append("description", data.description ?? "");
  formData.append("videoUrl", data.videoUrl ?? "");
  formData.append("pdfUrl", data.pdfUrl ?? "");
  if (data.arVrUrl) formData.append("arVrUrl", data.arVrUrl);
  if (data.quizUrl) formData.append("quizUrl", data.quizUrl);
  if (data.documentUrl) formData.append("documentUrl", data.documentUrl);
  if (data.documentName) formData.append("documentName", data.documentName);
  if (data.pdfFile instanceof File) formData.append("pdfFile", data.pdfFile);
  if (data.documentFile instanceof File) formData.append("documentFile", data.documentFile);
  if (data.lessonPlanFile instanceof File) formData.append("lessonPlanFile", data.lessonPlanFile);
  if (data.slideFile instanceof File) formData.append("slideFile", data.slideFile);
  return formData;
};

export const teacherApi = {
  getStats: (config?: AxiosRequestConfig) => apiClient.get("/api/teacher/stats/overview", config),
  getCourses: (config?: AxiosRequestConfig) => apiClient.get("/api/teacher/courses", config),
  getStudents: (config?: AxiosRequestConfig) => apiClient.get("/api/teacher/students", config),
  getLessons: (config?: AxiosRequestConfig) => apiClient.get("/api/teacher/lessons", config),
  getLearningItems: (lessonId: number, config?: AxiosRequestConfig) => apiClient.get(`/api/teacher/lessons/${lessonId}/learning-items`, config),
  getFeedbacks: (config?: AxiosRequestConfig) => apiClient.get("/api/teacher/feedbacks", config),
  createLesson: (data: any) => apiClient.post("/api/teacher/lessons", toLessonFormData(data), {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  updateLesson: (lessonId: number, data: any) => apiClient.put(`/api/teacher/lessons/${lessonId}`, toLessonFormData(data), {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  deleteLesson: (lessonId: number) => apiClient.delete(`/api/teacher/lessons/${lessonId}`),
  createLearningItem: (lessonId: number, data: { title: string; content: string }) =>
    apiClient.post(`/api/teacher/lessons/${lessonId}/learning-items`, data),
  updateLearningItem: (testId: number, data: { title: string; content: string }) =>
    apiClient.put(`/api/teacher/learning-items/${testId}`, data),
  deleteLearningItem: (testId: number) =>
    apiClient.delete(`/api/teacher/learning-items/${testId}`),
  parseQuizPdf: (lessonId: number | string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`/api/teacher/lessons/${lessonId}/parse-quiz-pdf`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getAllStudents: (config?: AxiosRequestConfig) => apiClient.get("/api/teacher/all-students", config),
  enrollStudent: (courseId: number | string, email: string) => apiClient.post(`/api/teacher/courses/${courseId}/enroll`, { email }),
  addStudent: (email: string) => apiClient.post("/api/teacher/students/add", { email }),
  getQuizReport: (lessonId: number | string, config?: AxiosRequestConfig) => apiClient.get(`/api/teacher/lessons/${lessonId}/quiz-report`, config),
};
