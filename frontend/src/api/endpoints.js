import { apiClient } from './client.js';

// One function per row of docs/api-contract.md. Paths are relative to /api/v1.
const data = (request) => request.then((response) => response.data);

export const authApi = {
  register: (body) => data(apiClient.post('/auth/register', body)),
  login: (body) => data(apiClient.post('/auth/login', body)),
};

export const roomsApi = {
  // params: { capacity, equipment, from, to }
  list: (params) => data(apiClient.get('/rooms', { params })),
};

export const bookingsApi = {
  create: (body) => data(apiClient.post('/bookings', body)),
  cancel: (id) => data(apiClient.patch(`/bookings/${id}/cancel`)),
  // scope: 'active' | 'history'
  mine: (scope) => data(apiClient.get('/bookings/me', { params: { scope } })),
};

export const adminRoomsApi = {
  create: (body) => data(apiClient.post('/admin/rooms', body)),
  update: (id, body) => data(apiClient.put(`/admin/rooms/${id}`, body)),
  archive: (id) => data(apiClient.patch(`/admin/rooms/${id}/archive`)),
};

export const adminBookingsApi = {
  list: (status = 'PENDING') => data(apiClient.get('/admin/bookings', { params: { status } })),
  confirm: (id) => data(apiClient.patch(`/admin/bookings/${id}/confirm`)),
  reject: (id) => data(apiClient.patch(`/admin/bookings/${id}/reject`)),
};

export const reviewsApi = {
  create: (roomId, body) => data(apiClient.post(`/rooms/${roomId}/reviews`, body)),
};
