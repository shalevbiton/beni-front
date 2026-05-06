// frontend/src/services/api.service.js
import axios from "axios";
import { API_BASE_URL } from "../config/api";

/** Turn API / axios error payloads into a single human-readable string. */
export function stringifyApiError(error, fallbackMessage = "An unexpected error occurred") {
  const data = error?.response?.data;

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
  baseURL: `${API_BASE_URL}/api`,
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
  getAll:  ()       => apiClient.get("/events").then((r) => r.data.data),
  getById: (id)     => apiClient.get(`/events/${id}`).then((r) => r.data.data),
  create:  (body)   => apiClient.post("/events", body).then((r) => r.data.data),
  update:  (id, b)  => apiClient.patch(`/events/${id}`, b).then((r) => r.data.data),
  remove:  (id)     => apiClient.delete(`/events/${id}`),
};

// ── Registrations ─────────────────────────────────────────────────────────────
export const registrationsApi = {
  register:       (body)    => apiClient.post("/registrations", body).then((r) => r.data.data),
  getMine:        ()        => apiClient.get("/registrations").then((r) => r.data.data),
  getByEvent:     (eventId) => apiClient.get(`/registrations/event/${eventId}`).then((r) => r.data.data),
  cancel:         (id)      => apiClient.delete(`/registrations/${id}`),
};

// ── Authentication ─────────────────────────────────────────────────────────────
export const authApi = {
  register: (body) => apiClient.post("/auth/register", body).then((r) => r.data),
  login: (body) => apiClient.post("/auth/login", body).then((r) => r.data),
};

// ── Users (Admin) ─────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: () => apiClient.get("/admin/users").then((r) => r.data.data),
  updateStatus: (id, status) => apiClient.patch(`/admin/users/${id}/status`, { status }).then((r) => r.data.data),
  updateRole: (id, role) => apiClient.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data.data),
  remove: (id) => apiClient.delete(`/admin/users/${id}`),
};

// ── Admin Stats ────────────────────────────────────────────────────────────────
export const statsApi = {
  getSlots: () => apiClient.get("/admin/stats/slots").then((r) => r.data.data),
};

export default apiClient;
