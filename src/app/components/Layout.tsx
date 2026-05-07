import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Menu, X, Microscope, LogOut, ChevronDown, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { authService } from "../api/authService";

interface JwtPayload {
  unique_name: string;
  [key: string]: any;
}

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        // .NET ClaimTypes.Name usually becomes 'unique_name' or 'name'
        const name = decoded.unique_name || decoded.name || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
        const role = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        setUserName(name);
        setUserRole(role);
      } catch (error) {
        console.error("Failed to decode token", error);
        localStorage.removeItem("token");
        setUserName(null);
        setUserRole(null);
      }
    } else {
      setUserName(null);
      setUserRole(null);
    }
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    setUserName(null);
    setUserRole(null);
    navigate("/login");
  };

  const navLinks = !isAuthPage && (userRole === "STUDENT" || !userName) ? [
    { to: "/", label: "Trang chủ" },
    ...(userRole === "STUDENT" ? [{ to: "/student", label: "Học tập" }] : []),
    { to: "/courses", label: "Khóa học" },
    { to: "/news", label: "Tin tức" },
    { to: "/feedback", label: "Feedback" },
  ] : [];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg, #fff7ed 0%, #fff 50%, #f0f9ff 100%)" }}>
      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-orange-100/60"
            : "bg-white/75 backdrop-blur-md border-b border-white/60"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-md shadow-orange-200"
                style={{ background: "linear-gradient(135deg, #f97316, #dc2626)" }}
              >
                <Microscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tight">
                Edu<span className="text-orange-500">Smart</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    location.pathname === link.to
                      ? "text-white shadow-md shadow-orange-200"
                      : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                  style={location.pathname === link.to ? { background: "linear-gradient(135deg, #f97316, #dc2626)" } : {}}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* User Actions */}
            <div className="hidden md:flex items-center gap-3">
              {userName ? (
                <div className="relative group">
                  <button
                    className="flex items-center gap-2.5 px-4 py-2 rounded-xl font-semibold text-sm border transition-all duration-200 hover:shadow-md"
                    style={{ background: "linear-gradient(135deg, #fff7ed, #ffedd5)", color: "#c2410c", borderColor: "#fed7aa" }}
                  >
                    <div className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-black shadow-sm"
                      style={{ background: "linear-gradient(135deg, #f97316, #dc2626)" }}>
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <span>{userName}</span>
                    <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100/80 overflow-hidden min-w-[160px] p-1.5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left text-sm font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đang xuất</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                !isAuthPage && (
                  <Link
                    to="/login"
                    className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-md shadow-orange-200 hover:shadow-lg hover:shadow-orange-300"
                    style={{ background: "linear-gradient(135deg, #f97316, #dc2626)" }}
                  >
                    Đăng nhập
                  </Link>
                )
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-orange-50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-3 border-t border-orange-100/60 animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-1 pb-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      location.pathname === link.to ? "text-white" : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                    style={location.pathname === link.to ? { background: "linear-gradient(135deg, #f97316, #dc2626)" } : {}}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {userName ? (
                  <>
                    <div className="px-4 py-2.5 bg-orange-50 text-orange-700 rounded-xl font-semibold flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-black"
                        style={{ background: "linear-gradient(135deg, #f97316, #dc2626)" }}>
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      {userName}
                    </div>
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 flex items-center gap-2 text-sm font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  !isAuthPage && (
                    <Link
                      to="/login"
                      className="px-4 py-2.5 text-white rounded-xl text-center text-sm font-bold"
                      style={{ background: "linear-gradient(135deg, #f97316, #dc2626)" }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Đăng nhập
                    </Link>
                  )
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative overflow-hidden text-white py-14" style={{ background: "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #f97316, transparent)" }} />
          <div className="absolute bottom-0 right-1/4 w-60 h-60 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #fb923c, transparent)" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/30"
                  style={{ background: "linear-gradient(135deg, #f97316, #dc2626)" }}>
                  <Microscope className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black">Edu<span className="text-orange-400">Smart</span></span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Nền tảng học trực tuyến chuyên về Sinh học hàng đầu Việt Nam
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-gray-500">Hệ thống hoạt động ổn định</span>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4 text-xs uppercase tracking-widest text-orange-400">Liên kết nhanh</h3>
              <ul className="space-y-2.5">
                <li><Link to="/courses" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">Khoa hoc</Link></li>
                <li><Link to="/news" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">Tin tuc</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">Dang nhap</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4 text-xs uppercase tracking-widest text-orange-400">Lien he</h3>
              <ul className="space-y-2.5 text-gray-400 text-sm">
                <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-orange-400 shrink-0" /> contact@biology.edu.vn</li>
                <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-orange-400 shrink-0" /> +84 123 456 789</li>
                <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-orange-400 shrink-0" /> Ha Noi, Viet Nam</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-white/10 text-center text-gray-600 text-sm">
            <p>&copy; 2026 EduSmart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
