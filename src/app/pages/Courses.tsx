import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { BookOpen, Check, ChevronLeft, ChevronRight, Filter, Loader2, Search, SlidersHorizontal, Users, X } from "lucide-react";
import { publicApi } from "../api/publicApi";

interface Course {
  id: number;
  title: string;
  description: string;
  creatorName: string;
  lessonCount: number;
  studentCount: number;
  avatarUrl?: string | null;
}

const categories = ["Tất cả danh mục", "Sinh học tế bào", "Di truyền học", "Sinh lý học", "Sinh thái học", "Vi sinh vật", "Giải phẫu học"];
const levels = ["Cơ bản", "Trung cấp", "Nâng cao"];

function getCategory(course: Course) {
  const text = `${course.title} ${course.description}`.toLowerCase();
  if (text.includes("di truyền") || text.includes("dna") || text.includes("gen")) return "Di truyền học";
  if (text.includes("sinh thái") || text.includes("môi trường")) return "Sinh thái học";
  if (text.includes("vi sinh") || text.includes("virus") || text.includes("khuẩn")) return "Vi sinh vật";
  if (text.includes("giải phẫu") || text.includes("cơ thể") || text.includes("người")) return "Giải phẫu học";
  if (text.includes("sinh lý")) return "Sinh lý học";
  return "Sinh học tế bào";
}

function CourseThumb({ course, index }: { course: Course; index: number }) {
  if (course.avatarUrl) {
    return <img src={course.avatarUrl} alt={course.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />;
  }

  const bg = [
    "from-emerald-950 via-emerald-800 to-lime-700",
    "from-indigo-950 via-violet-900 to-fuchsia-800",
    "from-slate-950 via-cyan-900 to-slate-800",
    "from-teal-950 via-emerald-900 to-cyan-800",
  ][index % 4];

  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${bg} text-white`}>
      <BookOpen className="h-12 w-12 opacity-80" />
    </div>
  );
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả danh mục");
  const [sortBy, setSortBy] = useState("newest");

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

  const filteredCourses = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    const result = courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(normalized) ||
        course.description.toLowerCase().includes(normalized) ||
        course.creatorName.toLowerCase().includes(normalized);
      const matchesCategory = activeCategory === "Tất cả danh mục" || getCategory(course) === activeCategory;
      return matchesSearch && matchesCategory;
    });

    return [...result].sort((a, b) => {
      if (sortBy === "students") return b.studentCount - a.studentCount;
      if (sortBy === "lessons") return b.lessonCount - a.lessonCount;
      return b.id - a.id;
    });
  }, [activeCategory, courses, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-[#fbfcff] py-8">
      <div className="mx-auto grid max-w-[1500px] gap-8 px-6 lg:grid-cols-[240px_1fr] lg:px-12">
        <aside className="h-fit rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-7 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#101828]">Bộ lọc</h2>
            <Filter className="h-4 w-4 text-slate-400" />
          </div>

          <div>
            <h3 className="mb-3 text-xs font-black text-slate-500">Danh mục</h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex h-9 w-full items-center justify-between rounded-lg px-3 text-left text-xs font-bold transition ${
                    activeCategory === category ? "bg-orange-50 text-[#ff4f12]" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${activeCategory === category ? "border-[#ff4f12] bg-[#ff4f12]" : "border-slate-300"}`}>
                      {activeCategory === category && <Check className="h-2.5 w-2.5 text-white" />}
                    </span>
                    {category}
                  </span>
                  {activeCategory === category && <ChevronRight className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="mb-3 text-xs font-black text-slate-500">Cấp độ</h3>
            <div className="space-y-2">
              {levels.map((level) => (
                <label key={level} className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                  <span className="h-3.5 w-3.5 rounded border border-slate-300" />
                  {level}
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setActiveCategory("Tất cả danh mục");
              setSearchTerm("");
              setSortBy("newest");
            }}
            className="mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-black text-[#101828] transition hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
            Xóa bộ lọc
          </button>
        </aside>

        <main>
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-[#101828]">Khóa học</h1>
              <p className="mt-3 text-sm font-medium text-slate-500">
                Khám phá các khóa học Sinh học chất lượng, được thiết kế bởi chuyên gia hàng đầu.
              </p>
              <p className="mt-5 text-xs font-black text-slate-500">{filteredCourses.length} khóa học</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm khóa học..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold outline-none focus:border-orange-200 focus:ring-4 focus:ring-orange-100 sm:w-64"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-[#101828] outline-none"
              >
                <option value="newest">Sắp xếp: Mới nhất</option>
                <option value="students">Nhiều học viên</option>
                <option value="lessons">Nhiều bài học</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
            </div>
          ) : filteredCourses.length > 0 ? (
            <>
              <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                {filteredCourses.map((course, index) => (
                  <Link key={course.id} to={`/course/${course.id}`} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative h-40 overflow-hidden">
                      <CourseThumb course={course} index={index} />
                      <span className="absolute bottom-4 left-4 rounded-full bg-white px-3 py-1 text-[10px] font-black text-emerald-700 shadow-sm">
                        {getCategory(course)}
                      </span>
                    </div>
                    <div className="p-5">
                      <h2 className="line-clamp-1 text-lg font-black text-[#101828] transition group-hover:text-[#ff4f12]">{course.title}</h2>
                      <p className="mt-2 line-clamp-2 min-h-[40px] text-xs font-medium leading-5 text-slate-500">{course.description}</p>
                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 text-orange-500" />
                          {course.lessonCount} bài
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-blue-500" />
                          {course.studentCount} học viên
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-10 flex items-center justify-center gap-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {[1, 2, 3].map((page) => (
                  <button key={page} className={`h-10 w-10 rounded-xl border text-sm font-black ${page === 1 ? "border-orange-200 bg-orange-50 text-[#ff4f12]" : "border-slate-200 bg-white text-slate-500"}`}>
                    {page}
                  </button>
                ))}
                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center">
              <SlidersHorizontal className="mx-auto mb-4 h-10 w-10 text-slate-300" />
              <h2 className="text-xl font-black text-[#101828]">Không tìm thấy khóa học</h2>
              <p className="mt-2 text-sm font-medium text-slate-500">Thử đổi từ khóa hoặc bộ lọc khác.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
