import axios from "axios";

// Vite built-in flag: true when built for production (Vercel), false when running locally
const isProd = import.meta.env.PROD;

// Force the production URL if in production, otherwise use localhost
const API_BASE_URL = isProd
  ? "https://beni-back.vercel.app"
  : "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

export default api;
