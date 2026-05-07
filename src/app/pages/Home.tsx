import { Link } from "react-router";
import { ArrowRight, BookOpen, Users, Award, TrendingUp, Newspaper, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
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

const learningPath = [
  { step: "Nghiên cứu", icon: BookOpen },
  { step: "Sáng tạo", icon: TrendingUp },
  { step: "Tương tác", icon: Users },
  { step: "Cải tiến", icon: Award },
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
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Khám Phá Thế Giới <span className="text-orange-600">Sinh Học</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Nền tảng học trực tuyến hàng đầu về Sinh học với hàng trăm khóa học chất lượng cao
            </p>
            <div className="flex gap-4 justify-center">
              {!isLoggedIn && (
                <Link
                  to="/signup"
                  className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  Bắt đầu học ngay <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              <Link
                to="/student"
                className="px-8 py-3 border-2 border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
              >
                Khám phá khóa học
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Path — static */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Lộ Trình Khám Phá
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {learningPath.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-10 h-10 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{item.step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses — horizontal carousel */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              Danh Mục Khóa Học
            </h2>
            {courses.length > 0 && (
              <span className="text-sm text-gray-400">{courses.length} khóa học • Lướt để xem thêm →</span>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : courses.length === 0 ? (
            <p className="text-center text-gray-500 py-10">Chưa có khóa học nào được đăng tải.</p>
          ) : (
            <HorizontalCarousel itemWidth={272}>
              {courses.map((course, idx) => (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="flex-none w-64 bg-white p-6 rounded-xl shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all border border-gray-200 hover:border-orange-300 group cursor-pointer"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="text-5xl mb-4">{courseIcons[idx % courseIcons.length]}</div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2 min-h-[3rem]">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-3">
                    <span>{course.lessonCount} bài giảng</span>
                    <span>•</span>
                    <span>{course.studentCount} học viên</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 truncate">Giảng viên: {course.creatorName}</p>
                </Link>
              ))}
            </HorizontalCarousel>
          )}
        </div>
      </section>

      {/* Ecosystem */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Hệ Sinh Thái Số
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-orange-50 p-8 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Tài Nguyên Học Liệu</h3>
              <p className="text-gray-700">
                Hàng ngàn tài liệu, video bài giảng, bài tập thực hành được biên soạn bởi các
                chuyên gia hàng đầu
              </p>
            </div>
            <div className="bg-orange-50 p-8 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Chuyên Gia Hỗ Trợ</h3>
              <p className="text-gray-700">
                Đội ngũ giảng viên giàu kinh nghiệm sẵn sàng hỗ trợ bạn 24/7 trong quá trình học
                tập
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News — horizontal carousel */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              Tin Tức &amp; Bài Viết
            </h2>
            {news.length > 0 && (
              <span className="text-sm text-gray-400">{news.length} bài viết • Lướt để xem thêm →</span>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : news.length === 0 ? (
            <p className="text-center text-gray-500 py-10">Chưa có bài viết nào được đăng tải.</p>
          ) : (
            <HorizontalCarousel itemWidth={320}>
            {news.map((item) => (
                <Link
                  key={item.id}
                  to={`/news/${item.id}`}
                  className="flex-none w-76 bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-orange-300 hover:scale-[1.02] transition-all group cursor-pointer"
                  style={{ width: "300px", scrollSnapAlign: "start" }}
                >
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-4">
                    <Newspaper className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2 min-h-[3rem]">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3 italic">
                    "{stripHtml(item.content)}"
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                    <span className="font-medium text-gray-600">{item.authorName}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </Link>
              ))}
            </HorizontalCarousel>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="py-16 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu hành trình khám phá?</h2>
            <p className="text-xl mb-8 text-orange-100">
              Tham gia cùng hàng nghìn học viên đang học tập trên nền tảng
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-orange-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Đăng ký ngay <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
