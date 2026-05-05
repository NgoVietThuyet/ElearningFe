import { Link } from "react-router";
import { ArrowRight, BookOpen, Users, Award, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
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
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Khám Phá Thế Giới <span className="text-orange-600">Sinh Học</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Nền tảng học trực tuyến hàng đầu về Sinh học với hàng trăm khóa học chất lượng cao
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                Bắt đầu học ngay <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/student"
                className="px-8 py-3 border-2 border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
              >
                Khám phá khóa học
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Path */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Lộ Trình Khám Phá
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {learningPath.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-10 h-10 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{item.step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Danh Mục Khóa Học Nổi Bật
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <Link
                key={course.id}
                to="/student"
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-orange-300"
              >
                <div className="text-5xl mb-4">{course.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600">{course.students} học viên</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Hệ Sinh Thái Số
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-orange-50 p-8 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Tài Nguyên Học Liệu</h3>
              <p className="text-gray-700">
                Hàng ngàn tài liệu, video bài giảng, bài tập thực hành được biên soạn bởi các
                chuyên gia hàng đầu
              </p>
            </div>
            <div className="bg-orange-50 p-8 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Chuyên Gia Hỗ Trợ</h3>
              <p className="text-gray-700">
                Đội ngũ giảng viên giàu kinh nghiệm sẵn sàng hỗ trợ bạn 24/7 trong quá trình học
                tập
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Phản Hồi Học Viên
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="py-16 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu hành trình khám phá?</h2>
            <p className="text-xl mb-8 text-orange-100">
              Tham gia cùng hàng nghìn học viên đang học tập trên nền tảng
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-orange-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Đăng ký ngay <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
