import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('highlands_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('highlands_token');
      localStorage.removeItem('highlands_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// Categories
export const categoryAPI = {
  getAll: () => api.get('/categories'),
};

// Products
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Orders
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders'),
  getAllOrders: () => api.get('/orders/all'),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  updateStatusWithNote: (id, status, note) => api.put(`/orders/${id}/status`, { status, note }),
  getStats: () => api.get('/orders/dashboard/stats'),
  getReport: (params) => api.get('/orders/report/revenue', { params }),
};

export default api;

// Promotions
export const promotionAPI = {
  getActive: () => api.get('/promotions'),
  validate: (code) => api.post('/promotions/validate', { code }),
};

// Profile
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  changePassword: (data) => api.put('/profile/password', data),
};

// Warehouse (Nhập kho)
export const warehouseAPI = {
  getAll: () => api.get('/warehouse'),
  getById: (id) => api.get(`/warehouse/${id}`),
  create: (data) => api.post('/warehouse', data),
  updateStatus: (id, status) => api.put(`/warehouse/${id}/status`, { status }),
  delete: (id) => api.delete(`/warehouse/${id}`),
  getMaterials: () => api.get('/warehouse/materials'),
};
