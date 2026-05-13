import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
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
} from "lucide-react";
import { toast } from "sonner";
import { teacherApi } from "../api/teacherApi";

type TeacherSection = "dashboard" | "students" | "lessons" | "lessonDetail" | "feedback";

interface Stats {
  studentCount: number;
  lessonCount: number;
  completionRate: string;
}

export default function TeacherDashboard() {
  const [activeSection, setActiveSection] = useState<TeacherSection>("dashboard");
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
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
          <ChevronRight className="w-5 h-5 rotate-180 text-gray-400" />
        </button>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{lesson.title}</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900">Nội dung chi tiết</h3>
              <button className="text-xs font-black uppercase bg-orange-600 text-white px-5 py-2.5 rounded-xl hover:bg-orange-700 transition-all">CHỈNH SỬA</button>
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 rounded-[2.5rem] p-10 text-white overflow-hidden shadow-[0_20px_60px_rgba(249,115,22,0.35)]">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Học sinh của tôi", value: stats?.studentCount || 0, icon: Users, color: "orange" },
          { label: "Bài giảng đã đăng", value: stats?.lessonCount || 0, icon: FileText, color: "blue" },
          { label: "Tỷ lệ hoàn thành", value: stats?.completionRate || "0%", icon: CheckCircle, color: "green" },
        ].map((stat, index) => (
          <div key={index} className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all card-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900 mt-2 tracking-tighter">{stat.value}</p>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                stat.color === 'orange' ? 'bg-orange-50 text-orange-600' : 
                stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
                'bg-green-50 text-green-600'
              } shadow-sm`}>
                <stat.icon className="w-7 h-7" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 card-lift">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm">
              <UserPlus className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Thêm học sinh mới</h2>
          </div>
          <form className="space-y-6" onSubmit={handleAddStudent}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Địa chỉ Email học viên</label>
              <input 
                type="email" 
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-900 transition-all" 
                placeholder="student@example.com" 
                value={newStudentEmail}
                onChange={(e) => setNewStudentEmail(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:shadow-xl transition-all">
              THÊM VÀO LỚP HỌC
            </button>
          </form>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 overflow-hidden card-lift">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Bài giảng mới đăng</h2>
            <button onClick={() => setActiveSection("lessons")} className="text-[10px] text-orange-600 font-black uppercase tracking-widest hover:underline px-3 py-1 bg-orange-50 rounded-lg">Xem tất cả</button>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:border-orange-200 hover:bg-orange-50/30 transition-all group cursor-pointer" onClick={() => { setSelectedLesson(lesson); setActiveSection("lessonDetail"); }}>
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
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/30">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Danh sách học sinh</h2>
          <div className="relative w-full md:w-80">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm học viên..." 
              className="pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none w-full text-sm font-bold text-gray-900 transition-all"
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

  const renderLessons = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Quản lý bài giảng</h2>
          <button className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all text-xs font-black shadow-lg shadow-orange-100 uppercase tracking-widest">
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
                  <button className="p-2.5 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
              <h3 className="font-black text-gray-900 mb-3 group-hover:text-orange-600 transition-colors cursor-pointer text-xl leading-tight" onClick={() => { setSelectedLesson(lesson); setActiveSection("lessonDetail"); }}>{lesson.title}</h3>
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] pt-4 border-t border-gray-50">
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-400" /> {lesson.studentCount} HỌC VIÊN</span>
                <span className="text-gray-300">{lesson.date}</span>
              </div>
            </div>
          ))}
          <div className="border-2 border-dashed border-gray-100 rounded-3xl p-8 flex flex-col items-center justify-center text-gray-300 hover:border-orange-400 hover:bg-orange-50/10 hover:text-orange-500 transition-all group min-h-[240px] cursor-pointer">
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
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 sm:px-0">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="relative">
            <Loader2 className="w-14 h-14 animate-spin text-orange-500" />
            <div className="absolute inset-0 blur-xl bg-orange-500/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-10 flex flex-col gap-3">
            <h1 className="text-4xl font-black tracking-tighter text-gray-950">
              {activeSection === "dashboard" ? "Trung tâm Giảng dạy" : 
               activeSection === "students" ? "Danh sách Học viên" :
               activeSection === "lessons" ? "Kho Bài giảng" :
               activeSection === "lessonDetail" ? "Chi tiết nội dung" : "Phản hồi học viên"}
            </h1>
          </div>
          <div className="pb-24">
            {activeSection === "dashboard" && renderDashboard()}
            {activeSection === "students" && renderStudents()}
            {activeSection === "lessons" && renderLessons()}
            {activeSection === "lessonDetail" && renderLessonDetail(selectedLesson)}
            {activeSection === "feedback" && renderFeedback()}
          </div>
        </>
      )}
    </div>
  );
}
