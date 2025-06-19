import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Инициализация при загрузке приложения
  useEffect(() => {
    initializeAuth();
  }, []);

  // Проверка токена при изменении
  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      apiClient.defaults.headers.common['Authorization'] = '';
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, [token]);

  const initializeAuth = async () => {
    setLoading(true);
    
    // Проверяем наличие токена в localStorage
    const savedToken = localStorage.getItem('token');
    
    if (savedToken) {
      setToken(savedToken);
    } else {
      // Проверяем, авторизован ли пользователь через Telegram Web App
      checkTelegramAuth();
    }
  };

  const checkTelegramAuth = () => {
    // Проверяем, если приложение запущено в Telegram Web App
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      
      // Получаем данные пользователя из Telegram
      const initData = tg.initData;
      const user = tg.initDataUnsafe?.user;
      
      if (user) {
        // Отправляем данные на backend для аутентификации
        authenticateWithTelegram(user);
      } else {
        setLoading(false);
      }
    } else {
      // Если не в Telegram Web App, показываем заглушку для демо
      setLoading(false);
    }
  };

  const authenticateWithTelegram = async (telegramUser) => {
    try {
      const response = await apiClient.post('/auth/telegram', {
        id: telegramUser.id,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        photo_url: telegramUser.photo_url,
      });

      const { access_token, user: userData } = response.data;
      
      if (access_token) {
        login(access_token, userData);
      }
    } catch (error) {
      console.error('Telegram auth error:', error);
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.get('/users/me');
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Fetch user error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (authToken, userData = null) => {
    localStorage.setItem('token', authToken);
    setToken(authToken);
    
    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  // Демо-вход для разработки (когда нет Telegram Web App)
  const demoLogin = async () => {
    try {
      // Создаем демо-пользователя
      const demoUser = {
        telegram_id: Math.floor(Math.random() * 1000000), // Случайный ID
        first_name: 'Демо Пользователь',
        zodiac_sign: 'leo'
      };

      const response = await apiClient.post('/users/', demoUser);
      
      // Создаем демо-токен (в реальном приложении токен создается на backend)
      const demoToken = btoa(JSON.stringify({ 
        user_id: response.data.id, 
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 дней
      }));
      
      login(demoToken, response.data);
    } catch (error) {
      console.error('Demo login error:', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    demoLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 