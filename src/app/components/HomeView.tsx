import { Link } from "react-router";
import { ArrowRight, BookOpen, Users, Award, TrendingUp, Newspaper, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { publicApi } from "../api/publicApi";
import HorizontalCarousel from "./HorizontalCarousel";

interface Course {
  id: number;
  title: string;
  description: string;
  creatorName: string;
  lessonCount: number;
  studentCount: number;
}

interface NewsItem {
  id: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
}

interface HomeViewProps {
  onNavigate?: (section: any) => void;
}

const courseIcons = ["🔬", "🧬", "🦠", "🌱", "🧫", "🧪", "🦋", "🌿", "🐛", "🌺", "🦅", "🌊"];
const headerGradients = [
  "from-orange-50 to-amber-50",
  "from-green-50 to-emerald-50",
  "from-blue-50 to-cyan-50",
  "from-violet-50 to-purple-50",
  "from-rose-50 to-pink-50",
  "from-yellow-50 to-amber-50",
];

const learningPath = [
  { step: "Nghiên cứu", icon: BookOpen, emoji: "🔬", bg: "bg-orange-100", color: "text-orange-600" },
  { step: "Sáng tạo", icon: TrendingUp, emoji: "✨", bg: "bg-violet-100", color: "text-violet-600" },
  { step: "Tương tác", icon: Users, emoji: "🤝", bg: "bg-blue-100", color: "text-blue-600" },
  { step: "Cải tiến", icon: Award, emoji: "🏆", bg: "bg-green-100", color: "text-green-600" },
];

export default function HomeView({ onNavigate }: HomeViewProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, newsRes] = await Promise.all([
          publicApi.getCourses(),
          publicApi.getNews(),
        ]);
        setCourses(coursesRes.data);
        setNews(newsRes.data);
      } catch (err) {
        console.error("Failed to load dashboard home data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 py-14 px-8 overflow-hidden">
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
            width: "680px",
            transform: "rotate(-60deg)",
            opacity: 0.12,
            filter: "blur(0.5px) saturate(0.7)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full filter blur-[60px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300 rounded-full filter blur-[60px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight drop-shadow-sm">
            Khám Phá Thế Giới <span className="text-amber-200">Sinh Học</span>
          </h1>
          <p className="text-lg text-orange-100 mb-2 font-medium">
            Nền tảng học trực tuyến hàng đầu — hàng trăm khóa học chất lượng cao.
          </p>
        </div>
      </section>

      {/* Learning Path */}
      <section className="py-14 px-8 bg-white">
        <h2 className="text-2xl font-black text-center mb-10 text-gray-900 tracking-tight">
          Lộ Trình <span className="gradient-text">Khám Phá</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {learningPath.map((item, index) => (
            <div key={index} className="text-center group card-lift cursor-default">
              <div className={`relative w-20 h-20 mx-auto mb-4`}>
                <div className={`w-full h-full ${item.bg} rounded-2xl flex items-center justify-center text-3xl group-hover:scale-105 transition-transform duration-300`}>
                  {item.emoji}
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-white font-black text-[10px] shadow">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-base font-black text-gray-900">{item.step}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-14 px-8 bg-gray-50/50">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Khóa Học <span className="gradient-text">Nổi Bật</span>
          </h2>
          {courses.length > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 font-medium">{courses.length} khóa · Lướt để xem →</span>
              {onNavigate && (
                <button onClick={() => onNavigate("courses")} className="text-sm font-black text-orange-600 hover:underline">
                  Quản lý
                </button>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-14">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : courses.length === 0 ? (
          <p className="text-center text-gray-400 py-10 font-medium">Chưa có khóa học nào được đăng tải.</p>
        ) : (
          <HorizontalCarousel itemWidth={272}>
            {courses.map((course, idx) => (
              <Link
                key={course.id}
                to={`/course/${course.id}`}
                className="flex-none w-60 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-[0_12px_40px_rgba(249,115,22,0.15)] hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer"
              >
                <div className={`h-28 bg-gradient-to-br ${headerGradients[idx % headerGradients.length]} flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-500`}>
                  {courseIcons[idx % courseIcons.length]}
                </div>
                <div className="p-4">
                  <h3 className="text-base font-black text-gray-900 mb-1.5 group-hover:text-orange-600 transition-colors line-clamp-2 min-h-[3rem]">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-2 font-semibold">
                    <Users className="w-3.5 h-3.5" />
                    <span>{course.studentCount} học viên</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 truncate font-medium">{course.creatorName}</p>
                </div>
              </Link>
            ))}
          </HorizontalCarousel>
        )}
      </section>

      {/* Ecosystem Section */}
      <section className="py-14 px-8 bg-white">
        <h2 className="text-2xl font-black text-center mb-10 text-gray-900 tracking-tight">
          Hệ Sinh Thái <span className="gradient-text">Số</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-3xl border border-orange-100 hover:border-orange-300 transition-all duration-300 group card-lift overflow-hidden">
            <div className="absolute top-3 right-4 text-4xl opacity-20 group-hover:opacity-40 transition-opacity">📚</div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-2xl flex items-center justify-center text-white mb-5 shadow-md group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black mb-3 text-gray-900">Tài Nguyên Học Liệu</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Hàng ngàn tài liệu, video bài giảng, bài tập thực hành được biên soạn bởi các chuyên gia hàng đầu.
            </p>
          </div>
          <div className="relative bg-gradient-to-br from-violet-50 to-purple-50 p-8 rounded-3xl border border-violet-100 hover:border-violet-300 transition-all duration-300 group card-lift overflow-hidden">
            <div className="absolute top-3 right-4 text-4xl opacity-20 group-hover:opacity-40 transition-opacity">👨‍🏫</div>
            <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center text-white mb-5 shadow-md group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black mb-3 text-gray-900">Chuyên Gia Hỗ Trợ</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Đội ngũ giảng viên giàu kinh nghiệm sẵn sàng hỗ trợ bạn 24/7 trong quá trình học tập.
            </p>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-14 px-8 bg-gray-50/50">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Tin Tức &amp; <span className="gradient-text">Bài Viết</span>
          </h2>
          {news.length > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 font-medium">{news.length} bài · Lướt →</span>
              {onNavigate && (
                <button onClick={() => onNavigate("news")} className="text-sm font-black text-orange-600 hover:underline">
                  Quản lý
                </button>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-14">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : news.length === 0 ? (
          <p className="text-center text-gray-400 py-10 font-medium">Chưa có bài viết nào được đăng tải.</p>
        ) : (
          <HorizontalCarousel itemWidth={300}>
            {news.map((item) => (
              <Link
                key={item.id}
                to={`/news/${item.id}`}
                className="flex-none bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 hover:border-orange-200 group cursor-pointer overflow-hidden"
                style={{ width: "280px" }}
              >
                <div className="h-1.5 bg-gradient-to-r from-orange-400 to-amber-400" />
                <div className="p-5">
                  <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4">
                    <Newspaper className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2 min-h-[3rem] text-sm">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-xs mb-3 line-clamp-3 italic leading-relaxed">
                    "{stripHtml(item.content)}"
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                    <span className="font-bold text-gray-800">{item.authorName}</span>
                    <span className="font-medium">{new Date(item.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
              </Link>
            ))}
          </HorizontalCarousel>
        )}
      </section>
    </div>
  );
}
