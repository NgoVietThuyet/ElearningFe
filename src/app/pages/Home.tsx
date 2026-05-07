import { Link } from "react-router";
import { ArrowRight, BookOpen, Users, Award, TrendingUp, Newspaper, Loader2, Zap, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { publicApi } from "../api/publicApi";
import HorizontalCarousel from "../components/HorizontalCarousel";

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

const courseIcons = ["🔬", "🧬", "🦠", "🌱", "🧫", "🧪", "🦋", "🌿", "🐛", "🌺", "🦅", "🌊"];
const courseHeaderClasses = ["course-header-0", "course-header-1", "course-header-2", "course-header-3", "course-header-4", "course-header-5"];

const learningPath = [
  { step: "Nghiên cứu", icon: BookOpen, bg: "bg-orange-50", emoji: "🔬" },
  { step: "Sáng tạo", icon: TrendingUp, bg: "bg-violet-50", emoji: "✨" },
  { step: "Tương tác", icon: Users, bg: "bg-blue-50", emoji: "🤝" },
  { step: "Cải tiến", icon: Award, bg: "bg-green-50", emoji: "🏆" },
];

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const fetchData = async () => {
      try {
        const [coursesRes, newsRes] = await Promise.all([
          publicApi.getCourses(),
          publicApi.getNews(),
        ]);
        setCourses(coursesRes.data);
        setNews(newsRes.data);
      } catch (err) {
        console.error("Failed to load homepage data", err);
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
    <div className="bg-white overflow-x-hidden">
      {/* ════════════════════════════════════════
          Hero Section
      ════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden mesh-bg">

        {/* ── DNA GIF — diagonal 30° background ── */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <img
            src="/assets/dna.gif"
            alt=""
            style={{
              width: "700px",
              transform: "rotate(-60deg)",   /* 90° - 60° = 30° from horizontal */
              opacity: 0.13,
              filter: "blur(0.6px) saturate(0.8)",
              userSelect: "none",
              position: "absolute",
              left: "50%",
              top: "50%",
              translate: "-50% -50%",
            }}
          />
        </div>

        {/* ── Background glow blobs ── */}
        <div className="absolute top-[-8%] right-[-4%] w-[480px] h-[480px] opacity-40 pointer-events-none animate-float-slow">
          <div className="w-full h-full bg-gradient-to-br from-orange-200 to-amber-200 rounded-full filter blur-[90px]" />
        </div>
        <div className="absolute bottom-[-4%] left-[-4%] w-[380px] h-[380px] opacity-30 pointer-events-none animate-float-slow" style={{ animationDelay: "3s" }}>
          <div className="w-full h-full bg-gradient-to-br from-pink-200 to-orange-200 rounded-full filter blur-[80px]" />
        </div>

        {/* ── Main hero content ── */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="text-center max-w-3xl mx-auto animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-8 border border-orange-200">
              <Zap className="w-4 h-4" />
              Nền tảng sinh học #1 Việt Nam
              <Star className="w-4 h-4 fill-orange-500" />
            </div>

            <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-6 leading-[1.05] tracking-tight">
              Khám Phá Thế Giới{" "}
              <span className="gradient-text">Sinh Học</span>
            </h1>

            <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Nền tảng học trực tuyến hàng đầu với hàng trăm khóa học chất lượng cao — học vui, học nhanh, học hiệu quả!
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              {!isLoggedIn && (
                <Link
                  to="/signup"
                  className="btn-gradient px-8 py-4 text-white rounded-2xl font-bold text-base flex items-center gap-2"
                >
                  Bắt đầu học ngay <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              <Link
                to="/courses"
                className="px-8 py-4 bg-white border-2 border-orange-200 text-orange-600 rounded-2xl font-bold text-base hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Khám phá khóa học
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center justify-center gap-10 mt-14">
              {[
                { label: "Khóa học", value: "50+" },
                { label: "Học viên", value: "2.000+" },
                { label: "Bài giảng", value: "500+" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl font-black gradient-text">{s.value}</div>
                  <div className="text-sm text-gray-500 font-semibold mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          Learning Path
      ════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
              Lộ Trình <span className="gradient-text">Khám Phá</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Bốn bước đơn giản để trở thành chuyên gia sinh học</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {learningPath.map((item, index) => (
              <div key={index} className="text-center group card-lift cursor-default">
                <div className="relative w-24 h-24 mx-auto mb-5">
                  <div className={`w-full h-full ${item.bg} rounded-3xl flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-300 shadow-sm group-hover:shadow-md`}>
                    {item.emoji}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-white font-black text-xs shadow-md">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-1">{item.step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          Featured Courses
      ════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                Danh Mục <span className="gradient-text">Khóa Học</span>
              </h2>
              {courses.length > 0 && (
                <p className="text-gray-400 mt-2 font-medium">{courses.length} khóa học · Lướt để xem thêm →</p>
              )}
            </div>
            <Link to="/courses" className="hidden md:flex items-center gap-2 px-5 py-2.5 border-2 border-orange-200 text-orange-600 rounded-xl font-bold text-sm hover:bg-orange-50 transition-all">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-9 h-9 animate-spin text-orange-500" />
            </div>
          ) : courses.length === 0 ? (
            <p className="text-center text-gray-400 py-12 font-medium">Chưa có khóa học nào được đăng tải.</p>
          ) : (
            <HorizontalCarousel itemWidth={272}>
              {courses.map((course, idx) => (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="flex-none w-64 bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-[0_20px_50px_rgba(249,115,22,0.15)] hover:-translate-y-2 transition-all duration-300 border border-gray-100 hover:border-orange-200 group cursor-pointer"
                >
                  <div className={`h-36 ${courseHeaderClasses[idx % courseHeaderClasses.length]} flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500`}>
                    {courseIcons[idx % courseIcons.length]}
                  </div>
                  <div className="p-5">
                    <h3 className="font-black text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2 min-h-[3rem] text-base">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-3 font-semibold">
                      <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-orange-400" /> {course.lessonCount} bài</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-blue-400" /> {course.studentCount}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5 truncate font-medium">{course.creatorName}</p>
                  </div>
                </Link>
              ))}
            </HorizontalCarousel>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════
          Ecosystem
      ════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">
              Hệ Sinh Thái <span className="gradient-text">Số</span>
            </h2>
            <p className="text-gray-500 text-lg">Mọi thứ bạn cần để học tập hiệu quả</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 p-10 rounded-3xl border border-orange-100 group hover:border-orange-300 transition-all duration-300 overflow-hidden card-lift">
              <div className="absolute top-4 right-4 text-5xl opacity-20 group-hover:opacity-40 transition-opacity">📚</div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-400 rounded-2xl flex items-center justify-center text-white mb-6 shadow-[0_4px_14px_rgba(249,115,22,0.4)] group-hover:scale-105 transition-transform">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black mb-3 text-gray-900">Tài Nguyên Học Liệu</h3>
              <p className="text-gray-600 leading-relaxed">
                Hàng ngàn tài liệu, video bài giảng, bài tập thực hành được biên soạn bởi các chuyên gia hàng đầu trong lĩnh vực Sinh học.
              </p>
            </div>
            <div className="relative bg-gradient-to-br from-violet-50 to-purple-50 p-10 rounded-3xl border border-violet-100 group hover:border-violet-300 transition-all duration-300 overflow-hidden card-lift">
              <div className="absolute top-4 right-4 text-5xl opacity-20 group-hover:opacity-40 transition-opacity">👨‍🏫</div>
              <div className="w-14 h-14 bg-gradient-to-br from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-[0_4px_14px_rgba(139,92,246,0.4)] group-hover:scale-105 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black mb-3 text-gray-900">Chuyên Gia Hỗ Trợ</h3>
              <p className="text-gray-600 leading-relaxed">
                Đội ngũ giảng viên giàu kinh nghiệm sẵn sàng hỗ trợ bạn 24/7 trong quá trình học tập và giải đáp mọi thắc mắc.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          Latest News
      ════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                Tin Tức &amp; <span className="gradient-text">Bài Viết</span>
              </h2>
              {news.length > 0 && (
                <p className="text-gray-400 mt-2 font-medium">{news.length} bài viết · Lướt để xem thêm →</p>
              )}
            </div>
            <Link to="/news" className="hidden md:flex items-center gap-2 px-5 py-2.5 border-2 border-orange-200 text-orange-600 rounded-xl font-bold text-sm hover:bg-orange-50 transition-all">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-9 h-9 animate-spin text-orange-500" />
            </div>
          ) : news.length === 0 ? (
            <p className="text-center text-gray-400 py-12 font-medium">Chưa có bài viết nào được đăng tải.</p>
          ) : (
            <HorizontalCarousel itemWidth={320}>
              {news.map((item) => (
                <Link
                  key={item.id}
                  to={`/news/${item.id}`}
                  className="flex-none bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-300 hover:border-orange-200 group cursor-pointer overflow-hidden"
                  style={{ width: "300px" }}
                >
                  <div className="h-2 bg-gradient-to-r from-orange-400 to-amber-400" />
                  <div className="p-6">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4">
                      <Newspaper className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2 min-h-[3.2rem] text-base">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-3 italic leading-relaxed">
                      "{stripHtml(item.content)}"
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
                      <span className="font-bold text-gray-900">{item.authorName}</span>
                      <span className="font-medium">{new Date(item.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </HorizontalCarousel>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA
      ════════════════════════════════════════ */}
      {!isLoggedIn && (
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 animate-gradient" />
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-1/3 w-64 h-64 bg-white rounded-full filter blur-[80px]" />
            <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-yellow-300 rounded-full filter blur-[100px]" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-5xl mb-6">🚀</div>
            <h2 className="text-4xl font-black mb-4 text-white tracking-tight">
              Sẵn sàng bắt đầu hành trình?
            </h2>
            <p className="text-xl mb-10 text-orange-100 max-w-lg mx-auto font-medium">
              Tham gia cùng hàng nghìn học viên đang chinh phục sinh học mỗi ngày!
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-orange-600 rounded-2xl font-black text-base hover:bg-orange-50 transition-all duration-200 shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] hover:-translate-y-1"
            >
              Đăng ký miễn phí <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
