// Base API client for the Rahhal backend.
// Reads token/userId from localStorage (key: "user").

export const API_BASE_URL = "https://rahhal-api.runasp.net";

export interface ApiResponse<T> {
  data: T | null;
  isSuccess: boolean;
  message: string;
  errorCode: number;
}

export class ApiError extends Error {
  errorCode: number;
  status: number;
  constructor(message: string, errorCode: number, status: number) {
    super(message);
    this.errorCode = errorCode;
    this.status = status;
  }
}

interface StoredUser {
  token?: string;
  userId?: string;
}

export const getStoredUser = (): StoredUser => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      token: parsed?.token,
      userId: parsed?.userId,
    };
  } catch {
    return {};
  }
};

export const getAuthToken = () => getStoredUser().token;
export const getUserId = () => getStoredUser().userId;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  query?: Record<string, string | number | undefined | null>;
  signal?: AbortSignal;
  auth?: boolean; // default true
}

const buildUrl = (path: string, query?: RequestOptions["query"]) => {
  const url = new URL(path.startsWith("http") ? path : `${API_BASE_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.append(k, String(v));
    });
  }
  return url.toString();
};

export async function apiRequest<T = unknown>(
  path: string,
  { method = "GET", body, query, signal, auth = true }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getAuthToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  let json: ApiResponse<T> | null = null;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    // Empty body or non-JSON response.
  }

  if (!res.ok || (json && json.isSuccess === false)) {
    const message = json?.message || `Request failed (${res.status})`;
    const code = json?.errorCode ?? res.status;
    throw new ApiError(message, code, res.status);
  }

  return (json?.data ?? null) as T;
}
