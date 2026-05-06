// frontend/src/config/api.js

/**
 * Central API configuration.
 *
 * In development  → Vite proxies /api/* to http://localhost:5000
 *                   (configured in vite.config.js), so we use a relative base.
 * In production   → set VITE_API_BASE_URL in the CI/hosting env to point to
 *                   the deployed backend URL.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "";   // "" = relative (proxy)

export const ENDPOINTS = {
  health:        `${API_BASE_URL}/api/health`,
  events:        `${API_BASE_URL}/api/events`,
  event:         (id) => `${API_BASE_URL}/api/events/${id}`,
  registrations: `${API_BASE_URL}/api/registrations`,
  eventRegs:     (eventId) => `${API_BASE_URL}/api/registrations/event/${eventId}`,
};
