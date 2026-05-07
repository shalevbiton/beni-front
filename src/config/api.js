// frontend/src/config/api.js

/**
 * Central API configuration.
 *
 * Local dev (.env.development): VITE_API_BASE_URL=http://127.0.0.1:5000 → calls backend directly.
 * Vercel / prod: set VITE_API_BASE_URL in Project → Settings → Environment Variables (then Redeploy).
 * Use the backend origin only, e.g. https://your-backend.vercel.app — do NOT append /api.
 */

function normalizeApiOrigin(value) {
  let v = String(value ?? "").trim();
  if (!v) return "";
  v = v.replace(/\/+$/, "");
  if (/\/api$/i.test(v)) v = v.replace(/\/api$/i, "").replace(/\/+$/, "");
  return v;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
export const API_BASE_URL_ORIGIN = normalizeApiOrigin(API_BASE_URL);

export const ENDPOINTS = {
  health:        `${API_BASE_URL_ORIGIN}/api/health`,
  events:        `${API_BASE_URL_ORIGIN}/api/events`,
  event:         (id) => `${API_BASE_URL_ORIGIN}/api/events/${id}`,
  registrations: `${API_BASE_URL_ORIGIN}/api/registrations`,
  eventRegs:     (eventId) => `${API_BASE_URL_ORIGIN}/api/registrations/event/${eventId}`,
};
