// frontend/src/services/api.service.js
import axios from "axios";
import { API_BASE_URL } from "../config/api";

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
    const rawMessage =
      error.response?.data?.error ??
      error.response?.data?.message ??
      error.message ??
      "An unexpected error occurred";

    const message =
      typeof rawMessage === "string"
        ? rawMessage
        : rawMessage?.message ||
          rawMessage?.error ||
          "An unexpected error occurred";

    return Promise.reject(new Error(message));
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
