import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { publicApi } from "../api/publicApi";
import { studentApi } from "../api/studentApi";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

interface Course {
  id: number;
  title: string;
  description: string;
  creatorName: string;
  teacherName?: string | null;
  lessonCount: number;
  studentCount: number;
  durationMinutes?: number | null;
  avatarUrl?: string | null;
}

function CourseThumb({ course, index }: { course: Course; index: number }) {
  if (course.avatarUrl) {
    return (
      <img
        src={course.avatarUrl}
        alt={course.title}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
    );
  }

  const bg = [
    "from-emerald-950 via-emerald-800 to-lime-700",
    "from-indigo-950 via-violet-900 to-fuchsia-800",
    "from-slate-950 via-cyan-900 to-slate-800",
    "from-teal-950 via-emerald-900 to-cyan-800",
  ][index % 4];

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${bg} text-white`}
    >
      <BookOpen className="h-12 w-12 opacity-80" />
    </div>
  );
}

function stripHtml(html: string) {
  return (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getInitials(name?: string | null) {
  const safe = (name || "ES").trim();
  const parts = safe.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatDuration(minutes?: number | null) {
  if (!minutes || minutes <= 0) return "Đang cập nhật";
  const hours = Math.floor(minutes / 60);
  const remain = minutes % 60;
  if (!hours) return `${remain} phút`;
  if (!remain) return `${hours} giờ`;
  return `${hours} giờ ${remain} phút`;
}

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState("newest");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<number>>(new Set());

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode<any>(token);
      const role = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      setUserRole(role);
      if (role === "STUDENT") {
        studentApi.getCourses()
          .then((res) => {
            const ids = new Set<number>((res.data || []).map((c: any) => c.id));
            setEnrolledCourseIds(ids);
          })
          .catch((err) => {
            console.error("Failed to load student courses", err);
          });
      }
    } catch (err) {
      console.error("Failed to decode token", err);
    }
  }, []);

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set("search", value);
    else next.delete("search");
    setSearchParams(next, { replace: true });
  };

  const filteredCourses = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    const result = courses.filter(
      (course) =>
        course.title.toLowerCase().includes(normalized) ||
        (course.description || "").toLowerCase().includes(normalized) ||
        (course.creatorName || "").toLowerCase().includes(normalized),
    );

    return [...result].sort((a, b) => {
      if (sortBy === "students") return b.studentCount - a.studentCount;
      if (sortBy === "lessons") return b.lessonCount - a.lessonCount;
      return b.id - a.id;
    });
  }, [courses, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-[#fbfcff] py-8">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-12">
        <main>
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-[#101828]">
                Khóa học
              </h1>
              <p className="mt-3 text-sm font-medium text-slate-500">
                Khám phá các khóa học Sinh học chất lượng, được thiết kế bởi
                chuyên gia hàng đầu.
              </p>
              <p className="mt-5 text-xs font-black text-slate-500">
                {filteredCourses.length} khóa học
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
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
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {filteredCourses.map((course, index) => {
                  const isLocked = userRole === "STUDENT" && !enrolledCourseIds.has(course.id);

                  return (
                    <Link
                      key={course.id}
                      to={`/course/${course.id}`}
                      onClick={(e) => {
                        if (isLocked) {
                          e.preventDefault();
                          toast.error("Bạn không có trong khóa học này");
                        }
                      }}
                      className="group/tooltip relative rounded-[8px] border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className={`relative h-40 overflow-hidden rounded-t-[8px] ${isLocked ? "opacity-75 grayscale-[30%]" : ""}`}>
                        <CourseThumb course={course} index={index} />
                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-black uppercase text-[#ff4f12] shadow-sm">
                          {index === 0 ? "Mới" : index === 1 ? "Phổ biến" : index === 2 ? "Hot" : "Mới"}
                        </span>
                        {isLocked && (
                          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/80 text-white backdrop-blur-md shadow-lg border border-white/10 z-10 animate-scale-in">
                            <Lock className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h2 className="line-clamp-1 text-base font-black text-[#0f172a] transition group-hover:text-[#ff4f12]">
                          {course.title}
                        </h2>
                        <p className="mt-2 line-clamp-1 text-sm font-semibold text-slate-500">
                          {stripHtml(course.description) || "Nền tảng kiến thức Sinh học"}
                        </p>
                        <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-500">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[10px] font-black text-orange-600">
                              {getInitials(course.teacherName || course.creatorName)}
                            </span>
                            <span className="truncate">{course.teacherName || course.creatorName || "GenZBio"}</span>
                          </span>
                          <span className="flex items-center gap-1 text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-current" /> 4.9
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold">
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-600">Bắt đầu</span>
                          <span className="text-slate-500">{formatDuration(course.durationMinutes)}</span>
                        </div>
                      </div>

                      {/* Premium Tooltip */}
                      {isLocked && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover/tooltip:flex flex-col items-center z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none">
                          <div className="bg-slate-950/95 text-white text-[11px] font-black px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md border border-white/10 whitespace-nowrap tracking-wide">
                            🔒 Bạn không có trong khóa học này
                          </div>
                          <div className="w-3 h-3 -mt-1.5 rotate-45 bg-slate-950/95 border-r border-b border-white/10"></div>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-10 flex items-center justify-center gap-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    className={`h-10 w-10 rounded-xl border text-sm font-black ${page === 1 ? "border-orange-200 bg-orange-50 text-[#ff4f12]" : "border-slate-200 bg-white text-slate-500"}`}
                  >
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
              <h2 className="text-xl font-black text-[#101828]">
                Không tìm thấy khóa học
              </h2>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Thử đổi từ khóa tìm kiếm.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
