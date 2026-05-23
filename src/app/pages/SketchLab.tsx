import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Dna,
  Play,
  Pause,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  Activity,
  BookOpen,
  Info,
  Lightbulb,
  Sparkles,
  HelpCircle,
  Cpu,
  Layers,
  CheckCircle,
  HelpCircle as QuestionIcon,
} from "lucide-react";

interface SubComponent {
  name: string;
  role: string;
  color: string;
}

interface Step {
  title: string;
  description: string;
}

interface BiologyTopic {
  id: string;
  title: string;
  shortDesc: string;
  detailedDesc: string;
  color: string; // emerald, teal, indigo, fuchsia, amber, rose
  badge: string;
  components: SubComponent[];
  steps: Step[];
  facts: string[];
  mechanismTitle: string;
}

const TOPICS: BiologyTopic[] = [
  {
    id: "dna-replication",
    title: "Cấu trúc & Tái bản DNA",
    shortDesc:
      "Khám phá cấu trúc chuỗi xoắn kép và cơ chế sao chép bán bảo toàn của DNA.",
    detailedDesc:
      "Quá trình nhân đôi DNA (tái bản) là cơ sở cho sự truyền đạt thông tin di truyền qua các thế hệ tế bào. Quá trình này diễn ra theo nguyên tắc bổ sung và nguyên tắc bán bảo toàn nhờ sự phối hợp nhịp nhàng của các enzyme chuyên biệt.",
    color: "emerald",
    badge: "Phổ biến",
    mechanismTitle: "Các bước nhân đôi DNA",
    components: [
      {
        name: "Enzyme Tháo xoắn (Helicase)",
        role: "Bẻ gãy các liên kết hydro giữa 2 mạch đơn, tạo chạc chữ Y.",
        color: "bg-red-500",
      },
      {
        name: "DNA Polymerase III",
        role: "Lắp ráp nucleotide tự do bổ sung với mạch khuôn theo chiều 5' -> 3'.",
        color: "bg-blue-500",
      },
      {
        name: "Mạch dẫn đầu (Leading Strand)",
        role: "Tổng hợp liên tục cùng chiều với chiều tháo xoắn.",
        color: "bg-green-500",
      },
      {
        name: "Mạch ra chậm (Lagging Strand)",
        role: "Tổng hợp gián đoạn ngược chiều tháo xoắn tạo các đoạn Okazaki.",
        color: "bg-amber-500",
      },
      {
        name: "Enzyme Nối (Ligase)",
        role: "Gắn các đoạn Okazaki lại thành một mạch đơn hoàn chỉnh.",
        color: "bg-purple-500",
      },
    ],
    steps: [
      {
        title: "Tháo xoắn DNA",
        description:
          "Enzyme Helicase bám vào điểm khởi đầu, cắt đứt các liên kết hydro để tách hai mạch đơn, để lộ chạc chữ Y.",
      },
      {
        title: "Tổng hợp mạch mới",
        description:
          "DNA Polymerase tổng hợp mạch dẫn đầu liên tục. Mạch ra chậm được tổng hợp gián đoạn thành các đoạn Okazaki nhờ mồi ARN.",
      },
      {
        title: "Loại bỏ mồi & Nối đoạn",
        description:
          "Enzyme Ligase nối các đoạn Okazaki lại với nhau sau khi mồi ARN được thay thế bằng DNA, tạo ra hai phân tử DNA con giống hệt mẹ.",
      },
    ],
    facts: [
      "Quá trình sao chép DNA diễn ra với tốc độ đáng kinh ngạc: khoảng 50 nucleotide mỗi giây ở người và lên đến 1000 nucleotide/giây ở vi khuẩn!",
      "Nhờ cơ chế sửa sai tự động của DNA Polymerase, tỷ lệ lỗi chỉ khoảng 1 trên 1 tỷ nucleotide được sao chép.",
      "Mỗi tế bào người chứa khoảng 2 mét DNA, tất cả được cuộn cực kỳ chặt để vừa khít trong nhân tế bào chỉ rộng vài micromet.",
    ],
  },
  {
    id: "gene-structure",
    title: "Cấu trúc chức năng của Gene",
    shortDesc:
      "Phân tích cấu trúc 3 vùng chức năng cốt lõi của một gene cấu trúc điển hình.",
    detailedDesc:
      "Gene là một đoạn phân tử DNA mang thông tin mã hóa cho một sản phẩm nhất định (chuỗi polypeptide hoặc ARN). Một gene cấu trúc ở sinh vật nhân sơ và nhân thực có sơ đồ tổ chức đặc trưng gồm 3 vùng trình tự nucleotide.",
    color: "teal",
    badge: "Căn bản",
    mechanismTitle: "Sơ đồ 3 Vùng Chức Năng",
    components: [
      {
        name: "Vùng Điều hòa (Promoter)",
        role: "Nằm ở đầu 3' mạch mã gốc, chứa trình tự nhận biết và bám của RNA Polymerase.",
        color: "bg-teal-600",
      },
      {
        name: "Vùng Mã hóa (Coding Region)",
        role: "Mang thông tin mã hóa amino acid. Ở nhân thực gồm Exon (mã hóa) và Intron (không mã hóa).",
        color: "bg-indigo-500",
      },
      {
        name: "Vùng Kết thúc (Terminator)",
        role: "Nằm ở đầu 5' mạch mã gốc, mang tín hiệu dừng quá trình phiên mã.",
        color: "bg-rose-500",
      },
      {
        name: "Hộp TATA (TATA Box)",
        role: "Trình tự đồng thuận quan trọng trong vùng điều hòa giúp định hướng phiên mã chính xác.",
        color: "bg-amber-400",
      },
    ],
    steps: [
      {
        title: "Khởi động (Điều hòa)",
        description:
          "RNA Polymerase nhận biết trình tự khởi động và liên kết chặt để chuẩn bị tháo xoắn và bắt đầu phiên mã.",
      },
      {
        title: "Mã hóa & Splicing",
        description:
          "Đoạn gene được phiên mã. Ở sinh vật nhân thực, các đoạn Intron vô nghĩa sẽ được cắt bỏ, nối các Exon lại để tạo mARN trưởng thành.",
      },
      {
        title: "Tín hiệu Kết thúc",
        description:
          "Enzyme đi qua vùng kết thúc, nhận tín hiệu dừng giải phóng phân tử ARN và tách khỏi sợi DNA.",
      },
    ],
    facts: [
      "Khoảng 98% DNA của con người được gọi là 'non-coding DNA' (không mã hóa protein), đóng vai trò điều hòa hoạt động của các gene mã hóa.",
      "Ở sinh vật nhân thực, nhờ cơ chế ghép nối Exon thay thế (Alternative Splicing), một gene duy nhất có thể tạo ra nhiều loại protein khác nhau!",
      "Gene ngắn nhất mã hóa protein chỉ khoảng vài chục cặp nucleotide, trong khi gene lớn nhất (Dystrophin) dài tới 2.4 triệu cặp nucleotide.",
    ],
  },
  {
    id: "transcription-translation",
    title: "Phiên mã & Dịch mã",
    shortDesc:
      "Xem luồng truyền đạt thông tin di truyền từ DNA -> ARN -> Chuỗi Polypeptide.",
    detailedDesc:
      "Quá trình biểu hiện gene gồm 2 giai đoạn chính: Phiên mã chuyển đổi mật mã DNA thành mARN trung gian, sau đó Dịch mã tại ribosome dịch ngôn ngữ nucleotide thành ngôn ngữ amino acid để tổng hợp protein chức năng.",
    color: "indigo",
    badge: "Trực quan nhất",
    mechanismTitle: "Quá trình truyền thông tin",
    components: [
      {
        name: "RNA Polymerase",
        role: "Vừa tháo xoắn DNA vừa trượt dọc mạch gốc tổng hợp sợi mARN bổ sung.",
        color: "bg-purple-600",
      },
      {
        name: "mARN (Thông tin)",
        role: "Bản mã sao mang thông tin di truyền từ nhân tế bào ra tế bào chất.",
        color: "bg-cyan-500",
      },
      {
        name: "tARN (Vận chuyển)",
        role: "Mang amino acid đặc hiệu đến ribosome và đối chiếu khớp mã codon - anticodon.",
        color: "bg-rose-500",
      },
      {
        name: "Ribosome (Ribosome Subunits)",
        role: "Cỗ máy lắp ráp protein gồm hai tiểu phần lớn và nhỏ trượt dọc mARN.",
        color: "bg-emerald-500",
      },
    ],
    steps: [
      {
        title: "Phiên mã tạo mARN",
        description:
          "RNA Polymerase sử dụng mạch gốc 3'->5' của DNA làm khuôn để tổng hợp phân tử mARN theo nguyên tắc bổ sung (A-U, G-X).",
      },
      {
        title: "Hoạt hóa Amino Acid & Khởi đầu",
        description:
          "Các tARN mang amino acid tương ứng được hoạt hóa. Ribosome bám vào codon khởi đầu AUG trên mARN.",
      },
      {
        title: "Kéo dài & Kết thúc chuỗi",
        description:
          "Ribosome dịch chuyển từng bộ ba. Amino acid liên kết với nhau bằng liên kết peptide. Gặp codon kết thúc (UAA, UAG, UGA), chuỗi Polypeptide được giải phóng.",
      },
    ],
    facts: [
      "Codon khởi đầu AUG luôn mã hóa cho amino acid Methionine ở sinh vật nhân thực (hoặc Formyl-methionine ở nhân sơ).",
      "Mã di truyền có tính thoái hóa, nghĩa là nhiều codon khác nhau có thể cùng mã hóa cho một loại amino acid (ví dụ: 6 codon cùng mã hóa Leucine).",
      "Ribosome hoạt động hiệu quả đến mức có thể kết nối 20 amino acid mỗi giây tạo thành chuỗi polypeptide.",
    ],
  },
  {
    id: "gene-regulation",
    title: "Điều hòa biểu hiện Gene",
    shortDesc:
      "Cơ chế đóng/mở hệ thống Operon Lac ở vi khuẩn theo nguồn dinh dưỡng môi trường.",
    detailedDesc:
      "Tế bào không biểu hiện tất cả các gene cùng một lúc để tránh lãng phí năng lượng. Mô hình Operon Lac ở vi khuẩn E.coli mô tả cách tế bào bật hoặc tắt các gene phân giải lactose tùy thuộc vào sự hiện diện của đường này trong môi trường.",
    color: "fuchsia",
    badge: "Logic Cao",
    mechanismTitle: "Cơ chế hoạt động của Lac Operon",
    components: [
      {
        name: "Gene điều hòa (LacI)",
        role: "Tổng hợp protein ức chế hoạt động liên tục bất kể có lactose hay không.",
        color: "bg-slate-600",
      },
      {
        name: "Vùng Vận hành (Operator)",
        role: "Nơi protein ức chế liên kết để chặn RNA Polymerase trượt qua.",
        color: "bg-fuchsia-600",
      },
      {
        name: "Nhóm gene cấu trúc (LacZ, Y, A)",
        role: "Mã hóa các enzyme phân giải đường lactose.",
        color: "bg-blue-600",
      },
      {
        name: "Chất cảm ứng (Lactose/Allolactose)",
        role: "Liên kết với protein ức chế, làm thay đổi cấu hình khiến nó mất khả năng bám Operator.",
        color: "bg-amber-500",
      },
    ],
    steps: [
      {
        title: "Trạng thái tắt (Không Lactose)",
        description:
          "Protein ức chế bám chặt vào Operator, ngăn cản RNA Polymerase phiên mã nhóm gene cấu trúc. Không có enzyme nào được tạo ra.",
      },
      {
        title: "Trạng thái bật (Có Lactose)",
        description:
          "Allolactose liên kết với protein ức chế làm nó biến dạng và rơi khỏi Operator. RNA Polymerase tự do phiên mã.",
      },
      {
        title: "Phân giải & Tắt lại",
        description:
          "Các enzyme được tạo ra tiêu hóa hết Lactose. Khi không còn Lactose, protein ức chế trở lại trạng thái hoạt động và đóng Operon lại.",
      },
    ],
    facts: [
      "Mô hình Operon Lac được phát hiện bởi Francois Jacob và Jacques Monod vào năm 1961, mang về cho họ giải Nobel Y học năm 1965.",
      "Đây là ví dụ kinh điển về cơ chế điều hòa ngược âm tính (negative feedback loop) trong sinh học phân tử.",
      "Ở sinh vật nhân thực phức tạp hơn nhiều, việc điều hòa gene có thể diễn ra ở mức chất nhiễm sắc cuộn xoắn, mức phiên mã, sau phiên mã, dịch mã và cả sau dịch mã.",
    ],
  },
  {
    id: "gene-mutation",
    title: "Đột biến Gene",
    shortDesc:
      "Minh họa trực quan các loại đột biến điểm và ảnh hưởng của chúng lên chuỗi protein.",
    detailedDesc:
      "Đột biến gene là những biến đổi nhỏ trong cấu trúc của gene, liên quan đến một hoặc một vài cặp nucleotide (đột biến điểm). Các tác nhân vật lý, hóa học hoặc lỗi tự sao chép có thể dẫn đến thay đổi trình tự amino acid, làm thay đổi chức năng protein.",
    color: "rose",
    badge: "Y học & Tiến hóa",
    mechanismTitle: "Phân loại Đột Biến Điểm",
    components: [
      {
        name: "Đột biến Thay thế (Substitution)",
        role: "Một cặp nucleotide được thay bằng cặp khác. Có thể gây đột biến im lặng, sai nghĩa hoặc vô nghĩa.",
        color: "bg-rose-500",
      },
      {
        name: "Đột biến Thêm (Insertion)",
        role: "Thêm một hoặc nhiều cặp nucleotide vào gene, gây dịch khung đọc mã di truyền (frameshift).",
        color: "bg-orange-500",
      },
      {
        name: "Đột biến Mất (Deletion)",
        role: "Mất đi một hoặc nhiều cặp nucleotide, thay đổi hoàn toàn các codon phía sau điểm đột biến.",
        color: "bg-red-600",
      },
      {
        name: "Đột biến Dịch khung (Frameshift)",
        role: "Làm dịch lệch khung đọc 3 nucleotide, dẫn đến chuỗi amino acid bị thay đổi hoàn toàn kể từ vị trí đột biến.",
        color: "bg-violet-600",
      },
    ],
    steps: [
      {
        title: "Tác nhân gây đột biến",
        description:
          "Tia UV, hóa chất độc hại (như 5-BU) hoặc sai sót ngẫu nhiên làm biến đổi cấu trúc hóa học của base nitơ.",
      },
      {
        title: "Cố định đột biến",
        description:
          "Nếu tế bào không sửa chữa kịp trước khi nhân đôi, lỗi base nitơ sẽ liên kết bắt cặp sai, dẫn đến thay đổi vĩnh viễn ở thế hệ sau.",
      },
      {
        title: "Biểu hiện kiểu hình",
        description:
          "Đột biến làm codon thay đổi. Amino acid mới được gắn vào, protein có thể bị mất hoạt tính, hoạt tính yếu đi hoặc hiếm hơn là có lợi.",
      },
    ],
    facts: [
      "Không phải đột biến nào cũng xấu! Đột biến là nguồn nguyên liệu sơ cấp duy nhất tạo ra các alen mới, thúc đẩy sự đa dạng sinh học và quá trình tiến hóa.",
      "Bệnh hồng cầu hình liềm ở người là kết quả của một đột biến thay thế duy nhất (A thành T) trong gene mã hóa chuỗi beta-globin.",
      "Một số đột biến lại mang lại siêu năng lực, như đột biến gene LRP5 giúp xương người cực kỳ đặc và gần như không thể gãy!",
    ],
  },
  {
    id: "genetic-engineering",
    title: "Công nghệ Di truyền (CRISPR)",
    shortDesc:
      "Khám phá cơ chế hoạt động của chiếc kéo sinh học CRISPR-Cas9 chỉnh sửa DNA đích.",
    detailedDesc:
      "Công nghệ di truyền cho phép con người can thiệp trực tiếp vào bộ gene của sinh vật. Đỉnh cao hiện nay là hệ thống CRISPR-Cas9 - công cụ chỉnh sửa gene chuẩn xác như lệnh 'tìm và thay thế' trong soạn thảo văn bản.",
    color: "amber",
    badge: "Công nghệ Mới",
    mechanismTitle: "Cơ chế chỉnh sửa gene CRISPR-Cas9",
    components: [
      {
        name: "Enzyme Cas9 (Kéo cắt)",
        role: "Nuclease có nhiệm vụ cắt hai mạch đơn của phân tử DNA tại vị trí được chỉ định.",
        color: "bg-blue-600",
      },
      {
        name: "ARN hướng dẫn (gRNA)",
        role: "Đoạn ARN ngắn có trình tự bổ sung chính xác với vùng DNA đích để dẫn đường cho Cas9.",
        color: "bg-fuchsia-500",
      },
      {
        name: "Trình tự PAM (Trình tự nhận biết)",
        role: "Trình tự DNA ngắn (2-6 base) đứng cạnh vùng đích, giúp Cas9 phân biệt DNA đích và DNA của vi khuẩn.",
        color: "bg-amber-500",
      },
      {
        name: "Cơ chế tự sửa chữa DNA",
        role: "Tế bào nối lại vết cắt bằng cách nối trực tiếp (gây đột biến mất/thêm) hoặc sửa chữa theo khuôn mẫu (chèn gene mới).",
        color: "bg-emerald-500",
      },
    ],
    steps: [
      {
        title: "Nhắm mục tiêu (Targeting)",
        description:
          "Phức hợp Cas9-gRNA trượt trên DNA cho đến khi gRNA tìm thấy và liên kết hoàn toàn bổ sung với trình tự DNA đích.",
      },
      {
        title: "Cắt đứt mạch kép (Cleaving)",
        description:
          "Cas9 thực hiện cắt đứt hai mạch của sợi DNA tại vị trí cách PAM đúng 3 cặp base nitơ.",
      },
      {
        title: "Chỉnh sửa (Editing)",
        description:
          "Tế bào cố gắng sửa vết cắt. Các nhà khoa học có thể đưa một đoạn gene mẫu vào để tế bào chép đoạn gene mong muốn vào đúng khe cắt.",
      },
    ],
    facts: [
      "CRISPR ban đầu được phát hiện như một hệ thống miễn dịch tự nhiên của vi khuẩn chống lại virus xâm nhiễm.",
      "Jennifer Doudna và Emmanuelle Charpentier đã nhận giải Nobel Hóa học năm 2020 cho việc phát triển công nghệ CRISPR-Cas9.",
      "CRISPR đang được thử nghiệm để điều trị các bệnh di truyền nan y, tạo ra các giống cây trồng siêu năng suất chống chịu biến đổi khí hậu.",
    ],
  },
];

export default function SketchLab() {
  const [activeTopicId, setActiveTopicId] = useState<string>("dna-replication");
  const [activeTab, setActiveTab] = useState<
    "structure" | "mechanism" | "facts"
  >("structure");

  // Simulation Interactive States
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [rotation, setRotation] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [isXRay, setIsXRay] = useState<boolean>(false);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [animationStep, setAnimationStep] = useState<number>(0);

  const activeTopic = TOPICS.find((t) => t.id === activeTopicId) || TOPICS[0];

  // Auto animation step trigger
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setAnimationStep((prev) => (prev + 1) % 60); // 60 frame loop
        // Slow rotation automatically if playing
        setRotation((prev) => (prev + 0.5) % 360);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Reset interactive controls on topic change
  useEffect(() => {
    setRotation(0);
    setZoom(1);
    setIsXRay(false);
    setIsExploded(false);
    setAnimationStep(0);
  }, [activeTopicId]);

  const handleResetControls = () => {
    setRotation(0);
    setZoom(1);
    setIsXRay(false);
    setIsExploded(false);
  };

  // Color mappings
  const getColorClass = (color: string) => {
    switch (color) {
      case "emerald":
        return {
          text: "text-emerald-600",
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          accent: "bg-emerald-600",
          gradient: "from-emerald-50 via-teal-50 to-white",
          glow: "shadow-emerald-200/50",
        };
      case "teal":
        return {
          text: "text-teal-600",
          bg: "bg-teal-50",
          border: "border-teal-100",
          accent: "bg-teal-600",
          gradient: "from-teal-50 via-cyan-50 to-white",
          glow: "shadow-teal-200/50",
        };
      case "indigo":
        return {
          text: "text-indigo-600",
          bg: "bg-indigo-50",
          border: "border-indigo-100",
          accent: "bg-indigo-600",
          gradient: "from-indigo-50 via-purple-50 to-white",
          glow: "shadow-indigo-200/50",
        };
      case "fuchsia":
        return {
          text: "text-fuchsia-600",
          bg: "bg-fuchsia-50",
          border: "border-fuchsia-100",
          accent: "bg-fuchsia-600",
          gradient: "from-fuchsia-50 via-pink-50 to-white",
          glow: "shadow-fuchsia-200/50",
        };
      case "rose":
        return {
          text: "text-rose-600",
          bg: "bg-rose-50",
          border: "border-rose-100",
          accent: "bg-rose-600",
          gradient: "from-rose-50 via-red-50 to-white",
          glow: "shadow-rose-200/50",
        };
      case "amber":
        return {
          text: "text-amber-600",
          bg: "bg-amber-50",
          border: "border-amber-100",
          accent: "bg-amber-600",
          gradient: "from-amber-50 via-orange-50 to-white",
          glow: "shadow-amber-200/50",
        };
      default:
        return {
          text: "text-emerald-600",
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          accent: "bg-emerald-600",
          gradient: "from-emerald-50 via-teal-50 to-white",
          glow: "shadow-emerald-200/50",
        };
    }
  };

  const style = getColorClass(activeTopic.color);

  // SVG animations based on active topic
  const renderSimulationViewport = () => {
    const isPlayingFrame = isPlaying;
    const currentStep = animationStep;

    switch (activeTopic.id) {
      case "dna-replication":
        return (
          <svg
            className="w-full h-full max-h-[380px] md:max-h-[440px]"
            viewBox="0 0 600 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "300px 200px",
                transition: "transform 0.1s ease-out",
              }}
            >
              {/* Grid Background */}
              {isXRay && (
                <path
                  d="M 0,50 L 600,50 M 0,100 L 600,100 M 0,150 L 600,150 M 0,200 L 600,200 M 0,250 L 600,250 M 0,300 L 600,300 M 0,350 L 600,350 M 50,0 L 50,400 M 100,0 L 100,400 M 150,0 L 150,400 M 200,0 L 200,400 M 250,0 L 250,400 M 300,0 L 300,400 M 350,0 L 350,400 M 400,0 L 400,400 M 450,0 L 450,400 M 500,0 L 500,400 M 550,0 L 550,400"
                  stroke="#10b981"
                  strokeWidth="0.5"
                  strokeOpacity="0.15"
                  strokeDasharray="3 3"
                />
              )}

              {/* Unzipped Parent Strands */}
              {/* Top strand */}
              <path
                d={
                  isExploded
                    ? "M 50,110 Q 220,110 320,80 T 550,40"
                    : "M 50,180 Q 220,180 320,100 T 550,80"
                }
                stroke={isXRay ? "#34d399" : "#10b981"}
                strokeWidth="6"
                strokeLinecap="round"
                strokeOpacity={isXRay ? "0.4" : "1"}
              />
              {/* Bottom strand */}
              <path
                d={
                  isExploded
                    ? "M 50,290 Q 220,290 320,320 T 550,360"
                    : "M 50,220 Q 220,220 320,300 T 550,320"
                }
                stroke={isXRay ? "#34d399" : "#10b981"}
                strokeWidth="6"
                strokeLinecap="round"
                strokeOpacity={isXRay ? "0.4" : "1"}
              />

              {/* Hydrogen bonds breaking / Base pairs */}
              {!isExploded && (
                <>
                  <line
                    x1="80"
                    y1="180"
                    x2="80"
                    y2="220"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="120"
                    y1="180"
                    x2="120"
                    y2="220"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="160"
                    y1="180"
                    x2="160"
                    y2="220"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="200"
                    y1="180"
                    x2="200"
                    y2="220"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />

                  {/* Chạc ba chữ Y base pairs */}
                  <line
                    x1="250"
                    y1="160"
                    x2="250"
                    y2="240"
                    stroke="#8b5cf6"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    strokeOpacity="0.5"
                  />
                  <line
                    x1="280"
                    y1="140"
                    x2="280"
                    y2="260"
                    stroke="#8b5cf6"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    strokeOpacity="0.3"
                  />
                </>
              )}

              {/* Helicase (Unzipping enzyme) - rotating slightly if playing */}
              <g
                transform={`translate(${230 + Math.sin(currentStep / 5) * 3}, 180)`}
              >
                <polygon
                  points="0,-25 35,0 0,25 -15,0"
                  fill={isXRay ? "none" : "#ef4444"}
                  stroke="#ef4444"
                  strokeWidth="3"
                  className={isXRay ? "animate-pulse" : ""}
                />
                <circle cx="10" cy="0" r="4" fill="white" />
                <text
                  x="-12"
                  y="-32"
                  fill="#ef4444"
                  className="text-[10px] font-black"
                  style={{ transform: "rotate(-rotation deg)" }}
                >
                  Helicase
                </text>
              </g>

              {/* DNA Polymerase III - Top Strand (Leading) */}
              <g
                transform={`translate(${380 + Math.sin(currentStep / 10) * 8}, ${isExploded ? 65 : 85})`}
              >
                <rect
                  x="-20"
                  y="-20"
                  width="40"
                  height="40"
                  rx="8"
                  fill={isXRay ? "none" : "#3b82f6"}
                  stroke="#3b82f6"
                  strokeWidth="3"
                />
                <text
                  x="-18"
                  y="-26"
                  fill="#3b82f6"
                  className="text-[10px] font-black"
                >
                  DNA Poly III
                </text>
                <circle
                  cx="0"
                  cy="0"
                  r="6"
                  fill="white"
                  className="animate-ping"
                />
              </g>

              {/* New Leading Strand (Synthesized continuously) */}
              <path
                d={
                  isExploded
                    ? `M 260,110 L ${380 + Math.sin(currentStep / 10) * 8}, 110`
                    : `M 260,180 L ${380 + Math.sin(currentStep / 10) * 8}, 125`
                }
                stroke="#3b82f6"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* DNA Polymerase III - Bottom Strand (Lagging) */}
              <g
                transform={`translate(${310 - Math.sin(currentStep / 15) * 6}, ${isExploded ? 305 : 290})`}
              >
                <rect
                  x="-20"
                  y="-20"
                  width="40"
                  height="40"
                  rx="8"
                  fill={isXRay ? "none" : "#f59e0b"}
                  stroke="#f59e0b"
                  strokeWidth="3"
                />
                <text
                  x="-25"
                  y="32"
                  fill="#f59e0b"
                  className="text-[10px] font-black"
                >
                  DNA Poly (Okazaki)
                </text>
              </g>

              {/* Okazaki Fragments */}
              <path
                d={
                  isExploded
                    ? "M 320,290 L 420,290 M 440,290 L 520,290"
                    : "M 325,280 L 400,295 M 420,302 L 500,312"
                }
                stroke="#f59e0b"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="15 5 25 5"
              />

              {/* Ligase (Nối) */}
              <g transform={`translate(420, ${isExploded ? 290 : 300})`}>
                <circle
                  r="15"
                  fill={isXRay ? "none" : "#8b5cf6"}
                  stroke="#8b5cf6"
                  strokeWidth="3"
                  className="animate-pulse"
                />
                <text
                  x="-18"
                  y="-20"
                  fill="#8b5cf6"
                  className="text-[10px] font-black"
                >
                  Ligase
                </text>
              </g>
            </g>
          </svg>
        );

      case "gene-structure":
        return (
          <svg
            className="w-full h-full max-h-[380px] md:max-h-[440px]"
            viewBox="0 0 600 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "300px 200px",
                transition: "transform 0.1s ease-out",
              }}
            >
              {/* Double stranded Gene block */}
              {/* Mạch mã gốc */}
              <path
                d="M 50,180 L 550,180"
                stroke="#475569"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Mạch bổ sung */}
              <path
                d="M 50,220 L 550,220"
                stroke="#94a3b8"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Base pairs linking the double strand */}
              {!isExploded &&
                Array.from({ length: 25 }).map((_, i) => (
                  <line
                    key={i}
                    x1={70 + i * 19}
                    y1="180"
                    x2={70 + i * 19}
                    y2="220"
                    stroke={i % 2 === 0 ? "#14b8a6" : "#6366f1"}
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                  />
                ))}

              {/* Vùng điều hòa (Promoter) */}
              <g
                transform={isExploded ? "translate(0, -30)" : "translate(0, 0)"}
                className="transition-transform duration-300"
              >
                <rect
                  x="70"
                  y="160"
                  width="120"
                  height="80"
                  rx="4"
                  fill="#0f766e"
                  fillOpacity={isXRay ? "0.2" : "0.85"}
                  stroke="#14b8a6"
                  strokeWidth="3"
                />
                <text
                  x="130"
                  y="205"
                  fill="white"
                  className="text-[12px] font-black"
                  textAnchor="middle"
                >
                  VÙNG ĐIỀU HÒA
                </text>
                <text
                  x="130"
                  y="222"
                  fill="#2dd4bf"
                  className="text-[9px] font-bold"
                  textAnchor="middle"
                >
                  (Promoter - TATA)
                </text>
              </g>

              {/* Vùng mã hóa (Coding Region) */}
              <g
                transform={isExploded ? "translate(0, 30)" : "translate(0, 0)"}
                className="transition-transform duration-300"
              >
                {/* Exon 1 */}
                <rect
                  x="200"
                  y="160"
                  width="100"
                  height="80"
                  rx="4"
                  fill="#4f46e5"
                  fillOpacity={isXRay ? "0.2" : "0.85"}
                  stroke="#6366f1"
                  strokeWidth="3"
                />
                <text
                  x="250"
                  y="205"
                  fill="white"
                  className="text-[12px] font-black"
                  textAnchor="middle"
                >
                  EXON 1
                </text>

                {/* Intron 1 (Spliced out in exploded view) */}
                <rect
                  x="305"
                  y="165"
                  width="80"
                  height="70"
                  rx="4"
                  fill="#f43f5e"
                  fillOpacity={isExploded ? "0.05" : isXRay ? "0.15" : "0.7"}
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeDasharray={isExploded ? "4 4" : "0"}
                  className="transition-all duration-300"
                />
                <text
                  x="345"
                  y="205"
                  fill={isExploded ? "#f43f5e" : "white"}
                  className="text-[11px] font-black"
                  textAnchor="middle"
                >
                  INTRON
                </text>

                {/* Exon 2 */}
                <rect
                  x="390"
                  y="160"
                  width="100"
                  height="80"
                  rx="4"
                  fill="#4f46e5"
                  fillOpacity={isXRay ? "0.2" : "0.85"}
                  stroke="#6366f1"
                  strokeWidth="3"
                />
                <text
                  x="440"
                  y="205"
                  fill="white"
                  className="text-[12px] font-black"
                  textAnchor="middle"
                >
                  EXON 2
                </text>
              </g>

              {/* Vùng kết thúc (Terminator) */}
              <g
                transform={isExploded ? "translate(0, -30)" : "translate(0, 0)"}
                className="transition-transform duration-300"
              >
                <rect
                  x="500"
                  y="160"
                  width="70"
                  height="80"
                  rx="4"
                  fill="#be123c"
                  fillOpacity={isXRay ? "0.2" : "0.85"}
                  stroke="#fb7185"
                  strokeWidth="3"
                />
                <text
                  x="535"
                  y="205"
                  fill="white"
                  className="text-[11px] font-black"
                  textAnchor="middle"
                >
                  KẾT THÚC
                </text>
              </g>

              {/* TATA Box highlighted in X-Ray */}
              {isXRay && (
                <g transform="translate(110, 140)">
                  <circle
                    r="12"
                    fill="#fbbf24"
                    fillOpacity="0.9"
                    className="animate-ping"
                  />
                  <circle r="8" fill="#d97706" />
                  <text
                    x="15"
                    y="4"
                    fill="#fbbf24"
                    className="text-[10px] font-bold"
                  >
                    Hộp TATA
                  </text>
                </g>
              )}

              {/* Splicing Arrows in Exploded View */}
              {isExploded && (
                <g className="animate-bounce">
                  <path
                    d="M 305,130 L 385,130"
                    stroke="#f43f5e"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                    markerEnd="url(#arrow)"
                  />
                  <text
                    x="345"
                    y="120"
                    fill="#f43f5e"
                    className="text-[10px] font-black"
                    textAnchor="middle"
                  >
                    Cắt bỏ Intron
                  </text>
                </g>
              )}
            </g>
          </svg>
        );

      case "transcription-translation":
        return (
          <svg
            className="w-full h-full max-h-[380px] md:max-h-[440px]"
            viewBox="0 0 600 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "300px 200px",
                transition: "transform 0.1s ease-out",
              }}
            >
              {/* DNA Template under transcription */}
              <path
                d="M 50,100 Q 200,80 300,100 T 550,100"
                stroke="#94a3b8"
                strokeWidth="3"
                strokeDasharray="5 5"
              />
              <path
                d="M 50,130 Q 200,150 300,130 T 550,130"
                stroke="#475569"
                strokeWidth="4"
              />

              {/* RNA Polymerase (Large translucent bubble) */}
              <g
                transform={`translate(${220 + Math.sin(currentStep / 8) * 12}, 115)`}
              >
                <ellipse
                  rx="60"
                  ry="40"
                  fill={isXRay ? "none" : "#8b5cf6"}
                  fillOpacity="0.25"
                  stroke="#8b5cf6"
                  strokeWidth="3.5"
                  strokeDasharray={isXRay ? "4 4" : "0"}
                />
                <text
                  x="0"
                  y="-22"
                  fill="#8b5cf6"
                  className="text-[10px] font-black"
                  textAnchor="middle"
                >
                  RNA Polymerase
                </text>
              </g>

              {/* Growing mRNA Strand */}
              <path
                d={`M 150,120 C 180,120 220,120 240,${120 + Math.sin(currentStep / 8) * 3} C 250,150 200,200 180,240`}
                stroke="#06b6d4"
                strokeWidth="4"
                strokeLinecap="round"
                className="animate-pulse"
              />
              <text
                x="130"
                y="245"
                fill="#06b6d4"
                className="text-[10px] font-black"
              >
                mARN mới tổng hợp
              </text>

              {/* Translation Scene (Bottom half of SVG) */}
              {/* Ribosome outline */}
              <g transform="translate(360, 260)">
                {/* Small Subunit */}
                <path
                  d="M -50,25 Q -40,35 0,35 Q 40,35 50,25 Q 35,10 0,10 Q -35,10 -50,25 Z"
                  fill={isXRay ? "none" : "#10b981"}
                  fillOpacity="0.8"
                  stroke="#10b981"
                  strokeWidth="3"
                />
                <text
                  x="0"
                  y="27"
                  fill="white"
                  className="text-[9px] font-bold"
                  textAnchor="middle"
                >
                  Tiểu phần nhỏ
                </text>

                {/* Large Subunit */}
                <path
                  d={
                    isExploded
                      ? "M -60,0 Q -40,-45 0,-45 Q 40,-45 60,0 Q 50,5 0,5 Q -50,5 -60,0 Z"
                      : "M -60,-5 Q -40,-45 0,-45 Q 40,-45 60,-5 Q 50,5 0,5 Q -50,5 -60,-5 Z"
                  }
                  fill={isXRay ? "none" : "#047857"}
                  fillOpacity="0.85"
                  stroke="#047857"
                  strokeWidth="3"
                  className="transition-transform duration-300"
                />
                <text
                  x="0"
                  y="-20"
                  fill="white"
                  className="text-[10px] font-black"
                  textAnchor="middle"
                >
                  Tiểu phần lớn
                </text>
              </g>

              {/* mRNA Strand inside ribosome */}
              <path
                d="M 280,265 L 480,265"
                stroke="#06b6d4"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Codon triplets */}
              <text
                x="320"
                y="280"
                fill="#06b6d4"
                className="text-[8px] font-black font-mono"
              >
                A U G
              </text>
              <text
                x="360"
                y="280"
                fill="#06b6d4"
                className="text-[8px] font-black font-mono"
              >
                X A G
              </text>
              <text
                x="400"
                y="280"
                fill="#06b6d4"
                className="text-[8px] font-black font-mono"
              >
                U U U
              </text>

              {/* tRNA (Yellow/pink keys) */}
              <g
                transform={`translate(${355 + Math.sin(currentStep / 15) * 2}, ${isExploded ? 200 : 230})`}
                className="transition-transform duration-300"
              >
                <path
                  d="M 0,0 L 5,-15 L -5,-15 Z"
                  fill="#ec4899"
                  stroke="#db2777"
                  strokeWidth="1.5"
                />
                <rect x="-3" y="-30" width="6" height="15" fill="#f59e0b" />
                <circle cx="0" cy="-35" r="7" fill="#f43f5e" />{" "}
                {/* Amino Acid */}
                <text
                  x="-6"
                  y="-32"
                  fill="white"
                  className="text-[6px] font-bold"
                >
                  Met
                </text>
                <text
                  x="0"
                  y="10"
                  fill="#ec4899"
                  className="text-[7px] font-mono font-bold"
                  textAnchor="middle"
                >
                  U A X
                </text>
              </g>

              {/* Growing Polypeptide Peptide Chain */}
              <g transform="translate(320, 180)">
                <circle cx="0" cy="0" r="6" fill="#ef4444" />
                <circle cx="10" cy="-10" r="6" fill="#f59e0b" />
                <circle cx="23" cy="-12" r="6" fill="#10b981" />
                <line
                  x1="0"
                  y1="0"
                  x2="10"
                  y2="-10"
                  stroke="#475569"
                  strokeWidth="2"
                />
                <line
                  x1="10"
                  y1="-10"
                  x2="23"
                  y2="-12"
                  stroke="#475569"
                  strokeWidth="2"
                />
                <text
                  x="35"
                  y="-12"
                  fill="#ef4444"
                  className="text-[9px] font-black"
                >
                  Chuỗi Polypeptide
                </text>
              </g>
            </g>
          </svg>
        );

      case "gene-regulation":
        const hasLactose = !isExploded; // We will use isExploded toggle as lactose toggle for user interaction simplicity in simulation!
        return (
          <svg
            className="w-full h-full max-h-[380px] md:max-h-[440px]"
            viewBox="0 0 600 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "300px 200px",
                transition: "transform 0.1s ease-out",
              }}
            >
              {/* Lac Operon DNA block */}
              <rect
                x="50"
                y="180"
                width="500"
                height="40"
                rx="6"
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="3"
              />

              {/* DNA Domains */}
              {/* Promoter */}
              <rect
                x="120"
                y="183"
                width="90"
                height="34"
                fill="#155e75"
                fillOpacity="0.8"
              />
              <text
                x="165"
                y="204"
                fill="white"
                className="text-[10px] font-black"
                textAnchor="middle"
              >
                Promoter (P)
              </text>

              {/* Operator */}
              <rect
                x="213"
                y="183"
                width="70"
                height="34"
                fill="#86198f"
                fillOpacity="0.8"
              />
              <text
                x="248"
                y="204"
                fill="white"
                className="text-[10px] font-black"
                textAnchor="middle"
              >
                Operator (O)
              </text>

              {/* LacZ, Y, A */}
              <rect
                x="286"
                y="183"
                width="80"
                height="34"
                fill="#1e3a8a"
                fillOpacity="0.8"
              />
              <text
                x="326"
                y="204"
                fill="white"
                className="text-[10px] font-black"
                textAnchor="middle"
              >
                Lac Z
              </text>

              <rect
                x="369"
                y="183"
                width="60"
                height="34"
                fill="#1e3a8a"
                fillOpacity="0.8"
              />
              <text
                x="399"
                y="204"
                fill="white"
                className="text-[10px] font-black"
                textAnchor="middle"
              >
                Lac Y
              </text>

              <rect
                x="432"
                y="183"
                width="60"
                height="34"
                fill="#1e3a8a"
                fillOpacity="0.8"
              />
              <text
                x="462"
                y="204"
                fill="white"
                className="text-[10px] font-black"
                textAnchor="middle"
              >
                Lac A
              </text>

              {/* Lactose Inducer Molecules */}
              {hasLactose && (
                <g className="animate-bounce">
                  <polygon
                    points="120,80 135,70 140,85 125,95"
                    fill="#f59e0b"
                    stroke="#d97706"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="150,95 160,85 170,98 155,105"
                    fill="#f59e0b"
                    stroke="#d97706"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="190,75 205,65 212,80 197,90"
                    fill="#f59e0b"
                    stroke="#d97706"
                    strokeWidth="1.5"
                  />
                  <text
                    x="160"
                    y="58"
                    fill="#f59e0b"
                    className="text-[10px] font-black"
                    textAnchor="middle"
                  >
                    Đường Lactose
                  </text>
                </g>
              )}

              {/* Repressor Protein (Protein ức chế) */}
              {hasLactose ? (
                /* Lactose present -> Repressor bound to lactose, inactive and detached from Operator */
                <g
                  transform="translate(190, 110)"
                  className="transition-all duration-500"
                >
                  <path
                    d="M 0,0 C 15,-15 35,-15 50,0 C 40,25 10,25 0,0 Z"
                    fill="#ef4444"
                    stroke="#dc2626"
                    strokeWidth="3"
                  />
                  <circle cx="25" cy="5" r="5" fill="#f59e0b" />{" "}
                  {/* Bound Lactose */}
                  <text
                    x="25"
                    y="-12"
                    fill="#ef4444"
                    className="text-[9px] font-black"
                    textAnchor="middle"
                  >
                    Ức chế bất hoạt
                  </text>
                </g>
              ) : (
                /* Lactose absent -> Repressor active and bám Operator */
                <g
                  transform="translate(223, 155)"
                  className="transition-all duration-500"
                >
                  <path
                    d="M 0,0 C 15,-15 35,-15 50,0 C 45,25 5,25 0,0 Z"
                    fill="#ef4444"
                    stroke="#dc2626"
                    strokeWidth="3"
                  />
                  <text
                    x="25"
                    y="-10"
                    fill="#ef4444"
                    className="text-[9px] font-black"
                    textAnchor="middle"
                  >
                    Ức chế bám chặn!
                  </text>
                  <circle
                    cx="25"
                    cy="8"
                    r="4"
                    fill="white"
                    className="animate-ping"
                  />
                </g>
              )}

              {/* RNA Polymerase transcription action */}
              {hasLactose ? (
                /* Free to transcribe */
                <g transform={`translate(${130 + currentStep * 4}, 165)`}>
                  <ellipse
                    rx="30"
                    ry="22"
                    fill="#8b5cf6"
                    fillOpacity="0.8"
                    stroke="#7c3aed"
                    strokeWidth="2"
                  />
                  <text
                    x="0"
                    y="3"
                    fill="white"
                    className="text-[8px] font-bold"
                    textAnchor="middle"
                  >
                    RNA Poly
                  </text>

                  {/* Growing mRNA transcripts if moving over Lac Z/Y/A */}
                  {currentStep > 25 && (
                    <path
                      d="M -15,10 Q -30,25 -20,38"
                      stroke="#06b6d4"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="animate-pulse"
                    />
                  )}
                </g>
              ) : (
                /* Blocked at promoter */
                <g transform="translate(135, 165)">
                  <ellipse
                    rx="30"
                    ry="22"
                    fill="#8b5cf6"
                    fillOpacity="0.4"
                    stroke="#7c3aed"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                  />
                  <text
                    x="0"
                    y="3"
                    fill="#7c3aed"
                    className="text-[8px] font-black"
                    textAnchor="middle"
                  >
                    BỊ CHẶN!
                  </text>
                </g>
              )}

              {/* Status HUD indicator */}
              <g transform="translate(250, 310)">
                <rect
                  x="-100"
                  y="0"
                  width="300"
                  height="40"
                  rx="8"
                  fill="white"
                  fillOpacity="0.9"
                  stroke={hasLactose ? "#10b981" : "#ef4444"}
                  strokeWidth="2"
                />
                <circle
                  cx="-75"
                  cy="20"
                  r="8"
                  fill={hasLactose ? "#10b981" : "#ef4444"}
                />
                <text
                  x="-55"
                  y="24"
                  fill="#1e293b"
                  className="text-[12px] font-bold"
                >
                  {hasLactose
                    ? "Môi trường CÓ Lactose: Operon MỞ (Có phiên mã)"
                    : "Môi trường KHÔNG Lactose: Operon ĐÓNG"}
                </text>
              </g>
            </g>
          </svg>
        );

      case "gene-mutation":
        const mutationType = isExploded ? "frameshift" : "substitution";
        return (
          <svg
            className="w-full h-full max-h-[380px] md:max-h-[440px]"
            viewBox="0 0 600 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "300px 200px",
                transition: "transform 0.1s ease-out",
              }}
            >
              {/* Normal DNA sequence */}
              <text
                x="50"
                y="80"
                fill="#475569"
                className="text-[13px] font-black"
              >
                GENE BÌNH THƯỜNG (BẢN GỐC)
              </text>
              <rect
                x="50"
                y="95"
                width="500"
                height="35"
                rx="6"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="2"
              />
              <text
                x="75"
                y="118"
                fill="#10b981"
                className="text-[13px] font-mono font-black"
                space="preserve"
              >
                T A X - G G A - T T X - A A A - X X G
              </text>
              <text
                x="75"
                y="145"
                fill="#64748b"
                className="text-[10px] font-bold"
              >
                Amino Acid dịch mã: Met - Pro - Lys - Phe - Gly
              </text>

              {/* Mutation Divider */}
              <line
                x1="50"
                y1="180"
                x2="550"
                y2="180"
                stroke="#cbd5e1"
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Mutated DNA sequence */}
              <text
                x="50"
                y="210"
                fill="#ef4444"
                className="text-[13px] font-black"
              >
                {mutationType === "frameshift"
                  ? "ĐỘT BIẾN MẤT CẶP NUCLEOTIDE (GÂY DỊCH KHUNG ĐỌC)"
                  : "ĐỘT BIẾN THAY THẾ CẶP NUCLEOTIDE (SAI NGHĨA)"}
              </text>

              <rect
                x="50"
                y="225"
                width="500"
                height="35"
                rx="6"
                fill="#1e293b"
                stroke="#ef4444"
                strokeWidth="2"
              />

              {mutationType === "frameshift" ? (
                /* Deletion mutation -> Shifted characters in red */
                <>
                  {/* Original was TAX-GGA-TTX-AAA... lost G at position 7 */}
                  <text
                    x="75"
                    y="248"
                    className="text-[13px] font-mono font-black"
                  >
                    <tspan fill="#10b981">T A X - </tspan>
                    <tspan fill="#ef4444">G A T - T X A - A A X - X G...</tspan>
                  </text>
                  <text
                    x="75"
                    y="278"
                    fill="#f43f5e"
                    className="text-[10px] font-black"
                  >
                    Protein đột biến: Met - Leu - Asn - Phe - (Sai toàn bộ khung
                    đọc phía sau!)
                  </text>

                  {/* Warning Indicator */}
                  <g transform="translate(195, 222)">
                    <circle
                      r="12"
                      fill="#ef4444"
                      fillOpacity="0.9"
                      className="animate-ping"
                    />
                    <circle r="8" fill="#ef4444" />
                    <text
                      x="15"
                      y="4"
                      fill="#ef4444"
                      className="text-[9px] font-black"
                    >
                      Mất cặp G-X
                    </text>
                  </g>
                </>
              ) : (
                /* Substitution mutation -> Single point change */
                <>
                  {/* Original was TAX-GGA-TTX, changed to TAX-AGA-TTX */}
                  <text
                    x="75"
                    y="248"
                    className="text-[13px] font-mono font-black"
                  >
                    <tspan fill="#10b981">T A X - </tspan>
                    <tspan fill="#ef4444">A</tspan>
                    <tspan fill="#10b981"> G A - T T X - A A A - X X G</tspan>
                  </text>
                  <text
                    x="75"
                    y="278"
                    fill="#f43f5e"
                    className="text-[10px] font-black"
                  >
                    Protein đột biến: Met - Ser (thay vì Pro) - Lys - Phe - Gly
                    (Chỉ đổi 1 amino acid)
                  </text>

                  {/* Highlight point change */}
                  <g transform="translate(178, 222)">
                    <circle
                      r="10"
                      fill="#f59e0b"
                      fillOpacity="0.9"
                      className="animate-ping"
                    />
                    <circle r="6" fill="#f59e0b" />
                    <text
                      x="12"
                      y="4"
                      fill="#f59e0b"
                      className="text-[9px] font-black"
                    >
                      Thay G thành A
                    </text>
                  </g>
                </>
              )}

              {/* DNA Helix visualization elements */}
              {isXRay && (
                <path
                  d="M 50,330 Q 150,300 250,330 T 450,330 T 550,330"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  className="animate-pulse"
                />
              )}
            </g>
          </svg>
        );

      case "genetic-engineering":
        const cutsDNA = isExploded;
        return (
          <svg
            className="w-full h-full max-h-[380px] md:max-h-[440px]"
            viewBox="0 0 600 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "300px 200px",
                transition: "transform 0.1s ease-out",
              }}
            >
              {/* Cas9 Protein - Huge blue blob */}
              <path
                d="M 120,130 C 150,70 380,50 440,110 C 510,180 460,300 360,320 C 260,340 180,310 130,260 C 90,210 90,180 120,130 Z"
                fill={isXRay ? "none" : "#1e40af"}
                fillOpacity="0.2"
                stroke="#1d4ed8"
                strokeWidth="4"
                strokeDasharray={isXRay ? "6 4" : "0"}
              />
              <text
                x="270"
                y="85"
                fill="#1d4ed8"
                className="text-[12px] font-black"
              >
                Enzyme Cas9 (Kéo sinh học)
              </text>

              {/* Target DNA strand inside Cas9 pocket */}
              {cutsDNA ? (
                /* Cut double strands separated */
                <>
                  {/* Left part */}
                  <path
                    d="M 50,180 L 220,180"
                    stroke="#10b981"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 50,220 L 220,220"
                    stroke="#10b981"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  {/* Right part */}
                  <path
                    d="M 270,180 L 550,180"
                    stroke="#10b981"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 270,220 L 550,220"
                    stroke="#10b981"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />

                  {/* Cut scissor sparks */}
                  <g transform="translate(245, 200)">
                    <circle
                      r="15"
                      fill="#f59e0b"
                      fillOpacity="0.5"
                      className="animate-ping"
                    />
                    <text
                      x="-15"
                      y="-22"
                      fill="#ef4444"
                      className="text-[11px] font-black"
                    >
                      CẮT ĐỨT MẠCH KÉP!
                    </text>
                  </g>
                </>
              ) : (
                /* Intact target DNA strand */
                <>
                  <path
                    d="M 50,180 L 550,180"
                    stroke="#10b981"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 50,220 L 550,220"
                    stroke="#10b981"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />

                  {/* Base pair lines under targeting */}
                  {Array.from({ length: 22 }).map((_, i) => (
                    <line
                      key={i}
                      x1={70 + i * 21}
                      y1="180"
                      x2={70 + i * 21}
                      y2="220"
                      stroke="#059669"
                      strokeWidth="1.5"
                      strokeOpacity="0.5"
                    />
                  ))}
                </>
              )}

              {/* guide RNA (gRNA) matching the DNA target site */}
              <path
                d="M 160,150 Q 200,150 245,180 L 380,180"
                stroke="#ec4899"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="animate-pulse"
              />
              <text
                x="180"
                y="142"
                fill="#ec4899"
                className="text-[10px] font-black"
              >
                ARN hướng dẫn (gRNA)
              </text>

              {/* Base pair matching between DNA and gRNA */}
              {!cutsDNA &&
                Array.from({ length: 6 }).map((_, i) => (
                  <line
                    key={i}
                    x1={265 + i * 20}
                    y1="180"
                    x2={265 + i * 20}
                    y2="200"
                    stroke="#ec4899"
                    strokeWidth="2"
                  />
                ))}

              {/* PAM Sequence highlighted */}
              <g transform="translate(390, 168)">
                <rect
                  x="0"
                  y="0"
                  width="35"
                  height="18"
                  rx="3"
                  fill="#f59e0b"
                />
                <text
                  x="17.5"
                  y="12"
                  fill="white"
                  className="text-[9px] font-black font-mono"
                  textAnchor="middle"
                >
                  PAM
                </text>
              </g>

              {/* Scissor icon representation */}
              <g
                transform={`translate(245, ${150 + Math.sin(currentStep / 5) * 6})`}
                className="transition-transform duration-100"
              >
                <path
                  d="M -15,-10 L 0,0 L -15,10 M 15,-10 L 0,0 L 15,10"
                  stroke="#ef4444"
                  strokeWidth="3"
                />
                <circle
                  cx="-15"
                  cy="-10"
                  r="4"
                  stroke="#ef4444"
                  strokeWidth="2"
                  fill="white"
                />
                <circle
                  cx="-15"
                  cy="10"
                  r="4"
                  stroke="#ef4444"
                  strokeWidth="2"
                  fill="white"
                />
              </g>
            </g>
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#f8fafc] text-[#0f172a]">
      {/* Upper Navigation / Back link */}
      <div className="mx-auto w-full max-w-[1440px] px-4 py-4 md:py-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/50 px-3 py-1.5 text-xs font-black uppercase text-emerald-600">
            <Cpu className="h-3.5 w-3.5" /> SketchLab Tương Tác 3D
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[14px] border border-slate-100 bg-gradient-to-br from-white via-emerald-50/10 to-white p-5 shadow-sm md:p-8 xl:p-10 mb-6">
          <div className="absolute inset-y-0 right-0 hidden w-[45%] bg-[radial-gradient(circle,#10b981_1.2px,transparent_1.2px)] opacity-[0.08] [background-size:20px_20px] lg:block" />

          <div className="relative max-w-4xl">
            <span className="mb-3.5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase text-emerald-600">
              <Sparkles className="h-3.5 w-3.5" /> Không ngừng cải tiến học liệu
            </span>
            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 md:text-4xl">
              Phòng Thí Nghiệm Hoạt Họa{" "}
              <span className="text-emerald-600">SketchLab Sinh Học</span>
            </h1>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-500 md:text-base">
              Hệ thống mô phỏng 3D trực quan, giả lập các cơ chế sinh học phân
              tử ở quy mô siêu hiển vi. Nhấp chọn chủ đề, tương tác phóng to,
              xoay và khám phá cấu trúc mã di truyền sâu sắc.
            </p>
          </div>
        </section>

        {/* Main Grid Workspace */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)_340px]">
          {/* Left Sidebar - Topic Switcher */}
          <aside className="space-y-4">
            <div className="rounded-[14px] border border-slate-100 bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-emerald-600" /> Chọn chủ đề
                nghiên cứu
              </h2>

              <div className="space-y-2">
                {TOPICS.map((topic) => {
                  const isActive = topic.id === activeTopicId;
                  const itemStyle = getColorClass(topic.color);

                  return (
                    <button
                      key={topic.id}
                      onClick={() => setActiveTopicId(topic.id)}
                      className={`relative w-full rounded-[10px] border p-3.5 text-left transition duration-200 flex flex-col gap-1.5 ${
                        isActive
                          ? `border-${topic.color}-200 bg-${topic.color}-50/40 text-${topic.color}-800 shadow-sm shadow-${topic.color}-100`
                          : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 text-slate-700"
                      }`}
                    >
                      {isActive && (
                        <span
                          className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${itemStyle.accent}`}
                        />
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-black leading-tight flex items-center gap-1.5">
                          <Dna
                            className={`h-4 w-4 shrink-0 ${isActive ? itemStyle.text : "text-slate-400"}`}
                          />
                          {topic.title}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                            isActive
                              ? `bg-${topic.color}-100 text-${topic.color}-700`
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {topic.badge}
                        </span>
                      </div>

                      <p className="text-[11px] font-semibold leading-normal text-slate-500 line-clamp-2">
                        {topic.shortDesc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ProTip Card */}
            <div className="rounded-[14px] border border-orange-100 bg-gradient-to-br from-amber-50/50 to-orange-50/30 p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <Lightbulb className="h-4 w-4" />
                </span>
                <h3 className="text-xs font-black text-amber-900">
                  Mẹo tương tác
                </h3>
              </div>
              <p className="text-[11px] font-semibold leading-relaxed text-amber-800/85">
                Bật nút <strong>X-Ray</strong> hoặc{" "}
                <strong>Phân rã (Explode)</strong> ở thanh công cụ bên dưới
                khung hình để có góc nhìn xuyên thấu các enzyme và phân tách các
                chuỗi mạch sinh học rõ nhất!
              </p>
            </div>
          </aside>

          {/* Center Column - 3D Interactive Showcase Viewport */}
          <section className="space-y-4">
            <div className="rounded-[14px] border border-slate-100 bg-white p-5 shadow-sm flex flex-col">
              {/* Header inside viewport */}
              <div className="mb-4 flex items-center justify-between border-b border-slate-50 pb-3">
                <div>
                  <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Activity
                      className={`h-5 w-5 animate-pulse ${style.text}`}
                    />
                    Góc nhìn Tương Tác: {activeTopic.title}
                  </h2>
                  <p className="text-[11px] font-semibold text-slate-400">
                    Bản phác thảo mô phỏng vi mô thời gian thực
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${isPlaying ? "bg-emerald-500 animate-ping" : "bg-rose-400"}`}
                  />
                  {isPlaying ? "Live Simulation" : "Tạm Dừng"}
                </span>
              </div>

              {/* Viewport Frame */}
              <div
                className={`relative overflow-hidden rounded-[10px] border border-slate-100 bg-gradient-to-b ${style.gradient} flex items-center justify-center min-h-[380px] md:min-h-[440px] shadow-inner`}
              >
                {/* Visual grid behind viewport */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:30px_30px] opacity-[0.25]" />

                {/* Dynamic rendered SVGs */}
                {renderSimulationViewport()}

                {/* X-Ray HUD Overlap Overlay */}
                {isXRay && (
                  <div className="absolute left-3 top-3 pointer-events-none rounded-[6px] border border-emerald-500/20 bg-emerald-950/80 px-2 py-1 text-[9px] font-mono font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5 animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    X-Ray Wireframe Mode Active
                  </div>
                )}
                {isExploded && (
                  <div className="absolute right-3 top-3 pointer-events-none rounded-[6px] border border-purple-500/20 bg-purple-950/80 px-2 py-1 text-[9px] font-mono font-black uppercase text-purple-400 tracking-wider flex items-center gap-1.5 animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                    Exploded Structure View
                  </div>
                )}
              </div>

              {/* Interactive Tool Control Bar */}
              <div className="mt-4 flex flex-wrap gap-2.5 items-center justify-between border-t border-slate-50 pt-3">
                <div className="flex flex-wrap gap-2">
                  {/* Play/Pause */}
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`inline-flex h-9 items-center gap-1.5 rounded-[8px] px-3.5 text-xs font-black text-white shadow-sm transition ${
                      isPlaying
                        ? "bg-slate-700 hover:bg-slate-800"
                        : `${style.accent} hover:opacity-90`
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-3.5 w-3.5 fill-current" /> Tạm dừng
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" /> Tiếp tục
                      </>
                    )}
                  </button>

                  {/* Reset view */}
                  <button
                    onClick={handleResetControls}
                    className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
                    title="Khôi phục góc nhìn mặc định"
                  >
                    <RotateCw className="h-3.5 w-3.5" /> Khôi phục
                  </button>
                </div>

                {/* Perspective & 3D Tools */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-bold text-slate-400 mr-1 uppercase">
                    Góc Nhìn:
                  </span>

                  {/* Zoom controls */}
                  <div className="inline-flex rounded-[8px] border border-slate-200 bg-white p-0.5 shadow-sm">
                    <button
                      onClick={() => setZoom(Math.max(0.6, zoom - 0.1))}
                      className="flex h-8 w-8 items-center justify-center rounded-[6px] text-slate-600 transition hover:bg-slate-50"
                      title="Thu nhỏ"
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
                    </button>
                    <span className="flex h-8 px-2 items-center justify-center text-[10px] font-black text-slate-500 font-mono">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
                      className="flex h-8 w-8 items-center justify-center rounded-[6px] text-slate-600 transition hover:bg-slate-50"
                      title="Phóng to"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Rotation Slider */}
                  <div className="flex items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-2.5 h-9 shadow-sm">
                    <span className="text-[10px] font-black text-slate-500 font-mono">
                      Xoay:
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>

                  {/* X-Ray Toggle */}
                  <button
                    onClick={() => setIsXRay(!isXRay)}
                    className={`flex h-9 w-9 items-center justify-center rounded-[8px] border transition shadow-sm ${
                      isXRay
                        ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                    title={
                      isXRay
                        ? "Tắt chế độ X-Ray"
                        : "Bật chế độ xuyên thấu X-Ray"
                    }
                  >
                    {isXRay ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {/* Exploded View Toggle */}
                  <button
                    onClick={() => setIsExploded(!isExploded)}
                    className={`inline-flex h-9 items-center gap-1 px-3 rounded-[8px] border text-xs font-black transition shadow-sm ${
                      isExploded
                        ? "border-purple-300 bg-purple-50 text-purple-600"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                    title={
                      activeTopic.id === "gene-regulation"
                        ? "Bật/Tắt đường Lactose"
                        : "Tách rã cấu trúc"
                    }
                  >
                    {activeTopic.id === "gene-regulation"
                      ? isExploded
                        ? "Thêm Lactose"
                        : "Bỏ Lactose"
                      : "Phân rã"}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom info section - general description */}
            <div className="rounded-[14px] border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-base font-black text-slate-800 mb-2">
                Giới thiệu chi tiết
              </h3>
              <p className="text-xs font-semibold leading-relaxed text-slate-500">
                {activeTopic.detailedDesc}
              </p>
            </div>
          </section>

          {/* Right Sidebar - Educational Data & Tabs */}
          <aside className="space-y-4">
            {/* Tabs control */}
            <div className="rounded-[14px] border border-slate-100 bg-white p-1.5 shadow-sm flex gap-1">
              <button
                onClick={() => setActiveTab("structure")}
                className={`flex-1 py-2 text-center text-[11px] font-black rounded-[8px] transition ${
                  activeTab === "structure"
                    ? `${style.bg} ${style.text}`
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Cấu trúc
              </button>
              <button
                onClick={() => setActiveTab("mechanism")}
                className={`flex-1 py-2 text-center text-[11px] font-black rounded-[8px] transition ${
                  activeTab === "mechanism"
                    ? `${style.bg} ${style.text}`
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Cơ chế
              </button>
              <button
                onClick={() => setActiveTab("facts")}
                className={`flex-1 py-2 text-center text-[11px] font-black rounded-[8px] transition ${
                  activeTab === "facts"
                    ? `${style.bg} ${style.text}`
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Thú vị
              </button>
            </div>

            {/* Active tab content block */}
            <div className="rounded-[14px] border border-slate-100 bg-white p-5 shadow-sm min-h-[300px]">
              {activeTab === "structure" && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-emerald-600" /> Bào quan
                    & Thành phần tham gia
                  </h3>

                  <div className="space-y-3.5">
                    {activeTopic.components.map((comp) => (
                      <div key={comp.name} className="flex gap-3">
                        <span
                          className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${comp.color} ring-4 ring-slate-100`}
                        />
                        <div>
                          <h4 className="text-[12px] font-black text-slate-800 leading-tight">
                            {comp.name}
                          </h4>
                          <p className="mt-1 text-[11px] font-semibold leading-normal text-slate-400">
                            {comp.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "mechanism" && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-emerald-600" />{" "}
                    {activeTopic.mechanismTitle}
                  </h3>

                  <div className="relative pl-4 border-l-2 border-slate-100 ml-2.5 space-y-5">
                    {activeTopic.steps.map((step, idx) => (
                      <div key={step.title} className="relative">
                        {/* Number bullet */}
                        <span
                          className={`absolute -left-[23px] top-0 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white ${style.accent}`}
                        >
                          {idx + 1}
                        </span>

                        <h4 className="text-[12px] font-black text-slate-800 leading-none">
                          {step.title}
                        </h4>
                        <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-400">
                          {step.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "facts" && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-emerald-600" /> Bạn
                    có biết?
                  </h3>

                  <div className="space-y-4">
                    {activeTopic.facts.map((fact, idx) => (
                      <div
                        key={idx}
                        className="rounded-[10px] bg-slate-50 border border-slate-100 p-3.5"
                      >
                        <p className="text-[11px] font-semibold leading-relaxed text-slate-600">
                          {fact}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Practice button */}
            <div className="rounded-[14px] border border-slate-100 bg-white p-4 shadow-sm text-center">
              <h4 className="text-xs font-black text-slate-800">
                Đã hiểu rõ cơ chế di truyền?
              </h4>
              <p className="mt-1 text-[10px] font-semibold text-slate-400 leading-normal">
                Hãy tiến hành làm bài đánh giá luyện tập để đo đạc mức độ ghi
                nhớ bài giảng của bạn.
              </p>

              <Link
                to="/courses"
                className={`mt-4 inline-flex w-full h-10 items-center justify-center gap-2 rounded-[8px] ${style.accent} text-xs font-black text-white shadow-md ${style.glow} hover:opacity-95 transition`}
              >
                <CheckCircle className="h-4 w-4" /> Bắt đầu luyện tập
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
