// frontend/src/config/api.js

/**
 * Central API configuration.
 *
 * Local dev: calls localhost backend directly.
 * Vercel / prod: forces the deployed backend origin.
 * Use the backend origin only, e.g. https://your-backend.vercel.app — do NOT append /api.
 */

function normalizeApiOrigin(value) {
  let v = String(value ?? "").trim();
  if (!v) return "";
  v = v.replace(/\/+$/, "");
  if (/\/api$/i.test(v)) v = v.replace(/\/api$/i, "").replace(/\/+$/, "");
  return v;
}

const isProd = import.meta.env.PROD;
const API_BASE_URL = isProd
  ? "https://beni-back.vercel.app"
  : "http://localhost:5000";
export const API_BASE_URL_ORIGIN = normalizeApiOrigin(API_BASE_URL);

export const ENDPOINTS = {
  health:        `${API_BASE_URL_ORIGIN}/api/health`,
  events:        `${API_BASE_URL_ORIGIN}/api/events`,
  event:         (id) => `${API_BASE_URL_ORIGIN}/api/events/${id}`,
  registrations: `${API_BASE_URL_ORIGIN}/api/registrations`,
  eventRegs:     (eventId) => `${API_BASE_URL_ORIGIN}/api/registrations/event/${eventId}`,
};
