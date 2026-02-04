/* ============================================================
   services/api.js  —  camada de chamadas HTTP centralizada
   ============================================================ */
import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({ baseURL: BASE });

/* ── interceptor: injeta Bearer token automaticamente ── */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('estofaria_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ── interceptor de resposta: se 401 → logout automático ── */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('estofaria_token');
      localStorage.removeItem('estofaria_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

// ─── AUTH ─────────────────────────────────────────────────
export const authAPI = {
  register: (data)  => api.post('/auth/register', data),
  login:    (data)  => api.post('/auth/login',    data),
  me:       ()      => api.get('/auth/me')
};

// ─── PORTFOLIO ────────────────────────────────────────────
export const portfolioAPI = {
  getAll:        ()        => api.get('/portfolio'),
  getByCategory: (cat)    => api.get(`/portfolio/${cat}`),
  create:        (form)   => api.post('/portfolio', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:        (id,form)=> api.put(`/portfolio/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove:        (id)     => api.delete(`/portfolio/${id}`)
};

// ─── APPOINTMENTS ─────────────────────────────────────────
export const appointmentAPI = {
  getAll:      (params) => api.get('/appointments', { params }),
  getToday:    ()       => api.get('/appointments/today'),
  getUpcoming:()        => api.get('/appointments/upcoming'),
  create:      (data)   => api.post('/appointments', data),
  update:      (id,data)=> api.put(`/appointments/${id}`, data),
  remove:      (id)     => api.delete(`/appointments/${id}`)
};

// ─── FABRICS ──────────────────────────────────────────────
export const fabricAPI = {
  getAll: ()       => api.get('/fabrics'),
  create: (form)   => api.post('/fabrics', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id)     => api.delete(`/fabrics/${id}`)
};

// ─── SIMULATIONS ──────────────────────────────────────────
export const simulationAPI = {
  generate: (form) => api.post('/simulations/generate', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll:   ()     => api.get('/simulations')
};

export default api;
