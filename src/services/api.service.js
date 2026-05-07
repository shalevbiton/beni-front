// frontend/src/services/api.service.js
import axios from "axios";

const API_CONFIG_HINT_HE =
  "לא נמצא שרת ה־API מהפרונט. בפרויקט הפרונט ב־Vercel: Settings → Environment Variables → VITE_API_BASE_URL = כתובת הבאק־אנד (למשל https://YOUR-BACKEND.vercel.app, בלי /api). שמרו ובצעו Redeploy (חובה לאחר שינוי משתנה — משתלב בזמן build).";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/** Turn API / axios error payloads into a single human-readable string. */
export function stringifyApiError(error, fallbackMessage = "An unexpected error occurred") {
  const status = error?.response?.status;
  const data = error?.response?.data;

  // Hosted frontend defaults to relative /api → on Vercel static hosting this returns 404 HTML (“Not Found” page).
  if (status === 404) {
    const bodyStr = typeof data === "string" ? data : "";
    const looksLikeHtml =
      /<!DOCTYPE html/i.test(bodyStr) ||
      /<html[\s>]/i.test(bodyStr) ||
      /could not be found/i.test(bodyStr) ||
      /\bnot found\b/i.test(bodyStr);
    const viteBase = String(import.meta.env.VITE_API_BASE_URL ?? "").trim();
    if (import.meta.env.PROD && !viteBase) return API_CONFIG_HINT_HE;
    if (looksLikeHtml) {
      return viteBase
        ? "הבקשה לא הגיעה לבאק־אנד (404). ייתכן ש־VITE_API_BASE_URL שגוי או שהבאק־אנד לא זמין — בדקו את הכתובת ונסו שוב."
        : API_CONFIG_HINT_HE;
    }
    return "הכתובת המבוקשת לא נמצאה (404). בדקו שכתובת הבאק־אנד ו־VITE_API_BASE_URL נכונים.";
  }

  if (error?.request && !error?.response) {
    return "אין תגובה מהשרת. בדקו חיבור לרשת ושהבאק־אנד פעיל.";
  }

  const fromValue = (value, depth = 0) => {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (depth > 6) return "";
    if (Array.isArray(value)) {
      if (!value.length) return "";
      if (typeof value[0] === "object" && value[0]?.msg != null)
        return value.map((item) => fromValue(item, depth + 1)).filter(Boolean).join(", ");
      return value.map((item) => fromValue(item, depth + 1)).filter(Boolean).join(", ");
    }
    if (typeof value !== "object") return String(value);
    const obj = value;
    const msg =
      fromValue(obj.msg, depth + 1) ||
      fromValue(obj.message, depth + 1) ||
      fromValue(obj.detail, depth + 1) ||
      fromValue(obj.description, depth + 1);
    if (msg) return msg;
    const errPart = fromValue(obj.error, depth + 1);
    if (errPart) return errPart;
    if (Array.isArray(obj.errors))
      return fromValue(obj.errors, depth + 1);
    return "";
  };

  const fromData = fromValue(data);
  const fallback = typeof error?.message === "string" ? error.message : "";
  const text = fromData || fallback || fallbackMessage;
  return typeof text === "string" ? text : String(text);
}

/**
 * Pre-configured Axios instance.
 * All requests automatically include the correct base URL and headers.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// ── Request interceptor (attach auth token if present) ────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor (normalize error shape) ─────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(new Error(stringifyApiError(error)));
  }
);

// ── Events ────────────────────────────────────────────────────────────────────
export const eventsApi = {
  getAll:  ()       => apiClient.get("/api/events").then((r) => r.data.data),
  getById: (id)     => apiClient.get(`/api/events/${id}`).then((r) => r.data.data),
  create:  (body)   => apiClient.post("/api/events", body).then((r) => r.data.data),
  update:  (id, b)  => apiClient.patch(`/api/events/${id}`, b).then((r) => r.data.data),
  remove:  (id)     => apiClient.delete(`/api/events/${id}`),
};

// ── Registrations ─────────────────────────────────────────────────────────────
export const registrationsApi = {
  register:       (body)    => apiClient.post("/api/registrations", body).then((r) => r.data.data),
  getMine:        ()        => apiClient.get("/api/registrations").then((r) => r.data.data),
  getByEvent:     (eventId) => apiClient.get(`/api/registrations/event/${eventId}`).then((r) => r.data.data),
  cancel:         (id)      => apiClient.delete(`/api/registrations/${id}`),
};

// ── Authentication ─────────────────────────────────────────────────────────────
export const authApi = {
  register: (body) => apiClient.post("/api/auth/register", body).then((r) => r.data),
  login: (body) => apiClient.post("/api/auth/login", body).then((r) => r.data),
};

// ── Users (Admin) ─────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: () => apiClient.get("/api/admin/users").then((r) => r.data.data),
  updateStatus: (id, status) => apiClient.patch(`/api/admin/users/${id}/status`, { status }).then((r) => r.data.data),
  updateRole: (id, role) => apiClient.patch(`/api/admin/users/${id}/role`, { role }).then((r) => r.data.data),
  remove: (id) => apiClient.delete(`/api/admin/users/${id}`),
};

// ── Admin Stats ────────────────────────────────────────────────────────────────
export const statsApi = {
  getSlots: () => apiClient.get("/api/admin/stats/slots").then((r) => r.data.data),
};

export default apiClient;
