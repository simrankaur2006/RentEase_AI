import api from './api';

const data = (res) => res.data.data;

export const userApi = {
  sync: (payload) => api.post('/users/sync', payload).then(data),
  me: () => api.get('/users/me').then(data),
  updateProfile: (payload) => api.patch('/users/me', payload).then(data),
  updatePreferences: (payload) => api.patch('/users/preferences', payload).then(data),
  updateRole: (role) => api.patch('/users/role', { role }).then(data),
  dashboard: () => api.get('/users/dashboard').then(data)
};

export const propertyApi = {
  list: (params) => api.get('/properties', { params }).then(data),
  featured: () => api.get('/properties/featured').then(data),
  cities: () => api.get('/properties/cities').then(data),
  details: (id) => api.get(`/properties/${id}`).then(data),
  similar: (id) => api.get(`/properties/${id}/similar`).then(data),
  create: (payload) => api.post('/properties', payload).then(data),
  update: (id, payload) => api.put(`/properties/${id}`, payload).then(data),
  remove: (id) => api.delete(`/properties/${id}`).then(data),
  mine: (params) => api.get('/properties/owner/mine', { params }).then(data),
  ownerStats: () => api.get('/properties/owner/stats').then(data)
};

export const favouriteApi = {
  list: () => api.get('/favourites').then(data),
  add: (propertyId) => api.post(`/favourites/${propertyId}`).then(data),
  remove: (propertyId) => api.delete(`/favourites/${propertyId}`).then(data)
};

export const inquiryApi = {
  create: (payload) => api.post('/inquiries', payload).then(data),
  mine: () => api.get('/inquiries/my').then(data),
  owner: (params) => api.get('/inquiries/owner', { params }).then(data),
  updateStatus: (id, status) => api.patch(`/inquiries/${id}`, { status }).then(data)
};

export const reviewApi = {
  forProperty: (propertyId) => api.get(`/reviews/property/${propertyId}`).then(data),
  create: (payload) => api.post('/reviews', payload).then(data),
  remove: (id) => api.delete(`/reviews/${id}`).then(data),
  owner: () => api.get('/reviews/owner').then(data)
};

export const recommendationApi = {
  list: (params) => api.get('/recommendations', { params }).then(data)
};

export const recentlyViewedApi = {
  list: (params) => api.get('/recently-viewed', { params }).then(data),
  track: (propertyId) => api.post(`/recently-viewed/${propertyId}`).then(data)
};

export const adminApi = {
  stats: () => api.get('/admin/stats').then(data),
  users: (params) => api.get('/admin/users', { params }).then(data),
  removeUser: (id) => api.delete(`/admin/users/${id}`).then(data),
  properties: (params) => api.get('/admin/properties', { params }).then(data),
  updateStatus: (id, payload) => api.patch(`/admin/properties/${id}/status`, payload).then(data),
  removeProperty: (id) => api.delete(`/admin/properties/${id}`).then(data)
};
