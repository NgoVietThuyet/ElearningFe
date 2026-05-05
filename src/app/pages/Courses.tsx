import { Search, Filter, BookOpen, Users, Star, Clock } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

export default function Courses() {
  const [searchTerm, setSearchTerm] = useState("");

  const courses = [
    {
      id: 1,
      title: "Sinh học tế bào cơ bản",
      teacher: "GS. Nguyễn Văn A",
      students: 1250,
      rating: 4.8,
      duration: "12 giờ",
      image: "🔬",
      category: "Cơ bản",
      price: "Miễn phí"
    },
    {
      id: 2,
      title: "Di truyền học hiện đại",
      teacher: "TS. Trần Thị B",
      students: 850,
      rating: 4.9,
      duration: "15 giờ",
      image: "🧬",
      category: "Nâng cao",
      price: "599.000đ"
    },
    {
      id: 3,
      title: "Vi sinh vật và Đời sống",
      teacher: "ThS. Lê Văn C",
      students: 2100,
      rating: 4.7,
      duration: "10 giờ",
      image: "🦠",
      category: "Ứng dụng",
      price: "Miễn phí"
    },
    {
      id: 4,
      title: "Tiến hóa của các loài",
      teacher: "GS. Phạm Văn D",
      students: 540,
      rating: 4.6,
      duration: "20 giờ",
      image: "🌱",
      category: "Lý thuyết",
      price: "299.000đ"
    },
    {
      id: 5,
      title: "Sinh thái học môi trường",
      teacher: "TS. Hoàng Thị E",
      students: 320,
      rating: 4.5,
      duration: "18 giờ",
      image: "🌍",
      category: "Ứng dụng",
      price: "Miễn phí"
    },
    {
      id: 6,
      title: "Giải phẫu người",
      teacher: "BS. Đỗ Văn F",
      students: 1800,
      rating: 4.9,
      duration: "25 giờ",
      image: "🦴",
      category: "Y sinh",
      price: "899.000đ"
    }
  ];

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Khám Phá Khóa Học</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Học hỏi từ các chuyên gia hàng đầu và nâng cao kiến thức sinh học của bạn với các khóa học chất lượng.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Tìm kiếm khóa học hoặc giáo viên..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm font-medium">
            <Filter className="w-5 h-5 text-gray-600" />
            Bộ lọc
          </button>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="h-48 bg-orange-50 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-500">
                {course.image}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider">
                    {course.category}
                  </span>
                  <span className="text-lg font-bold text-orange-600">{course.price}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" /> {course.teacher}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {course.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {course.duration}
                    </span>
                  </div>
                  <Link 
                    to={`/student`}
                    className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-orange-600 transition-colors text-sm font-bold"
                  >
                    Học ngay
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900">Không tìm thấy khóa học nào</h3>
            <p className="text-gray-500">Thử tìm kiếm với từ khóa khác xem sao!</p>
          </div>
        )}
      </div>
    </div>
  );
}
