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
      <div className="relative bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 rounded-3xl p-8 mb-8 text-white overflow-hidden shadow-[0_20px_60px_rgba(249,115,22,0.35)]">
        {/* DNA helix background */}
        <img
          src="/assets/dna.gif"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            translate: "-50% -50%",
            width: "520px",
            transform: "rotate(-60deg)",
            opacity: 0.11,
            filter: "blur(0.5px) saturate(0.7)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full filter blur-[60px]" />
          <div className="absolute bottom-0 left-1/3 w-36 h-36 bg-yellow-300 rounded-full filter blur-[50px]" />
        </div>
        <div className="absolute top-4 right-6 text-4xl opacity-30 animate-float">🎓</div>
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 w-full">
            <h2 className="text-2xl font-black mb-6 drop-shadow-sm">Tiến độ học tập tổng thể</h2>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="w-full bg-white/25 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-white h-4 rounded-full transition-all duration-1000 shadow-sm"
                    style={{ width: `${stats?.overallProgress || 0}%` }}
                  />
                </div>
              </div>
              <span className="text-5xl font-black tabular-nums">{stats?.overallProgress || 0}%</span>
            </div>
          </div>
          <div className="bg-white/15 p-6 rounded-2xl border border-white/25 backdrop-blur-sm text-center min-w-[190px]">
            <p className="text-orange-100 font-black uppercase tracking-widest text-xs mb-1">Khóa đã đăng ký</p>
            <p className="text-5xl font-black">{stats?.enrolledCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="mb-10">
        <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Khóa học của tôi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-[0_16px_50px_rgba(249,115,22,0.12)] hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-sm">
                  <BookOpen className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-black text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">{course.title}</h3>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
                  <span>Tiến độ</span>
                  <span className="text-orange-500">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="progress-fill h-2.5 rounded-full transition-all duration-1000"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-400 font-semibold">
                {course.completedLessons}/{course.totalLessons} bài học hoàn thành
              </p>
            </div>
          ))}
          {courses.length === 0 && (
            <p className="col-span-full text-center py-14 text-gray-400 italic font-medium">
              Bạn chưa đăng ký khóa học nào.
            </p>
          )}
        </div>
      </div>

      {/* Lessons List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-7 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Bài học tiếp theo</h2>
        </div>
        <div className="p-7">
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-200 ${
                  lesson.status === "locked"
                    ? "border-gray-100 bg-gray-50/40 opacity-55"
                    : "border-gray-100 hover:border-orange-200 bg-white hover:shadow-md group hover:-translate-y-0.5"
                }`}
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      lesson.status === "completed"
                        ? "bg-green-100 text-green-600"
                        : lesson.status === "current"
                        ? "bg-orange-100 text-orange-600 group-hover:bg-orange-500 group-hover:text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {lesson.status === "completed" ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : lesson.status === "current" ? (
                      <Play className="w-6 h-6" />
                    ) : (
                      <Lock className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-base font-black ${lesson.status === "locked" ? "text-gray-400" : "text-gray-900"}`}>
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-gray-400 font-semibold">{lesson.duration}</p>
                  </div>
                </div>
                {lesson.status !== "locked" && (
                  <Link
                    to={`/course/${lesson.courseId}`}
                    className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-200 ${
                      lesson.status === "completed"
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "btn-gradient text-white"
                    }`}
                  >
                    {lesson.status === "completed" ? "XEM LẠI" : "HỌC NGAY"}
                  </Link>
                )}
              </div>
            ))}
            {lessons.length === 0 && (
              <p className="text-center py-12 text-gray-400 italic font-medium">Chưa có bài học nào được gợi ý.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50/40">
      {/* Sidebar */}
      <aside className="w-72 border-r border-gray-100 flex flex-col sticky top-[68px] h-[calc(100vh-68px)] bg-white">
        <div className="p-7">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-[0_4px_14px_rgba(249,115,22,0.4)]">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black text-gray-900 tracking-tight leading-tight">STUDENT</h1>
              <p className="text-xs text-gray-400 font-semibold">Bảng điều khiển</p>
            </div>
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
                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-black text-sm transition-all duration-300 ${
                  activeSection === item.id
                    ? "sidebar-active text-white translate-x-1"
                    : "text-gray-400 hover:text-orange-600 hover:bg-orange-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-7 border-t border-gray-100">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-2xl border border-orange-100">
            <p className="text-xs text-orange-600 font-black mb-1 uppercase tracking-widest">Tài khoản</p>
            <p className="text-sm text-gray-900 font-black">Học viên chính thức ✨</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-3" />
                <p className="text-gray-400 font-semibold">Đang tải dữ liệu...</p>
              </div>
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
