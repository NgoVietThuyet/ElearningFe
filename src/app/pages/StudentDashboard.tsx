import { BookOpen, CheckCircle, Lock, Play } from "lucide-react";
import { Link } from "react-router";

export default function StudentDashboard() {
  const courses = [
    {
      id: 1,
      title: "Sinh học tế bào",
      progress: 75,
      totalLessons: 12,
      completedLessons: 9,
    },
    {
      id: 2,
      title: "Di truyền học",
      progress: 40,
      totalLessons: 15,
      completedLessons: 6,
    },
    {
      id: 3,
      title: "Vi sinh vật",
      progress: 0,
      totalLessons: 10,
      completedLessons: 0,
    },
  ];

  const lessons = [
    {
      id: 1,
      title: "Cấu trúc tế bào",
      duration: "45 phút",
      status: "completed",
      courseId: 1,
    },
    {
      id: 2,
      title: "Phân bào nguyên phân",
      duration: "60 phút",
      status: "completed",
      courseId: 1,
    },
    {
      id: 3,
      title: "DNA và RNA",
      duration: "50 phút",
      status: "current",
      courseId: 1,
    },
    {
      id: 4,
      title: "Protein synthesis",
      duration: "55 phút",
      status: "locked",
      courseId: 1,
    },
    {
      id: 5,
      title: "Mendel's Laws",
      duration: "40 phút",
      status: "completed",
      courseId: 2,
    },
    {
      id: 6,
      title: "Chromosomes",
      duration: "45 phút",
      status: "current",
      courseId: 2,
    },
  ];

  const overallProgress = Math.round(
    (courses.reduce((acc, course) => acc + course.progress, 0) / courses.length)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Học Sinh</h1>
          <p className="text-gray-600 mt-2">Theo dõi tiến độ học tập của bạn</p>
        </div>

        {/* Overall Progress */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-8 mb-8 text-white">
          <h2 className="text-2xl font-semibold mb-4">Tiến độ học tập tổng thể</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-white/20 rounded-full h-4">
                <div
                  className="bg-white h-4 rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>
            <span className="text-3xl font-bold">{overallProgress}%</span>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Khóa học của tôi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{course.title}</h3>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Tiến độ</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {course.completedLessons}/{course.totalLessons} bài học hoàn thành
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Lessons List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">Danh sách bài học</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    lesson.status === "locked"
                      ? "border-gray-200 bg-gray-50"
                      : "border-gray-200 hover:border-orange-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        lesson.status === "completed"
                          ? "bg-green-100"
                          : lesson.status === "current"
                          ? "bg-orange-100"
                          : "bg-gray-100"
                      }`}
                    >
                      {lesson.status === "completed" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : lesson.status === "current" ? (
                        <Play className="w-5 h-5 text-orange-600" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3
                        className={`font-medium ${
                          lesson.status === "locked" ? "text-gray-400" : "text-gray-900"
                        }`}
                      >
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-gray-500">{lesson.duration}</p>
                    </div>
                  </div>
                  {lesson.status !== "locked" && (
                    <Link
                      to={`/lesson/${lesson.id}`}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        lesson.status === "completed"
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-orange-600 text-white hover:bg-orange-700"
                      }`}
                    >
                      {lesson.status === "completed" ? "Xem lại" : "Học ngay"}
                    </Link>
                  )}
                  {lesson.status === "locked" && (
                    <span className="px-4 py-2 text-sm text-gray-400">Chưa mở khóa</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
