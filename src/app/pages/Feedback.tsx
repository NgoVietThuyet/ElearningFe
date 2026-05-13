import { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  Star, 
  Sparkles, 
  Heart, 
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { publicApi } from "../api/publicApi";

interface Course {
  id: number;
  title: string;
}

export default function Feedback() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    studentName: "",
    courseId: "",
    content: "",
    rating: 5
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await publicApi.getCourses();
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to fetch courses for feedback", err);
      }
    };
    fetchCourses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName || !formData.content) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsLoading(true);
    try {
      // Mock API call since we don't have a specific feedback endpoint in publicApi
      // But we can simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Cảm ơn bạn đã gửi phản hồi!");
      setIsSuccess(true);
      setFormData({ studentName: "", courseId: "", content: "", rating: 5 });
    } catch (err) {
      toast.error("Có lỗi xảy ra khi gửi phản hồi");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in-95 duration-500">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl flex items-center justify-center text-white shadow-2xl">
              <CheckCircle2 className="w-12 h-12" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Gửi thành công!</h2>
            <p className="text-gray-500 font-medium leading-relaxed">
              Phản hồi của bạn đã được ghi nhận. Chúng tôi luôn trân trọng những ý kiến đóng góp để cải thiện hệ thống tốt hơn.
            </p>
          </div>
          <button 
            onClick={() => setIsSuccess(false)}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl"
          >
            Gửi thêm phản hồi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        {/* Info Section */}
        <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-700">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <Sparkles className="w-3 h-3" /> Ý kiến học viên
            </div>
            <h1 className="text-5xl font-black text-gray-950 tracking-tighter leading-none mb-6">
              Chúng tôi luôn <span className="text-orange-600">lắng nghe</span> bạn
            </h1>
            <p className="text-lg text-gray-500 font-medium leading-relaxed">
              Mọi góp ý của bạn là động lực để EduSmart ngày càng hoàn thiện. Hãy chia sẻ trải nghiệm của bạn về các khóa học và dịch vụ của chúng tôi.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-start gap-5 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm card-lift">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-gray-900 mb-1">Bảo mật thông tin</h4>
                <p className="text-sm text-gray-400 font-medium">Ý kiến của bạn sẽ được gửi trực tiếp đến ban quản trị và bảo mật tuyệt đối.</p>
              </div>
            </div>
            <div className="flex items-start gap-5 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm card-lift">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shrink-0 shadow-sm">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-gray-900 mb-1">Cải thiện chất lượng</h4>
                <p className="text-sm text-gray-400 font-medium">Chúng tôi cam kết xem xét mọi phản hồi để nâng cao chất lượng giảng dạy.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-50 relative overflow-hidden animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
          
          <form onSubmit={handleSubmit} className="relative space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tên của bạn</label>
              <input 
                type="text" 
                required
                value={formData.studentName}
                onChange={e => setFormData({...formData, studentName: e.target.value})}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-900 transition-all"
                placeholder="Nhập tên của bạn..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Khóa học (Tùy chọn)</label>
              <select 
                value={formData.courseId}
                onChange={e => setFormData({...formData, courseId: e.target.value})}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-900 transition-all appearance-none"
              >
                <option value="">Chọn khóa học bạn muốn nhận xét...</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Đánh giá</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({...formData, rating: star})}
                    className={`p-2 transition-all hover:scale-110 ${formData.rating >= star ? 'text-amber-400' : 'text-gray-200'}`}
                  >
                    <Star className={`w-8 h-8 ${formData.rating >= star ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nội dung phản hồi</label>
              <textarea 
                required
                rows={4}
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-900 transition-all resize-none"
                placeholder="Chia sẻ ý kiến hoặc thắc mắc của bạn tại đây..."
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-5 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl text-base font-black uppercase tracking-widest shadow-xl shadow-orange-100 hover:shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> ĐANG GỬI...
                </>
              ) : (
                <>
                  GỬI PHẢN HỒI <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
