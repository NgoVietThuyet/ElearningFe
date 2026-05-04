import { useParams, useNavigate } from "react-router";
import { ArrowLeft, FileText, Video, Download } from "lucide-react";
import { useState } from "react";

export default function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  // Mock lesson data
  const lesson = {
    id: id,
    title: "DNA và RNA",
    description:
      "Tìm hiểu về cấu trúc và chức năng của DNA và RNA, hai phân tử quan trọng trong việc lưu trữ và truyền đạt thông tin di truyền.",
    resources: [
      {
        id: 1,
        type: "pdf",
        name: "DNA_RNA_Theory.pdf",
        url: "#",
      },
      {
        id: 2,
        type: "video",
        name: "DNA Replication Process",
        url: "https://www.youtube.com/embed/TNKWgcFPHqw",
      },
      {
        id: 3,
        type: "pdf",
        name: "RNA_Types_and_Functions.pdf",
        url: "#",
      },
    ],
  };

  const handleResourceClick = (resource: any) => {
    setSelectedResource(resource);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
          <p className="text-gray-600 mt-2">{lesson.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {selectedResource ? (
                <div>
                  <div className="p-4 border-b border-gray-200 bg-orange-50">
                    <h3 className="font-semibold text-gray-900">
                      {selectedResource.name}
                    </h3>
                  </div>
                  <div className="aspect-video bg-gray-100">
                    {selectedResource.type === "video" ? (
                      <iframe
                        src={selectedResource.url}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">PDF Viewer</p>
                          <p className="text-sm text-gray-500 mt-2">
                            {selectedResource.name}
                          </p>
                          <button className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 mx-auto">
                            <Download className="w-4 h-4" />
                            Tải xuống
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                      <FileText className="w-10 h-10 text-orange-600" />
                    </div>
                    <p className="text-gray-600">
                      Chọn một tài liệu để bắt đầu học
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Resources */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Tài liệu học tập</h2>
              </div>
              <div className="p-4 space-y-2">
                {lesson.resources.map((resource) => (
                  <button
                    key={resource.id}
                    onClick={() => handleResourceClick(resource)}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all ${
                      selectedResource?.id === resource.id
                        ? "border-orange-300 bg-orange-50"
                        : "border-gray-200 hover:border-orange-200 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        resource.type === "video"
                          ? "bg-red-100"
                          : "bg-blue-100"
                      }`}
                    >
                      {resource.type === "video" ? (
                        <Video className="w-5 h-5 text-red-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 text-sm">
                        {resource.name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {resource.type === "video" ? "Video" : "PDF"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-6 mt-6 border border-orange-200">
              <h3 className="font-semibold text-gray-900 mb-3">Hoàn thành bài học</h3>
              <p className="text-sm text-gray-600 mb-4">
                Đã xem hết tất cả tài liệu? Đánh dấu bài học là hoàn thành!
              </p>
              <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                Hoàn thành bài học
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
