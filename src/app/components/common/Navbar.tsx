import { useState, useEffect } from "react";
import { 
  Search, 
  Bell, 
  Menu, 
  LogOut, 
  ChevronDown,
  BookOpen,
  GraduationCap,
  UserRound,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar";
import { jwtDecode } from "jwt-decode";
import { publicApi } from "../../api/publicApi";

interface User {
  unique_name?: string;
  name?: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
  [key: string]: any;
}

interface Notification {
  id: number;
  title: string;
  time: string;
  unread: boolean;
  type: 'info' | 'success' | 'warning';
}

interface SearchCourse {
  id: number;
  title: string;
  description?: string | null;
  teacherName?: string | null;
  creatorName?: string | null;
}

interface SearchTeacher {
  id: number;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  lessonCount?: number;
}

interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchCourses, setSearchCourses] = useState<SearchCourse[]>([]);
  const [searchTeachers, setSearchTeachers] = useState<SearchTeacher[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<User>(token);
        setUser(decoded);
        setIsLoggedIn(true);
        setNotifications([]);
      } catch (error) {
        console.error("Token decoding failed", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    let mounted = true;
    const loadSearchData = async () => {
      setIsSearchLoading(true);
      try {
        const [coursesRes, teachersRes] = await Promise.all([
          publicApi.getCourses(),
          publicApi.getTeachers(),
        ]);

        if (!mounted) return;
        setSearchCourses(coursesRes.data || []);
        setSearchTeachers(teachersRes.data || []);
      } catch (error) {
        console.error("Failed to load navbar search data", error);
      } finally {
        if (mounted) setIsSearchLoading(false);
      }
    };

    loadSearchData();

    return () => {
      mounted = false;
    };
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const keyword = searchTerm.trim();
    if (!keyword) return;

    const firstCourse = getSearchMatches().courses[0];
    if (firstCourse) {
      setSearchOpen(false);
      navigate(`/course/${firstCourse.id}`);
      return;
    }

    setSearchOpen(false);
    navigate(`/courses?search=${encodeURIComponent(keyword)}`);
  };

  const getSearchMatches = () => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return { courses: [] as SearchCourse[], teachers: [] as SearchTeacher[] };

    const courses = searchCourses
      .filter((course) =>
        `${course.title} ${course.description || ""} ${course.teacherName || ""} ${course.creatorName || ""}`
          .toLowerCase()
          .includes(keyword),
      )
      .slice(0, 5);

    const teachers = searchTeachers
      .filter((teacher) => `${teacher.fullName} ${teacher.email}`.toLowerCase().includes(keyword))
      .slice(0, 5);

    return { courses, teachers };
  };

  const getUserDisplayName = () => {
    if (!user) return "";
    const name = user.unique_name || user.name || user.email?.split("@")[0] || "Người dùng";
    return name;
  };

  const getUserRoleLabel = () => {
    if (!user) return "";
    const role = user.role || user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "STUDENT";
    if (role === "ADMIN") return "Quản trị viên";
    if (role === "TEACHER") return "Giảng viên";
    return "Học viên";
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const unreadCount = notifications.filter(n => n.unread).length;
  const isHomePage = location.pathname === "/";
  const searchMatches = getSearchMatches();
  const hasSearchTerm = searchTerm.trim().length > 0;
  const hasSearchResults = searchMatches.courses.length > 0 || searchMatches.teachers.length > 0;
  const publicNavItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Khóa học", path: "/courses" },
    { label: "Giảng viên", path: "/teachers" },
    { label: "Tin tức", path: "/news" },
    { label: "Feedback", path: "/feedback" },
    { label: "Về chúng tôi", path: "/about" },
  ];

  const isPublicNavActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  if (!isLoggedIn) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 px-6 backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-[1500px] items-center justify-between gap-8">
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff4f12] text-white shadow-lg shadow-orange-500/25">
              <GraduationCap className="h-6 w-6" />
            </span>
            <span className="border-l border-slate-900/70 pl-3 text-[28px] font-black tracking-tight text-[#101828]">
              Edu<span className="text-[#ff4f12]">Smart</span>
            </span>
          </Link>

          <div className="hidden flex-1 items-center justify-center gap-9 xl:flex">
            {publicNavItems.map((item) => {
              const active = isPublicNavActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative py-7 text-base font-black transition-colors ${
                    active ? "text-[#ff4f12]" : "text-slate-500 hover:text-[#101828]"
                  }`}
                >
                  {item.label}
                  {active && <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[#ff4f12]" />}
                </Link>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-5">
            {!isHomePage && (
            <Link to="/courses" className="relative hidden lg:block">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <span className="flex h-14 w-[280px] items-center rounded-2xl border border-slate-200 bg-white pl-14 pr-5 text-base font-semibold text-slate-400">
                Tìm kiếm khóa học...
              </span>
            </Link>
            )}
            <Link to="/login" className="rounded-2xl bg-[#ff4f12] px-8 py-4 text-base font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-[#ea460d]">
              Đăng nhập
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 border-border backdrop-blur-md px-6">
      <div className="flex h-16 items-center justify-between gap-6">
        
        {/* Left: Sidebar Toggle & Search */}
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={onToggleSidebar}
            className="p-2 rounded-md hover:bg-[#F8F9FB] text-[#667085] transition-all"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search Bar */}
          {!isHomePage && (
          <div className="hidden lg:block w-full max-w-[400px] relative">
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#98A2B3] group-focus-within:text-[#FF6B00] transition-colors" />
              <input
                type="search"
                placeholder="Tìm kiếm..."
                className="w-full h-[38px] pl-10 pr-4 rounded-md bg-[#F8F9FB] border-none text-xs font-medium text-[#0F172A] outline-none transition-all focus:ring-4 focus:ring-orange-500/5 placeholder:text-[#98A2B3]"
              />
            </form>
          </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-5">
          
          {/* Notifications */}
          {isLoggedIn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="relative h-9 w-9 flex items-center justify-center rounded-md bg-[#F8F9FB] text-[#667085] hover:text-[#FF6B00] transition-all"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full bg-[#FF6B00] text-[8px] font-black text-white flex items-center justify-center border-2 border-white translate-x-1/4 -translate-y-1/4">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0 rounded-[24px] shadow-2xl border-[#ECEEF2] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 bg-[#F8F9FB] border-b border-[#ECEEF2] flex items-center justify-between">
                  <span className="font-bold text-[#0F172A] text-sm">Thông báo</span>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <DropdownMenuItem key={n.id} className="p-4 cursor-pointer focus:bg-[#F8F9FB] transition-colors border-b border-[#ECEEF2] last:border-0">
                        <div className="flex gap-4">
                          <div className="h-10 w-10 rounded-xl bg-[#FFF4EC] flex items-center justify-center shrink-0 text-[#FF6B00]">
                            <Bell className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#0F172A] leading-tight mb-1">{n.title}</p>
                            <p className="text-[11px] font-medium text-[#98A2B3] uppercase tracking-wider">{n.time}</p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs font-bold text-[#98A2B3]">
                      Chưa có thông báo.
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Profile */}
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-md hover:bg-[#F8F9FB] transition-all outline-none group">
                  <Avatar className="h-8 w-8 rounded-md border border-border overflow-hidden">
                    <AvatarImage src={user?.avatarUrl} className="object-cover" />
                    <AvatarFallback className="bg-[#FFF4EC] text-[#FF6B00] font-bold text-[10px]">
                      {getInitials(getUserDisplayName())}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:flex flex-col items-start text-left leading-none">
                    <span className="text-sm font-bold text-[#0F172A] group-hover:text-[#FF6B00] transition-colors">
                      {getUserDisplayName()}
                    </span>
                    <span className="text-[11px] font-bold text-[#98A2B3] mt-1.5 uppercase tracking-wider">
                      {getUserRoleLabel()}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-[#98A2B3] group-hover:text-[#0F172A] transition-all" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-[20px] shadow-2xl bg-white border-[#ECEEF2]">
                <DropdownMenuLabel className="px-4 py-3 text-[11px] font-bold text-[#98A2B3] uppercase tracking-wider">Tài khoản</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#ECEEF2]" />
                <DropdownMenuItem 
                  className="rounded-[14px] py-3 px-4 cursor-pointer text-red-500 hover:bg-red-50 font-bold text-sm flex items-center gap-3"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
