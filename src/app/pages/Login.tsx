import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Microscope, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { authService } from "../api/authService";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  role: string;
  [key: string]: any;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await authService.login({ email, password });
      localStorage.setItem("token", response.token);
      toast.success(response.message || "Đăng nhập thành công!");

      try {
        const decoded = jwtDecode<JwtPayload>(response.token);
        const role = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        if (role === "ADMIN") navigate("/admin");
        else if (role === "TEACHER") navigate("/teacher");
        else navigate("/student");
      } catch (decodeError) {
        console.error("Failed to decode token:", decodeError);
        navigate("/student");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại.";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center mesh-bg py-12 px-4 relative overflow-hidden">
      {/* Back to home button */}
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-600 transition-all duration-300 group z-50 bg-white/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/40 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Quay về trang chủ
      </Link>

      {/* Decorative blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full filter blur-[80px] opacity-50 pointer-events-none animate-float-slow" />
      <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-gradient-to-br from-violet-200 to-pink-200 rounded-full filter blur-[80px] opacity-40 pointer-events-none animate-float-slow" style={{ animationDelay: "4s" }} />

      <div className="relative max-w-md w-full animate-slide-up">
        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.12)] border border-white/60 p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-18 h-18 mx-auto mb-4 relative inline-flex">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-[0_8px_25px_rgba(249,115,22,0.45)] animate-pulse-glow">
                <Microscope className="w-9 h-9 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Đăng nhập</h2>
            <p className="text-gray-500 mt-2 font-medium">Chào mừng bạn trở lại! 👋</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errorMsg) setErrorMsg(null); }}
                required
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:bg-white outline-none transition-all duration-200 font-medium text-gray-900 placeholder:text-gray-400"
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errorMsg) setErrorMsg(null); }}
                  required
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:bg-white outline-none transition-all duration-200 font-medium text-gray-900 placeholder:text-gray-400 pr-12"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 accent-orange-500 rounded" />
                <span className="text-sm text-gray-500 font-medium group-hover:text-gray-700 transition-colors">Ghi nhớ đăng nhập</span>
              </label>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-2">
                <span>⚠️</span> {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-gradient w-full text-white py-4 rounded-xl font-black text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 font-medium">
              Chưa có tài khoản?{" "}
              <Link to="/signup" className="text-orange-600 hover:text-orange-700 font-bold transition-colors hover:underline">
                Đăng ký ngay →
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom branding */}
        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
          GenZBio · Nền tảng học sinh học hàng đầu Việt Nam 🇻🇳
        </p>
      </div>
    </div>
  );
}
