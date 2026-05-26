import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  Users,
  BookOpen,
  Edit,
  Trash2,
  LayoutDashboard,
  Newspaper,
  ChevronRight,
  Search,
  Plus,
  Home as HomeIcon,
  MessageSquare,
  CalendarDays,
  GraduationCap,
  BookMarked,
  Activity,
  X,
  Filter,
  Eye,
  TrendingUp,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  Clock3,
  Archive,
  Star,
  PlayCircle,
  FileText,
  Layers,
  Award,
  UserRound,
  Calendar,
  ChevronDown,
  GripVertical,
  ListOrdered,
  Lock,
} from "lucide-react";
import {
  saveCourseOrderFromArray,
  getCourseOrderMap,
} from "../utils/courseOrderUtils";
import { toast } from "sonner";
import { adminApi } from "../api/adminApi";
import { publicApi } from "../api/publicApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import RichTextEditor from "../components/common/RichTextEditor";
import CourseFeedbackPanel from "../components/common/CourseFeedbackPanel";
import FeedbackPage from "./Feedback";
import { resolveMediaUrl } from "../utils/media";
import adminMockStats from "../data/adminMockStats.json";
import { useSse } from "../api/sseClient";
import LiveIndicator from "../components/common/LiveIndicator";

type AdminSection =
  | "home"
  | "dashboard"
  | "users"
  | "courses"
  | "news"
  | "courseDetail"
  | "feedback"
  | "enrollmentRequests";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const section = searchParams.get("section") as AdminSection;
    if (section) {
      setActiveSection(section);
    } else {
      setActiveSection("dashboard");
    }
  }, [searchParams]);

  const [courses, setCourses] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [courseMaterials, setCourseMaterials] = useState<any[]>([]);
  const [learningItems, setLearningItems] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [courseDetailTab, setCourseDetailTab] = useState<
    | "overview"
    | "lessons"
    | "materials"
    | "flashcards"
    | "quizzes"
    | "exams"
    | "feedback"
    | "students"
  >("overview");
  const [courseSearch, setCourseSearch] = useState("");
  const [courseStatusFilter, setCourseStatusFilter] = useState("all");
  const [courseTeacherFilter, setCourseTeacherFilter] = useState("all");

  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCourseDescriptionOpen, setIsCourseDescriptionOpen] = useState(false);
  const [modalType, setModalType] = useState<
    "user" | "teacher" | "course" | "news" | "lesson" | null
  >(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isUserCreateMenuOpen, setIsUserCreateMenuOpen] = useState(false);
  const [detailModal, setDetailModal] = useState<null | {
    kind: "material" | "flashcard" | "quiz" | "exam";
    mode: "create" | "edit";
    item?: any;
  }>(null);
  const [detailPreview, setDetailPreview] = useState<null | {
    kind: "material" | "flashcard" | "quiz" | "exam";
    item: any;
  }>(null);
  const [detailForm, setDetailForm] = useState<any>({});
  // Course Order Modal State
  const [isCourseOrderModalOpen, setIsCourseOrderModalOpen] = useState(false);
  const [courseOrderList, setCourseOrderList] = useState<any[]>([]);
  const dragIndexRef = useRef<number | null>(null);
  const [coursePendingDelete, setCoursePendingDelete] = useState<any>(null);

  // Admin Course Student Enrollment States
  const [isAdminAddStudentOpen, setIsAdminAddStudentOpen] = useState(false);
  const [adminStudentEmailQuery, setAdminStudentEmailQuery] = useState("");
  const [selectedAdminStudent, setSelectedAdminStudent] = useState<any>(null);
  const [isAdminEnrolling, setIsAdminEnrolling] = useState(false);
  const [showAdminSuggestions, setShowAdminSuggestions] = useState(false);
  const [enrollmentRequests, setEnrollmentRequests] = useState<any[]>([]);

  // Real Database Stats State
  const [courseCompletionData, setCourseCompletionData] = useState<any[]>([]);
  const [memberGrowthData, setMemberGrowthData] = useState<any[]>([]);

  // Stats State
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([
    {
      label: "Tổng người dùng",
      value: "0",
      icon: Users,
      color: "orange",
      trend: "0%",
      isUp: true,
    },
    {
      label: "Khóa học",
      value: "0",
      icon: BookOpen,
      color: "purple",
      trend: "0%",
      isUp: true,
    },
    {
      label: "Tin tức",
      value: "0",
      icon: Newspaper,
      color: "blue",
      trend: "0%",
      isUp: true,
    },
    {
      label: "Bài học",
      value: "0",
      icon: BookMarked,
      color: "amber",
      trend: "0%",
      isUp: true,
    },
  ]);

  useEffect(() => {
    fetchCourses();
    fetchNews();
    fetchUsers();
    fetchFeedbacks();
    fetchOverviewStats();
    fetchRecentActivities();
    fetchCourseCompletion();
    fetchMemberGrowth();
    fetchEnrollmentRequests();

    // Fallback polling mỗi 60s (SSE xử lý phần lớn updates)
    const interval = setInterval(() => {
      fetchOverviewStats();
      fetchRecentActivities();
      fetchCourseCompletion();
      fetchMemberGrowth();
      fetchEnrollmentRequests();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // ─── SSE: Real-time Admin Updates ───────────────────────────────────────────
  const handleAdminSseEvent = useCallback((eventName: string, _data: unknown) => {
    switch (eventName) {
      case "feedback-changed":
        fetchFeedbacks();
        fetchOverviewStats();
        toast.info("💬 Có phản hồi mới từ học sinh!", { duration: 3500 });
        break;
      case "progress-changed":
        fetchOverviewStats();
        fetchCourseCompletion();
        fetchRecentActivities();
        break;
      case "enrollment-requested":
        fetchEnrollmentRequests();
        fetchOverviewStats();
        toast.info("👤 Có yêu cầu đăng ký khóa học mới cần phê duyệt!", { duration: 4000 });
        break;
      case "enrollment-approved":
      case "enrollment-rejected":
        fetchEnrollmentRequests();
        fetchOverviewStats();
        break;
    }
  }, []);

  const { status: sseStatus } = useSse("admin", handleAdminSseEvent);
  // ────────────────────────────────────────────────────────────────────────────


  const fetchOverviewStats = async () => {
    try {
      const res = await adminApi.getOverviewStats();
      setStats([
        {
          label: "Tổng người dùng",
          value: res.data.totalUsers.toLocaleString(),
          icon: Users,
          color: "orange",
          trend: "0%",
          isUp: true,
          userStats: res.data.userStats,
        },
        {
          label: "Khóa học",
          value: res.data.totalCourses.toLocaleString(),
          icon: BookOpen,
          color: "purple",
          trend: "0%",
          isUp: true,
          courseStats: res.data.courseStats,
        },
        {
          label: "Tin tức",
          value: res.data.totalNews.toLocaleString(),
          icon: Newspaper,
          color: "blue",
          trend: "0%",
          isUp: true,
        },
        {
          label: "Bài học",
          value: res.data.totalLessons.toLocaleString(),
          icon: BookMarked,
          color: "amber",
          trend: "0%",
          isUp: true,
        },
      ]);
    } catch (err) {
      console.error("Failed to fetch overview stats", err);
    }
  };

  const fetchCourseCompletion = async () => {
    try {
      const res = await adminApi.getCourseCompletion();
      setCourseCompletionData(res.data);
    } catch (err) {
      console.error("Failed to fetch course completion stats", err);
    }
  };

  const fetchMemberGrowth = async () => {
    try {
      const res = await adminApi.getMemberGrowth();
      setMemberGrowthData(res.data);
    } catch (err) {
      console.error("Failed to fetch member growth stats", err);
    }
  };


  const fetchRecentActivities = async () => {
    try {
      const res = await adminApi.getRecentActivity();
      setRecentActivities(res.data);
    } catch (err) {
      console.error("Failed to fetch recent activities", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await adminApi.getAllUsers();
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await adminApi.getAllCourses();
      setCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await adminApi.getAllNews();
      setNews(res.data);
    } catch (err) {
      console.error("Failed to fetch news", err);
    }
  };

  const fetchEnrollmentRequests = async () => {
    try {
      const res = await adminApi.getEnrollmentRequests();
      setEnrollmentRequests(res.data || []);
    } catch (err) {
      console.error("Failed to fetch enrollment requests", err);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await adminApi.getAllFeedbacks();
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Failed to fetch feedbacks", err);
    }
  };

  const fetchLessons = async (courseId: number) => {
    try {
      const res = await adminApi.getLessonsByCourse(courseId);
      setLessons(res.data);
    } catch (err) {
      console.error("Failed to fetch lessons", err);
    }
  };

  const fetchCourseMaterials = async (courseId: number) => {
    try {
      const res = await adminApi.getCourseMaterials(courseId);
      setCourseMaterials(res.data);
    } catch (err) {
      console.error("Failed to fetch course materials", err);
    }
  };

  const fetchCourseLearningItems = async (courseId: number) => {
    try {
      const res = await adminApi.getCourseLearningItems(courseId);
      setLearningItems(res.data);
    } catch (err) {
      console.error("Failed to fetch learning items", err);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    try {
      await adminApi.deleteCourse(id);
      toast.success("Xóa khóa học thành công");
      setCoursePendingDelete(null);
      fetchCourses();
    } catch (err: any) {
      console.error("Failed to delete course", err);
      toast.error(err.response?.data?.message || "Lỗi khi xóa khóa học");
    }
  };

  const handleDeleteNews = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tin tức này?")) return;
    try {
      await adminApi.deleteNews(id);
      toast.success("Xóa tin tức thành công");
      fetchNews();
    } catch (err) {
      toast.error("Lỗi khi xóa tin tức");
    }
  };

  const handleDeleteLesson = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài giảng này?")) return;
    try {
      await adminApi.deleteLesson(id);
      toast.success("Xóa bài giảng thành công");
      if (selectedCourse) fetchLessons(selectedCourse.id);
    } catch (err) {
      toast.error("Lỗi khi xóa bài giảng");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    try {
      await adminApi.deleteUser(id);
      toast.success("Xóa người dùng thành công");
      fetchUsers();
    } catch (err) {
      toast.error("Lỗi khi xóa người dùng");
    }
  };

  // Course Path Ordering Helpers
  const openCourseOrderModal = () => {
    // Sort courses by their current saved order
    const orderMap = getCourseOrderMap(courses);
    const sorted = [...courses].sort((a, b) => {
      const orderA = orderMap[a.id] !== undefined ? orderMap[a.id] : 9999;
      const orderB = orderMap[b.id] !== undefined ? orderMap[b.id] : 9999;
      return orderA - orderB;
    });
    setCourseOrderList(sorted);
    setIsCourseOrderModalOpen(true);
  };

  const handleDragStart = (index: number) => {
    dragIndexRef.current = index;
  };

  const handleDragOver = (e: React.DragEvent, hoverIndex: number) => {
    e.preventDefault();
    const dragIndex = dragIndexRef.current;
    if (dragIndex === null || dragIndex === hoverIndex) return;

    const list = [...courseOrderList];
    const draggedItem = list[dragIndex];
    list.splice(dragIndex, 1);
    list.splice(hoverIndex, 0, draggedItem);
    dragIndexRef.current = hoverIndex;
    setCourseOrderList(list);
  };

  const handleSaveCourseOrder = async () => {
    try {
      const courseIds = courseOrderList.map(c => c.id);
      await adminApi.updateCourseOrder(courseIds);
      // Keep localStorage as local fallback
      saveCourseOrderFromArray(courseIds);
      setIsCourseOrderModalOpen(false);
      toast.success("Đã lưu lộ trình học tập thành công!");
      fetchCourses(); // refresh
    } catch (err) {
      console.error("Failed to save course order", err);
      toast.error("Không thể lưu lộ trình học tập vào cơ sở dữ liệu.");
    }
  };

  const handleOpenModal = (
    type: "user" | "teacher" | "course" | "news" | "lesson",
    item: any = null,
  ) => {
    setModalType(type);
    setEditItem(item);
    setIsUserCreateMenuOpen(false);
    if (item) {
      if (type === "course") {
        setFormData({
          ...item,
          startDate: dateInputValue(item.startDate),
          endDate: dateInputValue(item.endDate),
          teacherId: item.teacherId ?? "",
          status:
            item.status === "Hidden" || item.status === "Draft"
              ? item.status
              : "Published",
        });
      } else {
        setFormData({
          ...item,
          role: roleToValue(item.role),
          dateOfBirth: dateInputValue(item.dateOfBirth),
          avatarPreview: getUserAvatarSrc(item),
          authorName: item.authorName ?? "",
        });
      }
    } else {
      if (type === "user")
        setFormData({ role: 2, dateOfBirth: "", avatarPreview: "" });
      else if (type === "teacher")
        setFormData({
          fullName: "",
          email: "",
          password: "",
          role: 1,
          dateOfBirth: "",
          gender: "Nam",
          phoneNumber: "",
          address: "",
          teachingExperienceYears: 0,
          shortBio: "",
          isActive: true,
          assignedCourseId: "",
          avatarPreview: "",
        });
      else if (type === "lesson") setFormData({ courseId: selectedCourse?.id });
      else if (type === "news")
        setFormData({ title: "", content: "", avatarUrl: "", authorName: "" });
      else if (type === "course") {
        setFormData({
          title: "",
          code: "",
          description: "",
          avatarUrl: "",
          introVideoUrl: "",
          status: "Published",
          language: "Tiếng Việt",
          durationMinutes: 0,
          expectedStudentCount: 0,
          startDate: "",
          endDate: "",
          teacherId: "",
          learningOutcomes:
            "Hệ thống kiến thức đầy đủ, dễ hiểu\nBài giảng video chất lượng cao\nTài liệu PDF và sơ đồ tư duy",
        });
      } else setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsCourseDescriptionOpen(false);
    setIsUserCreateMenuOpen(false);
    setModalType(null);
    setEditItem(null);
    setFormData({});
  };

  const handleNewsImageUpload = async (file?: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh hợp lệ.");
      return;
    }

    try {
      const res = await adminApi.uploadNewsImage(file);
      setFormData((current: any) => ({
        ...current,
        avatarFileName: file.name,
        avatarUrl: res.data.url,
      }));
      toast.success("Tải ảnh đại diện thành công.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể tải ảnh đại diện.");
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === "user") {
        const userPayload = {
          ...formData,
          role: parseInt(formData.role),
          dateOfBirth: formData.dateOfBirth || null,
        };

        if (editItem) {
          await adminApi.updateUser(editItem.id, {
            fullName: userPayload.fullName,
            role: userPayload.role,
            dateOfBirth: userPayload.dateOfBirth,
            avatarFile: userPayload.avatarFile,
            avatarUrl: userPayload.avatarUrl,
            gender: userPayload.gender || null,
            phoneNumber: userPayload.phoneNumber || null,
            address: userPayload.address || null,
            teachingExperienceYears: userPayload.role === 1 ? Number(userPayload.teachingExperienceYears || 0) : 0,
            shortBio: userPayload.shortBio || null,
            password: userPayload.password || null,
          });
        } else {
          await adminApi.createUser(userPayload);
        }
        fetchUsers();
      } else if (modalType === "teacher") {
        const teacherPayload = {
          ...formData,
          role: 1,
          dateOfBirth: formData.dateOfBirth || null,
          gender: formData.gender || null,
          phoneNumber: formData.phoneNumber || null,
          address: formData.address || null,
          teachingExperienceYears: Number(
            formData.teachingExperienceYears || 0,
          ),
          shortBio: formData.shortBio || null,
          isActive: !!formData.isActive,
          assignedCourseId: formData.assignedCourseId
            ? Number(formData.assignedCourseId)
            : null,
        };

        await adminApi.createUser(teacherPayload);
        await Promise.all([fetchUsers(), fetchCourses()]);
      } else if (modalType === "course") {
        if (!formData.teacherId) {
          toast.error("Vui lòng chọn giảng viên phụ trách khóa học.");
          return;
        }
        const coursePayload = {
          title: formData.title,
          description: formData.description || "",
          avatarUrl: formData.avatarUrl || null,
          code: formData.code || "",
          introVideoUrl: formData.introVideoUrl || null,
          teacherId: formData.teacherId ? Number(formData.teacherId) : null,
          status:
            ((e.nativeEvent as any).submitter?.value === "Draft"
              ? "Draft"
              : formData.status) || "Published",
          language: formData.language || "Tiếng Việt",
          durationMinutes: Number(formData.durationMinutes || 0),
          expectedStudentCount: Number(formData.expectedStudentCount || 0),
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          learningOutcomes: formData.learningOutcomes || "",
        };
        if (editItem) await adminApi.updateCourse(editItem.id, coursePayload);
        else await adminApi.createCourse(coursePayload);
        fetchCourses();
      } else if (modalType === "news") {
        const newsPayload = {
          title: formData.title?.trim(),
          content: formData.content || "",
          avatarUrl: formData.avatarUrl?.trim() || null,
          authorName: formData.authorName?.trim() || null,
        };
        if (
          !newsPayload.title ||
          !newsPayload.content ||
          newsPayload.content === "<p></p>"
        ) {
          toast.error("Vui lòng nhập tiêu đề và nội dung bài viết.");
          return;
        }
        if (editItem) await adminApi.updateNews(editItem.id, newsPayload);
        else await adminApi.createNews(newsPayload);
        fetchNews();
      } else if (modalType === "lesson") {
        if (editItem) await adminApi.updateLesson(editItem.id, formData);
        else await adminApi.createLesson(formData);
        if (selectedCourse) fetchLessons(selectedCourse.id);
      }
      toast.success(`${editItem ? "Cập nhật" : "Tạo"} thành công!`);
      handleCloseModal();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const roleToValue = (role: string | number) => {
    if (typeof role === "number") return role;
    if (role === "ADMIN") return 0;
    if (role === "TEACHER") return 1;
    return 2;
  };

  const roleLabel = (role: string | number) => {
    const value = roleToValue(role);
    if (value === 0) return "ADMIN";
    if (value === 1) return "GIÁO VIÊN";
    return "HỌC SINH";
  };

  const roleBadgeClass = (role: string | number) => {
    const value = roleToValue(role);
    if (value === 0) return "bg-purple-50 text-purple-600";
    if (value === 1) return "bg-blue-50 text-blue-600";
    return "bg-orange-50 text-orange-600";
  };

  const dateInputValue = (value?: string | null) => {
    if (!value) return "";
    return value.slice(0, 10);
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "Chưa cập nhật";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split("-").map(Number);
      return new Date(year, month - 1, day).toLocaleDateString("vi-VN");
    }
    return new Date(value).toLocaleDateString("vi-VN");
  };

  const getUserAvatarSrc = (user: any) =>
    resolveMediaUrl(user?.avatarImageDataUrl || user?.avatarUrl || "");

  const getInitials = (name?: string) => {
    const value = (name || "U").trim();
    return value
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  const statIconColor = (color: string) => {
    if (color === "blue") return "bg-blue-50 text-blue-600";
    if (color === "purple") return "bg-violet-50 text-violet-600";
    if (color === "amber") return "bg-amber-50 text-amber-600";
    return "bg-orange-50 text-orange-600";
  };

  const getProcessedCourseCompletion = () => {
    if (!courseCompletionData || courseCompletionData.length === 0) return [];

    const orderMap = getCourseOrderMap(courses);
    if (Object.keys(orderMap).length === 0) {
      return courseCompletionData.slice(0, 5);
    }

    const sorted = courseCompletionData
      .filter((item) => orderMap[item.courseId] !== undefined)
      .sort(
        (a, b) => Number(orderMap[a.courseId]) - Number(orderMap[b.courseId]),
      );

    if (sorted.length === 0) {
      return courseCompletionData.slice(0, 5);
    }

    return sorted;
  };

  const renderDashboardV2 = () => {
    const processedCompletionData = getProcessedCourseCompletion();
    const hasGrowthData = memberGrowthData && memberGrowthData.length > 0;
    const activeGrowthData = hasGrowthData
      ? memberGrowthData
      : adminMockStats.quarterlyMembers;

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Dashboard Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-black tracking-tight text-[#0F172A]">
                Tổng quan hệ thống
              </h2>
              <LiveIndicator status={sseStatus} />
            </div>
            <p className="mt-1.5 text-xs font-semibold text-[#667085]">
              Theo dõi số liệu thống kê, tiến độ học tập và tăng trưởng thành
              viên thực tế.
            </p>
          </div>

        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-white p-5 shadow-sm transition-all hover:shadow-md group"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${statIconColor(stat.color)}`}
                >
                  <stat.icon className="h-7 w-7" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-[#667085] tracking-tight">
                    {stat.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black tracking-tight text-[#0F172A]">
                      {stat.value}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div
                      className={`flex items-center ${stat.isUp ? "text-green-600" : "text-red-600"}`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-black">
                        {stat.trend}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#98A2B3] font-medium">
                      so với tháng trước
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts & Activities */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_400px]">
          <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold tracking-tight text-[#0F172A]">
                Hoàn thành khóa học
              </h3>
              <p className="mt-0.5 text-xs font-medium text-[#667085]">
                {courseCompletionData && courseCompletionData.length > 0
                  ? "Số liệu thực tế học sinh đã hoàn thành (>=80%) và chưa hoàn thành trong lộ trình."
                  : "Số liệu mô phỏng số học viên đã hoàn thành (>=80%) và chưa hoàn thành."}
              </p>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={
                    processedCompletionData.length > 0
                      ? processedCompletionData
                      : adminMockStats.courseProgress
                  }
                  margin={{ top: 0, right: 8, left: -18, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#ECEEF2"
                  />
                  <XAxis
                    dataKey="courseTitle"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#667085", fontSize: 11, fontWeight: 700 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#667085", fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#FFF4EC" }}
                    contentStyle={{
                      borderRadius: "14px",
                      border: "1px solid #EEF2F6",
                      boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12, fontWeight: 700 }}
                  />
                  <Bar
                    name="Đã hoàn thành"
                    dataKey="completed"
                    stackId="progress"
                    fill="#22C55E"
                    radius={[0, 0, 6, 6]}
                    barSize={34}
                  />
                  <Bar
                    name="Chưa hoàn thành"
                    dataKey="incomplete"
                    stackId="progress"
                    fill="#FF6B00"
                    radius={[6, 6, 0, 0]}
                    barSize={34}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">
                Hoạt động
              </h3>
              <p className="text-xs text-[#667085] font-medium mt-0.5">
                Cập nhật mới nhất hệ thống.
              </p>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, i) => (
                <div
                  key={i}
                  className="flex gap-4 items-start p-3 hover:bg-[#F8F9FB] rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFF4EC] flex items-center justify-center text-[#FF6B00] shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#0F172A]">
                      {activity.title}
                    </p>
                    <p className="truncate text-[12px] text-[#667085] mt-0.5">
                      {activity.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold tracking-tight text-[#0F172A]">
                  Thành viên theo quý
                </h3>
                <p className="mt-0.5 text-xs font-medium text-[#667085]">
                  {hasGrowthData
                    ? "Số liệu tăng trưởng học sinh và giáo viên thực tế theo từng quý trong năm."
                    : "Mock data tăng trưởng student và teacher theo từng quý trong năm."}
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-600">
                2026
              </span>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={activeGrowthData}
                  margin={{ top: 0, right: 12, left: -18, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#ECEEF2"
                  />
                  <XAxis
                    dataKey="quarter"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#667085", fontSize: 12, fontWeight: 700 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#667085", fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "14px",
                      border: "1px solid #EEF2F6",
                      boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12, fontWeight: 700 }}
                  />
                  <Line
                    name="Tổng thành viên"
                    type="monotone"
                    dataKey="total"
                    stroke="#FF6B00"
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      fill: "#FF6B00",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                  />
                  <Line
                    name="Học sinh"
                    type="monotone"
                    dataKey="students"
                    stroke="#2563EB"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#2563EB",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                  />
                  <Line
                    name="Giáo viên"
                    type="monotone"
                    dataKey="teachers"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#8B5CF6",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    const filteredUsers = users.filter((user) => {
      const keyword = userSearch.trim().toLowerCase();
      const matchesSearch =
        !keyword ||
        `${user.fullName} ${user.email} ${user.phoneNumber || ""}`
          .toLowerCase()
          .includes(keyword);

      const matchesRole =
        userRoleFilter === "all" ||
        String(roleToValue(user.role)) === userRoleFilter;
      const userStatus =
        user.isActive === false ? "Không hoạt động" : "Hoạt động";
      const matchesStatus =
        userStatusFilter === "all" || userStatus === userStatusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });

    const userStatsData = stats.find((s) => s.label === "Tổng người dùng")
      ?.userStats || {
      total: users.length,
      totalTrend: 0,
      active: users.length,
      activeTrend: 0,
      teacher: users.filter((u) => roleToValue(u.role) === 1).length,
      teacherTrend: 0,
      student: users.filter((u) => roleToValue(u.role) === 2).length,
      studentTrend: 0,
    };

    const userCards = [
      {
        label: "Tổng người dùng",
        value: userStatsData.total,
        note: `+${userStatsData.totalTrend} người dùng mới`,
        icon: Users,
        className: "bg-orange-50 text-orange-600",
        isTrendUp: true,
      },
      {
        label: "Đang hoạt động",
        value: userStatsData.active,
        note: `+${userStatsData.activeTrend} hoạt động`,
        icon: Activity,
        className: "bg-green-50 text-green-600",
        isTrendUp: true,
      },
      {
        label: "Giảng viên",
        value: userStatsData.teacher,
        note: `+${userStatsData.teacherTrend} giảng viên`,
        icon: GraduationCap,
        className: "bg-blue-50 text-blue-600",
        isTrendUp: true,
      },
      {
        label: "Học sinh",
        value: userStatsData.student,
        note: `+${userStatsData.studentTrend} học sinh`,
        icon: UserPlus,
        className: "bg-violet-50 text-violet-600",
        isTrendUp: true,
      },
    ];

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-[#0F172A]">
              Quản lý người dùng
            </h2>
            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#667085]">
              <span>Trang chủ</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-[#0F172A]">Người dùng</span>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsUserCreateMenuOpen((value) => !value)}
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#FF4D12] px-6 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#E6420C] hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5" /> Thêm người dùng{" "}
              <ChevronDown className="h-4 w-4" />
            </button>
            {isUserCreateMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-56 overflow-hidden rounded-xl border border-[#E6EAF0] bg-white shadow-2xl">
                <button
                  onClick={() => handleOpenModal("teacher")}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-[#0F172A] transition hover:bg-[#FFF4EC]"
                >
                  <GraduationCap className="h-4 w-4 text-[#FF4D12]" />
                  Tạo giáo viên
                </button>
                <button
                  onClick={() => handleOpenModal("user")}
                  className="flex w-full items-center gap-3 border-t border-[#EEF2F6] px-4 py-3 text-left text-sm font-bold text-[#0F172A] transition hover:bg-[#F8F9FB]"
                >
                  <UserPlus className="h-4 w-4 text-[#2563EB]" />
                  Tạo học sinh
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {userCards.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-[#E6EAF0] bg-white p-7 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-5">
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg ${item.className}`}
                >
                  <item.icon className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black leading-none text-[#0F172A]">
                      {formatNumber(item.value)}
                    </p>
                  </div>
                  <p className="mt-2 text-[13px] font-bold text-[#667085]">
                    {item.label}
                  </p>
                  <p
                    className={`mt-1.5 text-[11px] font-black flex items-center gap-1 ${item.isTrendUp ? "text-green-600" : "text-red-500"}`}
                  >
                    <TrendingUp
                      className={`w-3 h-3 ${item.isTrendUp ? "" : "rotate-180"}`}
                    />
                    {item.note}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-[#E6EAF0] bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-4 border-b border-[#E6EAF0] p-6 bg-white">
            <div className="relative min-w-[320px] flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#98A2B3]" />
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                className="h-12 w-full rounded-lg border border-[#E6EAF0] bg-[#FAFBFC] pl-12 pr-4 text-sm font-semibold outline-none transition focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-500/5"
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="h-12 rounded-lg border border-[#E6EAF0] bg-white px-5 text-sm font-bold text-[#0F172A] outline-none min-w-[160px] focus:border-[#FF6B00]"
              >
                <option value="all">Vai trò: Tất cả</option>
                <option value="0">Admin</option>
                <option value="1">Giáo viên</option>
                <option value="2">Học sinh</option>
              </select>
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="h-12 rounded-lg border border-[#E6EAF0] bg-white px-5 text-sm font-bold text-[#0F172A] outline-none min-w-[160px] focus:border-[#FF6B00]"
              >
                <option value="all">Trạng thái: Tất cả</option>
                <option value="Hoạt động">Hoạt động</option>
                <option value="Không hoạt động">Không hoạt động</option>
              </select>
              <button
                onClick={fetchUsers}
                className="flex h-12 items-center gap-2 rounded-lg border border-[#E6EAF0] bg-white px-5 text-sm font-bold text-[#0F172A] transition hover:bg-[#F8F9FB]"
              >
                <RefreshCw className="h-4 w-4" /> Làm mới
              </button>
            </div>
          </div>

          <div className="overflow-hidden">
            <table className="w-full border-collapse table-auto">
              <thead>
                <tr className="border-b border-[#E6EAF0] bg-[#FAFBFC]/50">
                  <th className="px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">
                    Người dùng
                  </th>
                  <th className="px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">
                    Email
                  </th>
                  <th className="px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">
                    Vai trò
                  </th>
                  <th className="px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">
                    Ngày sinh
                  </th>
                  <th className="px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">
                    Trạng thái
                  </th>
                  <th className="px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">
                    Ngày tham gia
                  </th>
                  <th className="px-4 py-5 text-right text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EAF0]">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition hover:bg-[#FAFBFC]/80 group"
                  >
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-100 shrink-0 shadow-sm">
                          {getUserAvatarSrc(user) ? (
                            <img
                              src={getUserAvatarSrc(user)}
                              alt={user.fullName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-[#FFF4EC] text-[#FF6B00] flex items-center justify-center text-[11px] font-black uppercase">
                              {getInitials(user.fullName)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-black text-[#0F172A] truncate max-w-[180px]">
                            {user.fullName}
                          </p>
                          <p className="text-[10px] font-bold text-[#98A2B3] mt-0.5 uppercase tracking-tight">
                            {user.phoneNumber || "Không có SĐT"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-[12px] font-bold text-[#0F172A]">
                      {user.email}
                    </td>
                    <td className="px-4 py-5">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm border border-transparent ${roleBadgeClass(user.role)}`}
                      >
                        {roleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-[12px] font-bold text-[#667085] whitespace-nowrap">
                      {formatDate(user.dateOfBirth)}
                    </td>
                    <td className="px-4 py-5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.isActive === false ? "bg-slate-100 text-slate-500" : "bg-green-50 text-green-600"}`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${user.isActive === false ? "bg-slate-400" : "bg-green-500"}`}
                        ></span>
                        {user.isActive === false
                          ? "Không hoạt động"
                          : "Hoạt động"}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-[12px] font-bold text-[#667085] whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-5 text-right">
                      <div className="flex justify-end gap-0.5">
                        <button
                          onClick={() => handleOpenModal("user", user)}
                          className="p-1.5 text-[#98A2B3] hover:text-[#0F172A] hover:bg-slate-50 rounded-lg transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 text-[#98A2B3] hover:text-[#EF4444] hover:bg-slate-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-[#E6EAF0] flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-[#667085]">Hiển thị</span>
              <select className="h-10 px-3 rounded-lg border border-[#E6EAF0] bg-white text-sm font-black text-[#0F172A] outline-none focus:border-[#FF6B00] cursor-pointer">
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
              <span className="text-sm font-bold text-[#667085]">
                trên mỗi trang
              </span>
            </div>

            <div className="flex items-center gap-8">
              <p className="text-sm font-bold text-[#667085]">
                Tổng {formatNumber(users.length)} người dùng
              </p>
              <div className="flex items-center gap-2">
                <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-[#E6EAF0] text-[#667085] hover:bg-[#F8F9FB] transition-all">
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <button className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#FFF4EC] text-[#FF6B00] font-black text-sm">
                  1
                </button>
                <button className="h-10 w-10 flex items-center justify-center rounded-lg text-[#667085] font-black text-sm hover:bg-[#F8F9FB] transition-all">
                  2
                </button>
                <button className="h-10 w-10 flex items-center justify-center rounded-lg text-[#667085] font-black text-sm hover:bg-[#F8F9FB] transition-all">
                  3
                </button>
                <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-[#E6EAF0] text-[#667085] hover:bg-[#F8F9FB] transition-all">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <select className="h-10 px-4 rounded-lg border border-[#E6EAF0] bg-white text-sm font-black text-[#0F172A] outline-none min-w-[140px] focus:border-[#FF6B00] cursor-pointer">
                  <option>Đi tới trang</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCourses = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight">
            Khóa học
          </h2>
          <p className="text-sm text-[#667085] font-medium mt-1">
            Quản lý các chương trình đào tạo.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal("course")}
          className="flex items-center gap-2 px-6 py-4 bg-[#FF6B00] text-white rounded-[18px] text-sm font-bold hover:bg-[#E65F00] transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> Tạo khóa học mới
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white p-8 rounded-[28px] shadow-sm border border-[#ECEEF2] hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-[#FFF4EC] rounded-2xl flex items-center justify-center text-[#FF6B00] transition-all group-hover:scale-105">
                <BookOpen className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                Đang mở
              </span>
            </div>
            <h3
              className="text-xl font-bold text-[#0F172A] mb-3 cursor-pointer hover:text-[#FF6B00] transition-colors"
              onClick={() => openCourseDetail(course)}
            >
              {course.title}
            </h3>
            <p className="text-sm text-[#667085] mb-8 line-clamp-2 leading-relaxed font-medium">
              {stripHtml(course.description || "Chưa có mô tả.")}
            </p>
            <div className="flex items-center justify-between pt-6 border-t border-[#ECEEF2]">
              <span className="text-[11px] font-bold text-[#98A2B3] uppercase tracking-wider">
                GV: {course.creatorName || "N/A"}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal("course", course)}
                  className="p-2 text-[#98A2B3] hover:text-[#0F172A] transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCoursePendingDelete(course)}
                  className="p-2 text-[#98A2B3] hover:text-[#EF4444] transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const getCourseStatus = (course: any) => course.status || "Published";

  const courseStatusLabel = (status?: string) => {
    if (status === "Draft") return "Bản nháp";
    if (status === "Hidden") return "Ẩn";
    return "Đã xuất bản";
  };

  const courseStatusClass = (status?: string) => {
    if (status === "Draft") return "bg-amber-50 text-amber-600";
    if (status === "Hidden") return "bg-slate-100 text-slate-500";
    return "bg-green-50 text-green-600";
  };

  const formatDuration = (minutes?: number) => {
    const total = Number(minutes || 0);
    if (!total) return "Chưa đặt";
    const hours = Math.floor(total / 60);
    const mins = total % 60;

    if (hours > 0 && mins > 0) {
      return `${hours} giờ ${mins} phút`;
    } else if (hours > 0) {
      return `${hours} giờ 00 phút`;
    }
    return `${mins} phút`;
  };

  const formatNumber = (value?: number) =>
    Number(value || 0).toLocaleString("vi-VN");

  const getCourseImage = (course: any) =>
    course.avatarUrl ||
    "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&w=900&q=80";
  const getCourseTeacher = (course: any) => {
    const teacher = users.find(
      (user) => Number(user.id) === Number(course.teacherId),
    );
    return {
      name:
        course.teacherName ||
        teacher?.fullName ||
        course.creatorName ||
        "Chưa phân công",
      avatar: course.teacherAvatarUrl || getUserAvatarSrc(teacher) || "",
    };
  };

  const courseOutcomes = (course: any) =>
    String(course?.learningOutcomes || "")
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

  const lessonTitleById = (lessonId: number) =>
    lessons.find((lesson) => Number(lesson.id) === Number(lessonId))?.title ||
    "Bài học";

  const materialPreviewUrl = (material: any) => {
    const type = String(material?.fileType || "").toLowerCase();
    if (type === "doc" || type === "docx") {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(material.fileUrl)}`;
    }
    return material?.fileUrl || "";
  };

  const parseLearningContent = (item: any) => {
    try {
      return JSON.parse(item?.content || "{}");
    } catch {
      return {};
    }
  };

  const flashcardItems = learningItems.filter(
    (item) => item.type === "flashcard",
  );
  const quizItems = learningItems.filter((item) => item.type === "quiz");
  const examItems = learningItems.filter((item) => item.type === "exam");

  const openDetailModal = (
    kind: "material" | "flashcard" | "quiz" | "exam",
    mode: "create" | "edit",
    item?: any,
  ) => {
    setDetailModal({ kind, mode, item });

    if (kind === "material") {
      setDetailForm(
        item
          ? {
              courseId: selectedCourse?.id,
              title: item.title || "",
              fileUrl: item.fileUrl || "",
              fileType: item.fileType || "pdf",
              mimeType: item.mimeType || "",
              description: item.description || "",
            }
          : {
              courseId: selectedCourse?.id,
              title: "",
              fileUrl: "",
              fileType: "pdf",
              mimeType: "",
              description: "",
            },
      );
      return;
    }

    const content = item ? parseLearningContent(item) : {};
    setDetailForm(
      item
        ? {
            courseId: selectedCourse?.id,
            lessonId: item.lessonId || lessons[0]?.id || "",
            title: item.title || "",
            type:
              kind === "flashcard"
                ? "flashcard"
                : kind === "quiz"
                  ? "quiz"
                  : "exam",
            cards: content.cards || [{ front: "", back: "" }],
            questions: content.questions || [
              {
                question: "",
                options: ["", "", "", ""],
                correctAnswer: 0,
                explanation: "",
              },
            ],
          }
        : {
            courseId: selectedCourse?.id,
            lessonId: lessons[0]?.id || "",
            title: "",
            type:
              kind === "flashcard"
                ? "flashcard"
                : kind === "quiz"
                  ? "quiz"
                  : "exam",
            cards: [{ front: "", back: "" }],
            questions: [
              {
                question: "",
                options: ["", "", "", ""],
                correctAnswer: 0,
                explanation: "",
              },
            ],
          },
    );
  };

  const closeDetailModal = () => {
    setDetailModal(null);
    setDetailForm({});
  };

  const refreshCourseDetailData = async () => {
    if (!selectedCourse?.id) return;
    await Promise.all([
      fetchLessons(selectedCourse.id),
      fetchCourseMaterials(selectedCourse.id),
      fetchCourseLearningItems(selectedCourse.id),
    ]);
  };

  const handleDeleteCourseMaterial = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;
    try {
      await adminApi.deleteCourseMaterial(id);
      await fetchCourseMaterials(selectedCourse.id);
      toast.success("Xóa tài liệu thành công");
    } catch (err) {
      toast.error("Lỗi khi xóa tài liệu");
    }
  };

  const handleDeleteLearningItem = async (id: number, label: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa ${label.toLowerCase()} này?`))
      return;
    try {
      await adminApi.deleteLearningItem(id);
      await fetchCourseLearningItems(selectedCourse.id);
      toast.success(`Xóa ${label.toLowerCase()} thành công`);
    } catch (err) {
      toast.error(`Lỗi khi xóa ${label.toLowerCase()}`);
    }
  };

  const handleSubmitDetailModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailModal || !selectedCourse?.id) return;

    try {
      if (detailModal.kind === "material") {
        const payload = {
          courseId: selectedCourse.id,
          title: detailForm.title,
          fileUrl: detailForm.fileUrl,
          fileType: detailForm.fileType,
          mimeType: detailForm.mimeType || "",
          description: detailForm.description || "",
        };

        if (detailModal.mode === "edit" && detailModal.item) {
          await adminApi.updateCourseMaterial(detailModal.item.id, payload);
        } else {
          await adminApi.createCourseMaterial(payload);
        }

        await fetchCourseMaterials(selectedCourse.id);
      } else {
        const payload = {
          courseId: selectedCourse.id,
          lessonId: Number(detailForm.lessonId),
          title: detailForm.title,
          type: detailForm.type,
          content: JSON.stringify(
            detailForm.type === "flashcard"
              ? { type: detailForm.type, cards: detailForm.cards }
              : { type: detailForm.type, questions: detailForm.questions },
          ),
        };

        if (detailModal.mode === "edit" && detailModal.item) {
          await adminApi.updateLearningItem(detailModal.item.id, payload);
        } else {
          await adminApi.createLearningItem(payload);
        }

        await fetchCourseLearningItems(selectedCourse.id);
      }

      closeDetailModal();
      toast.success("Lưu nội dung thành công");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể lưu nội dung");
    }
  };

  const openCourseDetail = async (course: any) => {
    setSelectedCourse(course);
    setCourseDetailTab("overview");
    setActiveSection("courseDetail");
    await Promise.all([
      fetchLessons(course.id),
      fetchCourseMaterials(course.id),
      fetchCourseLearningItems(course.id),
    ]);
    try {
      const res = await publicApi.getCourseById(course.id);
      setSelectedCourse(res.data);
    } catch (err) {
      console.error("Failed to fetch detailed course information", err);
    }
  };

  const renderCoursesV2 = () => {
    const teacherOptions = users.filter((user) => roleToValue(user.role) === 1);
    const filteredCourses = courses.filter((course) => {
      const teacher = getCourseTeacher(course);
      const keyword = courseSearch.trim().toLowerCase();
      const matchesSearch =
        !keyword ||
        `${course.title} ${stripHtml(course.description || "")} ${teacher.name}`
          .toLowerCase()
          .includes(keyword);
      const matchesStatus =
        courseStatusFilter === "all" ||
        getCourseStatus(course) === courseStatusFilter;
      const matchesTeacher =
        courseTeacherFilter === "all" ||
        String(course.teacherId || "") === courseTeacherFilter;
      return matchesSearch && matchesStatus && matchesTeacher;
    });
    const published = courses.filter(
      (course) => getCourseStatus(course) === "Published",
    ).length;
    const drafts = courses.filter(
      (course) => getCourseStatus(course) === "Draft",
    ).length;
    const hidden = courses.filter(
      (course) => getCourseStatus(course) === "Hidden",
    ).length;

    const courseStatsData = stats.find((s) => s.label === "Khóa học")
      ?.courseStats || {
      total: courses.length,
      totalTrend: 0,
      published: published,
      publishedTrend: 0,
      draft: drafts,
      draftTrend: 0,
      hidden: hidden,
      hiddenTrend: 0,
    };

    const courseCards = [
      {
        label: "Tổng khóa học",
        value: courseStatsData.total,
        note:
          courseStatsData.totalTrend >= 0
            ? `+${courseStatsData.totalTrend} khóa học mới`
            : `${courseStatsData.totalTrend} khóa học`,
        icon: BookOpen,
        className: "bg-orange-50 text-orange-600",
        isTrendUp: courseStatsData.totalTrend >= 0,
      },
      {
        label: "Đã xuất bản",
        value: courseStatsData.published,
        note: `+${courseStatsData.publishedTrend} khóa học`,
        icon: CheckCircle2,
        className: "bg-green-50 text-green-600",
        isTrendUp: true,
      },
      {
        label: "Bản nháp",
        value: courseStatsData.draft,
        note:
          courseStatsData.draftTrend >= 0
            ? `+${courseStatsData.draftTrend} khóa học`
            : `${courseStatsData.draftTrend} khóa học`,
        icon: Clock3,
        className: "bg-amber-50 text-amber-600",
        isTrendUp: courseStatsData.draftTrend >= 0,
      },
      {
        label: "Đã ẩn",
        value: courseStatsData.hidden,
        note:
          courseStatsData.hiddenTrend === 0
            ? "→ Không đổi"
            : `${courseStatsData.hiddenTrend} khóa học`,
        icon: Archive,
        className: "bg-violet-50 text-violet-600",
        isTrendUp: courseStatsData.hiddenTrend >= 0,
      },
    ];

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-[#0F172A]">
              Quản lý khóa học
            </h2>
            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#667085]"></div>
          </div>
          <div className="flex items-center gap-3">

            <button
              onClick={openCourseOrderModal}
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-white border border-[#E2E8F0] px-5 text-sm font-bold text-[#0F172A] shadow-sm transition-all hover:bg-[#FAFBFC] hover:-translate-y-0.5"
            >
              <ListOrdered className="h-4.5 w-4.5 text-[#FF6B00]" /> Sắp xếp lộ
              trình
            </button>
            <button
              onClick={() => handleOpenModal("course")}
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#FF4D12] px-6 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#E6420C] hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5" /> Thêm khóa học
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {courseCards.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-[#E6EAF0] bg-white p-7 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-5">
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg ${item.className}`}
                >
                  <item.icon className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black leading-none text-[#0F172A]">
                      {formatNumber(item.value)}
                    </p>
                  </div>
                  <p className="mt-2 text-[13px] font-bold text-[#667085]">
                    {item.label}
                  </p>
                  <p
                    className={`mt-1.5 text-[11px] font-black flex items-center gap-1 ${item.note.includes("Không đổi") ? "text-[#98A2B3]" : item.isTrendUp ? "text-green-600" : "text-red-500"}`}
                  >
                    {item.note.includes("+") || item.note.includes("-") ? (
                      item.isTrendUp ? (
                        <TrendingUp className="w-3 h-3 rotate-0" />
                      ) : (
                        <TrendingUp className="w-3 h-3 rotate-180" />
                      )
                    ) : null}
                    {item.note}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-[#E6EAF0] bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-4 border-b border-[#E6EAF0] p-6 bg-white">
            <div className="relative min-w-[320px] flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#98A2B3]" />
              <input
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Tìm kiếm khóa học theo tên, mô tả..."
                className="h-12 w-full rounded-lg border border-[#E6EAF0] bg-[#FAFBFC] pl-12 pr-4 text-sm font-semibold outline-none transition focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-500/5"
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={courseStatusFilter}
                onChange={(e) => setCourseStatusFilter(e.target.value)}
                className="h-12 rounded-lg border border-[#E6EAF0] bg-white px-5 text-sm font-bold text-[#0F172A] outline-none min-w-[160px] focus:border-[#FF6B00]"
              >
                <option value="all">Trạng thái: Tất cả</option>
                <option value="Published">Đã xuất bản</option>
                <option value="Draft">Bản nháp</option>
                <option value="Hidden">Ẩn</option>
              </select>
              <select
                value={courseTeacherFilter}
                onChange={(e) => setCourseTeacherFilter(e.target.value)}
                className="h-12 rounded-lg border border-[#E6EAF0] bg-white px-5 text-sm font-bold text-[#0F172A] outline-none min-w-[180px] focus:border-[#FF6B00]"
              >
                <option value="all">Giảng viên: Tất cả</option>
                {teacherOptions.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.fullName}
                  </option>
                ))}
              </select>
              <button
                onClick={fetchCourses}
                className="flex h-12 items-center gap-2 rounded-lg border border-[#E6EAF0] bg-white px-5 text-sm font-bold text-[#0F172A] transition hover:bg-[#F8F9FB]"
              >
                <RefreshCw className="h-4 w-4" /> Làm mới
              </button>
            </div>
          </div>

          <div className="overflow-hidden">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr className="border-b border-[#E6EAF0] bg-[#FAFBFC]/50">
                  <th className="w-[320px] px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">
                    Khóa học
                  </th>
                  <th className="w-[160px] px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">
                    Giảng viên
                  </th>
                  <th className="w-[80px] px-2 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">
                    Học viên
                  </th>
                  <th className="w-[100px] px-2 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">
                    Thời lượng
                  </th>
                  <th className="w-[100px] px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">
                    Trạng thái
                  </th>
                  <th className="w-[120px] px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">
                    Ngày tạo
                  </th>
                  <th className="w-[80px] px-4 py-5 text-right text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EAF0]">
                {filteredCourses.map((course) => {
                  const teacher = getCourseTeacher(course);
                  const status = getCourseStatus(course);
                  const orderMap = getCourseOrderMap(courses);
                  const courseOrder = orderMap[course.id];
                  return (
                    <tr
                      key={course.id}
                      className="transition hover:bg-[#FAFBFC]/80"
                    >
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={getCourseImage(course)}
                            alt={course.title}
                            className="h-10 w-14 rounded-lg object-cover shadow-sm border border-slate-100 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {courseOrder !== undefined && (
                                <span
                                  className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FFF4EC] text-[10px] font-black text-[#FF6B00] border border-[#FFE3D1]"
                                  title={`Thứ tự thứ ${courseOrder} trong lộ trình`}
                                >
                                  {courseOrder}
                                </span>
                              )}
                              <button
                                onClick={() => openCourseDetail(course)}
                                className="block truncate text-left text-[13px] font-black text-[#0F172A] transition hover:text-[#FF6B00] flex-1"
                              >
                                {course.title}
                              </button>
                            </div>
                            <p className="mt-0.5 line-clamp-1 text-[10px] font-bold text-[#98A2B3] leading-relaxed uppercase tracking-tight">
                              {stripHtml(course.description || "")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full border border-slate-100 overflow-hidden shrink-0">
                            {teacher.avatar ? (
                              <img
                                src={teacher.avatar}
                                alt={teacher.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-[#FFF4EC] text-[#FF6B00] flex items-center justify-center text-[9px] font-black uppercase">
                                {getInitials(teacher.name)}
                              </div>
                            )}
                          </div>
                          <span className="min-w-0 text-[12px] font-bold text-[#0F172A] truncate">
                            {teacher.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-5 text-[12px] font-black text-[#0F172A]">
                        {formatNumber(course.studentCount)}
                      </td>
                      <td className="px-2 py-5 text-[12px] font-bold text-[#667085] whitespace-nowrap">
                        {formatDuration(course.durationMinutes)}
                      </td>
                      <td className="px-4 py-5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${courseStatusClass(status)}`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${status === "Published" ? "bg-green-500" : status === "Draft" ? "bg-amber-500" : "bg-slate-400"}`}
                          ></span>
                          {courseStatusLabel(status)}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-[12px] font-bold text-[#667085] whitespace-nowrap">
                        {formatDate(course.createdAt)}
                      </td>
                      <td className="px-4 py-5 text-right">
                        <div className="flex justify-end gap-0.5">
                          <button
                            onClick={() => openCourseDetail(course)}
                            className="p-1.5 text-[#98A2B3] hover:text-[#0F172A] hover:bg-slate-50 rounded-lg transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenModal("course", course)}
                            className="p-1.5 text-[#98A2B3] hover:text-[#0F172A] hover:bg-slate-50 rounded-lg transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCoursePendingDelete(course)}
                            className="p-1.5 text-[#98A2B3] hover:text-[#EF4444] hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-[#E6EAF0] flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-[#667085]">Hiển thị</span>
              <select className="h-10 px-3 rounded-xl border border-[#E6EAF0] bg-white text-sm font-black text-[#0F172A] outline-none focus:border-[#FF6B00] cursor-pointer">
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
              <span className="text-sm font-bold text-[#667085]">
                trên mỗi trang
              </span>
            </div>

            <div className="flex items-center gap-8">
              <p className="text-sm font-bold text-[#667085]">
                Tổng {formatNumber(courses.length)} khóa học
              </p>
              <div className="flex items-center gap-2">
                <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-[#E6EAF0] text-[#667085] hover:bg-[#F8F9FB] transition-all">
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <button className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#FFF4EC] text-[#FF6B00] font-black text-sm">
                  1
                </button>
                <button className="h-10 w-10 flex items-center justify-center rounded-lg text-[#667085] font-black text-sm hover:bg-[#F8F9FB] transition-all">
                  2
                </button>
                <button className="h-10 w-10 flex items-center justify-center rounded-lg text-[#667085] font-black text-sm hover:bg-[#F8F9FB] transition-all">
                  3
                </button>
                <button className="h-10 w-10 flex items-center justify-center rounded-lg text-[#667085] font-black text-sm hover:bg-[#F8F9FB] transition-all">
                  4
                </button>
                <button className="h-10 w-10 flex items-center justify-center rounded-lg text-[#667085] font-black text-sm hover:bg-[#F8F9FB] transition-all">
                  5
                </button>
                <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-[#E6EAF0] text-[#667085] hover:bg-[#F8F9FB] transition-all">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <select className="h-10 px-4 rounded-lg border border-[#E6EAF0] bg-white text-sm font-black text-[#0F172A] outline-none min-w-[140px] focus:border-[#FF6B00] cursor-pointer">
                  <option>Đi tới trang</option>
                  <option>Trang 1</option>
                  <option>Trang 2</option>
                  <option>Trang 3</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCourseDetail = (course: any) => {
    if (!course) {
      return (
        <div className="rounded-xl border border-[#E6EAF0] bg-white p-8 text-center">
          <p className="text-sm font-semibold text-[#667085]">
            Chưa chọn khóa học.
          </p>
          <button
            onClick={() => setActiveSection("courses")}
            className="mt-4 rounded-lg bg-[#FF4D12] px-5 py-3 text-sm font-bold text-white"
          >
            Quay lại danh sách
          </button>
        </div>
      );
    }

    const teacher = getCourseTeacher(course);
    const progress = Math.round(Number(course.averageProgress || 0));
    const outcomes = courseOutcomes(course);
    const lessonGroups = lessons.length ? lessons : [];

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <section className="relative overflow-hidden rounded-xl bg-[#0F172A] min-h-[335px] shadow-sm">
            <img
              src={getCourseImage(course)}
              alt={course.title}
              className="absolute inset-0 h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
            <div className="relative z-10 flex h-full min-h-[335px] flex-col justify-end p-8 text-white">
              <span className="mb-4 w-fit rounded-full bg-[#FF4D12] px-3 py-1 text-xs font-black uppercase">
                Khóa học tiêu biểu
              </span>
              <h1 className="max-w-xl text-4xl font-black tracking-tight">
                {course.title}
              </h1>
              <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-white/90">
                {stripHtml(course.description || "").slice(0, 180)}
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[teacher.name, course.creatorName, "Học viên"].map(
                    (name, index) => (
                      <div
                        key={index}
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#FFF4EC] text-xs font-black text-[#FF6B00]"
                      >
                        {getInitials(name)}
                      </div>
                    ),
                  )}
                </div>
                <span className="text-sm font-bold">
                  {formatNumber(course.studentCount)} học sinh đã đăng ký
                </span>
              </div>
            </div>
            <button className="absolute right-8 top-8 z-10 rounded-full bg-white px-6 py-3 text-sm font-black text-[#FF4D12] shadow-lg">
              Tiếp tục học
            </button>
          </section>

          <aside className="rounded-xl border border-[#E6EAF0] bg-white p-7 shadow-sm">
            {[
              { icon: UserRound, label: "Giảng viên", value: teacher.name },
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
                label: "Học sinh",
                value: `${formatNumber(course.studentCount)} học sinh`,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between border-b border-[#EEF2F6] py-4 last:border-0"
              >
                <div className="flex items-center gap-3 text-sm font-semibold text-[#667085]">
                  <item.icon className="h-5 w-5" /> {item.label}
                </div>
                <span className="max-w-[190px] text-right text-sm font-black text-[#0F172A]">
                  {item.value}
                </span>
              </div>
            ))}
            <div className="pt-4">
              <div className="mb-3 flex items-center justify-between text-sm font-bold">
                <span className="text-[#667085]">Tiến độ khóa học</span>
                <span className="text-[#FF4D12]">{progress}% hoàn thành</span>
              </div>
              <div className="h-2 rounded-full bg-[#EEF2F6]">
                <div
                  className="h-full rounded-full bg-[#FF4D12]"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          </aside>
        </div>

        <div className="flex overflow-x-auto rounded-xl border border-[#E6EAF0] bg-white px-6 shadow-sm">
          {[
            "Tổng quan",
            "Nội dung khóa học",
            "Tài liệu",
            "Flashcard",
            "Quiz",
            "Bài thi",
            "Thông báo",
            "Đánh giá",
          ].map((tab, index) => (
            <button
              key={tab}
              className={`relative min-w-fit px-6 py-5 text-sm font-bold ${index === 0 ? "text-[#FF4D12]" : "text-[#667085]"}`}
            >
              {tab}
              {index === 0 && (
                <span className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full bg-[#FF4D12]" />
              )}
            </button>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section className="rounded-xl border border-[#E6EAF0] bg-white p-7 shadow-sm">
              <h2 className="flex items-center gap-3 text-xl font-black text-[#0F172A]">
                <BookOpen className="h-6 w-6 text-[#FF4D12]" /> Giới thiệu khóa
                học
              </h2>
              <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_280px]">
                <div>
                  <p className="text-sm font-medium leading-7 text-[#3C4A5F]">
                    {stripHtml(course.description || "")}
                  </p>
                  <div className="mt-6 space-y-3">
                    {(outcomes.length
                      ? outcomes
                      : [
                          "Hệ thống kiến thức đầy đủ, dễ hiểu",
                          "Bài giảng video chất lượng cao",
                          "Tài liệu PDF và sơ đồ tư duy",
                        ]
                    ).map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 text-sm font-semibold text-[#3C4A5F]"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-500" />{" "}
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-green-50 to-orange-50 p-6">
                  <div className="grid h-48 w-48 place-items-center rounded-full bg-white text-[#22C55E] shadow-inner">
                    <Layers className="h-24 w-24" />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[#E6EAF0] bg-white p-7 shadow-sm">
              <h2 className="flex items-center gap-3 text-xl font-black text-[#0F172A]">
                <GraduationCap className="h-6 w-6 text-[#FF4D12]" /> Nội dung
                khóa học
              </h2>
              <div className="mt-6 overflow-hidden rounded-xl border border-[#E6EAF0]">
                {lessonGroups.map((lesson, index) => (
                  <div
                    key={lesson.id || index}
                    className={`border-b border-[#E6EAF0] p-5 last:border-0 ${index === 0 ? "bg-[#FFF4EC]" : "bg-white"}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#FF4D12]">
                          <PlayCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#0F172A]">
                            Bài {index + 1}. {lesson.title}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-[#667085]">
                            {lesson.description ||
                              "Video bài giảng, tài liệu PDF, flashcard và quiz."}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-bold text-[#667085]">
                        <span>
                          {index === 0 ? "18:45" : `${32 + index * 4}:30`}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl border border-[#E6EAF0] bg-white p-7 text-center shadow-sm">
              {teacher.avatar ? (
                <img
                  src={teacher.avatar}
                  alt={teacher.name}
                  className="mx-auto h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF4EC] text-2xl font-black text-[#FF4D12]">
                  {getInitials(teacher.name)}
                </div>
              )}
              <h3 className="mt-5 text-lg font-black text-[#0F172A]">
                {teacher.name}
              </h3>
              <p className="text-sm font-semibold text-[#667085]">
                Giảng viên Sinh học
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-black text-[#0F172A]">8+</p>
                  <p className="text-xs font-semibold text-[#667085]">
                    Năm kinh nghiệm
                  </p>
                </div>
                <div>
                  <p className="text-lg font-black text-[#0F172A]">2.500+</p>
                  <p className="text-xs font-semibold text-[#667085]">
                    Học sinh
                  </p>
                </div>
                <div>
                  <p className="text-lg font-black text-[#0F172A]">
                    4.9{" "}
                    <Star className="inline h-4 w-4 fill-amber-400 text-amber-400" />
                  </p>
                  <p className="text-xs font-semibold text-[#667085]">
                    Đánh giá
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[#E6EAF0] bg-white p-7 shadow-sm">
              <h3 className="text-lg font-black text-[#0F172A]">
                Bạn sẽ nhận được
              </h3>
              <div className="mt-5 space-y-4">
                {(outcomes.length
                  ? outcomes
                  : [
                      "Bài giảng video chất lượng cao",
                      "Tài liệu PDF đầy đủ",
                      "Quiz và bài thi đánh giá năng lực",
                      "Cập nhật nội dung miễn phí",
                    ]
                ).map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 text-sm font-semibold text-[#3C4A5F]"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />{" "}
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-[#E6EAF0] bg-white p-7 text-center shadow-sm">
              <Award className="mx-auto h-20 w-20 text-amber-400" />
              <h3 className="mt-4 text-lg font-black text-[#0F172A]">
                Chứng chỉ hoàn thành
              </h3>
              <p className="mt-3 text-sm font-medium leading-6 text-[#667085]">
                Nhận chứng chỉ của GenZBio sau khi hoàn thành tất cả bài học và
                bài thi.
              </p>
            </section>
          </div>
        </div>
      </div>
    );
  };

  const renderCourseDetailV2 = (course: any) => {
    if (!course) {
      return (
        <div className="rounded-xl border border-[#E6EAF0] bg-white p-8 text-center">
          <p className="text-sm font-semibold text-[#667085]">
            Chưa chọn khóa học.
          </p>
          <button
            onClick={() => setActiveSection("courses")}
            className="mt-4 rounded-lg bg-[#FF4D12] px-5 py-3 text-sm font-bold text-white"
          >
            Quay lại danh sách
          </button>
        </div>
      );
    }

    const teacher = getCourseTeacher(course);
    const progress = Math.round(Number(course.averageProgress || 0));
    const outcomes = courseOutcomes(course);
    const lessonGroups = lessons.length ? lessons : [];
    const tabs = [
      { id: "overview" as const, label: "Tổng quan", count: null },
      {
        id: "lessons" as const,
        label: "Nội dung khóa học",
        count: lessonGroups.length,
      },
      {
        id: "students" as const,
        label: "Học viên",
        count: selectedCourse?.students?.length || selectedCourse?.studentCount || 0
      },
      { id: "feedback" as const, label: "Đánh giá khóa học", count: null },
    ];

    const renderLearningItemCards = (
      items: any[],
      kind: "flashcard" | "quiz" | "exam",
    ) => (
      <section className="rounded-xl border border-[#E6EAF0] bg-white p-7 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#0F172A]">
              {kind === "flashcard"
                ? "Bộ flashcard"
                : kind === "quiz"
                  ? "Danh sách quiz"
                  : "Danh sách bài thi"}
            </h2>
            <p className="mt-2 text-sm font-medium text-[#667085]">
              {kind === "flashcard"
                ? "Quản lý các thẻ ghi nhớ theo từng bài học."
                : kind === "quiz"
                  ? "CRUD và preview các bộ câu hỏi luyện tập."
                  : "CRUD và preview các đề kiểm tra của khóa học."}
            </p>
          </div>
          <button
            onClick={() => openDetailModal(kind, "create")}
            className="flex h-11 items-center gap-2 rounded-lg bg-[#FF4D12] px-5 text-sm font-black text-white transition hover:bg-[#E6420C]"
          >
            <Plus className="h-4 w-4" />
            {kind === "flashcard"
              ? "Thêm flashcard"
              : kind === "quiz"
                ? "Thêm quiz"
                : "Thêm bài thi"}
          </button>
        </div>

        {!items.length ? (
          <div className="rounded-xl border border-dashed border-[#D8DFEA] bg-[#FBFCFE] p-10 text-center text-sm font-semibold text-[#667085]">
            Chưa có nội dung cho mục này.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => {
              const content = parseLearningContent(item);
              const cards = content.cards || [];
              const questions = content.questions || [];
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-[#E6EAF0] p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-black text-[#0F172A]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#98A2B3]">
                        {lessonTitleById(item.lessonId)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDetailPreview({ kind, item })}
                        className="rounded-lg p-2 text-[#667085] transition hover:bg-[#F8F9FB] hover:text-[#0F172A]"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDetailModal(kind, "edit", item)}
                        className="rounded-lg p-2 text-[#667085] transition hover:bg-[#F8F9FB] hover:text-[#0F172A]"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteLearningItem(
                            item.id,
                            kind === "flashcard"
                              ? "Flashcard"
                              : kind === "quiz"
                                ? "Quiz"
                                : "Bài thi",
                          )
                        }
                        className="rounded-lg p-2 text-[#667085] transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-[#F8FAFC] p-4">
                    {kind === "flashcard" ? (
                      <>
                        <p className="text-sm font-bold text-[#0F172A]">
                          {cards.length} thẻ
                        </p>
                        <div className="mt-3 grid gap-3">
                          {cards.slice(0, 2).map((card: any, index: number) => (
                            <div
                              key={index}
                              className="rounded-lg border border-[#E6EAF0] bg-white p-3"
                            >
                              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#98A2B3]">
                                Mặt trước
                              </p>
                              <p className="mt-2 text-sm font-semibold text-[#0F172A]">
                                {card.front}
                              </p>
                              <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-[#98A2B3]">
                                Mặt sau
                              </p>
                              <p className="mt-2 text-sm font-medium text-[#475569]">
                                {card.back}
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-[#0F172A]">
                          {questions.length} câu hỏi
                        </p>
                        {questions[0] && (
                          <div className="mt-3 rounded-lg border border-[#E6EAF0] bg-white p-3">
                            <p className="text-sm font-semibold text-[#0F172A]">
                              {questions[0].question}
                            </p>
                            <div className="mt-3 grid gap-2">
                              {(questions[0].options || []).map(
                                (option: string, index: number) => (
                                  <div
                                    key={index}
                                    className={`rounded-md px-3 py-2 text-sm ${Number(questions[0].correctAnswer) === index ? "bg-green-50 font-bold text-green-700" : "bg-[#F8FAFC] text-[#475569]"}`}
                                  >
                                    {String.fromCharCode(65 + index)}. {option}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <section className="relative min-h-[335px] overflow-hidden rounded-xl bg-[#0F172A] shadow-sm">
            <img
              src={getCourseImage(course)}
              alt={course.title}
              className="absolute inset-0 h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
            <div className="relative z-10 flex min-h-[335px] h-full flex-col justify-end p-8 text-white">
              <span className="mb-4 w-fit rounded-full bg-[#FF4D12] px-3 py-1 text-xs font-black uppercase">
                Khóa học tiêu biểu
              </span>
              <h1 className="max-w-xl text-4xl font-black tracking-tight">
                {course.title}
              </h1>
              <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-white/90">
                {stripHtml(course.description || "").slice(0, 180)}
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[teacher.name, course.creatorName, "Học viên"].map(
                    (name, index) => (
                      <div
                        key={index}
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#FFF4EC] text-xs font-black text-[#FF6B00]"
                      >
                        {getInitials(name)}
                      </div>
                    ),
                  )}
                </div>
                <span className="text-sm font-bold">
                  {formatNumber(course.studentCount)} học sinh đã đăng ký
                </span>
              </div>
            </div>
            <button className="absolute right-8 top-8 z-10 rounded-full bg-white px-6 py-3 text-sm font-black text-[#FF4D12] shadow-lg">
              Tiếp tục học
            </button>
          </section>

          <aside className="rounded-xl border border-[#E6EAF0] bg-white p-7 shadow-sm">
            {[
              { icon: UserRound, label: "Giảng viên", value: teacher.name },
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
                label: "Học sinh",
                value: `${formatNumber(course.studentCount)} học sinh`,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between border-b border-[#EEF2F6] py-4 last:border-0"
              >
                <div className="flex items-center gap-3 text-sm font-semibold text-[#667085]">
                  <item.icon className="h-5 w-5" /> {item.label}
                </div>
                <span className="max-w-[190px] text-right text-sm font-black text-[#0F172A]">
                  {item.value}
                </span>
              </div>
            ))}
            <div className="pt-4">
              <div className="mb-3 flex items-center justify-between text-sm font-bold">
                <span className="text-[#667085]">Tiến độ khóa học</span>
                <span className="text-[#FF4D12]">{progress}% hoàn thành</span>
              </div>
              <div className="h-2 rounded-full bg-[#EEF2F6]">
                <div
                  className="h-full rounded-full bg-[#FF4D12]"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          </aside>
        </div>

        <div className="flex overflow-x-auto rounded-xl border border-[#E6EAF0] bg-white px-3 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCourseDetailTab(tab.id)}
              className={`relative flex min-w-fit items-center gap-3 px-5 py-5 text-sm font-bold ${courseDetailTab === tab.id ? "text-[#FF4D12]" : "text-[#667085]"}`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-black ${courseDetailTab === tab.id ? "bg-[#FFF1EB] text-[#FF4D12]" : "bg-[#F1F5F9] text-[#475569]"}`}
                >
                  {tab.count}
                </span>
              )}
              {courseDetailTab === tab.id && (
                <span className="absolute bottom-0 left-5 right-5 h-0.5 rounded-full bg-[#FF4D12]" />
              )}
            </button>
          ))}
        </div>

        {courseDetailTab === "overview" && (
          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <div className="space-y-6">
              <section className="rounded-xl border border-[#E6EAF0] bg-white p-7 shadow-sm">
                <h2 className="flex items-center gap-3 text-xl font-black text-[#0F172A]">
                  <BookOpen className="h-6 w-6 text-[#FF4D12]" /> Giới thiệu
                  khóa học
                </h2>
                <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_280px]">
                  <div>
                    <p className="text-sm font-medium leading-7 text-[#3C4A5F]">
                      {stripHtml(course.description || "")}
                    </p>
                    <div className="mt-6 space-y-3">
                      {(outcomes.length
                        ? outcomes
                        : [
                            "Hệ thống kiến thức đầy đủ, dễ hiểu",
                            "Bài giảng video chất lượng cao",
                            "Tài liệu PDF và sơ đồ tư duy",
                          ]
                      ).map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 text-sm font-semibold text-[#3C4A5F]"
                        >
                          <CheckCircle2 className="h-5 w-5 text-green-500" />{" "}
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-green-50 to-orange-50 p-6">
                    <div className="grid h-48 w-48 place-items-center rounded-full bg-white text-[#22C55E] shadow-inner">
                      <Layers className="h-24 w-24" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-[#E6EAF0] bg-white p-7 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="flex items-center gap-3 text-xl font-black text-[#0F172A]">
                    <GraduationCap className="h-6 w-6 text-[#FF4D12]" /> Nội
                    dung khóa học
                  </h2>
                  <button
                    onClick={() => handleOpenModal("lesson")}
                    className="flex h-11 items-center gap-2 rounded-lg border border-[#D8DFEA] px-4 text-sm font-black text-[#0F172A] transition hover:bg-[#F8F9FB]"
                  >
                    <Plus className="h-4 w-4" /> Thêm bài học
                  </button>
                </div>
                <div className="overflow-hidden rounded-xl border border-[#E6EAF0]">
                  {lessonGroups.map((lesson, index) => (
                    <div
                      key={lesson.id || index}
                      className={`border-b border-[#E6EAF0] p-5 last:border-0 ${index === 0 ? "bg-[#FFF4EC]" : "bg-white"}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#FF4D12]">
                            <PlayCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#0F172A]">
                              Bài {index + 1}. {lesson.title}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-[#667085]">
                              {lesson.description ||
                                "Video bài giảng, tài liệu PDF, flashcard và quiz."}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal("lesson", lesson)}
                            className="rounded-lg p-2 text-[#667085] transition hover:bg-[#F8F9FB] hover:text-[#0F172A]"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="rounded-lg p-2 text-[#667085] transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-xl border border-[#E6EAF0] bg-white p-7 text-center shadow-sm">
                {teacher.avatar ? (
                  <img
                    src={teacher.avatar}
                    alt={teacher.name}
                    className="mx-auto h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF4EC] text-2xl font-black text-[#FF4D12]">
                    {getInitials(teacher.name)}
                  </div>
                )}
                <h3 className="mt-5 text-lg font-black text-[#0F172A]">
                  {teacher.name}
                </h3>
                <p className="text-sm font-semibold text-[#667085]">
                  Giảng viên Sinh học
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-black text-[#0F172A]">8+</p>
                    <p className="text-xs font-semibold text-[#667085]">
                      Năm kinh nghiệm
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-[#0F172A]">2.500+</p>
                    <p className="text-xs font-semibold text-[#667085]">
                      Học sinh
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-[#0F172A]">
                      {formatNumber(course.studentCount)}
                    </p>
                    <p className="text-xs font-semibold text-[#667085]">
                      Đăng ký
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-[#E6EAF0] bg-white p-7 shadow-sm">
                <h3 className="text-lg font-black text-[#0F172A]">
                  Bạn sẽ nhận được
                </h3>
                <div className="mt-5 space-y-4">
                  {(outcomes.length
                    ? outcomes
                    : [
                        "Bài giảng video chất lượng cao",
                        "Tài liệu PDF đầy đủ",
                        "Quiz và bài thi đánh giá năng lực",
                        "Cập nhật nội dung miễn phí",
                      ]
                  ).map((item) => (
                    <div
                      key={item}
                      className="flex gap-3 text-sm font-semibold text-[#3C4A5F]"
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />{" "}
                      {item}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-[#E6EAF0] bg-white p-7 text-center shadow-sm">
                <Award className="mx-auto h-20 w-20 text-amber-400" />
                <h3 className="mt-4 text-lg font-black text-[#0F172A]">
                  Chứng chỉ hoàn thành
                </h3>
                <p className="mt-3 text-sm font-medium leading-6 text-[#667085]">
                  Nhận chứng chỉ của GenZBio sau khi hoàn thành tất cả bài học
                  và bài thi.
                </p>
              </section>
            </div>
          </div>
        )}

        {courseDetailTab === "lessons" && (
          <section className="rounded-xl border border-[#E6EAF0] bg-white p-7 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-[#0F172A]">
                  Danh sách bài học
                </h2>
                <p className="mt-2 text-sm font-medium text-[#667085]">
                  Quản lý nội dung video, mô tả và PDF nền cho từng bài học.
                </p>
              </div>
            </div>
            <div className="grid gap-4">
              {lessonGroups.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="rounded-xl border border-[#E6EAF0] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-black text-[#0F172A]">
                        Bài {index + 1}. {lesson.title}
                      </p>
                      <p className="mt-2 text-sm font-medium leading-6 text-[#667085]">
                        {lesson.description || "Chưa có mô tả."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-[#475569]">
                        {lesson.videoUrl && (
                          <span className="rounded-full bg-[#F1F5F9] px-3 py-1">
                            Video
                          </span>
                        )}
                        {lesson.pdfUrl && (
                          <span className="rounded-full bg-[#F1F5F9] px-3 py-1">
                            PDF nền
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/lesson/${lesson.id}`}
                        className="rounded-lg px-3 py-2 text-xs font-black text-[#FF4D12] transition hover:bg-orange-50"
                      >
                        Xem bài học
                      </Link>
                      <button
                        onClick={() => handleOpenModal("lesson", lesson)}
                        className="rounded-lg p-2 text-[#667085] transition hover:bg-[#F8F9FB] hover:text-[#0F172A]"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="rounded-lg p-2 text-[#667085] transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {courseDetailTab === "materials" && (
          <section className="rounded-xl border border-[#E6EAF0] bg-white p-7 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-[#0F172A]">
                  Tài liệu khóa học
                </h2>
                <p className="mt-2 text-sm font-medium text-[#667085]">
                  Cho phép preview trực tiếp PDF, DOC, DOCX ngay trong trang
                  quản trị.
                </p>
              </div>
              <button
                onClick={() => openDetailModal("material", "create")}
                className="flex h-11 items-center gap-2 rounded-lg bg-[#FF4D12] px-5 text-sm font-black text-white transition hover:bg-[#E6420C]"
              >
                <Plus className="h-4 w-4" /> Thêm tài liệu
              </button>
            </div>

            {!courseMaterials.length ? (
              <div className="rounded-xl border border-dashed border-[#D8DFEA] bg-[#FBFCFE] p-10 text-center text-sm font-semibold text-[#667085]">
                Chưa có tài liệu nào.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {courseMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="rounded-xl border border-[#E6EAF0] p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-black text-[#0F172A]">
                          {material.title}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="rounded-full bg-[#FFF4EC] px-3 py-1 text-xs font-black uppercase text-[#FF4D12]">
                            {material.fileType}
                          </span>
                          <span className="text-xs font-semibold text-[#98A2B3]">
                            {formatDate(material.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setDetailPreview({
                              kind: "material",
                              item: material,
                            })
                          }
                          className="rounded-lg p-2 text-[#667085] transition hover:bg-[#F8F9FB] hover:text-[#0F172A]"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            openDetailModal("material", "edit", material)
                          }
                          className="rounded-lg p-2 text-[#667085] transition hover:bg-[#F8F9FB] hover:text-[#0F172A]"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteCourseMaterial(material.id)
                          }
                          className="rounded-lg p-2 text-[#667085] transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-4 text-sm font-medium leading-6 text-[#667085]">
                      {material.description || "Không có mô tả."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {courseDetailTab === "flashcards" &&
          renderLearningItemCards(flashcardItems, "flashcard")}
        {courseDetailTab === "quizzes" &&
          renderLearningItemCards(quizItems, "quiz")}
        {courseDetailTab === "exams" &&
          renderLearningItemCards(examItems, "exam")}
        {courseDetailTab === "feedback" && (
          <CourseFeedbackPanel
            courseId={course.id}
            teacherId={course.teacherId || course.createdBy || null}
            canWrite
            title="Đánh giá khóa học"
          />
        )}
        {courseDetailTab === "students" && renderCourseStudentsTab(course)}
      </div>
    );
  };

  const renderCourseStudentsTab = (course: any) => {
    if (!course) return null;

    // Filter students enrolled in the current course based on search query
    const courseStudents = course.students || [];
    const filteredCourseStudents = courseStudents.filter((student: any) => {
      const q = adminStudentEmailQuery.toLowerCase().trim();
      return (
        !q ||
        student.fullName.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q)
      );
    });

    // Filter suggestions for new students from the system users list (exclude already enrolled)
    const enrolledIds = new Set(courseStudents.map((s: any) => s.id));
    const allStudents = users.filter((u) => roleToValue(u.role) === 2);
    
    // Filter suggestions based on what the admin is typing in the input
    const suggestionFilter = adminStudentEmailQuery.trim().toLowerCase();
    const suggestions = allStudents
      .filter((s) => {
        if (enrolledIds.has(s.id)) return false;
        return (
          s.email.toLowerCase().includes(suggestionFilter) ||
          s.fullName.toLowerCase().includes(suggestionFilter)
        );
      })
      .slice(0, 8);

    const handleEnrollStudent = async () => {
      if (!selectedAdminStudent || !course) return;
      setIsAdminEnrolling(true);
      try {
        await adminApi.enrollStudent(course.id, selectedAdminStudent.email);
        toast.success(`Đã phân học sinh ${selectedAdminStudent.fullName} vào khóa học!`);
        
        // Refresh detailed course information
        const res = await publicApi.getCourseById(course.id);
        setSelectedCourse(res.data);
        
        setIsAdminAddStudentOpen(false);
        setSelectedAdminStudent(null);
        setAdminStudentEmailQuery("");
      } catch (err: any) {
        toast.error(
          err.response?.data?.message || "Không thể thêm học sinh vào khóa học.",
        );
      } finally {
        setIsAdminEnrolling(false);
      }
    };

    const handleUnenrollStudent = async (studentId: number, studentName: string) => {
      if (!confirm(`Bạn có chắc chắn muốn gỡ học viên "${studentName}" khỏi khóa học này?`)) {
        return;
      }
      try {
        await adminApi.unenrollStudent(course.id, studentId);
        toast.success(`Đã gỡ học viên ${studentName} khỏi khóa học.`);
        
        // Refresh detailed course information
        const res = await publicApi.getCourseById(course.id);
        setSelectedCourse(res.data);
      } catch (err: any) {
        toast.error(
          err.response?.data?.message || "Không thể gỡ học sinh khỏi khóa học.",
        );
      }
    };

    return (
      <div className="space-y-6">
        <section className="rounded-2xl border border-[#ECEEF2] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">
                Danh sách học viên tham gia
              </h2>
              <p className="text-sm font-semibold text-[#667085] mt-1">
                Phân quyền và quản lý danh sách học sinh học khóa học này.
              </p>
            </div>
            <button
              onClick={() => {
                setIsAdminAddStudentOpen(true);
                setAdminStudentEmailQuery("");
                setSelectedAdminStudent(null);
                setShowAdminSuggestions(false);
              }}
              className="flex items-center gap-2 px-5 py-3 bg-[#FF6B00] text-white rounded-xl text-xs font-bold hover:bg-[#E65F00] transition-all self-start sm:self-center"
            >
              <UserPlus className="w-4.5 h-4.5" /> Phân học sinh mới
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm học viên theo họ tên hoặc email..."
              value={isAdminAddStudentOpen ? "" : adminStudentEmailQuery}
              onChange={(e) => setAdminStudentEmailQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-[#ECEEF2] rounded-xl focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] outline-none text-xs font-bold text-[#0F172A] transition-all placeholder:text-slate-400"
            />
          </div>

          {filteredCourseStudents.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#ECEEF2] rounded-2xl bg-slate-50/40">
              <Users className="mx-auto h-10 w-10 text-slate-300 mb-3" />
              <p className="text-sm font-bold text-[#667085]">
                {courseStudents.length === 0 
                  ? "Chưa có học sinh nào đăng ký tham gia khóa học này." 
                  : "Không tìm thấy học sinh nào khớp với từ khóa tìm kiếm."}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#ECEEF2]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-[#ECEEF2]">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[30%]">
                      Học viên
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[35%]">
                      Email
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[20%]">
                      Ngày tham gia
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[15%] text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECEEF2]">
                  {filteredCourseStudents.map((student: any) => (
                    <tr key={student.id} className="hover:bg-slate-50/40 transition">
                      <td className="px-6 py-4 font-bold text-[#0F172A]">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF4EC] text-xs font-black text-[#FF6B00]">
                            {student.fullName
                              ?.split(" ")
                              ?.map((n: string) => n[0])
                              ?.join("")
                              ?.slice(0, 2)
                              ?.toUpperCase() || "HS"}
                          </div>
                          <span>{student.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-[#667085]">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-[#667085]">
                        {student.enrolledAt
                          ? new Date(student.enrolledAt).toLocaleDateString("vi-VN")
                          : "Vừa mới đây"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleUnenrollStudent(student.id, student.fullName)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Gỡ học viên khỏi khóa học"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Enroll Student Dialog/Modal */}
        {isAdminAddStudentOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-5 bg-[#0F172A]/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-white rounded-2xl p-6 border border-[#ECEEF2] shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A]">
                    Phân học sinh vào khóa học
                  </h3>
                  <p className="text-xs font-semibold text-[#667085] mt-1">
                    Tìm kiếm và đăng ký học viên mới cho khóa học này.
                  </p>
                </div>
                <button
                  onClick={() => setIsAdminAddStudentOpen(false)}
                  className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Họ tên hoặc Email học sinh
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Nhập để tìm học sinh..."
                      value={adminStudentEmailQuery}
                      onChange={(e) => {
                        setAdminStudentEmailQuery(e.target.value);
                        setSelectedAdminStudent(null);
                        setShowAdminSuggestions(true);
                      }}
                      onFocus={() => setShowAdminSuggestions(true)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-[#ECEEF2] rounded-xl focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] outline-none text-xs font-bold text-[#0F172A] transition-all"
                    />
                  </div>

                  {/* Suggestions Popover */}
                  {showAdminSuggestions && adminStudentEmailQuery.trim().length > 0 && (
                    <div className="absolute left-0 right-0 z-20 mt-1 max-h-52 overflow-y-auto rounded-xl border border-[#ECEEF2] bg-white shadow-xl divide-y divide-slate-100">
                      {suggestions.map((student) => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => {
                            setSelectedAdminStudent(student);
                            setAdminStudentEmailQuery(student.email);
                            setShowAdminSuggestions(false);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF4EC] text-xs font-black text-[#FF6B00]">
                            {student.fullName
                              ?.split(" ")
                              ?.map((n: string) => n[0])
                              ?.join("")
                              ?.toUpperCase() || "HS"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#0F172A] truncate">
                              {student.fullName}
                            </p>
                            <p className="text-[10px] font-semibold text-[#667085] truncate mt-0.5">
                              {student.email}
                            </p>
                          </div>
                        </button>
                      ))}
                      {suggestions.length === 0 && (
                        <div className="px-4 py-4 text-center text-xs font-semibold text-[#667085]">
                          Không tìm thấy học sinh nào khác để phân quyền.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Student Preview */}
                {selectedAdminStudent && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50/50 border border-orange-100 rounded-xl">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF4EC] text-xs font-black text-[#FF6B00]">
                      {selectedAdminStudent.fullName
                        ?.split(" ")
                        ?.map((n: string) => n[0])
                        ?.join("")
                        ?.toUpperCase() || "HS"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0F172A] truncate">
                        {selectedAdminStudent.fullName}
                      </p>
                      <p className="text-[10px] font-semibold text-[#667085] truncate">
                        {selectedAdminStudent.email}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-orange-100 text-[#FF6B00] rounded-full text-[9px] font-bold uppercase tracking-wider">
                      Đã chọn
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setIsAdminAddStudentOpen(false)}
                    className="flex-1 py-2.5 border border-[#ECEEF2] hover:bg-slate-50 text-xs font-bold text-[#0F172A] rounded-xl transition"
                  >
                    Hủy
                  </button>
                  <button
                    disabled={!selectedAdminStudent || isAdminEnrolling}
                    onClick={handleEnrollStudent}
                    className="flex-1 py-2.5 bg-[#FF6B00] hover:bg-[#E65F00] text-white text-xs font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    {isAdminEnrolling ? "Đang xử lý..." : "Xác nhận thêm"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderNews = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[28px] shadow-sm border border-[#ECEEF2] overflow-hidden">
        <div className="p-8 border-b border-[#ECEEF2] flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Tin tức
          </h2>
          <button
            onClick={() => handleOpenModal("news")}
            className="flex items-center gap-2 px-6 py-4 bg-[#FF6B00] text-white rounded-[18px] text-sm font-bold hover:bg-[#E65F00] transition-all"
          >
            <Plus className="w-5 h-5" /> Viết bài mới
          </button>
        </div>
        <div className="divide-y divide-[#ECEEF2]">
          {news.map((item) => (
            <div
              key={item.id}
              className="p-8 flex items-center justify-between hover:bg-[#FAFAFA] transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-[#F8F9FB] rounded-2xl flex items-center justify-center text-[#FF6B00]">
                  <Newspaper className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0F172A] group-hover:text-[#FF6B00] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[12px] text-[#667085] font-medium mt-1 uppercase tracking-wider">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal("news", item)}
                  className="p-2 text-[#98A2B3] hover:text-[#0F172A] transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteNews(item.id)}
                  className="p-2 text-[#98A2B3] hover:text-[#EF4444] transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[28px] shadow-sm border border-[#ECEEF2] overflow-hidden">
        <div className="p-8 border-b border-[#ECEEF2]">
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Feedback học viên
          </h2>
        </div>
        <div className="divide-y divide-[#ECEEF2]">
          {feedbacks.map((item) => (
            <div
              key={item.id}
              className="p-8 hover:bg-[#FAFAFA] transition-all"
            >
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-[#FFF4EC] rounded-2xl flex items-center justify-center text-[#FF6B00] font-bold text-lg">
                  {item.student.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-[#0F172A]">{item.student}</h4>
                    <span className="text-[12px] text-[#98A2B3] font-medium">
                      {item.date}
                    </span>
                  </div>
                  <p className="text-[#667085] text-sm leading-relaxed italic">
                    "{item.content}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEnrollmentRequests = () => {
    const handleApprove = async (requestId: number) => {
      try {
        await adminApi.approveEnrollmentRequest(requestId);
        toast.success("Đã phê duyệt yêu cầu đăng ký học viên thành công!");
        fetchEnrollmentRequests();
        fetchOverviewStats();
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Không thể phê duyệt yêu cầu.");
      }
    };

    const handleReject = async (requestId: number) => {
      try {
        await adminApi.rejectEnrollmentRequest(requestId);
        toast.success("Đã từ chối yêu cầu đăng ký.");
        fetchEnrollmentRequests();
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Không thể từ chối yêu cầu.");
      }
    };

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-[28px] shadow-sm border border-[#ECEEF2] overflow-hidden">
          <div className="p-8 border-b border-[#ECEEF2] flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                Yêu cầu đăng ký khóa học
              </h2>
              <p className="mt-2 text-sm font-semibold text-[#667085]">
                Phê duyệt học viên đăng ký tham gia các khóa học trong hệ thống.
              </p>
            </div>
            <button
              onClick={fetchEnrollmentRequests}
              className="flex h-11 items-center gap-2 px-4 rounded-xl border border-[#D8DFEA] bg-white text-sm font-bold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Làm mới
            </button>
          </div>

          <div className="p-8">
            {!enrollmentRequests.length ? (
              <div className="rounded-[22px] border border-dashed border-[#D8DFEA] bg-[#FBFCFE] p-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF4EC] text-[#FF6B00]">
                  <UserPlus className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg font-black text-[#0F172A]">Không có yêu cầu nào</h3>
                <p className="mt-2 text-sm font-semibold text-[#667085] max-w-sm mx-auto">
                  Tất cả các yêu cầu đăng ký khóa học từ học viên mới đã được xử lý xong.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {enrollmentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-[22px] border border-[#ECEEF2] bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF4EC] text-sm font-black text-[#FF6B00]">
                          {getInitials(req.studentName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-base font-black text-[#0F172A] truncate">
                            {req.studentName}
                          </h4>
                          <p className="text-xs font-semibold text-[#667085] truncate">
                            {req.studentEmail}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 border-t border-[#EEF2F6] pt-4 space-y-2">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#98A2B3]">
                            Khóa học yêu cầu
                          </span>
                          <p className="text-sm font-bold text-[#0F172A] leading-relaxed line-clamp-2">
                            {req.courseTitle}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#98A2B3]">
                            Ngày gửi yêu cầu
                          </span>
                          <p className="text-xs font-bold text-[#3C4A5F]">
                            {formatDate(req.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#EEF2F6] pt-4">
                      <button
                        onClick={() => handleReject(req.id)}
                        className="flex h-11 items-center justify-center rounded-xl border border-red-200 bg-white text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Từ chối
                      </button>
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="flex h-11 items-center justify-center rounded-xl bg-[#22C55E] text-sm font-bold text-white shadow-lg shadow-green-500/10 hover:bg-[#16A34A] transition-colors"
                      >
                        Phê duyệt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const menuItems = [
    { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { id: "users", label: "Người dùng", icon: Users },
    { id: "courses", label: "Khóa học", icon: BookOpen },
    { id: "news", label: "Tin tức", icon: Newspaper },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
    { id: "enrollmentRequests", label: "Yêu cầu đăng ký", icon: UserPlus },
  ];

  const activeLabel =
    activeSection === "courseDetail"
      ? "Chi tiết khóa học"
      : menuItems.find((item) => item.id === activeSection)?.label;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-6 pt-6 pb-10">
      <div className="space-y-6 pb-24">
        {activeSection === "dashboard" && renderDashboardV2()}
        {activeSection === "users" && renderUsers()}
        {activeSection === "courses" && renderCoursesV2()}
        {activeSection === "news" && renderNews()}
        {activeSection === "feedback" && <FeedbackPage />}
        {activeSection === "courseDetail" &&
          renderCourseDetailV2(selectedCourse)}
        {activeSection === "enrollmentRequests" && renderEnrollmentRequests()}
      </div>

      {detailModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#0F172A]/60 p-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E6EAF0] px-8 py-6">
              <div>
                <h2 className="text-2xl font-black text-[#0F172A]">
                  {detailModal.mode === "edit" ? "Cập nhật" : "Tạo mới"}{" "}
                  {detailModal.kind === "material"
                    ? "tài liệu"
                    : detailModal.kind === "flashcard"
                      ? "flashcard"
                      : detailModal.kind === "quiz"
                        ? "quiz"
                        : "bài thi"}
                </h2>
                <p className="mt-2 text-sm font-semibold text-[#667085]">
                  Quản lý nội dung hiển thị trong trang chi tiết khóa học.
                </p>
              </div>
              <button
                onClick={closeDetailModal}
                className="rounded-lg p-2 text-[#667085] transition hover:bg-[#F8F9FB]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDetailModal} className="space-y-6 p-8">
              {detailModal.kind === "material" ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-black text-[#0F172A]">
                      Tên tài liệu
                    </label>
                    <input
                      required
                      value={detailForm.title || ""}
                      onChange={(e) =>
                        setDetailForm({ ...detailForm, title: e.target.value })
                      }
                      className="h-12 w-full rounded-lg border border-[#D8DFEA] px-4 text-sm font-semibold outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-black text-[#0F172A]">
                      Loại file
                    </label>
                    <select
                      value={detailForm.fileType || "pdf"}
                      onChange={(e) =>
                        setDetailForm({
                          ...detailForm,
                          fileType: e.target.value,
                        })
                      }
                      className="h-12 w-full rounded-lg border border-[#D8DFEA] px-4 text-sm font-semibold outline-none focus:border-[#FF6B00]"
                    >
                      <option value="pdf">PDF</option>
                      <option value="doc">DOC</option>
                      <option value="docx">DOCX</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-black text-[#0F172A]">
                      Mime type
                    </label>
                    <input
                      value={detailForm.mimeType || ""}
                      onChange={(e) =>
                        setDetailForm({
                          ...detailForm,
                          mimeType: e.target.value,
                        })
                      }
                      placeholder="application/pdf"
                      className="h-12 w-full rounded-lg border border-[#D8DFEA] px-4 text-sm font-semibold outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-black text-[#0F172A]">
                      File URL
                    </label>
                    <input
                      required
                      value={detailForm.fileUrl || ""}
                      onChange={(e) =>
                        setDetailForm({
                          ...detailForm,
                          fileUrl: e.target.value,
                        })
                      }
                      className="h-12 w-full rounded-lg border border-[#D8DFEA] px-4 text-sm font-semibold outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-black text-[#0F172A]">
                      Mô tả
                    </label>
                    <textarea
                      rows={4}
                      value={detailForm.description || ""}
                      onChange={(e) =>
                        setDetailForm({
                          ...detailForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-[#D8DFEA] px-4 py-3 text-sm font-semibold outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-black text-[#0F172A]">
                        Tiêu đề
                      </label>
                      <input
                        required
                        value={detailForm.title || ""}
                        onChange={(e) =>
                          setDetailForm({
                            ...detailForm,
                            title: e.target.value,
                          })
                        }
                        className="h-12 w-full rounded-lg border border-[#D8DFEA] px-4 text-sm font-semibold outline-none focus:border-[#FF6B00]"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-black text-[#0F172A]">
                        Bài học
                      </label>
                      <select
                        required
                        value={detailForm.lessonId || ""}
                        onChange={(e) =>
                          setDetailForm({
                            ...detailForm,
                            lessonId: e.target.value,
                          })
                        }
                        className="h-12 w-full rounded-lg border border-[#D8DFEA] px-4 text-sm font-semibold outline-none focus:border-[#FF6B00]"
                      >
                        <option value="">Chọn bài học</option>
                        {lessons.map((lesson) => (
                          <option key={lesson.id} value={lesson.id}>
                            {lesson.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {detailModal.kind === "flashcard" ? (
                    <div className="space-y-4">
                      {(detailForm.cards || []).map(
                        (card: any, index: number) => (
                          <div
                            key={index}
                            className="grid gap-4 rounded-xl border border-[#E6EAF0] p-4 md:grid-cols-2"
                          >
                            <div>
                              <label className="mb-2 block text-sm font-black text-[#0F172A]">
                                Mặt trước
                              </label>
                              <textarea
                                rows={3}
                                value={card.front || ""}
                                onChange={(e) => {
                                  const cards = [...(detailForm.cards || [])];
                                  cards[index] = {
                                    ...cards[index],
                                    front: e.target.value,
                                  };
                                  setDetailForm({ ...detailForm, cards });
                                }}
                                className="w-full rounded-lg border border-[#D8DFEA] px-4 py-3 text-sm font-semibold outline-none focus:border-[#FF6B00]"
                              />
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-black text-[#0F172A]">
                                Mặt sau
                              </label>
                              <textarea
                                rows={3}
                                value={card.back || ""}
                                onChange={(e) => {
                                  const cards = [...(detailForm.cards || [])];
                                  cards[index] = {
                                    ...cards[index],
                                    back: e.target.value,
                                  };
                                  setDetailForm({ ...detailForm, cards });
                                }}
                                className="w-full rounded-lg border border-[#D8DFEA] px-4 py-3 text-sm font-semibold outline-none focus:border-[#FF6B00]"
                              />
                            </div>
                          </div>
                        ),
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setDetailForm({
                            ...detailForm,
                            cards: [
                              ...(detailForm.cards || []),
                              { front: "", back: "" },
                            ],
                          })
                        }
                        className="rounded-lg border border-[#D8DFEA] px-4 py-3 text-sm font-black text-[#0F172A] transition hover:bg-[#F8F9FB]"
                      >
                        Thêm thẻ
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(detailForm.questions || []).map(
                        (question: any, questionIndex: number) => (
                          <div
                            key={questionIndex}
                            className="rounded-xl border border-[#E6EAF0] p-4"
                          >
                            <label className="mb-2 block text-sm font-black text-[#0F172A]">
                              Câu hỏi {questionIndex + 1}
                            </label>
                            <textarea
                              rows={2}
                              value={question.question || ""}
                              onChange={(e) => {
                                const questions = [
                                  ...(detailForm.questions || []),
                                ];
                                questions[questionIndex] = {
                                  ...questions[questionIndex],
                                  question: e.target.value,
                                };
                                setDetailForm({ ...detailForm, questions });
                              }}
                              className="w-full rounded-lg border border-[#D8DFEA] px-4 py-3 text-sm font-semibold outline-none focus:border-[#FF6B00]"
                            />
                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                              {(question.options || []).map(
                                (option: string, optionIndex: number) => (
                                  <input
                                    key={optionIndex}
                                    value={option || ""}
                                    onChange={(e) => {
                                      const questions = [
                                        ...(detailForm.questions || []),
                                      ];
                                      const options = [
                                        ...(questions[questionIndex].options ||
                                          []),
                                      ];
                                      options[optionIndex] = e.target.value;
                                      questions[questionIndex] = {
                                        ...questions[questionIndex],
                                        options,
                                      };
                                      setDetailForm({
                                        ...detailForm,
                                        questions,
                                      });
                                    }}
                                    placeholder={`Đáp án ${String.fromCharCode(65 + optionIndex)}`}
                                    className="h-11 rounded-lg border border-[#D8DFEA] px-4 text-sm font-semibold outline-none focus:border-[#FF6B00]"
                                  />
                                ),
                              )}
                            </div>
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="mb-2 block text-sm font-black text-[#0F172A]">
                                  Đáp án đúng
                                </label>
                                <select
                                  value={Number(question.correctAnswer || 0)}
                                  onChange={(e) => {
                                    const questions = [
                                      ...(detailForm.questions || []),
                                    ];
                                    questions[questionIndex] = {
                                      ...questions[questionIndex],
                                      correctAnswer: Number(e.target.value),
                                    };
                                    setDetailForm({ ...detailForm, questions });
                                  }}
                                  className="h-11 w-full rounded-lg border border-[#D8DFEA] px-4 text-sm font-semibold outline-none focus:border-[#FF6B00]"
                                >
                                  <option value={0}>A</option>
                                  <option value={1}>B</option>
                                  <option value={2}>C</option>
                                  <option value={3}>D</option>
                                </select>
                              </div>
                              <div>
                                <label className="mb-2 block text-sm font-black text-[#0F172A]">
                                  Giải thích
                                </label>
                                <input
                                  value={question.explanation || ""}
                                  onChange={(e) => {
                                    const questions = [
                                      ...(detailForm.questions || []),
                                    ];
                                    questions[questionIndex] = {
                                      ...questions[questionIndex],
                                      explanation: e.target.value,
                                    };
                                    setDetailForm({ ...detailForm, questions });
                                  }}
                                  className="h-11 w-full rounded-lg border border-[#D8DFEA] px-4 text-sm font-semibold outline-none focus:border-[#FF6B00]"
                                />
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setDetailForm({
                            ...detailForm,
                            questions: [
                              ...(detailForm.questions || []),
                              {
                                question: "",
                                options: ["", "", "", ""],
                                correctAnswer: 0,
                                explanation: "",
                              },
                            ],
                          })
                        }
                        className="rounded-lg border border-[#D8DFEA] px-4 py-3 text-sm font-black text-[#0F172A] transition hover:bg-[#F8F9FB]"
                      >
                        Thêm câu hỏi
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-[#E6EAF0] pt-6">
                <button
                  type="button"
                  onClick={closeDetailModal}
                  className="h-11 rounded-lg border border-[#D8DFEA] px-5 text-sm font-black text-[#0F172A] transition hover:bg-[#F8F9FB]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="h-11 rounded-lg bg-[#FF4D12] px-5 text-sm font-black text-white transition hover:bg-[#E6420C]"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailPreview && (
        <div className="fixed inset-0 z-[135] flex items-center justify-center bg-[#0F172A]/70 p-6 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E6EAF0] px-8 py-5">
              <div>
                <h2 className="text-2xl font-black text-[#0F172A]">
                  {detailPreview.item.title}
                </h2>
                <p className="mt-2 text-sm font-semibold text-[#667085]">
                  {detailPreview.kind === "material"
                    ? "Preview tài liệu"
                    : detailPreview.kind === "flashcard"
                      ? "Preview flashcard"
                      : detailPreview.kind === "quiz"
                        ? "Preview quiz"
                        : "Preview bài thi"}
                </p>
              </div>
              <button
                onClick={() => setDetailPreview(null)}
                className="rounded-lg p-2 text-[#667085] transition hover:bg-[#F8F9FB]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[78vh] overflow-y-auto p-8">
              {detailPreview.kind === "material" ? (
                <iframe
                  title={detailPreview.item.title}
                  src={materialPreviewUrl(detailPreview.item)}
                  className="h-[72vh] w-full rounded-xl border border-[#E6EAF0]"
                />
              ) : detailPreview.kind === "flashcard" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {(parseLearningContent(detailPreview.item).cards || []).map(
                    (card: any, index: number) => (
                      <div
                        key={index}
                        className="rounded-xl border border-[#E6EAF0] p-5"
                      >
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#98A2B3]">
                          Mặt trước
                        </p>
                        <p className="mt-3 text-base font-bold text-[#0F172A]">
                          {card.front}
                        </p>
                        <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-[#98A2B3]">
                          Mặt sau
                        </p>
                        <p className="mt-3 text-sm font-medium leading-6 text-[#475569]">
                          {card.back}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {(
                    parseLearningContent(detailPreview.item).questions || []
                  ).map((question: any, questionIndex: number) => (
                    <div
                      key={questionIndex}
                      className="rounded-xl border border-[#E6EAF0] p-5"
                    >
                      <p className="text-lg font-black text-[#0F172A]">
                        Câu {questionIndex + 1}. {question.question}
                      </p>
                      <div className="mt-4 grid gap-3">
                        {(question.options || []).map(
                          (option: string, optionIndex: number) => (
                            <div
                              key={optionIndex}
                              className={`rounded-lg px-4 py-3 text-sm ${Number(question.correctAnswer) === optionIndex ? "bg-green-50 font-bold text-green-700" : "bg-[#F8FAFC] text-[#475569]"}`}
                            >
                              {String.fromCharCode(65 + optionIndex)}. {option}
                            </div>
                          ),
                        )}
                      </div>
                      {question.explanation && (
                        <p className="mt-4 text-sm font-medium text-[#667085]">
                          Giải thích: {question.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {coursePendingDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[20px] border border-red-100 bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-black text-[#0F172A]">
                  Xác nhận xóa khóa học
                </h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#667085]">
                  Bạn có chắc chắn muốn xóa khóa học{" "}
                  <span className="font-black text-[#0F172A]">
                    {coursePendingDelete.title}
                  </span>
                  ? Toàn bộ bài giảng, tài liệu, feedback và học viên đã ghi
                  danh cũng sẽ bị xóa.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCoursePendingDelete(null)}
                className="h-11 rounded-xl border border-[#E6EAF0] bg-white px-5 text-sm font-black text-[#0F172A] transition hover:bg-[#F8F9FB]"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCourse(coursePendingDelete.id)}
                className="h-11 rounded-xl bg-red-600 px-5 text-sm font-black text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700"
              >
                Xóa khóa học
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && modalType === "course" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/55 p-6 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex max-h-[92vh] w-full max-w-[1320px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#E6EAF0] px-10 py-7">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-[#0F172A]">
                  {editItem ? "Cập nhật khóa học" : "Tạo khóa học mới"}
                </h2>
                <p className="mt-2 text-sm font-semibold text-[#667085]">
                  Thêm khóa học mới vào hệ thống GenZBio
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="rounded-lg p-2 text-[#475569] transition hover:bg-[#F8F9FB]"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form
              onSubmit={handleModalSubmit}
              className="min-h-0 flex-1 overflow-y-auto"
            >
              <div className="grid min-h-[660px] grid-cols-1 lg:grid-cols-[360px_1fr]">
                <aside className="border-r border-[#E6EAF0] p-8">
                  {[
                    {
                      number: "1.",
                      title: "Thông tin cơ bản",
                      desc: "Nhập thông tin tổng quan về khóa học",
                      icon: BookOpen,
                      active: true,
                    },
                    {
                      number: "2.",
                      title: "Mô tả khóa học",
                      desc: "Giới thiệu chi tiết về nội dung khóa học",
                      icon: FileText,
                      onClick: () => setIsCourseDescriptionOpen(true),
                    },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.title}
                      onClick={item.onClick}
                      className={`mb-5 flex w-full gap-4 rounded-lg p-5 text-left transition hover:bg-[#FFF7F3] ${item.active ? "bg-[#FFF2ED] text-[#FF4D12]" : "text-[#0F172A]"}`}
                    >
                      <item.icon className="mt-0.5 h-6 w-6 shrink-0" />
                      <div>
                        <p className="text-sm font-black">
                          {item.number} {item.title}
                        </p>
                        <p className="mt-3 text-sm font-medium text-[#667085]">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </aside>

                <main className="p-8">
                  <h3 className="mb-6 text-lg font-black text-[#0F172A]">
                    1. Thông tin cơ bản
                  </h3>
                  <div className="grid gap-7 xl:grid-cols-2">
                    <div className="space-y-7">
                      <div>
                        <label className="mb-3 block text-sm font-black text-[#0F172A]">
                          Tên khóa học <span className="text-[#FF4D12]">*</span>
                        </label>
                        <div className="relative">
                          <input
                            required
                            maxLength={100}
                            value={formData.title || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                title: e.target.value,
                              })
                            }
                            placeholder="Nhập tên khóa học"
                            className="h-12 w-full rounded-lg border border-[#D8DFEA] px-4 pr-16 text-sm font-semibold outline-none transition focus:border-[#FF6B00]"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#667085]">
                            {(formData.title || "").length}/100
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="mb-3 block text-sm font-black text-[#0F172A]">
                          Video giới thiệu (URL)
                        </label>
                        <input
                          value={formData.introVideoUrl || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              introVideoUrl: e.target.value,
                            })
                          }
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="h-12 w-full rounded-lg border border-[#D8DFEA] px-4 text-sm font-semibold outline-none transition focus:border-[#FF6B00]"
                        />
                      </div>

                      <div className="grid gap-5 md:grid-cols-1">
                        <div>
                          <label className="mb-3 block text-sm font-black text-[#0F172A]">
                            Ngôn ngữ giảng dạy
                          </label>
                          <select
                            value={formData.language || "Tiếng Việt"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                language: e.target.value,
                              })
                            }
                            className="h-12 w-full rounded-lg border border-[#D8DFEA] px-4 text-sm font-semibold outline-none transition focus:border-[#FF6B00]"
                          >
                            <option value="Tiếng Việt">Tiếng Việt</option>
                            <option value="Tiếng Anh">Tiếng Anh</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-3 block text-sm font-black text-[#0F172A]">
                            Ngày bắt đầu
                          </label>
                          <input
                            type="date"
                            value={formData.startDate || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                startDate: e.target.value,
                              })
                            }
                            className="h-12 w-full rounded-lg border border-[#D8DFEA] px-4 text-sm font-semibold outline-none transition focus:border-[#FF6B00]"
                          />
                        </div>
                        <div>
                          <label className="mb-3 block text-sm font-black text-[#0F172A]">
                            Số lượng học viên dự kiến
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={formData.expectedStudentCount || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                expectedStudentCount: e.target.value,
                              })
                            }
                            placeholder="Nhập số lượng học viên dự kiến"
                            className="h-12 w-full rounded-lg border border-[#D8DFEA] px-4 text-sm font-semibold outline-none transition focus:border-[#FF6B00]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-7">
                      <div>
                        <label className="mb-3 block text-sm font-black text-[#0F172A]">
                          Mã khóa học <span className="text-[#FF4D12]">*</span>
                        </label>
                        <input
                          required
                          value={formData.code || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              code: e.target.value
                                .toUpperCase()
                                .replace(/\s+/g, "-"),
                            })
                          }
                          placeholder="VD: SINH-HOC-12"
                          className="h-12 w-full rounded-lg border border-[#D8DFEA] px-4 text-sm font-semibold outline-none transition focus:border-[#FF6B00]"
                        />
                        <p className="mt-3 text-sm font-medium text-[#667085]">
                          Mã viết hoa, không dấu, không khoảng cách
                        </p>
                      </div>

                      <div>
                        <label className="mb-3 block text-sm font-black text-[#0F172A]">
                          Hình ảnh đại diện{" "}
                          <span className="text-[#FF4D12]">*</span>
                        </label>
                        <label className="flex h-[146px] cursor-pointer flex-col items-center justify-center rounded-lg border border-[#D8DFEA] bg-[#FBFCFE] text-center transition hover:border-[#FF6B00]">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onloadend = () =>
                                setFormData({
                                  ...formData,
                                  avatarUrl: reader.result as string,
                                });
                              reader.readAsDataURL(file);
                            }}
                          />
                          <BookMarked className="mb-3 h-9 w-9 text-[#667085]" />
                          <span className="text-sm font-semibold text-[#667085]">
                            {formData.avatarUrl
                              ? "Đã chọn hình ảnh"
                              : "Kéo thả hình ảnh vào đây"}
                          </span>
                          <span className="mt-2 text-sm font-medium text-[#667085]">
                            hoặc nhấp để chọn tệp
                          </span>
                          <span className="mt-4 text-xs font-medium text-[#667085]">
                            Định dạng: JPG, PNG, WebP. Kích thước tối thiểu:
                            1200x630px
                          </span>
                        </label>
                        <input
                          value={formData.avatarUrl || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              avatarUrl: e.target.value,
                            })
                          }
                          placeholder="Hoặc nhập URL hình ảnh"
                          className="mt-3 h-11 w-full rounded-lg border border-[#D8DFEA] px-4 text-sm font-semibold outline-none transition focus:border-[#FF6B00]"
                        />
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-3 block text-sm font-black text-[#0F172A]">
                            Ngày kết thúc
                          </label>
                          <input
                            type="date"
                            value={formData.endDate || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                endDate: e.target.value,
                              })
                            }
                            className="h-12 w-full rounded-lg border border-[#D8DFEA] px-4 text-sm font-semibold outline-none transition focus:border-[#FF6B00]"
                          />
                        </div>
                        <div>
                          <label className="mb-3 block text-sm font-black text-[#0F172A]">
                            Trạng thái
                          </label>
                          <label className="flex h-12 items-center gap-3">
                            <input
                              type="checkbox"
                              checked={
                                (formData.status || "Published") === "Published"
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  status: e.target.checked
                                    ? "Published"
                                    : "Hidden",
                                })
                              }
                              className="h-5 w-5 accent-green-500"
                            />
                            <span className="text-sm font-black text-[#0F172A]">
                              Xuất bản
                            </span>
                          </label>
                          <p className="text-sm font-medium text-[#667085]">
                            Khóa học sẽ hiển thị với học viên
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="xl:col-span-2">
                      <h3 className="mb-4 text-lg font-black text-[#0F172A]">
                        Giảng viên
                      </h3>
                      <select
                        required
                        value={formData.teacherId || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            teacherId: e.target.value,
                          })
                        }
                        className="h-12 w-full rounded-lg border border-[#D8DFEA] px-4 text-sm font-semibold outline-none transition focus:border-[#FF6B00]"
                      >
                        <option value="">
                          Chọn giảng viên phụ trách khóa học
                        </option>
                        {users
                          .filter((user) => roleToValue(user.role) === 1)
                          .map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.fullName}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </main>
              </div>

              <div className="flex justify-end gap-5 border-t border-[#E6EAF0] px-8 py-5">
                <button
                  type="submit"
                  value="Draft"
                  className="flex h-12 items-center gap-2 rounded-lg border border-[#D8DFEA] bg-white px-6 text-sm font-black text-[#0F172A] transition hover:bg-[#F8F9FB]"
                >
                  <FileText className="h-4 w-4" /> Lưu nháp
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="h-12 rounded-lg border border-[#D8DFEA] bg-white px-9 text-sm font-black text-[#0F172A] transition hover:bg-[#F8F9FB]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex h-12 items-center gap-2 rounded-lg bg-[#FF4D12] px-9 text-sm font-black text-white transition hover:bg-[#E6420C]"
                >
                  Tiếp tục <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && modalType === "course" && isCourseDescriptionOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0F172A]/60 p-6 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex max-h-[86vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#E6EAF0] px-8 py-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-[#0F172A]">
                  Mô tả khóa học
                </h2>
                <p className="mt-2 text-sm font-semibold text-[#667085]">
                  Nhập phần giới thiệu chi tiết về nội dung khóa học.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCourseDescriptionOpen(false)}
                className="rounded-lg p-2 text-[#475569] transition hover:bg-[#F8F9FB]"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-8">
              <RichTextEditor
                value={formData.description || ""}
                onChange={(html) =>
                  setFormData({ ...formData, description: html })
                }
              />
            </div>
            <div className="flex justify-end gap-4 border-t border-[#E6EAF0] px-8 py-5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, description: "" })}
                className="h-11 rounded-lg border border-[#D8DFEA] bg-white px-6 text-sm font-black text-[#0F172A] transition hover:bg-[#F8F9FB]"
              >
                Xóa nội dung
              </button>
              <button
                type="button"
                onClick={() => setIsCourseDescriptionOpen(false)}
                className="h-11 rounded-lg bg-[#FF4D12] px-8 text-sm font-black text-white transition hover:bg-[#E6420C]"
              >
                Lưu mô tả
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && modalType === "teacher" && (
        <div className="admin-modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-5 animate-in fade-in duration-200">
          <div className="admin-modal-shell max-h-[94vh] w-full max-w-[1280px] overflow-hidden rounded-[28px]">
            <form
              onSubmit={handleModalSubmit}
              className="flex max-h-[94vh] flex-col"
            >
              <div className="flex items-start justify-between border-b border-[#E6EAF0] px-10 py-7">
                <div>
                  <h2 className="text-[40px] font-black tracking-tight text-[#0F172A]">
                    Tạo giảng viên mới
                  </h2>
                  <p className="mt-2 text-lg font-medium text-[#667085]">
                    Thêm giảng viên mới vào hệ thống GenZBio
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-2xl p-2.5 text-[#667085] transition hover:bg-[#F8F9FB] hover:text-[#0F172A]"
                >
                  <X className="h-8 w-8" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-8 py-7">
                <div className="grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)]">
                  <aside className="admin-modal-panel rounded-[24px] p-6">
                    <p className="text-sm font-black uppercase tracking-[0.16em] text-[#FF5A1F]">
                      Xem trước hồ sơ
                    </p>

                    <div className="mt-6 text-center">
                      <div className="relative mx-auto h-[174px] w-[174px]">
                        {formData.avatarPreview ? (
                          <img
                            src={formData.avatarPreview}
                            alt="Teacher avatar"
                            className="h-[174px] w-[174px] rounded-full object-cover border border-[#E6EAF0]"
                          />
                        ) : (
                          <div className="flex h-[174px] w-[174px] items-center justify-center rounded-full border border-[#E6EAF0] bg-[linear-gradient(180deg,#F7F9FC_0%,#EEF2F7_100%)] text-[44px] font-black text-[#FF5A1F]">
                            {getInitials(formData.fullName || "GV")}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById("admin-teacher-avatar-input")
                              ?.click()
                          }
                          className="absolute bottom-1 right-1 flex h-12 w-12 items-center justify-center rounded-full border border-[#FFDCCB] bg-[#FFF4EC] text-[#FF5A1F] shadow-sm transition hover:scale-105"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                      </div>
                      <input
                        id="admin-teacher-avatar-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () =>
                              setFormData({
                                ...formData,
                                avatarFile: file,
                                avatarPreview: reader.result as string,
                              });
                            reader.readAsDataURL(file);
                          }
                        }}
                      />

                      <h3 className="mt-6 text-[28px] font-black tracking-tight text-[#0F172A]">
                        {formData.fullName || "Giảng viên mới"}
                      </h3>
                      <p className="mt-2 text-[18px] font-medium text-[#667085]">
                        Giảng viên Sinh học
                      </p>
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-3">
                      <div className="admin-soft-stat rounded-[20px] p-4 text-center">
                        <GraduationCap className="mx-auto h-6 w-6 text-[#FF5A1F]" />
                        <p className="mt-4 text-[18px] font-black text-[#0F172A]">
                          {formData.teachingExperienceYears || 0} năm
                        </p>
                        <p className="mt-1 text-sm font-medium text-[#667085]">
                          Kinh nghiệm
                        </p>
                      </div>
                      <div className="admin-soft-stat rounded-[20px] p-4 text-center">
                        <Users className="mx-auto h-6 w-6 text-[#22C55E]" />
                        <p className="mt-4 text-[18px] font-black text-[#0F172A]">
                          1.200+
                        </p>
                        <p className="mt-1 text-sm font-medium text-[#667085]">
                          Học sinh
                        </p>
                      </div>
                      <div className="admin-soft-stat rounded-[20px] p-4 text-center">
                        <Star className="mx-auto h-6 w-6 text-[#F59E0B]" />
                        <p className="mt-4 text-[18px] font-black text-[#0F172A]">
                          4.9/5
                        </p>
                        <p className="mt-1 text-sm font-medium text-[#667085]">
                          Đánh giá
                        </p>
                      </div>
                    </div>

                    <div className="mt-8">
                      <p className="text-sm font-black uppercase tracking-[0.14em] text-[#667085]">
                        Giới thiệu ngắn
                      </p>
                      <p className="mt-4 text-[15px] font-medium leading-8 text-[#3C4A5F]">
                        {formData.shortBio ||
                          "Giảng viên có nhiều năm kinh nghiệm giảng dạy Sinh học, hỗ trợ học sinh bám sát chương trình và rèn tư duy học tập rõ ràng."}
                      </p>
                    </div>
                  </aside>

                  <div className="admin-modal-panel overflow-hidden rounded-[24px]">
                    <div className="admin-modal-section">
                      <h3 className="admin-modal-section-title">
                        1. Thông tin cơ bản
                      </h3>
                      <div className="mt-6 grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="admin-field-label">
                            Họ và tên <span className="text-[#FF5A1F]">*</span>
                          </label>
                          <input
                            required
                            value={formData.fullName || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                fullName: e.target.value,
                              })
                            }
                            className="admin-field-input"
                            placeholder="Nguyễn Văn A"
                          />
                        </div>
                        <div>
                          <label className="admin-field-label">Ngày sinh</label>
                          <input
                            type="date"
                            value={formData.dateOfBirth || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                dateOfBirth: e.target.value,
                              })
                            }
                            className="admin-field-input"
                          />
                        </div>
                        <div>
                          <label className="admin-field-label">
                            Email <span className="text-[#FF5A1F]">*</span>
                          </label>
                          <input
                            required
                            type="email"
                            value={formData.email || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            className="admin-field-input"
                            placeholder="nguyenvana@genzbio.vn"
                          />
                        </div>
                        <div>
                          <label className="admin-field-label">Giới tính</label>
                          <select
                            value={formData.gender || "Nam"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                gender: e.target.value,
                              })
                            }
                            className="admin-field-select"
                          >
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                          </select>
                        </div>
                        <div>
                          <label className="admin-field-label">
                            Số điện thoại
                          </label>
                          <input
                            value={formData.phoneNumber || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phoneNumber: e.target.value,
                              })
                            }
                            className="admin-field-input"
                            placeholder="0987 654 321"
                          />
                        </div>
                        <div>
                          <label className="admin-field-label">Địa chỉ</label>
                          <input
                            value={formData.address || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                address: e.target.value,
                              })
                            }
                            className="admin-field-input"
                            placeholder="Hà Nội, Việt Nam"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="admin-field-label">
                            Mật khẩu <span className="text-[#FF5A1F]">*</span>
                          </label>
                          <input
                            required
                            type="password"
                            value={formData.password || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                password: e.target.value,
                              })
                            }
                            className="admin-field-input"
                            placeholder="Nhập mật khẩu"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="admin-modal-section">
                      <h3 className="admin-modal-section-title">
                        2. Thông tin giảng dạy
                      </h3>
                      <div className="mt-6 grid gap-5 md:grid-cols-[300px_minmax(0,1fr)]">
                        <div>
                          <label className="admin-field-label">
                            Kinh nghiệm giảng dạy (năm){" "}
                            <span className="text-[#FF5A1F]">*</span>
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={formData.teachingExperienceYears || 0}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                teachingExperienceYears: e.target.value,
                              })
                            }
                            className="admin-field-input"
                          />
                        </div>
                        <div>
                          <label className="admin-field-label">
                            Mô tả ngắn về giảng viên
                          </label>
                          <textarea
                            value={formData.shortBio || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                shortBio: e.target.value,
                              })
                            }
                            rows={4}
                            className="admin-field-textarea"
                            placeholder="Giảng viên có nhiều năm kinh nghiệm giảng dạy Sinh học ở các cấp THPT và luyện thi đại học..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="admin-modal-section">
                      <h3 className="admin-modal-section-title">
                        3. Thông tin trên hệ thống
                      </h3>
                      <div className="mt-6 grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="admin-field-label">
                            Trạng thái <span className="text-[#FF5A1F]">*</span>
                          </label>
                          <select
                            value={
                              formData.isActive === false ? "false" : "true"
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                isActive: e.target.value === "true",
                              })
                            }
                            className="admin-field-select"
                          >
                            <option value="true">Đang hoạt động</option>
                            <option value="false">Không hoạt động</option>
                          </select>
                        </div>
                        <div>
                          <label className="admin-field-label">
                            Khóa học phụ trách
                          </label>
                          <select
                            value={formData.assignedCourseId || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                assignedCourseId: e.target.value,
                              })
                            }
                            className="admin-field-select"
                          >
                            <option value="">Chọn khóa học</option>
                            {courses.map((course) => (
                              <option key={course.id} value={course.id}>
                                {course.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#E6EAF0] px-8 py-5">
                <button
                  type="button"
                  className="flex h-12 items-center gap-2 rounded-xl border border-[#D8DFEA] bg-white px-6 text-sm font-black text-[#0F172A] transition hover:bg-[#F8F9FB]"
                >
                  <FileText className="h-4 w-4" /> Lưu nháp
                </button>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="h-12 rounded-xl border border-[#D8DFEA] bg-white px-8 text-sm font-black text-[#0F172A] transition hover:bg-[#F8F9FB]"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="admin-primary-btn flex h-12 items-center gap-2 rounded-xl px-8 text-sm font-black text-white transition"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Tạo giảng viên
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && modalType !== "course" && modalType !== "teacher" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-8 relative border border-border">
            <button
              onClick={handleCloseModal}
              className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-[#F8F9FB] transition-all"
            >
              <X className="w-5 h-5 text-[#98A2B3]" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
                {editItem ? "Cập nhật" : "Thêm mới"}{" "}
                {modalType === "user"
                  ? "người dùng"
                  : modalType === "course"
                    ? "khóa học"
                    : modalType === "news"
                      ? "bài viết"
                      : "bài học"}
              </h2>
              <p className="text-xs text-[#667085] font-medium mt-1">
                Vui lòng điền đầy đủ các thông tin cần thiết vào biểu mẫu dưới
                đây.
              </p>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              {modalType === "user" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Avatar Upload */}
                  <div className="md:col-span-2 flex flex-col items-center mb-2">
                    <div
                      className="relative group cursor-pointer"
                      onClick={() =>
                        document.getElementById("admin-avatar-input")?.click()
                      }
                    >
                      {formData.avatarPreview ? (
                        <img
                          src={formData.avatarPreview}
                          alt="Avatar"
                          className="w-20 h-20 rounded-xl object-cover border-2 border-[#F1F3F5] group-hover:border-[#FF6B00]/30 transition-all shadow-sm"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-[#F8F9FB] border-2 border-dashed border-[#E9ECEF] flex items-center justify-center text-[#ADB5BD] group-hover:border-[#FF6B00]/30 group-hover:text-[#FF6B00]/50 transition-all">
                          <Users className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute -bottom-1.5 -right-1.5 bg-white p-1.5 rounded-lg border border-[#F1F3F5] shadow-md text-[#FF6B00]">
                        <Edit className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <input
                      id="admin-avatar-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({
                              ...formData,
                              avatarFile: file,
                              avatarPreview: reader.result as string,
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <span className="text-[10px] font-bold text-[#ADB5BD] mt-2 uppercase tracking-widest">
                      Ảnh đại diện
                    </span>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full h-11 px-4 bg-[#F8F9FB] border border-transparent rounded-lg focus:bg-white focus:border-[#FF6B00]/20 focus:ring-4 focus:ring-[#FF6B00]/5 outline-none font-bold text-[#0F172A] transition-all placeholder:text-[#ADB5BD] placeholder:font-medium"
                      placeholder="Nhập họ và tên..."
                    />
                  </div>
                  {!editItem && (
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full h-11 px-4 bg-[#F8F9FB] border border-transparent rounded-lg focus:bg-white focus:border-[#FF6B00]/20 focus:ring-4 focus:ring-[#FF6B00]/5 outline-none font-bold text-[#0F172A] transition-all placeholder:text-[#ADB5BD] placeholder:font-medium"
                        placeholder="example@email.com"
                      />
                    </div>
                  )}
                  {/* Mật khẩu */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">
                      {editItem ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu"}
                    </label>
                    <input
                      type="password"
                      required={!editItem}
                      value={formData.password || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full h-11 px-4 bg-[#F8F9FB] border border-transparent rounded-lg focus:bg-white focus:border-[#FF6B00]/20 focus:ring-4 focus:ring-[#FF6B00]/5 outline-none font-bold text-[#0F172A] transition-all placeholder:text-[#ADB5BD] placeholder:font-medium"
                      placeholder={editItem ? "Nhập mật khẩu mới nếu muốn đổi..." : "••••••••"}
                    />
                  </div>

                  {/* Vai trò */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">
                      Vai trò
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: Number(e.target.value) })
                      }
                      className="w-full h-11 px-4 bg-[#F8F9FB] border border-transparent rounded-lg outline-none font-bold text-[#0F172A] focus:bg-white focus:border-[#FF6B00]/20 transition-all cursor-pointer"
                    >
                      <option value={0}>Admin</option>
                      <option value={1}>Giáo viên</option>
                      <option value={2}>Học sinh</option>
                    </select>
                  </div>

                  {/* Ngày sinh */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dateOfBirth: e.target.value,
                        })
                      }
                      className="w-full h-11 px-4 bg-[#F8F9FB] border border-transparent rounded-lg outline-none font-bold text-[#0F172A] focus:bg-white focus:border-[#FF6B00]/20 transition-all"
                    />
                  </div>

                  {/* Giới tính */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">
                      Giới tính
                    </label>
                    <select
                      value={formData.gender || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className="w-full h-11 px-4 bg-[#F8F9FB] border border-transparent rounded-lg outline-none font-bold text-[#0F172A] focus:bg-white focus:border-[#FF6B00]/20 transition-all cursor-pointer"
                    >
                      <option value="">-- Chọn giới tính --</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  {/* Số điện thoại */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      value={formData.phoneNumber || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, phoneNumber: e.target.value })
                      }
                      className="w-full h-11 px-4 bg-[#F8F9FB] border border-transparent rounded-lg focus:bg-white focus:border-[#FF6B00]/20 outline-none font-bold text-[#0F172A] transition-all placeholder:text-[#ADB5BD]"
                      placeholder="VD: 037..."
                    />
                  </div>

                  {/* Địa chỉ */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">
                      Địa chỉ liên hệ
                    </label>
                    <input
                      type="text"
                      value={formData.address || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full h-11 px-4 bg-[#F8F9FB] border border-transparent rounded-lg focus:bg-white focus:border-[#FF6B00]/20 outline-none font-bold text-[#0F172A] transition-all placeholder:text-[#ADB5BD]"
                      placeholder="VD: Cầu Giấy, Hà Nội..."
                    />
                  </div>

                  {/* Số năm kinh nghiệm (chỉ hiện nếu là Giáo viên) */}
                  {Number(formData.role) === 1 && (
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">
                        Số năm kinh nghiệm
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.teachingExperienceYears ?? 0}
                        onChange={(e) =>
                          setFormData({ ...formData, teachingExperienceYears: parseInt(e.target.value) || 0 })
                        }
                        className="w-full h-11 px-4 bg-[#F8F9FB] border border-transparent rounded-lg focus:bg-white focus:border-[#FF6B00]/20 outline-none font-bold text-[#0F172A] transition-all"
                      />
                    </div>
                  )}

                  {/* Giới thiệu ngắn */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">
                      Giới thiệu ngắn
                    </label>
                    <textarea
                      rows={3}
                      value={formData.shortBio || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, shortBio: e.target.value })
                      }
                      className="w-full rounded-xl border border-transparent bg-[#F8F9FB] p-4 text-sm font-bold text-[#0F172A] outline-none transition-all focus:border-[#FF6B00]/30 focus:bg-white focus:ring-4 focus:ring-[#FF6B00]/5 resize-none"
                      placeholder="VD: Giảng viên chuyên ngành Sinh học..."
                    />
                  </div>
                </div>
              )}

              {modalType === "course" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">
                      Tên khóa học
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full h-11 px-4 bg-[#F8F9FB] border border-transparent rounded-lg focus:bg-white focus:border-[#FF6B00]/20 outline-none font-bold text-[#0F172A] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">
                      Mô tả chi tiết
                    </label>
                    <RichTextEditor
                      value={formData.description || ""}
                      onChange={(html) =>
                        setFormData({ ...formData, description: html })
                      }
                    />
                  </div>
                </div>
              )}

              {modalType === "news" && (
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                        Tiêu đề bài viết *
                      </span>
                      <input
                        type="text"
                        required
                        value={formData.title || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="h-12 w-full rounded-xl border border-transparent bg-[#F8F9FB] px-4 text-sm font-bold text-[#0F172A] outline-none transition-all focus:border-[#FF6B00]/30 focus:bg-white focus:ring-4 focus:ring-[#FF6B00]/5"
                        placeholder="VD: 5 xu hướng nghiên cứu Sinh học nổi bật"
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                        Ảnh đại diện
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleNewsImageUpload(e.target.files?.[0])
                        }
                        className="block w-full rounded-xl border border-dashed border-[#D6DAE2] bg-[#F8F9FB] p-4 text-sm font-semibold text-[#667085] file:mr-4 file:rounded-full file:border-0 file:bg-[#FFF2EA] file:px-4 file:py-2 file:text-sm file:font-black file:text-[#FF6B00] hover:border-[#FF6B00]/50 hover:bg-white hover:file:bg-[#FFE3D1]"
                      />
                      {formData.avatarFileName && (
                        <span className="mt-2 block text-xs font-bold text-emerald-600">
                          {formData.avatarFileName}
                        </span>
                      )}
                    </label>

                    {formData.avatarUrl && (
                      <div className="md:col-span-2 overflow-hidden rounded-2xl border border-[#ECEEF2] bg-[#F8F9FB]">
                        <img
                          src={formData.avatarUrl}
                          alt="Preview"
                          className="h-44 w-full object-cover"
                        />
                      </div>
                    )}

                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                        Tác giả
                      </span>
                      <input
                        type="text"
                        value={formData.authorName || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            authorName: e.target.value,
                          })
                        }
                        className="h-12 w-full rounded-xl border border-transparent bg-[#F8F9FB] px-4 text-sm font-bold text-[#0F172A] outline-none transition-all focus:border-[#FF6B00]/30 focus:bg-white focus:ring-4 focus:ring-[#FF6B00]/5"
                        placeholder="Nhập tên tác giả..."
                      />
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                      Nội dung chi tiết *
                    </label>
                    <RichTextEditor
                      value={formData.content || ""}
                      onChange={(html) =>
                        setFormData({ ...formData, content: html })
                      }
                      placeholder="Nhập nội dung bài viết..."
                    />
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full h-11 bg-[#FF6B00] text-white rounded-lg font-bold hover:bg-[#E65F00] transition-all shadow-md shadow-[#FF6B00]/10 flex items-center justify-center gap-2"
                >
                  {editItem ? "Cập nhật thông tin" : "Tạo mới bản ghi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCourseOrderModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/55 p-6 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-[20px] bg-white p-7 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E6EAF0] pb-5">
              <div>
                <h3 className="text-xl font-black text-[#0F172A] flex items-center gap-2">
                  <ListOrdered className="h-5.5 w-5.5 text-[#FF6B00]" /> Sắp xếp
                  lộ trình học tập
                </h3>
                <p className="mt-1.5 text-xs font-semibold text-[#667085]">
                  Kéo thả để sắp xếp thứ tự học tập của các khóa học. Học sinh
                  cần hoàn thành 100% khóa học trước mới được mở khóa khóa học
                  tiếp theo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCourseOrderModalOpen(false)}
                className="rounded-lg p-2.5 text-[#98A2B3] hover:bg-[#F8F9FB] hover:text-[#0F172A] transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body - Drag & Drop List */}
            <div className="flex-1 overflow-y-auto py-5 pr-1 space-y-2.5 custom-scrollbar min-h-[300px]">
              {courseOrderList.map((course, index) => {
                const isDraggable = true;
                return (
                  <div
                    key={course.id}
                    draggable={isDraggable}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    className="flex items-center gap-4 rounded-xl border border-[#E6EAF0] bg-white p-4 transition-all hover:border-[#FF6B00]/30 hover:shadow-sm cursor-grab active:cursor-grabbing group select-none"
                  >
                    {/* Drag Handle */}
                    <div className="text-[#98A2B3] group-hover:text-[#FF6B00] transition-colors shrink-0">
                      <GripVertical className="h-5 w-5" />
                    </div>

                    {/* Order Number Badge */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FFF4EC] text-sm font-black text-[#FF6B00] border border-[#FFE3D1]">
                      {index + 1}
                    </div>

                    {/* Thumbnail Image */}
                    <img
                      src={getCourseImage(course)}
                      alt={course.title}
                      className="h-10 w-14 rounded-lg object-cover shadow-sm border border-slate-100 shrink-0"
                    />

                    {/* Course Information */}
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-black text-[#0F172A] group-hover:text-[#FF6B00] transition-colors">
                        {course.title}
                      </h4>
                      <p className="mt-0.5 text-[10px] font-bold text-[#98A2B3] uppercase tracking-tight leading-none">
                        Mã: {course.code || "N/A"}
                      </p>
                    </div>
                  </div>
                );
              })}

              {courseOrderList.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm font-bold text-[#667085]">
                    Chưa có khóa học nào để sắp xếp.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#E6EAF0] pt-5 flex justify-end gap-3 bg-white">
              <button
                type="button"
                onClick={() => setIsCourseOrderModalOpen(false)}
                className="h-11 rounded-xl border border-[#E6EAF0] bg-white px-6 text-sm font-bold text-[#0F172A] transition hover:bg-[#F8F9FB]"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveCourseOrder}
                className="h-11 rounded-xl bg-[#FF6B00] px-6 text-sm font-bold text-white shadow-lg shadow-orange-500/10 transition hover:bg-[#E65F00] hover:-translate-y-0.5 active:translate-y-0"
              >
                Lưu lộ trình học tập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const stripHtml = (html: string) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};
