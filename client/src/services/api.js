import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the JWT (if present) to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Globally handle expired/invalid tokens by logging the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ----- Auth -----
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getCurrentUser = () => api.get('/auth/me');

// ----- Expenses / Transactions -----
export const getTransactions = (params) => api.get('/expenses', { params });
export const createTransaction = (data) => api.post('/expenses', data);
export const updateTransaction = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteTransaction = (id) => api.delete(`/expenses/${id}`);
export const getSummary = () => api.get('/expenses/summary');
export const getCategoryAnalytics = () => api.get('/expenses/analytics/by-category');
export const getMonthlyAnalytics = () => api.get('/expenses/analytics/monthly');

export default api;
