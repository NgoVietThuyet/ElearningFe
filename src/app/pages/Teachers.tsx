import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { Briefcase, Facebook, GraduationCap, Linkedin, Loader2, Mail, Search, Star, Users } from "lucide-react";
import { publicApi } from "../api/publicApi";
import { resolveMediaUrl } from "../utils/media";
import TeacherProfileModal from "../components/common/TeacherProfileModal";

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

interface FeedbackItem {
  id: number;
  rating: number;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function Teachers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const [teachersRes, feedbackRes] = await Promise.all([
          publicApi.getTeachers(),
          publicApi.getFeedbacks(200),
        ]);
        setTeachers(teachersRes.data);
        setFeedbacks(feedbackRes.data);
      } catch (err) {
        console.error("Failed to load teachers", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set("search", value);
    else next.delete("search");
    setSearchParams(next, { replace: true });
  };

  const filteredTeachers = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return teachers.filter((teacher) =>
      teacher.fullName.toLowerCase().includes(normalized) || teacher.email.toLowerCase().includes(normalized),
    );
  }, [searchTerm, teachers]);

  const totalStudents = teachers.reduce((sum, teacher) => sum + teacher.studentCount, 0);
  const totalLessons = teachers.reduce((sum, teacher) => sum + teacher.lessonCount, 0);
  const satisfaction = feedbacks.length
    ? Math.round((feedbacks.reduce((sum, item) => sum + item.rating, 0) / feedbacks.length / 5) * 100)
    : 0;

  const stats = [
    { label: "Giảng viên", value: `${teachers.length}+`, icon: Users, bg: "bg-orange-50", color: "text-orange-600" },
    { label: "Bài giảng", value: `${totalLessons}+`, icon: Briefcase, bg: "bg-violet-50", color: "text-violet-600" },
    { label: "Học viên đã dạy", value: `${totalStudents}+`, icon: GraduationCap, bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: "Đánh giá hài lòng", value: `${satisfaction}%`, icon: Star, bg: "bg-amber-50", color: "text-amber-500" },
  ];

  return (
    <div className="min-h-screen bg-[#fbfcff] py-9">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-12">
        <div className="mb-7">
          <h1 className="text-4xl font-black tracking-tight text-[#101828]">Giảng viên</h1>
          <p className="mt-3 text-sm font-medium text-slate-500">Đội ngũ giảng viên giàu kinh nghiệm, tận tâm và chuyên môn cao.</p>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="flex items-center gap-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <span className={`flex h-14 w-14 items-center justify-center rounded-full ${item.bg} ${item.color}`}>
                <item.icon className="h-7 w-7" />
              </span>
              <div>
                <p className="text-2xl font-black text-[#101828]">{item.value}</p>
                <p className="text-xs font-bold text-slate-500">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8 flex justify-end">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm kiếm giảng viên..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold outline-none focus:border-orange-200 focus:ring-4 focus:ring-orange-100 lg:w-80"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          </div>
        ) : filteredTeachers.length > 0 ? (
          <>
            <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
              {filteredTeachers.map((teacher) => (
                <article 
                  key={teacher.id} 
                  onClick={() => setSelectedTeacher(teacher)}
                  className="cursor-pointer rounded-2xl border border-slate-100 bg-white p-7 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-xl group"
                >
                  <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-orange-50 text-3xl font-black text-orange-600 border-2 border-transparent group-hover:border-[#FF6B00] transition duration-300">
                    {teacher.avatarUrl ? <img src={resolveMediaUrl(teacher.avatarUrl)} alt={teacher.fullName} className="h-full w-full object-cover" /> : getInitials(teacher.fullName)}
                  </div>
                  <h2 className="mt-6 text-lg font-black text-[#101828] group-hover:text-[#ff4f12] transition duration-300">{teacher.fullName}</h2>
                  <p className="mt-1 text-sm font-bold text-slate-500">Giảng viên GenZBio</p>
                  <div className="mt-4 flex items-center justify-center gap-1 text-xs font-bold text-slate-500">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    4.9
                    <span>({teacher.studentCount})</span>
                  </div>
                  <p className="mx-auto mt-4 min-h-[48px] max-w-[230px] text-xs font-medium leading-6 text-slate-500">
                    {teacher.lessonCount} bài giảng, đồng hành cùng {teacher.studentCount} học viên.
                  </p>
                  <div className="mt-6 flex justify-center gap-5 text-slate-400 group-hover:text-[#101828] transition duration-300">
                    <Facebook className="h-4 w-4 hover:text-[#FF6B00]" />
                    <Mail className="h-4 w-4 hover:text-[#FF6B00]" />
                    <Linkedin className="h-4 w-4 hover:text-[#FF6B00]" />
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-9 text-center">
              <button className="h-12 rounded-xl border border-orange-200 px-10 text-sm font-black text-[#ff4f12] transition hover:bg-orange-50">
                Xem tất cả giảng viên
              </button>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center">
            <Users className="mx-auto mb-4 h-10 w-10 text-slate-300" />
            <h2 className="text-xl font-black text-[#101828]">Không tìm thấy giảng viên</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">Thử đổi từ khóa tìm kiếm.</p>
          </div>
        )}
      </div>

      {/* Teacher Profile Popup Modal */}
      <TeacherProfileModal 
        isOpen={!!selectedTeacher} 
        onClose={() => setSelectedTeacher(null)} 
        teacher={selectedTeacher} 
      />
    </div>
  );
}
