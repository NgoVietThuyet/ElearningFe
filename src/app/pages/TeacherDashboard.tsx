import { useState } from "react";
import { 
  Users, 
  FileText, 
  CheckCircle, 
  TrendingUp, 
  LayoutDashboard, 
  UserPlus, 
  BookOpen, 
  ChevronRight,
  Search,
  Plus,
  GraduationCap,
  Edit,
  Trash2,
  Home as HomeIcon,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import HomeView from "../components/HomeView";

type TeacherSection = "home" | "dashboard" | "students" | "lessons" | "lessonDetail" | "feedback";

export default function TeacherDashboard() {
  const [activeSection, setActiveSection] = useState<TeacherSection>("home");
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  // Mock Data
  const stats = [
    { label: "Học sinh của tôi", value: "156", icon: Users, color: "orange" },
    { label: "Bài giảng đã đăng", value: "24", icon: FileText, color: "blue" },
    { label: "Tỷ lệ hoàn thành", value: "85%", icon: CheckCircle, color: "green" },
    { label: "Đánh giá trung bình", value: "4.8", icon: TrendingUp, color: "purple" },
  ];

  const lessons = [
    { id: 1, title: "Cấu trúc tế bào", students: 45, progress: 90, date: "2024-05-01" },
    { id: 2, title: "Phân bào nguyên phân", students: 38, progress: 75, date: "2024-04-25" },
    { id: 3, title: "DNA và RNA", students: 42, progress: 60, date: "2024-04-20" },
  ];

  const students = [
    { id: 1, name: "Nguyễn Văn A", progress: 92, status: "Xuất sắc", email: "student1@test.com" },
    { id: 2, name: "Trần Thị B", progress: 78, status: "Khá", email: "student2@test.com" },
    { id: 3, name: "Lê Văn C", progress: 85, status: "Giỏi", email: "student3@test.com" },
  ];

  const feedbacks = [
    { id: 1, student: "Nguyễn Văn A", course: "Cấu trúc tế bào", content: "Bài giảng rất chi tiết, hình ảnh đẹp.", date: "2024-05-01" },
    { id: 2, student: "Lê Văn C", course: "DNA và RNA", content: "Em rất thích phần thí nghiệm ảo của thầy.", date: "2024-04-29" },
  ];

  const renderLessonDetail = (lesson: any) => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => setActiveSection("lessons")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">{lesson.title}</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Nội dung chi tiết</h3>
              <button className="text-sm bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">Chỉnh sửa</button>
            </div>
            <div className="prose prose-orange max-w-none text-gray-600">
              <p>Đây là nội dung chi tiết của bài giảng <strong>{lesson.title}</strong>. Nội dung này được thiết kế để cung cấp kiến thức chuyên sâu về chủ đề này.</p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>Phần 1: Khái niệm cơ bản</li>
                <li>Phần 2: Ứng dụng thực tế</li>
                <li>Phần 3: Bài tập củng cố</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Thống kê bài học</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Số học sinh học:</span>
                <span className="text-sm font-bold text-gray-900">{lesson.students}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Hoàn thành:</span>
                <span className="text-sm font-bold text-orange-600">{lesson.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${lesson.progress}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-50 text-orange-600">
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Student Form */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Thêm học sinh vào lớp</h2>
          </div>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Đã thêm học sinh vào danh sách quản lý!"); }}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tên học sinh</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Nhập tên học sinh..." required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email học sinh</label>
              <input type="email" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="student@test.com" required />
            </div>
            <button type="submit" className="w-full bg-orange-600 text-white py-2.5 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm shadow-orange-200">
              Thêm học sinh
            </button>
          </form>
        </div>

        {/* Lessons Summary */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Bài giảng mới nhất</h2>
            <button onClick={() => setActiveSection("lessons")} className="text-sm text-orange-600 font-medium">Xem tất cả</button>
          </div>
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="p-4 rounded-xl border border-gray-100 hover:border-orange-200 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{lesson.title}</h3>
                  <span className="text-xs text-gray-500">{lesson.date}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{lesson.students} học sinh tham gia</span>
                  <span>{lesson.progress}% hoàn thành</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">Danh sách học sinh</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm học sinh..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none w-full md:w-64 text-sm"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Học sinh</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Tiến độ</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Đánh giá</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xs font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-32 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${student.progress}%` }}></div>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 block">{student.progress}%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase">
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button className="text-orange-600 hover:text-orange-700 font-medium">Chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderLessons = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Bài giảng của tôi</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Tạo bài giảng mới
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all cursor-pointer" onClick={() => { setSelectedLesson(lesson); setActiveSection("lessonDetail"); }}>
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 cursor-pointer hover:text-orange-600 transition-colors" onClick={() => { setSelectedLesson(lesson); setActiveSection("lessonDetail"); }}>{lesson.title}</h3>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>{lesson.students} học sinh</span>
              <span>{lesson.date}</span>
            </div>
            <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
              <button className="text-gray-400 hover:text-orange-600 transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => { setSelectedLesson(lesson); setActiveSection("lessonDetail"); }} className="text-sm font-bold text-orange-600 hover:text-orange-700">Chi tiết bài học</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Phản hồi từ học sinh</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {feedbacks.map((item) => (
            <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold shrink-0">
                  {item.student.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900">{item.student}</h4>
                    <span className="text-xs text-gray-500">{item.date}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">"{item.content}"</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase">Khóa học: {item.course}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const menuItems = [
    { id: "home", label: "Trang chủ", icon: HomeIcon },
    { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { id: "students", label: "Học sinh", icon: GraduationCap },
    { id: "lessons", label: "Bài giảng", icon: FileText },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col sticky top-16 h-[calc(100vh-4rem)]">
        <div className="p-6 overflow-y-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Giáo viên</p>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => {
                    setActiveSection(item.id as TeacherSection);
                    if (item.id !== "lessons") setSelectedLesson(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    (activeSection === item.id || (item.id === "lessons" && activeSection === "lessonDetail"))
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-200" 
                      : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
                
                {/* Sub-menu for lessons */}
                {item.id === "lessons" && (activeSection === "lessons" || activeSection === "lessonDetail") && (
                  <div className="mt-2 ml-4 space-y-1 animate-in slide-in-from-top-2 duration-300">
                    {lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          setSelectedLesson(lesson);
                          setActiveSection("lessonDetail");
                        }}
                        className={`w-full text-left px-4 py-2 text-xs rounded-lg transition-colors ${
                          selectedLesson?.id === lesson.id && activeSection === "lessonDetail"
                            ? "bg-orange-100 text-orange-700 font-bold"
                            : "text-gray-500 hover:bg-gray-50 hover:text-orange-600"
                        }`}
                      >
                        {lesson.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeSection === "lessonDetail" ? "Chi tiết bài giảng" : menuItems.find(i => i.id === activeSection)?.label}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {activeSection === "lessonDetail" 
                  ? `Đang xem: ${selectedLesson?.title}`
                  : "Chào mừng trở lại, Giáo viên! Chúc bạn có một ngày làm việc hiệu quả."
                }
              </p>
            </div>
          </div>

          {activeSection === "home" && <HomeView />}
          {activeSection === "dashboard" && renderDashboard()}
          {activeSection === "students" && renderStudents()}
          {activeSection === "lessons" && renderLessons()}
          {activeSection === "feedback" && renderFeedback()}
          {activeSection === "lessonDetail" && renderLessonDetail(selectedLesson)}
        </div>
      </main>
    </div>
  );
}
