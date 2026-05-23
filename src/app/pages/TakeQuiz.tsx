import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  AlertCircle,
  Timer,
  CheckCircle2,
  Award
} from "lucide-react";
import { studentApi } from "../api/studentApi";
import { teacherApi } from "../api/teacherApi";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";

interface Question {
  question: string;
  options: string[];
  answer: number; // Index of correct option (0-3)
}

interface QuizData {
  id: number;
  title: string;
  questions: Question[];
  durationMinutes?: number;
  endTime?: string;
}

export default function TakeQuiz() {
  const { lessonId, testId } = useParams<{ lessonId: string; testId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Khi mở quiz ở chế độ tab mới (window.open), ta lưu đường dẫn trước đó để nút Back/Browser back quay lại đúng page
    // (không phụ thuộc history trong tab quiz)
    try {
      const prev = document.referrer;
      if (prev) localStorage.setItem("genzbio.prev_route", prev);
    } catch {
      // ignore
    }

    const onPopState = () => {
      const ref = localStorage.getItem("genzbio.prev_route");
      if (ref) {
        navigate(ref.replace(window.location.origin, ""));
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [navigate]);


  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    correctCount: number;
    totalQuestions: number;
    status: string;
  } | null>(null);

  // Decipher role
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<Record<string, string>>(token);
        const userRole = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "STUDENT";
        setRole(userRole.toUpperCase());
      } catch {
        setRole("STUDENT");
      }
    } else {
      setRole("STUDENT");
    }
  }, []);

  // Fetch quiz data
  useEffect(() => {
    if (!lessonId || !testId || !role) return;

    const fetchQuiz = async () => {
      try {
        setIsLoading(true);
        if (role === "TEACHER" || role === "ADMIN") {
          // Teacher/Admin flow
          const res = await teacherApi.getLearningItems(Number(lessonId));
          const rawItems = res.data || [];
          const matched = rawItems.find((item: any) => String(item.id) === String(testId));
          if (matched) {
            let parsedContent: any = {};
            try {
              parsedContent = JSON.parse(matched.content || "{}");
            } catch {
              parsedContent = {};
            }
            setQuiz({
              id: matched.id,
              title: matched.title || "Bài kiểm tra",
              questions: parsedContent.questions || [],
              durationMinutes: parsedContent.durationMinutes,
              endTime: parsedContent.endTime,
            });
          } else {
            toast.error("Không tìm thấy bài kiểm tra.");
          }
        } else {
          // Student flow - search both tests and exercises (exams)
          const res = await studentApi.getLessonDetail(lessonId);
          const tests = res.data?.tests || [];
          const exercises = res.data?.exercises || [];
          const allItems = [...tests, ...exercises];
          const matched = allItems.find((t: any) => String(t.id) === String(testId));
          if (matched) {
            const formattedQuestions = (matched.questions || []).map((q: any) => {
              const answerIdx = q.answer !== undefined ? q.answer : (q.correctIndex !== undefined ? q.correctIndex : 0);
              return {
                question: q.question || "",
                options: q.options || ["", "", "", ""],
                answer: Number(answerIdx),
              };
            });
            setQuiz({
              id: matched.id,
              title: matched.title || "Bài kiểm tra",
              questions: formattedQuestions,
              durationMinutes: matched.durationMinutes,
              endTime: matched.endTime,
            });
          } else {
            toast.error("Không tìm thấy bài kiểm tra hoặc bài giảng chưa thuộc quyền học của bạn.");
          }
        }
      } catch (err) {
        console.error("Failed to load quiz", err);
        toast.error("Lỗi khi tải thông tin bài kiểm tra.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [lessonId, testId, role]);

  // Deadline Guard Check
  useEffect(() => {
    if (!quiz) return;
    if (quiz.endTime) {
      const deadline = new Date(quiz.endTime);
      if (new Date() > deadline) {
        setIsExpired(true);
      }
    }
  }, [quiz]);

  // Timer & Countdown counter
  useEffect(() => {
    if (isLoading || isSubmitted || !quiz || isExpired) return;

    if (quiz.durationMinutes && quiz.durationMinutes > 0 && timeLeft === null) {
      setTimeLeft(quiz.durationMinutes * 60);
    }

    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);

      if (timeLeft !== null) {
        setTimeLeft((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, isSubmitted, quiz, timeLeft, isExpired]);

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
  };

  const handleAutoSubmit = async () => {
    if (!quiz || isSubmitted || isSubmitting) return;
    setIsSubmitting(true);
    toast.warning("Hết giờ làm bài! Hệ thống đang tự động nộp bài...", { duration: 4000 });

    try {
      const answersArray = quiz.questions.map((_, idx) =>
        selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1
      );

      if (role === "TEACHER" || role === "ADMIN") {
        let correctCount = 0;
        quiz.questions.forEach((q, idx) => {
          if (selectedAnswers[idx] === q.answer) {
            correctCount++;
          }
        });
        const score = quiz.questions.length === 0 ? 0 : Number(((correctCount / quiz.questions.length) * 10).toFixed(1));
        setResults({
          score,
          correctCount,
          totalQuestions: quiz.questions.length,
          status: score >= 5 ? "PASSED" : "FAILED",
        });
        setIsSubmitted(true);
        toast.success("Tự động nộp bài thi thành công!");
      } else {
        const res = await studentApi.submitTest(testId!, answersArray);
        const data = res.data;
        setResults({
          score: data.score,
          correctCount: data.correctCount,
          totalQuestions: data.totalQuestions,
          status: data.status,
        });
        setIsSubmitted(true);
        toast.success("Tự động nộp bài thi thành công!");
      }
    } catch (err) {
      console.error("Auto submit failed", err);
      toast.error("Lỗi khi tự động nộp bài. Vui lòng kiểm tra lại kết nối.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    const unansweredCount = quiz.questions.length - Object.keys(selectedAnswers).length;
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `Bạn vẫn còn ${unansweredCount} câu hỏi chưa trả lời. Bạn có chắc chắn muốn nộp bài không?`
      );
      if (!confirmSubmit) return;
    } else {
      const confirmSubmit = window.confirm("Bạn có chắc chắn muốn nộp bài thi này không?");
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    try {
      const answersArray = quiz.questions.map((_, idx) =>
        selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1
      );

      if (role === "TEACHER" || role === "ADMIN") {
        let correctCount = 0;
        quiz.questions.forEach((q, idx) => {
          if (selectedAnswers[idx] === q.answer) {
            correctCount++;
          }
        });
        const score = quiz.questions.length === 0 ? 0 : Number(((correctCount / quiz.questions.length) * 10).toFixed(1));
        setResults({
          score,
          correctCount,
          totalQuestions: quiz.questions.length,
          status: score >= 5 ? "PASSED" : "FAILED",
        });
        setIsSubmitted(true);
        toast.success("Nộp bài xem thử thành công!");
      } else {
        const res = await studentApi.submitTest(testId!, answersArray);
        const data = res.data;
        setResults({
          score: data.score,
          correctCount: data.correctCount,
          totalQuestions: data.totalQuestions,
          status: data.status,
        });
        setIsSubmitted(true);
        toast.success("Nộp bài thi thành công!");
      }
    } catch (err) {
      console.error("Submit failed", err);
      toast.error("Không thể nộp bài thi. Vui lòng kiểm tra lại kết nối.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
        <div className="relative text-center">
          <Loader2 className="h-14 w-14 animate-spin text-orange-500 mx-auto" />
          <div className="absolute inset-0 blur-xl bg-orange-500/20 rounded-full animate-pulse"></div>
          <p className="mt-6 text-sm font-black text-gray-500 uppercase tracking-widest">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <AlertCircle className="h-16 w-16 text-rose-500 mb-4 animate-bounce" />
        <h1 className="text-2xl font-black text-slate-800">Bài thi đã hết hạn!</h1>
        <p className="text-sm font-semibold text-slate-500 mt-2">
          Thời hạn nộp bài kiểm tra này đã kết thúc vào lúc:{" "}
          <span className="font-bold text-rose-600">
            {quiz?.endTime ? new Date(quiz.endTime).toLocaleString("vi-VN") : ""}
          </span>
        </p>
        <button
          onClick={() => window.close()}
          className="mt-6 rounded-2xl bg-[#FF5A1F] px-6 py-3 font-bold text-white shadow-lg shadow-orange-100 hover:bg-orange-700 transition"
        >
          Đóng cửa sổ
        </button>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-black text-slate-800">Không tìm thấy bài thi</h1>
        <p className="text-sm font-semibold text-slate-500 mt-2">Bài thi này có thể đã bị xóa hoặc không thuộc bài giảng hợp lệ.</p>
        <button
          onClick={() => window.close()}
          className="mt-6 rounded-2xl bg-[#FF5A1F] px-6 py-3 font-bold text-white shadow-lg shadow-orange-100 hover:bg-orange-700 transition"
        >
          Đóng cửa sổ
        </button>
      </div>
    );
  }

  if (quiz.questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <AlertCircle className="h-16 w-16 text-amber-500 mb-4 animate-pulse" />
        <h1 className="text-2xl font-black text-slate-800">Bài kiểm tra chưa có câu hỏi</h1>
        <p className="text-sm font-semibold text-slate-500 mt-2">Giáo viên chưa cấu hình câu hỏi cho bài kiểm tra này.</p>
        <button
          onClick={() => window.close()}
          className="mt-6 rounded-2xl bg-slate-600 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-slate-700"
        >
          Đóng cửa sổ
        </button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10">
      {/* Top Banner (for preview role) */}
      {(role === "TEACHER" || role === "ADMIN") && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-2.5 px-4 text-xs font-black uppercase tracking-widest shadow-sm">
          <span>Chế độ xem trước của Giáo viên/Admin • Kết quả làm bài sẽ không được ghi lại vào cơ sở dữ liệu</span>
        </div>
      )}

      {/* Header bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4 shadow-sm backdrop-blur-md bg-white/95">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (isSubmitted || window.confirm("Bạn có chắc muốn thoát? Kết quả thi hiện tại sẽ không được lưu.")) {
                  window.close();
                }
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#FF5A1F]">Bài kiểm tra trắc nghiệm</p>
              <h1 className="text-lg font-black text-slate-900 tracking-tight line-clamp-1">{quiz.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 rounded-2xl px-4 py-2 shadow-inner transition-all duration-300 ${
              !isSubmitted && timeLeft !== null && timeLeft <= 60
                ? "bg-rose-50 border border-rose-200 text-rose-600 animate-pulse"
                : "bg-slate-100 text-slate-700"
            }`}>
              {isSubmitted ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-black uppercase text-emerald-600">Đã hoàn thành</span>
                </>
              ) : (
                <>
                  {timeLeft !== null ? (
                    <>
                      <Timer className={`h-4 w-4 ${timeLeft <= 60 ? "text-rose-500 animate-bounce" : "text-orange-500 animate-pulse"}`} />
                      <span className={`text-xs font-black tabular-nums ${timeLeft <= 60 ? "text-rose-600" : "text-slate-900"}`}>
                        Còn lại: {formatTime(timeLeft)}
                      </span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-orange-500 animate-pulse" />
                      <span className="text-xs font-black text-slate-900 tabular-nums">{formatTime(timeElapsed)}</span>
                    </>
                  )}
                </>
              )}
            </div>

            {!isSubmitted && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-10 rounded-2xl bg-orange-600 px-6 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-100 hover:bg-orange-700 transition disabled:opacity-60"
              >
                {isSubmitting ? "Đang nộp..." : "Nộp bài"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!isSubmitted ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Left Workspace: Questions */}
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
                  <span className="text-sm font-black text-orange-600 uppercase tracking-widest">
                    Câu hỏi {currentQuestionIndex + 1} / {quiz.questions.length}
                  </span>
                  {isAnswered && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Đã chọn đáp án
                    </span>
                  )}
                </div>

                {/* Question Text */}
                <h2 className="text-lg font-black text-slate-900 leading-relaxed mb-8">
                  {currentQuestion?.question}
                </h2>

                {/* Option Cards */}
                <div className="grid gap-4">
                  {currentQuestion?.options.map((option, idx) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                    const charOption = String.fromCharCode(65 + idx); // A, B, C, D
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(currentQuestionIndex, idx)}
                        className={`flex w-full items-center gap-5 rounded-2xl border p-5 text-left transition-all duration-300 ${
                          isSelected
                            ? "border-orange-500 bg-orange-50/50 shadow-md shadow-orange-50/30"
                            : "border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/10"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black text-sm transition ${
                            isSelected ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {charOption}
                        </div>
                        <span className="text-sm font-semibold text-slate-800 leading-relaxed">{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-black uppercase text-slate-600 hover:bg-slate-50 transition disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Câu trước
                </button>

                <div className="hidden sm:flex gap-1.5 text-xs font-bold text-slate-400">
                  <span>Trái/phải để chuyển câu nhanh</span>
                </div>

                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(quiz.questions.length - 1, prev + 1))}
                  disabled={currentQuestionIndex === quiz.questions.length - 1}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-black uppercase text-white hover:bg-slate-800 transition disabled:opacity-40"
                >
                  Câu sau <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right Workspace: Navigation Sidebar */}
            <aside className="space-y-6">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-5 text-xs font-black uppercase tracking-wider text-slate-400">Danh sách câu hỏi</h3>
                <div className="grid grid-cols-5 gap-3">
                  {quiz.questions.map((_, idx) => {
                    const isCurrent = currentQuestionIndex === idx;
                    const hasAnswer = selectedAnswers[idx] !== undefined;

                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`flex aspect-square items-center justify-center rounded-xl font-black text-xs transition duration-300 ${
                          isCurrent
                            ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                            : hasAnswer
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : "bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 border-t border-slate-100 pt-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <div className="h-3 w-3 rounded-md bg-orange-500"></div>
                    <span>Câu đang xem</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <div className="h-3 w-3 rounded-md bg-emerald-50 border border-emerald-200"></div>
                    <span>Đã chọn đáp án</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <div className="h-3 w-3 rounded-md bg-slate-50 border border-slate-200"></div>
                    <span>Chưa trả lời</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          /* Results and Score Summary Dashboards */
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-[2.5rem] bg-white border border-slate-200 p-8 text-center shadow-lg relative overflow-hidden">
              {/* Decorative DNA background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none text-9xl font-bold font-serif">EDU</div>

              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 text-[#FF5A1F] shadow-sm mb-6">
                <Award className="h-12 w-12" />
              </div>

              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Kết quả bài kiểm tra</h2>
              <p className="text-sm font-semibold text-slate-500 mt-2">{quiz.title}</p>

              {/* Score Circular visualization */}
              <div className="my-10 flex flex-col items-center justify-center">
                <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-8 border-slate-100 shadow-inner">
                  {/* Gauge fill border depending on pass/fail */}
                  <div
                    className={`absolute inset-0 rounded-full border-8 ${
                      results?.status === "PASSED" ? "border-emerald-500 animate-pulse" : "border-rose-500"
                    }`}
                    style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
                  />
                  <div className="relative text-center">
                    <span className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums">
                      {results?.score}
                    </span>
                    <span className="text-sm font-black text-slate-400 block mt-0.5">/ 10 ĐIỂM</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-6 justify-center">
                  <div className="text-center bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 min-w-[120px]">
                    <span className="text-xs font-bold text-slate-500 uppercase block">Số câu đúng</span>
                    <span className="text-lg font-black text-emerald-600 tracking-tight block mt-0.5">
                      {results?.correctCount} / {results?.totalQuestions}
                    </span>
                  </div>
                  <div className="text-center bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 min-w-[120px]">
                    <span className="text-xs font-bold text-slate-500 uppercase block">Thời gian làm</span>
                    <span className="text-lg font-black text-slate-700 block mt-0.5">
                      {formatTime(timeElapsed)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Glowing Status badge */}
              <div className="mb-8">
                {results?.status === "PASSED" ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-6 py-2.5 text-sm font-black uppercase tracking-wider text-emerald-600 border border-emerald-200 shadow-sm shadow-emerald-50">
                    <CheckCircle2 className="h-5 w-5" /> VƯỢT QUA BÀI THI (ĐẠT)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-6 py-2.5 text-sm font-black uppercase tracking-wider text-rose-600 border border-rose-200 shadow-sm shadow-rose-50">
                    <X className="h-5 w-5" /> CHƯA ĐẠT (YÊU CẦU ≥ 5.0)
                  </span>
                )}
              </div>

              <div className="flex gap-4 max-w-md mx-auto">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setSelectedAnswers({});
                    setTimeElapsed(0);
                    setCurrentQuestionIndex(0);
                  }}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white py-3.5 text-xs font-black uppercase tracking-wider text-slate-700 transition hover:bg-slate-50"
                >
                  LÀM LẠI BÀI THI
                </button>
                <button
                  onClick={() => window.close()}
                  className="flex-1 rounded-2xl bg-orange-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-orange-100 hover:bg-orange-700 transition"
                >
                  HOÀN THÀNH & ĐÓNG
                </button>
              </div>
            </div>

            {/* Answer Key / Detailed Review */}
            <div className="rounded-[2.5rem] bg-white border border-slate-200 p-8 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6">Xem lại câu hỏi</h3>
              <div className="space-y-6 divide-y divide-slate-100">
                {quiz.questions.map((q, idx) => {
                  const studentAnswerIdx = selectedAnswers[idx];
                  const isCorrect = studentAnswerIdx === q.answer;
                  const charCorrect = String.fromCharCode(65 + q.answer);
                  const charStudent = studentAnswerIdx !== undefined ? String.fromCharCode(65 + studentAnswerIdx) : "Chưa chọn";

                  return (
                    <div key={idx} className="pt-6 first:pt-0">
                      <div className="flex items-start gap-4 justify-between">
                        <div>
                          <span className="text-xs font-black text-orange-600 uppercase tracking-widest block mb-2">
                            Câu hỏi {idx + 1}
                          </span>
                          <p className="font-bold text-slate-800 leading-relaxed text-sm">{q.question}</p>
                        </div>
                        {isCorrect ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-600 flex items-center gap-1 shrink-0 border border-emerald-100">
                            <Check className="h-3.5 w-3.5" /> Đúng
                          </span>
                        ) : (
                          <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-600 flex items-center gap-1 shrink-0 border border-rose-100">
                            <X className="h-3.5 w-3.5" /> Sai
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                        {q.options.map((option, optIdx) => {
                          const isCorrectOpt = optIdx === q.answer;
                          const isStudentSelectedOpt = optIdx === studentAnswerIdx;
                          return (
                            <div
                              key={optIdx}
                              className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs font-medium leading-relaxed ${
                                isCorrectOpt
                                  ? "border-emerald-300 bg-emerald-50/50 text-emerald-800"
                                  : isStudentSelectedOpt
                                  ? "border-rose-300 bg-rose-50/50 text-rose-800"
                                  : "border-slate-100 bg-slate-50/30 text-slate-600"
                              }`}
                            >
                              <div
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-black text-[10px] ${
                                  isCorrectOpt
                                    ? "bg-emerald-500 text-white"
                                    : isStudentSelectedOpt
                                    ? "bg-rose-500 text-white"
                                    : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </div>
                              <span>{option}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-4 text-xs font-bold bg-slate-50 px-4 py-3 rounded-xl border border-slate-100/50">
                        <span className="text-slate-500">
                          Đáp án đúng: <span className="text-emerald-600 font-black">{charCorrect}</span>
                        </span>
                        <span className="text-slate-500">
                          Bạn chọn:{" "}
                          <span className={`${isCorrect ? "text-emerald-600" : "text-rose-600"} font-black`}>
                            {charStudent}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
