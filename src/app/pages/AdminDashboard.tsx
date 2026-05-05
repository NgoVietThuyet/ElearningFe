import { useState } from "react";
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

type AdminSection = "home" | "dashboard" | "users" | "courses" | "news" | "courseDetail" | "feedback";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>("home");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  // Mock Data
  const stats = [
    { label: "Tổng người dùng", value: "2,547", icon: Users, color: "orange" },
    { label: "Khóa học", value: "48", icon: BookOpen, color: "blue" },
    { label: "Tin tức", value: "124", icon: Newspaper, color: "green" },
    { label: "Truy cập ngày", value: "1,234", icon: BarChart3, color: "purple" },
  ];

  const users = [
    { id: 1, name: "Nguyễn Văn A", email: "student1@test.com", role: "STUDENT", date: "2024-03-20" },
    { id: 2, name: "Trần Thị B", email: "teacher1@test.com", role: "TEACHER", date: "2024-03-19" },
    { id: 3, name: "Lê Văn C", email: "student2@test.com", role: "STUDENT", date: "2024-03-18" },
    { id: 4, name: "Phạm Thị D", email: "teacher2@test.com", role: "TEACHER", date: "2024-03-17" },
  ];

  const courses = [
    { id: 1, title: "Sinh học đại cương", teacher: "Trần Thị B", students: 120, status: "Active" },
    { id: 2, title: "Di truyền học", teacher: "Phạm Thị D", students: 85, status: "Active" },
  ];

  const news = [
    { id: 1, title: "Cuộc thi sáng tạo khoa học 2024", author: "Admin", date: "2024-05-01" },
    { id: 2, title: "Cập nhật tài liệu chương 3", author: "Admin", date: "2024-04-28" },
  ];

  const feedbacks = [
    { id: 1, student: "Nguyễn Văn A", course: "Sinh học tế bào", teacher: "Trần Thị B", content: "Khóa học rất hay, hình ảnh minh họa sinh động.", date: "2024-05-01" },
    { id: 2, student: "Lê Văn C", course: "Di truyền học", teacher: "Phạm Thị D", content: "Giảng viên giải thích rất kỹ các khái niệm khó.", date: "2024-04-29" },
    { id: 3, student: "Trần Thị B", course: "Vi sinh vật", teacher: "Trần Thị B", content: "Nội dung phong phú nhưng hơi nhanh.", date: "2024-04-28" },
  ];

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
            <h3 className="text-lg font-bold text-gray-900 mb-4">Danh sách bài học</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-sm font-bold">{i}</div>
                    <span className="font-medium text-gray-900">Bài giảng {i}: Nội dung cơ bản</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-orange-600"><Edit className="w-4 h-4" /></button>
                    <button className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Chi tiết khóa học</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between"><span>Giáo viên:</span> <span className="font-medium text-gray-900">{course.teacher}</span></div>
              <div className="flex justify-between"><span>Sĩ số:</span> <span className="font-medium text-gray-900">{course.students}</span></div>
              <div className="flex justify-between"><span>Trạng thái:</span> <span className="text-green-600 font-bold">{course.status}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
        {/* Create User Form */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Tạo mới người dùng</h2>
          </div>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Đã tạo người dùng thành công!"); }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Họ và tên</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Nguyễn Văn A" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Vai trò</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
                  <option value="STUDENT">Học sinh</option>
                  <option value="TEACHER">Giáo viên</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input type="email" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="email@example.com" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
              <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" required />
            </div>
            <button type="submit" className="w-full bg-orange-600 text-white py-2.5 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-sm shadow-orange-200">
              Tạo tài khoản
            </button>
          </form>
        </div>

        {/* Quick Actions / Recent activity */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Hoạt động gần đây</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Người dùng mới vừa tham gia</p>
                  <p className="text-xs text-gray-500">2 giờ trước • student@test.com</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
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
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none w-full md:w-64 text-sm"
            />
          </div>
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
                      <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
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
                {course.status}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 cursor-pointer hover:text-orange-600 transition-colors" onClick={() => { setSelectedCourse(course); setActiveSection("courseDetail"); }}>{course.title}</h3>
            <p className="text-sm text-gray-500 mb-4">Giáo viên: {course.teacher}</p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{course.students} học sinh</span>
              </div>
              <button 
                onClick={() => { setSelectedCourse(course); setActiveSection("courseDetail"); }}
                className="text-sm font-semibold text-orange-600 hover:text-orange-700"
              >
                Chi tiết
              </button>
            </div>
          </div>
        ))}
        <button className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-all group">
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
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
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
                  <p className="text-xs text-gray-500 mt-1">Người đăng: {item.author} • {item.date}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
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

          {activeSection === "home" && <HomeView />}
          {activeSection === "dashboard" && renderDashboard()}
          {activeSection === "users" && renderUsers()}
          {activeSection === "courses" && renderCourses()}
          {activeSection === "news" && renderNews()}
          {activeSection === "feedback" && renderFeedback()}
          {activeSection === "courseDetail" && renderCourseDetail(selectedCourse)}
        </div>
      </main>
    </div>
  );
}
