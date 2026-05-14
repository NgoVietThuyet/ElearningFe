import apiClient from "./apiClient";

const toUserFormData = (data: any) => {
  const formData = new FormData();

  formData.append("fullName", data.fullName ?? "");
  if (data.email) formData.append("email", data.email);
  if (data.password) formData.append("password", data.password);
  formData.append("role", String(data.role));
  if (data.dateOfBirth) formData.append("dateOfBirth", data.dateOfBirth);
  if (data.gender) formData.append("gender", data.gender);
  if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);
  if (data.address) formData.append("address", data.address);
  if (Number.isFinite(Number(data.teachingExperienceYears))) formData.append("teachingExperienceYears", String(Math.max(0, Number(data.teachingExperienceYears))));
  if (data.shortBio) formData.append("shortBio", data.shortBio);
  formData.append("isActive", String(data.isActive ?? true));
  if (Number.isFinite(Number(data.assignedCourseId)) && Number(data.assignedCourseId) > 0) formData.append("assignedCourseId", String(Number(data.assignedCourseId)));
  if (data.avatarUrl) formData.append("avatarUrl", data.avatarUrl);
  if (data.avatarFile instanceof File) formData.append("avatarFile", data.avatarFile);

  return formData;
};

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

const normalizeCoursePayload = (data: any) => ({
  title: String(data.title ?? "").trim(),
  description: String(data.description ?? "").trim(),
  avatarUrl: data.avatarUrl ? String(data.avatarUrl).trim() : null,
  code: String(data.code ?? "").trim().toUpperCase(),
  introVideoUrl: data.introVideoUrl ? String(data.introVideoUrl).trim() : null,
  teacherId: typeof data.teacherId === "number" && data.teacherId > 0 ? data.teacherId : null,
  status: String(data.status ?? "Published").trim() || "Published",
  language: String(data.language ?? "Tiếng Việt").trim() || "Tiếng Việt",
  durationMinutes: Number.isFinite(Number(data.durationMinutes)) ? Math.max(0, Number(data.durationMinutes)) : 0,
  expectedStudentCount: Number.isFinite(Number(data.expectedStudentCount)) ? Math.max(0, Number(data.expectedStudentCount)) : 0,
  startDate: data.startDate ? String(data.startDate) : null,
  endDate: data.endDate ? String(data.endDate) : null,
  learningOutcomes: String(data.learningOutcomes ?? "").trim(),
});

export const adminApi = {
  // Stats
  getOverviewStats: () => apiClient.get("/api/admin/stats/overview"),
  getGpaDistribution: () => apiClient.get("/api/admin/stats/gpa-distribution"),
  getRecentActivity: () => apiClient.get("/api/admin/stats/recent-activity"),

  // Users
  getAllUsers: () => apiClient.get("/api/admin/users/get_all"),
  getUserById: (id: number) => apiClient.get(`/api/admin/users/get_by_id/${id}`),
  createUser: (data: any) => apiClient.post("/api/admin/users/create", toUserFormData(data), {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  updateUser: (id: number, data: any) => apiClient.put(`/api/admin/users/update/${id}`, toUserFormData(data), {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  deleteUser: (id: number) => apiClient.delete(`/api/admin/users/delete/${id}`),

  // News
  getAllNews: () => apiClient.get("/api/admin/news/get_all"),
  getNewsById: (id: number) => apiClient.get(`/api/admin/news/get_by_id/${id}`),
  createNews: (data: { title: string; content: string; avatarUrl?: string | null }) => apiClient.post("/api/admin/news/create", data),
  updateNews: (id: number, data: { title: string; content: string; avatarUrl?: string | null }) => apiClient.put(`/api/admin/news/update/${id}`, data),
  deleteNews: (id: number) => apiClient.delete(`/api/admin/news/delete/${id}`),

  // Courses
  getAllCourses: () => apiClient.get("/api/admin/courses/get_all"),
  getCourseById: (id: number) => apiClient.get(`/api/admin/courses/get_by_id/${id}`),
  createCourse: (data: {
    title: string;
    description: string;
    avatarUrl?: string | null;
    code?: string;
    introVideoUrl?: string | null;
    teacherId?: number | null;
    status?: string;
    language?: string;
    durationMinutes?: number;
    expectedStudentCount?: number;
    startDate?: string | null;
    endDate?: string | null;
    learningOutcomes?: string;
  }) => apiClient.post("/api/admin/courses/create", normalizeCoursePayload(data)),
  updateCourse: (id: number, data: {
    title: string;
    description: string;
    avatarUrl?: string | null;
    code?: string;
    introVideoUrl?: string | null;
    teacherId?: number | null;
    status?: string;
    language?: string;
    durationMinutes?: number;
    expectedStudentCount?: number;
    startDate?: string | null;
    endDate?: string | null;
    learningOutcomes?: string;
  }) => apiClient.put(`/api/admin/courses/update/${id}`, normalizeCoursePayload(data)),
  deleteCourse: (id: number) => apiClient.delete(`/api/admin/courses/delete/${id}`),

  // Lessons
  getLessonsByCourse: (courseId: number) => apiClient.get(`/api/admin/lessons/get_by_course/${courseId}`),
  getLessonById: (id: number) => apiClient.get(`/api/admin/lessons/get_by_id/${id}`),
  createLesson: (data: any) => apiClient.post("/api/admin/lessons/create", toLessonFormData(data), {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  updateLesson: (id: number, data: any) => apiClient.put(`/api/admin/lessons/update/${id}`, toLessonFormData(data), {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  deleteLesson: (id: number) => apiClient.delete(`/api/admin/lessons/delete/${id}`),

  getCourseMaterials: (courseId: number) => apiClient.get(`/api/admin/courses/${courseId}/materials`),
  createCourseMaterial: (data: { courseId: number; title: string; fileUrl: string; fileType: string; mimeType?: string; description?: string }) =>
    apiClient.post("/api/admin/course-materials/create", data),
  updateCourseMaterial: (id: number, data: { courseId: number; title: string; fileUrl: string; fileType: string; mimeType?: string; description?: string }) =>
    apiClient.put(`/api/admin/course-materials/update/${id}`, data),
  deleteCourseMaterial: (id: number) => apiClient.delete(`/api/admin/course-materials/delete/${id}`),

  getCourseLearningItems: (courseId: number) => apiClient.get(`/api/admin/courses/${courseId}/learning-items`),
  createLearningItem: (data: { courseId: number; lessonId: number; title: string; type: "flashcard" | "quiz" | "exam"; content: string }) =>
    apiClient.post("/api/admin/learning-items/create", data),
  updateLearningItem: (id: number, data: { courseId: number; lessonId: number; title: string; type: "flashcard" | "quiz" | "exam"; content: string }) =>
    apiClient.put(`/api/admin/learning-items/update/${id}`, data),
  deleteLearningItem: (id: number) => apiClient.delete(`/api/admin/learning-items/delete/${id}`),

  // Feedback (backend currently supports list/filter/create; no update/delete endpoints)
  getAllFeedbacks: (params?: { courseId?: number | string; teacherId?: number | string; rating?: number | string; keyword?: string; limit?: number | string }) =>
    apiClient.get("/api/feedback", { params }),
  getFeedbackFilters: () => apiClient.get("/api/feedback/filters"),
  createFeedback: (data: { courseId: number; teacherId?: number | null; rating: number; content: string }) =>
    apiClient.post("/api/feedback", data),
};
