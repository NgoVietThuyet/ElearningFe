import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Microscope,
  Search,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";
import { publicApi } from "../api/publicApi";
import { studentApi } from "../api/studentApi";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { resolveMediaUrl } from "../utils/media";

interface Course {
  id: number;
  title: string;
  description?: string | null;
  creatorName?: string | null;
  teacherName?: string | null;
  lessonCount: number;
  studentCount: number;
  avatarUrl?: string | null;
  durationMinutes?: number | null;
  createdAt?: string;
}

interface Teacher {
  id: number;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  studentCount: number;
  lessonCount: number;
}

interface NewsItem {
  id: number;
  title: string;
  content?: string | null;
  avatarUrl?: string | null;
  authorName?: string | null;
  createdAt: string;
}

interface PublicStats {
  totalCourses: number;
  totalUsers: number;
  totalLessons: number;
  totalTeachers?: number;
  totalFeedbacks?: number;
}

function formatNumber(value?: number | null) {
  return (value || 0).toLocaleString("vi-VN");
}

function stripHtml(value?: string | null) {
  if (!value) return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDuration(minutes?: number | null) {
  if (!minutes || minutes <= 0) return "Đang cập nhật";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins} phút`;
  return mins ? `${hours} giờ ${mins} phút` : `${hours} giờ`;
}

function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("vi-VN");
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "ES";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function CourseImage({ course, index }: { course: Course; index: number }) {
  if (course.avatarUrl) {
    return (
      <img
        src={resolveMediaUrl(course.avatarUrl)}
        alt={course.title}
        className="h-full w-full object-cover"
      />
    );
  }

  const gradients = [
    "from-cyan-950 via-teal-700 to-emerald-500",
    "from-blue-950 via-sky-800 to-cyan-500",
    "from-violet-950 via-indigo-800 to-fuchsia-500",
    "from-emerald-950 via-green-800 to-lime-500",
  ];

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradients[index % gradients.length]}`}
    >
      <Microscope className="h-14 w-14 text-white/85" />
    </div>
  );
}

function TeacherAvatar({
  teacher,
  className = "",
}: {
  teacher: Teacher;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden bg-orange-50 text-orange-600 ${className}`}
    >
      {teacher.avatarUrl ? (
        <img
          src={resolveMediaUrl(teacher.avatarUrl)}
          alt={teacher.fullName}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-lg font-black">
          {getInitials(teacher.fullName)}
        </div>
      )}
    </div>
  );
}

function NewsImage({ item }: { item: NewsItem }) {
  if (item.avatarUrl) {
    return (
      <img
        src={resolveMediaUrl(item.avatarUrl)}
        alt={item.title}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-900 via-cyan-700 to-teal-400">
      <BookOpen className="h-8 w-8 text-white/85" />
    </div>
  );
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<number>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode<any>(token);
      const role =
        decoded.role ||
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      setUserRole(role);
      if (role === "STUDENT") {
        studentApi
          .getCourses()
          .then((res) => {
            const ids = new Set<number>((res.data || []).map((c: any) => c.id));
            setEnrolledCourseIds(ids);
          })
          .catch((err) => {
            console.error("Failed to load student courses", err);
          });
      }
    } catch (err) {
      console.error("Failed to decode token", err);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, statsRes, teachersRes, newsRes] = await Promise.all([
          publicApi.getCourses(),
          publicApi.getStats(),
          publicApi.getFeaturedTeachers(),
          publicApi.getNews(6),
        ]);

        setCourses(coursesRes.data || []);
        setStats(statsRes.data || null);
        setTeachers(teachersRes.data || []);
        setNews(newsRes.data || []);
      } catch (err) {
        console.error("Failed to load homepage data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const featuredCourses = useMemo(() => courses.slice(0, 4), [courses]);
  const featuredTeachers = useMemo(() => teachers.slice(0, 4), [teachers]);
  const featuredNews = news[0];
  const sideNews = useMemo(() => news.slice(1, 3), [news]);

  const statCards = [
    {
      label: "Giảng viên",
      value: `${formatNumber(stats?.totalTeachers)}+`,
      delta: "12%",
      icon: Users,
      tone: "bg-orange-50 text-orange-600",
    },
    {
      label: "Khóa học",
      value: `${formatNumber(stats?.totalCourses)}+`,
      delta: "8%",
      icon: BookOpen,
      tone: "bg-violet-50 text-violet-600",
    },
    {
      label: "Học viên",
      value: `${formatNumber(stats?.totalUsers)}+`,
      delta: "16%",
      icon: GraduationCap,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Đánh giá hài lòng",
      value: "98%",
      delta: "5%",
      icon: Star,
      tone: "bg-amber-50 text-amber-600",
    },
  ];

  const benefitItems = [
    {
      title: "Học mọi lúc, mọi nơi",
      text: "Truy cập bài giảng trên mọi thiết bị, học tập linh hoạt 24/7.",
      icon: Clock3,
    },
    {
      title: "Lộ trình cá nhân hóa",
      text: "Xây dựng lộ trình học phù hợp với mục tiêu và trình độ của bạn.",
      icon: Target,
    },
    {
      title: "Nội dung chuẩn học thuật",
      text: "Bài giảng được biên soạn bởi giảng viên giàu kinh nghiệm.",
      icon: Award,
    },
    {
      title: "Hỗ trợ tận tâm",
      text: "Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc của bạn.",
      icon: MessageSquare,
    },
  ];

  const learningPath = [
    {
      title: "Nghiên cứu",
      text: "Khám phá các chủ đề sinh học từ cơ bản đến nâng cao.",
      action: "Học & Tìm hiểu",
      image: "/assets/about-biology-lab.png",
      tone: "text-orange-600 bg-orange-50",
    },
    {
      title: "Sáng tạo",
      text: "Ghi chú, tóm tắt và hệ thống kiến thức theo cách của bạn.",
      action: "Ghi chú & Hệ thống",
      image: "/assets/dna.gif",
      tone: "text-violet-600 bg-violet-50",
    },
    {
      title: "Tương tác",
      text: "Tham gia thảo luận, hỏi đáp và học cùng cộng đồng.",
      action: "Thảo luận & Hỏi đáp",
      image: "/assets/home-hero-student.png",
      tone: "text-blue-600 bg-blue-50",
    },
    {
      title: "Cải tiến",
      text: "Luyện tập, kiểm tra và nâng cao kỹ năng trong học tập",
      action: "Luyện tập & Đánh giá",
      image: "/assets/about-biology-lab.png",
      tone: "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[8px] border border-slate-100 bg-gradient-to-br from-white via-[#fff7ed] to-white p-5 shadow-sm lg:p-8 xl:p-10">
          <div className="absolute inset-y-0 right-0 hidden w-[52%] bg-[radial-gradient(circle,#fed7aa_1.4px,transparent_1.4px)] opacity-35 [background-size:22px_22px] lg:block" />

          <div className="relative grid items-center gap-8 xl:grid-cols-[1.02fr_0.98fr]">
            <div className="max-w-[620px]">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-black uppercase text-amber-600">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Nền tảng học Sinh học hàng đầu
              </div>

              <h1 className="max-w-[620px] text-[38px] font-black leading-[1.08] tracking-tight text-[#0f172a] md:text-[54px]">
                Khám phá thế giới
                <span className="block text-[#ff4f12]">
                  Sinh học đầy kỳ diệu
                </span>
              </h1>

              <p className="mt-5 max-w-[560px] text-[15px] font-semibold leading-7 text-slate-600">
                Học tập dễ hiểu, trực quan và hiệu quả với đội ngũ giảng viên
                chuyên môn cao và nội dung chuẩn đại học.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to="/courses"
                  className="inline-flex h-12 items-center gap-3 rounded-[8px] bg-[#ff4f12] px-6 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-[#e9460e]"
                >
                  Khám phá khóa học <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/teachers"
                  className="inline-flex h-12 items-center rounded-[8px] border border-slate-200 bg-white px-6 text-sm font-black text-[#0f172a] shadow-sm transition hover:bg-slate-50"
                >
                  Tìm giảng viên
                </Link>
              </div>

              <div className="mt-7 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {featuredTeachers.slice(0, 4).map((teacher) => (
                    <TeacherAvatar
                      key={teacher.id}
                      teacher={teacher}
                      className="h-10 w-10 rounded-full border-2 border-white shadow-sm"
                    />
                  ))}
                  {featuredTeachers.length === 0 && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-orange-50 text-xs font-black text-orange-600">
                      ES
                    </div>
                  )}
                </div>
                <p className="text-sm font-bold leading-5 text-slate-600">
                  <span className="text-[#0f172a]">
                    {formatNumber(stats?.totalUsers)}+ học sinh
                  </span>
                  <br />
                  đang học cùng GenZBio
                </p>
              </div>
            </div>

            <div className="relative min-h-[330px]">
              <img
                src="/assets/about-biology-lab.png"
                alt="                  GenZBio Sinh học"
                className="absolute inset-0 h-full w-full rounded-[8px] object-cover object-center shadow-xl shadow-orange-100"
              />

              <div className="absolute -left-3 bottom-8 hidden rounded-[8px] bg-white/95 p-4 shadow-xl ring-1 ring-slate-100 backdrop-blur md:block">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-black">Bài giảng chất lượng</p>
                    <p className="text-xs font-bold text-slate-500">
                      {formatNumber(stats?.totalLessons)}+ bài giảng
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 top-8 hidden space-y-4 xl:block">
                <div className="flex w-56 items-center gap-3 rounded-[8px] bg-white/95 p-4 shadow-xl ring-1 ring-slate-100 backdrop-blur">
                  <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-violet-50 text-violet-600">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-black">Học tập linh hoạt</p>
                    <p className="text-xs font-bold text-slate-500">
                      Mọi lúc, mọi nơi
                    </p>
                  </div>
                </div>
                <div className="flex w-56 items-center gap-3 rounded-[8px] bg-white/95 p-4 shadow-xl ring-1 ring-slate-100 backdrop-blur">
                  <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-amber-50 text-amber-600">
                    <Target className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-black">Lộ trình cá nhân hóa</p>
                    <p className="text-xs font-bold text-slate-500">
                      Học đúng, tiến bộ nhanh
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((item) => (
            <div
              key={item.label}
              className="rounded-[8px] border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${item.tone}`}
                >
                  <item.icon className="h-7 w-7" />
                </span>
                <div>
                  <p className="text-3xl font-black tracking-tight">
                    {item.value}
                  </p>
                  <p className="text-sm font-black text-slate-700">
                    {item.label}
                  </p>
                  <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-black text-emerald-600">
                    ↑ {item.delta}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    So với tháng trước
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="relative mt-5 overflow-hidden rounded-[8px] border border-slate-100 bg-white px-5 py-10 shadow-sm lg:px-8">
          <div className="pointer-events-none absolute left-0 top-0 h-40 w-40 -translate-x-10 -translate-y-10 rounded-full bg-orange-50 blur-2xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 translate-x-12 -translate-y-8 rounded-full bg-blue-50 blur-2xl" />

          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-4 py-2 text-xs font-black uppercase text-[#ff4f12] shadow-lg shadow-orange-100/70">
              <BookOpen className="h-4 w-4" />
              Lộ trình học tập
            </div>
            <h2 className="mt-4 text-[34px] font-black leading-tight tracking-tight text-[#0f172a] md:text-[44px]">
              Lộ Trình <span className="text-[#ff4f12]">Khám Phá</span>
            </h2>
            <p className="mt-3 text-sm font-semibold text-slate-500 md:text-base">
              Bốn bước đơn giản để trở thành chuyên gia sinh học
            </p>
          </div>

          <div className="relative mt-10">
            <div className="absolute left-[10%] right-[10%] top-5 hidden border-t border-dashed border-slate-200 lg:block" />
            <div className="relative grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {learningPath.map((item, index) => {
                const content = (
                  <>
                    <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border-[6px] border-white bg-[#ff6b00] text-base font-black text-white shadow-lg shadow-orange-200 ring-1 ring-orange-100">
                      {index + 1}
                    </div>

                    <article className="rounded-[8px] border border-slate-100 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                      <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-[8px] bg-slate-50">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <h3 className="mt-5 text-lg font-black text-[#0f172a]">
                        {item.title}
                      </h3>
                      <p className="mx-auto mt-3 min-h-[44px] max-w-[210px] text-sm font-semibold leading-6 text-slate-500">
                        {item.text}
                      </p>
                      <div
                        className={`mx-auto mt-5 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black ${item.tone}`}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {item.action}
                      </div>
                    </article>
                  </>
                );

                const path =
                  index === 0
                    ? "/news"
                    : index === 1
                      ? "/learning/creative"
                      : index === 2
                        ? "/feedback"
                        : index === 3
                          ? "/learning/sketchlab"
                          : null;

                return path ? (
                  <Link key={item.title} to={path} className="relative block">
                    {content}
                  </Link>
                ) : (
                  <div key={item.title} className="relative">
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          </div>
        ) : (
          <>
            <section className="mt-5 rounded-[8px] border border-slate-100 bg-white p-5 shadow-sm lg:p-6">
              <SectionHeader title="Khóa học nổi bật" to="/courses" />

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {featuredCourses.map((course, index) => {
                  const isLocked =
                    userRole === "STUDENT" && !enrolledCourseIds.has(course.id);

                  return (
                    <Link
                      key={course.id}
                      to={`/course/${course.id}`}
                      onClick={(e) => {
                        if (isLocked) {
                          e.preventDefault();
                          toast.error("Bạn không có trong khóa học này");
                        }
                      }}
                      className="group/tooltip relative rounded-[8px] border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div
                        className={`relative h-40 overflow-hidden rounded-t-[8px] ${isLocked ? "opacity-75 grayscale-[30%]" : ""}`}
                      >
                        <CourseImage course={course} index={index} />
                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-black uppercase text-[#ff4f12] shadow-sm">
                          {index === 0
                            ? "Mới"
                            : index === 1
                              ? "Phổ biến"
                              : index === 2
                                ? "Hot"
                                : "Mới"}
                        </span>
                        {isLocked && (
                          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/80 text-white backdrop-blur-md shadow-lg border border-white/10 z-10 animate-scale-in">
                            <Lock className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="line-clamp-1 text-base font-black text-[#0f172a] transition group-hover/tooltip:text-[#ff4f12]">
                          {course.title}
                        </h3>
                        <p className="mt-2 line-clamp-1 text-sm font-semibold text-slate-500">
                          {stripHtml(course.description) ||
                            "Nền tảng kiến thức Sinh học"}
                        </p>
                        <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-500">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[10px] font-black text-orange-600">
                              {getInitials(
                                course.teacherName ||
                                  course.creatorName ||
                                  "ES",
                              )}
                            </span>
                            <span className="truncate">
                              {course.teacherName ||
                                course.creatorName ||
                                "GenZBio"}
                            </span>
                          </span>
                          <span className="flex items-center gap-1 text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-current" /> 4.9
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold">
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-600">
                            Bắt đầu
                          </span>
                          <span className="text-slate-500">
                            {formatDuration(course.durationMinutes)}
                          </span>
                        </div>
                      </div>

                      {/* Premium Tooltip */}
                      {isLocked && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover/tooltip:flex flex-col items-center z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none">
                          <div className="bg-slate-950/95 text-white text-[11px] font-black px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md border border-white/10 whitespace-nowrap tracking-wide">
                            🔒 Bạn không có trong khóa học này
                          </div>
                          <div className="w-3 h-3 -mt-1.5 rotate-45 bg-slate-950/95 border-r border-b border-white/10"></div>
                        </div>
                      )}
                    </Link>
                  );
                })}

                {featuredCourses.length === 0 && (
                  <EmptyState text="Chưa có khóa học để hiển thị." />
                )}
              </div>
            </section>

            <section className="mt-5 rounded-[8px] border border-slate-100 bg-white p-5 shadow-sm lg:p-6">
              <SectionHeader title="Giảng viên tiêu biểu" to="/teachers" />

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {featuredTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="overflow-hidden rounded-[8px] border border-slate-100 bg-white text-center shadow-sm"
                  >
                    <TeacherAvatar
                      teacher={teacher}
                      className="h-44 w-full bg-slate-50"
                    />
                    <div className="p-4">
                      <h3 className="text-base font-black">
                        {teacher.fullName}
                      </h3>
                      <p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-500">
                        {teacher.email}
                      </p>
                      <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        4.9
                        <span className="text-slate-400">
                          ({formatNumber(teacher.lessonCount)} bài giảng)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {featuredTeachers.length === 0 && (
                  <EmptyState text="Chưa có giảng viên để hiển thị." />
                )}
              </div>
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-[8px] border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black tracking-tight">
                  Học viên nói gì về GenZBio?
                </h2>
                <div className="mt-7 text-6xl font-black leading-none text-[#ff4f12]">
                  “
                </div>
                <p className="mt-1 text-sm font-semibold leading-7 text-slate-600">
                  Nội dung bài giảng dễ hiểu, trực quan và bám sát thực tế.
                  Giảng viên tận tâm, hỗ trợ rất nhiệt tình.
                </p>
                <div className="mt-7 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-sm font-black text-orange-600">
                    ES
                  </div>
                  <div>
                    <p className="text-sm font-black">Cộng đồng GenZBio</p>
                    <p className="text-xs font-semibold text-slate-500">
                      {formatNumber(stats?.totalUsers)} người dùng trong hệ
                      thống
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#ff4f12]" />
                  <span className="h-2 w-2 rounded-full bg-slate-200" />
                  <span className="h-2 w-2 rounded-full bg-slate-200" />
                  <span className="h-2 w-2 rounded-full bg-slate-200" />
                </div>
              </div>

              <div className="rounded-[8px] border border-slate-100 bg-white p-6 shadow-sm">
                <SectionHeader title="Tin tức nổi bật" to="/news" compact />

                {featuredNews ? (
                  <div className="grid gap-4">
                    {[featuredNews, ...sideNews].map((item, index) => (
                      <Link
                        key={item.id}
                        to={`/news/${item.id}`}
                        className="grid gap-4 rounded-[8px] border border-slate-100 p-3 transition hover:bg-slate-50 md:grid-cols-[130px_1fr]"
                      >
                        <div
                          className={
                            index === 0
                              ? "h-24 overflow-hidden rounded-[8px]"
                              : "h-20 overflow-hidden rounded-[8px]"
                          }
                        >
                          <NewsImage item={item} />
                        </div>
                        <div>
                          <h3 className="line-clamp-2 text-sm font-black md:text-base">
                            {item.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-500">
                            {stripHtml(item.content)}
                          </p>
                          <p className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-400">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(item.createdAt)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState text="Chưa có tin tức để hiển thị." />
                )}
              </div>
            </section>
          </>
        )}

        <section className="mt-5 grid gap-3 rounded-[8px] border border-orange-100 bg-orange-50/70 p-5 lg:grid-cols-4">
          {benefitItems.map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-white text-[#ff4f12] shadow-sm">
                <item.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-black">{item.title}</h3>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </section>

        <footer className="mt-5 rounded-[8px] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-lg font-black"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#ff4f12] text-white">
                  <GraduationCap className="h-5 w-5" />
                </span>
                GenZ<span className="-ml-2 text-[#ff4f12]">Bio</span>
              </Link>
              <p className="mt-3 max-w-xs text-sm font-semibold leading-6 text-slate-500">
                Nền tảng học Sinh học trực tuyến chất lượng cao dành cho học
                sinh, sinh viên và người yêu thích Sinh học.
              </p>
            </div>
            <FooterLinks
              title="Khám phá"
              items={[
                ["Khóa học", "/courses"],
                ["Giảng viên", "/teachers"],
                ["Tin tức", "/news"],
                ["Về chúng tôi", "/about"],
              ]}
            />
            <FooterLinks
              title="Hỗ trợ"
              items={[
                ["Trung tâm trợ giúp", "/feedback"],
                ["Hướng dẫn sử dụng", "/feedback"],
                ["Chính sách bảo mật", "/feedback"],
                ["Điều khoản sử dụng", "/feedback"],
              ]}
            />
            <div>
              <h4 className="text-sm font-black">Liên hệ</h4>
              <div className="mt-3 space-y-3 text-sm font-semibold text-slate-500">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> lethilananh26072004@gmail.com
                </p>
                <p className="flex items-center gap-2">
                  <Search className="h-4 w-4" /> 0373927212
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> TP.Hà Nội
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col justify-between gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-400 md:flex-row">
            <p>© 2026 GenZBio. Tất cả quyền được bảo lưu.</p>
            <p>Phiên bản 1.0.0</p>
          </div>
        </footer>
      </div>
    </main>
  );
}

function SectionHeader({
  title,
  to,
  compact = false,
}: {
  title: string;
  to: string;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "mb-5 flex items-center justify-between gap-4"
          : "mb-5 flex items-center justify-between gap-4"
      }
    >
      <h2 className="text-xl font-black tracking-tight">{title}</h2>
      <Link
        to={to}
        className="inline-flex items-center gap-2 text-sm font-black text-slate-600 hover:text-[#ff4f12]"
      >
        Xem tất cả <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="col-span-full rounded-[8px] border border-dashed border-slate-200 py-12 text-center text-sm font-bold text-slate-500">
      {text}
    </div>
  );
}

function FooterLinks({
  title,
  items,
}: {
  title: string;
  items: Array<[string, string]>;
}) {
  return (
    <div>
      <h4 className="text-sm font-black">{title}</h4>
      <div className="mt-3 space-y-2 text-sm font-semibold text-slate-500">
        {items.map(([label, to]) => (
          <Link key={label} to={to} className="block hover:text-[#ff4f12]">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
