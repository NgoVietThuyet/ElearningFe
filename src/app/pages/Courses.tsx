import { Search, Filter, BookOpen, Users, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { publicApi } from "../api/publicApi";

interface Course {
  id: number;
  title: string;
  description: string;
  creatorName: string;
  lessonCount: number;
  studentCount: number;
}

const courseIcons = ["🔬", "🧬", "🦠", "🌱", "🧫", "🧪", "🦋", "🌿", "🐛", "🌺", "🦅", "🌊"];
const headerGradients = [
  "from-orange-50 to-amber-50",
  "from-green-50 to-emerald-50",
  "from-blue-50 to-cyan-50",
  "from-violet-50 to-purple-50",
  "from-rose-50 to-pink-50",
  "from-yellow-50 to-amber-50",
];

export default function Courses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await publicApi.getCourses();
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to load courses", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.creatorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen mesh-bg py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14 text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-5 border border-orange-200">
            🔬 Kho kiến thức sinh học
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Khám Phá <span className="gradient-text">Khóa Học</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
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
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none shadow-sm transition-all duration-200 font-medium text-gray-900 placeholder:text-gray-400 hover:shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-200 rounded-2xl hover:bg-orange-50 hover:border-orange-200 transition-all duration-200 shadow-sm font-bold text-gray-700 hover:text-orange-600">
            <Filter className="w-5 h-5" />
            Bộ lọc
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">Đang tải khóa học...</p>
            </div>
          </div>
        ) : (
          <>
            {filteredCourses.length > 0 && (
              <p className="text-sm text-gray-400 font-semibold mb-6">
                Hiển thị {filteredCourses.length} khóa học
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredCourses.map((course, idx) => (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-[0_24px_60px_rgba(249,115,22,0.15)] transition-all duration-300 border border-gray-100 hover:border-orange-200 group hover:-translate-y-2"
                >
                  <div className={`h-48 bg-gradient-to-br ${headerGradients[idx % headerGradients.length]} flex items-center justify-center text-7xl group-hover:scale-105 transition-transform duration-500 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    <span className="relative z-10 group-hover:scale-110 transition-transform duration-500 inline-block">
                      {courseIcons[idx % courseIcons.length]}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-black uppercase tracking-wider border border-orange-200">
                        Khóa học
                      </span>
                      <span className="text-base font-black text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">Miễn phí</span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2 min-h-[3.5rem] leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-5 flex items-center gap-2 font-semibold">
                      <Users className="w-4 h-4 text-orange-400 shrink-0" /> {course.creatorName}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-gray-500 font-bold">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-orange-400" /> {course.lessonCount} bài
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-blue-400" /> {course.studentCount}
                        </span>
                      </div>
                      <Link
                        to={`/course/${course.id}`}
                        className="btn-gradient px-5 py-2 text-white rounded-xl text-sm font-black"
                      >
                        Học ngay
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-24">
                <div className="text-7xl mb-6 animate-float inline-block">🔍</div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Không tìm thấy khóa học nào</h3>
                <p className="text-gray-400 font-medium">Thử tìm kiếm với từ khóa khác xem sao!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
