import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { jwtDecode } from "jwt-decode";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Facebook,
  GraduationCap,
  Headphones,
  Instagram,
  Loader2,
  MessageSquare,
  Play,
  Users,
  Youtube,
} from "lucide-react";
import { publicApi } from "../api/publicApi";

interface Course {
  id: number;
  title: string;
  description: string;
  creatorName: string;
  lessonCount: number;
  studentCount: number;
  avatarUrl?: string | null;
}

interface Teacher {
  id: number;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  studentCount: number;
  lessonCount: number;
}

interface PublicStats {
  totalCourses: number;
  totalUsers: number;
  totalLessons: number;
  totalTeachers?: number;
  totalFeedbacks?: number;
}

interface JwtPayload {
  role?: string;
  [key: string]: any;
}

const featureItems = [
  {
    title: "Nội dung chất lượng",
    text: "Các khóa học được xây dựng từ dữ liệu thật trong hệ thống EduSmart.",
    icon: BookOpen,
    bg: "bg-orange-50",
    color: "text-orange-600",
  },
  {
    title: "Giảng viên đồng hành",
    text: "Kết nối với đội ngũ giảng viên đang trực tiếp quản lý lớp học.",
    icon: Users,
    bg: "bg-blue-50",
    color: "text-blue-600",
  },
  {
    title: "Theo dõi tiến độ",
    text: "Số bài học, học viên và khóa học được đồng bộ từ backend.",
    icon: BarChart3,
    bg: "bg-emerald-50",
    color: "text-emerald-600",
  },
  {
    title: "Ghi nhận phản hồi",
    text: "Feedback được gửi và lưu trực tiếp vào hệ thống.",
    icon: MessageSquare,
    bg: "bg-violet-50",
    color: "text-violet-600",
  },
];

function formatNumber(value?: number) {
  if (!value) return "0";
  return value.toLocaleString("vi-VN");
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function CourseImage({ course, index }: { course: Course; index: number }) {
  if (course.avatarUrl) {
    return <img src={course.avatarUrl} alt={course.title} className="h-full w-full object-cover" />;
  }

  const gradients = [
    "from-orange-100 to-amber-200 text-orange-700",
    "from-blue-100 to-cyan-200 text-blue-700",
    "from-violet-100 to-fuchsia-200 text-violet-700",
  ];

  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradients[index % gradients.length]}`}>
      <BookOpen className="h-12 w-12" />
    </div>
  );
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));
  const [dashboardPath, setDashboardPath] = useState("/student");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const role = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        setDashboardPath(role === "ADMIN" ? "/admin" : role === "TEACHER" ? "/teacher" : "/student");
      } catch {
        setDashboardPath("/student");
      }
    }

    const fetchData = async () => {
      try {
        const [coursesRes, statsRes, teachersRes, feedbacksRes] = await Promise.all([
          publicApi.getCourses(),
          publicApi.getStats(),
          publicApi.getFeaturedTeachers(),
          publicApi.getFeedbacks(10),
        ]);
        setCourses(coursesRes.data);
        setStats(statsRes.data);
        setTeachers(teachersRes.data);
        setFeedbacks(feedbacksRes.data);
      } catch (err) {
        console.error("Failed to load homepage data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const featuredCourses = useMemo(() => courses.slice(0, 3), [courses]);
  const visibleTeachers = useMemo(() => teachers.slice(0, 5), [teachers]);
  const statsItems = [
    { value: formatNumber(stats?.totalUsers), label: "Người dùng", icon: Users, bg: "bg-orange-50", color: "text-orange-600" },
    { value: formatNumber(stats?.totalCourses), label: "Khóa học", icon: BookOpen, bg: "bg-blue-50", color: "text-blue-600" },
    { value: formatNumber(stats?.totalLessons), label: "Bài học", icon: GraduationCap, bg: "bg-emerald-50", color: "text-emerald-600" },
    { value: formatNumber(stats?.totalTeachers), label: "Giảng viên", icon: Headphones, bg: "bg-violet-50", color: "text-violet-600" },
  ];

  return (
    <div className="min-h-screen bg-white text-[#101828]">
      <main>
        <section className="relative overflow-hidden bg-[linear-gradient(115deg,#fff_0%,#fff7ef_54%,#fff_100%)]">
          <div className="pointer-events-none absolute left-[-120px] top-[230px] h-96 w-96 rounded-full bg-orange-100/55 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-28 h-64 w-64 bg-[radial-gradient(circle,#ffedd5_2px,transparent_2px)] [background-size:22px_22px] opacity-70" />

          <div className="mx-auto grid min-h-[430px] max-w-[1400px] items-center gap-16 px-6 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
            <div className="max-w-[610px]">
              <h1 className="text-[44px] font-black leading-[1.08] tracking-tight text-[#101828] md:text-[64px]">
                Học tập thông minh
                <span className="mt-2 block text-[#ff4f12]">Kiến tạo tương lai</span>
              </h1>
              <p className="mt-6 max-w-[560px] text-lg font-medium leading-8 text-slate-600">
                EduSmart mang đến trải nghiệm học tập trực tuyến hiện đại, hiệu quả và đầy cảm hứng cho học sinh mọi lứa tuổi.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link to="/courses" className="inline-flex h-14 items-center gap-3 rounded-xl bg-[#ff4f12] px-7 text-sm font-black text-white shadow-xl shadow-orange-500/20 transition hover:bg-[#ea460d]">
                  Khám phá khóa học <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/about" className="inline-flex h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white px-7 text-sm font-black text-[#101828] shadow-sm transition hover:bg-slate-50">
                  Xem demo <Play className="h-4 w-4 fill-[#101828]" />
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-5">
                {visibleTeachers.length > 0 && (
                  <div className="flex -space-x-3">
                    {visibleTeachers.map((teacher) => (
                      <div key={teacher.id} className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-orange-100 text-xs font-black text-orange-700 shadow-sm">
                        {teacher.avatarUrl ? <img src={teacher.avatarUrl} alt={teacher.fullName} className="h-full w-full object-cover" /> : getInitials(teacher.fullName)}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm font-semibold leading-6 text-slate-500">
                  <span className="font-black text-[#ff4f12]">{formatNumber(stats?.totalUsers)}</span> người dùng
                  <br />
                  đang học tập và phát triển trên EduSmart
                </p>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[650px]">
              <img
                src="/assets/home-hero-student.png"
                alt="Học sinh học trực tuyến cùng EduSmart"
                className="aspect-[1.8/1] w-full rounded-[22px] object-cover shadow-2xl shadow-slate-300/50"
              />
              <div className="absolute left-[-74px] top-14 hidden w-60 rounded-2xl border border-slate-100 bg-white/95 p-6 shadow-2xl shadow-slate-300/50 backdrop-blur lg:block">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-[#ff4f12]">
                    <Users className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-3xl font-black tracking-tight">{formatNumber(stats?.totalUsers)}</p>
                    <p className="text-sm font-semibold text-slate-500">Người dùng trong hệ thống</p>
                  </div>
                </div>
                <svg viewBox="0 0 210 50" className="mt-4 h-12 w-full text-[#ff4f12]" aria-hidden="true">
                  <path d="M2 38 C28 20 48 38 72 27 C96 16 114 34 140 21 C166 8 184 18 208 5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <div className="mb-10 flex flex-col md:flex-row items-end justify-between gap-4">
              <div className="max-w-[600px]">
                <h2 className="text-[40px] font-black tracking-tight text-[#101828] leading-tight">Khóa học nổi bật</h2>
                <p className="mt-4 text-lg font-medium text-slate-500">Các khóa học được xây dựng theo lộ trình chuẩn, giúp bạn làm chủ kiến thức một cách nhanh chóng.</p>
              </div>
              <Link to="/courses" className="inline-flex items-center gap-2 rounded-xl bg-[#ff4f12]/5 px-6 py-3 text-sm font-black text-[#ff4f12] transition hover:bg-[#ff4f12]/10">
                Khám phá tất cả <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
              </div>
            ) : courses.length > 0 ? (
              <div className="custom-scrollbar -mx-6 flex gap-8 overflow-x-auto px-6 pb-10">
                {courses.map((course, index) => (
                  <Link 
                    key={course.id} 
                    to={`/course/${course.id}`} 
                    className="group min-w-[340px] w-[340px] flex-shrink-0 overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/10"
                  >
                    <div className="relative h-[220px] overflow-hidden">
                      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/20 to-transparent transition-opacity group-hover:opacity-0" />
                      <CourseImage course={course} index={index} />
                      <span className="absolute left-6 top-6 z-20 rounded-lg bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#ff4f12] backdrop-blur shadow-sm">
                        Khóa học
                      </span>
                    </div>
                    <div className="p-7">
                      <h3 className="line-clamp-2 min-h-[56px] text-xl font-black leading-7 text-[#101828] transition group-hover:text-[#ff4f12]">{course.title}</h3>
                      <p className="mt-3 line-clamp-2 min-h-[48px] text-[14px] font-medium leading-6 text-slate-500">{course.description}</p>
                      
                      <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-5">
                        <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
                           <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-orange-500" /> {course.lessonCount}</span>
                           <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-blue-500" /> {course.studentCount}</span>
                        </div>
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-[#ff4f12] transition group-hover:bg-[#ff4f12] group-hover:text-white">
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-[32px] border-2 border-dashed border-slate-200 py-24 text-center">
                <BookOpen className="mx-auto mb-6 h-12 w-12 text-slate-300" />
                <p className="text-lg font-bold text-slate-500">Chưa có khóa học công khai.</p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-[#fcfcfd] py-20">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <div className="mb-14 text-center">
              <h2 className="text-[40px] font-black tracking-tight text-[#101828]">Đội ngũ giảng viên</h2>
              <p className="mt-4 text-lg font-medium text-slate-500">Các thầy cô giỏi chuyên môn, tâm huyết với học trò.</p>
            </div>

            <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
              {visibleTeachers.map((teacher) => (
                <div key={teacher.id} className="group text-center">
                  <div className="relative mx-auto mb-5 h-32 w-32 overflow-hidden rounded-[40px] border-4 border-white bg-orange-50 shadow-xl shadow-slate-200 transition-all group-hover:rounded-[24px] group-hover:shadow-orange-500/20">
                    {teacher.avatarUrl ? (
                      <img src={teacher.avatarUrl} alt={teacher.fullName} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-black text-orange-600">
                        {getInitials(teacher.fullName)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-[#101828] group-hover:text-[#ff4f12] transition">{teacher.fullName}</h3>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">Giảng viên</p>
                  <div className="mt-3 flex items-center justify-center gap-3 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {teacher.lessonCount} bài</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {teacher.studentCount} học sinh</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-24">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
             <div className="mb-16 grid lg:grid-cols-2 gap-12 items-center">
                <div>
                   <span className="inline-block rounded-full bg-orange-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#ff4f12]">Feedback</span>
                   <h2 className="mt-6 text-[44px] font-black leading-tight tracking-tight text-[#101828]">Học viên nói gì về <span className="text-[#ff4f12]">EduSmart</span>?</h2>
                   <p className="mt-6 text-lg font-medium leading-relaxed text-slate-500">Chúng tôi tự hào khi nhận được sự tin tưởng và những phản hồi tích cực từ hàng ngàn học viên trên khắp cả nước.</p>
                   
                   <div className="mt-10 flex items-center gap-4">
                      <div className="flex -space-x-3">
                         {[1,2,3,4].map(i => (
                            <div key={i} className="h-12 w-12 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-sm">
                               <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="Student" className="h-full w-full object-cover" />
                            </div>
                         ))}
                      </div>
                      <p className="text-sm font-bold text-slate-500">Tham gia cùng <span className="font-black text-[#101828]">{formatNumber(stats?.totalUsers)}+</span> học viên khác</p>
                   </div>
                </div>

                <div className="grid gap-6">
                   {feedbacks.length > 0 ? (
                      feedbacks.slice(0, 3).map((f, i) => (
                        <div key={i} className={`rounded-[32px] p-8 shadow-xl shadow-slate-100 transition hover:shadow-2xl ${i % 2 === 0 ? 'bg-white border border-slate-100' : 'bg-[#101828] text-white'}`}>
                           <p className={`text-lg font-bold leading-relaxed ${i % 2 === 0 ? 'text-[#101828]' : 'text-slate-100'}`}>"{f.content}"</p>
                           <div className="mt-8 flex items-center gap-4">
                              <div className="h-14 w-14 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-black text-lg">
                                 {getInitials(f.userName || "Học viên")}
                              </div>
                              <div>
                                 <p className={`font-black ${i % 2 === 0 ? 'text-[#101828]' : 'text-white'}`}>{f.userName || "Học viên EduSmart"}</p>
                                 <div className="mt-1 flex gap-0.5">
                                    {[1,2,3,4,5].map(s => (
                                       <Award key={s} className={`h-3 w-3 ${s <= f.rating ? 'fill-orange-400 text-orange-400' : 'text-slate-300'}`} />
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </div>
                      ))
                   ) : (
                      <div className="rounded-[32px] bg-slate-50 border border-dashed border-slate-200 p-12 text-center">
                         <MessageSquare className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                         <p className="font-bold text-slate-500">Chưa có phản hồi nào.</p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </section>

        <section className="bg-white pb-20">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <div className="grid rounded-[32px] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 overflow-hidden">
              {statsItems.map((item) => (
                <div key={item.label} className="flex items-center justify-center gap-6 px-10 py-10 transition hover:bg-slate-50/50">
                  <span className={`flex h-16 w-16 items-center justify-center rounded-[24px] ${item.bg} ${item.color} shadow-sm`}>
                    <item.icon className="h-8 w-8" />
                  </span>
                  <div>
                    <p className="text-4xl font-black tracking-tight text-[#101828]">{item.value}</p>
                    <p className="mt-1 text-sm font-bold text-slate-500 uppercase tracking-widest">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white pb-8">
          <div className="mx-auto grid max-w-[1400px] gap-6 px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-12">
            {featureItems.map((item) => (
              <div key={item.title} className="flex items-start gap-5">
                <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}>
                  <item.icon className="h-8 w-8" />
                </span>
                <div>
                  <h3 className="text-base font-black text-[#101828]">{item.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white pb-5">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <div className="relative overflow-hidden rounded-[18px] border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-orange-50 px-9 py-6 shadow-sm">
              <div className="absolute right-8 top-0 h-full w-48 bg-[radial-gradient(circle,#fed7aa_2px,transparent_2px)] [background-size:16px_16px] opacity-70" />
              <div className="relative flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
                <div className="flex items-center gap-6">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#ff4f12] shadow-lg">
                    <GraduationCap className="h-9 w-9" />
                  </span>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight text-[#101828]">Sẵn sàng bứt phá cùng EduSmart?</h2>
                    <p className="mt-2 text-base font-medium text-slate-500">Tạo tài khoản để bắt đầu học với các khóa học đang có trong hệ thống.</p>
                  </div>
                </div>
                <Link to={isLoggedIn ? dashboardPath : "/signup"} className="inline-flex h-14 items-center gap-3 rounded-xl bg-[#ff4f12] px-8 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-[#ea460d]">
                  Đăng ký miễn phí <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white pb-4">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid gap-8 border-b border-slate-200 py-4 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
            <div>
              <Link to="/" className="flex items-center gap-2 text-xl font-black">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff4f12] text-white">
                  <GraduationCap className="h-5 w-5" />
                </span>
                Edu<span className="-ml-2 text-[#ff4f12]">Smart</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm font-medium leading-6 text-slate-500">
                Nền tảng học trực tuyến hiện đại đồng hành cùng thế hệ trẻ Việt Nam.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-black text-[#101828]">Khám phá</h4>
              <div className="mt-3 space-y-2 text-sm font-medium text-slate-500">
                <Link to="/courses" className="block hover:text-[#ff4f12]">Khóa học</Link>
                <Link to="/teachers" className="block hover:text-[#ff4f12]">Giảng viên</Link>
                <Link to="/news" className="block hover:text-[#ff4f12]">Tin tức</Link>
                <Link to="/feedback" className="block hover:text-[#ff4f12]">Feedback</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-black text-[#101828]">Hỗ trợ</h4>
              <div className="mt-3 space-y-2 text-sm font-medium text-slate-500">
                <Link to="/about" className="block hover:text-[#ff4f12]">Về chúng tôi</Link>
                <Link to="/feedback" className="block hover:text-[#ff4f12]">Liên hệ</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-black text-[#101828]">Kết nối với chúng tôi</h4>
              <div className="mt-4 flex gap-3">
                {[Facebook, Youtube, Instagram].map((Icon, index) => (
                  <span key={index} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-500">
                    <Icon className="h-4 w-4" />
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-black text-[#101828]">Dữ liệu hệ thống</h4>
              <p className="mt-3 text-sm font-medium text-slate-500">{formatNumber(stats?.totalCourses)} khóa học</p>
              <p className="mt-2 text-sm font-medium text-slate-500">{formatNumber(stats?.totalFeedbacks)} feedback</p>
            </div>
          </div>
          <p className="pt-4 text-center text-xs font-medium text-slate-400">© 2026 EduSmart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
