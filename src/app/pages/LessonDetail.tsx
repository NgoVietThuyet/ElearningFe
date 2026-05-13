import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Download, FileText, Loader2, Video } from "lucide-react";
import { studentApi } from "../api/studentApi";

interface LessonDetailData {
  id: number;
  courseId: number;
  courseTitle: string;
  title: string;
  description: string;
  videoUrl?: string | null;
  pdfUrl?: string | null;
}

interface Resource {
  id: string;
  type: "video" | "pdf";
  name: string;
  url: string;
}

export default function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonDetailData | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
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
            type: "video" as const,
            name: `${lesson.title} - Video`,
            url: lesson.videoUrl,
          }
        : null,
      lesson.pdfUrl
        ? {
            id: "pdf",
            type: "pdf" as const,
            name: `${lesson.title} - Tài liệu PDF`,
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
          <h1 className="text-2xl font-black text-[#101828]">Không tìm thấy bài học</h1>
          <button onClick={() => navigate(-1)} className="mt-5 rounded-lg bg-orange-600 px-5 py-2 text-sm font-bold text-white">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Quay lại
          </button>
          <p className="mb-2 text-xs font-black uppercase tracking-widest text-orange-600">{lesson.courseTitle}</p>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">{lesson.title}</h1>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-gray-600">{lesson.description}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {selectedResource ? (
                <div>
                  <div className="border-b border-gray-200 bg-orange-50 p-4">
                    <h3 className="font-semibold text-gray-900">{selectedResource.name}</h3>
                  </div>
                  <div className="aspect-video bg-gray-100">
                    {selectedResource.type === "video" ? (
                      <iframe
                        src={selectedResource.url}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="text-center">
                          <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                          <p className="text-gray-600">Tài liệu PDF</p>
                          <a
                            href={selectedResource.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-lg bg-orange-600 px-6 py-2 text-white hover:bg-orange-700"
                          >
                            <Download className="h-4 w-4" />
                            Mở tài liệu
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
                      <FileText className="h-10 w-10 text-orange-600" />
                    </div>
                    <p className="text-gray-600">Bài học này chưa có video hoặc PDF.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-xl font-black text-gray-900">Tài liệu học tập</h2>
              </div>
              <div className="space-y-2 p-4">
                {resources.length > 0 ? (
                  resources.map((resource) => (
                    <button
                      key={resource.id}
                      onClick={() => setSelectedResource(resource)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-4 transition-all ${
                        selectedResource?.id === resource.id
                          ? "border-orange-300 bg-orange-50"
                          : "border-gray-200 hover:border-orange-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${resource.type === "video" ? "bg-red-100" : "bg-blue-100"}`}>
                        {resource.type === "video" ? <Video className="h-5 w-5 text-red-600" /> : <FileText className="h-5 w-5 text-blue-600" />}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-gray-900">{resource.name}</p>
                        <p className="text-xs text-gray-500">{resource.type === "video" ? "Video" : "PDF"}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="py-6 text-center text-sm font-medium text-gray-400">Chưa có tài liệu.</p>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-6">
              <h3 className="mb-3 font-black text-gray-900">Hoàn thành bài học</h3>
              <p className="mb-4 text-sm text-gray-600">Sau khi học xong, quay lại dashboard để tiếp tục bài học tiếp theo.</p>
              <button onClick={() => navigate("/student")} className="w-full rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700">
                Về dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
