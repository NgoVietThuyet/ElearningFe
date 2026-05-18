import { API_BASE_URL } from "../api/apiClient";

export function resolveMediaUrl(url?: string | null) {
  if (!url) return "";

  if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${API_BASE_URL.replace(/\/$/, "")}${url}`;
  }

  return url;
}
