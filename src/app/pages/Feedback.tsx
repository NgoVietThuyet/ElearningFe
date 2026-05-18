import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Filter, Loader2, MessageSquare, ShieldCheck, Star, ThumbsUp } from "lucide-react";
import { publicApi } from "../api/publicApi";

interface FeedbackItem {
  id: number;
  courseId: number;
  courseTitle: string;
  authorName: string;
  authorRole: string;
  rating: number;
  content: string;
  createdAt: string;
  replies: FeedbackItem[];
}

interface CourseOption {
  id: number;
  title: string;
}

function getInitials(name?: string) {
  const safe = (name || "GenZBio").trim();
  const parts = safe.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function roleLabel(role?: string) {
  if (role === "TEACHER") return "Giảng viên";
  if (role === "ADMIN") return "Quản trị viên";
  return "Học viên";
}

function inTimeRange(value: string, range: string) {
  if (range === "all") return true;
  const created = new Date(value).getTime();
  if (Number.isNaN(created)) return true;
  const now = Date.now();
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return now - created <= days * 24 * 60 * 60 * 1000;
}

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [courseFilter, setCourseFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [expandedReplies, setExpandedReplies] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedbackRes, courseRes] = await Promise.all([
          publicApi.getFeedbackThread(),
          publicApi.getCourses(),
        ]);
        setFeedbacks(feedbackRes.data || []);
        setCourses((courseRes.data || []).map((course: any) => ({ id: course.id, title: course.title })));
      } catch (err) {
        console.error("Failed to load feedbacks", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((item) => {
      const matchesCourse = courseFilter === "all" || Number(item.courseId) === Number(courseFilter);
      const matchesTime = inTimeRange(item.createdAt, timeFilter);
      return matchesCourse && matchesTime;
    });
  }, [courseFilter, feedbacks, timeFilter]);

  const averageRating = useMemo(() => {
    if (filteredFeedbacks.length === 0) return 0;
    return filteredFeedbacks.reduce((sum, item) => sum + item.rating, 0) / filteredFeedbacks.length;
  }, [filteredFeedbacks]);

  const replyCount = filteredFeedbacks.reduce((total, item) => total + item.replies.length, 0);

  return (
    <div className="min-h-screen bg-[#FBFCFF] py-9">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-12">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FF5A1F]">Cộng đồng GenZBio</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-[#101828]">Feedback từ học viên</h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              Toàn bộ đánh giá và phản hồi về các khóa học trong hệ thống, có thể lọc theo thời gian và khóa học.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
              <p className="text-2xl font-black text-[#101828]">{filteredFeedbacks.length}</p>
              <p className="text-xs font-bold text-slate-500">Đánh giá</p>
            </div>
            <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
              <p className="text-2xl font-black text-[#101828]">{replyCount}</p>
              <p className="text-xs font-bold text-slate-500">Phản hồi</p>
            </div>
            <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
              <p className="text-2xl font-black text-[#101828]">{averageRating.toFixed(1)}/5</p>
              <p className="text-xs font-bold text-slate-500">Trung bình</p>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm lg:grid-cols-[1fr_260px_220px]">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4EC] text-[#FF5A1F]">
              <Filter className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-black text-[#101828]">Bộ lọc feedback</p>
              <p className="text-xs font-semibold text-slate-500">Lọc danh sách theo khóa học và thời gian tạo.</p>
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">Khóa học</span>
            <select
              value={courseFilter}
              onChange={(event) => setCourseFilter(event.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#101828] outline-none focus:border-[#FF5A1F]"
            >
              <option value="all">Tất cả khóa học</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">Thời gian</span>
            <select
              value={timeFilter}
              onChange={(event) => setTimeFilter(event.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#101828] outline-none focus:border-[#FF5A1F]"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="7d">7 ngày gần đây</option>
              <option value="30d">30 ngày gần đây</option>
              <option value="90d">90 ngày gần đây</option>
            </select>
          </label>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-[#FF5A1F]" />
          </div>
        ) : filteredFeedbacks.length > 0 ? (
          <div className="space-y-5">
            {filteredFeedbacks.map((item) => {
              const isExpanded = !!expandedReplies[item.id];
              return (
                <article key={item.id} className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF4EC] text-sm font-black text-[#FF5A1F]">
                      {getInitials(item.authorName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="font-black text-[#101828]">{item.authorName}</h3>
                          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                            {roleLabel(item.authorRole)} · {item.courseTitle} · {new Date(item.createdAt).toLocaleString("vi-VN")}
                          </p>
                        </div>
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`h-4 w-4 ${star <= item.rating ? "fill-current" : "text-slate-200"}`} />
                          ))}
                        </div>
                      </div>

                      <p className="mt-4 whitespace-pre-line text-sm font-semibold leading-7 text-[#344054]">{item.content}</p>

                      <div className="mt-4 flex items-center gap-5 text-sm font-black">
                        <button className="inline-flex items-center gap-2 text-[#FF5A1F]">
                          <ThumbsUp className="h-4 w-4" />
                          Thích
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedReplies((current) => ({ ...current, [item.id]: !current[item.id] }))}
                          className="inline-flex items-center gap-2 text-[#101828] transition hover:text-[#FF5A1F]"
                        >
                          <MessageSquare className="h-4 w-4" />
                          {isExpanded ? "Ẩn phản hồi" : `Thêm ${item.replies.length ? `(${item.replies.length} phản hồi)` : ""}`}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="mt-5 space-y-3 border-l-2 border-[#FFE0D2] pl-4">
                          {item.replies.length ? item.replies.map((reply) => (
                            <div key={reply.id} className="rounded-2xl bg-[#F8FAFC] p-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-black text-[#FF5A1F]">
                                    {getInitials(reply.authorName)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-[#101828]">{reply.authorName}</p>
                                    <p className="text-xs font-bold text-slate-400">
                                      {roleLabel(reply.authorRole)} · {new Date(reply.createdAt).toLocaleString("vi-VN")}
                                    </p>
                                  </div>
                                </div>
                                <CalendarDays className="h-4 w-4 text-slate-300" />
                              </div>
                              <p className="mt-3 whitespace-pre-line text-sm font-medium leading-6 text-[#344054]">{reply.content}</p>
                            </div>
                          )) : (
                            <div className="rounded-2xl bg-[#F8FAFC] p-4 text-sm font-semibold text-slate-500">
                              Chưa có phản hồi cho đánh giá này.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center">
            <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-slate-300" />
            <h2 className="text-xl font-black text-[#101828]">Không có đánh giá phù hợp</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">Hãy đổi bộ lọc để xem thêm feedback.</p>
          </div>
        )}
      </div>
    </div>
  );
}
