import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { jwtDecode } from "jwt-decode";
import { useSse } from "../api/sseClient";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle2,
  CirclePlay,
  Clock3,
  FileText,
  FileType2,
  GraduationCap,
  Layers3,
  Loader2,
  Lock,
  MessageSquare,
  Play,
  Plus,
  Search,
  Send,
  Sparkles,
  Star,
  Upload,
  UserPlus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { publicApi } from "../api/publicApi";
import { studentApi } from "../api/studentApi";
import {
  sortCoursesByOrder,
  isCourseUnlocked,
  getPrerequisiteCourseName,
  getPreviousCourseProgress,
} from "../utils/courseOrderUtils";
import { resolveMediaUrl } from "../utils/media";
import { adminApi } from "../api/adminApi";
import { teacherApi } from "../api/teacherApi";
import { toast } from "sonner";
import CourseFeedbackPanel from "../components/common/CourseFeedbackPanel";

interface Lesson {
  id: number;
  title: string;
  description?: string;
  videoUrl?: string | null;
  arVrUrl?: string | null;
  slideUrl?: string | null;
  lessonPlanUrl?: string | null;
  pdfUrl?: string | null;
  documentUrl?: string | null;
  documentName?: string | null;
}

interface Student {
  id: number;
  fullName: string;
  email: string;
  enrolledAt: string;
}

interface CourseDetailData {
  id: number;
  title: string;
  description: string;
  avatarUrl?: string | null;
  code?: string;
  introVideoUrl?: string | null;
  status?: string;
  language?: string;
  durationMinutes?: number;
  expectedStudentCount?: number;
  startDate?: string | null;
  endDate?: string | null;
  learningOutcomes?: string;
  creatorName: string;
  teacherId?: number | null;
  teacherName?: string;
  teacherAvatarUrl?: string | null;
  lessonCount: number;
  studentCount: number;
  averageProgress?: number;
  createdAt: string;
  lessons: Lesson[];
  students: Student[];
}

type TabKey = "overview" | "lessons" | "resources" | "students" | "feedback";
type AppRole = "ADMIN" | "TEACHER" | "STUDENT" | null;

interface LessonFormState {
  title: string;
  description: string;
  videoUrl: string;
  pdfFile: File | null;
  documentFile: File | null;
}

interface CourseFeedback {
  id: number;
  courseId: number;
  teacherId: number;
  authorName: string;
  authorRole: string;
  rating: number;
  content: string;
  createdAt: string;
  replies: CourseFeedback[];
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(value?: string | null) {
  if (!value) return "Chua cap nhat";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chua cap nhat";
  return date.toLocaleDateString("vi-VN");
}

function formatDuration(minutes?: number) {
  if (!minutes || minutes <= 0) return "Chua cap nhat";
  const hours = Math.floor(minutes / 60);
  const remain = minutes % 60;
  if (!hours) return `${remain} phut`;
  if (!remain) return `${hours} gio`;
  return `${hours} gio ${remain} phut`;
}

function formatNumber(value?: number) {
  return new Intl.NumberFormat("vi-VN").format(value || 0);
}

function getLessonResourceIds(lesson: Lesson) {
  return [
    lesson.videoUrl ? "video" : null,
    lesson.arVrUrl ? "arvr" : null,
    lesson.slideUrl ? "slide" : null,
    lesson.lessonPlanUrl ? "lessonplan" : null,
    lesson.documentUrl ? "doc" : null,
    lesson.pdfUrl ? "pdf" : null,
  ].filter(Boolean) as string[];
}

function getLessonProgress(lesson: Lesson) {
  const resourceIds = getLessonResourceIds(lesson);
  if (resourceIds.length === 0) return 0;

  try {
    const raw = localStorage.getItem(`edusmart.lessonProgress.${lesson.id}`);
    const completed = new Set<string>(raw ? JSON.parse(raw) : []);
    const completedCount = resourceIds.filter((resourceId) =>
      completed.has(resourceId),
    ).length;
    return Math.round((completedCount / resourceIds.length) * 100);
  } catch {
    return 0;
  }
}

function getInitials(name?: string) {
  const safe = (name || "GenZBio").trim();
  const parts = safe.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function normalizeOutcomes(raw?: string) {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(/\r?\n|•|;|\|/)
        .map((item) => stripHtml(item).trim())
        .filter(Boolean),
    ),
  );
}

function getRoleFromToken(token: string | null): AppRole {
  if (!token) return null;
  try {
    const decoded = jwtDecode<Record<string, string>>(token);
    return (decoded.role ||
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      null) as AppRole;
  } catch {
    return null;
  }
}

function makeAbsoluteUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${window.location.origin}${url}`;
}

function CourseHeroImage({ course }: { course: CourseDetailData }) {
  if (course.avatarUrl) {
    return (
      <img
        src={resolveMediaUrl(course.avatarUrl)}
        alt={course.title}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(163,230,53,0.28),_transparent_30%),linear-gradient(135deg,#0a402b_0%,#0d6a44_50%,#6ea90b_100%)]" />
  );
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [role, setRole] = useState<AppRole>(null);
  const [feedbacks, setFeedbacks] = useState<CourseFeedback[]>([]);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isSavingLesson, setIsSavingLesson] = useState(false);
  const [lessonForm, setLessonForm] = useState<LessonFormState>({
    title: "",
    description: "",
    videoUrl: "",
    pdfFile: null,
    documentFile: null,
  });

  // ── Add Student Modal ──
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [allStudents, setAllStudents] = useState<
    { id: number; fullName: string; email: string }[]
  >([]);
  const [studentEmailQuery, setStudentEmailQuery] = useState("");
  const [isEnrolled, setIsEnrolled] = useState<boolean>(true);
  const [enrollRequestStatus, setEnrollRequestStatus] = useState<
    "PENDING" | "APPROVED" | "REJECTED" | "NONE"
  >("NONE");
  const [isRequestingEnroll, setIsRequestingEnroll] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<{
    id: number;
    fullName: string;
    email: string;
  } | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const studentInputRef = useRef<HTMLInputElement>(null);

  const filteredStudents = useMemo(() => {
    if (!studentEmailQuery.trim()) return [];
    const q = studentEmailQuery.toLowerCase();
    return allStudents
      .filter(
        (s) =>
          s.email.toLowerCase().includes(q) ||
          s.fullName.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [allStudents, studentEmailQuery]);

  const openAddStudentModal = async () => {
    setIsAddStudentOpen(true);
    setStudentEmailQuery("");
    setSelectedStudent(null);
    if (allStudents.length === 0) {
      setIsLoadingStudents(true);
      try {
        const res = await teacherApi.getAllStudents();
        setAllStudents(res.data || []);
      } catch {
        toast.error("Không thể tải danh sách học sinh.");
      } finally {
        setIsLoadingStudents(false);
      }
    }
    setTimeout(() => studentInputRef.current?.focus(), 100);
  };

  const handleEnrollStudent = async () => {
    if (!selectedStudent || !course) return;
    setIsEnrolling(true);
    try {
      if (role === "ADMIN") {
        await adminApi.enrollStudent(course.id, selectedStudent.email);
      } else {
        await teacherApi.enrollStudent(course.id, selectedStudent.email);
      }
      toast.success(`Đã thêm ${selectedStudent.fullName} vào khóa học!`);
      await fetchCourse(String(course.id));
      setIsAddStudentOpen(false);
      setSelectedStudent(null);
      setStudentEmailQuery("");
      setActiveTab("students");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Không thể thêm học sinh vào khóa học.",
      );
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleStudentRequestEnroll = async () => {
    if (!course) return;
    setIsRequestingEnroll(true);
    try {
      const res = await studentApi.requestEnroll(course.id);
      toast.success(res.data.message || "Gửi yêu cầu đăng ký thành công! Đang chờ Admin phê duyệt.");
      setEnrollRequestStatus("PENDING");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể gửi yêu cầu đăng ký.");
    } finally {
      setIsRequestingEnroll(false);
    }
  };

  const fetchCourse = async (courseId: string) => {
    const res = await publicApi.getCourseById(courseId);
    setCourse(res.data);

    const token = localStorage.getItem("token");
    const userRole = getRoleFromToken(token);
    if (userRole === "STUDENT") {
      try {
        const statusRes = await studentApi.getEnrollmentStatus(courseId);
        setIsEnrolled(statusRes.data.isEnrolled);
        setEnrollRequestStatus(statusRes.data.requestStatus);
      } catch (err) {
        console.error("Failed to load enrollment status in fetchCourse", err);
      }
    }
  };

  const fetchFeedbacks = async (courseId: string | number) => {
    setIsFeedbackLoading(true);
    try {
      const res = await publicApi.getCourseFeedbackThread(courseId);
      setFeedbacks(res.data || []);
    } catch (err) {
      console.error("Failed to load course feedbacks", err);
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const handleStudentSseEvent = useCallback((eventName: string, data: any) => {
    if (eventName === "enrollment-status-changed") {
      if (data && Number(data.courseId) === Number(id)) {
        toast.info(data.message || "Trạng thái đăng ký khóa học của bạn đã thay đổi!");
        if (id) {
          fetchCourse(String(id));
          fetchFeedbacks(id);
        }
      }
    }
  }, [id]);

  useSse(role === "STUDENT" ? "student" : null, handleStudentSseEvent);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setRole(getRoleFromToken(token));

    if (!id) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      try {
        if (!token) {
          toast.error("Vui lòng đăng nhập để tiếp tục");
          navigate("/login", { replace: true });
          return;
        }

        let userRole = null;
        let email = null;
        try {
          const decoded = jwtDecode<any>(token);
          userRole =
            decoded.role ||
            decoded[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ];
          email =
            decoded.email ||
            decoded[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
            ];
        } catch (jwtErr) {
          console.error("JWT Decode error", jwtErr);
          toast.error("Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại");
          navigate("/login", { replace: true });
          return;
        }

        const courseRes = await publicApi.getCourseById(id);
        const courseData = courseRes.data;

        if (userRole === "STUDENT") {
          let enrolled = false;
          let reqStatus: "PENDING" | "APPROVED" | "REJECTED" | "NONE" = "NONE";

          try {
            const statusRes = await studentApi.getEnrollmentStatus(courseData.id);
            enrolled = statusRes.data.isEnrolled;
            reqStatus = statusRes.data.requestStatus;
          } catch (err) {
            console.error("Failed to fetch enrollment status on init", err);
            try {
              const studentCoursesRes = await studentApi.getCourses();
              const studentCourses = studentCoursesRes.data || [];
              enrolled = studentCourses.some((c: any) => c.id === courseData.id);
            } catch {}
            if (!enrolled && email && courseData.students) {
              enrolled = courseData.students.some(
                (s: any) => s.email?.toLowerCase() === email.toLowerCase(),
              );
            }
          }

          setIsEnrolled(enrolled);
          setEnrollRequestStatus(reqStatus);

          if (enrolled) {
            // ── Prerequisite gate check ──────────────────────────────────────
            try {
              const studentCoursesFull = await studentApi.getCourses();
              const allStudentCourses: any[] = studentCoursesFull.data || [];
              const sortedCourses = sortCoursesByOrder(allStudentCourses);
              const progressMap: Record<number, number> = {};
              for (const c of allStudentCourses) {
                progressMap[c.id] = c.progress ?? 0;
              }
              const courseIndex = sortedCourses.findIndex(
                (c: any) => c.id === courseData.id,
              );
              if (courseIndex > 0 && !isCourseUnlocked(courseIndex, sortedCourses, progressMap)) {
                const prereqName = getPrerequisiteCourseName(courseIndex, sortedCourses);
                const prevProgress = getPreviousCourseProgress(courseIndex, sortedCourses, progressMap);
                toast.error(
                  `🔒 Bạn cần hoàn thành 100% "${prereqName}" (hiện tại: ${prevProgress}%) để mở khóa học này`,
                );
                navigate("/student", { replace: true });
                return;
              }
            } catch (prereqErr) {
              console.error("Prerequisite check failed, blocking access", prereqErr);
              toast.error("🔒 Không thể xác thực điều kiện tiên quyết. Vui lòng thử lại sau.");
              navigate("/student", { replace: true });
              return;
            }
          }
        }

        setCourse(courseData);
        await fetchFeedbacks(id);
      } catch (err) {
        console.error("Failed to load course detail", err);
        toast.error("Không thể tải thông tin khóa học");
        navigate("/courses", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id, navigate]);

  const canManageLessons = role === "ADMIN" || role === "TEACHER";
  const isLoggedIn = !!role;
  const outcomes = useMemo(
    () => normalizeOutcomes(course?.learningOutcomes),
    [course?.learningOutcomes],
  );
  const descriptionText = useMemo(
    () => stripHtml(course?.description || ""),
    [course?.description],
  );
  const resourceCount = useMemo(() => {
    if (!course) return 0;
    return course.lessons.reduce(
      (total, lesson) =>
        total +
        (lesson.videoUrl ? 1 : 0) +
        (lesson.pdfUrl ? 1 : 0) +
        (lesson.documentUrl ? 1 : 0),
      0,
    );
  }, [course]);
  const teacherName =
    course?.teacherName?.trim() || course?.creatorName || "GenZBio";
  const previewVideoUrl = lessonForm.videoUrl.trim();
  const previewPdfName = lessonForm.pdfFile?.name;
  const previewDocName = lessonForm.documentFile?.name;

  const resetLessonForm = () => {
    setLessonForm({
      title: "",
      description: "",
      videoUrl: "",
      pdfFile: null,
      documentFile: null,
    });
  };

  const submitLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    try {
      setIsSavingLesson(true);
      const payload = {
        courseId: course.id,
        title: lessonForm.title,
        description: lessonForm.description,
        videoUrl: lessonForm.videoUrl,
        pdfFile: lessonForm.pdfFile,
        documentFile: lessonForm.documentFile,
        documentName: lessonForm.documentFile?.name || "",
      };

      if (role === "ADMIN") {
        await adminApi.createLesson(payload);
      } else if (role === "TEACHER") {
        await teacherApi.createLesson(payload);
      }

      await fetchCourse(String(course.id));
      toast.success("Da them bai hoc");
      setIsLessonModalOpen(false);
      resetLessonForm();
      setActiveTab("lessons");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Khong the tao bai hoc");
    } finally {
      setIsSavingLesson(false);
    }
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    if (!feedbackContent.trim()) {
      toast.error("Vui lòng nhập nội dung nhận xét.");
      return;
    }

    try {
      setIsSavingFeedback(true);
      await publicApi.createFeedback({
        courseId: course.id,
        teacherId: course.teacherId || undefined,
        rating: feedbackRating,
        content: feedbackContent.trim(),
      });
      setFeedbackContent("");
      setFeedbackRating(5);
      setIsFeedbackFormOpen(false);
      await fetchFeedbacks(course.id);
      toast.success("Đã gửi nhận xét.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể gửi nhận xét.");
    } finally {
      setIsSavingFeedback(false);
    }
  };

  const submitReply = async (feedbackId: number) => {
    const content = replyDrafts[feedbackId]?.trim();
    if (!content) {
      toast.error("Vui lòng nhập phản hồi.");
      return;
    }

    try {
      setReplyingId(feedbackId);
      await publicApi.createFeedbackReply(feedbackId, { content });
      setReplyDrafts((drafts) => ({ ...drafts, [feedbackId]: "" }));
      if (course) await fetchFeedbacks(course.id);
      toast.success("Đã gửi phản hồi.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể gửi phản hồi.");
    } finally {
      setReplyingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#FF5A1F]" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="text-3xl font-black text-[#0F172A]">
          Khong tim thay khoa hoc
        </h2>
        <p className="mt-3 text-sm font-medium text-slate-500">
          Khoa hoc nay khong ton tai hoac da bi an.
        </p>
        <Link
          to="/courses"
          className="mt-6 inline-flex h-12 items-center rounded-xl bg-[#FF5A1F] px-6 text-sm font-black text-white"
        >
          Quay lai danh sach
        </Link>
      </div>
    );
  }

  const tabs: Array<{ id: TabKey; label: string; count: number | null }> = [
    { id: "overview", label: "Tổng quan", count: null },
    { id: "lessons", label: "Nội dung khóa học", count: course.lessons.length },
    ...(role === "STUDENT" && !isEnrolled
      ? []
      : [
          {
            id: "students" as const,
            label: "Học viên",
            count: course.students.length || course.studentCount,
          },
          {
            id: "feedback" as const,
            label: "Đánh giá khóa học",
            count: feedbacks.length,
          },
        ]),
  ];

  return (
    <div className="min-h-screen bg-[#FBFCFF]">
      <div className="mx-auto max-w-[1500px] space-y-6 pb-10">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="relative min-h-[320px] overflow-hidden rounded-[28px] shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <CourseHeroImage course={course} />
            <div className="absolute inset-0 bg-gradient-to-r from-[#06120C]/80 via-[#0C1C15]/45 to-transparent" />
            <div className="relative z-10 flex min-h-[320px] flex-col justify-between p-8 text-white lg:p-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  {course.introVideoUrl && (
                    <a
                      href={course.introVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-12 items-center gap-2 rounded-full bg-white/16 px-5 text-sm font-black text-white backdrop-blur-md transition hover:bg-white/24"
                    >
                      <Play className="h-4 w-4" />
                      Xem demo
                    </a>
                  )}
                </div>
              </div>

              <div>
                <h1 className="max-w-2xl text-4xl font-black tracking-tight lg:text-5xl">
                  {course.title}
                </h1>
                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/90"></p>
                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <div className="flex -space-x-3">
                    {[teacherName, course.creatorName, course.title].map(
                      (name, index) => (
                        <div
                          key={`${name}-${index}`}
                          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-[#FFF4EC] text-xs font-black text-[#FF5A1F]"
                        >
                          {getInitials(name)}
                        </div>
                      ),
                    )}
                  </div>
                  <div className="text-sm font-bold text-white/95">
                    {formatNumber(course.studentCount)} học viên đang theo dõi
                    khóa học này
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-[#E8EDF5] bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            {role === "STUDENT" && !isEnrolled && (
              <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#FFF4EC] to-white p-5 border border-[#FFE2D1] shadow-sm text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF1EB] text-[#FF5A1F] mb-3">
                  <UserPlus className="h-6 w-6 animate-pulse" />
                </div>
                <h4 className="text-base font-black text-[#0F172A]">Tham gia khóa học</h4>
                <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-500">
                  Khóa học này đang đóng. Hãy đăng ký ngay để mở khóa toàn bộ bài giảng và tài liệu học tập hữu ích!
                </p>
                
                {enrollRequestStatus === "NONE" || enrollRequestStatus === "REJECTED" ? (
                  <div className="mt-4 space-y-2">
                    {enrollRequestStatus === "REJECTED" && (
                      <p className="text-[10px] font-bold text-red-500 bg-red-50 py-1.5 px-2 rounded-lg leading-relaxed">
                        ⚠️ Yêu cầu trước đó đã bị từ chối. Bạn có thể gửi lại yêu cầu đăng ký mới.
                      </p>
                    )}
                    <button
                      onClick={handleStudentRequestEnroll}
                      disabled={isRequestingEnroll}
                      className="w-full flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FF5A1F] text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-[#E84A0C] active:scale-[0.98]"
                    >
                      {isRequestingEnroll ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Đăng ký khóa học"
                      )}
                    </button>
                  </div>
                ) : enrollRequestStatus === "PENDING" ? (
                  <div className="mt-4">
                    <button
                      disabled
                      className="w-full flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-100 border border-slate-200 text-sm font-bold text-slate-400 cursor-not-allowed"
                    >
                      <span className="relative flex h-2 w-2 mr-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                      </span>
                      Đang chờ duyệt...
                    </button>
                    <p className="mt-2 text-[10px] font-bold text-[#FF5A1F]">
                      Yêu cầu của bạn đang chờ Admin phê duyệt.
                    </p>
                  </div>
                ) : null}
              </div>
            )}
            <div className="space-y-1">
              {[
                { icon: UserRound, label: "Giảng viên", value: teacherName },
                {
                  icon: Calendar,
                  label: "Ngày bắt đầu",
                  value: formatDate(course.startDate),
                },
                {
                  icon: CalendarDays,
                  label: "Ngày kết thúc",
                  value: formatDate(course.endDate),
                },
                {
                  icon: Clock3,
                  label: "Thời lượng",
                  value: formatDuration(course.durationMinutes),
                },
                {
                  icon: Users,
                  label: "Học viên",
                  value: `${formatNumber(course.studentCount)} học viên`,
                },
                {
                  icon: BookOpen,
                  label: "Mã khóa học",
                  value: course.code || "Chưa cập nhật",
                },
                {
                  icon: Sparkles,
                  label: "Ngôn ngữ",
                  value: course.language || "Tiếng Việt",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 border-b border-[#EEF2F6] py-4 last:border-b-0"
                >
                  <div className="flex items-center gap-3 text-sm font-semibold text-[#667085]">
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                  <div className="max-w-[160px] text-right text-sm font-black text-[#0F172A]">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="flex overflow-x-auto rounded-[24px] border border-[#E8EDF5] bg-white px-3 shadow-sm items-stretch">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex min-w-fit items-center gap-3 px-5 py-5 text-sm font-black transition ${activeTab === tab.id ? "text-[#FF5A1F]" : "text-[#667085]"}`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`rounded-full px-2.5 py-1 text-xs ${activeTab === tab.id ? "bg-[#FFF1EB] text-[#FF5A1F]" : "bg-[#F2F5F9] text-[#475569]"}`}
                >
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-5 right-5 h-0.5 rounded-full bg-[#FF5A1F]" />
              )}
            </button>
          ))}

          {canManageLessons && (
            <button
              onClick={() => setIsLessonModalOpen(true)}
              className="ml-2 inline-flex h-full items-center gap-2 whitespace-nowrap rounded-xl border border-[#FF5A1F] bg-[#FF5A1F] px-4 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-[#E84A0C]"
            >
              <Plus className="h-4 w-4" />
              Thêm bài giảng
            </button>
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            {(activeTab === "overview" || activeTab === "lessons") && (
              <section className="rounded-[28px] border border-[#E8EDF5] bg-white p-7 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="flex items-center gap-3 text-2xl font-black text-[#0F172A]">
                    <GraduationCap className="h-6 w-6 text-[#FF5A1F]" />
                    Nội dung khóa học
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-[#FFF4EC] px-3 py-1 text-xs font-black text-[#FF5A1F]">
                      {course.lessons.length} bài học
                    </span>
                    {role === "ADMIN" && (
                      <button
                        onClick={openAddStudentModal}
                        className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#2563EB] bg-white px-4 text-sm font-black text-[#2563EB] shadow-sm hover:bg-blue-50 transition"
                      >
                        <UserPlus className="h-4 w-4" />
                        Thêm học sinh
                      </button>
                    )}
                    {canManageLessons && (
                      <button
                        onClick={() => setIsLessonModalOpen(true)}
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FF5A1F] px-4 text-sm font-black text-white shadow-lg shadow-orange-500/20"
                      >
                        <Plus className="h-4 w-4" />
                        Them bai hoc
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-hidden rounded-[22px] border border-[#E8EDF5]">
                  {course.lessons.length ? (
                    course.lessons.map((lesson, index) => {
                      const lessonProgress = getLessonProgress(lesson);

                      return (
                        <div
                          key={lesson.id}
                          className={`border-b border-[#E8EDF5] p-5 last:border-b-0 ${index === 0 ? "bg-[#FFF7F2]" : "bg-white"}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#FF5A1F] shadow-sm">
                                <CirclePlay className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-black text-[#0F172A]">
                                  Bai {index + 1}. {lesson.title}
                                </p>
                                <p className="mt-1 text-xs font-semibold leading-6 text-[#667085]">
                                  {lesson.description ||
                                    "Bai hoc dang duoc cap nhat mo ta chi tiet."}
                                </p>

                                <div className="mt-4 max-w-xl">
                                  <div className="mb-2 flex items-center justify-between text-xs font-black">
                                    <span className="text-[#667085]">
                                      Tiến độ bài giảng
                                    </span>
                                    <span className="text-[#FF5A1F]">
                                      {lessonProgress}%
                                    </span>
                                  </div>
                                  <div className="h-2 rounded-full bg-[#EEF2F6]">
                                    <div
                                      className="h-full rounded-full bg-[#FF5A1F] transition-all"
                                      style={{ width: `${lessonProgress}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            {role === "STUDENT" && !isEnrolled ? (
                              <span className="inline-flex h-10 items-center rounded-xl bg-slate-100 px-4 text-xs font-black text-slate-400 gap-1.5 cursor-not-allowed">
                                <Lock className="h-3.5 w-3.5" />
                                Đăng ký để học
                              </span>
                            ) : (
                              <Link
                                to={`/lesson/${lesson.id}`}
                                className="inline-flex h-10 items-center rounded-xl border border-[#D8DFEA] px-4 text-xs font-black text-[#0F172A] transition hover:bg-[#F8FAFC]"
                              >
                                Xem bài học
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-10 text-center text-sm font-semibold text-[#667085]">
                      Chua co bai hoc nao trong khoa hoc nay.
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === "overview" && (
              <section className="rounded-[28px] border border-[#E8EDF5] bg-white p-7 shadow-sm">
                <h2 className="flex items-center gap-3 text-2xl font-black text-[#0F172A]">
                  <BookOpen className="h-6 w-6 text-[#FF5A1F]" />
                  Giới thiệu khóa học
                </h2>
                <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
                  <div>
                    <p className="text-sm font-medium leading-7 text-[#3C4A5F]">
                      {descriptionText ||
                        "Khoa hoc dang duoc cap nhat noi dung gioi thieu."}
                    </p>
                    <div className="mt-6 space-y-3">
                      {(outcomes.length
                        ? outcomes
                        : [
                            "Hệ thống bài học rõ ràng",
                            "Có video và tài liệu đi kèm",
                            "Phù hợp cho việc tự học và ôn luyện",
                          ]
                      ).map((item) => (
                        <div
                          key={item}
                          className="flex items-start gap-3 text-sm font-semibold text-[#3C4A5F]"
                        >
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-center rounded-[24px] bg-gradient-to-br from-[#F0FDF4] via-[#FFF7ED] to-[#EFF6FF] p-6">
                    <div className="grid h-48 w-48 place-items-center rounded-full bg-white/90 shadow-inner">
                      <Layers3 className="h-24 w-24 text-[#22C55E]" />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "resources" && (
              <section className="rounded-[28px] border border-[#E8EDF5] bg-white p-7 shadow-sm">
                <h2 className="text-2xl font-black text-[#0F172A]">
                  Tai lieu va hoc lieu
                </h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {course.lessons.flatMap((lesson) => {
                    const items = [];
                    if (lesson.videoUrl) {
                      items.push(
                        <a
                          key={`${lesson.id}-video`}
                          href={lesson.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-[22px] border border-[#E8EDF5] p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                            <Play className="h-5 w-5" />
                          </div>
                          <p className="mt-4 text-base font-black text-[#0F172A]">
                            {lesson.title}
                          </p>
                          <p className="mt-2 text-sm font-medium text-[#667085]">
                            Video bai giang
                          </p>
                        </a>,
                      );
                    }
                    if (lesson.pdfUrl) {
                      items.push(
                        <a
                          key={`${lesson.id}-pdf`}
                          href={makeAbsoluteUrl(lesson.pdfUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-[22px] border border-[#E8EDF5] p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <FileText className="h-5 w-5" />
                          </div>
                          <p className="mt-4 text-base font-black text-[#0F172A]">
                            {lesson.title}
                          </p>
                          <p className="mt-2 text-sm font-medium text-[#667085]">
                            Tai lieu PDF
                          </p>
                        </a>,
                      );
                    }
                    if (lesson.documentUrl) {
                      items.push(
                        <a
                          key={`${lesson.id}-doc`}
                          href={makeAbsoluteUrl(lesson.documentUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-[22px] border border-[#E8EDF5] p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                            <FileType2 className="h-5 w-5" />
                          </div>
                          <p className="mt-4 text-base font-black text-[#0F172A]">
                            {lesson.title}
                          </p>
                          <p className="mt-2 text-sm font-medium text-[#667085]">
                            {lesson.documentName || "Tai lieu Word"}
                          </p>
                        </a>,
                      );
                    }
                    return items;
                  }).length ? (
                    course.lessons.flatMap((lesson) => {
                      const items = [];
                      if (lesson.videoUrl)
                        items.push(
                          <a
                            key={`${lesson.id}-video`}
                            href={lesson.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-[22px] border border-[#E8EDF5] p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                              <Play className="h-5 w-5" />
                            </div>
                            <p className="mt-4 text-base font-black text-[#0F172A]">
                              {lesson.title}
                            </p>
                            <p className="mt-2 text-sm font-medium text-[#667085]">
                              Video bai giang
                            </p>
                          </a>,
                        );
                      if (lesson.pdfUrl)
                        items.push(
                          <a
                            key={`${lesson.id}-pdf`}
                            href={makeAbsoluteUrl(lesson.pdfUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-[22px] border border-[#E8EDF5] p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                              <FileText className="h-5 w-5" />
                            </div>
                            <p className="mt-4 text-base font-black text-[#0F172A]">
                              {lesson.title}
                            </p>
                            <p className="mt-2 text-sm font-medium text-[#667085]">
                              Tai lieu PDF
                            </p>
                          </a>,
                        );
                      if (lesson.documentUrl)
                        items.push(
                          <a
                            key={`${lesson.id}-doc`}
                            href={makeAbsoluteUrl(lesson.documentUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-[22px] border border-[#E8EDF5] p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                              <FileType2 className="h-5 w-5" />
                            </div>
                            <p className="mt-4 text-base font-black text-[#0F172A]">
                              {lesson.title}
                            </p>
                            <p className="mt-2 text-sm font-medium text-[#667085]">
                              {lesson.documentName || "Tai lieu Word"}
                            </p>
                          </a>,
                        );
                      return items;
                    })
                  ) : (
                    <div className="col-span-full rounded-[22px] border border-dashed border-[#D8DFEA] bg-[#FBFCFE] p-10 text-center text-sm font-semibold text-[#667085]">
                      Khoa hoc nay chua co tai lieu hoac video dinh kem.
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === "students" && (
              <section className="rounded-[28px] border border-[#E8EDF5] bg-white p-7 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-black text-[#0F172A]">
                    Học viên tham gia
                  </h2>
                  <span className="rounded-full bg-[#F3F6FA] px-3 py-1 text-xs font-black text-[#475569]">
                    {formatNumber(course.studentCount)} học viên
                  </span>
                </div>
                <div className="mt-6 space-y-4">
                  {course.students.length ? (
                    course.students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between gap-4 rounded-[22px] border border-[#E8EDF5] p-5"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF4EC] text-sm font-black text-[#FF5A1F]">
                            {getInitials(student.fullName)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#0F172A]">
                              {student.fullName}
                            </p>
                            <p className="mt-1 text-sm font-medium text-[#667085]">
                              {student.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-xs font-bold text-[#667085]">
                          <p>Tham gia</p>
                          <p className="mt-1 text-sm text-[#0F172A]">
                            {formatDate(student.enrolledAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-[#D8DFEA] bg-[#FBFCFE] p-10 text-center text-sm font-semibold text-[#667085]">
                      Chua co danh sach hoc vien cong khai cho khoa hoc nay.
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === "feedback" && (
              <CourseFeedbackPanel
                courseId={course.id}
                teacherId={course.teacherId || null}
                canWrite={isLoggedIn}
                title="Đánh giá khóa học"
              />
            )}

            {false && activeTab === "feedback" && (
              <section className="rounded-[28px] border border-[#E8EDF5] bg-white p-7 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="flex items-center gap-3 text-2xl font-black text-[#0F172A]">
                      <MessageSquare className="h-6 w-6 text-[#FF5A1F]" />
                      Đánh giá khóa học
                    </h2>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">
                      Toàn bộ feedback của student và teacher, sắp xếp theo thời
                      gian.
                    </p>
                  </div>
                  {role === "STUDENT" && (
                    <button
                      type="button"
                      onClick={() => setIsFeedbackFormOpen((value) => !value)}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#FF5A1F] px-5 text-sm font-black text-white shadow-lg shadow-orange-500/20"
                    >
                      <Plus className="h-4 w-4" />
                      Viết nhận xét
                    </button>
                  )}
                </div>

                {isFeedbackFormOpen && role === "STUDENT" && (
                  <form
                    onSubmit={submitFeedback}
                    className="mt-6 rounded-[24px] border border-[#FFE0D2] bg-[#FFF8F3] p-5"
                  >
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setFeedbackRating(star)}
                          className="rounded-lg p-1 transition hover:bg-white"
                        >
                          <Star
                            className={`h-6 w-6 ${star <= feedbackRating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={feedbackContent}
                      onChange={(e) => setFeedbackContent(e.target.value)}
                      className="mt-4 min-h-[120px] w-full rounded-2xl border border-[#E8EDF5] bg-white px-4 py-3 text-sm font-semibold text-[#0F172A] outline-none transition focus:border-[#FF5A1F]"
                      placeholder="Nhập nhận xét của bạn về khóa học..."
                    />
                    <div className="mt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsFeedbackFormOpen(false)}
                        className="h-11 rounded-xl border border-[#D8DFEA] bg-white px-5 text-sm font-black text-[#0F172A]"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingFeedback}
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FF5A1F] px-5 text-sm font-black text-white disabled:opacity-60"
                      >
                        {isSavingFeedback ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Gửi nhận xét
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-7 space-y-5">
                  {isFeedbackLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-[#FF5A1F]" />
                    </div>
                  ) : feedbacks.length ? (
                    feedbacks.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[24px] border border-[#E8EDF5] bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF4EC] text-sm font-black text-[#FF5A1F]">
                            {getInitials(item.authorName)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="font-black text-[#0F172A]">
                                  {item.authorName}
                                </p>
                                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#98A2B3]">
                                  {item.authorRole === "TEACHER"
                                    ? "Giảng viên"
                                    : item.authorRole === "ADMIN"
                                      ? "Quản trị viên"
                                      : "Học viên"}{" "}
                                  ·{" "}
                                  {new Date(item.createdAt).toLocaleString(
                                    "vi-VN",
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${star <= item.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="mt-4 whitespace-pre-line text-sm font-medium leading-7 text-[#344054]">
                              {item.content}
                            </p>

                            <div className="mt-5 space-y-3 border-l-2 border-[#FFE0D2] pl-4">
                              {item.replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="rounded-2xl bg-[#F8FAFC] p-4"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-black text-[#FF5A1F]">
                                        {getInitials(reply.authorName)}
                                      </div>
                                      <div>
                                        <p className="text-sm font-black text-[#0F172A]">
                                          {reply.authorName}
                                        </p>
                                        <p className="text-xs font-bold text-[#98A2B3]">
                                          {new Date(
                                            reply.createdAt,
                                          ).toLocaleString("vi-VN")}
                                        </p>
                                      </div>
                                    </div>
                                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black uppercase text-[#667085]">
                                      {reply.authorRole}
                                    </span>
                                  </div>
                                  <p className="mt-3 whitespace-pre-line text-sm font-medium leading-6 text-[#344054]">
                                    {reply.content}
                                  </p>
                                </div>
                              ))}

                              {isLoggedIn && (
                                <div className="flex gap-3 pt-2">
                                  <input
                                    value={replyDrafts[item.id] || ""}
                                    onChange={(e) =>
                                      setReplyDrafts((drafts) => ({
                                        ...drafts,
                                        [item.id]: e.target.value,
                                      }))
                                    }
                                    className="h-11 min-w-0 flex-1 rounded-xl border border-[#E8EDF5] bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#FF5A1F]"
                                    placeholder="Viết phản hồi..."
                                  />
                                  <button
                                    type="button"
                                    onClick={() => submitReply(item.id)}
                                    disabled={replyingId === item.id}
                                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0F172A] px-4 text-sm font-black text-white disabled:opacity-60"
                                  >
                                    {replyingId === item.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Send className="h-4 w-4" />
                                    )}
                                    Gửi
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-[#D8DFEA] bg-[#FBFCFE] p-10 text-center">
                      <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />
                      <p className="mt-3 text-sm font-semibold text-[#667085]">
                        Khóa học này chưa có feedback nào.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-[#E8EDF5] bg-white p-7 text-center shadow-sm">
              {course.teacherAvatarUrl ? (
                <img
                  src={resolveMediaUrl(course.teacherAvatarUrl)}
                  alt={teacherName}
                  className="mx-auto h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF4EC] text-2xl font-black text-[#FF5A1F]">
                  {getInitials(teacherName)}
                </div>
              )}
              <h3 className="mt-5 text-xl font-black text-[#0F172A]">
                {teacherName}
              </h3>
              <p className="mt-1 text-sm font-semibold text-[#667085]">
                Giảng viên phụ trách khóa học
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-lg font-black text-[#0F172A]">
                    {formatNumber(course.lessonCount)}
                  </p>
                  <p className="text-xs font-semibold text-[#667085]">
                    Bài học
                  </p>
                </div>
                <div>
                  <p className="text-lg font-black text-[#0F172A]">
                    {formatNumber(course.studentCount)}
                  </p>
                  <p className="text-xs font-semibold text-[#667085]">
                    Học viên
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#E8EDF5] bg-white p-7 shadow-sm">
              <h3 className="text-xl font-black text-[#0F172A]">
                Bạn sẽ nhận được
              </h3>
              <div className="mt-5 space-y-4">
                {[
                  `${formatNumber(course.lessonCount)} bài học trong chương trình`,
                  `${resourceCount} học liệu đi kèm từ video, PDF và Word`,
                  `Mô tả chi tiết và mục tiêu học tập rõ ràng`,
                  `Theo dõi tiến độ học tập theo từng bài giảng`,
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 text-sm font-semibold text-[#3C4A5F]"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <section className="rounded-[28px] border border-[#FFD8C7] bg-[linear-gradient(90deg,#FFF6F0_0%,#FFFFFF_55%,#FFF6F0_100%)] p-7 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#FF5A1F] shadow-sm">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#0F172A]">
                  Bạn đã sẵn sàng bắt đầu chưa?
                </h3>
                <p className="mt-2 text-sm font-medium text-[#667085]">
                  Truy cập khóa học mọi lúc, theo dõi tiến độ và học bằng chính
                  nội dung đang có trong hệ thống.
                </p>
              </div>
            </div>
            <Link
              to={isLoggedIn ? "/student" : "/login"}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#FF5A1F] px-6 text-sm font-black text-white shadow-lg shadow-orange-500/20"
            >
              {isLoggedIn ? "Tiếp tục học ngay" : "Đăng nhập để học ngay"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>

      {/* ── Add Student Modal ── */}
      {isAddStudentOpen && canManageLessons && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-5"
          style={{
            background: "rgba(15,23,42,0.45)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="relative w-full max-w-md rounded-[24px] bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E8EDF5] px-6 py-5">
              <div>
                <h2 className="text-xl font-black text-[#0F172A] flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                  Thêm học sinh vào khóa học
                </h2>
                <p className="mt-1 text-xs font-medium text-[#667085]">
                  Tìm học sinh theo email hoặc tên để đăng ký vào khóa học này
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddStudentOpen(false);
                  setSelectedStudent(null);
                  setStudentEmailQuery("");
                }}
                className="rounded-xl p-2 text-[#667085] hover:bg-[#F8F9FB] transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Search input */}
              <div className="relative">
                <label className="block text-xs font-black uppercase tracking-wider text-[#667085] mb-2">
                  Email hoặc tên học sinh
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#98A2B3]" />
                  <input
                    ref={studentInputRef}
                    type="text"
                    value={studentEmailQuery}
                    onChange={(e) => {
                      setStudentEmailQuery(e.target.value);
                      setSelectedStudent(null);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 150)
                    }
                    placeholder="Nhập email hoặc tên học sinh..."
                    className="h-12 w-full rounded-xl border border-[#D8DFEA] bg-[#F8FAFC] pl-10 pr-4 text-sm font-semibold text-[#0F172A] outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                  {isLoadingStudents && (
                    <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[#98A2B3]" />
                  )}
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && filteredStudents.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1.5 max-h-[220px] overflow-y-auto rounded-xl border border-[#E8EDF5] bg-white shadow-xl">
                    {filteredStudents.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onMouseDown={() => {
                          setSelectedStudent(student);
                          setStudentEmailQuery(student.email);
                          setShowSuggestions(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-[#F2F5F9] last:border-b-0"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-xs font-black text-blue-600">
                          {student.fullName
                            .split(" ")
                            .map((p) => p[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-[#0F172A] truncate">
                            {student.fullName}
                          </p>
                          <p className="text-xs font-medium text-[#667085] truncate">
                            {student.email}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showSuggestions &&
                  studentEmailQuery.length > 0 &&
                  filteredStudents.length === 0 &&
                  !isLoadingStudents && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1.5 rounded-xl border border-[#E8EDF5] bg-white px-4 py-4 text-center text-sm font-semibold text-[#98A2B3] shadow-xl">
                      Không tìm thấy học sinh nào
                    </div>
                  )}
              </div>

              {/* Selected student preview */}
              {selectedStudent && (
                <div className="flex items-center gap-4 rounded-2xl border-2 border-blue-200 bg-blue-50/60 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                    {selectedStudent.fullName
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-[#0F172A]">
                      {selectedStudent.fullName}
                    </p>
                    <p className="text-xs font-medium text-[#667085]">
                      {selectedStudent.email}
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-black text-white">
                    Đã chọn
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddStudentOpen(false);
                    setSelectedStudent(null);
                    setStudentEmailQuery("");
                  }}
                  className="h-12 flex-1 rounded-xl border border-[#D8DFEA] bg-white text-sm font-black text-[#0F172A] transition hover:bg-[#F8F9FB]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleEnrollStudent}
                  disabled={!selectedStudent || isEnrolling}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEnrolling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  Thêm vào khóa học
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLessonModalOpen && canManageLessons && (
        <div className="admin-modal-overlay fixed inset-0 z-[110] flex items-center justify-center p-5">
          <div className="admin-modal-shell max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[28px]">
            <form
              onSubmit={submitLesson}
              className="flex max-h-[92vh] flex-col"
            >
              <div className="flex items-start justify-between border-b border-[#E6EAF0] px-8 py-6">
                <div>
                  <h2 className="text-3xl font-black text-[#0F172A]">
                    Them bai hoc moi
                  </h2>
                  <p className="mt-2 text-sm font-medium text-[#667085]">
                    Admin va teacher co the tao bai giang bang du lieu that cua
                    he thong.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsLessonModalOpen(false);
                    resetLessonForm();
                  }}
                  className="rounded-xl p-2 text-[#667085] transition hover:bg-[#F8F9FB]"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto p-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="admin-modal-panel rounded-[24px]">
                  <div className="admin-modal-section">
                    <h3 className="admin-modal-section-title">
                      Thong tin bai hoc
                    </h3>
                    <div className="mt-6 grid gap-5">
                      <div>
                        <label className="admin-field-label">
                          Tieu de bai hoc *
                        </label>
                        <input
                          required
                          value={lessonForm.title}
                          onChange={(e) =>
                            setLessonForm({
                              ...lessonForm,
                              title: e.target.value,
                            })
                          }
                          className="admin-field-input"
                          placeholder="Nhap tieu de bai hoc"
                        />
                      </div>
                      <div>
                        <label className="admin-field-label">Mo ta</label>
                        <textarea
                          value={lessonForm.description}
                          onChange={(e) =>
                            setLessonForm({
                              ...lessonForm,
                              description: e.target.value,
                            })
                          }
                          className="admin-field-textarea"
                          placeholder="Mo ta ngan ve bai giang"
                        />
                      </div>
                      <div>
                        <label className="admin-field-label">
                          Link video bai giang
                        </label>
                        <input
                          value={lessonForm.videoUrl}
                          onChange={(e) =>
                            setLessonForm({
                              ...lessonForm,
                              videoUrl: e.target.value,
                            })
                          }
                          className="admin-field-input"
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="admin-modal-section">
                    <h3 className="admin-modal-section-title">
                      Tai lieu dinh kem
                    </h3>
                    <div className="mt-6 grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="admin-field-label">Upload PDF</label>
                        <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed border-[#D8DFEA] bg-[#FBFCFE] px-4 text-center transition hover:border-[#FF5A1F]">
                          <Upload className="mb-3 h-6 w-6 text-[#98A2B3]" />
                          <span className="text-sm font-black text-[#0F172A]">
                            {previewPdfName || "Chon tep PDF"}
                          </span>
                          <span className="mt-1 text-xs font-medium text-[#667085]">
                            Chi ho tro .pdf
                          </span>
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            className="hidden"
                            onChange={(e) =>
                              setLessonForm({
                                ...lessonForm,
                                pdfFile: e.target.files?.[0] || null,
                              })
                            }
                          />
                        </label>
                      </div>
                      <div>
                        <label className="admin-field-label">Upload Word</label>
                        <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed border-[#D8DFEA] bg-[#FBFCFE] px-4 text-center transition hover:border-[#FF5A1F]">
                          <Upload className="mb-3 h-6 w-6 text-[#98A2B3]" />
                          <span className="text-sm font-black text-[#0F172A]">
                            {previewDocName || "Chon tep Word"}
                          </span>
                          <span className="mt-1 text-xs font-medium text-[#667085]">
                            Chi ho tro .doc, .docx
                          </span>
                          <input
                            type="file"
                            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            className="hidden"
                            onChange={(e) =>
                              setLessonForm({
                                ...lessonForm,
                                documentFile: e.target.files?.[0] || null,
                              })
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <aside className="admin-modal-panel rounded-[24px] p-6">
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[#FF5A1F]">
                    Preview bài giảng
                  </p>
                  <div className="mt-6 space-y-4">
                    <div className="rounded-[20px] border border-[#E8EDF5] bg-white p-4">
                      <p className="text-lg font-black text-[#0F172A]">
                        {lessonForm.title || "Tieu de bai hoc"}
                      </p>
                      <p className="mt-2 text-sm font-medium leading-6 text-[#667085]">
                        {lessonForm.description ||
                          "Mo ta bai hoc se hien thi o day."}
                      </p>
                    </div>

                    <div className="rounded-[20px] border border-[#E8EDF5] bg-white p-4">
                      <p className="text-sm font-black text-[#0F172A]">Video</p>
                      <div className="mt-3 overflow-hidden rounded-2xl bg-[#F8FAFC]">
                        {previewVideoUrl ? (
                          <iframe
                            src={previewVideoUrl}
                            className="aspect-video w-full"
                            allowFullScreen
                          />
                        ) : (
                          <div className="flex aspect-video items-center justify-center text-sm font-semibold text-[#98A2B3]">
                            Chua co preview video
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[20px] border border-[#E8EDF5] bg-white p-4">
                      <p className="text-sm font-black text-[#0F172A]">
                        Tai lieu
                      </p>
                      <div className="mt-3 space-y-3">
                        <div className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] p-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-black text-[#0F172A]">
                              {previewPdfName || "Chua upload PDF"}
                            </p>
                            <p className="text-xs font-medium text-[#667085]">
                              PDF preview sau khi luu du lieu that
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] p-3">
                          <FileType2 className="h-5 w-5 text-amber-700" />
                          <div>
                            <p className="text-sm font-black text-[#0F172A]">
                              {previewDocName || "Chua upload Word"}
                            </p>
                            <p className="text-xs font-medium text-[#667085]">
                              Word preview sau khi luu du lieu that
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>

              <div className="flex justify-end gap-4 border-t border-[#E6EAF0] px-8 py-5">
                <button
                  type="button"
                  onClick={() => {
                    setIsLessonModalOpen(false);
                    resetLessonForm();
                  }}
                  className="h-12 rounded-xl border border-[#D8DFEA] bg-white px-8 text-sm font-black text-[#0F172A] transition hover:bg-[#F8F9FB]"
                >
                  Huy
                </button>
                <button
                  type="submit"
                  disabled={isSavingLesson}
                  className="admin-primary-btn flex h-12 items-center gap-2 rounded-xl px-8 text-sm font-black text-white transition disabled:opacity-60"
                >
                  {isSavingLesson ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Them bai hoc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
