import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { 
  MessageSquare, 
  X, 
  Send, 
  Image, 
  Loader2, 
  Sparkle,
  Trash2, 
  Dna, 
  BookOpen 
} from "lucide-react";
import { chatbotApi, ChatMessage } from "../../api/chatbotApi";
import { parseMarkdownAndMath } from "../../utils/markdownParser";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface FrontendChatMessage extends ChatMessage {
  image?: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<FrontendChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();



  // Load chat history from localStorage on mount (separate key for widget or same? Let's use the same so progress carries over! That is extremely satisfying UX!)
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

  const initializeWelcomeMessage = () => {
    const welcomeMsg: FrontendChatMessage = {
      role: "model",
      text: "Chào bạn! Mình là **GenZBio AI** 🧬. Cần mình giải đáp nhanh câu hỏi Sinh học 12 hay giải đề bài bằng hình ảnh không? Hãy nhắn tin cho mình nhé!",
    };
    setMessages([welcomeMsg]);
    localStorage.setItem("genzbio_chat_history", JSON.stringify([welcomeMsg]));
  };

  const saveHistory = (newMessages: FrontendChatMessage[]) => {
    localStorage.setItem("genzbio_chat_history", JSON.stringify(newMessages));
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 80);
    }
  }, [messages, isLoading, isOpen]);

  // Handle Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chỉ chọn hình ảnh.");
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        toast.error("Kích thước ảnh tối đa là 4MB.");
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
  const handleSendMessage = async () => {
    const messageText = input.trim();
    if (!messageText && !imagePreview) return;

    const userMsg: FrontendChatMessage = {
      role: "user",
      text: messageText,
      image: imagePreview || undefined,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveHistory(updatedMessages);
    setInput("");
    
    const imgBase64 = imagePreview || undefined;
    const imgMime = imageMimeType || undefined;
    removeImage();
    
    setIsLoading(true);

    try {
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
      const errorMsg: FrontendChatMessage = {
        role: "model",
        text: "❌ **Đã xảy ra lỗi kết nối.** Vui lòng thử lại sau."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm("Bạn muốn xóa lịch sử chat?")) {
      initializeWelcomeMessage();
      toast.success("Đã làm mới cuộc trò chuyện.");
    }
  };

  // Hide the floating widget on the full screen chatbot page, login, or signup
  if (location.pathname === "/chatbot" || location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Chat Bubble Window */}
      {isOpen && (
        <div className="mb-4 flex h-[480px] w-[350px] flex-col rounded-2xl border border-slate-100 bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 text-white shadow-md">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <Dna className="h-4.5 w-4.5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-tight leading-tight">GenZBio AI</h3>
                <span className="text-[9px] font-bold opacity-90 flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  Trợ lý Sinh học 12 trực tuyến
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={clearChat}
                title="Làm mới chat"
                className="rounded-lg p-1 hover:bg-white/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 custom-scrollbar">
            {messages.map((msg, idx) => {
              const isModel = msg.role === "model";
              return (
                <div key={idx} className={`flex gap-2.5 ${isModel ? "justify-start" : "justify-end"}`}>
                  {isModel && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shadow-sm mt-1">
                      <Sparkle className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div className="max-w-[80%] space-y-1">
                    <div className={`rounded-2xl px-3.5 py-2 text-xs shadow-sm border ${
                      isModel 
                        ? "bg-white border-slate-100 text-slate-900 rounded-tl-sm" 
                        : "bg-white border-2 border-blue-500 text-slate-900 rounded-tr-sm"
                    }`}>
                      {/* Image inside chat bubble if sent by user */}
                      {!isModel && msg.image && (
                        <div className="mb-1.5 overflow-hidden rounded-lg bg-slate-900 border border-white/10">
                          <img src={msg.image} alt="Upload" className="max-h-[120px] max-w-full object-contain mx-auto" />
                        </div>
                      )}
                      <div 
                        className="markdown-content leading-relaxed break-words"
                        dangerouslySetInnerHTML={{ 
                          __html: isModel ? parseMarkdownAndMath(msg.text) : msg.text.replace(/\n/g, "<br />") 
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 animate-pulse mt-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                </div>
                <div className="max-w-[70%]">
                  <div className="rounded-2xl px-3.5 py-2 border border-slate-100 bg-white text-slate-400 rounded-tl-sm text-[11px] font-bold flex items-center gap-1.5">
                    <span>Đang trả lời...</span>
                    <div className="flex space-x-1">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Floating Image Preview */}
          {imagePreview && (
            <div className="absolute bottom-[60px] left-4 z-20 flex items-center gap-2 rounded-xl border border-slate-100 bg-white/95 p-2 pr-3 shadow-lg backdrop-blur-sm animate-in slide-in-from-bottom-2">
              <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-slate-200 bg-slate-900 shadow-inner">
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                <button 
                  onClick={removeImage}
                  className="absolute top-0 right-0 rounded-full bg-slate-950/80 p-0.5 text-white hover:bg-red-600"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-800">Đã thêm ảnh đề</p>
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className="border-t border-slate-50 bg-white p-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-[#F8F9FB] p-1.5 focus-within:border-orange-100 focus-within:bg-white focus-within:shadow-inner transition-all duration-200">
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
                title="Đính kèm ảnh bài tập"
                className={`h-8 w-8 shrink-0 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 ${imagePreview ? "text-blue-600 bg-blue-50/50" : ""}`}
              >
                <Image className="h-4.5 w-4.5" />
              </Button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder={imagePreview ? "Hỏi về ảnh bài..." : "Hỏi nhanh ADN, di truyền..."}
                className="flex-1 bg-transparent py-1.5 px-1 text-xs text-slate-800 focus:outline-none placeholder-slate-400 font-bold"
              />

              <Button
                onClick={handleSendMessage}
                disabled={isLoading || (!input.trim() && !imagePreview)}
                className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-sm disabled:from-slate-100 disabled:to-slate-100 disabled:text-slate-400 disabled:shadow-none p-0 flex items-center justify-center transition-all duration-300"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Sparkle Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 text-white shadow-lg hover:shadow-blue-200/50 shadow-blue-100 transition-all duration-300 hover:scale-105 hover:rotate-12 active:scale-95 group relative border border-white/10"
      >
        {/* Soft glowing ripple effect */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 opacity-35 blur-md group-hover:opacity-50 animate-pulse transition-opacity"></span>
        
        {isOpen ? (
          <X className="h-6 w-6 relative z-10 animate-in spin-in duration-300" />
        ) : (
          <div className="relative z-10 flex items-center justify-center">
            <Dna className="h-6 w-6 relative group-hover:scale-110 transition-transform" />
            <Sparkle className="h-3.5 w-3.5 text-white absolute -top-1 -right-1 animate-pulse" />
          </div>
        )}
      </button>
    </div>
  );
}
