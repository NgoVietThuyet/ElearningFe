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

const learningPath = [
  { step: "Nghiên cứu", icon: BookOpen },
  { step: "Sáng tạo", icon: TrendingUp },
  { step: "Tương tác", icon: Users },
  { step: "Cải tiến", icon: Award },
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
      <section className="bg-gradient-to-br from-orange-50 to-white py-16 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
            Khám Phá Thế Giới <span className="text-orange-600">Sinh Học</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Nền tảng học trực tuyến hàng đầu với hàng trăm khóa học chất lượng cao, 
            giúp bạn chinh phục mọi kiến thức sinh học từ cơ bản đến nâng cao.
          </p>
        </div>
      </section>

      {/* Learning Path */}
      <section className="py-16 px-8 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Lộ Trình Khám Phá
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {learningPath.map((item, index) => (
            <div key={index} className="text-center group">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <item.icon className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{item.step}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 px-8 bg-gray-50/50">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Khóa Học Nổi Bật</h2>
          {courses.length > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">{courses.length} khóa học • Lướt để xem thêm →</span>
              {onNavigate && (
                <button onClick={() => onNavigate("courses")} className="text-sm font-bold text-orange-600 hover:underline">Quản lý</button>
              )}
            </div>
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
                className="flex-none w-64 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-orange-300 hover:shadow-xl hover:scale-[1.02] transition-all group cursor-pointer"
              >
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{courseIcons[idx % courseIcons.length]}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2 min-h-[3.5rem]">{course.title}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-4">
                  <Users className="w-4 h-4" />
                  <span>{course.studentCount} học viên</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 truncate">Giảng viên: {course.creatorName}</p>
              </Link>
            ))}
          </HorizontalCarousel>
        )}
      </section>

      {/* Ecosystem Section */}
      <section className="py-16 px-8 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Hệ Sinh Thái Số
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-orange-50 p-10 rounded-3xl border border-orange-100 hover:bg-orange-100 transition-colors">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-600 mb-6 shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Tài Nguyên Học Liệu</h3>
            <p className="text-gray-700 leading-relaxed">
              Hàng ngàn tài liệu, video bài giảng, bài tập thực hành được biên soạn bởi các
              chuyên gia hàng đầu trong lĩnh vực Sinh học.
            </p>
          </div>
          <div className="bg-orange-50 p-10 rounded-3xl border border-orange-100 hover:bg-orange-100 transition-colors">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-600 mb-6 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Chuyên Gia Hỗ Trợ</h3>
            <p className="text-gray-700 leading-relaxed">
              Đội ngũ giảng viên giàu kinh nghiệm sẵn sàng hỗ trợ bạn 24/7 trong quá trình học
              tập và giải đáp mọi thắc mắc.
            </p>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-16 px-8 bg-gray-50/50">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Tin Tức &amp; Bài Viết</h2>
          {news.length > 0 && (
             <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">{news.length} bài viết • Lướt để xem thêm →</span>
              {onNavigate && (
                <button onClick={() => onNavigate("news")} className="text-sm font-bold text-orange-600 hover:underline">Quản lý</button>
              )}
            </div>
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
                className="flex-none w-76 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-200 hover:scale-[1.02] transition-all group cursor-pointer"
                style={{ width: "300px" }}
              >
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-4">
                  <Newspaper className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 italic leading-relaxed">
                  "{stripHtml(item.content)}"
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-50">
                  <span className="font-bold text-gray-900">{item.authorName}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
              </Link>
            ))}
          </HorizontalCarousel>
        )}
      </section>
    </div>
  );
}
