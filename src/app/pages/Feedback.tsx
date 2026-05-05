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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Feedback Form */}
          <div>
            <div className="mb-8">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Gửi Phản Hồi</h1>
              <p className="text-xl text-gray-600">
                Ý kiến của bạn giúp chúng tôi cải thiện chất lượng giảng dạy và dịch vụ tốt hơn mỗi ngày.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Chọn khóa học cần phản hồi</label>
                <div className="relative">
                  <select className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none appearance-none font-medium">
                    <option>Sinh học tế bào cơ bản</option>
                    <option>Di truyền học hiện đại</option>
                    <option>Vi sinh vật và Đời sống</option>
                  </select>
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Đánh giá của bạn</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="p-1 transition-transform hover:scale-110"
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setRating(star)}
                    >
                      <Star 
                        className={`w-8 h-8 ${
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
                <label className="text-sm font-bold text-gray-700">Nội dung góp ý</label>
                <textarea 
                  rows={5}
                  placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
                  required
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-4 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
              >
                Gửi phản hồi ngay <Send className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Previous Feedbacks */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Lịch Sử Phản Hồi</h2>
              <p className="text-gray-600">Những đóng góp trước đây của bạn cho EduSmart.</p>
            </div>

            <div className="space-y-6">
              {myFeedbacks.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{item.course}</h4>
                        <p className="text-xs text-gray-400">{item.date}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.status === "Đã phản hồi" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < item.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm italic leading-relaxed">
                    "{item.content}"
                  </p>
                </div>
              ))}
            </div>

            {/* Support Info */}
            <div className="mt-8 p-6 bg-blue-50 rounded-3xl border border-blue-100">
              <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <User className="w-5 h-5" /> Bạn cần hỗ trợ trực tiếp?
              </h4>
              <p className="text-blue-700 text-sm">
                Nếu bạn có vấn đề khẩn cấp về tài khoản hoặc thanh toán, vui lòng liên hệ hotline: 
                <strong className="ml-1">1900 123 456</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
