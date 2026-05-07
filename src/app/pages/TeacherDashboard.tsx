import { useState, useEffect } from "react";
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
  MessageSquare,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import HomeView from "../components/HomeView";
import { teacherApi } from "../api/teacherApi";

type TeacherSection = "home" | "dashboard" | "students" | "lessons" | "lessonDetail" | "feedback";

interface Stats {
  studentCount: number;
  lessonCount: number;
  completionRate: string;
  avgRating: string;
}

export default function TeacherDashboard() {
  const [activeSection, setActiveSection] = useState<TeacherSection>("home");
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  
  const [stats, setStats] = useState<Stats | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newStudentEmail, setNewStudentEmail] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, lessonsRes, studentsRes, feedbacksRes] = await Promise.all([
          teacherApi.getStats(),
          teacherApi.getLessons(),
          teacherApi.getStudents(),
          teacherApi.getFeedbacks()
        ]);
        setStats(statsRes.data);
        setLessons(lessonsRes.data);
        setStudents(studentsRes.data);
        setFeedbacks(feedbacksRes.data);
      } catch (err) {
        console.error("Failed to fetch teacher dashboard data", err);
        toast.error("Không thể tải dữ liệu dashboard.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await teacherApi.addStudent(newStudentEmail);
      toast.success("Đã thêm học sinh vào danh sách quản lý!");
      setNewStudentEmail("");
      // Refresh students list
      const res = await teacherApi.getStudents();
      setStudents(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi thêm học sinh.");
    }
  };

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
                <span className="text-sm font-bold text-gray-900">{lesson.studentCount}</span>
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
        {[
          { label: "Học sinh của tôi", value: stats?.studentCount || 0, icon: Users },
          { label: "Bài giảng đã đăng", value: stats?.lessonCount || 0, icon: FileText },
          { label: "Tỷ lệ hoàn thành", value: stats?.completionRate || "0%", icon: CheckCircle },
          { label: "Đánh giá trung bình", value: stats?.avgRating || "0.0", icon: TrendingUp },
        ].map((stat, index) => (
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
          <form className="space-y-4" onSubmit={handleAddStudent}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email học sinh</label>
              <input 
                type="email" 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" 
                placeholder="student@test.com" 
                value={newStudentEmail}
                onChange={(e) => setNewStudentEmail(e.target.value)}
                required 
              />
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
              <div key={lesson.id} className="p-4 rounded-xl border border-gray-100 hover:border-orange-200 transition-all group cursor-pointer" onClick={() => { setSelectedLesson(lesson); setActiveSection("lessonDetail"); }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{lesson.title}</h3>
                  <span className="text-xs text-gray-500">{lesson.date}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{lesson.studentCount} học sinh tham gia</span>
                  <span>{lesson.progress}% hoàn thành</span>
                </div>
              </div>
            ))}
            {lessons.length === 0 && <p className="text-sm text-gray-500 italic text-center py-4">Chưa có bài giảng nào.</p>}
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Ngày gia nhập</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xs">
                        {student.fullName.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{student.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${student.progress}%` }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(student.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-orange-600 hover:text-orange-700 font-bold text-xs uppercase tracking-wider">Chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && <p className="text-center py-10 text-gray-500">Chưa có học sinh nào.</p>}
        </div>
      </div>
    </div>
  );

  const renderLessons = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Quản lý bài giảng</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors text-sm font-bold">
            <Plus className="w-4 h-4" /> Tạo mới
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-orange-200 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-orange-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors cursor-pointer" onClick={() => { setSelectedLesson(lesson); setActiveSection("lessonDetail"); }}>{lesson.title}</h3>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{lesson.studentCount} học sinh</span>
                <span>{lesson.date}</span>
              </div>
            </div>
          ))}
          {lessons.length === 0 && <p className="col-span-full text-center py-10 text-gray-500">Chưa có bài giảng nào.</p>}
        </div>
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Phản hồi từ học sinh</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {feedbacks.map((fb) => (
          <div key={fb.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                  {fb.student.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{fb.student}</h4>
                  <p className="text-xs text-gray-500">Khóa: {fb.course}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">{fb.date}</span>
            </div>
            <p className="text-gray-600 text-sm italic leading-relaxed">"{fb.content}"</p>
          </div>
        ))}
        {feedbacks.length === 0 && <p className="col-span-full text-center py-10 text-gray-500 italic">Chưa có phản hồi nào.</p>}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-100 flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">TEACHER</h1>
          </div>
          
          <nav className="space-y-1">
            {[
              { id: "home", label: "Trang chủ", icon: HomeIcon },
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "students", label: "Học sinh", icon: Users },
              { id: "lessons", label: "Bài giảng", icon: FileText },
              { id: "feedback", label: "Phản hồi", icon: MessageSquare },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as TeacherSection)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                  activeSection === item.id 
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-100 translate-x-2" 
                  : "text-gray-400 hover:text-orange-600 hover:bg-orange-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-gray-50">
          <div className="bg-orange-50 p-4 rounded-2xl">
            <p className="text-xs text-orange-600 font-bold mb-1 uppercase tracking-wider">Trạng thái</p>
            <p className="text-sm text-gray-900 font-bold">Giáo viên xác thực</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            </div>
          ) : (
            <>
              {activeSection === "home" && (
                <HomeView onNavigate={(section) => setActiveSection(section as TeacherSection)} />
              )}
              {activeSection === "dashboard" && renderDashboard()}
              {activeSection === "students" && renderStudents()}
              {activeSection === "lessons" && renderLessons()}
              {activeSection === "lessonDetail" && renderLessonDetail(selectedLesson)}
              {activeSection === "feedback" && renderFeedback()}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
