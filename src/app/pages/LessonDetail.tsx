import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ExternalLink,
  FileText,
  FileType2,
  Loader2,
  Video,
} from "lucide-react";
import { API_BASE_URL } from "../api/apiClient";
import { studentApi } from "../api/studentApi";

function toEmbedUrl(url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return url;
}

function toAbsoluteUrl(url: string) {
  if (!url || url.startsWith("http://") || url.startsWith("https://"))
    return url;
  return `${API_BASE_URL}${url}`;
}

function getProgressKey(lessonId: number | string) {
  return `edusmart.lessonProgress.${lessonId}`;
}

function readCompletedResources(lessonId: number | string) {
  try {
    const raw = localStorage.getItem(getProgressKey(lessonId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? new Set<string>(parsed) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

interface LessonDetailData {
  id: number;
  courseId: number;
  courseTitle: string;
  title: string;
  description: string;
  videoUrl?: string | null;
  quizUrl?: string | null;
  arVrUrl?: string | null;
  pdfUrl?: string | null;
  documentUrl?: string | null;
  documentName?: string | null;
  slideUrl?: string | null;
  slideFileName?: string | null;
  lessonPlanUrl?: string | null;
  lessonPlanFileName?: string | null;
  tests?: Array<{
    id: number;
    title: string;
    questions?: any[];
    durationMinutes?: number;
    endTime?: string;
  }>;
  exercises?: Array<{
    id: number;
    title: string;
    questions?: any[];
  }>;
}

interface Resource {
  id: string;
  type: "video" | "pdf" | "doc" | "slide" | "lessonplan" | "arvr";
  name: string;
  url: string;
  fileName?: string | null;
}

export default function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonDetailData | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );
  const [completedResources, setCompletedResources] = useState<Set<string>>(
    () => (id ? readCompletedResources(id) : new Set<string>()),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchLesson = async () => {
      try {
        const res = await studentApi.getLessonDetail(id);
        setLesson(res.data);
      } catch (err) {
        console.error("Failed to load lesson detail", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  const resources = useMemo<Resource[]>(() => {
    if (!lesson) return [];

    return [
      lesson.videoUrl
        ? {
            id: "video",
            type: "video",
            name: `${lesson.title} - Video`,
            url: lesson.videoUrl,
          }
        : null,
      lesson.arVrUrl
        ? {
            id: "arvr",
            type: "arvr",
            name: `${lesson.title} - AR/VR`,
            url: lesson.arVrUrl,
          }
        : null,
      lesson.slideUrl
        ? {
            id: "slide",
            type: "slide",
            name: lesson.slideFileName || `${lesson.title} - Slide`,
            url: `${lesson.slideUrl}?format=pdf`,
            fileName: lesson.slideFileName,
          }
        : null,
      lesson.lessonPlanUrl
        ? {
            id: "lessonplan",
            type: "lessonplan",
            name: lesson.lessonPlanFileName || `${lesson.title} - Giao an`,
            url: `${lesson.lessonPlanUrl}?format=pdf`,
            fileName: lesson.lessonPlanFileName,
          }
        : null,
      lesson.documentUrl
        ? {
            id: "doc",
            type: "doc",
            name: lesson.documentName || `${lesson.title} - Bai tap`,
            url: `${lesson.documentUrl}?format=pdf`,
            fileName: lesson.documentName,
          }
        : null,
      lesson.pdfUrl
        ? {
            id: "pdf",
            type: "pdf",
            name: `${lesson.title} - Tai lieu PDF`,
            url: lesson.pdfUrl,
          }
        : null,
    ].filter(Boolean) as Resource[];
  }, [lesson]);

  useEffect(() => {
    if (!selectedResource && resources.length > 0) {
      setSelectedResource(resources[0]);
    }
  }, [resources, selectedResource]);

  useEffect(() => {
    if (id) setCompletedResources(readCompletedResources(id));
  }, [id]);

  const lessonProgress =
    resources.length > 0
      ? Math.round((completedResources.size / resources.length) * 100)
      : 0;

  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    if (!id || !lesson) return;
    if (isSynced) return;
    if (resources.length === 0) {
      studentApi.completeLesson(id)
        .then(() => { setIsSynced(true); console.log("completeLesson OK (no resources)"); })
        .catch(err => console.error("completeLesson failed:", err));
      return;
    }
    if (lessonProgress >= 100) {
      studentApi.completeLesson(id)
        .then(() => { setIsSynced(true); console.log("completeLesson OK"); })
        .catch(err => console.error("completeLesson failed:", err));
    }
  }, [lessonProgress, id, resources.length, lesson, isSynced]);

  const selectResource = (resource: Resource) => {
    setSelectedResource(resource);
    if (!id) return;

    setCompletedResources((current) => {
      if (current.has(resource.id)) return current;
      const next = new Set(current);
      next.add(resource.id);
      localStorage.setItem(
        getProgressKey(id),
        JSON.stringify(Array.from(next)),
      );
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 text-center">
        <div>
          <FileText className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <h1 className="text-2xl font-black text-[#101828]">
            Khong tim thay bai hoc
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="mt-5 rounded-lg bg-orange-600 px-5 py-2 text-sm font-bold text-white"
          >
            Quay lai
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 pt-2 pb-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-widest text-orange-600">
            {lesson.courseTitle}
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-gray-900">
            {lesson.title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm font-medium leading-5 text-gray-600">
            {lesson.description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              {selectedResource ? (
                <div className="relative">
                  {selectedResource.type === "arvr" && (
                    <a
                      href={toAbsoluteUrl(selectedResource.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-orange-600 shadow-sm ring-1 ring-gray-200 hover:bg-orange-50"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Mở AR/VR
                    </a>
                  )}
                  <div className="h-[calc(100vh-130px)] bg-gray-100">
                    {selectedResource.type === "video" ? (
                      <iframe
                        key={selectedResource.id}
                        src={toEmbedUrl(selectedResource.url)}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <iframe
                        key={selectedResource.id}
                        src={toAbsoluteUrl(selectedResource.url)}
                        className="h-full w-full"
                        title={selectedResource.name}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex h-[calc(100vh-130px)] items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
                      <FileText className="h-10 w-10 text-orange-600" />
                    </div>
                    <p className="text-gray-600">
                      Bai hoc nay chua co hoc lieu.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-black text-gray-900">
                    Tài liệu học tập
                  </h2>
                  <span className="text-xs font-black text-orange-600">
                    {lessonProgress}%
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-orange-500 transition-all"
                    style={{ width: `${lessonProgress}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1.5 p-3">
                {resources.length > 0 ? (
                  resources.map((resource) => (
                    <button
                      key={resource.id}
                      onClick={() => selectResource(resource)}
                      className={`flex w-full items-center gap-2.5 rounded-lg border p-2.5 transition-all ${
                        selectedResource?.id === resource.id
                          ? "border-orange-300 bg-orange-50"
                          : "border-gray-200 hover:border-orange-200 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          resource.type === "video"
                            ? "bg-red-100"
                            : resource.type === "pdf"
                              ? "bg-blue-100"
                              : resource.type === "slide"
                                ? "bg-purple-100"
                                : resource.type === "lessonplan"
                                  ? "bg-teal-100"
                                  : resource.type === "arvr"
                                    ? "bg-violet-100"
                                    : "bg-amber-100"
                        }`}
                      >
                        {resource.type === "video" ? (
                          <Video className="h-4 w-4 text-red-600" />
                        ) : resource.type === "pdf" ? (
                          <FileText className="h-4 w-4 text-blue-600" />
                        ) : resource.type === "slide" ? (
                          <FileType2 className="h-4 w-4 text-purple-600" />
                        ) : resource.type === "lessonplan" ? (
                          <FileText className="h-4 w-4 text-teal-600" />
                        ) : resource.type === "arvr" ? (
                          <ExternalLink className="h-4 w-4 text-violet-600" />
                        ) : (
                          <FileType2 className="h-4 w-4 text-amber-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-sm font-bold text-gray-900">
                          {resource.name}
                        </p>
                        <p className="text-[10px] font-semibold text-gray-500">
                          {resource.type === "video"
                            ? "Video"
                            : resource.type === "pdf"
                              ? "PDF"
                              : resource.type === "slide"
                                ? "Slide"
                                : resource.type === "lessonplan"
                                  ? "Giáo án"
                                  : resource.type === "arvr"
                                    ? "AR/VR"
                                    : "Bài tập"}
                        </p>
                      </div>
                      {completedResources.has(resource.id) && (
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  ))
                ) : (
                  <p className="py-6 text-center text-sm font-medium text-gray-400">
                    Chua co tai lieu.
                  </p>
                )}
              </div>
            </div>

            {!isSynced && lessonProgress >= 100 && (
              <button
                onClick={() => {
                  if (!id) return;
                  studentApi.completeLesson(id)
                    .then(() => { setIsSynced(true); console.log("manual completeLesson OK"); })
                    .catch(err => console.error("manual completeLesson failed:", err));
                }}
                className="w-full rounded-xl border-2 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
              >
                Xác nhận hoàn thành bài giảng
              </button>
            )}
            {isSynced && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Đã hoàn thành khóa học
              </div>
            )}

            {lesson.tests && lesson.tests.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 bg-orange-50/50 px-4 py-3">
                  <h2 className="text-xs font-black text-gray-900 uppercase tracking-wider text-[#FF5A1F]">
                    Bài kiểm tra trực tuyến
                  </h2>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Làm bài trắc nghiệm tính giờ trực tiếp
                  </p>
                </div>
                <div className="space-y-1.5 p-3">
                  {lesson.tests.map((test) => (
                    <button
                      key={test.id}
                      onClick={() =>
                        window.open(
                          `/take-quiz/${lesson.id}/${test.id}`,
                          "_blank",
                        )
                      }
                      className="flex w-full items-center gap-2.5 rounded-lg border border-gray-200 p-2.5 transition-all hover:border-orange-300 hover:bg-orange-50/15 group/test"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#FF5A1F] group-hover:bg-orange-100 transition-colors">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-sm font-bold text-gray-900 group-hover/test:text-orange-600 transition-colors">
                          {test.title}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {test.questions?.length || 0} câu hỏi
                          {test.durationMinutes
                            ? ` • ${test.durationMinutes} phút`
                            : ""}
                          {test.endTime
                            ? ` • Hạn: ${new Date(test.endTime).toLocaleDateString("vi-VN")}`
                            : ""}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {lesson.exercises && lesson.exercises.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 bg-emerald-50/50 px-4 py-3">
                  <h2 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Bài tập
                  </h2>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Làm bài tập để củng cố kiến thức
                  </p>
                </div>
                <div className="space-y-1.5 p-3">
                  {lesson.exercises.map((exercise) => (
                    <button
                      key={exercise.id}
                      onClick={() =>
                        window.open(
                          `/take-quiz/${lesson.id}/${exercise.id}`,
                          "_blank",
                        )
                      }
                      className="flex w-full items-center gap-2.5 rounded-lg border border-gray-200 p-2.5 transition-all hover:border-emerald-300 hover:bg-emerald-50/15 group/exercise"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover/exercise:bg-emerald-100 transition-colors">
                        <FileType2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-sm font-bold text-gray-900 group-hover/exercise:text-emerald-600 transition-colors">
                          {exercise.title}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {exercise.questions?.length || 0} câu hỏi • Bài tập
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
