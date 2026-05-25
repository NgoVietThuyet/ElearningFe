import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  Users,
  FileText,
  CheckCircle,
  UserPlus,
  BookOpen,
  ChevronRight,
  Search,
  Plus,
  Loader2,
  MessageSquare,
  Edit,
  Trash2,
  LayoutDashboard,
  CalendarDays,
  Activity,
  X,
  UploadCloud,
  Video,
  ClipboardCheck,
  Download,
  ExternalLink,
  Link as LinkIcon,
  Presentation,
} from "lucide-react";
import { toast } from "sonner";
import { teacherApi } from "../api/teacherApi";
import CourseFeedbackPanel from "../components/common/CourseFeedbackPanel";
import FeedbackPage from "./Feedback";

type TeacherSection =
  | "dashboard"
  | "courses"
  | "courseDetail"
  | "lessons"
  | "lessonDetail"
  | "feedback";

interface Stats {
  studentCount: number;
  lessonCount: number;
  completionRate: string;
}

export default function TeacherDashboard() {
  const [activeSection, setActiveSection] =
    useState<TeacherSection>("dashboard");
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const section = searchParams.get("section") as TeacherSection;
    if (section) {
      setActiveSection(section);
    } else {
      setActiveSection("dashboard");
    }
  }, [searchParams]);

  const [stats, setStats] = useState<Stats | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [learningItems, setLearningItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isSavingLesson, setIsSavingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [lessonForm, setLessonForm] = useState<any>({
    courseId: "",
    title: "",
    description: "",
    videoUrl: "",
    arVrUrl: "",
    quizUrl: "",
  });
  const [quizLesson, setQuizLesson] = useState<any>(null);
  const [quizForm, setQuizForm] = useState({
    title: "",
    url: "",
  });
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
  const [quizMode, setQuizMode] = useState<"create" | "edit">("create");
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([
    {
      question: "",
      options: ["", "", "", ""],
      answer: 0,
      explanation: "",
    },
  ]);
  const [quizDuration, setQuizDuration] = useState<number>(30);
  const [quizEndTime, setQuizEndTime] = useState<string>("");
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [courseStudentEmail, setCourseStudentEmail] = useState("");
  const [isEnrollingStudent, setIsEnrollingStudent] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [quizReportData, setQuizReportData] = useState<any>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportSearchQuery, setReportSearchQuery] = useState("");

  const handleOpenQuizReport = async (lessonId: number) => {
    setReportSearchQuery("");
    setIsLoadingReport(true);
    setIsReportModalOpen(true);
    try {
      const res = await teacherApi.getQuizReport(lessonId);
      setQuizReportData(res.data);
    } catch (err) {
      toast.error("Không thể tải báo cáo làm bài quiz.");
      setIsReportModalOpen(false);
    } finally {
      setIsLoadingReport(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, lessonsRes, feedbacksRes, coursesRes] =
          await Promise.all([
            teacherApi.getStats(),
            teacherApi.getLessons(),
            teacherApi.getFeedbacks(),
            teacherApi.getCourses(),
          ]);
        setStats(statsRes.data);
        setLessons(lessonsRes.data);
        setFeedbacks(feedbacksRes.data);
        setCourses(coursesRes.data);
      } catch (err) {
        console.error("Failed to fetch teacher dashboard data", err);
        toast.error("Không thể tải dữ liệu dashboard.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await teacherApi.addStudent(newStudentEmail);
      toast.success("Đã thêm học sinh vào danh sách quản lý!");
      setNewStudentEmail("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi thêm học sinh.");
    }
  };

  const handleEnrollStudentToCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse?.id || !courseStudentEmail.trim()) return;

    setIsEnrollingStudent(true);
    try {
      await teacherApi.enrollStudent(
        selectedCourse.id,
        courseStudentEmail.trim(),
      );
      setCourseStudentEmail("");
      setSelectedCourse((prev: any) =>
        prev ? { ...prev, studentCount: (prev.studentCount || 0) + 1 } : prev,
      );
      setCourses((prev) =>
        prev.map((course) =>
          Number(course.id) === Number(selectedCourse.id)
            ? { ...course, studentCount: (course.studentCount || 0) + 1 }
            : course,
        ),
      );
      const [coursesRes] = await Promise.all([
        teacherApi.getCourses(),
      ]);
      setCourses(coursesRes.data);
      const refreshedCourse = (coursesRes.data || []).find(
        (course: any) => Number(course.id) === Number(selectedCourse.id),
      );
      if (refreshedCourse) setSelectedCourse(refreshedCourse);
      toast.success("Đã thêm học sinh vào khóa học.");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Không thể thêm học sinh vào khóa học.",
      );
    } finally {
      setIsEnrollingStudent(false);
    }
  };

  const updateLessonForm = (key: string, value: any) => {
    setLessonForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.courseId) {
      toast.error("Vui lòng chọn khóa học.");
      return;
    }

    setIsSavingLesson(true);
    try {
      if (editingLesson) {
        // Edit existing lesson
        const res = await teacherApi.updateLesson(editingLesson.id, lessonForm);
        setLessons((prev) =>
          prev.map((l) => (l.id === editingLesson.id ? res.data : l)),
        );
        if (selectedCourse) {
          setSelectedCourse((prev: any) => {
            if (!prev) return prev;
            const updatedLessons = (prev.lessons || []).map((l: any) =>
              l.id === editingLesson.id ? res.data : l,
            );
            return { ...prev, lessons: updatedLessons };
          });
        }
        toast.success("Đã cập nhật bài giảng thành công.");
      } else {
        // Create new lesson
        const res = await teacherApi.createLesson(lessonForm);
        setLessons((prev) => [res.data, ...prev]);
        if (selectedCourse) {
          setSelectedCourse((prev: any) => {
            if (!prev) return prev;
            const updatedLessons = [res.data, ...(prev.lessons || [])];
            return { ...prev, lessons: updatedLessons };
          });
        }
        toast.success("Đã tạo bài giảng.");
      }
      setIsLessonModalOpen(false);
      setEditingLesson(null);
      setLessonForm({
        courseId: "",
        title: "",
        description: "",
        videoUrl: "",
        arVrUrl: "",
        quizUrl: "",
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể lưu bài giảng.");
    } finally {
      setIsSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài giảng này không?"))
      return;

    try {
      await teacherApi.deleteLesson(id);
      setLessons((prev) => prev.filter((l) => l.id !== id));
      if (selectedCourse) {
        setSelectedCourse((prev: any) => {
          if (!prev) return prev;
          const updatedLessons = (prev.lessons || []).filter(
            (l: any) => l.id !== id,
          );
          return { ...prev, lessons: updatedLessons };
        });
      }
      toast.success("Đã xóa bài giảng thành công.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Không thể xóa bài giảng.");
    }
  };

  const apiBaseUrl = (
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5081"
  ).replace(/\/$/, "");
  const toAssetUrl = (url?: string | null) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return `${apiBaseUrl}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const toVideoEmbedUrl = (url?: string | null) => {
    if (!url) return "";
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("youtube.com")) {
        const videoId = parsed.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      }
      if (parsed.hostname.includes("youtu.be")) {
        return `https://www.youtube.com/embed/${parsed.pathname.replace("/", "")}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const openLessonDetail = async (lesson: any) => {
    setSelectedLesson(lesson);
    setActiveSection("lessonDetail");
    try {
      const res = await teacherApi.getLearningItems(lesson.id);
      setLearningItems(res.data || []);
    } catch {
      setLearningItems([]);
    }
  };

  const openCourseDetail = (course: any) => {
    setSelectedCourse(course);
    setActiveSection("courseDetail");
  };

  const FileInput = ({
    label,
    field,
    accept,
  }: {
    label: string;
    field: string;
    accept: string;
  }) => (
    <label className="block rounded-2xl border border-dashed border-[#D8DFEA] bg-[#F8FAFC] p-4 transition hover:border-[#FF6B00] hover:bg-[#FFF7F0]">
      <span className="mb-2 flex items-center gap-2 text-sm font-black text-[#0F172A]">
        <UploadCloud className="h-4 w-4 text-[#FF6B00]" />
        {label}
      </span>
      <input
        type="file"
        accept={accept}
        onChange={(event) =>
          updateLessonForm(field, event.target.files?.[0] || null)
        }
        className="w-full text-xs font-semibold text-[#667085] file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-black file:text-[#FF6B00]"
      />
      {lessonForm[field]?.name && (
        <span className="mt-2 block truncate text-xs font-bold text-[#22A06B]">
          {lessonForm[field].name}
        </span>
      )}
    </label>
  );

  const handleOpenCreateQuiz = (lesson: any) => {
    setQuizMode("create");
    setEditingQuizId(null);
    setQuizLesson(lesson);
    setQuizForm({
      title: "Bài kiểm tra trắc nghiệm",
      url: lesson.quizUrl || "",
    });
    setQuizQuestions([
      {
        question: "",
        options: ["", "", "", ""],
        answer: 0,
        explanation: "",
      },
    ]);
    setQuizDuration(30);
    setQuizEndTime("");
  };

  const handleOpenEditQuiz = (item: any) => {
    setQuizMode("edit");
    setEditingQuizId(item.id);
    setQuizLesson(selectedLesson);

    let content: any = {};
    try {
      content = JSON.parse(item.content || "{}");
    } catch {
      content = {};
    }

    setQuizForm({
      title: item.title || "Bài kiểm tra",
      url: "",
    });
    setQuizQuestions(
      content.questions || [
        {
          question: "",
          options: ["", "", "", ""],
          answer: 0,
          explanation: "",
        },
      ],
    );
    setQuizDuration(content.durationMinutes || 30);
    setQuizEndTime(content.endTime ? content.endTime.slice(0, 16) : "");
  };

  const handleDeleteQuizItem = async (testId: number) => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn xóa bài kiểm tra trắc nghiệm tương tác này?",
      )
    )
      return;
    try {
      await teacherApi.deleteLearningItem(testId);
      toast.success("Xóa bài kiểm tra thành công.");
      if (selectedLesson?.id) {
        const res = await teacherApi.getLearningItems(selectedLesson.id);
        setLearningItems(res.data || []);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể xóa bài kiểm tra.");
    }
  };

  const handlePdfUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !quizLesson?.id) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error("Chỉ chấp nhận tệp định dạng PDF.");
      return;
    }

    setIsParsingPdf(true);
    try {
      const res = await teacherApi.parseQuizPdf(quizLesson.id, file);
      const parsedData = res.data;

      if (parsedData) {
        if (parsedData.title) {
          setQuizForm((prev) => ({ ...prev, title: parsedData.title }));
        }
        if (parsedData.durationMinutes) {
          setQuizDuration(parsedData.durationMinutes);
        }
        if (parsedData.questions && parsedData.questions.length > 0) {
          const mappedQuestions = parsedData.questions.map((q: any) => {
            const correctIdx =
              q.answer !== undefined
                ? q.answer
                : q.correctIndex !== undefined
                  ? q.correctIndex
                  : 0;
            return {
              question: q.question || "",
              options:
                q.options && q.options.length > 0
                  ? q.options
                  : ["", "", "", ""],
              answer: Number(correctIdx),
              explanation: q.explanation || "",
            };
          });
          setQuizQuestions(mappedQuestions);
          toast.success(
            `Đã tự động trích xuất thành công ${mappedQuestions.length} câu hỏi từ PDF!`,
          );
        } else {
          toast.warning(
            "Tệp PDF đã tải lên thành công nhưng không tìm thấy câu hỏi trắc nghiệm nào.",
          );
        }
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Lỗi khi trích xuất câu hỏi từ PDF. Vui lòng kiểm tra lại cấu trúc PDF.",
      );
    } finally {
      setIsParsingPdf(false);
      event.target.value = "";
    }
  };

  const handleSubmitQuiz = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!quizLesson?.id) return;

    if (!quizForm.title.trim()) {
      toast.error("Vui lòng nhập tên bài kiểm tra.");
      return;
    }

    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i];
      if (!q.question.trim()) {
        toast.error(`Nội dung câu hỏi ${i + 1} không được để trống.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j]?.trim()) {
          toast.error(
            `Đáp án ${String.fromCharCode(65 + j)} của câu hỏi ${i + 1} không được để trống.`,
          );
          return;
        }
      }
    }

    setIsSavingQuiz(true);
    try {
      const contentPayload = {
        type: "quiz",
        questions: quizQuestions.map((q) => ({
          question: q.question.trim(),
          options: q.options.map((opt: string) => opt.trim()),
          answer: Number(q.answer),
          correctAnswer: Number(q.answer),
          correctIndex: Number(q.answer),
          explanation: (q.explanation || "").trim(),
        })),
        durationMinutes: Number(quizDuration),
        endTime: quizEndTime || null,
      };

      const payload = {
        title: quizForm.title.trim(),
        content: JSON.stringify(contentPayload),
      };

      if (quizMode === "edit" && editingQuizId) {
        await teacherApi.updateLearningItem(editingQuizId, payload);
        toast.success(
          "Cập nhật bài kiểm tra trắc nghiệm tương tác thành công.",
        );
      } else {
        await teacherApi.createLearningItem(quizLesson.id, payload);
        toast.success("Tạo bài kiểm tra trắc nghiệm tương tác thành công.");
      }

      if (selectedLesson?.id) {
        const res = await teacherApi.getLearningItems(selectedLesson.id);
        setLearningItems(res.data || []);
      }

      setQuizLesson(null);
      setEditingQuizId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể lưu bài kiểm tra.");
    } finally {
      setIsSavingQuiz(false);
    }
  };
  const renderLessonDetail = (lesson: any) => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setActiveSection("lessons")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5 rotate-180 text-gray-400" />
        </button>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
          {lesson.title}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#0F172A]">
                Nội dung chi tiết
              </h3>
              <button className="text-[10px] font-bold uppercase bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-all">
                CHỈNH SỬA
              </button>
            </div>
            <div className="prose prose-orange max-w-none text-gray-600 font-medium">
              <p>
                Đây là nội dung chi tiết của bài giảng{" "}
                <strong>{lesson.title}</strong>. Nội dung này được thiết kế để
                cung cấp kiến thức chuyên sâu về chủ đề này.
              </p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>Phần 1: Khái niệm cơ bản</li>
                <li>Phần 2: Ứng dụng thực tế</li>
                <li>Phần 3: Bài tập củng cố</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-black text-gray-900 mb-5 tracking-tight text-xs uppercase opacity-60 tracking-widest">
              Tiến độ bài học
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-bold">
                  Số học sinh học:
                </span>
                <span className="text-sm font-black text-gray-900">
                  {lesson.studentCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-bold">
                  Hoàn thành:
                </span>
                <span className="text-sm font-black text-orange-600">
                  {lesson.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                  style={{ width: `${lesson.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overall Progress */}
      <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 rounded-xl p-8 mb-8 text-white overflow-hidden shadow-lg shadow-orange-100">
        <img
          src="/assets/dna.gif"
          alt=""
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] rotate-[-60deg] opacity-[0.12] blur-[0.5px] saturate-[0.7] pointer-events-none select-none"
        />
        <div className="relative">
          <p className="text-orange-100 text-xs font-black uppercase tracking-[0.3em] mb-2 opacity-80">
            Không gian giảng dạy
          </p>
          <h2 className="text-4xl font-black tracking-tight drop-shadow-sm">
            Chào mừng bạn trở lại! 👨‍🏫
          </h2>
          <p className="text-orange-50 mt-3 font-medium max-w-xl leading-relaxed">
            Nơi quản lý học sinh, bài giảng và theo dõi sự tiến bộ của từng cá
            nhân trong hành trình chinh phục kiến thức Sinh học.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Học sinh của tôi",
            value: stats?.studentCount || 0,
            icon: Users,
            color: "orange",
          },
          {
            label: "Bài giảng đã đăng",
            value: stats?.lessonCount || 0,
            icon: FileText,
            color: "blue",
          },
          {
            label: "Tỷ lệ hoàn thành",
            value: "63%",
            icon: CheckCircle,
            color: "green",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-xl shadow-sm border border-border hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-[#667085] uppercase tracking-widest">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-[#0F172A] mt-1 tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  stat.color === "orange"
                    ? "bg-orange-50 text-orange-600"
                    : stat.color === "blue"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-green-50 text-green-600"
                } shadow-sm`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ 1: Tiến độ các khóa học */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-border flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 shadow-sm">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#0F172A] tracking-tight">
                Tiến độ khóa học
              </h2>
              <p className="text-[10px] font-bold text-[#667085] uppercase tracking-widest mt-0.5">
                Tỉ lệ hoàn thiện khóa học
              </p>
            </div>
          </div>
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {[
              {
                name: "DNA và cơ chế tái bản của DNA",
                value: 92,
                color: "from-orange-500 to-amber-500",
              },
              {
                name: "Gene, quá trình truyền đạt thông tin và hệ gene",
                value: 78,
                color: "from-blue-500 to-indigo-500",
              },
              {
                name: "Điều hòa biểu hiện gene",
                value: 65,
                color: "from-emerald-500 to-teal-500",
              },
              {
                name: "Đột biến gene",
                value: 51,
                color: "from-rose-500 to-orange-500",
              },
              {
                name: "Công nghệ di truyền",
                value: 34,
                color: "from-violet-500 to-purple-500",
              },
            ].map((c, i) => (
              <div key={i} className="space-y-1.5 group cursor-pointer">
                <div className="flex justify-between text-xs font-bold text-[#344054]">
                  <span className="group-hover:text-[#FF6B00] transition-colors">
                    {c.name}
                  </span>
                  <span className="font-black text-[#0F172A]">{c.value}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${c.color} h-full rounded-full transition-all duration-1000 group-hover:scale-y-110`}
                    style={{ width: `${c.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Biểu đồ 2: Doughnut phân bố học sinh */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-border flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#0F172A] tracking-tight">
                Phân bố tiến trình
              </h2>
              <p className="text-[10px] font-bold text-[#667085] uppercase tracking-widest mt-0.5">
                Mức độ chuyên cần
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 flex-1">
            {/* SVG Doughnut Chart */}
            <div className="relative w-28 h-28 shrink-0">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 36 36"
              >
                {/* Background circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="3.2"
                />
                {/* Segment 1: >80% (45%) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3.2"
                  strokeDasharray="45 100"
                  strokeDashoffset="0"
                />
                {/* Segment 2: 50-80% (35%) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#FF6B00"
                  strokeWidth="3.2"
                  strokeDasharray="35 100"
                  strokeDashoffset="-45"
                />
                {/* Segment 3: <50% (20%) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#FBBF24"
                  strokeWidth="3.2"
                  strokeDasharray="20 100"
                  strokeDashoffset="-80"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-black text-[#0F172A]">68%</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  Trung bình
                </span>
              </div>
            </div>
            {/* Legend */}
            <div className="space-y-2">
              {[
                { label: "Xuất sắc (>80%)", val: "45%", color: "bg-[#10B981]" },
                { label: "Khá (50-80%)", val: "35%", color: "bg-[#FF6B00]" },
                { label: "Cố gắng (<50%)", val: "20%", color: "bg-[#FBBF24]" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-[10px] font-bold text-slate-500"
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`}
                  />
                  <span className="truncate">{item.label}</span>
                  <span className="font-black text-[#0F172A] ml-auto shrink-0">
                    {item.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bài giảng mới đăng */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-border overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-[#0F172A] tracking-tight">
              Bài giảng mới đăng
            </h2>
            <button
              onClick={() => setActiveSection("lessons")}
              className="text-[9px] text-[#FF6B00] font-bold uppercase tracking-widest hover:underline px-2.5 py-1 bg-orange-50 rounded-md"
            >
              Xem tất cả
            </button>
          </div>
          <div className="space-y-2.5 max-h-[190px] overflow-y-auto custom-scrollbar pr-2 flex-1">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:border-orange-200 hover:bg-orange-50/30 transition-all group cursor-pointer"
                onClick={() => openLessonDetail(lesson)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-bold text-xs text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {lesson.title}
                  </h3>
                  <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest shrink-0">
                    {lesson.date}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[8px] text-gray-400 font-black uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                    <Users className="w-2.5 h-2.5 text-blue-500" />{" "}
                    {lesson.studentCount} HỌC SINH
                  </span>
                  <span className="text-orange-500 font-black">
                    {lesson.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">
          Giảng dạy
        </p>
        <h2 className="text-3xl font-black tracking-tight text-[#0F172A]">
          Khóa học của tôi
        </h2>
        <p className="text-sm font-semibold text-[#667085]">
          Danh sách khóa học bạn đang được phân quyền phụ trách.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <button
            key={course.id}
            onClick={() => openCourseDetail(course)}
            className="group overflow-hidden rounded-[28px] border border-gray-100 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative h-44 bg-[#0F172A]">
              {course.avatarUrl ? (
                <img
                  src={course.avatarUrl}
                  alt={course.title}
                  className="h-full w-full object-cover opacity-90 transition group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-600 to-orange-500 text-white">
                  <BookOpen className="h-14 w-14" />
                </div>
              )}
              <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-[#FF5A1F]">
                {course.lessonCount || 0} bài giảng
              </div>
            </div>
            <div className="p-6">
              <h3 className="line-clamp-2 text-xl font-black text-[#0F172A] group-hover:text-[#FF5A1F]">
                {course.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[#667085]">
                {course.description || "Chưa có mô tả khóa học."}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#F8FAFC] p-3">
                  <p className="text-xs font-bold text-[#98A2B3]">Học sinh</p>
                  <p className="mt-1 text-lg font-black text-[#0F172A]">
                    {course.studentCount || 0}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#F8FAFC] p-3">
                  <p className="text-xs font-bold text-[#98A2B3]">Tiến độ</p>
                  <p className="mt-1 text-lg font-black text-[#0F172A]">
                    {course.avgProgress || course.averageProgress || 0}%
                  </p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      {courses.length === 0 && (
        <div className="rounded-[28px] border border-dashed border-gray-200 bg-white p-10 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-bold text-gray-500">
            Bạn chưa được phân quyền khóa học nào.
          </p>
        </div>
      )}
    </div>
  );

  const renderCourseDetail = (course: any) => {
    if (!course) return null;
    const courseLessons = lessons.filter(
      (lesson) => Number(lesson.courseId) === Number(course.id),
    );

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveSection("courses")}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-500 shadow-sm transition hover:bg-gray-50"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
              Khóa học
            </p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-[#0F172A]">
              {course.title}
            </h2>
          </div>
        </div>

        <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-black text-[#0F172A]">
                Bài giảng trong khóa học
              </h3>
              <p className="mt-1 text-sm font-semibold text-[#667085]">
                {courseLessons.length} bài giảng đang có trong khóa học này.
              </p>
            </div>
            <button
              onClick={() => {
                updateLessonForm("courseId", course.id);
                setIsLessonModalOpen(true);
              }}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FF5A1F] px-5 text-sm font-black text-white"
            >
              <Plus className="h-4 w-4" />
              Thêm bài giảng
            </button>
          </div>


          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courseLessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => openLessonDetail(lesson)}
                className="rounded-2xl border border-gray-100 bg-[#FBFCFE] p-5 text-left transition hover:border-orange-200 hover:bg-[#FFF8F3]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                  <FileText className="h-6 w-6" />
                </div>
                <h4 className="line-clamp-2 text-lg font-black text-[#0F172A]">
                  {lesson.title}
                </h4>
                <p className="mt-2 line-clamp-2 text-sm font-semibold text-[#667085]">
                  {lesson.description || "Chưa có mô tả."}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-xs font-black uppercase text-gray-400">
                  <span>{lesson.quizCount || 0} quiz</span>
                  <span>{lesson.date}</span>
                </div>
              </button>
            ))}
          </div>
          {courseLessons.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-8 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm font-bold text-gray-500">
                Khóa học này chưa có bài giảng.
              </p>
            </div>
          )}
        </div>

        <CourseFeedbackPanel
          courseId={course.id}
          teacherId={course.teacherId || course.createdBy || null}
          canWrite
          title="Đánh giá khóa học"
        />
      </div>
    );
  };

  const renderLessons = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Quản lý bài giảng
          </h2>
          <button
            onClick={() => {
              setEditingLesson(null);
              setLessonForm({
                courseId: "",
                title: "",
                description: "",
                videoUrl: "",
                arVrUrl: "",
                quizUrl: "",
              });
              setIsLessonModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all text-xs font-black shadow-lg shadow-orange-100 uppercase tracking-widest"
          >
            <Plus className="w-5 h-5" /> TẠO BÀI GIẢNG MỚI
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white p-8 rounded-3xl border border-gray-50 hover:shadow-xl transition-all group card-lift relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white group-hover:rotate-6 transition-all duration-300 shadow-sm">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingLesson(lesson);
                      setLessonForm({
                        courseId: lesson.courseId || "",
                        title: lesson.title || "",
                        description: lesson.description || "",
                        videoUrl: lesson.videoUrl || "",
                        arVrUrl: lesson.arVrUrl || "",
                        quizUrl: lesson.quizUrl || "",
                      });
                      setIsLessonModalOpen(true);
                    }}
                    className="p-2.5 hover:bg-orange-50 rounded-xl text-gray-400 hover:text-orange-600 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCreateQuiz(lesson);
                    }}
                    className="p-2.5 hover:bg-blue-50 rounded-xl text-gray-400 hover:text-blue-600 transition-colors"
                    title="Thêm bài kiểm tra"
                  >
                    <ClipboardCheck className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLesson(lesson.id);
                    }}
                    className="p-2.5 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-colors"
                    title="Xóa bài giảng"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
              <h3
                className="font-black text-gray-900 mb-3 group-hover:text-orange-600 transition-colors cursor-pointer text-xl leading-tight"
                onClick={() => openLessonDetail(lesson)}
              >
                {lesson.title}
              </h3>
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] pt-4 border-t border-gray-50">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />{" "}
                  {lesson.studentCount} HỌC VIÊN
                </span>
                <span className="text-gray-300">
                  {lesson.quizCount || 0} QUIZ
                </span>
              </div>
            </div>
          ))}
          <div
            onClick={() => {
              setEditingLesson(null);
              setLessonForm({
                courseId: "",
                title: "",
                description: "",
                videoUrl: "",
                arVrUrl: "",
                quizUrl: "",
              });
              setIsLessonModalOpen(true);
            }}
            className="border-2 border-dashed border-gray-100 rounded-3xl p-8 flex flex-col items-center justify-center text-gray-300 hover:border-orange-400 hover:bg-orange-50/10 hover:text-orange-500 transition-all group min-h-[240px] cursor-pointer"
          >
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-all">
              <Plus className="w-10 h-10 group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-black uppercase text-xs tracking-[0.2em]">
              Thêm bài học mới
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-10">
      <div className="flex flex-col gap-3">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter">
          Phản hồi của học viên
        </h2>
        <p className="text-gray-500 font-bold max-w-2xl leading-relaxed">
          Lắng nghe những đóng góp từ các bạn học viên để không ngừng cải tiến
          phương pháp giảng dạy và nội dung học liệu.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {feedbacks.map((fb) => (
          <div
            key={fb.id}
            className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center text-orange-700 font-black text-xl shadow-sm border border-white">
                  {fb.student.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-xl tracking-tight group-hover:text-orange-600 transition-colors">
                    {fb.student}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">
                    Khóa học:{" "}
                    <span className="text-orange-500">{fb.course}</span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest">
                {fb.date}
              </span>
            </div>
            <div className="bg-gray-50/50 p-6 rounded-[1.5rem] border border-gray-50">
              <p className="text-gray-600 text-sm font-medium italic leading-relaxed">
                "{fb.content}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
            <div className="absolute inset-0 blur-xl bg-orange-500/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="pt-6">
            <div className="pb-16">
              {activeSection === "dashboard" && renderDashboard()}
              {activeSection === "courses" && renderCourses()}
              {activeSection === "courseDetail" &&
                renderCourseDetail(selectedCourse)}
              {activeSection === "lessons" && renderLessons()}
              {activeSection === "lessonDetail" &&
                renderLessonDetailV2(selectedLesson)}
              {activeSection === "feedback" && <FeedbackPage />}
            </div>
          </div>
        </>
      )}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/45 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSaveLesson}
            className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#E6EAF0] bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-[#EEF2F6] px-8 py-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-[#0F172A]">
                  {editingLesson ? "Chỉnh sửa bài giảng" : "Tạo bài giảng mới"}
                </h2>
                <p className="mt-1 text-sm font-semibold text-[#667085]">
                  {editingLesson
                    ? "Cập nhật tài liệu, slide, AR/VR, video và bài quiz cho học sinh."
                    : "Thêm giáo án, slide, AR/VR, video và bài quiz cho học sinh."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLessonModalOpen(false)}
                className="rounded-full p-2 text-[#667085] transition hover:bg-[#F2F4F7] hover:text-[#0F172A]"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="max-h-[calc(92vh-160px)] overflow-y-auto px-8 py-7">
              <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                <section className="rounded-3xl border border-[#E6EAF0] bg-white p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF4EC] text-[#FF6B00]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-black text-[#0F172A]">
                      Thông tin bài giảng
                    </h3>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-black text-[#344054]">
                        Khóa học *
                      </span>
                      <select
                        required
                        value={lessonForm.courseId}
                        onChange={(event) =>
                          updateLessonForm("courseId", event.target.value)
                        }
                        className="h-12 w-full rounded-xl border border-[#D8DFEA] bg-white px-4 text-sm font-bold outline-none transition focus:border-[#FF6B00]"
                      >
                        <option value="">Chọn khóa học</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-black text-[#344054]">
                        Tên bài giảng *
                      </span>
                      <input
                        required
                        value={lessonForm.title}
                        onChange={(event) =>
                          updateLessonForm("title", event.target.value)
                        }
                        className="h-12 w-full rounded-xl border border-[#D8DFEA] px-4 text-sm font-bold outline-none transition focus:border-[#FF6B00]"
                        placeholder="VD: Cấu trúc không gian của ADN"
                      />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-2 flex items-center gap-2 text-sm font-black text-[#344054]">
                        <Video className="h-4 w-4 text-[#FF6B00]" /> Link video
                        bài học
                      </span>
                      <input
                        value={lessonForm.videoUrl}
                        onChange={(event) =>
                          updateLessonForm("videoUrl", event.target.value)
                        }
                        className="h-12 w-full rounded-xl border border-[#D8DFEA] px-4 text-sm font-bold outline-none transition focus:border-[#FF6B00]"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm font-black text-[#344054]">
                        Mô tả bài giảng
                      </span>
                      <textarea
                        value={lessonForm.description}
                        onChange={(event) =>
                          updateLessonForm("description", event.target.value)
                        }
                        rows={5}
                        className="w-full rounded-xl border border-[#D8DFEA] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#FF6B00]"
                        placeholder="Mục tiêu bài học, nội dung chính, hướng dẫn học tập..."
                      />
                    </label>
                  </div>
                </section>

                <section className="rounded-3xl border border-[#E6EAF0] bg-[#FBFCFE] p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ECFDF3] text-[#16A34A]">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-black text-[#0F172A]">
                      Tài nguyên đính kèm
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <FileInput
                      label="Giáo án (PDF, Word)"
                      field="lessonPlanFile"
                      accept=".pdf,.doc,.docx"
                    />
                    <FileInput
                      label="Slide (PDF, PowerPoint)"
                      field="slideFile"
                      accept=".pdf,.ppt,.pptx"
                    />
                    <FileInput
                      label="Bài tập (Word, PDF)"
                      field="documentFile"
                      accept=".pdf,.doc,.docx"
                    />
                    <label className="block">
                      <span className="mb-2 block text-sm font-black text-[#344054]">
                        AR/VR (link)
                      </span>
                      <input
                        value={lessonForm.arVrUrl || ""}
                        onChange={(event) =>
                          updateLessonForm("arVrUrl", event.target.value)
                        }
                        className="h-12 w-full rounded-xl border border-[#D8DFEA] px-4 text-sm font-bold outline-none transition focus:border-[#FF6B00]"
                        placeholder="https://..."
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-black text-[#344054]">
                        Bài kiểm tra (link)
                      </span>
                      <input
                        type="url"
                        value={lessonForm.quizUrl || ""}
                        onChange={(event) =>
                          updateLessonForm("quizUrl", event.target.value)
                        }
                        className="h-12 w-full rounded-xl border border-[#D8DFEA] px-4 text-sm font-bold outline-none transition focus:border-[#FF6B00]"
                        placeholder="https://forms.gle/... hoặc link quiz"
                      />
                    </label>
                  </div>
                </section>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#EEF2F6] bg-[#FCFCFD] px-8 py-5">
              <button
                type="button"
                onClick={() => setIsLessonModalOpen(false)}
                className="h-12 rounded-xl border border-[#D8DFEA] bg-white px-8 text-sm font-black text-[#0F172A] transition hover:bg-[#F8FAFC]"
              >
                Hủy
              </button>
              <button
                disabled={isSavingLesson}
                type="submit"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#FF5A1F] px-8 text-sm font-black text-white shadow-lg shadow-orange-100 transition hover:bg-[#E84A0C] disabled:opacity-60"
              >
                {isSavingLesson ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingLesson ? (
                  <Edit className="h-4.5 w-4.5" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {editingLesson ? "Lưu thay đổi" : "Tạo bài giảng"}
              </button>
            </div>
          </form>
        </div>
      )}
      {quizLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/45 p-4 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleSubmitQuiz}
            className="my-8 w-full max-w-5xl rounded-[28px] border border-[#E6EAF0] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#EEF2F6] px-8 py-6 shrink-0 bg-[#FBFDFE]">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-[#0F172A]">
                  {quizMode === "edit"
                    ? "Chỉnh sửa bài kiểm tra tương tác"
                    : "Tạo bài kiểm tra tương tác"}
                </h2>
                <p className="mt-1 text-sm font-semibold text-[#667085]">
                  Bài giảng:{" "}
                  <span className="text-[#FF5A1F]">{quizLesson.title}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQuizLesson(null);
                  setEditingQuizId(null);
                }}
                className="rounded-full p-2 text-[#667085] transition hover:bg-[#F2F4F7]"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-8 py-7 space-y-6">
              {/* Settings Group */}
              <div className="grid gap-5 md:grid-cols-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-[#344054]">
                    Tên bài kiểm tra *
                  </span>
                  <input
                    required
                    value={quizForm.title}
                    onChange={(event) =>
                      setQuizForm((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-xl border border-[#D8DFEA] px-4 text-sm font-bold outline-none transition focus:border-[#FF6B00]"
                    placeholder="VD: Kiểm tra Sinh học tế bào"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-[#344054]">
                    Thời gian làm bài (phút) *
                  </span>
                  <input
                    required
                    type="number"
                    min={1}
                    value={quizDuration}
                    onChange={(event) =>
                      setQuizDuration(Math.max(1, Number(event.target.value)))
                    }
                    className="h-12 w-full rounded-xl border border-[#D8DFEA] px-4 text-sm font-bold outline-none transition focus:border-[#FF6B00]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-[#344054]">
                    Hạn chót làm bài (Không bắt buộc)
                  </span>
                  <input
                    type="datetime-local"
                    value={quizEndTime}
                    onChange={(event) => setQuizEndTime(event.target.value)}
                    className="h-12 w-full rounded-xl border border-[#D8DFEA] px-4 text-sm font-bold outline-none transition focus:border-[#FF6B00]"
                  />
                </label>
              </div>

              {/* PDF Parser Dropzone */}
              <div className="rounded-2xl border border-dashed border-[#D8DFEA] bg-[#F8FAFC] p-6 text-center hover:bg-[#FFF7F0] hover:border-[#FF6B00] transition group/drop">
                <UploadCloud className="mx-auto h-12 w-12 text-[#667085] group-hover/drop:text-[#FF6B00] transition" />
                <h4 className="mt-3 text-base font-black text-[#0F172A]">
                  Tạo nhanh câu hỏi bằng PDF đề thi
                </h4>
                <p className="mt-1 text-xs font-semibold text-[#667085] max-w-lg mx-auto leading-relaxed">
                  Tải lên tệp PDF chứa câu hỏi trắc nghiệm của bạn. Hệ thống AI
                  sẽ tự động phân tích và trích xuất câu hỏi vào trình tạo bên
                  dưới để bạn duyệt chỉnh sửa!
                </p>
                <div className="mt-4 flex items-center justify-center">
                  <label className="cursor-pointer inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 text-sm font-black text-white shadow-md transition hover:bg-orange-700">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                      disabled={isParsingPdf}
                    />
                    {isParsingPdf ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang phân tích PDF...
                      </>
                    ) : (
                      <>
                        <Presentation className="h-4 w-4" />
                        Chọn file PDF đề thi
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Manual Question Editor List */}
              <div className="space-y-6 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-[#0F172A]">
                    Danh sách câu hỏi trắc nghiệm
                  </h3>
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Tổng số: {quizQuestions.length} câu
                  </span>
                </div>

                <div className="space-y-6">
                  {quizQuestions.map((question: any, questionIndex: number) => (
                    <div
                      key={questionIndex}
                      className="rounded-2xl border border-slate-200/80 p-6 bg-white relative hover:border-orange-200 transition-all shadow-sm"
                    >
                      <div className="absolute top-6 right-6">
                        <button
                          type="button"
                          disabled={quizQuestions.length <= 1}
                          onClick={() => {
                            const newQuestions = quizQuestions.filter(
                              (_, idx) => idx !== questionIndex,
                            );
                            setQuizQuestions(newQuestions);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-40"
                          title="Xóa câu hỏi này"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="max-w-[calc(100%-48px)]">
                        <label className="mb-2 block text-sm font-black text-[#0F172A] flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-xs font-black">
                            {questionIndex + 1}
                          </span>
                          Nội dung câu hỏi trắc nghiệm *
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={question.question || ""}
                          onChange={(e) => {
                            const newQuestions = [...quizQuestions];
                            newQuestions[questionIndex] = {
                              ...newQuestions[questionIndex],
                              question: e.target.value,
                            };
                            setQuizQuestions(newQuestions);
                          }}
                          className="w-full rounded-xl border border-[#D8DFEA] px-4 py-3 text-sm font-semibold outline-none focus:border-[#FF6B00]"
                          placeholder="Nhập nội dung câu hỏi trắc nghiệm..."
                        />
                      </div>

                      {/* Options Inputs */}
                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        {["A", "B", "C", "D"].map((char, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center gap-3"
                          >
                            <span className="text-sm font-black text-slate-400 w-4">
                              {char}
                            </span>
                            <input
                              required
                              type="text"
                              value={question.options?.[optionIndex] || ""}
                              onChange={(e) => {
                                const newQuestions = [...quizQuestions];
                                const options = [
                                  ...(newQuestions[questionIndex].options || [
                                    "",
                                    "",
                                    "",
                                    "",
                                  ]),
                                ];
                                options[optionIndex] = e.target.value;
                                newQuestions[questionIndex] = {
                                  ...newQuestions[questionIndex],
                                  options,
                                };
                                setQuizQuestions(newQuestions);
                              }}
                              className="h-11 flex-1 rounded-xl border border-[#D8DFEA] px-4 text-sm font-semibold outline-none focus:border-[#FF6B00]"
                              placeholder={`Nhập phương án ${char}...`}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Correct Option & Explanation */}
                      <div className="mt-5 grid gap-5 md:grid-cols-3">
                        <div className="md:col-span-1">
                          <label className="mb-2 block text-sm font-black text-[#0F172A]">
                            Đáp án đúng *
                          </label>
                          <select
                            value={Number(question.answer || 0)}
                            onChange={(e) => {
                              const newQuestions = [...quizQuestions];
                              newQuestions[questionIndex] = {
                                ...newQuestions[questionIndex],
                                answer: Number(e.target.value),
                              };
                              setQuizQuestions(newQuestions);
                            }}
                            className="h-11 w-full rounded-xl border border-[#D8DFEA] px-4 text-sm font-black text-slate-700 outline-none focus:border-[#FF6B00]"
                          >
                            <option value={0}>Phương án A</option>
                            <option value={1}>Phương án B</option>
                            <option value={2}>Phương án C</option>
                            <option value={3}>Phương án D</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-black text-[#0F172A]">
                            Lời giải thích (Tùy chọn)
                          </label>
                          <input
                            type="text"
                            value={question.explanation || ""}
                            onChange={(e) => {
                              const newQuestions = [...quizQuestions];
                              newQuestions[questionIndex] = {
                                ...newQuestions[questionIndex],
                                explanation: e.target.value,
                              };
                              setQuizQuestions(newQuestions);
                            }}
                            className="h-11 w-full rounded-xl border border-[#D8DFEA] px-4 text-sm font-semibold outline-none focus:border-[#FF6B00]"
                            placeholder="Giải thích ngắn gọn cho đáp án đúng..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setQuizQuestions([
                        ...quizQuestions,
                        {
                          question: "",
                          options: ["", "", "", ""],
                          answer: 0,
                          explanation: "",
                        },
                      ]);
                    }}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-dashed border-orange-500 bg-orange-50/30 px-6 text-sm font-black text-[#FF5A1F] hover:bg-orange-50 transition"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm câu hỏi trắc nghiệm mới
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-[#EEF2F6] bg-[#FCFCFD] px-8 py-5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setQuizLesson(null);
                  setEditingQuizId(null);
                }}
                className="h-12 rounded-xl border border-[#D8DFEA] bg-white px-8 text-sm font-black text-[#0F172A] hover:bg-slate-50 transition"
              >
                Hủy bỏ
              </button>
              <button
                disabled={isSavingQuiz}
                type="submit"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#FF5A1F] px-8 text-sm font-black text-white shadow-lg shadow-orange-100 hover:bg-[#E84A0C] transition disabled:opacity-60"
              >
                {isSavingQuiz ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ClipboardCheck className="h-4 w-4" />
                )}
                Lưu bài kiểm tra
              </button>
            </div>
          </form>
        </div>
      )}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/45 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-5xl rounded-[28px] border border-[#E6EAF0] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#EEF2F6] px-8 py-6 shrink-0 bg-[#FBFDFE]">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-[#0F172A] flex items-center gap-2">
                  <Activity className="h-6 w-6 text-orange-500 animate-pulse" />
                  Báo cáo tình trạng làm bài kiểm tra
                </h2>
                <p className="mt-1 text-sm font-semibold text-[#667085]">
                  Bài giảng:{" "}
                  <span className="text-[#FF5A1F]">
                    {quizReportData?.lessonTitle || selectedLesson?.title}
                  </span>{" "}
                  • Khóa học:{" "}
                  <span className="font-bold text-[#0F172A]">
                    {quizReportData?.courseTitle || selectedLesson?.courseTitle}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsReportModalOpen(false);
                  setQuizReportData(null);
                }}
                className="rounded-full p-2 text-[#667085] transition hover:bg-[#F2F4F7]"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-8 py-7">
              {isLoadingReport ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                  <p className="text-sm font-bold text-gray-500">
                    Đang tổng hợp dữ liệu báo cáo...
                  </p>
                </div>
              ) : !quizReportData ||
                !quizReportData.students ||
                quizReportData.students.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <Users className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="text-sm font-bold text-gray-500">
                    Chưa có học sinh nào đăng ký học khóa học này.
                  </p>
                </div>
              ) : (
                (() => {
                  const filteredReportStudents = quizReportData.students.filter(
                    (student: any) => {
                      const query = reportSearchQuery.trim().toLowerCase();
                      if (!query) return true;
                      return (
                        (student.fullName || "")
                          .toLowerCase()
                          .includes(query) ||
                        (student.email || "").toLowerCase().includes(query)
                      );
                    },
                  );

                  return (
                    <div className="space-y-6">
                      {/* Statistics Widgets */}
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Tổng số học sinh
                          </p>
                          <p className="mt-1 text-2xl font-black text-[#0F172A]">
                            {quizReportData.students.length}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Tổng số bài Quiz
                          </p>
                          <p className="mt-1 text-2xl font-black text-[#0F172A]">
                            {quizReportData.quizzes?.length || 0}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Tỷ lệ nộp bài
                          </p>
                          <p className="mt-1 text-2xl font-black text-orange-600">
                            {(() => {
                              const totalAttempts =
                                quizReportData.students.reduce(
                                  (acc: number, s: any) =>
                                    acc +
                                    s.quizAttempts.filter(
                                      (a: any) => a.hasAttempted,
                                    ).length,
                                  0,
                                );
                              const totalPossible =
                                quizReportData.students.length *
                                (quizReportData.quizzes?.length || 0);
                              return totalPossible > 0
                                ? `${Math.round((totalAttempts / totalPossible) * 100)}%`
                                : "0%";
                            })()}
                          </p>
                        </div>
                      </div>

                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={reportSearchQuery}
                          onChange={(e) => setReportSearchQuery(e.target.value)}
                          placeholder="Tìm kiếm học sinh theo họ tên hoặc email..."
                          className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-xs font-bold text-[#0F172A] transition-all placeholder:text-slate-400"
                        />
                        {reportSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setReportSearchQuery("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-black text-xs"
                          >
                            Xóa
                          </button>
                        )}
                      </div>

                      {/* Report Content */}
                      {filteredReportStudents.length === 0 ? (
                        <div className="text-center py-16 border border-dashed border-slate-200 rounded-3xl bg-slate-50/20 space-y-3">
                          <Search className="mx-auto h-8 w-8 text-slate-300" />
                          <p className="text-sm font-bold text-gray-400">
                            Không tìm thấy học sinh nào khớp với từ khóa "
                            {reportSearchQuery}"
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead className="bg-slate-50/80 border-b border-slate-100">
                                <tr>
                                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[260px]">
                                    Học sinh
                                  </th>
                                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[200px]">
                                    Email
                                  </th>
                                  {quizReportData.quizzes?.map((quiz: any) => (
                                    <th
                                      key={quiz.id}
                                      className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[180px]"
                                    >
                                      {quiz.title}
                                    </th>
                                  ))}
                                  {(!quizReportData.quizzes ||
                                    quizReportData.quizzes.length === 0) && (
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                      Không có bài quiz
                                    </th>
                                  )}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {filteredReportStudents.map((student: any) => (
                                  <tr
                                    key={student.studentId}
                                    className="hover:bg-slate-50/50 transition-colors"
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 font-black text-xs text-orange-600">
                                          {student.fullName?.charAt(0) || "U"}
                                        </div>
                                        <span className="text-sm font-black text-slate-800">
                                          {student.fullName}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-400 italic">
                                      {student.email}
                                    </td>
                                    {student.quizAttempts?.map(
                                      (attempt: any) => (
                                        <td
                                          key={attempt.testId}
                                          className="px-6 py-4 whitespace-nowrap"
                                        >
                                          {attempt.hasAttempted ? (
                                            <div className="space-y-1">
                                              <div className="flex items-center gap-2">
                                                <span
                                                  className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-black ${
                                                    attempt.status === "PASSED"
                                                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                      : "bg-red-50 text-red-600 border border-red-100"
                                                  }`}
                                                >
                                                  {attempt.status === "PASSED"
                                                    ? "ĐẠT"
                                                    : "CHƯA ĐẠT"}
                                                </span>
                                                <span className="text-sm font-black text-slate-800">
                                                  {attempt.score} đ
                                                </span>
                                              </div>
                                              {attempt.completedAt && (
                                                <p className="text-[9px] font-semibold text-slate-400">
                                                  {new Date(
                                                    attempt.completedAt,
                                                  ).toLocaleDateString(
                                                    "vi-VN",
                                                  )}{" "}
                                                  {new Date(
                                                    attempt.completedAt,
                                                  ).toLocaleTimeString(
                                                    "vi-VN",
                                                    {
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                    },
                                                  )}
                                                </p>
                                              )}
                                            </div>
                                          ) : (
                                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-black bg-slate-50 text-slate-400 border border-slate-100">
                                              CHƯA LÀM BÀI
                                            </span>
                                          )}
                                        </td>
                                      ),
                                    )}
                                    {(!student.quizAttempts ||
                                      student.quizAttempts.length === 0) && (
                                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-400 italic">
                                        Không có dữ liệu
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-[#EEF2F6] bg-[#FCFCFD] px-8 py-5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsReportModalOpen(false);
                  setQuizReportData(null);
                }}
                className="h-12 rounded-xl border border-[#D8DFEA] bg-white px-8 text-sm font-black text-[#0F172A] hover:bg-slate-50 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderLessonDetailV2(lesson: any) {
    if (!lesson) return null;

    const videoEmbedUrl = toVideoEmbedUrl(lesson.videoUrl);
    const resources = [
      {
        label: "Giáo án",
        desc: "PDF, DOC hoặc DOCX",
        url: lesson.lessonPlanUrl,
        name: lesson.lessonPlanFileName,
        icon: BookOpen,
        color: "bg-orange-50 text-orange-600",
      },
      {
        label: "Slide",
        desc: "PDF, PPT hoặc PPTX",
        url: lesson.slideUrl,
        name: lesson.slideFileName,
        icon: Presentation,
        color: "bg-blue-50 text-blue-600",
      },
      {
        label: "Bài tập",
        desc: "PDF, DOC hoặc DOCX",
        url: lesson.documentUrl,
        name: lesson.documentName,
        icon: FileText,
        color: "bg-emerald-50 text-emerald-600",
      },
      {
        label: "AR/VR",
        desc: "Liên kết trải nghiệm tương tác",
        url: lesson.arVrUrl,
        name: lesson.arVrUrl,
        icon: LinkIcon,
        color: "bg-violet-50 text-violet-600",
      },
    ];

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveSection("lessons")}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-500 shadow-sm transition hover:bg-gray-50"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                {lesson.courseTitle || "Bài giảng"}
              </p>
              <h2 className="mt-1 text-3xl font-black tracking-tight text-[#0F172A]">
                {lesson.title}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleOpenQuizReport(lesson.id)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 text-sm font-black text-gray-700 transition hover:bg-slate-50 shadow-sm"
            >
              <Activity className="h-4.5 w-4.5 text-orange-500" />
              Tình trạng làm bài
            </button>
            <button
              onClick={() => handleOpenCreateQuiz(lesson)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#FF5A1F] px-6 text-sm font-black text-white shadow-lg shadow-orange-100 transition hover:bg-[#E84A0C]"
            >
              <ClipboardCheck className="h-4 w-4" />
              Thêm bài kiểm tra
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <section className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <h3 className="flex items-center gap-2 text-lg font-black text-[#0F172A]">
                <Video className="h-5 w-5 text-[#FF5A1F]" />
                Video bài học
              </h3>
            </div>
            <div className="aspect-video bg-[#0F172A]">
              {videoEmbedUrl ? (
                <iframe
                  src={videoEmbedUrl}
                  title={lesson.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center text-white">
                  <Video className="mb-3 h-12 w-12 opacity-70" />
                  <p className="text-sm font-bold opacity-80">
                    Chưa có link video bài học
                  </p>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-gray-400">
                Tiến độ bài học
              </h3>
              <div className="space-y-5">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-500">Học sinh</span>
                  <span className="font-black text-[#0F172A]">
                    {lesson.studentCount || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-500">Hoàn thành</span>
                  <span className="font-black text-orange-600">
                    {lesson.progress || 0}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-[#FF5A1F]"
                    style={{ width: `${lesson.progress || 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-500">Bài kiểm tra</span>
                  <span className="font-black text-[#0F172A]">
                    {lesson.quizUrl ? 1 : 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-black text-[#0F172A]">Mô tả</h3>
              <p className="whitespace-pre-line text-sm font-semibold leading-7 text-gray-600">
                {lesson.description || "Chưa có mô tả cho bài giảng này."}
              </p>
            </div>
          </aside>
        </div>

        <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-black text-[#0F172A]">
              Tài nguyên bài giảng
            </h3>
            <span className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">
              Preview / tải xuống
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {resources.map((resource) => {
              const href = toAssetUrl(resource.url);
              const Icon = resource.icon;
              return (
                <div
                  key={resource.label}
                  className="rounded-2xl border border-gray-100 bg-[#FBFCFE] p-5"
                >
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${resource.color}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-black text-[#0F172A]">
                    {resource.label}
                  </h4>
                  <p className="mt-1 text-xs font-bold text-gray-400">
                    {resource.desc}
                  </p>
                  <p className="mt-3 min-h-5 truncate text-sm font-bold text-gray-600">
                    {resource.name || "Chưa có tài nguyên"}
                  </p>
                  {href ? (
                    <div className="mt-4 flex gap-2">
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-xs font-black text-[#0F172A] transition hover:border-orange-200 hover:text-orange-600"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Preview
                      </a>
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF4EC] text-[#FF5A1F] transition hover:bg-[#FFE6D8]"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  ) : (
                    <div className="mt-4 flex h-10 items-center justify-center rounded-xl border border-dashed border-gray-200 text-xs font-black text-gray-400">
                      Trống
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-black text-[#0F172A]">Bài kiểm tra</h3>
            <button
              onClick={() => handleOpenCreateQuiz(lesson)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#FFF4EC] px-4 text-xs font-black text-[#FF5A1F]"
            >
              <Plus className="h-4 w-4" />
              Thêm quiz
            </button>
          </div>
          <div className="space-y-3">
            {/* Real Interactive Quizzes */}
            {learningItems && learningItems.length > 0
              ? learningItems.map((item) => {
                  let parsedContent: any = {};
                  try {
                    parsedContent = JSON.parse(item.content || "{}");
                  } catch {
                    parsedContent = {};
                  }
                  const questionCount = parsedContent.questions?.length || 0;
                  const duration = parsedContent.durationMinutes || 30;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-[#FBFCFE] px-5 py-4 transition-all hover:border-orange-200 hover:bg-orange-50/10 group/quiz"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF5A1F] transition-all group-hover/quiz:bg-orange-100">
                          <ClipboardCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-black text-[#0F172A] group-hover/quiz:text-orange-600 transition-all">
                            {item.title || "Bài kiểm tra tương tác"}
                          </p>
                          <p className="text-xs font-bold text-gray-400 mt-0.5">
                            {questionCount} câu hỏi • {duration} phút
                            {parsedContent.endTime &&
                              ` • Hạn: ${new Date(parsedContent.endTime).toLocaleDateString("vi-VN")}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() =>
                            window.open(
                              `/take-quiz/${lesson.id}/${item.id}`,
                              "_blank",
                            )
                          }
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-600 hover:bg-slate-50 transition"
                          title="Xem thử bài quizz (Mở trang mới)"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Xem thử
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditQuiz(item)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-orange-50 px-3 text-xs font-bold text-[#FF5A1F] hover:bg-orange-100 transition"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuizItem(item.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              : null}

            {/* External Link quiz (Backward compatibility) */}
            {lesson.quizUrl && (
              <button
                type="button"
                onClick={() =>
                  window.open(lesson.quizUrl, "_blank", "noopener,noreferrer")
                }
                className="flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-[#FBFCFE] px-5 py-4 text-left transition-all hover:border-orange-200 hover:bg-orange-50/20 group/quiz"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover/quiz:bg-orange-50 group-hover/quiz:text-orange-600 transition-all">
                    <LinkIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-black text-[#0F172A] group-hover/quiz:text-orange-600 transition-all">
                      Link bài kiểm tra liên kết
                    </p>
                    <p className="max-w-[520px] truncate text-xs font-bold text-gray-400 mt-0.5">
                      {lesson.quizUrl}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 opacity-0 group-hover/quiz:opacity-100 transition-all">
                    Mở link
                  </span>
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                </div>
              </button>
            )}

            {(!learningItems || learningItems.length === 0) &&
              !lesson.quizUrl && (
                <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                  <ClipboardCheck className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                  <p className="text-sm font-bold text-gray-500">
                    Chưa có bài kiểm tra trắc nghiệm tương tác cho bài giảng
                    này.
                  </p>
                  <button
                    onClick={() => handleOpenCreateQuiz(lesson)}
                    className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl bg-orange-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-orange-700 transition"
                  >
                    <Plus className="h-3.5 w-3.5" /> Tạo quiz ngay
                  </button>
                </div>
              )}
          </div>
        </section>
      </div>
    );
  }
}
