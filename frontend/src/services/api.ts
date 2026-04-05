const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      success: false,
      error: { code: "UNKNOWN", message: "Request failed", details: {} },
    }));
    throw err;
  }
  return res.json();
}

async function uploadFile<T>(
  path: string,
  file: File,
  fieldName: string = "file",
): Promise<T> {
  const form = new FormData();
  form.append(fieldName, file);

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { ...getAuthHeaders() },
    body: form,
  });
  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      success: false,
      error: { code: "UNKNOWN", message: "Upload failed", details: {} },
    }));
    throw err;
  }
  return res.json();
}

export const api = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "DELETE" }),

  upload: <T>(path: string, file: File, fieldName?: string) =>
    uploadFile<T>(path, file, fieldName),
};
