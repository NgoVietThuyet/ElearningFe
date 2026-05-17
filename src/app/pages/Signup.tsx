import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Edit, Eye, EyeOff, Loader2, Microscope, Users } from "lucide-react";
import { toast } from "sonner";
import { authService } from "../api/authService";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
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
      const response = await authService.register({
        fullName: name,
        email,
        password,
        dateOfBirth: dateOfBirth || undefined,
        avatarFile: avatarFile || undefined,
      });

      toast.success(response.message || "Đăng ký thành công!");
      navigate("/login");
    } catch (error: any) {
      const message = error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const inputClass =
    "w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:bg-white outline-none transition-all duration-200 font-medium text-gray-900 placeholder:text-gray-400";

  return (
    <div className="min-h-screen flex items-center justify-center mesh-bg py-12 px-4 relative overflow-hidden">
      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-600 transition-all duration-300 group z-50 bg-white/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/40 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Quay về trang chủ
      </Link>

      <div className="absolute top-[-8%] left-[-8%] w-96 h-96 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full filter blur-[80px] opacity-50 pointer-events-none animate-float-slow" />
      <div
        className="absolute bottom-[-5%] right-[-5%] w-80 h-80 bg-gradient-to-br from-violet-200 to-pink-200 rounded-full filter blur-[80px] opacity-40 pointer-events-none animate-float-slow"
        style={{ animationDelay: "5s" }}
      />

      <div className="relative max-w-md w-full animate-slide-up">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.12)] border border-white/60 p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_8px_25px_rgba(249,115,22,0.45)] animate-pulse-glow">
              <Microscope className="w-9 h-9 text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Đăng ký</h2>
            <p className="text-gray-500 mt-1.5 font-medium text-xs">Tạo tài khoản mới để bắt đầu học</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="flex flex-col items-center mb-4">
              <button
                type="button"
                className="relative group cursor-pointer"
                onClick={() => document.getElementById("avatar-input")?.click()}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-100 group-hover:border-orange-400 transition-all"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 group-hover:border-orange-400 group-hover:text-orange-400 transition-all">
                    <Users className="w-8 h-8" />
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-lg border border-gray-100 shadow-sm text-orange-500">
                  <Edit className="w-3.5 h-3.5" />
                </span>
              </button>

              <input id="avatar-input" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isLoading} />
              <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Ảnh đại diện</span>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="col-span-2">
                <label htmlFor="name" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Họ và tên
                </label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} placeholder="Nguyễn Văn A" disabled={isLoading} />
              </div>

              <div className="col-span-2">
                <label htmlFor="email" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Email
                </label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="your@email.com" disabled={isLoading} />
              </div>

              <div className="col-span-2">
                <label htmlFor="dob" className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Ngày sinh
                </label>
                <input id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={inputClass} disabled={isLoading} />
              </div>
            </div>

            <PasswordField
              id="password"
              label="Mật khẩu"
              value={password}
              show={showPassword}
              disabled={isLoading}
              inputClass={inputClass}
              onChange={setPassword}
              onToggle={() => setShowPassword(!showPassword)}
            />

            <PasswordField
              id="confirmPassword"
              label="Xác nhận mật khẩu"
              value={confirmPassword}
              show={showConfirmPassword}
              disabled={isLoading}
              inputClass={inputClass}
              onChange={setConfirmPassword}
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="btn-gradient w-full text-white py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-4 shadow-lg shadow-orange-100"
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

        <p className="text-center text-xs text-gray-400 mt-6 font-medium">EduSmart · Nền tảng học sinh học hàng đầu Việt Nam</p>
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  show,
  disabled,
  inputClass,
  onChange,
  onToggle,
}: {
  id: string;
  label: string;
  value: string;
  show: boolean;
  disabled: boolean;
  inputClass: string;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className={`${inputClass} pr-12`}
          placeholder="••••••••"
          disabled={disabled}
        />
        <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors">
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
