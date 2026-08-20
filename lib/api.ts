import type { MediaContent } from "@/types/media";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, ...init } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(body?.detail ?? `API request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  auth: {
    login: (email: string, password: string) => request<{ access_token: string; token_type: string }>("/api/v1/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    socialLogin: (email: string) => request<{ access_token: string; user?: { id: string; email: string; points: number } }>("/api/v1/auth/social-login", { method: "POST", body: JSON.stringify({ email, name: email.split("@")[0], provider: "local" }) }),
    me: (token: string) => request<{ id: string; email: string; points: number }>("/api/v1/auth/me", { token }),
  },
  content: {
    list: () => request<MediaContent[] | { items: MediaContent[] }>("/api/v1/contents"),
    get: (id: string) => request<MediaContent>(`/api/v1/contents/${encodeURIComponent(id)}`),
  },
  points: {
    balance: (token: string) => request<{ free_points: number; paid_points: number; total: number }>("/api/v1/points/balance", { token }),
    deduct: (token: string, amount: number, reason: string) => request<{ new_balance: number }>("/api/v1/points/deduct", { method: "POST", token, body: JSON.stringify({ amount, reason }) }),
    recharge: (token: string, amount: number, paymentMethod: string) => request<{ new_balance: number; bonus: number }>("/api/v1/points/recharge", { method: "POST", token, body: JSON.stringify({ amount_krw: amount, payment_method: paymentMethod }) }),
  },
};

export default api;
