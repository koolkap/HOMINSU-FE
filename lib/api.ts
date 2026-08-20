const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, token } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API Error ${res.status}`);
  }

  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ access_token: string; token_type: string }>('/api/v1/auth/login', {
        method: 'POST',
        body: { email, password },
      }),
    me: (token: string) =>
      request<{ id: string; email: string; points: number }>('/api/v1/auth/me', { token }),
  },
  points: {
    balance: (token: string) =>
      request<{ free_points: number; paid_points: number; total: number }>('/api/v1/points/balance', { token }),
    recharge: (token: string, amount: number, paymentMethod: string) =>
      request<{ new_balance: number; bonus: number }>('/api/v1/points/recharge', {
        method: 'POST',
        token,
        body: { amount_krw: amount, payment_method: paymentMethod },
      }),
    deduct: (token: string, amount: number, reason: string) =>
      request<{ new_balance: number }>('/api/v1/points/deduct', {
        method: 'POST',
        token,
        body: { amount, reason },
      }),
  },
  videos: {
    list: (params?: { tag?: string; page?: number }) =>
      request<{ items: Array<Record<string, unknown>>; total: number }>(
        `/api/v1/videos?${new URLSearchParams(params as Record<string, string>)}`
      ),
    get: (id: string) =>
      request<Record<string, unknown>>(`/api/v1/videos/${id}`),
  },
  operator: {
    syncPlay: (token: string, videoUrl: string, targetDevices: string[]) =>
      request<{ success: boolean }>('/api/v1/operator/sync-play', {
        method: 'POST',
        token,
        body: { video_url: videoUrl, target_devices: targetDevices },
      }),
    devices: (token: string) =>
      request<Array<Record<string, unknown>>>('/api/v1/operator/devices', { token }),
  },
};

export default api;
