// API base URL helper.
//
// In production, set VITE_API_URL at build time to the deployed Flask URL
// (e.g. https://fleet-optimizer-api.up.railway.app). Locally, the Flask dev
// server listens on a different port — set VITE_API_URL in .env to point at
// it (see .env.example) instead of relying on the localhost:5000 fallback.

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5000';

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

export const API_BASE_URL = API_BASE;
