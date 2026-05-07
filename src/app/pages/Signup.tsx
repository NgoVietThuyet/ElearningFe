import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Microscope, Loader2, Eye, EyeOff } from "lucide-react";
import { authService } from "../api/authService";
import { toast } from "sonner";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Mật khẩu không khớp!");
      return;
    }
    setIsLoading(true);
    try {
      const response = await authService.register({ fullName: name, email, password });
      toast.success(response.message || "Đăng ký thành công!");
      navigate("/login");
    } catch (error: any) {
      const message = error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:bg-white outline-none transition-all duration-200 font-medium text-gray-900 placeholder:text-gray-400";

  return (
    <div className="min-h-[calc(100vh-68px)] flex items-center justify-center mesh-bg py-12 px-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-8%] left-[-8%] w-96 h-96 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full filter blur-[80px] opacity-50 pointer-events-none animate-float-slow" />
      <div className="absolute bottom-[-5%] right-[-5%] w-80 h-80 bg-gradient-to-br from-violet-200 to-pink-200 rounded-full filter blur-[80px] opacity-40 pointer-events-none animate-float-slow" style={{ animationDelay: "5s" }} />

      <div className="relative max-w-md w-full animate-slide-up">
        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.12)] border border-white/60 p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_8px_25px_rgba(249,115,22,0.45)] animate-pulse-glow">
              <Microscope className="w-9 h-9 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Đăng ký</h2>
            <p className="text-gray-500 mt-2 font-medium">Tạo tài khoản mới để bắt đầu học 🚀</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputClass}
                placeholder="Nguyễn Văn A"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`${inputClass} pr-12`}
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2">Xác nhận mật khẩu</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`${inputClass} pr-12`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-gradient w-full text-white py-4 rounded-xl font-black text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? "Đang xử lý..." : "Tạo tài khoản"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 font-medium">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-orange-600 hover:text-orange-700 font-bold transition-colors hover:underline">
                Đăng nhập →
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
          EduSmart · Nền tảng học sinh học hàng đầu Việt Nam 🇻🇳
        </p>
      </div>
    </div>
  );
}
