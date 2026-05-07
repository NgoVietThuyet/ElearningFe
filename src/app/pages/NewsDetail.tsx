import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { publicApi } from "../api/publicApi";
import { Loader2, ArrowLeft, Calendar, User, Share2, Facebook, Twitter, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface NewsDetail {
  id: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
}

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
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, [id]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Đã sao chép liên kết!");
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy bài viết</h2>
        <Link to="/news" className="text-orange-600 font-bold hover:underline">Quay lại tin tức</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Article Header */}
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-8">
        <Link to="/news" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors mb-8 font-medium group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách tin tức
        </Link>
        
        <div className="mb-8">
          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            Tin tức khoa học
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-8">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-gray-100">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-bold">
                  {article.authorName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{article.authorName}</p>
                  <p className="text-gray-500 text-xs">Biên tập viên EduSmart</p>
                </div>
              </div>
              <div className="h-8 w-px bg-gray-100 hidden sm:block"></div>
              <div className="flex items-center gap-1 text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{new Date(article.createdAt).toLocaleDateString("vi-VN", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={copyLink} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500" title="Sao chép liên kết">
                <LinkIcon className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-blue-50 rounded-full transition-colors text-blue-600" title="Chia sẻ Facebook">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-sky-50 rounded-full transition-colors text-sky-500" title="Chia sẻ Twitter">
                <Twitter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image Placeholder (Optional, can be added if backend supports it) */}
        {/* <div className="w-full aspect-video bg-gray-100 rounded-3xl mb-12 flex items-center justify-center text-gray-400">
          Hình ảnh tiêu đề
        </div> */}

        {/* Article Body */}
        <div className="max-w-3xl mx-auto">
          <div 
            className="rich-content prose prose-orange max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Footer info */}
        <div className="max-w-3xl mx-auto mt-16 pt-8 border-t border-gray-100">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Thẻ:</span>
              <span className="px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer">Sinh học</span>
              <span className="px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer">Khoa học</span>
              <span className="px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer">Cập nhật</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Chia sẻ:</span>
              <Share2 className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
