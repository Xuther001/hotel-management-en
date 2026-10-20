const API = '/api/v1';
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) }
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Request failed');
  return body;
}
export const api = {
  overview: (propertyId = 'all') => request<any>(`/dashboard/overview?property_id=${propertyId}`),
  properties: () => request<any>('/properties'),
  reservations: (q = '') => request<any>(`/reservations?q=${encodeURIComponent(q)}`),
  createReservation: (data: any) => request<any>('/reservations', { method: 'POST', body: JSON.stringify(data) }),
  updateReservation: (id: string, data: any) => request<any>(`/reservations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  rooms: (q = '') => request<any>(`/rooms?q=${encodeURIComponent(q)}`),
  updateRoomStatus: (id: string, status: string) => request<any>(`/rooms/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  employees: (q = '') => request<any>(`/employees?q=${encodeURIComponent(q)}`),
  createEmployee: (data: any) => request<any>('/employees', { method: 'POST', body: JSON.stringify(data) }),
  expenses: (q = '') => request<any>(`/finance/expenses?q=${encodeURIComponent(q)}`),
  createExpense: (data: any) => request<any>('/finance/expenses', { method: 'POST', body: JSON.stringify(data) }),
  tasks: () => request<any>('/housekeeping/tasks'),
  clients: () => request<any>('/marketing/clients'),
  campaigns: () => request<any>('/marketing/campaigns'),
  activity: () => request<any>('/audit-logs'),
};
export const money = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
