import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
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
  MoreVertical,
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
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "../api/adminApi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import RichTextEditor from "../components/common/RichTextEditor";

type AdminSection = "home" | "dashboard" | "users" | "courses" | "news" | "courseDetail" | "feedback";

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
  const [users, setUsers] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [courseCategoryFilter, setCourseCategoryFilter] = useState("all");
  const [courseStatusFilter, setCourseStatusFilter] = useState("all");
  const [courseTeacherFilter, setCourseTeacherFilter] = useState("all");

  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"user"|"course"|"news"|"lesson"|null>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  // Stats State
  const [gpaData, setGpaData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([
    { label: "Tổng người dùng", value: "0", icon: Users, color: "orange", trend: "0%", isUp: true },
    { label: "Khóa học", value: "0", icon: BookOpen, color: "purple", trend: "0%", isUp: true },
    { label: "Tin tức", value: "0", icon: Newspaper, color: "blue", trend: "0%", isUp: true },
    { label: "Bài học", value: "0", icon: BookMarked, color: "amber", trend: "0%", isUp: true },
  ]);

  useEffect(() => {
    fetchCourses();
    fetchNews();
    fetchUsers();
    fetchFeedbacks();
    fetchOverviewStats();
    fetchGpaDistribution();
    fetchRecentActivities();

    const interval = setInterval(() => {
      fetchOverviewStats();
      fetchRecentActivities();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchOverviewStats = async () => {
    try {
      const res = await adminApi.getOverviewStats();
      setStats([
        { label: "Tổng người dùng", value: res.data.totalUsers.toLocaleString(), icon: Users, color: "orange", trend: "0%", isUp: true, userStats: res.data.userStats },
        { label: "Khóa học", value: res.data.totalCourses.toLocaleString(), icon: BookOpen, color: "purple", trend: "0%", isUp: true, courseStats: res.data.courseStats },
        { label: "Tin tức", value: res.data.totalNews.toLocaleString(), icon: Newspaper, color: "blue", trend: "0%", isUp: true },
        { label: "Bài học", value: res.data.totalLessons.toLocaleString(), icon: BookMarked, color: "amber", trend: "0%", isUp: true },
      ]);
    } catch (err) {
      console.error("Failed to fetch overview stats", err);
    }
  };

  const fetchGpaDistribution = async () => {
    try {
      const res = await adminApi.getGpaDistribution();
      setGpaData(res.data);
    } catch (err) {
      console.error("Failed to fetch GPA data", err);
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

  const handleDeleteCourse = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa khóa học này?")) return;
    try {
      await adminApi.deleteCourse(id);
      toast.success("Xóa khóa học thành công");
      fetchCourses();
    } catch (err) {
      toast.error("Lỗi khi xóa khóa học");
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

  const handleOpenModal = (type: "user"|"course"|"news"|"lesson", item: any = null) => {
    setModalType(type);
    setEditItem(item);
    if (item) {
      if (type === "course") {
        setFormData({
          ...item,
          startDate: dateInputValue(item.startDate),
          endDate: dateInputValue(item.endDate),
          teacherId: item.teacherId ?? "",
        });
      } else {
        setFormData({
          ...item,
          role: roleToValue(item.role),
          dateOfBirth: dateInputValue(item.dateOfBirth),
          avatarPreview: getUserAvatarSrc(item),
        });
      }
    } else {
      if (type === "user") setFormData({ role: 2, dateOfBirth: "", avatarPreview: "" });
      else if (type === "lesson") setFormData({ courseId: selectedCourse?.id });
      else if (type === "course") {
        setFormData({
          title: "",
          description: "",
          avatarUrl: "",
          category: "Sinh học",
          status: "Published",
          durationMinutes: 0,
          startDate: "",
          endDate: "",
          teacherId: "",
          learningOutcomes: "Hệ thống kiến thức đầy đủ, dễ hiểu\nBài giảng video chất lượng cao\nTài liệu PDF và sơ đồ tư duy",
        });
      }
      else setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setEditItem(null);
    setFormData({});
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
          });
        } else {
          await adminApi.createUser(userPayload);
        }
        fetchUsers();
      } else if (modalType === "course") {
        const coursePayload = {
          title: formData.title,
          description: formData.description || "",
          avatarUrl: formData.avatarUrl || null,
          teacherId: formData.teacherId ? Number(formData.teacherId) : null,
          category: formData.category || "Sinh học",
          status: formData.status || "Published",
          durationMinutes: Number(formData.durationMinutes || 0),
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          learningOutcomes: formData.learningOutcomes || "",
        };
        if (editItem) await adminApi.updateCourse(editItem.id, coursePayload);
        else await adminApi.createCourse(coursePayload);
        fetchCourses();
      } else if (modalType === "news") {
        if (editItem) await adminApi.updateNews(editItem.id, formData);
        else await adminApi.createNews(formData);
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

  const getUserAvatarSrc = (user: any) => user?.avatarImageDataUrl || user?.avatarUrl || "";

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

  const renderDashboardV2 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="rounded-xl border border-border bg-white p-5 shadow-sm transition-all hover:shadow-md group">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${statIconColor(stat.color)}`}>
                <stat.icon className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-[#667085] tracking-tight">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-black tracking-tight text-[#0F172A]">{stat.value}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={`flex items-center ${stat.isUp ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-black">{stat.trend}</span>
                  </div>
                  <span className="text-[11px] text-[#98A2B3] font-medium">so với tháng trước</span>
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
            <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">Phân bố kết quả học tập</h3>
            <p className="text-xs text-[#667085] font-medium mt-0.5">Tổng hợp GPA của học sinh theo nhóm điểm.</p>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gpaData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECEEF2" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: "#667085", fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#667085", fontSize: 12, fontWeight: 600 }} />
                <Tooltip 
                  cursor={{ fill: "#FFF4EC" }} 
                  contentStyle={{ 
                    borderRadius: "16px", 
                    border: "none", 
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    backgroundColor: "#ffffff",
                    padding: "12px"
                  }} 
                />
                <Bar dataKey="count" fill="#FF6B00" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">Hoạt động</h3>
            <p className="text-xs text-[#667085] font-medium mt-0.5">Cập nhật mới nhất hệ thống.</p>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, i) => (
              <div key={i} className="flex gap-4 items-start p-3 hover:bg-[#F8F9FB] rounded-lg transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-[#FFF4EC] flex items-center justify-center text-[#FF6B00] shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#0F172A]">{activity.title}</p>
                  <p className="truncate text-[12px] text-[#667085] mt-0.5">{activity.action}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );

  const renderUsers = () => {
    const filteredUsers = users.filter((user) => {
      const keyword = userSearch.trim().toLowerCase();
      const matchesSearch = !keyword || 
        `${user.fullName} ${user.email} ${user.phoneNumber || ""}`.toLowerCase().includes(keyword);
      
      const matchesRole = userRoleFilter === "all" || String(roleToValue(user.role)) === userRoleFilter;
      const matchesStatus = userStatusFilter === "all" || "Hoạt động" === userStatusFilter; // Mocking status for now
      
      return matchesSearch && matchesRole && matchesStatus;
    });

    const userStatsData = stats.find(s => s.label === "Tổng người dùng")?.userStats || {
      total: users.length, totalTrend: 0,
      active: users.length, activeTrend: 0,
      teacher: users.filter(u => roleToValue(u.role) === 1).length, teacherTrend: 0,
      student: users.filter(u => roleToValue(u.role) === 2).length, studentTrend: 0
    };

    const userCards = [
      { 
        label: "Tổng người dùng", 
        value: userStatsData.total, 
        note: `+${userStatsData.totalTrend} người dùng mới`, 
        icon: Users, 
        className: "bg-orange-50 text-orange-600",
        isTrendUp: true
      },
      { 
        label: "Đang hoạt động", 
        value: userStatsData.active, 
        note: `+${userStatsData.activeTrend} hoạt động`, 
        icon: Activity, 
        className: "bg-green-50 text-green-600",
        isTrendUp: true
      },
      { 
        label: "Giảng viên", 
        value: userStatsData.teacher, 
        note: `+${userStatsData.teacherTrend} giảng viên`, 
        icon: GraduationCap, 
        className: "bg-blue-50 text-blue-600",
        isTrendUp: true
      },
      { 
        label: "Học sinh", 
        value: userStatsData.student, 
        note: `+${userStatsData.studentTrend} học sinh`, 
        icon: UserPlus, 
        className: "bg-violet-50 text-violet-600",
        isTrendUp: true
      },
    ];

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-[#0F172A]">Quản lý người dùng</h2>
            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#667085]">
              <span>Trang chủ</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-[#0F172A]">Người dùng</span>
            </div>
          </div>
          <button onClick={() => handleOpenModal("user")} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#FF4D12] px-6 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#E6420C] hover:-translate-y-0.5">
            <Plus className="h-5 w-5" /> Thêm người dùng
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {userCards.map((item) => (
            <div key={item.label} className="rounded-xl border border-[#E6EAF0] bg-white p-7 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center gap-5">
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg ${item.className}`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black leading-none text-[#0F172A]">{formatNumber(item.value)}</p>
                  </div>
                  <p className="mt-2 text-[13px] font-bold text-[#667085]">{item.label}</p>
                  <p className={`mt-1.5 text-[11px] font-black flex items-center gap-1 ${item.isTrendUp ? "text-green-600" : "text-red-500"}`}>
                    <TrendingUp className={`w-3 h-3 ${item.isTrendUp ? "" : "rotate-180"}`} />
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
              <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)} className="h-12 rounded-lg border border-[#E6EAF0] bg-white px-5 text-sm font-bold text-[#0F172A] outline-none min-w-[160px] focus:border-[#FF6B00]">
                <option value="all">Vai trò: Tất cả</option>
                <option value="0">Admin</option>
                <option value="1">Giáo viên</option>
                <option value="2">Học sinh</option>
              </select>
              <select value={userStatusFilter} onChange={(e) => setUserStatusFilter(e.target.value)} className="h-12 rounded-lg border border-[#E6EAF0] bg-white px-5 text-sm font-bold text-[#0F172A] outline-none min-w-[160px] focus:border-[#FF6B00]">
                <option value="all">Trạng thái: Tất cả</option>
                <option value="Hoạt động">Hoạt động</option>
                <option value="Không hoạt động">Không hoạt động</option>
              </select>
              <button onClick={fetchUsers} className="flex h-12 items-center gap-2 rounded-lg border border-[#E6EAF0] bg-white px-5 text-sm font-bold text-[#0F172A] transition hover:bg-[#F8F9FB]">
                <RefreshCw className="h-4 w-4" /> Làm mới
              </button>
            </div>
          </div>

          <div className="overflow-hidden">
            <table className="w-full border-collapse table-auto">
              <thead>
                <tr className="border-b border-[#E6EAF0] bg-[#FAFBFC]/50">
                  <th className="px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">Người dùng</th>
                  <th className="px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">Email</th>
                  <th className="px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">Vai trò</th>
                  <th className="px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">Ngày sinh</th>
                  <th className="px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">Trạng thái</th>
                  <th className="px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">Ngày tham gia</th>
                  <th className="px-4 py-5 text-right text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EAF0]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="transition hover:bg-[#FAFBFC]/80 group">
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-100 shrink-0 shadow-sm">
                          {getUserAvatarSrc(user) ? (
                            <img src={getUserAvatarSrc(user)} alt={user.fullName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full bg-[#FFF4EC] text-[#FF6B00] flex items-center justify-center text-[11px] font-black uppercase">
                              {getInitials(user.fullName)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-black text-[#0F172A] truncate max-w-[180px]">{user.fullName}</p>
                          <p className="text-[10px] font-bold text-[#98A2B3] mt-0.5 uppercase tracking-tight">{user.phoneNumber || 'Không có SĐT'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-[12px] font-bold text-[#0F172A]">{user.email}</td>
                    <td className="px-4 py-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm border border-transparent ${roleBadgeClass(user.role)}`}>
                        {roleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-[12px] font-bold text-[#667085] whitespace-nowrap">{formatDate(user.dateOfBirth)}</td>
                    <td className="px-4 py-5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-600">
                        <span className="w-1 h-1 rounded-full bg-green-500"></span>
                        Hoạt động
                      </span>
                    </td>
                    <td className="px-4 py-5 text-[12px] font-bold text-[#667085] whitespace-nowrap">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-5 text-right">
                      <div className="flex justify-end gap-0.5">
                        <button className="p-1.5 text-[#98A2B3] hover:text-[#0F172A] hover:bg-slate-50 rounded-lg transition-all"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleOpenModal("user", user)} className="p-1.5 text-[#98A2B3] hover:text-[#0F172A] hover:bg-slate-50 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 text-[#98A2B3] hover:text-[#EF4444] hover:bg-slate-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
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
               <span className="text-sm font-bold text-[#667085]">trên mỗi trang</span>
            </div>
            
            <div className="flex items-center gap-8">
              <p className="text-sm font-bold text-[#667085]">Tổng {formatNumber(users.length)} người dùng</p>
              <div className="flex items-center gap-2">
                <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-[#E6EAF0] text-[#667085] hover:bg-[#F8F9FB] transition-all"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                <button className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#FFF4EC] text-[#FF6B00] font-black text-sm">1</button>
                <button className="h-10 w-10 flex items-center justify-center rounded-lg text-[#667085] font-black text-sm hover:bg-[#F8F9FB] transition-all">2</button>
                <button className="h-10 w-10 flex items-center justify-center rounded-lg text-[#667085] font-black text-sm hover:bg-[#F8F9FB] transition-all">3</button>
                <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-[#E6EAF0] text-[#667085] hover:bg-[#F8F9FB] transition-all"><ChevronRight className="h-4 w-4" /></button>
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
          <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight">Khóa học</h2>
          <p className="text-sm text-[#667085] font-medium mt-1">Quản lý các chương trình đào tạo.</p>
        </div>
        <button onClick={() => handleOpenModal("course")} className="flex items-center gap-2 px-6 py-4 bg-[#FF6B00] text-white rounded-[18px] text-sm font-bold hover:bg-[#E65F00] transition-all hover:-translate-y-0.5">
          <Plus className="w-5 h-5" /> Tạo khóa học mới
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div key={course.id} className="bg-white p-8 rounded-[28px] shadow-sm border border-[#ECEEF2] hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-[#FFF4EC] rounded-2xl flex items-center justify-center text-[#FF6B00] transition-all group-hover:scale-105">
                <BookOpen className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold uppercase tracking-widest">Đang mở</span>
            </div>
            <h3 className="text-xl font-bold text-[#0F172A] mb-3 cursor-pointer hover:text-[#FF6B00] transition-colors" onClick={() => { setSelectedCourse(course); fetchLessons(course.id); setActiveSection("courseDetail"); }}>{course.title}</h3>
            <p className="text-sm text-[#667085] mb-8 line-clamp-2 leading-relaxed font-medium">{stripHtml(course.description || "Chưa có mô tả.")}</p>
            <div className="flex items-center justify-between pt-6 border-t border-[#ECEEF2]">
              <span className="text-[11px] font-bold text-[#98A2B3] uppercase tracking-wider">GV: {course.creatorName || "N/A"}</span>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal("course", course)} className="p-2 text-[#98A2B3] hover:text-[#0F172A] transition-colors"><Edit className="w-5 h-5" /></button>
                <button onClick={() => handleDeleteCourse(course.id)} className="p-2 text-[#98A2B3] hover:text-[#EF4444] transition-colors"><Trash2 className="w-5 h-5" /></button>
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

  const categoryClass = (category?: string) => {
    const value = (category || "").toLowerCase();
    if (value.includes("12")) return "bg-orange-50 text-orange-600";
    if (value.includes("11")) return "bg-amber-50 text-amber-600";
    if (value.includes("10")) return "bg-blue-50 text-blue-600";
    if (value.includes("di truyền")) return "bg-violet-50 text-violet-600";
    if (value.includes("tế bào")) return "bg-emerald-50 text-emerald-600";
    return "bg-cyan-50 text-cyan-600";
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

  const formatNumber = (value?: number) => Number(value || 0).toLocaleString("vi-VN");

  const getCourseImage = (course: any) =>
    course.avatarUrl || "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&w=900&q=80";
  const getCourseTeacher = (course: any) => {
    const teacher = users.find((user) => Number(user.id) === Number(course.teacherId));
    return {
      name: course.teacherName || teacher?.fullName || course.creatorName || "Chưa phân công",
      avatar: course.teacherAvatarUrl || getUserAvatarSrc(teacher) || "",
    };
  };

  const courseOutcomes = (course: any) =>
    String(course?.learningOutcomes || "")
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

  const openCourseDetail = async (course: any) => {
    setSelectedCourse(course);
    await fetchLessons(course.id);
    setActiveSection("courseDetail");
  };

  const renderCoursesV2 = () => {
    const teacherOptions = users.filter((user) => roleToValue(user.role) === 1);
    const courseCategories = Array.from(new Set(courses.map((course) => course.category || "Sinh học"))).sort();
    const filteredCourses = courses.filter((course) => {
      const teacher = getCourseTeacher(course);
      const keyword = courseSearch.trim().toLowerCase();
      const matchesSearch = !keyword || `${course.title} ${stripHtml(course.description || "")} ${teacher.name}`.toLowerCase().includes(keyword);
      const matchesCategory = courseCategoryFilter === "all" || (course.category || "Sinh học") === courseCategoryFilter;
      const matchesStatus = courseStatusFilter === "all" || getCourseStatus(course) === courseStatusFilter;
      const matchesTeacher = courseTeacherFilter === "all" || String(course.teacherId || "") === courseTeacherFilter;
      return matchesSearch && matchesCategory && matchesStatus && matchesTeacher;
    });
    const published = courses.filter((course) => getCourseStatus(course) === "Published").length;
    const drafts = courses.filter((course) => getCourseStatus(course) === "Draft").length;
    const hidden = courses.filter((course) => getCourseStatus(course) === "Hidden").length;
    
    const courseStatsData = stats.find(s => s.label === "Khóa học")?.courseStats || {
      total: courses.length, totalTrend: 0,
      published: published, publishedTrend: 0,
      draft: drafts, draftTrend: 0,
      hidden: hidden, hiddenTrend: 0
    };

    const courseCards = [
      { 
        label: "Tổng khóa học", 
        value: courseStatsData.total, 
        note: courseStatsData.totalTrend >= 0 ? `+${courseStatsData.totalTrend} khóa học mới` : `${courseStatsData.totalTrend} khóa học`, 
        icon: BookOpen, 
        className: "bg-orange-50 text-orange-600",
        isTrendUp: courseStatsData.totalTrend >= 0
      },
      { 
        label: "Đã xuất bản", 
        value: courseStatsData.published, 
        note: `+${courseStatsData.publishedTrend} khóa học`, 
        icon: CheckCircle2, 
        className: "bg-green-50 text-green-600",
        isTrendUp: true
      },
      { 
        label: "Bản nháp", 
        value: courseStatsData.draft, 
        note: courseStatsData.draftTrend >= 0 ? `+${courseStatsData.draftTrend} khóa học` : `${courseStatsData.draftTrend} khóa học`, 
        icon: Clock3, 
        className: "bg-amber-50 text-amber-600",
        isTrendUp: courseStatsData.draftTrend >= 0
      },
      { 
        label: "Đã ẩn", 
        value: courseStatsData.hidden, 
        note: courseStatsData.hiddenTrend === 0 ? "→ Không đổi" : `${courseStatsData.hiddenTrend} khóa học`, 
        icon: Archive, 
        className: "bg-violet-50 text-violet-600",
        isTrendUp: courseStatsData.hiddenTrend >= 0
      },
    ];

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-[#0F172A]">Quản lý khóa học</h2>
            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#667085]">
              <span>Trang chủ</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-[#0F172A]">Khóa học</span>
            </div>
          </div>
          <button onClick={() => handleOpenModal("course")} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#FF4D12] px-6 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#E6420C] hover:-translate-y-0.5">
            <Plus className="h-5 w-5" /> Thêm khóa học
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {courseCards.map((item) => (
            <div key={item.label} className="rounded-xl border border-[#E6EAF0] bg-white p-7 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center gap-5">
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg ${item.className}`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black leading-none text-[#0F172A]">{formatNumber(item.value)}</p>
                  </div>
                  <p className="mt-2 text-[13px] font-bold text-[#667085]">{item.label}</p>
                  <p className={`mt-1.5 text-[11px] font-black flex items-center gap-1 ${item.note.includes("Không đổi") ? "text-[#98A2B3]" : item.isTrendUp ? "text-green-600" : "text-red-500"}`}>
                    {item.note.includes("+") || item.note.includes("-") ? (
                      item.isTrendUp ? <TrendingUp className="w-3 h-3 rotate-0" /> : <TrendingUp className="w-3 h-3 rotate-180" />
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
              <select value={courseCategoryFilter} onChange={(e) => setCourseCategoryFilter(e.target.value)} className="h-12 rounded-lg border border-[#E6EAF0] bg-white px-5 text-sm font-bold text-[#0F172A] outline-none min-w-[160px] focus:border-[#FF6B00]">
                <option value="all">Danh mục: Tất cả</option>
                {courseCategories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
              <select value={courseStatusFilter} onChange={(e) => setCourseStatusFilter(e.target.value)} className="h-12 rounded-lg border border-[#E6EAF0] bg-white px-5 text-sm font-bold text-[#0F172A] outline-none min-w-[160px] focus:border-[#FF6B00]">
                <option value="all">Trạng thái: Tất cả</option>
                <option value="Published">Đã xuất bản</option>
                <option value="Draft">Bản nháp</option>
                <option value="Hidden">Ẩn</option>
              </select>
              <select value={courseTeacherFilter} onChange={(e) => setCourseTeacherFilter(e.target.value)} className="h-12 rounded-lg border border-[#E6EAF0] bg-white px-5 text-sm font-bold text-[#0F172A] outline-none min-w-[180px] focus:border-[#FF6B00]">
                <option value="all">Giảng viên: Tất cả</option>
                {teacherOptions.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>)}
              </select>
              <button onClick={fetchCourses} className="flex h-12 items-center gap-2 rounded-lg border border-[#E6EAF0] bg-white px-5 text-sm font-bold text-[#0F172A] transition hover:bg-[#F8F9FB]">
                <RefreshCw className="h-4 w-4" /> Làm mới
              </button>
            </div>
          </div>

          <div className="overflow-hidden">
            <table className="w-full border-collapse table-auto">
              <thead>
                <tr className="border-b border-[#E6EAF0] bg-[#FAFBFC]/50">
                  <th className="px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">Khóa học</th>
                  <th className="px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">Danh mục</th>
                  <th className="px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">Giảng viên</th>
                  <th className="px-2 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">Học viên</th>
                  <th className="px-2 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">Thời lượng</th>
                  <th className="px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">Trạng thái</th>
                  <th className="px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">Ngày tạo</th>
                  <th className="px-4 py-5 text-right text-[11px] font-black uppercase tracking-wider text-[#7B8AA0]">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EAF0]">
                {filteredCourses.map((course) => {
                  const teacher = getCourseTeacher(course);
                  const status = getCourseStatus(course);
                  return (
                    <tr key={course.id} className="transition hover:bg-[#FAFBFC]/80">
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <img src={getCourseImage(course)} alt={course.title} className="h-10 w-14 rounded-lg object-cover shadow-sm border border-slate-100 shrink-0" />
                          <div className="max-w-[200px]">
                            <button onClick={() => openCourseDetail(course)} className="block truncate text-left text-[13px] font-black text-[#0F172A] transition hover:text-[#FF6B00]">{course.title}</button>
                            <p className="mt-0.5 line-clamp-1 text-[10px] font-bold text-[#98A2B3] leading-relaxed uppercase tracking-tight">{stripHtml(course.description || "")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm border border-transparent ${categoryClass(course.category)}`}>
                          {course.category || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full border border-slate-100 overflow-hidden shrink-0">
                            {teacher.avatar ? (
                              <img src={teacher.avatar} alt={teacher.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full bg-[#FFF4EC] text-[#FF6B00] flex items-center justify-center text-[9px] font-black uppercase">
                                {getInitials(teacher.name)}
                              </div>
                            )}
                          </div>
                          <span className="text-[12px] font-bold text-[#0F172A] truncate max-w-[100px]">{teacher.name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-5 text-[12px] font-black text-[#0F172A]">{formatNumber(course.studentCount)}</td>
                      <td className="px-2 py-5 text-[12px] font-bold text-[#667085] whitespace-nowrap">{formatDuration(course.durationMinutes)}</td>
                      <td className="px-4 py-5">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${courseStatusClass(status)}`}>
                          <span className={`w-1 h-1 rounded-full ${status === "Published" ? "bg-green-500" : status === "Draft" ? "bg-amber-500" : "bg-slate-400"}`}></span>
                          {courseStatusLabel(status)}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-[12px] font-bold text-[#667085] whitespace-nowrap">{formatDate(course.createdAt)}</td>
                      <td className="px-4 py-5 text-right">
                        <div className="flex justify-end gap-0.5">
                          <button onClick={() => openCourseDetail(course)} className="p-1.5 text-[#98A2B3] hover:text-[#0F172A] hover:bg-slate-50 rounded-lg transition-all"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => handleOpenModal("course", course)} className="p-1.5 text-[#98A2B3] hover:text-[#0F172A] hover:bg-slate-50 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                          <button className="p-1.5 text-[#98A2B3] hover:text-[#0F172A] hover:bg-slate-50 rounded-lg transition-all"><MoreVertical className="w-4 h-4" /></button>
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
               <span className="text-sm font-bold text-[#667085]">trên mỗi trang</span>
            </div>
            
            <div className="flex items-center gap-8">
              <p className="text-sm font-bold text-[#667085]">Tổng {formatNumber(courses.length)} khóa học</p>
              <div className="flex items-center gap-2">
                <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-[#E6EAF0] text-[#667085] hover:bg-[#F8F9FB] transition-all"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                <button className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#FFF4EC] text-[#FF6B00] font-black text-sm">1</button>
                <button className="h-10 w-10 flex items-center justify-center rounded-lg text-[#667085] font-black text-sm hover:bg-[#F8F9FB] transition-all">2</button>
                <button className="h-10 w-10 flex items-center justify-center rounded-lg text-[#667085] font-black text-sm hover:bg-[#F8F9FB] transition-all">3</button>
                <button className="h-10 w-10 flex items-center justify-center rounded-lg text-[#667085] font-black text-sm hover:bg-[#F8F9FB] transition-all">4</button>
                <button className="h-10 w-10 flex items-center justify-center rounded-lg text-[#667085] font-black text-sm hover:bg-[#F8F9FB] transition-all">5</button>
                <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-[#E6EAF0] text-[#667085] hover:bg-[#F8F9FB] transition-all"><ChevronRight className="h-4 w-4" /></button>
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
          <p className="text-sm font-semibold text-[#667085]">Chưa chọn khóa học.</p>
          <button onClick={() => setActiveSection("courses")} className="mt-4 rounded-lg bg-[#FF4D12] px-5 py-3 text-sm font-bold text-white">Quay lại danh sách</button>
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
            <img src={getCourseImage(course)} alt={course.title} className="absolute inset-0 h-full w-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
            <div className="relative z-10 flex h-full min-h-[335px] flex-col justify-end p-8 text-white">
              <span className="mb-4 w-fit rounded-full bg-[#FF4D12] px-3 py-1 text-xs font-black uppercase">Khóa học tiêu biểu</span>
              <h1 className="max-w-xl text-4xl font-black tracking-tight">{course.title}</h1>
              <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-white/90">{stripHtml(course.description || "").slice(0, 180)}</p>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[teacher.name, course.creatorName, "Học viên"].map((name, index) => (
                    <div key={index} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#FFF4EC] text-xs font-black text-[#FF6B00]">{getInitials(name)}</div>
                  ))}
                </div>
                <span className="text-sm font-bold">{formatNumber(course.studentCount)} học sinh đã đăng ký</span>
              </div>
            </div>
            <button className="absolute right-8 top-8 z-10 rounded-full bg-white px-6 py-3 text-sm font-black text-[#FF4D12] shadow-lg">Tiếp tục học</button>
          </section>

          <aside className="rounded-xl border border-[#E6EAF0] bg-white p-7 shadow-sm">
            {[
              { icon: UserRound, label: "Giảng viên", value: teacher.name },
              { icon: Calendar, label: "Ngày bắt đầu", value: formatDate(course.startDate) },
              { icon: CalendarDays, label: "Ngày kết thúc", value: formatDate(course.endDate) },
              { icon: Clock3, label: "Thời lượng", value: formatDuration(course.durationMinutes) },
              { icon: Users, label: "Học sinh", value: `${formatNumber(course.studentCount)} học sinh` },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between border-b border-[#EEF2F6] py-4 last:border-0">
                <div className="flex items-center gap-3 text-sm font-semibold text-[#667085]"><item.icon className="h-5 w-5" /> {item.label}</div>
                <span className="max-w-[190px] text-right text-sm font-black text-[#0F172A]">{item.value}</span>
              </div>
            ))}
            <div className="pt-4">
              <div className="mb-3 flex items-center justify-between text-sm font-bold">
                <span className="text-[#667085]">Tiến độ khóa học</span>
                <span className="text-[#FF4D12]">{progress}% hoàn thành</span>
              </div>
              <div className="h-2 rounded-full bg-[#EEF2F6]"><div className="h-full rounded-full bg-[#FF4D12]" style={{ width: `${Math.min(progress, 100)}%` }} /></div>
            </div>
          </aside>
        </div>

        <div className="flex overflow-x-auto rounded-xl border border-[#E6EAF0] bg-white px-6 shadow-sm">
          {["Tổng quan", "Nội dung khóa học", "Tài liệu", "Flashcard", "Quiz", "Bài thi", "Thông báo", "Đánh giá"].map((tab, index) => (
            <button key={tab} className={`relative min-w-fit px-6 py-5 text-sm font-bold ${index === 0 ? "text-[#FF4D12]" : "text-[#667085]"}`}>
              {tab}
              {index === 0 && <span className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full bg-[#FF4D12]" />}
            </button>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section className="rounded-xl border border-[#E6EAF0] bg-white p-7 shadow-sm">
              <h2 className="flex items-center gap-3 text-xl font-black text-[#0F172A]"><BookOpen className="h-6 w-6 text-[#FF4D12]" /> Giới thiệu khóa học</h2>
              <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_280px]">
                <div>
                  <p className="text-sm font-medium leading-7 text-[#3C4A5F]">{stripHtml(course.description || "")}</p>
                  <div className="mt-6 space-y-3">
                    {(outcomes.length ? outcomes : ["Hệ thống kiến thức đầy đủ, dễ hiểu", "Bài giảng video chất lượng cao", "Tài liệu PDF và sơ đồ tư duy"]).map((item) => (
                      <div key={item} className="flex items-center gap-3 text-sm font-semibold text-[#3C4A5F]"><CheckCircle2 className="h-5 w-5 text-green-500" /> {item}</div>
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
              <h2 className="flex items-center gap-3 text-xl font-black text-[#0F172A]"><GraduationCap className="h-6 w-6 text-[#FF4D12]" /> Nội dung khóa học</h2>
              <div className="mt-6 overflow-hidden rounded-xl border border-[#E6EAF0]">
                {lessonGroups.map((lesson, index) => (
                  <div key={lesson.id || index} className={`border-b border-[#E6EAF0] p-5 last:border-0 ${index === 0 ? "bg-[#FFF4EC]" : "bg-white"}`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#FF4D12]"><PlayCircle className="h-5 w-5" /></div>
                        <div>
                          <p className="text-sm font-black text-[#0F172A]">Bài {index + 1}. {lesson.title}</p>
                          <p className="mt-1 text-xs font-semibold text-[#667085]">{lesson.description || "Video bài giảng, tài liệu PDF, flashcard và quiz."}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-bold text-[#667085]">
                        <span>{index === 0 ? "18:45" : `${32 + index * 4}:30`}</span>
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
              {teacher.avatar ? <img src={teacher.avatar} alt={teacher.name} className="mx-auto h-24 w-24 rounded-full object-cover" /> : <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF4EC] text-2xl font-black text-[#FF4D12]">{getInitials(teacher.name)}</div>}
              <h3 className="mt-5 text-lg font-black text-[#0F172A]">{teacher.name}</h3>
              <p className="text-sm font-semibold text-[#667085]">Giảng viên Sinh học</p>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <div><p className="text-lg font-black text-[#0F172A]">8+</p><p className="text-xs font-semibold text-[#667085]">Năm kinh nghiệm</p></div>
                <div><p className="text-lg font-black text-[#0F172A]">2.500+</p><p className="text-xs font-semibold text-[#667085]">Học sinh</p></div>
                <div><p className="text-lg font-black text-[#0F172A]">4.9 <Star className="inline h-4 w-4 fill-amber-400 text-amber-400" /></p><p className="text-xs font-semibold text-[#667085]">Đánh giá</p></div>
              </div>
            </section>

            <section className="rounded-xl border border-[#E6EAF0] bg-white p-7 shadow-sm">
              <h3 className="text-lg font-black text-[#0F172A]">Bạn sẽ nhận được</h3>
              <div className="mt-5 space-y-4">
                {(outcomes.length ? outcomes : ["Bài giảng video chất lượng cao", "Tài liệu PDF đầy đủ", "Quiz và bài thi đánh giá năng lực", "Cập nhật nội dung miễn phí"]).map((item) => (
                  <div key={item} className="flex gap-3 text-sm font-semibold text-[#3C4A5F]"><CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" /> {item}</div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-[#E6EAF0] bg-white p-7 text-center shadow-sm">
              <Award className="mx-auto h-20 w-20 text-amber-400" />
              <h3 className="mt-4 text-lg font-black text-[#0F172A]">Chứng chỉ hoàn thành</h3>
              <p className="mt-3 text-sm font-medium leading-6 text-[#667085]">Nhận chứng chỉ của EduSmart sau khi hoàn thành tất cả bài học và bài thi.</p>
            </section>
          </div>
        </div>
      </div>
    );
  };

  const renderNews = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[28px] shadow-sm border border-[#ECEEF2] overflow-hidden">
        <div className="p-8 border-b border-[#ECEEF2] flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Tin tức</h2>
          <button onClick={() => handleOpenModal("news")} className="flex items-center gap-2 px-6 py-4 bg-[#FF6B00] text-white rounded-[18px] text-sm font-bold hover:bg-[#E65F00] transition-all">
            <Plus className="w-5 h-5" /> Viết bài mới
          </button>
        </div>
        <div className="divide-y divide-[#ECEEF2]">
          {news.map((item) => (
            <div key={item.id} className="p-8 flex items-center justify-between hover:bg-[#FAFAFA] transition-all group">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-[#F8F9FB] rounded-2xl flex items-center justify-center text-[#FF6B00]">
                  <Newspaper className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0F172A] group-hover:text-[#FF6B00] transition-colors">{item.title}</h4>
                  <p className="text-[12px] text-[#667085] font-medium mt-1 uppercase tracking-wider">{formatDate(item.createdAt)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal("news", item)} className="p-2 text-[#98A2B3] hover:text-[#0F172A] transition-colors"><Edit className="w-5 h-5" /></button>
                <button onClick={() => handleDeleteNews(item.id)} className="p-2 text-[#98A2B3] hover:text-[#EF4444] transition-colors"><Trash2 className="w-5 h-5" /></button>
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
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Feedback học viên</h2>
        </div>
        <div className="divide-y divide-[#ECEEF2]">
          {feedbacks.map((item) => (
            <div key={item.id} className="p-8 hover:bg-[#FAFAFA] transition-all">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-[#FFF4EC] rounded-2xl flex items-center justify-center text-[#FF6B00] font-bold text-lg">
                  {item.student.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-[#0F172A]">{item.student}</h4>
                    <span className="text-[12px] text-[#98A2B3] font-medium">{item.date}</span>
                  </div>
                  <p className="text-[#667085] text-sm leading-relaxed italic">"{item.content}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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
  ];

  const activeLabel = activeSection === "courseDetail"
    ? "Chi tiết khóa học"
    : menuItems.find((item) => item.id === activeSection)?.label;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-6 pt-6 pb-10">

      <div className="space-y-6 pb-24">
        {activeSection === "dashboard" && renderDashboardV2()}
        {activeSection === "users" && renderUsers()}
        {activeSection === "courses" && renderCoursesV2()}
        {activeSection === "news" && renderNews()}
        {activeSection === "feedback" && renderFeedback()}
        {activeSection === "courseDetail" && renderCourseDetail(selectedCourse)}
      </div>

      {/* Modal */}
      {isModalOpen && (
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
                {editItem ? "Cập nhật" : "Thêm mới"} {modalType === "user" ? "người dùng" : modalType === "course" ? "khóa học" : modalType === "news" ? "bài viết" : "bài học"}
              </h2>
              <p className="text-xs text-[#667085] font-medium mt-1">Vui lòng điền đầy đủ các thông tin cần thiết vào biểu mẫu dưới đây.</p>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              {modalType === "user" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Avatar Upload */}
                  <div className="md:col-span-2 flex flex-col items-center mb-2">
                    <div className="relative group cursor-pointer" onClick={() => document.getElementById('admin-avatar-input')?.click()}>
                      {formData.avatarPreview ? (
                        <img src={formData.avatarPreview} alt="Avatar" className="w-20 h-20 rounded-xl object-cover border-2 border-[#F1F3F5] group-hover:border-[#FF6B00]/30 transition-all shadow-sm" />
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
                            setFormData({...formData, avatarFile: file, avatarPreview: reader.result as string});
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                    <span className="text-[10px] font-bold text-[#ADB5BD] mt-2 uppercase tracking-widest">Ảnh đại diện</span>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Họ và tên</label>
                    <input type="text" required value={formData.fullName || ""} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full h-11 px-4 bg-[#F8F9FB] border border-transparent rounded-lg focus:bg-white focus:border-[#FF6B00]/20 focus:ring-4 focus:ring-[#FF6B00]/5 outline-none font-bold text-[#0F172A] transition-all placeholder:text-[#ADB5BD] placeholder:font-medium" placeholder="Nhập họ và tên..." />
                  </div>
                  {!editItem && (
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Email</label>
                      <input type="email" required value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full h-11 px-4 bg-[#F8F9FB] border border-transparent rounded-lg focus:bg-white focus:border-[#FF6B00]/20 focus:ring-4 focus:ring-[#FF6B00]/5 outline-none font-bold text-[#0F172A] transition-all placeholder:text-[#ADB5BD] placeholder:font-medium" placeholder="example@email.com" />
                    </div>
                  )}
                  {!editItem && (
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Mật khẩu</label>
                      <input type="password" required value={formData.password || ""} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full h-11 px-4 bg-[#F8F9FB] border border-transparent rounded-lg focus:bg-white focus:border-[#FF6B00]/20 focus:ring-4 focus:ring-[#FF6B00]/5 outline-none font-bold text-[#0F172A] transition-all placeholder:text-[#ADB5BD] placeholder:font-medium" placeholder="••••••••" />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Vai trò</label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full h-11 px-4 bg-[#F8F9FB] border border-transparent rounded-lg outline-none font-bold text-[#0F172A] focus:bg-white focus:border-[#FF6B00]/20 transition-all cursor-pointer">
                      <option value={0}>Admin</option>
                      <option value={1}>Giáo viên</option>
                      <option value={2}>Học sinh</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Ngày sinh</label>
                    <input type="date" value={formData.dateOfBirth || ""} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} className="w-full h-11 px-4 bg-[#F8F9FB] border border-transparent rounded-lg outline-none font-bold text-[#0F172A] focus:bg-white focus:border-[#FF6B00]/20 transition-all" />
                  </div>
                </div>
              )}

              {modalType === "course" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Tên khóa học</label>
                    <input type="text" required value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full h-11 px-4 bg-[#F8F9FB] border border-transparent rounded-lg focus:bg-white focus:border-[#FF6B00]/20 outline-none font-bold text-[#0F172A] transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Mô tả chi tiết</label>
                    <RichTextEditor value={formData.description || ""} onChange={html => setFormData({...formData, description: html})} />
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button type="submit" className="w-full h-11 bg-[#FF6B00] text-white rounded-lg font-bold hover:bg-[#E65F00] transition-all shadow-md shadow-[#FF6B00]/10 flex items-center justify-center gap-2">
                  {editItem ? "Cập nhật thông tin" : "Tạo mới bản ghi"}
                </button>
              </div>
            </form>
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
