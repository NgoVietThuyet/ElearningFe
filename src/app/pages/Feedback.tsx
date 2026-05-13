import { useEffect, useMemo, useState } from "react";
import { Home, Loader2, Star, Users, ShieldCheck } from "lucide-react";
import { publicApi } from "../api/publicApi";

interface FeedbackItem {
  id: number;
  courseTitle: string;
  teacherName: string;
  studentName: string;
  rating: number;
  content: string;
  createdAt: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await publicApi.getFeedbacks(100);
        setFeedbacks(res.data);
      } catch (err) {
        console.error("Failed to load feedbacks", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const averageRating = useMemo(() => {
    if (feedbacks.length === 0) return 0;
    return feedbacks.reduce((sum, item) => sum + item.rating, 0) / feedbacks.length;
  }, [feedbacks]);

  const satisfaction = Math.round((averageRating / 5) * 100);
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = feedbacks.filter((item) => item.rating === star).length;
    const percentage = feedbacks.length ? Math.round((count / feedbacks.length) * 100) : 0;
    return { star, count, percentage };
  });

  return (
    <div className="min-h-screen bg-[#fbfcff] py-9">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-12">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-[#101828]">Feedback từ học viên</h1>
            <p className="mt-3 text-sm font-medium text-slate-500">Những chia sẻ chân thực từ học viên đã học tập tại EduSmart.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Home className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-black text-[#101828]">{satisfaction}%</p>
                <p className="text-xs font-bold text-slate-500">Hài lòng</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-green-600">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-black text-[#101828]">{feedbacks.length}</p>
                <p className="text-xs font-bold text-slate-500">Đánh giá</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                <Star className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-black text-[#101828]">{averageRating.toFixed(1)}/5</p>
                <p className="text-xs font-bold text-slate-500">Đánh giá trung bình</p>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          </div>
        ) : feedbacks.length > 0 ? (
          <div className="grid gap-7 lg:grid-cols-[320px_1fr]">
            <aside className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-[#101828]">{averageRating.toFixed(1)}</span>
                  <span className="mb-2 text-xl font-black text-slate-500">/5</span>
                </div>
                <div className="mt-3 flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`h-6 w-6 ${star <= Math.round(averageRating) ? "fill-current" : ""}`} />
                  ))}
                </div>
                <p className="mt-3 text-xs font-bold text-slate-500">Dựa trên {feedbacks.length} đánh giá</p>
              </div>

              <div className="space-y-3">
                {distribution.map((item) => (
                  <div key={item.star} className="grid grid-cols-[42px_1fr_42px] items-center gap-3 text-xs font-bold text-slate-500">
                    <span>{item.star} sao</span>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-[#ff4f12]" style={{ width: `${item.percentage}%` }} />
                    </div>
                    <span className="text-right">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </aside>

            <div className="grid gap-6 md:grid-cols-2">
              {feedbacks.slice(0, 8).map((item, index) => (
                <article key={item.id} className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <p className="min-h-[92px] text-sm font-semibold leading-7 text-[#101828]">“{item.content}”</p>
                  <div className="mt-6 flex items-center gap-4 border-t border-slate-100 pt-5">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-black text-white ${index % 2 ? "bg-emerald-500" : "bg-slate-700"}`}>
                      {getInitials(item.studentName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-black text-[#101828]">{item.studentName}</h3>
                      <p className="truncate text-xs font-medium text-slate-500">{item.courseTitle}</p>
                      <div className="mt-1 flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`h-3.5 w-3.5 ${star <= item.rating ? "fill-current" : ""}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center">
            <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-slate-300" />
            <h2 className="text-xl font-black text-[#101828]">Chưa có đánh giá</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">Các feedback mới sẽ được hiển thị tại đây.</p>
          </div>
        )}

        {feedbacks.length > 8 && (
          <div className="mt-9 text-center">
            <button className="h-12 rounded-xl border border-orange-200 px-10 text-sm font-black text-[#ff4f12] transition hover:bg-orange-50">
              Xem tất cả đánh giá
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
