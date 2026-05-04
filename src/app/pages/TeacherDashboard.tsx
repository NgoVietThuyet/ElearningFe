import { Users, FileText, CheckCircle, TrendingUp } from "lucide-react";
import { Link } from "react-router";

export default function TeacherDashboard() {
  const stats = [
    { label: "Học sinh", value: "156", icon: Users, color: "orange" },
    { label: "Bài giảng", value: "24", icon: FileText, color: "orange" },
    { label: "Tỷ lệ hoàn thành", value: "85%", icon: CheckCircle, color: "orange" },
    { label: "Đánh giá TB", value: "4.8", icon: TrendingUp, color: "orange" },
  ];

  const lessons = [
    { id: 1, title: "Cấu trúc tế bào", students: 45, progress: 90 },
    { id: 2, title: "Phân bào nguyên phân", students: 38, progress: 75 },
    { id: 3, title: "DNA và RNA", students: 42, progress: 60 },
    { id: 4, title: "Protein synthesis", students: 35, progress: 45 },
  ];

  const students = [
    { id: 1, name: "Nguyễn Văn A", progress: 92, status: "Xuất sắc" },
    { id: 2, name: "Trần Thị B", progress: 78, status: "Khá" },
    { id: 3, name: "Lê Văn C", progress: 85, status: "Giỏi" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Giáo Viên</h1>
          <p className="text-gray-600 mt-2">Quản lý lớp học và bài giảng</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Lessons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Bài giảng của tôi</h2>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
                  Tạo bài mới
                </button>
              </div>
              <div className="p-6 space-y-4">
                {lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                      <span className="text-sm text-gray-600">{lesson.students} học sinh</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: `${lesson.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{lesson.progress}% hoàn thành</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Students Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Tiến độ học sinh</h2>
              </div>
              <div className="p-6 space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-4 px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                      {student.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quản lý</h3>
              <nav className="space-y-2">
                <Link
                  to="/teacher"
                  className="block px-4 py-2 bg-orange-50 text-orange-700 rounded-lg"
                >
                  Tổng quan
                </Link>
                <Link
                  to="/teacher"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Quản lý bài giảng
                </Link>
                <Link
                  to="/teacher"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Quản lý học sinh
                </Link>
                <Link
                  to="/teacher"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Thống kê lớp học
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
