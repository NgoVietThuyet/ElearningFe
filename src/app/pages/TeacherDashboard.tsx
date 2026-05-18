import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { 
  Users, 
  FileText, 
  CheckCircle, 
  UserPlus, 
  BookOpen, 
  ChevronRight,
  Search,
  Plus,
  Loader2,
  MessageSquare,
  Edit,
  Trash2,
  LayoutDashboard,
  CalendarDays,
  Activity
  , X
  , UploadCloud
  , Video
  , ClipboardCheck
  , Download
  , ExternalLink
  , Link as LinkIcon
  , Presentation
} from "lucide-react";
import { toast } from "sonner";
import { teacherApi } from "../api/teacherApi";
import CourseFeedbackPanel from "../components/common/CourseFeedbackPanel";
import FeedbackPage from "./Feedback";

type TeacherSection = "dashboard" | "courses" | "courseDetail" | "students" | "lessons" | "lessonDetail" | "feedback";

interface Stats {
  studentCount: number;
  lessonCount: number;
  completionRate: string;
}

export default function TeacherDashboard() {

  const [activeSection, setActiveSection] = useState<TeacherSection>("dashboard");
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const section = searchParams.get("section") as TeacherSection;
    if (section) {
      setActiveSection(section);
    } else {
      setActiveSection("dashboard");
    }
  }, [searchParams]);
  
  const [stats, setStats] = useState<Stats | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [learningItems, setLearningItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isSavingLesson, setIsSavingLesson] = useState(false);
  const [lessonForm, setLessonForm] = useState<any>({
    courseId: "",
    title: "",
    description: "",
    videoUrl: "",
    arVrUrl: "",
    quizUrl: "",
  });
  const [quizLesson, setQuizLesson] = useState<any>(null);
  const [quizForm, setQuizForm] = useState({
    title: "",
    url: "",
  });
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
  const [courseStudentEmail, setCourseStudentEmail] = useState("");
  const [isEnrollingStudent, setIsEnrollingStudent] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, lessonsRes, studentsRes, feedbacksRes, coursesRes] = await Promise.all([
          teacherApi.getStats(),
          teacherApi.getLessons(),
          teacherApi.getStudents(),
          teacherApi.getFeedbacks(),
          teacherApi.getCourses()
        ]);
        setStats(statsRes.data);
        setLessons(lessonsRes.data);
        setStudents(studentsRes.data);
        setFeedbacks(feedbacksRes.data);
        setCourses(coursesRes.data);
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
      const res = await teacherApi.getStudents();
      setStudents(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi thêm học sinh.");
    }
  };

  const handleEnrollStudentToCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse?.id || !courseStudentEmail.trim()) return;

    setIsEnrollingStudent(true);
    try {
      await teacherApi.enrollStudent(selectedCourse.id, courseStudentEmail.trim());
      setCourseStudentEmail("");
      setSelectedCourse((prev: any) => prev ? { ...prev, studentCount: (prev.studentCount || 0) + 1 } : prev);
      setCourses((prev) => prev.map((course) => Number(course.id) === Number(selectedCourse.id) ? { ...course, studentCount: (course.studentCount || 0) + 1 } : course));
      const [studentsRes, coursesRes] = await Promise.all([teacherApi.getStudents(), teacherApi.getCourses()]);
      setStudents(studentsRes.data);
      setCourses(coursesRes.data);
      const refreshedCourse = (coursesRes.data || []).find((course: any) => Number(course.id) === Number(selectedCourse.id));
      if (refreshedCourse) setSelectedCourse(refreshedCourse);
      toast.success("Đã thêm học sinh vào khóa học.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể thêm học sinh vào khóa học.");
    } finally {
      setIsEnrollingStudent(false);
    }
  };

  const updateLessonForm = (key: string, value: any) => {
    setLessonForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.courseId) {
      toast.error("Vui lòng chọn khóa học.");
      return;
    }

    setIsSavingLesson(true);
    try {
      const res = await teacherApi.createLesson(lessonForm);
      setLessons((prev) => [res.data, ...prev]);
      setIsLessonModalOpen(false);
      setLessonForm({
        courseId: "",
        title: "",
        description: "",
        videoUrl: "",
        arVrUrl: "",
        quizUrl: "",
      });
      toast.success("Đã tạo bài giảng.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể tạo bài giảng.");
    } finally {
      setIsSavingLesson(false);
    }
  };

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5081").replace(/\/$/, "");
  const toAssetUrl = (url?: string | null) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return `${apiBaseUrl}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const toVideoEmbedUrl = (url?: string | null) => {
    if (!url) return "";
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("youtube.com")) {
        const videoId = parsed.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      }
      if (parsed.hostname.includes("youtu.be")) {
        return `https://www.youtube.com/embed/${parsed.pathname.replace("/", "")}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const openLessonDetail = async (lesson: any) => {
    setSelectedLesson(lesson);
    setActiveSection("lessonDetail");
    try {
      const res = await teacherApi.getLearningItems(lesson.id);
      setLearningItems(res.data || []);
    } catch {
      setLearningItems([]);
    }
  };

  const openCourseDetail = (course: any) => {
    setSelectedCourse(course);
    setActiveSection("courseDetail");
  };

  const FileInput = ({ label, field, accept }: { label: string; field: string; accept: string }) => (
    <label className="block rounded-2xl border border-dashed border-[#D8DFEA] bg-[#F8FAFC] p-4 transition hover:border-[#FF6B00] hover:bg-[#FFF7F0]">
      <span className="mb-2 flex items-center gap-2 text-sm font-black text-[#0F172A]">
        <UploadCloud className="h-4 w-4 text-[#FF6B00]" />
        {label}
      </span>
      <input
        type="file"
        accept={accept}
        onChange={(event) => updateLessonForm(field, event.target.files?.[0] || null)}
        className="w-full text-xs font-semibold text-[#667085] file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-black file:text-[#FF6B00]"
      />
      {lessonForm[field]?.name && <span className="mt-2 block truncate text-xs font-bold text-[#22A06B]">{lessonForm[field].name}</span>}
    </label>
  );

  const handleCreateQuiz = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!quizLesson?.id) return;
    setIsSavingQuiz(true);
    try {
      const quizUrl = quizForm.url.trim();
      const payload = { ...quizLesson, quizUrl };
      const res = await teacherApi.updateLesson(quizLesson.id, payload);
      const updatedLesson = { ...quizLesson, ...(res.data || {}), quizUrl, quizCount: quizUrl ? 1 : 0 };
      setLessons((prev) => prev.map((lesson) => lesson.id === quizLesson.id ? { ...lesson, ...updatedLesson } : lesson));
      if (selectedLesson?.id === quizLesson.id) setSelectedLesson((prev: any) => prev ? { ...prev, ...updatedLesson } : prev);
      setQuizLesson(null);
      setQuizForm({ title: "", url: "" });
      toast.success("Đã cập nhật link bài kiểm tra.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể cập nhật link bài kiểm tra.");
    } finally {
      setIsSavingQuiz(false);
    }
  };

  const openQuizLinkModal = (lesson: any) => {
    setQuizLesson(lesson);
    setQuizForm({ title: "Bài kiểm tra", url: lesson.quizUrl || "" });
  };
  const renderLessonDetail = (lesson: any) => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => setActiveSection("lessons")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5 rotate-180 text-gray-400" />
        </button>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{lesson.title}</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#0F172A]">Nội dung chi tiết</h3>
              <button className="text-[10px] font-bold uppercase bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-all">CHỈNH SỬA</button>
            </div>
            <div className="prose prose-orange max-w-none text-gray-600 font-medium">
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
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-black text-gray-900 mb-5 tracking-tight text-xs uppercase opacity-60 tracking-widest">Tiến độ bài học</h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-bold">Số học sinh học:</span>
                <span className="text-sm font-black text-gray-900">{lesson.studentCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-bold">Hoàn thành:</span>
                <span className="text-sm font-black text-orange-600">{lesson.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)]" style={{ width: `${lesson.progress}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overall Progress */}
      <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 rounded-xl p-8 mb-8 text-white overflow-hidden shadow-lg shadow-orange-100">
        <img
          src="/assets/dna.gif"
          alt=""
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] rotate-[-60deg] opacity-[0.12] blur-[0.5px] saturate-[0.7] pointer-events-none select-none"
        />
        <div className="relative">
          <p className="text-orange-100 text-xs font-black uppercase tracking-[0.3em] mb-2 opacity-80">Không gian giảng dạy</p>
          <h2 className="text-4xl font-black tracking-tight drop-shadow-sm">Chào mừng bạn trở lại! 👨‍🏫</h2>
          <p className="text-orange-50 mt-3 font-medium max-w-xl leading-relaxed">Nơi quản lý học sinh, bài giảng và theo dõi sự tiến bộ của từng cá nhân trong hành trình chinh phục kiến thức Sinh học.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Học sinh của tôi", value: stats?.studentCount || 0, icon: Users, color: "orange" },
          { label: "Bài giảng đã đăng", value: stats?.lessonCount || 0, icon: FileText, color: "blue" },
          { label: "Tỷ lệ hoàn thành", value: stats?.completionRate || "0%", icon: CheckCircle, color: "green" },
        ].map((stat, index) => (
          <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-border hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-[#667085] uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-bold text-[#0F172A] mt-1 tracking-tight">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                stat.color === 'orange' ? 'bg-orange-50 text-orange-600' : 
                stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
                'bg-green-50 text-green-600'
              } shadow-sm`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 shadow-sm">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">Thêm học sinh mới</h2>
          </div>
          <form className="space-y-4" onSubmit={handleAddStudent}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#667085] uppercase tracking-widest">Email học viên</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 bg-[#F8F9FB] border border-border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-bold text-[#0F172A] text-xs transition-all" 
                placeholder="student@example.com" 
                value={newStudentEmail}
                onChange={(e) => setNewStudentEmail(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="w-full bg-[#FF6B00] text-white py-3 rounded-lg font-bold uppercase text-[10px] tracking-widest hover:bg-[#E65F00] transition-all">
              THÊM VÀO LỚP HỌC
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">Bài giảng mới đăng</h2>
            <button onClick={() => setActiveSection("lessons")} className="text-[10px] text-orange-600 font-bold uppercase tracking-widest hover:underline px-3 py-1 bg-orange-50 rounded-md">Xem tất cả</button>
          </div>
          <div className="space-y-2.5 max-h-[260px] overflow-y-auto custom-scrollbar pr-2">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:border-orange-200 hover:bg-orange-50/30 transition-all group cursor-pointer" onClick={() => openLessonDetail(lesson)}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">{lesson.title}</h3>
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest shrink-0">{lesson.date}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-black uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3 text-blue-500" /> {lesson.studentCount} HỌC SINH</span>
                  <span className="text-orange-500 font-black">{lesson.progress}% HOÀN THÀNH</span>
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
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F8F9FB]/50">
          <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Danh sách học sinh</h2>
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none w-full text-xs font-bold text-[#0F172A] transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Học sinh</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Email liên hệ</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tiến độ học tập</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ngày gia nhập</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-orange-50/10 transition-colors group">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-gradient-to-br from-orange-100 to-amber-100 text-orange-700 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-110 transition-transform">
                        {student.fullName.charAt(0)}
                      </div>
                      <span className="text-sm font-black text-gray-900 group-hover:text-orange-600 transition-colors">{student.fullName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500 font-bold italic">{student.email}</td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="w-24 bg-gray-100 rounded-full h-2 shadow-inner">
                        <div className="bg-orange-500 h-2 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.4)]" style={{ width: `${student.progress}%` }}></div>
                      </div>
                      <span className="text-[10px] font-black text-gray-600">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    {new Date(student.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right">
                    <button className="text-orange-600 hover:text-white hover:bg-orange-600 font-black text-[9px] uppercase tracking-widest border border-orange-600 px-4 py-2 rounded-xl transition-all">CHI TIẾT</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Giảng dạy</p>
        <h2 className="text-3xl font-black tracking-tight text-[#0F172A]">Khóa học của tôi</h2>
        <p className="text-sm font-semibold text-[#667085]">Danh sách khóa học bạn đang được phân quyền phụ trách.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <button key={course.id} onClick={() => openCourseDetail(course)} className="group overflow-hidden rounded-[28px] border border-gray-100 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <div className="relative h-44 bg-[#0F172A]">
              {course.avatarUrl ? (
                <img src={course.avatarUrl} alt={course.title} className="h-full w-full object-cover opacity-90 transition group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-600 to-orange-500 text-white">
                  <BookOpen className="h-14 w-14" />
                </div>
              )}
              <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-[#FF5A1F]">{course.lessonCount || 0} bài giảng</div>
            </div>
            <div className="p-6">
              <h3 className="line-clamp-2 text-xl font-black text-[#0F172A] group-hover:text-[#FF5A1F]">{course.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[#667085]">{course.description || "Chưa có mô tả khóa học."}</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#F8FAFC] p-3">
                  <p className="text-xs font-bold text-[#98A2B3]">Học sinh</p>
                  <p className="mt-1 text-lg font-black text-[#0F172A]">{course.studentCount || 0}</p>
                </div>
                <div className="rounded-2xl bg-[#F8FAFC] p-3">
                  <p className="text-xs font-bold text-[#98A2B3]">Tiến độ</p>
                  <p className="mt-1 text-lg font-black text-[#0F172A]">{course.avgProgress || course.averageProgress || 0}%</p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      {courses.length === 0 && (
        <div className="rounded-[28px] border border-dashed border-gray-200 bg-white p-10 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-bold text-gray-500">Bạn chưa được phân quyền khóa học nào.</p>
        </div>
      )}
    </div>
  );

  const renderCourseDetail = (course: any) => {
    if (!course) return null;
    const courseLessons = lessons.filter((lesson) => Number(lesson.courseId) === Number(course.id));

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveSection("courses")} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-500 shadow-sm transition hover:bg-gray-50">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">Khóa học</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-[#0F172A]">{course.title}</h2>
          </div>
        </div>

        <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-black text-[#0F172A]">Bài giảng trong khóa học</h3>
              <p className="mt-1 text-sm font-semibold text-[#667085]">{courseLessons.length} bài giảng đang có trong khóa học này.</p>
            </div>
            <button onClick={() => { updateLessonForm("courseId", course.id); setIsLessonModalOpen(true); }} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FF5A1F] px-5 text-sm font-black text-white">
              <Plus className="h-4 w-4" />
              Thêm bài giảng
            </button>
          </div>

          <form onSubmit={handleEnrollStudentToCourse} className="mt-6 rounded-2xl border border-[#FFE1D2] bg-[#FFF7F2] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <label className="flex-1">
                <span className="mb-2 block text-sm font-black text-[#0F172A]">Thêm học sinh vào khóa học</span>
                <input
                  type="email"
                  required
                  value={courseStudentEmail}
                  onChange={(event) => setCourseStudentEmail(event.target.value)}
                  className="h-12 w-full rounded-xl border border-[#FFD8C7] bg-white px-4 text-sm font-bold text-[#0F172A] outline-none transition focus:border-[#FF5A1F]"
                  placeholder="student@example.com"
                />
              </label>
              <button disabled={isEnrollingStudent} type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#FF5A1F] px-6 text-sm font-black text-white shadow-lg shadow-orange-100 transition hover:bg-[#E84A0C] disabled:opacity-60">
                {isEnrollingStudent ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Thêm học sinh
              </button>
            </div>
            <p className="mt-2 text-xs font-semibold text-[#667085]">Học sinh được thêm sẽ thấy khóa học này trên dashboard và truy cập được các bài giảng trong khóa học.</p>
          </form>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courseLessons.map((lesson) => (
              <button key={lesson.id} onClick={() => openLessonDetail(lesson)} className="rounded-2xl border border-gray-100 bg-[#FBFCFE] p-5 text-left transition hover:border-orange-200 hover:bg-[#FFF8F3]">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                  <FileText className="h-6 w-6" />
                </div>
                <h4 className="line-clamp-2 text-lg font-black text-[#0F172A]">{lesson.title}</h4>
                <p className="mt-2 line-clamp-2 text-sm font-semibold text-[#667085]">{lesson.description || "Chưa có mô tả."}</p>
                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-xs font-black uppercase text-gray-400">
                  <span>{lesson.quizCount || 0} quiz</span>
                  <span>{lesson.date}</span>
                </div>
              </button>
            ))}
          </div>
          {courseLessons.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-8 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm font-bold text-gray-500">Khóa học này chưa có bài giảng.</p>
            </div>
          )}
        </div>

        <CourseFeedbackPanel courseId={course.id} teacherId={course.teacherId || course.createdBy || null} canWrite title="Đánh giá khóa học" />
      </div>
    );
  };

  const renderLessons = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Quản lý bài giảng</h2>
          <button onClick={() => setIsLessonModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all text-xs font-black shadow-lg shadow-orange-100 uppercase tracking-widest">
            <Plus className="w-5 h-5" /> TẠO BÀI GIẢNG MỚI
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="bg-white p-8 rounded-3xl border border-gray-50 hover:shadow-xl transition-all group card-lift relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white group-hover:rotate-6 transition-all duration-300 shadow-sm">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2.5 hover:bg-orange-50 rounded-xl text-gray-400 hover:text-orange-600 transition-colors">
                    <Edit className="w-4.5 h-4.5" />
                  </button>
                  <button onClick={() => openQuizLinkModal(lesson)} className="p-2.5 hover:bg-blue-50 rounded-xl text-gray-400 hover:text-blue-600 transition-colors" title="Thêm bài kiểm tra">
                    <ClipboardCheck className="w-4.5 h-4.5" />
                  </button>
                  <button className="p-2.5 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
              <h3 className="font-black text-gray-900 mb-3 group-hover:text-orange-600 transition-colors cursor-pointer text-xl leading-tight" onClick={() => openLessonDetail(lesson)}>{lesson.title}</h3>
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] pt-4 border-t border-gray-50">
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-400" /> {lesson.studentCount} HỌC VIÊN</span>
                <span className="text-gray-300">{lesson.quizCount || 0} QUIZ</span>
              </div>
            </div>
          ))}
          <div onClick={() => setIsLessonModalOpen(true)} className="border-2 border-dashed border-gray-100 rounded-3xl p-8 flex flex-col items-center justify-center text-gray-300 hover:border-orange-400 hover:bg-orange-50/10 hover:text-orange-500 transition-all group min-h-[240px] cursor-pointer">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-all">
              <Plus className="w-10 h-10 group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-black uppercase text-xs tracking-[0.2em]">Thêm bài học mới</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-10">
      <div className="flex flex-col gap-3">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Phản hồi của học viên</h2>
        <p className="text-gray-500 font-bold max-w-2xl leading-relaxed">Lắng nghe những đóng góp từ các bạn học viên để không ngừng cải tiến phương pháp giảng dạy và nội dung học liệu.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {feedbacks.map((fb) => (
          <div key={fb.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center text-orange-700 font-black text-xl shadow-sm border border-white">
                  {fb.student.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-xl tracking-tight group-hover:text-orange-600 transition-colors">{fb.student}</h4>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Khóa học: <span className="text-orange-500">{fb.course}</span></p>
                </div>
              </div>
              <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest">{fb.date}</span>
            </div>
            <div className="bg-gray-50/50 p-6 rounded-[1.5rem] border border-gray-50">
              <p className="text-gray-600 text-sm font-medium italic leading-relaxed">"{fb.content}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
            <div className="absolute inset-0 blur-xl bg-orange-500/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="pt-6">
            <div className="pb-16">
              {activeSection === "dashboard" && renderDashboard()}
              {activeSection === "courses" && renderCourses()}
              {activeSection === "courseDetail" && renderCourseDetail(selectedCourse)}
              {activeSection === "students" && renderStudents()}
              {activeSection === "lessons" && renderLessons()}
              {activeSection === "lessonDetail" && renderLessonDetailV2(selectedLesson)}
              {activeSection === "feedback" && <FeedbackPage />}
            </div>
          </div>
        </>
      )}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/45 p-4 backdrop-blur-sm">
          <form onSubmit={handleCreateLesson} className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#E6EAF0] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#EEF2F6] px-8 py-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-[#0F172A]">Tạo bài giảng mới</h2>
                <p className="mt-1 text-sm font-semibold text-[#667085]">Thêm giáo án, slide, AR/VR, video và bài quiz cho học sinh.</p>
              </div>
              <button type="button" onClick={() => setIsLessonModalOpen(false)} className="rounded-full p-2 text-[#667085] transition hover:bg-[#F2F4F7] hover:text-[#0F172A]">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="max-h-[calc(92vh-160px)] overflow-y-auto px-8 py-7">
              <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                <section className="rounded-3xl border border-[#E6EAF0] bg-white p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF4EC] text-[#FF6B00]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-black text-[#0F172A]">Thông tin bài giảng</h3>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-black text-[#344054]">Khóa học *</span>
                      <select required value={lessonForm.courseId} onChange={(event) => updateLessonForm("courseId", event.target.value)} className="h-12 w-full rounded-xl border border-[#D8DFEA] bg-white px-4 text-sm font-bold outline-none transition focus:border-[#FF6B00]">
                        <option value="">Chọn khóa học</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>{course.title}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-black text-[#344054]">Tên bài giảng *</span>
                      <input required value={lessonForm.title} onChange={(event) => updateLessonForm("title", event.target.value)} className="h-12 w-full rounded-xl border border-[#D8DFEA] px-4 text-sm font-bold outline-none transition focus:border-[#FF6B00]" placeholder="VD: Cấu trúc không gian của ADN" />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-2 flex items-center gap-2 text-sm font-black text-[#344054]"><Video className="h-4 w-4 text-[#FF6B00]" /> Link video bài học</span>
                      <input value={lessonForm.videoUrl} onChange={(event) => updateLessonForm("videoUrl", event.target.value)} className="h-12 w-full rounded-xl border border-[#D8DFEA] px-4 text-sm font-bold outline-none transition focus:border-[#FF6B00]" placeholder="https://www.youtube.com/watch?v=..." />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm font-black text-[#344054]">Mô tả bài giảng</span>
                      <textarea value={lessonForm.description} onChange={(event) => updateLessonForm("description", event.target.value)} rows={5} className="w-full rounded-xl border border-[#D8DFEA] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#FF6B00]" placeholder="Mục tiêu bài học, nội dung chính, hướng dẫn học tập..." />
                    </label>
                  </div>
                </section>

                <section className="rounded-3xl border border-[#E6EAF0] bg-[#FBFCFE] p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ECFDF3] text-[#16A34A]">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-black text-[#0F172A]">Tài nguyên đính kèm</h3>
                  </div>
                  <div className="space-y-4">
                    <FileInput label="Giáo án (PDF, Word)" field="lessonPlanFile" accept=".pdf,.doc,.docx" />
                    <FileInput label="Slide (PDF, PowerPoint)" field="slideFile" accept=".pdf,.ppt,.pptx" />
                    <FileInput label="Bài tập (Word, PDF)" field="documentFile" accept=".pdf,.doc,.docx" />
                    <label className="block">
                      <span className="mb-2 block text-sm font-black text-[#344054]">AR/VR (link)</span>
                      <input value={lessonForm.arVrUrl || ""} onChange={(event) => updateLessonForm("arVrUrl", event.target.value)} className="h-12 w-full rounded-xl border border-[#D8DFEA] px-4 text-sm font-bold outline-none transition focus:border-[#FF6B00]" placeholder="https://..." />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-black text-[#344054]">Bài kiểm tra (link)</span>
                      <input type="url" value={lessonForm.quizUrl || ""} onChange={(event) => updateLessonForm("quizUrl", event.target.value)} className="h-12 w-full rounded-xl border border-[#D8DFEA] px-4 text-sm font-bold outline-none transition focus:border-[#FF6B00]" placeholder="https://forms.gle/... hoặc link quiz" />
                    </label>
                  </div>
                </section>

              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#EEF2F6] bg-[#FCFCFD] px-8 py-5">
              <button type="button" onClick={() => setIsLessonModalOpen(false)} className="h-12 rounded-xl border border-[#D8DFEA] bg-white px-8 text-sm font-black text-[#0F172A] transition hover:bg-[#F8FAFC]">Hủy</button>
              <button disabled={isSavingLesson} type="submit" className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#FF5A1F] px-8 text-sm font-black text-white shadow-lg shadow-orange-100 transition hover:bg-[#E84A0C] disabled:opacity-60">
                {isSavingLesson ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Tạo bài giảng
              </button>
            </div>
          </form>
        </div>
      )}
      {quizLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/45 p-4 backdrop-blur-sm">
          <form onSubmit={handleCreateQuiz} className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[28px] border border-[#E6EAF0] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#EEF2F6] px-8 py-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-[#0F172A]">Thêm bài kiểm tra</h2>
                <p className="mt-1 text-sm font-semibold text-[#667085]">{quizLesson.title}</p>
              </div>
              <button type="button" onClick={() => setQuizLesson(null)} className="rounded-full p-2 text-[#667085] transition hover:bg-[#F2F4F7]">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="max-h-[calc(92vh-170px)] space-y-5 overflow-y-auto px-8 py-7">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-[#344054]">Tên bài kiểm tra</span>
                <input required value={quizForm.title} onChange={(event) => setQuizForm((prev) => ({ ...prev, title: event.target.value }))} className="h-12 w-full rounded-xl border border-[#D8DFEA] px-4 text-sm font-bold outline-none transition focus:border-[#FF6B00]" placeholder="VD: Kiểm tra ADN" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-black text-[#344054]">Link bài kiểm tra *</span>
                <input required type="url" value={quizForm.url} onChange={(event) => setQuizForm((prev) => ({ ...prev, url: event.target.value }))} className="h-12 w-full rounded-xl border border-[#D8DFEA] px-4 text-sm font-bold outline-none transition focus:border-[#FF6B00]" placeholder="https://forms.gle/... hoặc link quiz của bạn" />
              </label>
              <div className="rounded-2xl border border-[#E6EAF0] bg-[#FBFCFE] p-5 text-sm font-semibold leading-6 text-[#667085]">
                Bài kiểm tra được lưu dưới dạng một đường link. Khi học sinh hoặc giáo viên bấm vào link này, hệ thống sẽ mở trang mới của link đó.
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-[#EEF2F6] bg-[#FCFCFD] px-8 py-5">
              <button type="button" onClick={() => setQuizLesson(null)} className="h-12 rounded-xl border border-[#D8DFEA] bg-white px-8 text-sm font-black text-[#0F172A]">Hủy</button>
              <button disabled={isSavingQuiz} type="submit" className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#FF5A1F] px-8 text-sm font-black text-white shadow-lg shadow-orange-100 disabled:opacity-60">
                {isSavingQuiz ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
                Tạo bài kiểm tra
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  function renderLessonDetailV2(lesson: any) {
    if (!lesson) return null;

    const videoEmbedUrl = toVideoEmbedUrl(lesson.videoUrl);
    const resources = [
      { label: "Giáo án", desc: "PDF, DOC hoặc DOCX", url: lesson.lessonPlanUrl, name: lesson.lessonPlanFileName, icon: BookOpen, color: "bg-orange-50 text-orange-600" },
      { label: "Slide", desc: "PDF, PPT hoặc PPTX", url: lesson.slideUrl, name: lesson.slideFileName, icon: Presentation, color: "bg-blue-50 text-blue-600" },
      { label: "Bài tập", desc: "PDF, DOC hoặc DOCX", url: lesson.documentUrl, name: lesson.documentName, icon: FileText, color: "bg-emerald-50 text-emerald-600" },
      { label: "AR/VR", desc: "Liên kết trải nghiệm tương tác", url: lesson.arVrUrl, name: lesson.arVrUrl, icon: LinkIcon, color: "bg-violet-50 text-violet-600" },
    ];

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveSection("lessons")} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-500 shadow-sm transition hover:bg-gray-50">
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">{lesson.courseTitle || "Bài giảng"}</p>
              <h2 className="mt-1 text-3xl font-black tracking-tight text-[#0F172A]">{lesson.title}</h2>
            </div>
          </div>
          <button onClick={() => openQuizLinkModal(lesson)} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#FF5A1F] px-6 text-sm font-black text-white shadow-lg shadow-orange-100 transition hover:bg-[#E84A0C]">
            <ClipboardCheck className="h-4 w-4" />
            Thêm bài kiểm tra
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <section className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <h3 className="flex items-center gap-2 text-lg font-black text-[#0F172A]">
                <Video className="h-5 w-5 text-[#FF5A1F]" />
                Video bài học
              </h3>
            </div>
            <div className="aspect-video bg-[#0F172A]">
              {videoEmbedUrl ? (
                <iframe src={videoEmbedUrl} title={lesson.title} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center text-white">
                  <Video className="mb-3 h-12 w-12 opacity-70" />
                  <p className="text-sm font-bold opacity-80">Chưa có link video bài học</p>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-gray-400">Tiến độ bài học</h3>
              <div className="space-y-5">
                <div className="flex justify-between text-sm"><span className="font-bold text-gray-500">Học sinh</span><span className="font-black text-[#0F172A]">{lesson.studentCount || 0}</span></div>
                <div className="flex justify-between text-sm"><span className="font-bold text-gray-500">Hoàn thành</span><span className="font-black text-orange-600">{lesson.progress || 0}%</span></div>
                <div className="h-2 rounded-full bg-gray-100"><div className="h-2 rounded-full bg-[#FF5A1F]" style={{ width: `${lesson.progress || 0}%` }} /></div>
                <div className="flex justify-between text-sm"><span className="font-bold text-gray-500">Bài kiểm tra</span><span className="font-black text-[#0F172A]">{lesson.quizUrl ? 1 : 0}</span></div>
              </div>
            </div>

            <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-black text-[#0F172A]">Mô tả</h3>
              <p className="whitespace-pre-line text-sm font-semibold leading-7 text-gray-600">{lesson.description || "Chưa có mô tả cho bài giảng này."}</p>
            </div>
          </aside>
        </div>

        <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-black text-[#0F172A]">Tài nguyên bài giảng</h3>
            <span className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">Preview / tải xuống</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {resources.map((resource) => {
              const href = toAssetUrl(resource.url);
              const Icon = resource.icon;
              return (
                <div key={resource.label} className="rounded-2xl border border-gray-100 bg-[#FBFCFE] p-5">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${resource.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-black text-[#0F172A]">{resource.label}</h4>
                  <p className="mt-1 text-xs font-bold text-gray-400">{resource.desc}</p>
                  <p className="mt-3 min-h-5 truncate text-sm font-bold text-gray-600">{resource.name || "Chưa có tài nguyên"}</p>
                  {href ? (
                    <div className="mt-4 flex gap-2">
                      <a href={href} target="_blank" rel="noreferrer" className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-xs font-black text-[#0F172A] transition hover:border-orange-200 hover:text-orange-600">
                        <ExternalLink className="h-4 w-4" />
                        Preview
                      </a>
                      <a href={href} target="_blank" rel="noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF4EC] text-[#FF5A1F] transition hover:bg-[#FFE6D8]">
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  ) : (
                    <div className="mt-4 flex h-10 items-center justify-center rounded-xl border border-dashed border-gray-200 text-xs font-black text-gray-400">Trống</div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-black text-[#0F172A]">Bài kiểm tra</h3>
            <button onClick={() => openQuizLinkModal(lesson)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#FFF4EC] px-4 text-xs font-black text-[#FF5A1F]">
              <Plus className="h-4 w-4" />
              Thêm quiz
            </button>
          </div>
          <div className="space-y-3">
            {lesson.quizUrl ? (
              <button
                type="button"
                onClick={() => window.open(lesson.quizUrl, "_blank", "noopener,noreferrer")}
                className="flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-[#FBFCFE] px-5 py-4 text-left transition-all hover:border-orange-200 hover:bg-orange-50/20 group/quiz"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover/quiz:bg-orange-50 group-hover/quiz:text-orange-600 transition-all"><ClipboardCheck className="h-5 w-5" /></div>
                  <div>
                    <p className="font-black text-[#0F172A] group-hover/quiz:text-orange-600 transition-all">Bài kiểm tra</p>
                    <p className="max-w-[520px] truncate text-xs font-bold text-gray-400">{lesson.quizUrl}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 opacity-0 group-hover/quiz:opacity-100 transition-all">Mở link</span>
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                </div>
              </button>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                <ClipboardCheck className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm font-bold text-gray-500">Chưa có link bài kiểm tra cho bài giảng này.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  };
}

