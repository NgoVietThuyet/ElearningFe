import { useState, useEffect } from "react";
import { 
  Search, 
  Bell, 
  Menu, 
  LogOut, 
  ChevronDown,
  BookOpen,
  LayoutDashboard,
  Calendar,
  MessageSquare
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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

interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<User>(token);
        setUser(decoded);
        setIsLoggedIn(true);
        
        // Mock notifications based on role
        const role = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "STUDENT";
        if (role === "ADMIN") {
          setNotifications([
            { id: 1, title: "Khóa học mới được tạo", time: "5 phút trước", unread: true, type: 'success' },
            { id: 2, title: "Giảng viên mới đăng ký", time: "1 giờ trước", unread: true, type: 'info' },
          ]);
        } else if (role === "TEACHER") {
          setNotifications([
            { id: 1, title: "Học sinh mới tham gia lớp", time: "10 phút trước", unread: true, type: 'info' },
            { id: 2, title: "Bài ôn tập đã được duyệt", time: "2 giờ trước", unread: false, type: 'success' },
          ]);
        } else {
          setNotifications([
            { id: 1, title: "Giảng viên đăng bài giảng mới", time: "15 phút trước", unread: true, type: 'info' },
            { id: 2, title: "Bạn được thêm vào khóa học mới", time: "3 giờ trước", unread: true, type: 'success' },
          ]);
        }
      } catch (error) {
        console.error("Token decoding failed", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <nav className="sticky top-0 z-50 w-full border-b transition-colors duration-300 bg-white/80 border-gray-100 backdrop-blur-md px-6">
      <div className="flex h-20 items-center justify-between gap-8">
        
        {/* Left: Sidebar Toggle */}
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleSidebar}
            className="rounded-2xl transition-all duration-300 hover:bg-gray-100 text-gray-500"
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Search Bar */}
          <div className="hidden lg:block w-96 relative">
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors text-gray-400 group-focus-within:text-orange-500" />
              <Input
                type="search"
                placeholder="Tìm khóa học, giáo viên, tin tức..."
                className="pl-12 pr-16 h-12 rounded-2xl transition-all font-medium text-sm bg-gray-50 border-gray-100 text-gray-900 focus-visible:ring-orange-400"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-100 px-1.5 py-0.5 rounded-lg shadow-sm">Ctrl K</span>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-12 w-12 rounded-2xl transition-all duration-300 hover:bg-orange-50 text-gray-500 hover:text-orange-600"
              >
                <Bell className="h-5.5 w-5.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 h-4.5 w-4.5 rounded-full bg-orange-600 text-[10px] font-black text-white flex items-center justify-center border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 rounded-3xl shadow-2xl border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <span className="font-black text-gray-900 text-sm">Thông báo</span>
                <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg uppercase tracking-widest">Mới nhất</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-gray-400">
                    <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-xs font-bold italic">Chưa có thông báo nào</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <DropdownMenuItem key={n.id} className="p-4 cursor-pointer focus:bg-orange-50/50 transition-colors border-b border-gray-50 last:border-0">
                      <div className="flex gap-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                          n.type === 'success' ? 'bg-green-50 text-green-600' : 
                          n.type === 'warning' ? 'bg-amber-50 text-amber-600' : 
                          'bg-blue-50 text-blue-600'
                        }`}>
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 leading-tight mb-1">{n.title}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{n.time}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              <div className="p-3 bg-gray-50/50 border-t border-gray-100 text-center">
                <button className="text-[10px] font-black text-orange-600 hover:underline uppercase tracking-widest">Xem tất cả thông báo</button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-14 gap-4 rounded-2xl px-2 transition-all flex items-center border border-transparent hover:bg-gray-50 hover:border-gray-100">
                  <Avatar className="h-10 w-10 border-2 shadow-sm ring-2 border-white ring-orange-50">
                    <AvatarImage src={user?.avatarUrl} alt={getUserDisplayName()} />
                    <AvatarFallback className="bg-orange-100 text-orange-700 font-black text-xs uppercase tracking-tighter">
                      {getInitials(getUserDisplayName())}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:flex flex-col items-start text-left leading-tight">
                    <span className="text-sm font-black truncate max-w-[120px] text-gray-900">
                      {getUserDisplayName()}
                    </span>
                    <span className="text-[10px] font-black text-gray-400 mt-0.5">
                      {getUserRoleLabel()}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 hidden lg:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 bg-white border-gray-100">
                <DropdownMenuLabel className="font-black text-gray-400 px-4 py-3 text-[10px] uppercase tracking-[0.2em]">Tài khoản</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-50" />
                <div className="p-2">
                  <DropdownMenuItem 
                    className="rounded-xl focus:bg-red-50 focus:text-red-600 py-4 px-4 cursor-pointer text-red-500 transition-all duration-200 group flex items-center"
                    onClick={handleLogout}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 mr-4 group-focus:bg-red-600 group-focus:text-white transition-colors">
                      <LogOut className="h-5 w-5" />
                    </div>
                    <span className="font-black text-sm">Đăng xuất</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="hidden sm:block">
                <Button variant="ghost" className="rounded-2xl h-12 px-6 font-bold transition-all text-gray-600 hover:text-orange-600 hover:bg-orange-50">
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="rounded-2xl h-12 bg-orange-600 hover:bg-orange-700 text-white font-black shadow-lg shadow-orange-100 transition-all px-8">
                  Đăng ký
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
