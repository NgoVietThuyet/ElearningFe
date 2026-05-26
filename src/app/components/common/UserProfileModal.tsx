import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  X, Mail, Phone, MapPin, Calendar, User, Lock, 
  Camera, Loader2, Sparkles, Eye, EyeOff, Edit3, 
  Save, Undo, CheckCircle2, ShieldAlert
} from "lucide-react";
import { profileApi, type UserProfile } from "../../api/profileApi";
import { resolveMediaUrl } from "../../utils/media";
import { toast } from "sonner";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (updatedUser: UserProfile) => void;
}

export default function UserProfileModal({ isOpen, onClose, onProfileUpdated }: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form States
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Show/Hide Password States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Avatar Upload States
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
    } else {
      // Reset form states on close
      setIsEditing(false);
      setPassword("");
      confirmPassword && setConfirmPassword("");
      setAvatarFile(null);
      setAvatarPreview(null);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const res = await profileApi.getProfile();
      if (res.data) {
        setProfile(res.data);
        initFormValues(res.data);
      }
    } catch (err) {
      console.error("Failed to load user profile", err);
      toast.error("Không thể tải thông tin cá nhân.");
    } finally {
      setIsLoading(false);
    }
  };

  const initFormValues = (user: UserProfile) => {
    setFullName(user.fullName || "");
    setDateOfBirth(user.dateOfBirth || "");
    setGender(user.gender || "");
    setPhoneNumber(user.phoneNumber || "");
    setAddress(user.address || "");
    setShortBio(user.shortBio || "");
    setPassword("");
    setConfirmPassword("");
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "ES";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ảnh kích thước tối đa 2MB");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const getRoleBadge = (role?: string) => {
    if (!role) return null;
    const isTeacher = role.toUpperCase() === "TEACHER";
    const isAdmin = role.toUpperCase() === "ADMIN";

    if (isAdmin) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-600 border border-violet-100 shadow-sm uppercase tracking-wide">
          Quản trị viên
        </span>
      );
    }
    if (isTeacher) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-600 border border-emerald-100 shadow-sm uppercase tracking-wide">
          Giảng viên
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-[#FF6B00] border border-orange-100 shadow-sm uppercase tracking-wide">
        Học viên
      </span>
    );
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Chưa cập nhật";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Họ và tên không được để trống");
      return;
    }

    if (password && password.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không trùng khớp");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("dateOfBirth", dateOfBirth);
      formData.append("gender", gender);
      formData.append("phoneNumber", phoneNumber.trim());
      formData.append("address", address.trim());
      formData.append("shortBio", shortBio.trim());

      if (password) {
        formData.append("password", password);
      }

      if (avatarFile) {
        formData.append("avatarFile", avatarFile);
      }

      const res = await profileApi.updateProfile(formData);
      if (res.data) {
        toast.success(res.data.message || "Cập nhật thành công!");
        const updated = res.data.user;
        setProfile(updated);
        setIsEditing(false);
        setPassword("");
        setConfirmPassword("");
        setAvatarFile(null);
        setAvatarPreview(null);
        
        // Notify navbar or parent to sync updated user details
        if (onProfileUpdated) {
          onProfileUpdated(updated);
        }
      }
    } catch (err: any) {
      console.error("Profile update failed", err);
      const errMsg = err.response?.data?.message || "Cập nhật thông tin thất bại.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop blur */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[24px] bg-white shadow-2xl border border-slate-100/80 transition-all duration-300 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/80 text-slate-500 backdrop-blur-sm transition hover:bg-slate-200 hover:text-slate-800 hover:scale-105"
          aria-label="Đóng popup"
        >
          <X className="h-5 w-5" />
        </button>

        {isLoading ? (
          <div className="flex h-96 w-full flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-[#FF6B00]" />
            <p className="text-sm font-black text-slate-400">Đang tải thông tin cá nhân...</p>
          </div>
        ) : !profile ? (
          <div className="flex h-96 w-full flex-col items-center justify-center gap-3 p-6 text-center">
            <ShieldAlert className="h-12 w-12 text-rose-500" />
            <p className="text-base font-black text-slate-800">Không thể lấy thông tin tài khoản</p>
            <p className="text-sm font-medium text-slate-500 max-w-sm">Vui lòng đăng nhập lại hoặc làm mới trang để thử lại.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden max-h-[90vh]">
            {/* Header Content Scrollable Area */}
            <div className="overflow-y-auto p-6 md:p-8 pt-8 md:pt-10 flex-1">
              
              {/* Header Info */}
              <div className="relative flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-8 border-b border-slate-100 pb-6">
                
                {/* Avatar Area */}
                <div 
                  onClick={triggerFileInput}
                  className={`group relative h-24 w-24 rounded-2xl overflow-hidden bg-[#FFF4EC] flex items-center justify-center text-3xl font-black text-[#FF6B00] shrink-0 border border-slate-100 shadow-md ${
                    isEditing ? "cursor-pointer hover:brightness-90 transition" : ""
                  }`}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : profile.avatarUrl ? (
                    <img src={resolveMediaUrl(profile.avatarUrl)} alt={profile.fullName} className="h-full w-full object-cover" />
                  ) : (
                    getInitials(profile.fullName)
                  )}

                  {isEditing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Camera className="h-6 w-6 mb-1" />
                      <span className="text-[10px] font-black uppercase">Thay ảnh</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden" 
                  />
                </div>

                {/* Name & Primary Meta */}
                <div className="flex-1 text-center md:text-left min-w-0">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-2">
                    <h3 className="text-2xl font-black text-slate-900 leading-none truncate">{profile.fullName}</h3>
                    {getRoleBadge(profile.role)}
                  </div>
                  <p className="text-sm font-bold text-slate-400 truncate mb-1">{profile.email}</p>
                  <p className="text-[11px] font-black uppercase tracking-wider text-[#FF6B00] flex items-center justify-center md:justify-start gap-1">
                    <Sparkles className="h-3 w-3" /> Thành viên chính thức GenZBio
                  </p>
                </div>

                {/* Edit Toggle Button */}
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-95 shrink-0"
                  >
                    <Edit3 className="h-4 w-4 text-[#FF6B00]" /> Chỉnh sửa hồ sơ
                  </button>
                )}
              </div>

              {/* View Mode Layout */}
              {!isEditing ? (
                <div className="space-y-6">
                  {/* Grid Info fields */}
                  <div className="grid gap-4 sm:grid-cols-2 bg-[#F8F9FB] rounded-[20px] p-5 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm border border-slate-100 shrink-0">
                        <Mail className="h-4 w-4 text-[#FF6B00]" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email liên hệ</p>
                        <p className="text-sm font-bold text-slate-700 truncate">{profile.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm border border-slate-100 shrink-0">
                        <Phone className="h-4 w-4 text-emerald-600" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Số điện thoại</p>
                        <p className="text-sm font-bold text-slate-700 truncate">{profile.phoneNumber || "Chưa cập nhật"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm border border-slate-100 shrink-0">
                        <MapPin className="h-4 w-4 text-blue-600" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Địa chỉ liên hệ</p>
                        <p className="text-sm font-bold text-slate-700 truncate">{profile.address || "Chưa cập nhật"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm border border-slate-100 shrink-0">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ngày sinh / Giới tính</p>
                        <p className="text-sm font-bold text-slate-700 truncate">
                          {formatDate(profile.dateOfBirth)} {profile.gender ? `(${profile.gender})` : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Biography */}
                  <div className="border-t border-slate-100 pt-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Giới thiệu ngắn</h4>
                    <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600 bg-slate-50 rounded-2xl p-5 border border-slate-100/50 min-h-[100px] whitespace-pre-line">
                      {profile.shortBio || "Không có giới thiệu nào được ghi nhận. Nhấp 'Chỉnh sửa hồ sơ' để giới thiệu bản thân!"}
                    </p>
                  </div>
                </div>
              ) : (
                /* Edit Mode Form fields */
                <div className="space-y-5 animate-in fade-in duration-300">
                  
                  {/* Grid fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Họ và tên <span className="text-rose-500">*</span></label>
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        required
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Email (Không thể thay đổi)</label>
                      <input 
                        type="email" 
                        value={profile.email}
                        disabled
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-400 cursor-not-allowed outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Ngày sinh</label>
                      <input 
                        type="date" 
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Giới tính</label>
                      <select 
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-100 appearance-none"
                      >
                        <option value="">-- Chọn giới tính --</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Số điện thoại</label>
                      <input 
                        type="tel" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Số điện thoại"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Địa chỉ</label>
                      <input 
                        type="text" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Hà Nội, Việt Nam"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-100"
                      />
                    </div>
                  </div>

                  {/* Biography */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Giới thiệu ngắn</label>
                    <textarea 
                      rows={3}
                      value={shortBio}
                      onChange={(e) => setShortBio(e.target.value)}
                      placeholder="Mô tả tóm tắt về bản thân..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-100 resize-none"
                    />
                  </div>

                  {/* Password Section */}
                  <div className="border-t border-slate-100 pt-5">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#FF6B00] flex items-center gap-1.5 mb-4">
                      <Lock className="h-3.5 w-3.5" /> Đổi mật khẩu tài khoản (Để trống nếu không đổi)
                    </h4>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Mật khẩu mới</label>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Tối thiểu 6 ký tự"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-bold text-slate-700 outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-100"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Xác nhận mật khẩu</label>
                        <div className="relative">
                          <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Nhập lại mật khẩu mới"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-bold text-slate-700 outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-100"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Bottom Actions footer (Only in Edit Mode) */}
            {isEditing && (
              <div className="border-t border-slate-100 bg-[#F8F9FB] px-6 py-4 flex items-center justify-end gap-3 rounded-b-[24px]">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsEditing(false);
                    initFormValues(profile);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-black text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition active:scale-95"
                >
                  <Undo className="h-4 w-4" /> Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B00] px-5 py-2.5 text-xs font-black text-white hover:bg-[#ea460d] transition shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
