import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Calendar, Clock3, Link as LinkIcon, Loader2, Newspaper, Share2, User } from "lucide-react";
import { toast } from "sonner";
import { publicApi } from "../api/publicApi";

interface NewsDetail {
  id: number;
  title: string;
  content: string;
  avatarUrl?: string | null;
  authorName: string;
  createdAt: string;
}

const stripHtml = (html: string) => {
  const element = document.createElement("div");
  element.innerHTML = html;
  return element.textContent || element.innerText || "";
};

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<NewsDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchNews = async () => {
      try {
        const res = await publicApi.getNewsById(id);
        setArticle(res.data);
      } catch (err) {
        console.error("Failed to load news detail", err);
        setArticle(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Đã sao chép liên kết bài viết.");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="h-10 w-10 animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <Newspaper className="mx-auto mb-4 h-12 w-12 text-slate-300" />
        <h2 className="mb-4 text-2xl font-black text-[#0F172A]">Không tìm thấy bài viết</h2>
        <Link to="/news" className="font-bold text-[#FF6B00] hover:underline">Quay lại tin tức</Link>
      </div>
    );
  }

  const plainText = stripHtml(article.content);
  const readingMinutes = Math.max(1, Math.ceil(plainText.split(/\s+/).filter(Boolean).length / 220));

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-16">
      <article className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/news"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#667085] shadow-sm transition hover:border-[#FF6B00]/30 hover:text-[#FF6B00]"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại tin tức
        </Link>

        <header className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
          {article.avatarUrl ? (
            <div className="aspect-[16/7] w-full overflow-hidden bg-slate-100">
              <img src={article.avatarUrl} alt={article.title} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex aspect-[16/7] w-full items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50 text-[#FF6B00]">
              <Newspaper className="h-16 w-16" />
            </div>
          )}

          <div className="px-6 py-7 sm:px-10 sm:py-9">
            <span className="mb-4 inline-flex rounded-full bg-[#FFF2EA] px-4 py-2 text-xs font-black uppercase tracking-wide text-[#FF6B00]">
              Tin tức EduSmart
            </span>
            <h1 className="max-w-4xl text-3xl font-black leading-tight text-[#0F172A] sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-5 text-sm text-[#667085]">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF2EA] font-black text-[#FF6B00]">
                  {(article.authorName || "A").charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="font-black text-[#0F172A]">{article.authorName || "EduSmart"}</p>
                  <p className="text-xs">Tác giả</p>
                </div>
              </div>
              <span className="hidden h-8 w-px bg-slate-200 sm:block" />
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(article.createdAt).toLocaleDateString("vi-VN")}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                {readingMinutes} phút đọc
              </span>
              <button
                type="button"
                onClick={copyLink}
                className="ml-auto inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 font-bold text-[#0F172A] transition hover:border-[#FF6B00]/40 hover:text-[#FF6B00]"
              >
                <LinkIcon className="h-4 w-4" />
                Sao chép link
              </button>
            </div>
          </div>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_260px]">
          <section className="rounded-[24px] border border-slate-100 bg-white px-6 py-8 shadow-sm sm:px-10">
            <div
              className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-[#0F172A] prose-p:text-[#344054] prose-a:font-bold prose-a:text-[#FF6B00] prose-img:rounded-2xl"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </section>

          <aside className="space-y-4">
            <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-black uppercase tracking-wide text-[#0F172A]">Thông tin bài viết</h2>
              <div className="space-y-4 text-sm text-[#667085]">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-[#FF6B00]" />
                  <span>{article.authorName || "EduSmart"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-[#FF6B00]" />
                  <span>{new Date(article.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock3 className="h-4 w-4 text-[#FF6B00]" />
                  <span>{readingMinutes} phút đọc</span>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-orange-100 bg-[#FFF8F3] p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#FF6B00] shadow-sm">
                <Share2 className="h-5 w-5" />
              </div>
              <p className="mb-4 text-sm font-semibold leading-6 text-[#344054]">
                Chia sẻ bài viết này để cùng lan tỏa kiến thức học tập hữu ích.
              </p>
              <button
                type="button"
                onClick={copyLink}
                className="w-full rounded-xl bg-[#FF6B00] px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/15 transition hover:bg-[#E65F00]"
              >
                Sao chép liên kết
              </button>
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}
