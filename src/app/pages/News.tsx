import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Calendar, Loader2, Newspaper, Search, User } from "lucide-react";
import { publicApi } from "../api/publicApi";

interface NewsItem {
  id: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  avatarUrl?: string | null;
}

const tabs = ["Tất cả", "Kiến thức", "Nghiên cứu", "Học tập", "Sự kiện"];

function stripHtml(html: string) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function getCategory(item: NewsItem) {
  const text = `${item.title} ${stripHtml(item.content)}`.toLowerCase();
  if (text.includes("nghiên cứu") || text.includes("crispr") || text.includes("gen")) return "Nghiên cứu";
  if (text.includes("học") || text.includes("phương pháp")) return "Học tập";
  if (text.includes("hội thảo") || text.includes("sự kiện")) return "Sự kiện";
  return "Kiến thức";
}

function NewsImage({ item, className = "" }: { item: NewsItem; className?: string }) {
  if (item.avatarUrl) {
    return <img src={item.avatarUrl} alt={item.title} className={`h-full w-full object-cover ${className}`} />;
  }

  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-900 via-lime-700 to-emerald-500 text-white ${className}`}>
      <Newspaper className="h-12 w-12 opacity-80" />
    </div>
  );
}

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Tất cả");

  useEffect(() => {
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

  const filteredNews = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return news.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(normalized) ||
        item.authorName.toLowerCase().includes(normalized) ||
        stripHtml(item.content).toLowerCase().includes(normalized);
      const matchesTab = activeTab === "Tất cả" || getCategory(item) === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [activeTab, news, searchTerm]);

  const featured = filteredNews[0];
  const sideNews = filteredNews.slice(1, 4);
  const bottomNews = filteredNews.slice(4, 8);

  return (
    <div className="min-h-screen bg-[#fbfcff] py-9">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-12">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-[#101828]">Tin tức</h1>
            <p className="mt-3 text-sm font-medium text-slate-500">
              Cập nhật những kiến thức Sinh học mới nhất và các thông tin giáo dục hữu ích.
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold outline-none focus:border-orange-200 focus:ring-4 focus:ring-orange-100 md:w-80"
            />
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-10 rounded-xl px-5 text-xs font-black transition ${
                activeTab === tab ? "bg-[#ff4f12] text-white shadow-lg shadow-orange-500/20" : "bg-transparent text-slate-500 hover:bg-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          </div>
        ) : featured ? (
          <>
            <div className="grid gap-7 lg:grid-cols-[1fr_430px]">
              <Link to={`/news/${featured.id}`} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-xl">
                <div className="relative h-[330px] overflow-hidden">
                  <NewsImage item={featured} className="transition duration-500 group-hover:scale-105" />
                  <span className="absolute bottom-4 left-4 rounded-full bg-white px-3 py-1 text-[10px] font-black text-violet-600 shadow-sm">
                    {getCategory(featured)}
                  </span>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-black leading-8 text-[#101828] transition group-hover:text-[#ff4f12]">{featured.title}</h2>
                  <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-slate-500">{stripHtml(featured.content)}</p>
                  <div className="mt-6 flex items-center justify-between text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {featured.authorName}
                    </span>
                    <span>{new Date(featured.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
              </Link>

              <div className="space-y-5">
                {sideNews.map((item) => (
                  <Link key={item.id} to={`/news/${item.id}`} className="grid grid-cols-[145px_1fr] overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <div className="h-28 overflow-hidden rounded-xl">
                      <NewsImage item={item} />
                    </div>
                    <div className="px-4 py-1">
                      <span className="rounded-full bg-orange-50 px-2 py-1 text-[10px] font-black text-[#ff4f12]">{getCategory(item)}</span>
                      <h3 className="mt-3 line-clamp-2 text-sm font-black leading-5 text-[#101828]">{item.title}</h3>
                      <p className="mt-2 text-xs font-bold text-slate-400">{new Date(item.createdAt).toLocaleDateString("vi-VN")}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-10 flex items-center justify-between">
              <h2 className="text-xl font-black text-[#101828]">Bài viết nổi bật</h2>
              <Link to="/news" className="flex items-center gap-2 text-xs font-black text-[#ff4f12]">
                Xem tất cả bài viết <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {(bottomNews.length > 0 ? bottomNews : filteredNews.slice(0, 4)).map((item) => (
                <Link key={item.id} to={`/news/${item.id}`} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative h-36 overflow-hidden">
                    <NewsImage item={item} />
                    <span className="absolute bottom-3 left-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-blue-600 shadow-sm">{getCategory(item)}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="line-clamp-2 min-h-[44px] text-base font-black leading-6 text-[#101828]">{item.title}</h3>
                    <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <Calendar className="h-4 w-4" />
                      {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center">
            <Newspaper className="mx-auto mb-4 h-10 w-10 text-slate-300" />
            <h2 className="text-xl font-black text-[#101828]">Chưa có bài viết</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">Bài viết mới sẽ được hiển thị tại đây.</p>
          </div>
        )}
      </div>
    </div>
  );
}
