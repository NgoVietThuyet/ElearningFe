import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Star,
  GraduationCap,
  BookOpen,
  Award,
} from "lucide-react";
import { resolveMediaUrl } from "../../utils/media";

interface Teacher {
  id: number;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  studentCount: number;
  lessonCount: number;
  shortBio?: string | null;
  teachingExperienceYears?: number;
  phoneNumber?: string | null;
  address?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
}

interface TeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
}

export default function TeacherProfileModal({
  isOpen,
  onClose,
  teacher,
}: TeacherProfileModalProps) {
  if (!isOpen || !teacher) return null;

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "ES";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Chưa cập nhật";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[24px] bg-white shadow-2xl border border-slate-100/80 transition-all duration-300 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/80 text-slate-500 backdrop-blur-sm transition hover:bg-slate-200 hover:text-slate-800 hover:scale-105"
          aria-label="Đóng popup"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Profile Content Scroll Area */}
        <div className="overflow-y-auto p-6 md:p-8 pt-8 md:pt-10">
          <div className="relative flex flex-col md:flex-row md:items-end justify-between mb-6">
            {/* Avatar */}
            <div className="h-24 w-24 rounded-full border border-slate-100 shadow-sm overflow-hidden bg-[#FFF4EC] flex items-center justify-center text-3xl font-black text-[#FF6B00] shrink-0 relative z-10">
              {teacher.avatarUrl ? (
                <img
                  src={resolveMediaUrl(teacher.avatarUrl)}
                  alt={teacher.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(teacher.fullName)
              )}
            </div>

            {/* Badges / Experience summary */}
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3.5 py-1.5 text-xs font-black text-[#FF6B00] border border-orange-100 shadow-sm">
                <Award className="h-3.5 w-3.5" />
                {teacher.teachingExperienceYears || 0} năm kinh nghiệm
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3.5 py-1.5 text-xs font-black text-violet-600 border border-violet-100 shadow-sm">
                Giảng viên tiêu biểu
              </span>
            </div>
          </div>

          {/* Name & Primary Title */}
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">
              {teacher.fullName}
            </h3>
            <p className="mt-1 text-sm font-bold text-slate-500 uppercase tracking-wide">
              Giảng viên chuyên môn cao tại GenZBio
            </p>

            <div className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-500">
              <span className="flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                4.9/5.0
              </span>
            </div>
          </div>

          {/* Contact & Personal Details Info Grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 bg-[#F8F9FB] rounded-[20px] p-5 border border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm border border-slate-100 shrink-0">
                <Mail className="h-4 w-4 text-[#FF6B00]" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Email liên hệ
                </p>
                <p className="text-sm font-bold text-slate-700 truncate">
                  {teacher.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm border border-slate-100 shrink-0">
                <Phone className="h-4 w-4 text-emerald-600" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Số điện thoại
                </p>
                <p className="text-sm font-bold text-slate-700 truncate">
                  {teacher.phoneNumber || "Chưa cập nhật"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm border border-slate-100 shrink-0">
                <MapPin className="h-4 w-4 text-blue-600" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Địa chỉ làm việc
                </p>
                <p className="text-sm font-bold text-slate-700 truncate">
                  {teacher.address || "Hà Nội, Việt Nam"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm border border-slate-100 shrink-0">
                <Calendar className="h-4 w-4 text-purple-600" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Ngày sinh / Giới tính
                </p>
                <p className="text-sm font-bold text-slate-700 truncate">
                  {formatDate(teacher.dateOfBirth)}{" "}
                  {teacher.gender ? `(${teacher.gender})` : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100/50 text-center">
              <BookOpen className="h-6 w-6 text-[#FF6B00] mx-auto mb-2" />
              <p className="text-2xl font-black text-slate-800">
                {teacher.lessonCount}
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                Bài giảng đã soạn
              </p>
            </div>

            <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50 text-center">
              <GraduationCap className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-black text-slate-800">195</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                Học viên quản lý
              </p>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-6 border-t border-slate-100 pt-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
              Giới thiệu bản thân
            </h4>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600 whitespace-pre-line bg-slate-50 rounded-2xl p-5 border border-slate-100/50">
              {teacher.shortBio ||
                "Giảng viên xuất sắc của hệ thống GenZBio, sở hữu kiến thức chuyên sâu vững chắc cùng phong cách giảng dạy trực quan, năng động. Cam kết luôn đồng hành, giải đáp thắc mắc và đưa ra các chỉ dẫn cụ thể hỗ trợ học viên đạt kết quả tốt nhất trong học tập và thi cử."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
