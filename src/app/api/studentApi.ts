import type { AxiosRequestConfig } from "axios";
import apiClient from "./apiClient";

export const studentApi = {
  getStats: (config?: AxiosRequestConfig) => apiClient.get("/api/student/stats/overview", config),
  getCourses: (config?: AxiosRequestConfig) => apiClient.get("/api/student/courses", config),
  getLessons: (config?: AxiosRequestConfig) => apiClient.get("/api/student/lessons", config),
  getLessonDetail: (lessonId: string | number, config?: AxiosRequestConfig) => apiClient.get(`/api/student/lessons/${lessonId}`, config),
  submitTest: (testId: string | number, answers: number[]) => apiClient.post(`/api/student/tests/${testId}/submit`, { answers }),
  completeLesson: (lessonId: string | number) => apiClient.post(`/api/student/lessons/${lessonId}/complete`),
  requestEnroll: (courseId: number | string) => apiClient.post(`/api/student/courses/${courseId}/request-enroll`),
  getEnrollmentStatus: (courseId: number | string) => apiClient.get(`/api/student/courses/${courseId}/enrollment-status`),
};
