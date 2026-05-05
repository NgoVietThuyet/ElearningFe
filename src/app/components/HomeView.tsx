import { Link } from "react-router";
import { ArrowRight, BookOpen, Users, Award, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

export default function HomeView() {
  const courses = [
    { id: 1, title: "Sinh học tế bào", icon: "🔬", students: 1234 },
    { id: 2, title: "Di truyền học", icon: "🧬", students: 987 },
    { id: 3, title: "Vi sinh vật", icon: "🦠", students: 765 },
    { id: 4, title: "Tiến hóa", icon: "🌱", students: 543 },
  ];

  const learningPath = [
    { step: "Nghiên cứu", icon: BookOpen, color: "orange" },
    { step: "Sáng tạo", icon: TrendingUp, color: "orange" },
    { step: "Tương tác", icon: Users, color: "orange" },
    { step: "Cải tiến", icon: Award, color: "orange" },
  ];

  const testimonials = [
    {
      name: "Nguyễn Văn A",
      role: "Học sinh lớp 12",
      content: "Nền tảng tuyệt vời giúp tôi hiểu sâu hơn về sinh học!",
      avatar: "👨‍🎓",
    },
    {
      name: "Trần Thị B",
      role: "Sinh viên Đại học",
      content: "Giáo trình rất chi tiết và dễ hiểu, giảng viên nhiệt tình.",
      avatar: "👩‍🎓",
    },
    {
      name: "Lê Văn C",
      role: "Giáo viên THPT",
      content: "Tài liệu phong phú, phù hợp cho cả giảng dạy và tự học.",
      avatar: "👨‍🏫",
    },
  ];

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-16 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
            Khám Phá Thế Giới <span className="text-orange-600">Sinh Học</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Nền tảng học trực tuyến hàng đầu với hàng trăm khóa học chất lượng cao, 
            giúp bạn chinh phục mọi kiến thức sinh học từ cơ bản đến nâng cao.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all flex items-center gap-2 shadow-lg shadow-orange-200 font-bold"
            >
              Bắt đầu ngay <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Learning Path */}
      <section className="py-16 px-8 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Lộ Trình Khám Phá
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {learningPath.map((item, index) => (
            <div key={index} className="text-center group">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <item.icon className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{item.step}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 px-8 bg-gray-50/50">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Khóa Học Nổi Bật
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-orange-300 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">{course.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{course.students} học viên</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="py-16 px-8 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Hệ Sinh Thái Số
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-orange-50 p-10 rounded-3xl border border-orange-100 hover:bg-orange-100 transition-colors">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-600 mb-6 shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Tài Nguyên Học Liệu</h3>
            <p className="text-gray-700 leading-relaxed">
              Hàng ngàn tài liệu, video bài giảng, bài tập thực hành được biên soạn bởi các
              chuyên gia hàng đầu trong lĩnh vực Sinh học.
            </p>
          </div>
          <div className="bg-orange-50 p-10 rounded-3xl border border-orange-100 hover:bg-orange-100 transition-colors">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-600 mb-6 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Chuyên Gia Hỗ Trợ</h3>
            <p className="text-gray-700 leading-relaxed">
              Đội ngũ giảng viên giàu kinh nghiệm sẵn sàng hỗ trợ bạn 24/7 trong quá trình học
              tập và giải đáp mọi thắc mắc.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-8 bg-gray-50/50">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Phản Hồi Học Viên
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="text-5xl mb-6">{testimonial.avatar}</div>
              <p className="text-gray-700 mb-6 italic leading-relaxed text-lg">"{testimonial.content}"</p>
              <div>
                <p className="font-bold text-gray-900 text-lg">{testimonial.name}</p>
                <p className="text-orange-600 font-medium">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
