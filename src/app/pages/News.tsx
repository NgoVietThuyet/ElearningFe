import { Calendar, User, ArrowRight, Newspaper, TrendingUp, Loader as Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { publicApi } from "../api/publicApi";

interface NewsItem {
  id: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const fetchNews = async () => {
      try {
        const res = await publicApi.getNews();
        setNews(res.data);
      } catch (err) {
        console.error("Failed to load news", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, []);

  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.authorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Tin Tức & Sự Kiện</h1>
            <p className="text-xl text-gray-600">
              Cập nhật những thông tin mới nhất về thế giới sinh học, các nghiên cứu khoa học và hoạt động tại EduSmart.
            </p>
          </div>
          <div className="flex items-center gap-2 text-orange-600 font-bold bg-orange-50 px-4 py-2 rounded-xl">
            <TrendingUp className="w-5 h-5" />
            <span>Đang thịnh hành</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main News List */}
          <div className="lg:col-span-2 space-y-8">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="bg-white p-20 rounded-3xl text-center border border-gray-100">
                <p className="text-gray-500">Chưa có bài viết nào phù hợp.</p>
              </div>
            ) : (
              filteredNews.map((article) => (
                <article key={article.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col md:flex-row">
                  <div className="md:w-64 bg-orange-50 flex items-center justify-center text-6xl py-8 md:py-0">
                    <Newspaper className="w-16 h-16 text-orange-600" />
                  </div>
                  <div className="p-8 flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                        Khoa học
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(article.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <Link to={`/news/${article.id}`} className="text-2xl font-bold text-gray-900 mb-3 hover:text-orange-600 transition-colors cursor-pointer block">
                      {article.title}
                    </Link>
                    <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">
                      {stripHtml(article.content)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <User className="w-4 h-4" /> {article.authorName}
                      </div>
                      <Link to={`/news/${article.id}`} className="text-orange-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">
                        Đọc tiếp <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Search Box */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Tìm kiếm tin tức</h3>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Nhập từ khóa..."
                  className="w-full pl-4 pr-10 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Newspaper className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>

            {/* Newsletter - Only show if not logged in */}
            {!isLoggedIn && (
              <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-8 rounded-3xl text-white shadow-lg shadow-orange-200">
                <h3 className="text-xl font-bold mb-4">Đăng ký nhận tin</h3>
                <p className="text-orange-100 text-sm mb-6">
                  Nhận những thông báo mới nhất về các bài nghiên cứu và khóa học mới.
                </p>
                <input 
                  type="email" 
                  placeholder="Email của bạn..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl mb-4 text-white placeholder:text-white/60 focus:bg-white/20 outline-none"
                />
                <button className="w-full py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                  Đăng ký ngay
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
