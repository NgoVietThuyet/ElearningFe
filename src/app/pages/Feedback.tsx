import { MessageSquare, Star, Send, User, BookOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const myFeedbacks = [
    {
      id: 1,
      course: "Sinh học tế bào cơ bản",
      content: "Bài giảng rất dễ hiểu, thầy giáo nhiệt tình hỗ trợ giải đáp thắc mắc.",
      rating: 5,
      date: "01/05/2024",
      status: "Đã phản hồi"
    },
    {
      id: 2,
      course: "Di truyền học hiện đại",
      content: "Nội dung hơi nặng so với người mới bắt đầu, hy vọng có thêm nhiều ví dụ thực tế.",
      rating: 4,
      date: "25/04/2024",
      status: "Đang xem xét"
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Cảm ơn bạn đã gửi phản hồi! Chúng tôi sẽ ghi nhận ý kiến của bạn.");
  };

  return (
    <div className="min-h-screen py-12" style={{ background: "linear-gradient(160deg, #fff7ed 0%, #fff 50%, #f0f9ff 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-3 block">Y kien cua ban</span>
          <h1 className="text-5xl font-black text-gray-900 mb-3">Gui Phan Hoi</h1>
          <p className="text-gray-500 text-lg max-w-xl">
            Y kien cua ban giup chung toi cai thien chat luong giang day va dich vu tot hon moi ngay.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Feedback Form */}
          <div>
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Chon khoa hoc can phan hoi</label>
                <div className="relative">
                  <select className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 outline-none appearance-none font-medium text-sm transition-all hover:bg-white focus:bg-white">
                    <option>Sinh hoc te bao co ban</option>
                    <option>Di truyen hoc hien dai</option>
                    <option>Vi sinh vat va Doi song</option>
                  </select>
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Danh gia cua ban</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="p-1 transition-transform hover:scale-125 active:scale-95"
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setRating(star)}
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          (hover || rating) >= star
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Noi dung gop y</label>
                <textarea
                  rows={5}
                  placeholder="Chia se trai nghiem cua ban ve khoa hoc nay..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 outline-none transition-all resize-none text-sm hover:bg-white focus:bg-white"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-4 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300"
                style={{ background: "linear-gradient(135deg, #f97316, #dc2626)" }}
              >
                Gui phan hoi ngay <Send className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Previous Feedbacks */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Lich Su Phan Hoi</h2>
              <p className="text-gray-500 text-sm">Nhung dong gop truoc day cua ban cho EduSmart.</p>
            </div>

            <div className="space-y-5">
              {myFeedbacks.map((item) => (
                <div key={item.id} className="group bg-white rounded-3xl border border-gray-100 p-6 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                        style={{ background: "linear-gradient(135deg, #dbeafe, #bfdbfe)" }}>
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-sm group-hover:text-orange-600 transition-colors">{item.course}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                      item.status === "Đã phản hồi" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-600"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < item.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                  <p className="text-gray-500 text-sm italic leading-relaxed">
                    "{item.content}"
                  </p>
                </div>
              ))}
            </div>

            {/* Support Info */}
            <div className="mt-6 p-6 rounded-3xl border border-blue-100"
              style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)" }}>
              <h4 className="font-black text-blue-900 mb-2 flex items-center gap-2 text-sm">
                <User className="w-4 h-4" /> Ban can ho tro truc tiep?
              </h4>
              <p className="text-blue-700 text-sm">
                Neu ban co van de khan cap ve tai khoan hoac thanh toan, vui long lien he hotline:
                <strong className="ml-1">1900 123 456</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
