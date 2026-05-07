import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { publicApi } from "../api/publicApi";
import { 
  Loader2, 
  ArrowLeft, 
  BookOpen, 
  Users, 
  Calendar, 
  GraduationCap, 
  Video, 
  FileText, 
  X,
  User
} from "lucide-react";

interface Lesson {
  id: number;
  title: string;
  videoUrl: string;
  pdfUrl: string;
}

interface Student {
  id: number;
  fullName: string;
  email: string;
  enrolledAt: string;
}

interface CourseDetail {
  id: number;
  title: string;
  description: string;
  creatorName: string;
  lessonCount: number;
  studentCount: number;
  createdAt: string;
  lessons: Lesson[];
  students: Student[];
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (!id) return;
    const fetchCourse = async () => {
      try {
        const res = await publicApi.getCourseById(id);
        setCourse(res.data);
      } catch (err) {
        console.error("Failed to load course detail", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy khóa học</h2>
        <Link to="/courses" className="text-orange-600 font-bold hover:underline">Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20 relative">
      {/* Header section with accent */}
      <div className="bg-white border-b border-gray-200 pt-8 pb-12 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/courses" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors mb-6 font-medium group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Quay lại danh sách
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                Khóa học tiêu biểu
              </span>
              <h1 className="text-4xl font-black text-gray-900 leading-tight mb-4">
                {course.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                    {course.creatorName.charAt(0)}
                  </div>
                  <span className="font-semibold text-gray-900">{course.creatorName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Cập nhật: {new Date(course.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>
            </div>
            
            {!isLoggedIn && (
              <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 shrink-0">
                <div className="text-center mb-4">
                  <span className="text-3xl font-black text-orange-600">Miễn phí</span>
                </div>
                <Link
                  to="/signup"
                  className="block w-full text-center px-8 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
                >
                  Đăng ký học ngay
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Giới thiệu */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-orange-600" />
              Giới thiệu khóa học
            </h2>
            
            <div 
              className="rich-content prose prose-orange max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: course.description }}
            />
          </div>

          {/* Danh sách bài giảng */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-orange-600" />
              Nội dung bài giảng
            </h2>
            
            <div className="space-y-3">
              {course.lessons && course.lessons.length > 0 ? (
                course.lessons.map((lesson, idx) => (
                  <div key={lesson.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-50 hover:border-orange-200 hover:bg-orange-50/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-orange-600 transition-all font-bold">
                        {idx + 1}
                      </div>
                      <span className="font-bold text-gray-700 group-hover:text-gray-900">{lesson.title}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {lesson.videoUrl ? (
                        <a 
                          href={lesson.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                        >
                          <Video className="w-3.5 h-3.5" /> Video
                        </a>
                      ) : (
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-xs font-bold cursor-not-allowed opacity-50">
                          <Video className="w-3.5 h-3.5" /> Video
                        </span>
                      )}

                      {lesson.pdfUrl ? (
                        <a 
                          href={lesson.pdfUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" /> PDF
                        </a>
                      ) : (
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-xs font-bold cursor-not-allowed opacity-50">
                          <FileText className="w-3.5 h-3.5" /> PDF
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic text-center py-4">Chưa có bài giảng nào được cập nhật.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6">Thông tin chi tiết</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <div className="flex items-center gap-2 text-gray-500">
                  <GraduationCap className="w-4 h-4" />
                  <span>Trình độ</span>
                </div>
                <span className="font-bold text-gray-900">Mọi cấp độ</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <div className="flex items-center gap-2 text-gray-500">
                  <BookOpen className="w-4 h-4" />
                  <span>Bài giảng</span>
                </div>
                <span className="font-bold text-gray-900">{course.lessonCount}</span>
              </div>
              <div 
                className="flex items-center justify-between py-3 border-b border-gray-50 cursor-pointer hover:bg-orange-50 px-2 -mx-2 rounded-lg transition-colors group"
                onClick={() => setShowStudentModal(true)}
              >
                <div className="flex items-center gap-2 text-gray-500 group-hover:text-orange-600">
                  <Users className="w-4 h-4" />
                  <span>Học viên</span>
                </div>
                <span className="font-bold text-gray-900 group-hover:text-orange-600">{course.studentCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-8 rounded-3xl text-white shadow-xl shadow-orange-200">
            <h3 className="text-xl font-bold mb-4">Chứng chỉ hoàn thành</h3>
            <p className="text-orange-100 text-sm mb-6 leading-relaxed">
              Bạn sẽ nhận được chứng chỉ từ EduSmart sau khi hoàn thành tất cả các bài giảng và bài kiểm tra của khóa học này.
            </p>
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/20">
              <GraduationCap className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Student List Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowStudentModal(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-orange-600 text-white">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6" />
                <h3 className="text-xl font-bold">Danh sách học viên</h3>
              </div>
              <button onClick={() => setShowStudentModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto p-6">
              {course.students && course.students.length > 0 ? (
                <div className="space-y-4">
                  {course.students.map((student) => (
                    <div key={student.id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-orange-200 transition-all">
                      <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-all">
                        {student.fullName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{student.fullName}</p>
                        <p className="text-sm text-gray-500 truncate">{student.email}</p>
                      </div>
                      <div className="shrink-0 text-[10px] text-gray-400 font-medium">
                        {new Date(student.enrolledAt).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Chưa có học viên nào tham gia khóa học này.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-gray-50 text-center">
              <p className="text-sm text-gray-500">Tổng cộng: <span className="font-bold text-orange-600">{course.studentCount}</span> học viên</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
