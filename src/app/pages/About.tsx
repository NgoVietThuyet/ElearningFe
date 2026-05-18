import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Dna,
  Facebook,
  GraduationCap,
  Heart,
  LineChart,
  Linkedin,
  Mail,
  Microscope,
  PlaySquare,
  Rocket,
  Star,
  Users,
  Video,
} from "lucide-react";
import { publicApi } from "../api/publicApi";

interface PublicStats {
  totalCourses: number;
  totalUsers: number;
  totalLessons: number;
  totalTeachers?: number;
  totalFeedbacks?: number;
}

interface Teacher {
  id: number;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  studentCount: number;
  lessonCount: number;
}

interface FeedbackItem {
  id: number;
  rating: number;
}

function formatNumber(value?: number) {
  if (!value) return "0";
  return value.toLocaleString("vi-VN");
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function About() {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, teachersRes, feedbackRes] = await Promise.all([
          publicApi.getStats(),
          publicApi.getFeaturedTeachers(),
          publicApi.getFeedbacks(200),
        ]);
        setStats(statsRes.data);
        setTeachers(teachersRes.data);
        setFeedbacks(feedbackRes.data);
      } catch (err) {
        console.error("Failed to load about data", err);
      }
    };

    fetchData();
  }, []);

  const satisfaction = useMemo(() => {
    if (feedbacks.length === 0) return 0;
    const avg = feedbacks.reduce((sum, item) => sum + item.rating, 0) / feedbacks.length;
    return Math.round((avg / 5) * 100);
  }, [feedbacks]);

  const statItems = [
    {
      label: "Học sinh",
      sub: "Đang học và phát triển mỗi ngày",
      value: formatNumber(stats?.totalUsers),
      icon: Users,
      bg: "bg-orange-50",
      color: "text-orange-600",
    },
    {
      label: "Khóa học",
      sub: "Đa dạng và chất lượng",
      value: formatNumber(stats?.totalCourses),
      icon: BookOpen,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      label: "Bài giảng",
      sub: "Video chất lượng cao",
      value: formatNumber(stats?.totalLessons),
      icon: Video,
      bg: "bg-emerald-50",
      color: "text-emerald-600",
    },
    {
      label: "Hài lòng",
      sub: "Từ cộng đồng học sinh",
      value: `${satisfaction}%`,
      icon: Star,
      bg: "bg-violet-50",
      color: "text-violet-600",
    },
  ];

  const strengths = [
    {
      title: "Kiến thức chuẩn xác",
      text: "Nội dung được biên soạn bởi đội ngũ chuyên gia và giảng viên hàng đầu.",
      icon: BookOpen,
    },
    {
      title: "Học tập linh hoạt",
      text: "Học mọi lúc, mọi nơi với hệ thống bài giảng, bài tập và kiểm tra thông minh.",
      icon: PlaySquare,
    },
    {
      title: "Hiệu quả vượt trội",
      text: "Lộ trình cá nhân hóa giúp học sinh tiến bộ rõ rệt theo từng giai đoạn.",
      icon: LineChart,
    },
  ];

  const missionItems = [
    {
      title: "Chất lượng",
      text: "Nội dung học kiểm soát chặt chẽ, chuẩn khoa học và phù hợp với chương trình học.",
      icon: GraduationCap,
      color: "text-orange-600",
    },
    {
      title: "Tận tâm",
      text: "Luôn đồng hành và hỗ trợ học sinh trên hành trình chinh phục kiến thức Sinh học.",
      icon: Heart,
      color: "text-blue-600",
    },
    {
      title: "Sáng tạo",
      text: "Ứng dụng công nghệ hiện đại, mô phỏng 3D, quiz tương tác giúp việc học thú vị hơn.",
      icon: Rocket,
      color: "text-emerald-600",
    },
    {
      title: "Kết nối",
      text: "Xây dựng cộng đồng yêu Sinh học, chia sẻ kiến thức và truyền cảm hứng học tập.",
      icon: Dna,
      color: "text-violet-600",
    },
  ];

  const trustedBy = [
    "Đại học Quốc gia Hà Nội",
    "Đại học Sư phạm Hà Nội",
    "Trường THPT Chuyên Hà Nội",
    "Vietnam Australia International School",
    "FPT Education",
  ];

  return (
    <div className="min-h-screen bg-white text-[#101828]">
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute right-[7%] top-32 hidden text-orange-100 lg:block">
          <Dna className="h-48 w-48 rotate-12 stroke-[1.5]" />
        </div>
        <div className="pointer-events-none absolute right-[4%] top-[285px] hidden h-44 w-44 bg-[radial-gradient(circle,#fed7aa_2px,transparent_2px)] [background-size:18px_18px] opacity-70 lg:block" />

        <section className="mx-auto grid max-w-[1500px] gap-14 px-6 pb-12 pt-14 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
          <div className="max-w-[560px]">
            <p className="mb-4 text-sm font-black uppercase tracking-widest text-[#ff4f12]">Về chúng tôi</p>
            <h1 className="text-[42px] font-black leading-[1.12] tracking-tight text-[#101828] md:text-[54px]">
              GenZBio - Nền tảng học Sinh học trực tuyến hiện đại và hiệu quả
            </h1>
            <p className="mt-5 text-base font-medium leading-8 text-slate-600">
              GenZBio được xây dựng với sứ mệnh mang kiến thức Sinh học đến gần hơn với mọi học sinh, giúp các em học tập chủ động, hiểu sâu và ứng dụng hiệu quả vào cuộc sống.
            </p>

            <div className="mt-8 space-y-5">
              {strengths.map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-[#ff4f12]">
                    <item.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-[#101828]">{item.title}</h3>
                    <p className="mt-1 text-sm font-medium leading-6 text-slate-600">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[650px]">
            <img
              src="/assets/about-biology-lab.png"
              alt="Phòng thí nghiệm Sinh học GenZBio"
              className="aspect-[1.16/1] w-full rounded-3xl object-cover shadow-2xl shadow-slate-300/60"
            />
            <div className="absolute left-[-86px] top-[34%] hidden w-64 rounded-2xl border border-slate-100 bg-white p-7 shadow-2xl shadow-slate-300/60 lg:block">
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-[#ff4f12]">
                <Dna className="h-6 w-6" />
              </span>
              <h3 className="text-2xl font-black leading-8 text-[#101828]">Hiểu Sinh học Hiểu sự sống</h3>
              <p className="mt-5 text-sm font-medium leading-7 text-slate-500">
                Chúng tôi tin rằng, hiểu Sinh học là hiểu chính sự sống và thế giới xung quanh chúng ta.
              </p>
              <span className="mt-7 block h-0.5 w-10 rounded-full bg-[#ff4f12]" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1380px] px-6 lg:px-12">
          <div className="grid rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/70 md:grid-cols-4">
            {statItems.map((item) => (
              <div key={item.label} className="flex items-center gap-5 border-slate-100 px-8 py-8 md:border-r md:last:border-r-0">
                <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${item.bg} ${item.color}`}>
                  <item.icon className="h-8 w-8" />
                </span>
                <div>
                  <p className="text-3xl font-black tracking-tight text-[#101828]">{item.value}</p>
                  <p className="mt-1 text-sm font-black text-[#101828]">{item.label}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-6 py-14 lg:px-12">
          <div className="mb-8 text-center">
            <h2 className="text-lg font-black uppercase tracking-widest text-[#101828]">Sứ mệnh của chúng tôi</h2>
            <span className="mx-auto mt-3 block h-0.5 w-8 rounded-full bg-[#ff4f12]" />
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {missionItems.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-9 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <item.icon className={`mx-auto h-11 w-11 ${item.color}`} />
                <h3 className="mt-8 text-lg font-black text-[#101828]">{item.title}</h3>
                <p className="mt-4 text-sm font-medium leading-6 text-slate-500">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1380px] px-6 pb-14 lg:px-12">
          <div className="mb-8 text-center">
            <h2 className="text-lg font-black uppercase tracking-widest text-[#101828]">Đội ngũ của chúng tôi</h2>
            <span className="mx-auto mt-3 block h-0.5 w-8 rounded-full bg-[#ff4f12]" />
          </div>

          {teachers.length > 0 ? (
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-5">
              {teachers.slice(0, 5).map((teacher) => (
                <article key={teacher.id} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-orange-50 text-2xl font-black text-orange-600">
                    {teacher.avatarUrl ? <img src={teacher.avatarUrl} alt={teacher.fullName} className="h-full w-full object-cover" /> : getInitials(teacher.fullName)}
                  </div>
                  <h3 className="mt-6 text-base font-black text-[#101828]">{teacher.fullName}</h3>
                  <p className="mt-1 text-sm font-bold text-slate-500">Giảng viên Sinh học</p>
                  <p className="mx-auto mt-4 min-h-[72px] max-w-[190px] text-xs font-medium leading-6 text-slate-500">
                    {teacher.lessonCount} bài giảng, đang đồng hành cùng {teacher.studentCount} học sinh.
                  </p>
                  <div className="mt-5 flex justify-center gap-4 text-[#101828]">
                    <Facebook className="h-4 w-4" />
                    <Mail className="h-4 w-4" />
                    <Linkedin className="h-4 w-4" />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 py-14 text-center">
              <Users className="mx-auto mb-4 h-10 w-10 text-slate-300" />
              <p className="font-bold text-slate-500">Chưa có dữ liệu giảng viên.</p>
            </div>
          )}
        </section>

        <section className="mx-auto max-w-[1380px] px-6 pb-9 lg:px-12">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-black uppercase tracking-widest text-[#101828]">Được tin dùng bởi</h2>
            <span className="mx-auto mt-3 block h-0.5 w-8 rounded-full bg-[#ff4f12]" />
          </div>
          <div className="grid items-center gap-4 rounded-2xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm md:grid-cols-5">
            {trustedBy.map((name) => (
              <div key={name} className="flex items-center justify-center gap-3 text-sm font-black uppercase leading-5 text-slate-400">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <span>{name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1380px] px-6 pb-10 lg:px-12">
          <div className="relative overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 via-white to-orange-50 px-9 py-7">
            <div className="absolute right-8 top-0 h-full w-48 bg-[radial-gradient(circle,#fed7aa_2px,transparent_2px)] [background-size:16px_16px] opacity-70" />
            <div className="relative flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
              <div className="flex items-center gap-6">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#ff4f12] shadow-lg">
                  <Microscope className="h-11 w-11" />
                </span>
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-[#101828]">Sẵn sàng bắt đầu hành trình học tập cùng GenZBio?</h2>
                  <p className="mt-2 text-base font-medium text-slate-500">Tham gia ngay hôm nay để khám phá thế giới Sinh học đầy kỳ thú!</p>
                </div>
              </div>
              <Link to="/courses" className="inline-flex h-14 items-center gap-3 rounded-xl bg-[#ff4f12] px-8 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-[#ea460d]">
                Bắt đầu học ngay <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white pb-5">
        <div className="mx-auto max-w-[1380px] px-6 lg:px-12">
          <div className="grid gap-8 border-b border-slate-200 py-4 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
            <div>
              <Link to="/" className="flex items-center gap-2 text-xl font-black">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff4f12] text-white">
                  <GraduationCap className="h-5 w-5" />
                </span>
                GenZ<span className="-ml-2 text-[#ff4f12]">Bio</span>
              </Link>
              <p className="mt-3 text-sm font-medium text-slate-500">Học thông minh, tiến xa mỗi ngày</p>
            </div>
            <div>
              <h4 className="text-sm font-black text-[#101828]">Khám phá</h4>
              <div className="mt-3 space-y-2 text-sm font-medium text-slate-500">
                <Link to="/courses" className="block hover:text-[#ff4f12]">Khóa học</Link>
                <Link to="/teachers" className="block hover:text-[#ff4f12]">Giảng viên</Link>
                <Link to="/news" className="block hover:text-[#ff4f12]">Tin tức</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-black text-[#101828]">Hỗ trợ</h4>
              <div className="mt-3 space-y-2 text-sm font-medium text-slate-500">
                <Link to="/feedback" className="block hover:text-[#ff4f12]">Trung tâm trợ giúp</Link>
                <Link to="/about" className="block hover:text-[#ff4f12]">Về chúng tôi</Link>
                <Link to="/feedback" className="block hover:text-[#ff4f12]">Liên hệ</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-black text-[#101828]">Kết nối với chúng tôi</h4>
              <div className="mt-4 flex gap-3">
                {[Facebook, Mail, Linkedin].map((Icon, index) => (
                  <span key={index} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-500">
                    <Icon className="h-4 w-4" />
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-black text-[#101828]">Liên hệ</h4>
              <p className="mt-3 text-sm font-medium text-slate-500">support@genzbio.vn</p>
              <p className="mt-2 text-sm font-medium text-slate-500">1900 1234</p>
            </div>
          </div>
          <p className="pt-4 text-center text-xs font-medium text-slate-400">© 2026 GenZBio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
