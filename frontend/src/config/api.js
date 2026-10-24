/**
 * Global API & WebSocket Configuration for OPD Saathi
 * Supports:
 * 1. Local Development: http://localhost:3001
 * 2. Cloud Deployment (Render/Railway/Vercel): Derived from VITE_BACKEND_URL or window.location.origin
 */

function resolveBackendUrl() {
  // 1. Explicit Vite Environment Variable (e.g. deployed on Vercel pointing to Render)
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '');
  }

  if (import.meta.env.VITE_SOCKET_SERVER_URL) {
    return import.meta.env.VITE_SOCKET_SERVER_URL.replace(/\/+$/, '');
  }

  // 2. Local development fallback
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
      return 'http://localhost:3001';
    }
    // 3. Cloud deployment relative API fallback (e.g. Vercel Serverless /api/*)
    return '';
  }

  return 'http://localhost:3001';
}

export const BACKEND_URL = resolveBackendUrl();

export function getApiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return BACKEND_URL ? `${BACKEND_URL}${cleanEndpoint}` : cleanEndpoint;
}
