import { Calendar, User, ArrowRight, Newspaper, TrendingUp } from "lucide-react";
import { Link } from "react-router";

export default function News() {
  const articles = [
    {
      id: 1,
      title: "Phát hiện loài vi khuẩn mới có khả năng phân hủy nhựa",
      summary: "Các nhà khoa học vừa công bố phát hiện chấn động về một loài vi khuẩn mới có khả năng tiêu thụ nhựa PET, mở ra hy vọng giải quyết ô nhiễm môi trường.",
      author: "Admin",
      date: "05/05/2024",
      category: "Khoa học",
      image: "🧬"
    },
    {
      id: 2,
      title: "Ứng dụng công nghệ CRISPR trong điều trị bệnh di truyền",
      summary: "Công nghệ chỉnh sửa gen CRISPR đang tiến gần hơn tới việc điều trị dứt điểm các căn bệnh di truyền quái ác ở người.",
      author: "TS. Nguyễn Sinh",
      date: "03/05/2024",
      category: "Y học",
      image: "🔬"
    },
    {
      id: 3,
      title: "Biến đổi khí hậu đang thay đổi hành vi di cư của động vật",
      summary: "Nghiên cứu mới cho thấy hàng ngàn loài đang thay đổi thói quen di cư sớm hơn 2 tuần so với thập kỷ trước do nhiệt độ tăng cao.",
      author: "Học viện Sinh thái",
      date: "01/05/2024",
      category: "Môi trường",
      image: "🌍"
    },
    {
      id: 4,
      title: "Top 5 cuốn sách sinh học bạn nhất định phải đọc",
      summary: "Từ 'Nguồn gốc các loài' đến những tác phẩm hiện đại, đây là danh sách những cuốn sách sẽ thay đổi cách bạn nhìn nhận về thế giới sống.",
      author: "Thư viện EduSmart",
      date: "28/04/2024",
      category: "Kiến thức",
      image: "📚"
    }
  ];

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
            {articles.map((article) => (
              <article key={article.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col md:flex-row">
                <div className="md:w-64 bg-orange-50 flex items-center justify-center text-6xl py-8 md:py-0">
                  {article.image}
                </div>
                <div className="p-8 flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {article.date}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-orange-600 transition-colors cursor-pointer">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {article.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      <User className="w-4 h-4" /> {article.author}
                    </div>
                    <Link to="/news" className="text-orange-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">
                      Đọc tiếp <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
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
                />
                <Newspaper className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>

            {/* Newsletter */}
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
          </div>
        </div>
      </div>
    </div>
  );
}
