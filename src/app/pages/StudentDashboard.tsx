import { useState, useEffect } from "react";
import {
  BookOpen,
  Loader2,
  Lock,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router";
import { studentApi } from "../api/studentApi";
import { toast } from "sonner";
import {
  sortCoursesByOrder,
  isCourseUnlocked,
  getPrerequisiteCourseName,
  getPreviousCourseProgress,
  getCourseOrderMap,
} from "../utils/courseOrderUtils";

interface Stats {
  overallProgress: number;
  enrolledCount: number;
}

export default function StudentDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const skipCacheConfig = { headers: { "x-skip-cache": "true" } };
        const [statsRes, coursesRes] = await Promise.all([
          studentApi.getStats(skipCacheConfig),
          studentApi.getCourses(skipCacheConfig)
        ]);
        setStats(statsRes.data);
        setCourses(coursesRes.data);
      } catch (err) {
        console.error("Failed to fetch student dashboard data", err);
        toast.error("Không thể tải dữ liệu dashboard.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderDashboard = () => {
    // Sort courses by admin-defined order
    const sortedCourses = sortCoursesByOrder(courses);
    const orderMap = getCourseOrderMap(courses);

    // Build progress map: courseId → progress (0-100)
    const progressMap: Record<number, number> = {};
    for (const c of courses) {
      progressMap[c.id] = c.progress ?? 0;
    }

    // Check if any ordering is configured
    const hasOrdering = Object.keys(orderMap).length > 0;

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Overall Progress */}
        <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 rounded-[2.5rem] p-10 mb-10 text-white overflow-hidden shadow-[0_20px_60px_rgba(249,115,22,0.35)]">
          <img
            src="/assets/dna.gif"
            alt=""
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] rotate-[-60deg] opacity-[0.12] blur-[0.5px] saturate-[0.7] pointer-events-none select-none"
          />
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full filter blur-[80px]" />
            <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-yellow-300 rounded-full filter blur-[70px]" />
          </div>
          <div className="absolute top-6 right-8 text-5xl opacity-30 animate-float">🎓</div>
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="flex-1 w-full">
              <h2 className="text-3xl font-black mb-8 tracking-tight drop-shadow-sm">Hành trình học tập của bạn 🚀</h2>
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="flex-1 w-full">
                  <div className="w-full bg-white/20 rounded-full h-5 overflow-hidden shadow-inner backdrop-blur-sm">
                    <div
                      className="bg-white h-5 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                      style={{ width: `${stats?.overallProgress || 0}%` }}
                    />
                  </div>
                  <p className="mt-3 text-orange-50 font-bold text-sm tracking-wide opacity-90">Bạn đã hoàn thành {stats?.overallProgress || 0}% lộ trình. Tiếp tục cố gắng nhé!</p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-6xl font-black tabular-nums tracking-tighter drop-shadow-md">{stats?.overallProgress || 0}%</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 p-8 rounded-3xl border border-white/20 backdrop-blur-md text-center min-w-[220px] shadow-sm">
              <p className="text-orange-100 font-black uppercase tracking-[0.2em] text-[10px] mb-2 opacity-80">KHÓA ĐÃ ĐĂNG KÝ</p>
              <p className="text-6xl font-black tracking-tighter drop-shadow-sm">{stats?.enrolledCount || 0}</p>
            </div>
          </div>
        </div>

        {/* Learning Path Timeline (only shown if admin has configured order) */}
        {hasOrdering && sortedCourses.length > 1 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                <ChevronRight className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Lộ trình học tập</h2>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {sortedCourses.map((course, index) => {
                const unlocked = isCourseUnlocked(index, sortedCourses, progressMap);
                const progress = progressMap[course.id] ?? 0;
                const done = progress >= 100;
                return (
                  <div key={course.id} className="flex items-center gap-1 shrink-0">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black border transition-all ${
                      done
                        ? "bg-green-50 border-green-200 text-green-700"
                        : unlocked
                        ? "bg-orange-50 border-orange-200 text-orange-700"
                        : "bg-gray-50 border-gray-200 text-gray-400"
                    }`}>
                      {done ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      ) : unlocked ? (
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-orange-400 shrink-0 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        </span>
                      ) : (
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span className="max-w-[120px] truncate">{course.title}</span>
                    </div>
                    {index < sortedCourses.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Courses Grid */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Khóa học của tôi</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCourses.map((course, index) => {
              const unlocked = isCourseUnlocked(index, sortedCourses, progressMap);
              const prereqName = getPrerequisiteCourseName(index, sortedCourses);
              const prevProgress = getPreviousCourseProgress(index, sortedCourses, progressMap);
              const progress = progressMap[course.id] ?? 0;
              const done = progress >= 100;
              const order = orderMap[course.id];

              return (
                <div key={course.id} className="relative group">
                  {/* Order badge */}
                  {order !== undefined && (
                    <div className={`absolute -top-2.5 -left-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black text-white shadow-md transition-all ${
                      done ? "bg-green-500 shadow-green-500/30" : unlocked ? "bg-purple-600 shadow-purple-500/30" : "bg-gray-400"
                    }`}>
                      {order}
                    </div>
                  )}

                  {unlocked ? (
                    <Link
                      to={`/course/${course.id}`}
                      className={`bg-white rounded-3xl shadow-sm border p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group card-lift block ${
                        done ? "border-green-100" : "border-gray-100"
                      }`}
                    >
                      <CourseCardInner course={course} progress={progress} done={done} unlocked={true} />
                    </Link>
                  ) : (
                    <div
                      onClick={() => toast.error(`🔒 Hoàn thành 100% "${prereqName}" để mở khóa (hiện tại: ${prevProgress}%)`)}
                      className="bg-white/70 rounded-3xl shadow-sm border border-gray-100 p-8 cursor-not-allowed opacity-70 grayscale-[20%] select-none relative group/locked"
                    >
                      {/* Lock overlay */}
                      <div className="absolute inset-0 rounded-3xl bg-gray-50/40 flex items-center justify-center opacity-0 group-hover/locked:opacity-100 transition-all duration-300 backdrop-blur-[1px]">
                        <div className="bg-slate-900/90 text-white text-xs font-black px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 max-w-[240px] text-center">
                          <Lock className="w-4 h-4 shrink-0" />
                          <span>Hoàn thành {prevProgress}%/{100}% &ldquo;{prereqName}&rdquo; để mở</span>
                        </div>
                      </div>
                      <CourseCardInner course={course} progress={progress} done={false} unlocked={false} />
                    </div>
                  )}
                </div>
              );
            })}
            {sortedCourses.length === 0 && (
              <div className="col-span-full text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                 <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                 <p className="text-gray-400 font-black uppercase text-xs tracking-widest italic">Bạn chưa đăng ký khóa học nào.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 sm:px-0">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-orange-500" />
            <div className="absolute inset-0 blur-2xl bg-orange-500/20 rounded-full animate-pulse"></div>
            <p className="mt-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-center">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        <div className="pt-6">
          <div className="pb-24">
            {renderDashboard()}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-component: Course Card Inner ────────────────────────────────────────
function CourseCardInner({
  course,
  progress,
  done,
  unlocked,
}: {
  course: any;
  progress: number;
  done: boolean;
  unlocked: boolean;
}) {
  return (
    <>
      <div className="flex items-center gap-5 mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${
          done
            ? "bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white"
            : unlocked
            ? "bg-orange-50 group-hover:bg-orange-600 group-hover:text-white group-hover:rotate-6"
            : "bg-gray-100 text-gray-400"
        }`}>
          {done ? (
            <CheckCircle2 className="w-7 h-7" />
          ) : unlocked ? (
            <BookOpen className="w-7 h-7 text-orange-600 group-hover:text-white transition-colors" />
          ) : (
            <Lock className="w-7 h-7" />
          )}
        </div>
        <h3 className={`text-lg font-black transition-colors line-clamp-1 tracking-tight ${
          done ? "text-green-700 group-hover:text-green-600" : unlocked ? "text-gray-900 group-hover:text-orange-600" : "text-gray-400"
        }`}>
          {course.title}
        </h3>
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
          <span>TIẾN ĐỘ HOÀN THÀNH</span>
          <span className={done ? "text-green-500" : "text-orange-500"}>{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
          <div
            className={`h-2.5 rounded-full transition-all duration-1000 ${
              done
                ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                : "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-4">
          <span className="text-gray-900">{course.completedLessons}</span> / {course.totalLessons} BÀI HỌC
        </p>
        {done && (
          <span className="mt-4 text-[10px] font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            ✓ Hoàn thành
          </span>
        )}
      </div>
    </>
  );
}
