import { useEffect, useRef, useState, useCallback } from "react";
import { API_BASE_URL } from "./apiClient";

export type SseStatus = "connecting" | "connected" | "disconnected" | "error";

export interface UseSseOptions {
  /** Tự động kết nối lại sau khi mất (milliseconds). Default: 3000 */
  reconnectDelay?: number;
  /** Số lần thử lại tối đa. Default: Infinity */
  maxRetries?: number;
  /** Có bật SSE không — false để tạm tắt */
  enabled?: boolean;
}

export interface SseEvent {
  type: string;
  data: unknown;
}

/**
 * useSse — Hook kết nối SSE với auto-reconnect
 *
 * @param channel  Tên kênh SSE: "admin", "teacher", "student", "feedback/{courseId}"
 * @param onEvent  Callback nhận events (event name, parsed data)
 * @param options  Config tùy chọn
 */
export function useSse(
  channel: string | null,
  onEvent: (eventName: string, data: unknown) => void,
  options: UseSseOptions = {}
) {
  const { reconnectDelay = 3000, maxRetries = Infinity, enabled = true } = options;

  const [status, setStatus] = useState<SseStatus>("disconnected");
  const esRef = useRef<EventSource | null>(null);
  const retriesRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onEventRef = useRef(onEvent);

  // Giữ callback luôn fresh mà không trigger re-connect
  useEffect(() => {
    onEventRef.current = onEvent;
  });

  const connect = useCallback(() => {
    if (!channel || !enabled) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("error");
      return;
    }

    // Dọn connection cũ nếu có
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    const url = `${API_BASE_URL}/api/sse/${channel}?token=${encodeURIComponent(token)}`;

    setStatus("connecting");

    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener("connected", () => {
      setStatus("connected");
      retriesRef.current = 0;
    });

    // Lắng nghe tất cả custom events bằng generic message listener
    // Đây là cách đơn giản nhất để catch named events từ SSE
    const knownEvents = [
      "lesson-changed",
      "students-changed",
      "student-progress",
      "new-feedback",
      "new-reply",
      "feedback-changed",
      "lesson-completed",
      "test-submitted",
      "progress-changed",
    ];

    for (const eventName of knownEvents) {
      es.addEventListener(eventName, (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          onEventRef.current(eventName, parsed);
        } catch {
          onEventRef.current(eventName, e.data);
        }
      });
    }

    es.onerror = () => {
      es.close();
      esRef.current = null;
      setStatus("disconnected");

      if (retriesRef.current < maxRetries) {
        retriesRef.current += 1;
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, reconnectDelay);
      } else {
        setStatus("error");
      }
    };
  }, [channel, enabled, maxRetries, reconnectDelay]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      setStatus("disconnected");
    };
  }, [connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    setStatus("disconnected");
  }, []);

  return { status, disconnect, reconnect: connect };
}
