const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('인증이 만료되었습니다.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: '요청에 실패했습니다.' }));
    throw new Error(err.detail || '요청에 실패했습니다.');
  }

  return res.json();
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body?: unknown) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path: string, body?: unknown) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path: string) => request(path, { method: 'DELETE' }),
};

// Auth
export const authApi = {
  login: (email: string, password: string) => api.post('/api/auth/login', { email, password }),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),
};

// Users
export const usersApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/api/users${qs}`);
  },
  get: (id: number) => api.get(`/api/users/${id}`),
  create: (data: Record<string, unknown>) => api.post('/api/users', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/api/users/${id}`, data),
  delete: (id: number) => api.delete(`/api/users/${id}`),
  resetPassword: (id: number) => api.post(`/api/users/${id}/reset-password`),
  toggleStatus: (id: number) => api.post(`/api/users/${id}/toggle-status`),
};

// Groups
export const groupsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/api/groups${qs}`);
  },
  create: (data: Record<string, unknown>) => api.post('/api/groups', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/api/groups/${id}`, data),
};

// Permissions
export const permissionsApi = {
  matrix: (reportName?: string) => {
    const qs = reportName ? `?report_name=${encodeURIComponent(reportName)}` : '';
    return api.get(`/api/permissions/matrix${qs}`);
  },
  updateMatrix: (permissions: unknown[]) => api.put('/api/permissions/matrix', { permissions }),
  detail: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/api/permissions/detail${qs}`);
  },
  updateDetail: (permissions: unknown[]) => api.put('/api/permissions/detail', { permissions }),
};

// Requests
export const requestsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/api/requests${qs}`);
  },
  create: (data: Record<string, unknown>) => api.post('/api/requests', data),
  approve: (id: number) => api.put(`/api/requests/${id}/approve`),
  reject: (id: number) => api.put(`/api/requests/${id}/reject`),
};

// Audit Logs
export const auditApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/api/audit-logs${qs}`);
  },
  stats: () => api.get('/api/audit-logs/stats'),
};
