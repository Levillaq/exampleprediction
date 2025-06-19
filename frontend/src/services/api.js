import axios from 'axios';
import toast from 'react-hot-toast';

// Создаем экземпляр axios
export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерсептор запросов
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерсептор ответов
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Неавторизован - удаляем токен и перенаправляем на авторизацию
          localStorage.removeItem('token');
          window.location.href = '/login';
          toast.error('Сессия истекла. Пожалуйста, войдите снова.');
          break;
          
        case 403:
          toast.error('Доступ запрещен');
          break;
          
        case 404:
          toast.error('Ресурс не найден');
          break;
          
        case 429:
          toast.error('Слишком много запросов. Попробуйте позже.');
          break;
          
        case 500:
          toast.error('Ошибка сервера. Попробуйте позже.');
          break;
          
        default:
          toast.error(data?.detail || 'Произошла ошибка');
      }
    } else if (error.request) {
      toast.error('Ошибка сети. Проверьте подключение к интернету.');
    } else {
      toast.error('Произошла неизвестная ошибка');
    }
    
    return Promise.reject(error);
  }
);

// API методы для пользователей
export const userAPI = {
  getCurrentUser: () => apiClient.get('/users/me'),
  updateProfile: (userData) => apiClient.patch('/users/me', userData),
  getRankings: (limit = 100) => apiClient.get(`/users/rankings?limit=${limit}`),
  createUser: (userData) => apiClient.post('/users/', userData),
};

// API методы для предсказаний
export const predictionAPI = {
  getUserPredictions: () => apiClient.get('/predictions/'),
  getTodayPrediction: () => apiClient.get('/predictions/today'),
  canPurchase: () => apiClient.get('/predictions/can-purchase'),
};

// API методы для платежей
export const paymentAPI = {
  createInvoice: () => apiClient.post('/payments/create-invoice'),
  confirmPayment: (paymentId) => apiClient.post(`/payments/${paymentId}/confirm`),
  getPaymentHistory: () => apiClient.get('/payments/'),
};

// API методы для зодиакальных знаков
export const zodiacAPI = {
  getZodiacSigns: () => apiClient.get('/zodiac-signs'),
};

// Утилиты для работы с ошибками
export const handleAPIError = (error, fallbackMessage = 'Произошла ошибка') => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  return fallbackMessage;
};

// Утилита для проверки статуса ответа
export const isAPISuccess = (response) => {
  return response.status >= 200 && response.status < 300;
};

export default apiClient; 