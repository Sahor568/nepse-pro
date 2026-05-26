// In development, use the Vite proxy (relative /api path) so requests go to localhost:5000.
// In production, use the deployed Render backend directly.
export const API_BASE = import.meta.env.DEV
  ? '/api'
  : 'https://nepse-pro-api.onrender.com/api';
export const NEPSE_BASE = `${API_BASE}/nepse`;
export const AUTH_BASE = `${API_BASE}/auth`;
export const USER_BASE = `${API_BASE}/user`;

/**
 * Auth-aware fetch wrapper that automatically attaches the JWT token
 * from localStorage to all requests as a Bearer Authorization header.
 * On 401 responses, clears the token and redirects to /login.
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
  }

  return res;
}
