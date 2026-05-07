import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Menu, X, Microscope, User, LogOut, ChevronDown } from "lucide-react";
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
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/85 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.07)] border-b border-orange-100/60"
            : "bg-white/95 backdrop-blur-sm border-b border-gray-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[68px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-[0_4px_14px_rgba(249,115,22,0.4)] group-hover:shadow-[0_6px_20px_rgba(249,115,22,0.5)] transition-all duration-300 group-hover:scale-105">
                <Microscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900">
                Edu<span className="gradient-text">Smart</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {!isAuthPage && (userRole === "STUDENT" || !userName) && (
                <div className="flex items-center gap-1 mr-4">
                  {[
                    { to: "/", label: "Trang chủ" },
                    ...(userRole === "STUDENT" ? [{ to: "/student", label: "Tổng quan" }] : []),
                    { to: "/courses", label: "Khóa học" },
                    { to: "/news", label: "Tin tức" },
                    { to: "/feedback", label: "Feedback" },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        location.pathname === item.to
                          ? "bg-orange-50 text-orange-600"
                          : "text-gray-600 hover:text-orange-600 hover:bg-orange-50/70"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3">
                {userName ? (
                  <div className="relative group">
                    <button className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-xl font-semibold hover:bg-orange-100 transition-all duration-200 text-sm cursor-pointer border border-orange-100 hover:border-orange-200">
                      <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="max-w-[120px] truncate">{userName}</span>
                      <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300 text-orange-400" />
                    </button>

                    <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-1 group-hover:translate-y-0 transition-all duration-200 z-50">
                      <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden min-w-[170px]">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors text-left text-sm font-semibold"
                        >
                          <LogOut className="w-4 h-4" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  !isAuthPage && (
                    <Link
                      to="/login"
                      className="btn-gradient px-5 py-2 text-white rounded-xl text-sm font-bold"
                    >
                      Đăng nhập
                    </Link>
                  )
                )}
              </div>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-orange-50 text-gray-600 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-gray-100 animate-slide-up">
              <div className="flex flex-col gap-2">
                <Link
                  to="/"
                  className="px-4 py-3 rounded-xl text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-semibold text-sm transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Trang chủ
                </Link>
                {!isAuthPage && (userRole === "STUDENT" || !userName) && (
                  <>
                    {userRole === "STUDENT" && (
                      <Link
                        to="/student"
                        className="px-4 py-3 rounded-xl text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-semibold text-sm transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Tổng quan học tập
                      </Link>
                    )}
                    <Link to="/courses" className="px-4 py-3 rounded-xl text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-semibold text-sm transition-colors" onClick={() => setMobileMenuOpen(false)}>Khóa học</Link>
                    <Link to="/news" className="px-4 py-3 rounded-xl text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-semibold text-sm transition-colors" onClick={() => setMobileMenuOpen(false)}>Tin tức</Link>
                    <Link to="/feedback" className="px-4 py-3 rounded-xl text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-semibold text-sm transition-colors" onClick={() => setMobileMenuOpen(false)}>Feedback</Link>
                  </>
                )}
                {userName ? (
                  <>
                    <div className="px-4 py-3 bg-orange-50 text-orange-700 rounded-xl font-semibold text-sm flex items-center gap-2 border border-orange-100">
                      <User className="w-4 h-4" />
                      {userName}
                    </div>
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-red-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  !isAuthPage && (
                    <Link
                      to="/login"
                      className="btn-gradient px-4 py-3 text-white rounded-xl text-sm font-bold text-center"
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
      <footer className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white py-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-orange-500 rounded-full filter blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-500 rounded-full filter blur-[120px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-[0_4px_14px_rgba(249,115,22,0.5)]">
                  <Microscope className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight">
                  Edu<span className="gradient-text">Smart</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Nền tảng học trực tuyến chuyên về Sinh học hàng đầu Việt Nam — năng động, sáng tạo, hiện đại.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-5 text-white">Liên kết nhanh</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link to="/courses" className="hover:text-orange-400 transition-colors font-medium">Khóa học</Link></li>
                <li><Link to="/news" className="hover:text-orange-400 transition-colors font-medium">Tin tức</Link></li>
                <li><Link to="/login" className="hover:text-orange-400 transition-colors font-medium">Đăng nhập</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-5 text-white">Liên hệ</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-center gap-2">📧 <span>contact@biology.edu.vn</span></li>
                <li className="flex items-center gap-2">📞 <span>+84 123 456 789</span></li>
                <li className="flex items-center gap-2">📍 <span>Hà Nội, Việt Nam</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-10 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2026 <span className="gradient-text font-bold">EduSmart</span>. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
