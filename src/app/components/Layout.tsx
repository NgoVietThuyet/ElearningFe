import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Menu, X, Microscope, User, LogOut, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { authService } from "../api/authService";

interface JwtPayload {
  unique_name: string; // ClaimTypes.Name often maps to unique_name in the decoded JWT
  [key: string]: any;
}

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Microscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">EduSmart</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {!isAuthPage && (userRole === "STUDENT" || !userName) && (
                <div className="flex items-center gap-6">
                  <Link to="/" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">Trang chủ</Link>
                  {userRole === "STUDENT" && (
                    <Link to="/student" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">Tổng quan học tập</Link>
                  )}
                  <Link to="/courses" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">Khóa học</Link>
                  <Link to="/news" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">Tin tức</Link>
                  <Link to="/feedback" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">Feedback</Link>
                </div>
              )}
              
              <div className="flex items-center gap-6">
              {userName ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg font-medium hover:bg-orange-100 transition-all cursor-pointer">
                    <User className="w-4 h-4" />
                    <span>{userName}</span>
                    <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                  </button>
                  
                  {/* Sliding Popup on Hover */}
                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden min-w-[160px]">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium">Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                !isAuthPage && (
                  <Link
                    to="/login"
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Đăng nhập
                  </Link>
                )
              )}
              </div>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-4">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-orange-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Trang chủ
                </Link>
                {!isAuthPage && (userRole === "STUDENT" || !userName) && (
                  <>
                    {userRole === "STUDENT" && (
                      <Link
                        to="/student"
                        className="text-gray-700 hover:text-orange-600 font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Tổng quan học tập
                      </Link>
                    )}
                    <Link
                      to="/courses"
                      className="text-gray-700 hover:text-orange-600 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Khóa học
                    </Link>
                    <Link
                      to="/news"
                      className="text-gray-700 hover:text-orange-600 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Tin tức
                    </Link>
                    <Link
                      to="/feedback"
                      className="text-gray-700 hover:text-orange-600 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Feedback
                    </Link>
                  </>
                )}
                {userName ? (
                  <>
                    <div className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg font-medium flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {userName}
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  !isAuthPage && (
                    <Link
                      to="/login"
                      className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-center"
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
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Microscope className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-semibold">EduSmart</span>
              </div>
              <p className="text-gray-400">
                Nền tảng học trực tuyến chuyên về Sinh học hàng đầu Việt Nam
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Liên kết</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/login" className="hover:text-orange-500">Đăng nhập</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Liên hệ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: contact@biology.edu.vn</li>
                <li>Phone: +84 123 456 789</li>
                <li>Address: Hà Nội, Việt Nam</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 EduSmart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
