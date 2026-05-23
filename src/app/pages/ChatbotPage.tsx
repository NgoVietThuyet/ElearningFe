import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  Trash2, 
  Image, 
  Loader2, 
  X, 
  ChevronRight, 
  HelpCircle, 
  Dna, 
  Copy, 
  Check, 
  BookOpen, 
  ArrowRight,
  RefreshCw,
  Sparkle
} from "lucide-react";
import { chatbotApi, ChatMessage } from "../api/chatbotApi";
import { parseMarkdownAndMath } from "../utils/markdownParser";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

// Sample suggestions for Biology 12
const SUGGESTIONS = [
  {
    icon: "🧬",
    title: "Cấu trúc ADN và ARN",
    prompt: "Trình bày cấu trúc cấu tạo và chức năng chính của ADN và các loại ARN? So sánh sự khác nhau giữa chúng.",
  },
  {
    icon: "🧪",
    title: "Cơ chế nhân đôi DNA",
    prompt: "Hãy giải thích chi tiết các bước trong quá trình nhân đôi DNA ở sinh vật nhân sơ. Vai trò của các enzym là gì?",
  },
  {
    icon: "🧮",
    title: "Giải bài tập nucleotit",
    prompt: "Hướng dẫn mình các công thức và phương pháp giải bài tập tính số lượng nucleotit, chiều dài, số liên kết hydro và chu kì xoắn của gen.",
  },
  {
    icon: "🧩",
    title: "Phân biệt Quy luật di truyền",
    prompt: "Làm thế nào để phân biệt quy luật phân ly độc lập của Menđen và quy luật liên kết gen hoàn toàn? Cho ví dụ minh họa.",
  },
];

interface FrontendChatMessage extends ChatMessage {
  image?: string; // Stored in frontend to display what image the user uploaded
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<FrontendChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("genzbio_chat_history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        initializeWelcomeMessage();
      }
    } else {
      initializeWelcomeMessage();
    }
  }, []);

  // Save to localStorage whenever messages change
  const saveHistory = (newMessages: FrontendChatMessage[]) => {
    localStorage.setItem("genzbio_chat_history", JSON.stringify(newMessages));
  };

  const initializeWelcomeMessage = () => {
    const welcomeMsg: FrontendChatMessage = {
      role: "model",
      text: "Chào bạn! Mình là **GenZBio AI** — Trợ lý học tập thông minh chuyên sâu môn Sinh học lớp 12 tại hệ thống giáo dục EduSmart Việt Nam. 🧬⚡\n\nMình cực kỳ am hiểu về cấu trúc DNA, các cơ chế di truyền phân tử (nhân đôi, phiên mã, dịch mã, đột biến...) cũng như toàn bộ chương trình Sinh học 12.\n\nBạn có thể gửi câu hỏi lý thuyết, yêu cầu mình giải thích các quy luật di truyền hoặc thậm chí **chụp ảnh đề bài sinh học** rồi tải lên bằng biểu tượng 📷 dưới đây để mình hỗ trợ giải đáp từng bước nhé! Hãy đặt câu hỏi sinh học cho mình nào! 👇",
    };
    setMessages([welcomeMsg]);
    localStorage.setItem("genzbio_chat_history", JSON.stringify([welcomeMsg]));
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chỉ chọn tệp hình ảnh.");
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        toast.error("Vích thước ảnh tối đa là 4MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageMimeType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend !== undefined ? textToSend : input.trim();
    if (!messageText && !imagePreview) return;

    // Create user message object
    const userMsg: FrontendChatMessage = {
      role: "user",
      text: messageText,
      image: imagePreview || undefined,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveHistory(updatedMessages);
    setInput("");
    
    // Cache the image values and clear them from input state immediately
    const imgBase64 = imagePreview || undefined;
    const imgMime = imageMimeType || undefined;
    removeImage();
    
    setIsLoading(true);

    try {
      // Map history to server format (only role and text)
      const apiHistory = updatedMessages.slice(0, -1).map(msg => ({
        role: msg.role,
        text: msg.text
      }));

      const response = await chatbotApi.chat(messageText, apiHistory, imgBase64, imgMime);
      
      const modelMsg: FrontendChatMessage = {
        role: "model",
        text: response.data.reply
      };

      const finalMessages = [...updatedMessages, modelMsg];
      setMessages(finalMessages);
      saveHistory(finalMessages);
    } catch (err: any) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi gửi tin nhắn.");
      
      const errorMsg: FrontendChatMessage = {
        role: "model",
        text: "❌ **Đã xảy ra lỗi kết nối với máy chủ.** Vui lòng kiểm tra lại mạng hoặc thử lại sau giây lát."
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    toast.success("Đã sao chép nội dung tin nhắn!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện này không?")) {
      initializeWelcomeMessage();
      toast.success("Đã xóa lịch sử trò chuyện.");
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] w-full gap-5 overflow-hidden">
      {/* Left sidebar with details & suggestions */}
      <div className="hidden w-[280px] shrink-0 flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:flex">
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white shadow-md shadow-blue-100 animate-pulse">
              <Dna className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800">GenZBio AI</h2>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                Trực tuyến • Gemini 2.5
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-blue-600" /> Gợi ý câu hỏi nhanh
            </h3>
            <div className="space-y-2">
              {SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all duration-200 group relative overflow-hidden"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-sm shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors leading-tight mb-0.5">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                        {item.prompt}
                      </p>
                    </div>
                  </div>
                  <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-3 w-3 text-blue-600" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 mt-4 space-y-3">
          <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-3 text-[11px] text-slate-600 leading-relaxed flex gap-2">
            <HelpCircle className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Lưu ý học thuật:</strong> AI được thiết kế chỉ để trả lời về Sinh học 12 và DNA. Các câu hỏi ngoài lề sẽ bị hệ thống từ chối tự động.
            </span>
          </div>
          
          <Button
            variant="outline"
            onClick={clearChat}
            className="w-full justify-center gap-2 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-bold text-slate-500 transition-all duration-200 h-10 rounded-xl"
          >
            <Trash2 className="h-4 w-4" />
            Làm mới cuộc trò chuyện
          </Button>
        </div>
      </div>

      {/* Main chat window */}
      <div className="flex flex-1 flex-col rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden relative">
        {/* Floating background design elements representing cellular structure */}
        <div className="absolute top-10 left-10 w-48 h-48 bg-blue-100/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-indigo-100/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="z-10 flex items-center justify-between border-b border-slate-50 px-6 py-4 bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Dna className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black text-slate-900 tracking-tight">GenZBio AI</h1>
                <span className="rounded-full bg-blue-50 text-blue-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider border border-blue-100">Biology Bot</span>
              </div>
              <p className="text-[11px] text-[#98A2B3] font-bold">
                Trợ lý chuyên gia Sinh học lớp 12 & Di truyền phân tử
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              title="Làm mới trò chuyện"
              className="h-9 w-9 text-slate-400 hover:bg-slate-50 hover:text-slate-700 rounded-lg lg:hidden"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </Button>
            <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-slate-100 bg-[#F8F9FB] px-3 py-1 text-[11px] text-slate-500 font-bold">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>Học tập không giới hạn</span>
            </div>
          </div>
        </div>

        {/* Message body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 custom-scrollbar">
          {messages.map((msg, index) => {
            const isModel = msg.role === "model";
            return (
              <div
                key={index}
                className={`flex gap-4 ${isModel ? "justify-start" : "justify-end"}`}
              >
                {/* Robot Avatar for AI */}
                {isModel && (
                  <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                    <Sparkle className="h-4.5 w-4.5 animate-spin-slow" />
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`max-w-[85%] lg:max-w-[75%] space-y-1.5`}>
                  {/* Sender Name & Info */}
                  <div className={`flex items-center gap-2 px-1 text-[11px] font-bold text-slate-400 ${!isModel ? "flex-row-reverse" : ""}`}>
                    <span>{isModel ? "GenZBio AI" : "Bạn"}</span>
                    <span>•</span>
                    <span>Vừa xong</span>
                  </div>

                  <div className={`group relative rounded-2xl px-5 py-3.5 shadow-sm border ${
                    isModel 
                      ? "bg-white border-slate-100 text-slate-900 rounded-tl-sm" 
                      : "bg-white border-2 border-blue-500 text-slate-900 rounded-tr-sm shadow-sm"
                  }`}>
                    {/* Render User Uploaded Image inside Chat Bubble if exists */}
                    {!isModel && msg.image && (
                      <div className="mb-2.5 overflow-hidden rounded-xl border border-white/20 bg-slate-900 shadow-md">
                        <img 
                          src={msg.image} 
                          alt="User upload" 
                          className="max-h-[220px] max-w-full object-contain mx-auto"
                        />
                      </div>
                    )}

                    {/* Chat Text Rendered with Custom Markdown & LaTeX */}
                    <div 
                      className="text-xs leading-relaxed break-words markdown-content text-slate-900 select-text"
                      dangerouslySetInnerHTML={{ 
                        __html: isModel ? parseMarkdownAndMath(msg.text) : msg.text.replace(/\n/g, "<br />") 
                      }}
                    />

                    {/* Copy message content action for AI answers */}
                    {isModel && (
                      <button
                        onClick={() => copyToClipboard(msg.text, index)}
                        className="absolute -bottom-7 right-2 flex items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-400 opacity-0 shadow-sm hover:text-slate-700 hover:border-slate-200 transition-all duration-200 group-hover:opacity-100 z-20"
                        title="Sao chép câu trả lời"
                      >
                        {copiedId === index ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-500" />
                            <span className="text-emerald-500">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* User Avatar */}
                {!isModel && (
                  <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                    <span className="text-xs font-black">U</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* AI Typing Indicator */}
          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm animate-pulse">
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              </div>
              <div className="space-y-1.5 max-w-[70%]">
                <div className="px-1 text-[11px] font-bold text-slate-400">
                  GenZBio AI đang phân tích dữ liệu...
                </div>
                <div className="rounded-2xl px-5 py-4 border border-slate-100 bg-[#FCFDFE] text-slate-800 rounded-tl-sm flex items-center gap-2">
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-bold ml-1.5">Đang suy nghĩ...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Image upload preview floating above input */}
        {imagePreview && (
          <div className="absolute bottom-[80px] left-6 z-20 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/95 p-3 pr-4 shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-2 duration-300">
            <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-slate-100 bg-slate-900 shadow-inner">
              <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
              <button 
                onClick={removeImage}
                className="absolute top-0.5 right-0.5 rounded-full bg-slate-950/80 p-0.5 text-white hover:bg-red-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 leading-tight">Đã đính kèm ảnh bài tập</p>
              <p className="text-[10px] font-bold text-blue-600 mt-0.5">Sẽ gửi kèm câu hỏi của bạn</p>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="z-10 border-t border-slate-50 px-6 py-4 bg-white/90 backdrop-blur-md">
          <div className="flex items-end gap-3 rounded-2xl border border-slate-100 bg-[#F8F9FB] p-2.5 focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-md transition-all duration-300">
            {/* Image Attachment Button */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange}
              accept="image/*"
              className="hidden" 
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              title="Đính kèm ảnh đề bài"
              className={`h-11 w-11 shrink-0 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 ${imagePreview ? "text-blue-600 bg-blue-50/50" : ""}`}
            >
              <Image className="h-5 w-5" />
            </Button>

            {/* Input textarea */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={imagePreview ? "Viết câu hỏi cho ảnh bài tập này..." : "Hỏi về DNA, quy luật di truyền, cấu trúc gen..."}
              rows={1}
              className="flex-1 resize-none bg-transparent py-3 px-1 text-xs text-slate-800 focus:outline-none placeholder-slate-400 font-bold leading-normal min-h-[44px] max-h-[120px] custom-scrollbar"
              style={{ height: 'auto' }}
            />

            {/* Send Button */}
            <Button
              onClick={() => handleSendMessage()}
              disabled={isLoading || (!input.trim() && !imagePreview)}
              className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-md shadow-blue-100 disabled:from-slate-100 disabled:to-slate-100 disabled:text-slate-400 disabled:shadow-none transition-all duration-300"
            >
              <Send className="h-4.5 w-4.5" />
            </Button>
          </div>
          <div className="flex items-center justify-between px-2 mt-2">
            <span className="text-[10px] text-slate-400 font-bold">
              Nhấn Enter để gửi, Shift+Enter để xuống dòng
            </span>
            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-blue-600" /> Sinh học 12 EduSmart
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
