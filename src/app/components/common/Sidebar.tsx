import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { 
  Home, 
  BookOpen, 
  Newspaper, 
  MessageSquare, 
  LayoutDashboard, 
  Users, 
  ChevronRight,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  Users2
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
    { id: "news", label: "Tin tức", icon: Newspaper, path: "/news" },
    { id: "feedback", label: "Feedback", icon: MessageSquare, path: "/feedback" },
  ];

  const dashboardItems: Record<string, any[]> = {
    ADMIN: [
      { id: "admin-dash", label: "Tổng quan", icon: LayoutDashboard, path: "/admin" },
      { id: "admin-users", label: "Người dùng", icon: Users, path: "/admin?section=users" },
      { id: "admin-courses", label: "Khóa học", icon: BookOpen, path: "/admin?section=courses" },
      { id: "admin-news", label: "Tin tức", icon: Newspaper, path: "/admin?section=news" },
    ],
    TEACHER: [
      { id: "teacher-dash", label: "Tổng quan", icon: LayoutDashboard, path: "/teacher" },
      { id: "teacher-students", label: "Học sinh", icon: Users2, path: "/teacher?section=students" },
      { id: "teacher-lessons", label: "Bài giảng", icon: FileText, path: "/teacher?section=lessons" },
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
      className={`sticky top-0 h-screen flex flex-col transition-all duration-300 z-40 border-r bg-white border-gray-100 ${isCollapsed ? "w-20" : "w-72"}`}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-gray-50">
        <Link to="/" className="flex items-center gap-3 overflow-hidden">
           <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-100">
              <GraduationCap className="h-7 w-7" />
           </div>
           {!isCollapsed && (
             <div className="flex flex-col leading-tight">
                <span className="text-xl font-black tracking-tighter text-gray-900">
                  EduSmart
                </span>
                <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">
                  Khám phá thế giới sinh học
                </span>
             </div>
           )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-8 px-4 custom-scrollbar">
        {/* Navigation Section */}
        <div className="mb-10">
           {!isCollapsed && <p className="px-4 mb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Khám phá</p>}
           <div className="space-y-1.5">
             {commonItems.map((item) => (
               <Link key={item.id} to={item.path}>
                 <Button 
                   variant="ghost" 
                   className={`w-full justify-start gap-3 rounded-2xl py-6 px-4 font-bold transition-all relative group ${
                     isActive(item.path) 
                     ? "bg-orange-50/80 text-orange-600" 
                     : "text-gray-500 hover:text-orange-600 hover:bg-orange-50/30"
                   }`}
                 >
                   <item.icon className={`h-5 w-5 ${isActive(item.path) ? "text-orange-600" : "text-gray-400 group-hover:text-orange-600 transition-colors"}`} />
                   {!isCollapsed && <span>{item.label}</span>}
                   {isActive(item.path) && (
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-600 rounded-l-full shadow-[0_0_15px_rgba(234,88,12,0.5)]" />
                   )}
                 </Button>
               </Link>
             ))}
           </div>
        </div>

        {/* Dashboard Section */}
        <div>
           {!isCollapsed && <p className="px-4 mb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Quản trị</p>}
           <div className="space-y-1.5">
             {currentRoleDashboardItems.map((item) => (
               <Link key={item.id} to={item.path}>
                 <Button 
                   variant="ghost" 
                   className={`w-full justify-start gap-3 rounded-2xl py-6 px-4 font-bold transition-all ${
                     isActive(item.path)
                     ? "bg-orange-600 text-white shadow-xl shadow-orange-100" 
                     : "text-gray-500 hover:text-orange-600 hover:bg-orange-50/30"
                   }`}
                 >
                   <item.icon className={`h-5 w-5 ${isActive(item.path) ? "text-white" : "text-gray-400"}`} />
                   {!isCollapsed && <span>{item.label}</span>}
                 </Button>
               </Link>
             ))}
           </div>
        </div>
      </div>

      {/* Footer / Collapse Toggle */}
      <div className="p-4 border-t border-gray-50">
        <Button 
          variant="ghost" 
          className="w-full justify-center lg:justify-start gap-3 rounded-2xl py-6 text-gray-400 hover:text-orange-600 hover:bg-orange-50/30"
          onClick={onToggle}
        >
          {isCollapsed ? <PanelLeftOpen className="h-6 w-6" /> : <PanelLeftClose className="h-6 w-6" />}
        </Button>
      </div>
    </aside>
  );
}
