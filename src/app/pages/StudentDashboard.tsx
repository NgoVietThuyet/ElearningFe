import { useState, useEffect } from "react";
import { 
  BookOpen, 
  CheckCircle, 
  Lock, 
  Play, 
  LayoutDashboard, 
  Home as HomeIcon,
  MessageSquare,
  Loader2,
  GraduationCap
} from "lucide-react";
import { Link } from "react-router";
import HomeView from "../components/HomeView";
import { studentApi } from "../api/studentApi";
import { toast } from "sonner";

type StudentSection = "home" | "dashboard";

interface Stats {
  overallProgress: number;
  enrolledCount: number;
}

export default function StudentDashboard() {
  const [activeSection, setActiveSection] = useState<StudentSection>("home");
  const [courses, setCourses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, coursesRes, lessonsRes] = await Promise.all([
          studentApi.getStats(),
          studentApi.getCourses(),
          studentApi.getLessons()
        ]);
        setStats(statsRes.data);
        setCourses(coursesRes.data);
        setLessons(lessonsRes.data);
      } catch (err) {
        console.error("Failed to fetch student dashboard data", err);
        toast.error("Không thể tải dữ liệu dashboard.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderDashboard = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overall Progress */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 mb-8 text-white shadow-xl shadow-orange-200 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 w-full">
          <h2 className="text-3xl font-black mb-6">Tiến độ học tập tổng thể</h2>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-white h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${stats?.overallProgress || 0}%` }}
                ></div>
              </div>
            </div>
            <span className="text-5xl font-black">{stats?.overallProgress || 0}%</span>
          </div>
        </div>
        <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-sm text-center min-w-[200px]">
          <p className="text-orange-100 font-bold uppercase tracking-wider text-xs mb-1">Khóa học đã đăng ký</p>
          <p className="text-4xl font-black">{stats?.enrolledCount || 0}</p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Khóa học của tôi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:scale-[1.02] transition-all group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                  <BookOpen className="w-6 h-6 text-orange-600 group-hover:text-white" />
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">{course.title}</h3>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                  <span>Tiến độ</span>
                  <span className="text-orange-600">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-orange-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-400 font-medium">
                {course.completedLessons}/{course.totalLessons} bài học hoàn thành
              </p>
            </div>
          ))}
          {courses.length === 0 && <p className="col-span-full text-center py-12 text-gray-500 italic">Bạn chưa đăng ký khóa học nào.</p>}
        </div>
      </div>

      {/* Lessons List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-2xl font-bold text-gray-900">Bài học tiếp theo</h2>
        </div>
        <div className="p-8">
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                  lesson.status === "locked"
                    ? "border-gray-100 bg-gray-50/30 opacity-60"
                    : "border-gray-100 hover:border-orange-200 bg-white hover:shadow-md group"
                }`}
              >
                <div className="flex items-center gap-6">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      lesson.status === "completed"
                        ? "bg-green-100 text-green-600"
                        : lesson.status === "current"
                        ? "bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {lesson.status === "completed" ? (
                      <CheckCircle className="w-7 h-7" />
                    ) : lesson.status === "current" ? (
                      <Play className="w-7 h-7" />
                    ) : (
                      <Lock className="w-7 h-7" />
                    )}
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-bold ${
                        lesson.status === "locked" ? "text-gray-400" : "text-gray-900"
                      }`}
                    >
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-gray-400 font-medium">{lesson.duration}</p>
                  </div>
                </div>
                {lesson.status !== "locked" && (
                  <Link
                    to={`/course/${lesson.courseId}`}
                    className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${
                      lesson.status === "completed"
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-100"
                    }`}
                  >
                    {lesson.status === "completed" ? "XEM LẠI" : "HỌC NGAY"}
                  </Link>
                )}
              </div>
            ))}
            {lessons.length === 0 && <p className="text-center py-10 text-gray-500 italic">Chưa có bài học nào được gợi ý.</p>}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-72 border-r border-gray-100 flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-200">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter">STUDENT</h1>
          </div>
          
          <nav className="space-y-2">
            {[
              { id: "home", label: "Trang chủ", icon: HomeIcon },
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "feedback", label: "Hỗ trợ", icon: MessageSquare },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as StudentSection)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all duration-300 ${
                  activeSection === item.id 
                  ? "bg-orange-600 text-white shadow-xl shadow-orange-100 translate-x-2" 
                  : "text-gray-400 hover:text-orange-600 hover:bg-orange-50"
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-gray-50">
          <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
            <p className="text-xs text-orange-600 font-black mb-1 uppercase tracking-widest">Tài khoản</p>
            <p className="text-sm text-gray-900 font-black">Học viên chính thức</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto bg-gray-50/30">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
            </div>
          ) : (
            <>
              {activeSection === "home" && (
                <HomeView onNavigate={(section) => setActiveSection(section as StudentSection)} />
              )}
              {activeSection === "dashboard" && renderDashboard()}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
