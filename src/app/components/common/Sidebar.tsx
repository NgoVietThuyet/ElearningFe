import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { 
  Home, 
  BookOpen, 
  Newspaper, 
  MessageSquare, 
  LayoutDashboard, 
  Users, 
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  Users2,
  Info
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { Button } from "../ui/button";

interface JwtPayload {
  unique_name?: string;
  role?: string;
  [key: string]: any;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setUser(decoded);
      } catch (err) {
        localStorage.removeItem("token");
      }
    }
  }, [location]);

  const getUserRole = () => {
    if (!user) return "";
    return user.role || 
           user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || 
           "STUDENT";
  };

  const role = getUserRole();

  const commonItems = [
    { id: "home", label: "Trang chủ", icon: Home, path: "/" },
    { id: "courses", label: "Khóa học", icon: BookOpen, path: "/courses" },
    { id: "teachers", label: "Giảng viên", icon: GraduationCap, path: "/teachers" },
    { id: "news", label: "Tin tức", icon: Newspaper, path: "/news" },
    { id: "feedback", label: "Feedback", icon: MessageSquare, path: "/feedback" },
    { id: "about", label: "Về chúng tôi", icon: Info, path: "/about" },
  ];

  const dashboardItems: Record<string, any[]> = {
    ADMIN: [
      { id: "admin-dash", label: "Tổng quan", icon: LayoutDashboard, path: "/admin" },
      { id: "admin-users", label: "Người dùng", icon: Users, path: "/admin?section=users" },
      { id: "admin-courses", label: "Khóa học", icon: BookOpen, path: "/admin?section=courses" },
      { id: "admin-news", label: "Tin tức", icon: Newspaper, path: "/admin?section=news" },
      { id: "admin-feedback", label: "Feedback", icon: MessageSquare, path: "/admin?section=feedback" },
    ],
    TEACHER: [
      { id: "teacher-dash", label: "Tổng quan", icon: LayoutDashboard, path: "/teacher" },
      { id: "teacher-students", label: "Học sinh", icon: Users2, path: "/teacher?section=students" },
      { id: "teacher-lessons", label: "Bài giảng", icon: FileText, path: "/teacher?section=lessons" },
      { id: "teacher-feedback", label: "Feedback", icon: MessageSquare, path: "/teacher?section=feedback" },
    ],
    STUDENT: [
      { id: "student-dash", label: "Dashboard", icon: LayoutDashboard, path: "/student" },
    ]
  };

  const currentRoleDashboardItems = dashboardItems[role as keyof typeof dashboardItems] || [];

  const isActive = (path: string) => {
    const fullPath = location.pathname + location.search;
    if (path.includes("?")) return fullPath === path;
    if (path === "/") return location.pathname === "/" && location.search === "";
    return location.pathname === path;
  };

  if (!user) return null;

  return (
    <aside 
      className={`sticky top-0 h-screen flex flex-col transition-all duration-300 z-40 border-r bg-white border-border ${isCollapsed ? "w-[72px]" : "w-[260px]"}`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5">
        <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
           <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FF6B00] text-white">
              <GraduationCap className="h-6 w-6" />
           </div>
           {!isCollapsed && (
             <div className="flex flex-col leading-tight">
                <span className="text-lg font-black tracking-tighter text-[#0F172A]">
                  EduSmart
                </span>
                <span className="text-[9px] font-bold text-[#FF6B00] uppercase tracking-wider">
                  Biology Expert
                </span>
             </div>
           )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        {/* Navigation Section */}
        <div className="mb-8">
           {!isCollapsed && <p className="px-4 mb-3 text-[11px] font-bold text-[#98A2B3] uppercase tracking-widest">Khám phá</p>}
           <div className="space-y-1">
             {commonItems.map((item) => (
               <Link key={item.id} to={item.path}>
                 <div 
                   className={`h-[44px] flex items-center gap-3 rounded-lg px-3 font-bold transition-all relative group cursor-pointer ${
                     isActive(item.path) 
                     ? "bg-[#FFF4EC] text-[#FF6B00]" 
                     : "text-[#667085] hover:bg-[#F8F9FB] hover:text-[#0F172A]"
                   }`}
                 >
                   <item.icon className={`h-4.5 w-4.5 ${isActive(item.path) ? "text-[#FF6B00]" : "text-[#98A2B3] group-hover:text-[#0F172A]"}`} />
                   {!isCollapsed && <span className="text-xs">{item.label}</span>}
                   {isActive(item.path) && !isCollapsed && (
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-[24px] bg-[#FF6B00] rounded-l-full" />
                   )}
                 </div>
               </Link>
             ))}
           </div>
        </div>

        {/* Dashboard Section */}
        <div>
           {!isCollapsed && <p className="px-4 mb-4 text-[12px] font-bold text-[#98A2B3] uppercase tracking-[0.08em]">Quản trị</p>}
           <div className="space-y-1">
             {currentRoleDashboardItems.map((item) => (
               <Link key={item.id} to={item.path}>
                 <div 
                   className={`h-[52px] flex items-center gap-3 rounded-[16px] px-4 font-bold transition-all relative group cursor-pointer ${
                     isActive(item.path) 
                     ? "bg-[#FFF4EC] text-[#FF6B00]" 
                     : "text-[#667085] hover:bg-[#F8F9FB] hover:text-[#0F172A]"
                   }`}
                 >
                   <item.icon className={`h-5 w-5 ${isActive(item.path) ? "text-[#FF6B00]" : "text-[#98A2B3] group-hover:text-[#0F172A]"}`} />
                   {!isCollapsed && <span className="text-sm">{item.label}</span>}
                   {isActive(item.path) && !isCollapsed && (
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[4px] h-[32px] bg-[#FF6B00] rounded-l-full" />
                   )}
                 </div>
               </Link>
             ))}
           </div>
        </div>
      </div>

      {/* Footer / Collapse Toggle */}
      <div className="p-3 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-center lg:justify-start gap-3 rounded-lg h-[44px] text-[#98A2B3] hover:bg-[#F8F9FB] hover:text-[#0F172A]"
          onClick={onToggle}
        >
          {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          {!isCollapsed && <span className="text-xs font-bold">Thu gọn</span>}
        </Button>
      </div>
    </aside>
  );
}
