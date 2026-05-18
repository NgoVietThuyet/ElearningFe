import { useEffect, useState } from "react";
import { Loader2, MessageSquare, Plus, Send, Star } from "lucide-react";
import { toast } from "sonner";
import { publicApi } from "../../api/publicApi";

interface CourseFeedback {
  id: number;
  courseId: number;
  teacherId: number;
  authorName: string;
  authorRole: string;
  rating: number;
  content: string;
  createdAt: string;
  replies: CourseFeedback[];
}

interface CourseFeedbackPanelProps {
  courseId: string | number;
  teacherId?: number | null;
  canWrite?: boolean;
  title?: string;
}

function getInitials(name?: string) {
  const safe = (name || "EduSmart").trim();
  const parts = safe.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function roleLabel(role?: string) {
  if (role === "TEACHER") return "Giảng viên";
  if (role === "ADMIN") return "Quản trị viên";
  return "Học viên";
}

export default function CourseFeedbackPanel({ courseId, teacherId, canWrite = true, title = "Đánh giá khóa học" }: CourseFeedbackPanelProps) {
  const [feedbacks, setFeedbacks] = useState<CourseFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<number, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  const loadFeedbacks = async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const res = await publicApi.getCourseFeedbackThread(courseId);
      setFeedbacks(res.data || []);
    } catch (err) {
      console.error("Failed to load course feedbacks", err);
      toast.error("Không thể tải đánh giá khóa học.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, [courseId]);

  const submitFeedback = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung nhận xét.");
      return;
    }

    try {
      setIsSaving(true);
      await publicApi.createFeedback({
        courseId: Number(courseId),
        teacherId: teacherId || undefined,
        rating,
        content: content.trim(),
      });
      setContent("");
      setRating(5);
      setIsFormOpen(false);
      await loadFeedbacks();
      toast.success("Đã gửi nhận xét.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể gửi nhận xét.");
    } finally {
      setIsSaving(false);
    }
  };

  const submitReply = async (feedbackId: number) => {
    const replyContent = replyDrafts[feedbackId]?.trim();
    if (!replyContent) {
      toast.error("Vui lòng nhập phản hồi.");
      return;
    }

    try {
      setReplyingId(feedbackId);
      await publicApi.createFeedbackReply(feedbackId, { content: replyContent });
      setReplyDrafts((drafts) => ({ ...drafts, [feedbackId]: "" }));
      await loadFeedbacks();
      toast.success("Đã gửi phản hồi.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể gửi phản hồi.");
    } finally {
      setReplyingId(null);
    }
  };

  return (
    <section className="rounded-[28px] border border-[#E8EDF5] bg-white p-7 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-3 text-2xl font-black text-[#0F172A]">
            <MessageSquare className="h-6 w-6 text-[#FF5A1F]" />
            {title}
          </h2>
          <p className="mt-2 text-sm font-semibold text-[#667085]">
            Toàn bộ feedback của học viên, giảng viên và quản trị viên theo thứ tự thời gian.
          </p>
        </div>
        {canWrite && (
          <button
            type="button"
            onClick={() => setIsFormOpen((value) => !value)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#FF5A1F] px-5 text-sm font-black text-white shadow-lg shadow-orange-500/20"
          >
            <Plus className="h-4 w-4" />
            Viết nhận xét
          </button>
        )}
      </div>

      {isFormOpen && canWrite && (
        <form onSubmit={submitFeedback} className="mt-6 rounded-[24px] border border-[#FFE0D2] bg-[#FFF8F3] p-5">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button type="button" key={star} onClick={() => setRating(star)} className="rounded-lg p-1 transition hover:bg-white">
                <Star className={`h-6 w-6 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
              </button>
            ))}
          </div>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="mt-4 min-h-[120px] w-full rounded-2xl border border-[#E8EDF5] bg-white px-4 py-3 text-sm font-semibold text-[#0F172A] outline-none transition focus:border-[#FF5A1F]"
            placeholder="Nhập nhận xét của bạn về khóa học..."
          />
          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsFormOpen(false)} className="h-11 rounded-xl border border-[#D8DFEA] bg-white px-5 text-sm font-black text-[#0F172A]">
              Hủy
            </button>
            <button type="submit" disabled={isSaving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FF5A1F] px-5 text-sm font-black text-white disabled:opacity-60">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Gửi nhận xét
            </button>
          </div>
        </form>
      )}

      <div className="mt-7 space-y-5">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF5A1F]" />
          </div>
        ) : feedbacks.length ? (
          feedbacks.map((item) => (
            <div key={item.id} className="rounded-[24px] border border-[#E8EDF5] bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF4EC] text-sm font-black text-[#FF5A1F]">
                  {getInitials(item.authorName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-[#0F172A]">{item.authorName}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#98A2B3]">
                        {roleLabel(item.authorRole)} · {new Date(item.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-4 w-4 ${star <= item.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 whitespace-pre-line text-sm font-medium leading-7 text-[#344054]">{item.content}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-black">
                    <button type="button" className="text-[#FF5A1F] transition hover:text-[#E84A0C]">Thích</button>
                    <button
                      type="button"
                      onClick={() => setExpandedReplies((current) => ({ ...current, [item.id]: !current[item.id] }))}
                      className="text-[#0F172A] transition hover:text-[#FF5A1F]"
                    >
                      {expandedReplies[item.id] ? "Ẩn phản hồi" : `Thêm ${item.replies.length ? `(${item.replies.length} phản hồi)` : ""}`}
                    </button>
                  </div>

                  {expandedReplies[item.id] && (
                  <div className="mt-5 space-y-3 border-l-2 border-[#FFE0D2] pl-4">
                    {item.replies.map((reply) => (
                      <div key={reply.id} className="rounded-2xl bg-[#F8FAFC] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-black text-[#FF5A1F]">
                              {getInitials(reply.authorName)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-[#0F172A]">{reply.authorName}</p>
                              <p className="text-xs font-bold text-[#98A2B3]">{new Date(reply.createdAt).toLocaleString("vi-VN")}</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black uppercase text-[#667085]">{roleLabel(reply.authorRole)}</span>
                        </div>
                        <p className="mt-3 whitespace-pre-line text-sm font-medium leading-6 text-[#344054]">{reply.content}</p>
                      </div>
                    ))}

                    {canWrite && (
                      <div className="flex gap-3 pt-2">
                        <input
                          value={replyDrafts[item.id] || ""}
                          onChange={(event) => setReplyDrafts((drafts) => ({ ...drafts, [item.id]: event.target.value }))}
                          className="h-11 min-w-0 flex-1 rounded-xl border border-[#E8EDF5] bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#FF5A1F]"
                          placeholder="Viết phản hồi..."
                        />
                        <button
                          type="button"
                          onClick={() => submitReply(item.id)}
                          disabled={replyingId === item.id}
                          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0F172A] px-4 text-sm font-black text-white disabled:opacity-60"
                        >
                          {replyingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          Gửi
                        </button>
                      </div>
                    )}
                  </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[22px] border border-dashed border-[#D8DFEA] bg-[#FBFCFE] p-10 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-[#667085]">Khóa học này chưa có feedback nào.</p>
          </div>
        )}
      </div>
    </section>
  );
}
