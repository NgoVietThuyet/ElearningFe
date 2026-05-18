import { useMemo, useState } from "react";
import {
  Bookmark,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Lock,
  Tag,
} from "lucide-react";

const lessonSteps = [
  {
    id: 1,
    title: "Gene và quá trình biểu hiện gene",
    subtitle: "Tìm hiểu cách gene mã hóa thông tin và điều khiển tổng hợp protein.",
    image: "/assets/img/img1.jpg",
    tags: ["Gene", "Phiên mã", "Dịch mã", "Protein"],
    notes: [
      "Gene là một đoạn ADN mang thông tin mã hóa cho một sản phẩm nhất định.",
      "Biểu hiện gene gồm phiên mã và dịch mã.",
      "Sản phẩm cuối cùng thường là protein tham gia cấu trúc hoặc điều hòa hoạt động sống.",
    ],
  },
  {
    id: 2,
    title: "Đột biến gene",
    subtitle: "Nhận biết các dạng đột biến gene và hậu quả sinh học của chúng.",
    image: "/assets/img/img2.jpg",
    tags: ["Đột biến", "Thay thế", "Mất cặp", "Thêm cặp"],
    notes: [
      "Đột biến gene là biến đổi trong cấu trúc của gene.",
      "Đột biến có thể có lợi, có hại hoặc trung tính tùy môi trường.",
      "Đây là nguồn nguyên liệu sơ cấp của tiến hóa và chọn giống.",
    ],
  },
  {
    id: 3,
    title: "Quy luật di truyền Mendel",
    subtitle: "Hệ thống hóa quy luật phân li và phân li độc lập của Mendel.",
    image: "/assets/img/img4.jpg",
    tags: ["Mendel", "Phân li", "Alen", "Tỉ lệ lai"],
    notes: [
      "Mỗi tính trạng do một cặp nhân tố di truyền quy định.",
      "Các alen phân li đồng đều về giao tử.",
      "Quy luật Mendel giúp dự đoán kết quả lai trong các bài toán di truyền.",
    ],
  },
  {
    id: 4,
    title: "Tiến hóa theo quan điểm Darwin",
    subtitle: "Tìm hiểu các yếu tố và ý nghĩa của tiến hóa theo quan điểm Darwin.",
    image: "/assets/img/img5.jpg",
    tags: ["Biến dị", "Đấu tranh sinh tồn", "Chọn lọc tự nhiên", "Hình thành loài mới", "Ý nghĩa"],
    notes: [
      "Biến dị là nguyên liệu của tiến hóa.",
      "Đấu tranh sinh tồn làm tăng áp lực chọn lọc.",
      "Chọn lọc tự nhiên giữ lại biến dị có lợi.",
      "Tích lũy biến dị có lợi và cách li sinh sản dẫn đến hình thành loài mới.",
    ],
  },
  {
    id: 5,
    title: "Ứng dụng di truyền học",
    subtitle: "Kết nối kiến thức di truyền với chọn giống, y học và công nghệ sinh học.",
    image: "/assets/img/img3.jpg",
    tags: ["Chọn giống", "Y học", "Công nghệ sinh học", "Bản đồ gene"],
    notes: [
      "Di truyền học hỗ trợ phát hiện, tư vấn và phòng ngừa bệnh di truyền.",
      "Chọn giống ứng dụng các quy luật di truyền để tạo giống năng suất cao.",
      "Công nghệ gene mở rộng khả năng nghiên cứu và sản xuất sinh học hiện đại.",
    ],
  },
];

export default function CreativeLearning() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeLesson = lessonSteps[activeIndex];

  const progressText = useMemo(() => `${activeIndex + 1} / ${lessonSteps.length}`, [activeIndex]);

  const goPrevious = () => setActiveIndex((current) => Math.max(0, current - 1));
  const goNext = () => setActiveIndex((current) => Math.min(lessonSteps.length - 1, current + 1));

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#fbfcff] text-[#172033]">
      <div className="mx-auto grid w-full max-w-[1480px] grid-cols-1 gap-5 px-3 py-4 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="rounded-[14px] border border-[#e8ebf3] bg-white shadow-sm">
          <div className="border-b border-[#edf0f6] px-5 py-4">
            <h2 className="text-[15px] font-black text-[#1f2937]">Tiến trình bài học</h2>
          </div>

          <div className="py-3">
            {lessonSteps.map((step, index) => {
              const isActive = index === activeIndex;
              const isLocked = index === lessonSteps.length - 1;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`relative flex w-full items-center gap-4 px-5 py-4 text-left transition ${
                    isActive ? "bg-[#f3f0ff] text-[#6d3ce7]" : "text-[#526071] hover:bg-[#f8f7ff]"
                  }`}
                >
                  {isActive && <span className="absolute left-0 top-3 h-10 w-1 rounded-r-full bg-[#6d3ce7]" />}
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-black ${
                      isActive ? "border-[#6d3ce7] bg-[#6d3ce7] text-white" : "border-[#d6dce8] bg-white text-[#657386]"
                    }`}
                  >
                    {step.id}
                  </span>
                  <span className="min-w-0 flex-1 text-[13px] font-bold leading-5">{step.title}</span>
                  {isLocked && <Lock className="h-4 w-4 text-[#9aa4b4]" />}
                </button>
              );
            })}
          </div>

          <div className="m-4 rounded-[12px] border border-[#edf0f6] bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff7dd] text-[#f5a400]">
                <Lightbulb className="h-4 w-4" />
              </span>
              <h3 className="text-[13px] font-black text-[#1f2937]">Mẹo học tập</h3>
            </div>
            <p className="text-[12px] font-semibold leading-6 text-[#657386]">
              Hãy nắm vững từng bước để hiểu rõ hơn mối liên hệ giữa các khái niệm nhé!
            </p>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-3">
            <h1 className="text-[26px] font-black leading-tight tracking-tight text-[#172033]">
              {activeLesson.id}. {activeLesson.title}
            </h1>
            <p className="mt-1 text-[13px] font-semibold text-[#667085]">{activeLesson.subtitle}</p>
          </div>

          <div className="rounded-[14px] border border-[#e8ebf3] bg-white p-5 shadow-sm">
            <div className="flex min-h-[610px] items-center justify-center rounded-[10px] bg-white">
              <img
                src={activeLesson.image}
                alt={activeLesson.title}
                className="max-h-[590px] w-full rounded-[8px] object-contain"
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <button
              type="button"
              onClick={goPrevious}
              disabled={activeIndex === 0}
              className="inline-flex h-12 w-fit items-center gap-2 rounded-[8px] border border-[#ded8ff] bg-white px-5 text-[13px] font-black text-[#6d3ce7] shadow-sm transition hover:bg-[#f7f4ff] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Bước trước
            </button>
            <div className="flex h-12 min-w-24 items-center justify-center rounded-[8px] border border-[#ded8ff] bg-white px-6 text-[13px] font-black text-[#6d3ce7] shadow-sm">
              {progressText}
            </div>
            <button
              type="button"
              onClick={goNext}
              disabled={activeIndex === lessonSteps.length - 1}
              className="ml-auto inline-flex h-12 w-fit items-center gap-2 rounded-[8px] bg-[#6d3ce7] px-5 text-[13px] font-black text-white shadow-lg shadow-violet-200 transition hover:bg-[#5a2fd0] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Bước tiếp theo
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-[14px] border border-[#e8ebf3] bg-white shadow-sm">
            <div className="border-b border-[#edf0f6] px-5 pt-4">
              <h2 className="w-fit border-b-2 border-[#6d3ce7] px-2 pb-3 text-[14px] font-black text-[#6d3ce7]">
                Ghi chú
              </h2>
            </div>

            <div className="p-4">
              <div className="rounded-[12px] border border-[#ffe2aa] bg-[#fffaf0] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#6d3ce7]" />
                  <h3 className="text-[13px] font-black text-[#1f2937]">Ghi chú của giáo viên</h3>
                </div>
                <p className="text-[12px] font-semibold leading-6 text-[#435168]">
                  Học sinh cần nắm rõ nội dung chính trong bài học này để hiểu mối liên hệ giữa biến đổi, chọn lọc tự nhiên và sự hình thành kiến thức mới.
                </p>
                <p className="mt-4 text-[12px] font-semibold text-[#8a94a6]">Cập nhật: 10/05/2024</p>
              </div>
            </div>
          </section>

          <section className="rounded-[14px] border border-[#e8ebf3] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[14px] font-black text-[#1f2937]">Ý chính cần nhớ</h2>
              <Bookmark className="h-4 w-4 fill-[#172033] text-[#172033]" />
            </div>
            <div className="space-y-3">
              {activeLesson.notes.map((note) => (
                <div key={note} className="flex gap-2 text-[12px] font-semibold leading-5 text-[#435168]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#172033]" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[14px] border border-[#e8ebf3] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[14px] font-black text-[#1f2937]">Từ khóa</h2>
              <Tag className="h-4 w-4 text-[#6d3ce7]" />
            </div>
            <div className="flex flex-wrap gap-2">
              {activeLesson.tags.map((tag) => (
                <span key={tag} className="rounded-[8px] bg-[#f3f0ff] px-3 py-2 text-[12px] font-bold text-[#6d3ce7]">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
