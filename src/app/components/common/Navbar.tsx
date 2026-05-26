import { useEffect, useMemo, useState, useCallback } from "react";
import type { ReactNode } from "react";
import {
  Bell,
  BookOpen,
  ChevronDown,
  GraduationCap,
  LogOut,
  Menu,
  Search,
  UserRound,
  Check,
  Play,
  FileText,
  Sparkles,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { jwtDecode } from "jwt-decode";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { publicApi } from "../../api/publicApi";
import { resolveMediaUrl } from "../../utils/media";
import { toast } from "sonner";
import { notificationApi } from "../../api/notificationApi";
import type { NotificationDto } from "../../api/notificationApi";
import { useSse } from "../../api/sseClient";
import UserProfileModal from "./UserProfileModal";

interface User {
  unique_name?: string;
  name?: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
  AvatarUrl?: string;
  [key: string]: unknown;
}

interface Notification {
  id: number;
  title: string;
  time: string;
  unread: boolean;
  type: "info" | "success" | "warning";
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
}

interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchCourses, setSearchCourses] = useState<SearchCourse[]>([]);
  const [searchTeachers, setSearchTeachers] = useState<SearchTeacher[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleProfileUpdated = (updatedUser: any) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        name: updatedUser.fullName,
        unique_name: updatedUser.fullName,
        avatarUrl: updatedUser.avatarUrl,
        AvatarUrl: updatedUser.avatarUrl,
      };
    });
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationApi.getNotifications(50);
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      setUnreadCount(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token exists:", !!token);
    if (!token) {
      setIsLoggedIn(false);
      setUser(null);
      return;
    }

    try {
      const decoded = jwtDecode<User>(token);
      console.log("Decoded user:", decoded);
      console.log("User keys:", Object.keys(decoded));
      setUser(decoded);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Token decoding failed", error);
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setUser(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isLoggedIn, fetchNotifications, fetchUnreadCount]);

  const getUserRole = useCallback(() => {
    if (!user) return "";
    return (
      user.role ||
      (user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] as string) ||
      "STUDENT"
    );
  }, [user]);

  const handleSseNotificationEvent = useCallback((eventName: string, data: any) => {
    if (eventName === "notification-received") {
      toast.info(data.title || "Bạn có thông báo mới!", {
        description: data.message,
        action: data.relatedId ? {
          label: "Xem chi tiết",
          onClick: () => navigate(`/course/${data.relatedId}`)
        } : undefined
      });
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [fetchNotifications, fetchUnreadCount, navigate]);

  const sseChannel = useMemo(() => {
    if (!isLoggedIn || !user) return null;
    const role = getUserRole();
    if (role === "ADMIN") return "admin";
    if (role === "TEACHER") return "teacher";
    return "student";
  }, [isLoggedIn, user, getUserRole]);

  useSse(sseChannel, handleSseNotificationEvent);

  const handleNotificationClick = async (n: NotificationDto) => {
    if (!n.isRead) {
      try {
        await notificationApi.markRead(n.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark notification as read", err);
      }
    }

    if (n.relatedId) {
      navigate(`/course/${n.relatedId}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
      toast.success("Đã đánh dấu đọc tất cả thông báo");
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const formatTimeElapsed = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const getNotificationIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "COURSE":
        return <BookOpen className="h-4 w-4 text-[#FF6B00]" />;
      case "ENROLLMENT":
        return <UserRound className="h-4 w-4 text-emerald-600" />;
      case "LESSON":
        return <Play className="h-4 w-4 text-blue-600" />;
      case "QUIZ":
        return <FileText className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-[#FF6B00]" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type.toUpperCase()) {
      case "COURSE":
        return "bg-[#FFF4EC]";
      case "ENROLLMENT":
        return "bg-emerald-50";
      case "LESSON":
        return "bg-blue-50";
      case "QUIZ":
        return "bg-purple-50";
      default:
        return "bg-[#FFF4EC]";
    }
  };

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

  const getUserDisplayName = () => {
    if (!user) return "";
    return (
      user.name ||
      (user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] as string) ||
      user.unique_name ||
      user.email?.split("@")[0] ||
      (user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] as string)?.split("@")[0] ||
      "Người dùng"
    );
  };

  const getUserRoleLabel = () => {
    if (!user) return "";
    const role = user.role || user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "STUDENT";
    if (role === "ADMIN") return "Quản trị viên";
    if (role === "TEACHER") return "Giảng viên";
    return "Học viên";
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "ES";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const searchMatches = useMemo(() => {
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
  }, [searchCourses, searchTeachers, searchTerm]);

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

    const firstCourse = searchMatches.courses[0];
    if (firstCourse) {
      setSearchOpen(false);
      setSearchTerm("");
      navigate(`/course/${firstCourse.id}`);
      return;
    }

    setSearchOpen(false);
    navigate(`/courses?search=${encodeURIComponent(keyword)}`);
  };

  const isHomePage = location.pathname === "/";
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
              GenZ<span className="text-[#ff4f12]">Bio</span>
            </span>
          </Link>

          <div className="hidden flex-1 items-center justify-center gap-9 xl:flex">
            {publicNavItems.map((item) => {
              const active = isPublicNavActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative py-7 text-base font-black transition-colors ${active ? "text-[#ff4f12]" : "text-slate-500 hover:text-[#101828]"
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
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/95 px-6 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-6">
        <div className="flex flex-1 items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="rounded-md p-2 text-[#667085] transition-all hover:bg-[#F8F9FB]"
            aria-label="Thu gọn menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {!isHomePage && (
            <div className="relative hidden w-full max-w-[460px] lg:block">
              <form onSubmit={handleSearch} className="relative group">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3] transition-colors group-focus-within:text-[#FF6B00]" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => window.setTimeout(() => setSearchOpen(false), 160)}
                  placeholder="Tìm khóa học, giảng viên..."
                  className="h-[38px] w-full rounded-md border-none bg-[#F8F9FB] pl-10 pr-4 text-xs font-medium text-[#0F172A] outline-none transition-all placeholder:text-[#98A2B3] focus:ring-4 focus:ring-orange-500/5"
                />
              </form>

              {searchOpen && hasSearchTerm && (
                <div className="absolute left-0 top-[46px] z-[70] w-full overflow-hidden rounded-2xl border border-[#ECEEF2] bg-white shadow-2xl">
                  <div className="max-h-[420px] overflow-y-auto p-2">
                    {isSearchLoading ? (
                      <div className="px-4 py-5 text-center text-xs font-bold text-[#98A2B3]">Đang tải dữ liệu tìm kiếm...</div>
                    ) : hasSearchResults ? (
                      <>
                        {searchMatches.courses.length > 0 && (
                          <SearchGroup title="Khóa học">
                            {searchMatches.courses.map((course) => (
                              <SearchResultButton
                                key={`course-${course.id}`}
                                icon={<BookOpen className="h-4 w-4" />}
                                iconClassName="bg-orange-50 text-[#FF6B00]"
                                title={course.title}
                                subtitle={course.teacherName || course.creatorName || "GenZBio"}
                                onClick={() => {
                                  setSearchOpen(false);
                                  setSearchTerm("");
                                  navigate(`/course/${course.id}`);
                                }}
                              />
                            ))}
                          </SearchGroup>
                        )}

                        {searchMatches.teachers.length > 0 && (
                          <SearchGroup title="Giảng viên">
                            {searchMatches.teachers.map((teacher) => (
                              <SearchResultButton
                                key={`teacher-${teacher.id}`}
                                icon={
                                  teacher.avatarUrl ? (
                                    <img src={resolveMediaUrl(teacher.avatarUrl)} alt={teacher.fullName} className="h-full w-full object-cover" />
                                  ) : (
                                    <UserRound className="h-4 w-4" />
                                  )
                                }
                                iconClassName="overflow-hidden bg-blue-50 text-blue-600"
                                title={teacher.fullName}
                                subtitle={teacher.email}
                                onClick={() => {
                                  setSearchOpen(false);
                                  setSearchTerm("");
                                  navigate(`/teachers?search=${encodeURIComponent(teacher.fullName)}`);
                                }}
                              />
                            ))}
                          </SearchGroup>
                        )}
                      </>
                    ) : (
                      <div className="px-4 py-5 text-center text-xs font-bold text-[#98A2B3]">Không tìm thấy khóa học hoặc giảng viên.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative flex h-9 w-9 items-center justify-center rounded-md bg-[#F8F9FB] text-[#667085] transition-all hover:text-[#FF6B00]">
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-3.5 w-3.5 translate-x-1/4 -translate-y-1/4 items-center justify-center rounded-full border-2 border-white bg-[#FF6B00] text-[8px] font-black text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 overflow-hidden rounded-[24px] border-[#ECEEF2] p-0 shadow-2xl bg-white/95 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-[#ECEEF2] bg-[#F8F9FB] px-5 py-4">
                <span className="text-sm font-black text-[#0F172A]">Thông báo</span>
                {unreadCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAllRead();
                    }}
                    className="text-[11px] font-bold text-[#FF6B00] hover:text-[#ea460d] transition-colors"
                  >
                    Đánh dấu đã đọc tất cả
                  </button>
                )}
              </div>
              <div className="max-h-[420px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`cursor-pointer border-b border-[#ECEEF2] px-5 py-4 transition-colors last:border-0 focus:bg-[#F8F9FB] flex items-start gap-4 ${
                        !n.isRead ? "bg-orange-50/20 hover:bg-orange-50/30" : "bg-white"
                      }`}
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getNotificationBg(n.type)}`}>
                        {getNotificationIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug text-[#0F172A] ${!n.isRead ? "font-black" : "font-semibold"}`}>
                          {n.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2 font-medium leading-relaxed">
                          {n.message}
                        </p>
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">
                          {formatTimeElapsed(n.createdAt)}
                        </p>
                      </div>
                      {!n.isRead && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#FF6B00] mt-1.5 self-start" />
                      )}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                      <Bell className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-xs font-bold text-[#98A2B3]">Bạn chưa có thông báo nào.</p>
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex items-center gap-3 rounded-md py-1.5 pl-2 pr-3 outline-none transition-all hover:bg-[#F8F9FB]">
                <Avatar className="h-8 w-8 overflow-hidden rounded-md border border-border">
                  <AvatarImage src={resolveMediaUrl(user?.AvatarUrl || user?.avatarUrl)} className="object-cover" />
                  <AvatarFallback className="bg-[#FFF4EC] text-[10px] font-bold text-[#FF6B00]">
                    {getInitials(getUserDisplayName())}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start text-left leading-none lg:flex">
                  <span className="text-sm font-bold text-[#0F172A] transition-colors group-hover:text-[#FF6B00]">{getUserDisplayName()}</span>
                  <span className="mt-1.5 text-[11px] font-bold uppercase tracking-wider text-[#98A2B3]">{getUserRoleLabel()}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-[#98A2B3] transition-all group-hover:text-[#0F172A]" />
              </button>
            </DropdownMenuTrigger>
             <DropdownMenuContent align="end" className="w-56 rounded-[20px] border-[#ECEEF2] bg-white p-2 shadow-2xl">
              <DropdownMenuLabel className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#98A2B3]">Tài khoản</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#ECEEF2]" />
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-3 rounded-[14px] px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                onClick={() => setIsProfileOpen(true)}
              >
                <UserRound className="h-5 w-5 text-[#FF6B00]" /> Giới thiệu
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-3 rounded-[14px] px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 mt-1"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" /> Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* User Profile Edit & View Popup Modal */}
      <UserProfileModal 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />
    </nav>
  );
}

function SearchGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="py-1">
      <div className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-[#98A2B3]">{title}</div>
      {children}
    </div>
  );
}

function SearchResultButton({
  icon,
  iconClassName,
  title,
  subtitle,
  onClick,
}: {
  icon: ReactNode;
  iconClassName: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[#F8F9FB]"
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-black text-[#0F172A]">{title}</span>
        <span className="mt-1 block truncate text-xs font-semibold text-[#667085]">{subtitle}</span>
      </span>
    </button>
  );
}
