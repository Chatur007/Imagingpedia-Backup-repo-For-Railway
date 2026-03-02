const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "";

if (import.meta.env.PROD && !rawApiBaseUrl) {
  console.error("Missing VITE_API_BASE_URL in production build");
}

const normalizedApiBaseUrl = rawApiBaseUrl.replace(/\/$/, "");

export const API_BASE_URL =
  normalizedApiBaseUrl || (import.meta.env.DEV ? "http://localhost:3000" : "");
