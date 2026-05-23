import { type SseStatus } from "../../api/sseClient";

interface LiveIndicatorProps {
  status: SseStatus;
  label?: string;
  className?: string;
}

/**
 * LiveIndicator — Badge nhỏ hiển thị trạng thái SSE real-time connection
 *
 * ● Live    → xanh + blink khi connected
 * ◌ Đang kết nối... → vàng + spin khi connecting
 * ○ Offline → xám khi disconnected / error
 */
export default function LiveIndicator({ status, label, className = "" }: LiveIndicatorProps) {
  if (status === "connected") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wider select-none ${className}`}
        title="Dữ liệu được cập nhật real-time"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        {label ?? "Live"}
      </span>
    );
  }

  if (status === "connecting") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black uppercase tracking-wider select-none ${className}`}
        title="Đang kết nối real-time..."
      >
        <span className="w-2 h-2 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        Kết nối...
      </span>
    );
  }

  // disconnected | error
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-wider select-none ${className}`}
      title="Không có kết nối real-time"
    >
      <span className="w-2 h-2 rounded-full bg-gray-300" />
      Offline
    </span>
  );
}
