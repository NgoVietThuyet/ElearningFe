import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

type CacheRecord = {
  expiresAt: number;
  response: {
    data: unknown;
    status: number;
    statusText: string;
    headers: unknown;
  };
};

const CACHE_PREFIX = "edusmart:api-cache:";
const DEFAULT_TTL_MS = 5 * 60 * 1000;
const memoryCache = new Map<string, CacheRecord>();

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;

  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`)
    .join(",")}}`;
}

function getAuthScope() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) return "public";
  return `auth:${token.slice(-24)}`;
}

function getCacheKey(client: AxiosInstance, url?: string, config?: AxiosRequestConfig) {
  const baseURL = config?.baseURL || client.defaults.baseURL || "";
  const params = stableStringify(config?.params || {});
  return `${baseURL}|${url || ""}|${params}|${getAuthScope()}`;
}

function readCache(key: string): CacheRecord | null {
  const now = Date.now();
  const memoryRecord = memoryCache.get(key);
  if (memoryRecord) {
    if (memoryRecord.expiresAt > now) return memoryRecord;
    memoryCache.delete(key);
  }

  if (!canUseSessionStorage()) return null;

  const raw = window.sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
  if (!raw) return null;

  try {
    const record = JSON.parse(raw) as CacheRecord;
    if (record.expiresAt <= now) {
      window.sessionStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    memoryCache.set(key, record);
    return record;
  } catch {
    window.sessionStorage.removeItem(`${CACHE_PREFIX}${key}`);
    return null;
  }
}

function writeCache(key: string, response: AxiosResponse, ttlMs: number) {
  const record: CacheRecord = {
    expiresAt: Date.now() + ttlMs,
    response: {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    },
  };

  memoryCache.set(key, record);

  if (!canUseSessionStorage()) return;

  try {
    window.sessionStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(record));
  } catch {
    // Storage can be full or disabled; memory cache still works for this tab.
  }
}

export function clearApiCache() {
  memoryCache.clear();

  if (!canUseSessionStorage()) return;

  for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
    const key = window.sessionStorage.key(index);
    if (key?.startsWith(CACHE_PREFIX)) {
      window.sessionStorage.removeItem(key);
    }
  }
}

export function installApiCache(client: AxiosInstance, ttlMs = DEFAULT_TTL_MS) {
  const rawGet = client.get.bind(client);
  const rawPost = client.post.bind(client);
  const rawPut = client.put.bind(client);
  const rawPatch = client.patch.bind(client);
  const rawDelete = client.delete.bind(client);

  client.get = (async (url: string, config?: AxiosRequestConfig) => {
    const shouldBypass = config?.headers && "x-skip-cache" in config.headers;
    const key = getCacheKey(client, url, config);

    if (!shouldBypass) {
      const cached = readCache(key);
      if (cached) {
        return {
          data: cached.response.data,
          status: cached.response.status,
          statusText: cached.response.statusText,
          headers: cached.response.headers,
          config: config || {},
          request: undefined,
        } as AxiosResponse;
      }
    }

    const response = await rawGet(url, config);
    if (!shouldBypass && response.status >= 200 && response.status < 300) {
      writeCache(key, response, ttlMs);
    }
    return response;
  }) as AxiosInstance["get"];

  client.post = (async (...args: Parameters<AxiosInstance["post"]>) => {
    clearApiCache();
    return rawPost(...args);
  }) as AxiosInstance["post"];

  client.put = (async (...args: Parameters<AxiosInstance["put"]>) => {
    clearApiCache();
    return rawPut(...args);
  }) as AxiosInstance["put"];

  client.patch = (async (...args: Parameters<AxiosInstance["patch"]>) => {
    clearApiCache();
    return rawPatch(...args);
  }) as AxiosInstance["patch"];

  client.delete = (async (...args: Parameters<AxiosInstance["delete"]>) => {
    clearApiCache();
    return rawDelete(...args);
  }) as AxiosInstance["delete"];
}
