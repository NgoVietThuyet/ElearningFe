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
  X
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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"user"|"course"|"news"|"lesson"|null>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  // Stats State
  const [gpaData, setGpaData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([
    { label: "Người dùng", value: "0", icon: Users, color: "orange", hint: "Tài khoản trên hệ thống" },
    { label: "Khóa học", value: "0", icon: BookOpen, color: "blue", hint: "Chương trình đang mở" },
    { label: "Tin tức", value: "0", icon: Newspaper, color: "green", hint: "Bài viết đã đăng" },
    { label: "Bài giảng", value: "0", icon: BookMarked, color: "purple", hint: "Nội dung học tập" },
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
        { label: "Người dùng", value: res.data.totalUsers.toString(), icon: Users, color: "orange", hint: "Tài khoản trên hệ thống" },
        { label: "Khóa học", value: res.data.totalCourses.toString(), icon: BookOpen, color: "blue", hint: "Chương trình đang mở" },
        { label: "Tin tức", value: res.data.totalNews.toString(), icon: Newspaper, color: "green", hint: "Bài viết đã đăng" },
        { label: "Bài giảng", value: res.data.totalLessons.toString(), icon: BookMarked, color: "purple", hint: "Nội dung học tập" },
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
      setFormData({
        ...item,
        role: roleToValue(item.role),
        dateOfBirth: dateInputValue(item.dateOfBirth),
        avatarPreview: getUserAvatarSrc(item),
      });
    } else {
      if (type === "user") setFormData({ role: 2, dateOfBirth: "", avatarPreview: "" });
      else if (type === "lesson") setFormData({ courseId: selectedCourse?.id });
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
        if (editItem) await adminApi.updateCourse(editItem.id, formData);
        else await adminApi.createCourse(formData);
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
    if (value === 0) return "Admin";
    if (value === 1) return "Giáo viên";
    return "Học sinh";
  };

  const roleBadgeClass = (role: string | number) => {
    const value = roleToValue(role);
    if (value === 0) return "bg-purple-100 text-purple-700";
    if (value === 1) return "bg-blue-100 text-blue-700";
    return "bg-orange-100 text-orange-700";
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

  const getUserAvatarSrc = (user: any) => user.avatarImageDataUrl || user.avatarUrl || "";

  const getInitials = (name?: string) => {
    const value = (name || "U").trim();
    return value
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  const statIconClass = (color: string) => {
    if (color === "blue") return "bg-blue-50 text-blue-600";
    if (color === "green") return "bg-emerald-50 text-emerald-600";
    if (color === "purple") return "bg-violet-50 text-violet-600";
    return "bg-orange-50 text-orange-600";
  };

  const activityIcon = (type: string) => {
    if (type === "Tin tức") return Newspaper;
    if (type === "Khóa học") return BookOpen;
    return Activity;
  };

  const activityIconClass = (type: string) => {
    if (type === "Tin tức") return "bg-emerald-50 text-emerald-600";
    if (type === "Khóa học") return "bg-blue-50 text-blue-600";
    return "bg-orange-50 text-orange-600";
  };

  const renderCourseDetail = (course: any) => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => setActiveSection("courses")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
        </button>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{course.title}</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900">Danh sách bài giảng</h3>
              <button onClick={() => handleOpenModal("lesson")} className="flex items-center gap-2 text-xs text-orange-600 hover:text-orange-700 font-black bg-orange-50 px-4 py-2.5 rounded-xl transition-all">
                <Plus className="w-4 h-4" /> THÊM BÀI GIẢNG
              </button>
            </div>
            <div className="space-y-4">
              {lessons.length === 0 ? (
                <p className="text-sm text-gray-500 italic p-6 bg-gray-50 rounded-2xl">Chưa có bài giảng nào trong khóa học này.</p>
              ) : (
                lessons.map((lesson, index) => (
                  <div key={lesson.id} className="flex items-center justify-between p-5 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all card-lift">
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 text-sm font-black shadow-sm">{index + 1}</div>
                      <div>
                        <span className="font-bold text-gray-900 block">{lesson.title}</span>
                        <div className="flex items-center gap-3 mt-1">
                          <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase text-blue-500 hover:underline tracking-widest">Video</a>
                          <span className="text-gray-300">|</span>
                          <a href={lesson.pdfUrl} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase text-red-500 hover:underline tracking-widest">Tài liệu PDF</a>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleOpenModal("lesson", lesson)} className="p-2.5 text-gray-400 hover:text-orange-600 transition-colors"><Edit className="w-4.5 h-4.5" /></button>
                      <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4.5 h-4.5" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-black text-gray-900 mb-5 tracking-tight uppercase text-xs">Chi tiết khóa học</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-50"><span className="text-gray-500 font-medium">Giáo viên tạo:</span> <span className="font-black text-gray-900">{course.creatorName || "N/A"}</span></div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50"><span className="text-gray-500 font-medium">Sĩ số học sinh:</span> <span className="font-black text-gray-900">0</span></div>
              <div className="flex justify-between items-center py-2"><span className="text-gray-500 font-medium">Trạng thái:</span> <span className="text-green-600 font-black uppercase text-[10px] tracking-widest bg-green-50 px-2 py-1 rounded">Đang mở</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboardV2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-orange-200 group card-lift">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="mt-2 text-3xl font-black tracking-tighter text-gray-950">{stat.value}</p>
                <p className="mt-3 text-[10px] font-bold text-gray-400 italic line-clamp-1">{stat.hint}</p>
              </div>
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm group-hover:scale-110 transition-transform ${statIconClass(stat.color)}`}>
                <stat.icon className="h-7 w-7" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]">
        <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-black text-gray-950 tracking-tight">Phân bố kết quả học tập</h3>
              <p className="text-sm text-gray-500 font-medium">Tổng hợp GPA của học sinh theo nhóm điểm.</p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gpaData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 700 }} />
                <Tooltip 
                  cursor={{ fill: "rgba(249,115,22,0.05)" }} 
                  contentStyle={{ 
                    borderRadius: "20px", 
                    border: "none", 
                    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                    backgroundColor: "#ffffff",
                    padding: "12px 16px"
                  }} 
                  itemStyle={{ color: "#f97316", fontWeight: 800, fontSize: "14px" }}
                  labelStyle={{ color: "#9ca3af", fontWeight: 800, marginBottom: "4px", fontSize: "10px", textTransform: "uppercase" }}
                />
                <Bar dataKey="count" fill="#f97316" radius={[10, 10, 0, 0]} barSize={48} className="drop-shadow-lg" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-gray-950 tracking-tight">Hoạt động gần đây</h3>
              <p className="text-sm text-gray-500 font-medium">Tin tức và khóa học mới.</p>
            </div>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {recentActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                 <Activity className="w-10 h-10 text-gray-300 mb-3" />
                 <p className="text-sm text-gray-400 font-bold italic">Chưa có hoạt động nào.</p>
              </div>
            ) : (
              recentActivities.map((activity, i) => {
                const Icon = activityIcon(activity.type);
                return (
                  <div key={i} className="flex items-center gap-4 rounded-2xl border border-transparent p-4 transition-all hover:border-orange-100 hover:bg-orange-50/30 group">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm group-hover:scale-110 transition-transform ${activityIconClass(activity.type)}`}>
                      <Icon className="h-5.5 w-5.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-gray-950 group-hover:text-orange-600 transition-colors">{activity.title}</p>
                      <p className="truncate text-xs text-gray-500 mt-0.5">
                        {activity.action} bởi <span className="font-black text-gray-700">{activity.by}</span>
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-black text-gray-300 uppercase">
                      {new Date(activity.timestamp).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Danh sách người dùng</h2>
          <button onClick={() => handleOpenModal("user")} className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl text-sm font-black hover:bg-orange-700 transition-all shadow-lg shadow-orange-100">
            <Plus className="w-5 h-5" /> THÊM NGƯỜI DÙNG
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">ID</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Người dùng</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Email</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Vai trò</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-orange-50/20 transition-colors group">
                  <td className="px-8 py-6 whitespace-nowrap text-sm font-black text-gray-400">#{user.id}</td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      {getUserAvatarSrc(user) ? (
                        <img src={getUserAvatarSrc(user)} alt={user.fullName || user.name || "Avatar"} className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white shadow-sm" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 text-sm font-black text-orange-700 shadow-sm">
                          {getInitials(user.fullName || user.name)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-black text-gray-900 transition-colors group-hover:text-orange-600">{user.fullName || user.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Tham gia: {formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600 font-bold italic">{user.email}</td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${roleBadgeClass(user.role)}`}>
                      {roleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleOpenModal("user", user)} className="p-2.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all">
                        <Edit className="w-4.5 h-4.5" />
                      </button>
                      <button onClick={() => handleDeleteUser(user.id)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {courses.map((course) => (
          <div key={course.id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group card-lift">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white group-hover:rotate-6 transition-all duration-300 shadow-sm">
                <BookOpen className="w-7 h-7" />
              </div>
              <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                ĐANG MỞ
              </span>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 cursor-pointer group-hover:text-orange-600 transition-colors" onClick={() => { setSelectedCourse(course); fetchLessons(course.id); setActiveSection("courseDetail"); }}>{course.title}</h3>
            <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed font-medium">"{stripHtml(course.description || "Chưa có mô tả chi tiết cho khóa học này.")}"</p>
            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">GIẢNG VIÊN: <span className="text-gray-700">{course.creatorName || "ADMIN"}</span></span>
              <div className="flex gap-1">
                <button onClick={() => handleOpenModal("course", course)} className="p-2.5 text-gray-400 hover:text-orange-600 transition-colors"><Edit className="w-4.5 h-4.5" /></button>
                <button onClick={() => handleDeleteCourse(course.id)} className="p-2.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4.5 h-4.5" /></button>
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => handleOpenModal("course")} className="border-2 border-dashed border-gray-200 rounded-3xl p-10 flex flex-col items-center justify-center text-gray-400 hover:border-orange-400 hover:bg-orange-50/10 hover:text-orange-500 transition-all group min-h-[220px]">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-orange-100 transition-all">
            <Plus className="w-8 h-8 group-hover:text-orange-600" />
          </div>
          <span className="font-black uppercase text-xs tracking-widest">Tạo khóa học mới</span>
        </button>
      </div>
    </div>
  );

  const renderNews = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Quản lý tin tức</h2>
          <button onClick={() => handleOpenModal("news")} className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl text-sm font-black hover:bg-orange-700 transition-all shadow-lg shadow-orange-100">
            <Plus className="w-5 h-5" /> VIẾT BÀI MỚI
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {news.map((item) => (
            <div key={item.id} className="p-8 flex items-center justify-between hover:bg-orange-50/10 transition-all group">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black shadow-sm group-hover:rotate-6 transition-transform">
                  <Newspaper className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-black text-gray-900 transition-colors group-hover:text-orange-600 line-clamp-1">{item.title}</h4>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1.5">{formatDate(item.createdAt)} • <span className="text-gray-600">{item.authorName || "HỆ THỐNG"}</span></p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleOpenModal("news", item)} className="p-2.5 text-gray-400 hover:text-orange-600 transition-colors"><Edit className="w-4.5 h-4.5" /></button>
                <button onClick={() => handleDeleteNews(item.id)} className="p-2.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4.5 h-4.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Phản hồi từ học viên</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {feedbacks.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center">
              <MessageSquare className="w-16 h-16 text-gray-100 mb-4" />
              <p className="text-gray-400 font-black uppercase text-xs tracking-widest italic">Chưa nhận được phản hồi nào mới.</p>
            </div>
          ) : (
            feedbacks.map((item) => (
              <div key={item.id} className="p-8 hover:bg-orange-50/10 transition-all group">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center text-orange-600 font-black text-xl shadow-sm">
                    {item.student.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2.5">
                      <h4 className="font-black text-gray-900 text-lg tracking-tight group-hover:text-orange-600 transition-colors">{item.student}</h4>
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">{item.date}</span>
                    </div>
                    <p className="text-gray-600 text-sm font-medium italic leading-relaxed line-clamp-3">"{item.content}"</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100">Khóa học: {item.course}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-2 sm:px-4">
      <div className="mb-10 flex flex-col gap-3">
        <h1 className="text-4xl font-black tracking-tighter text-gray-950">
          {activeLabel}
        </h1>
      </div>

      <div className="space-y-6 pb-24">
        {activeSection === "dashboard" && renderDashboardV2()}
        {activeSection === "users" && renderUsers()}
        {activeSection === "courses" && renderCourses()}
        {activeSection === "news" && renderNews()}
        {activeSection === "feedback" && renderFeedback()}
        {activeSection === "courseDetail" && renderCourseDetail(selectedCourse)}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-10 animate-in zoom-in-95 duration-400 border border-gray-100 relative">
            <button 
              onClick={handleCloseModal}
              className="absolute top-6 right-6 p-2 rounded-2xl bg-gray-50 text-gray-400 hover:text-red-500 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-3xl font-black text-gray-900 mb-10 tracking-tight flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                {modalType === "user" && <Users className="w-6 h-6" />}
                {modalType === "course" && <BookOpen className="w-6 h-6" />}
                {modalType === "news" && <Newspaper className="w-6 h-6" />}
                {modalType === "lesson" && <BookMarked className="w-6 h-6" />}
              </div>
              <div>
                <span className="block text-gray-400 text-[10px] uppercase tracking-[0.3em] leading-none mb-1">{editItem ? "Cập nhật dữ liệu" : "Khởi tạo dữ liệu"}</span>
                {modalType === "user" && "Người dùng"}
                {modalType === "course" && "Khóa học"}
                {modalType === "news" && "Tin tức"}
                {modalType === "lesson" && "Bài giảng"}
              </div>
            </h2>

            <form onSubmit={handleModalSubmit} className="space-y-8">
              {modalType === "user" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Họ và tên học viên/giáo viên</label>
                    <input type="text" required value={formData.fullName || ""} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-900 transition-all" placeholder="Nguyễn Văn A..." />
                  </div>
                  {!editItem && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Địa chỉ Email</label>
                      <input type="email" required value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-900 transition-all" placeholder="example@edusmart.vn" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phân quyền vai trò</label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-black text-gray-900 transition-all appearance-none">
                      <option value={0}>Admin (Quản trị viên)</option>
                      <option value={1}>Teacher (Giáo viên)</option>
                      <option value={2}>Student (Học viên)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày sinh nhật</label>
                    <input type="date" value={formData.dateOfBirth || ""} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-900 transition-all" />
                  </div>
                </div>
              )}

              {modalType === "course" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên chương trình học</label>
                    <input type="text" required value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-900 transition-all" placeholder="Nhập tên khóa học..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mô tả tổng quan</label>
                    <RichTextEditor
                      value={formData.description || ""}
                      onChange={(html) => setFormData({...formData, description: html})}
                      placeholder="Nhập mô tả chi tiết..."
                    />
                  </div>
                </div>
              )}

              {modalType === "news" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tiêu đề bài viết</label>
                    <input type="text" required value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-900 transition-all" placeholder="Tiêu đề tin tức..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nội dung chi tiết</label>
                    <RichTextEditor
                      value={formData.content || ""}
                      onChange={(html) => setFormData({...formData, content: html})}
                      placeholder="Viết nội dung bài báo tại đây..."
                    />
                  </div>
                </div>
              )}

              {modalType === "lesson" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên tiêu đề bài học</label>
                    <input type="text" required value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-900 transition-all" placeholder="Ví dụ: Bài 1: Di truyền học Mendel" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đường dẫn Video (YouTube/Vimeo)</label>
                      <input type="url" value={formData.videoUrl || ""} onChange={e => setFormData({...formData, videoUrl: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-900 transition-all" placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đường dẫn tài liệu PDF</label>
                      <input type="url" value={formData.pdfUrl || ""} onChange={e => setFormData({...formData, pdfUrl: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-900 transition-all" placeholder="https://..." />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6">
                <button type="submit" className="w-full py-5 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl text-base font-black uppercase tracking-widest shadow-xl shadow-orange-100 hover:shadow-2xl hover:scale-[1.01] transition-all">
                  {editItem ? "XÁC NHẬN CẬP NHẬT" : "TẠO MỚI NGAY"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
