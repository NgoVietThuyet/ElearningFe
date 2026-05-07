import { useState, useEffect } from "react";
import { 
  Users, 
  BookOpen, 
  FileText, 
  BarChart3, 
  Edit, 
  Trash2, 
  LayoutDashboard, 
  UserPlus, 
  Newspaper,
  ChevronRight,
  Search,
  Plus,
  Home as HomeIcon,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import HomeView from "../components/HomeView";
import { adminApi } from "../api/adminApi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import RichTextEditor from "../components/RichTextEditor";

type AdminSection = "home" | "dashboard" | "users" | "courses" | "news" | "courseDetail" | "feedback";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>("home");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  
  const [courses, setCourses] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"user"|"course"|"news"|"lesson"|null>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  // Stats State
  const [gpaData, setGpaData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([
    { label: "Tổng người dùng", value: "0", icon: Users, color: "orange" },
    { label: "Khóa học", value: "0", icon: BookOpen, color: "blue" },
    { label: "Tin tức", value: "0", icon: Newspaper, color: "green" },
    { label: "Bài giảng", value: "0", icon: BookOpen, color: "purple" },
  ]);

  useEffect(() => {
    fetchCourses();
    fetchNews();
    fetchUsers();

    // Lần đầu tải stats
    fetchOverviewStats();
    fetchGpaDistribution();
    fetchRecentActivities();

    // Auto-refresh stats mỗi 5s
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
        { label: "Tổng người dùng", value: res.data.totalUsers.toString(), icon: Users, color: "orange" },
        { label: "Khóa học", value: res.data.totalCourses.toString(), icon: BookOpen, color: "blue" },
        { label: "Tin tức", value: res.data.totalNews.toString(), icon: Newspaper, color: "green" },
        { label: "Bài giảng", value: res.data.totalLessons.toString(), icon: BookOpen, color: "purple" },
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
      setFormData({ ...item });
    } else {
      if (type === "user") setFormData({ role: 2 }); // STUDENT default
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
        if (editItem) await adminApi.updateUser(editItem.id, { fullName: formData.fullName, role: parseInt(formData.role) });
        else await adminApi.createUser({ ...formData, role: parseInt(formData.role) });
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

  const [users, setUsers] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  const renderCourseDetail = (course: any) => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => setActiveSection("courses")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Danh sách bài học</h3>
              <button onClick={() => handleOpenModal("lesson")} className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium bg-orange-50 px-3 py-1.5 rounded-lg">
                <Plus className="w-4 h-4" /> Thêm bài giảng
              </button>
            </div>
            <div className="space-y-4">
              {lessons.length === 0 ? (
                <p className="text-sm text-gray-500 italic p-4">Chưa có bài giảng nào.</p>
              ) : (
                lessons.map((lesson, index) => (
                  <div key={lesson.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-sm font-bold">{index + 1}</div>
                      <div>
                        <span className="font-medium text-gray-900 block">{lesson.title}</span>
                        <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">Video</a>
                        {" | "}
                        <a href={lesson.pdfUrl} target="_blank" rel="noreferrer" className="text-xs text-red-500 hover:underline">PDF</a>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenModal("lesson", lesson)} className="p-2 text-gray-400 hover:text-orange-600"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Chi tiết khóa học</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between"><span>Giáo viên tạo:</span> <span className="font-medium text-gray-900">{course.creatorName || "N/A"}</span></div>
              <div className="flex justify-between"><span>Sĩ số (Mock):</span> <span className="font-medium text-gray-900">0</span></div>
              <div className="flex justify-between"><span>Trạng thái:</span> <span className="text-green-600 font-bold">Active</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero banner */}
      <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-amber-400 rounded-3xl p-8 text-white overflow-hidden shadow-[0_20px_60px_rgba(249,115,22,0.3)]">
        <img
          src="/assets/dna.gif"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute", left: "50%", top: "50%",
            translate: "-50% -50%", width: "640px",
            transform: "rotate(-60deg)", opacity: 0.11,
            filter: "blur(0.5px) saturate(0.7)",
            pointerEvents: "none", userSelect: "none",
          }}
        />
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full filter blur-[60px]" />
          <div className="absolute bottom-0 left-1/4 w-36 h-36 bg-yellow-300 rounded-full filter blur-[50px]" />
        </div>
        <div className="relative">
          <p className="text-orange-200 text-sm font-bold uppercase tracking-widest mb-1">Bảng điều khiển</p>
          <h2 className="text-3xl font-black drop-shadow-sm">Tổng quan hệ thống 🛡️</h2>
          <p className="text-orange-100 mt-2 font-medium">Quản lý toàn bộ nền tảng EduSmart — người dùng, khóa học, tin tức.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-orange-50 text-orange-600`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GPA Chart */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Phân bố GPA Sinh viên</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gpaData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="count" fill="#ea580c" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions / Recent activity */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-[380px] overflow-y-auto custom-scrollbar">
          <h2 className="text-xl font-bold text-gray-900 mb-6 sticky top-0 bg-white z-10 pb-2">Hoạt động gần đây</h2>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-gray-500 italic p-4 text-center">Chưa có hoạt động nào.</p>
            ) : (
              recentActivities.map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.type === 'Tin tức' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                    {activity.type === 'Tin tức' ? <Newspaper className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString("vi-VN")} • {activity.action} bởi <span className="font-semibold">{activity.by}</span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">Danh sách người dùng</h2>
          <button onClick={() => handleOpenModal("user")} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
            <Plus className="w-4 h-4" /> Thêm người dùng
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Họ và tên</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Vai trò</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Ngày tạo</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.role === "TEACHER" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      {user.role === "TEACHER" ? "Giáo viên" : "Học sinh"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal("user", user)} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 cursor-pointer" onClick={() => { setSelectedCourse(course); setActiveSection("courseDetail"); }}>
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                Active
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 cursor-pointer hover:text-orange-600 transition-colors" onClick={() => { setSelectedCourse(course); fetchLessons(course.id); setActiveSection("courseDetail"); }}>{course.title}</h3>
            <p className="text-sm text-gray-500 mb-4 truncate">{course.description || "Chưa có mô tả"}</p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>Người tạo: {course.creatorName || "Admin"}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal("course", course)} className="p-2 text-gray-400 hover:text-orange-600"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDeleteCourse(course.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                <button 
                  onClick={() => { setSelectedCourse(course); fetchLessons(course.id); setActiveSection("courseDetail"); }}
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700 ml-2"
                >
                  Chi tiết
                </button>
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => handleOpenModal("course")} className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-all group">
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-2 group-hover:bg-orange-50 transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-medium">Tạo khóa học mới</span>
        </button>
      </div>
    </div>
  );

  const renderNews = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Quản lý tin tức</h2>
          <button onClick={() => handleOpenModal("news")} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
            <Plus className="w-4 h-4" /> Viết bài mới
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {news.map((item) => (
            <div key={item.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                  <Newspaper className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">Người đăng: {item.authorName || "Admin"} • {new Date(item.createdAt).toLocaleDateString("vi-VN")}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal("news", item)} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteNews(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Phản hồi từ học sinh</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {feedbacks.map((item) => (
            <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold shrink-0">
                  {item.student.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900">{item.student}</h4>
                    <span className="text-xs text-gray-500">{item.date}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">"{item.content}"</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase">Khóa học: {item.course}</span>
                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-[10px] font-bold uppercase">Giáo viên: {item.teacher}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const menuItems = [
    { id: "home", label: "Trang chủ", icon: HomeIcon },
    { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { id: "users", label: "Người dùng", icon: Users },
    { id: "courses", label: "Khóa học", icon: BookOpen },
    { id: "news", label: "Tin tức", icon: Newspaper },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col sticky top-16 h-[calc(100vh-4rem)]">
        <div className="p-6 overflow-y-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quản trị viên</p>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => {
                    setActiveSection(item.id as AdminSection);
                    if (item.id !== "courses") setSelectedCourse(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    (activeSection === item.id || (item.id === "courses" && activeSection === "courseDetail"))
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-200" 
                      : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
                
                {/* Sub-menu for courses */}
                {item.id === "courses" && (activeSection === "courses" || activeSection === "courseDetail") && (
                  <div className="mt-2 ml-4 space-y-1 animate-in slide-in-from-top-2 duration-300">
                    {courses.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => {
                          setSelectedCourse(course);
                          fetchLessons(course.id);
                          setActiveSection("courseDetail");
                        }}
                        className={`w-full text-left px-4 py-2 text-xs rounded-lg transition-colors ${
                          selectedCourse?.id === course.id && activeSection === "courseDetail"
                            ? "bg-orange-100 text-orange-700 font-bold"
                            : "text-gray-500 hover:bg-gray-50 hover:text-orange-600"
                        }`}
                      >
                        {course.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeSection === "courseDetail" ? "Chi tiết khóa học" : menuItems.find(i => i.id === activeSection)?.label}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {activeSection === "courseDetail" 
                  ? `Đang xem: ${selectedCourse?.title}`
                  : "Chào mừng trở lại, Admin! Hệ thống đang hoạt động ổn định."
                }
              </p>
            </div>
          </div>

          {activeSection === "home" && <HomeView onNavigate={setActiveSection} />}
          {activeSection === "dashboard" && renderDashboard()}
          {activeSection === "users" && renderUsers()}
          {activeSection === "courses" && renderCourses()}
          {activeSection === "news" && renderNews()}
          {activeSection === "feedback" && renderFeedback()}
          {activeSection === "courseDetail" && renderCourseDetail(selectedCourse)}
        </div>
      </main>

      {/* Reusable Modal for CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editItem ? "Cập nhật " : "Tạo mới "}
              {modalType === "user" && "Người dùng"}
              {modalType === "course" && "Khóa học"}
              {modalType === "news" && "Tin tức"}
              {modalType === "lesson" && "Bài giảng"}
            </h2>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              {/* USER FORM */}
              {modalType === "user" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Họ và tên</label>
                    <input type="text" required value={formData.fullName || ""} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                  {!editItem && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input type="email" required value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
                        <input type="password" required minLength={6} value={formData.password || ""} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Vai trò</label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
                      <option value={0}>Admin</option>
                      <option value={1}>Giáo viên</option>
                      <option value={2}>Học sinh</option>
                    </select>
                  </div>
                </>
              )}

              {/* COURSE FORM */}
              {modalType === "course" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tên khóa học</label>
                    <input type="text" required value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Mô tả (hỗ trợ ảnh, link, định dạng văn bản)</label>
                    <RichTextEditor
                      value={formData.description || ""}
                      onChange={(html) => setFormData({...formData, description: html})}
                      placeholder="Nhập mô tả khóa học..."
                    />
                  </div>
                </>
              )}

              {/* NEWS FORM */}
              {modalType === "news" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tiêu đề</label>
                    <input type="text" required value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nội dung (hỗ trợ ảnh, link Google Drive, định dạng văn bản)</label>
                    <RichTextEditor
                      value={formData.content || ""}
                      onChange={(html) => setFormData({...formData, content: html})}
                      placeholder="Nhập nội dung bài viết..."
                    />
                  </div>
                </>
              )}

              {/* LESSON FORM */}
              {modalType === "lesson" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tên bài giảng</label>
                    <input type="text" required value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Mô tả</label>
                    <input type="text" required value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Link Video</label>
                    <input type="url" required value={formData.videoUrl || ""} onChange={e => setFormData({...formData, videoUrl: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Link PDF</label>
                    <input type="url" required value={formData.pdfUrl || ""} onChange={e => setFormData({...formData, pdfUrl: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                  Hủy
                </button>
                <button type="submit" className="flex-1 px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm shadow-orange-200">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
