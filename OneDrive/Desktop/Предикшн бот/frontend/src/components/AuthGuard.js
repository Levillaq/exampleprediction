import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const AuthGuard = ({ children }) => {
  const { isAuthenticated, loading, demoLogin } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Проверка авторизации..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <div className="text-8xl crystal-ball">🔮</div>
          
          <div className="space-y-3">
            <h1 className="text-3xl font-bold gradient-text">
              Предикшн Бот
            </h1>
            <p className="text-purple-200">
              Для доступа к приложению войдите через Telegram или используйте демо-режим
            </p>
          </div>

          {/* Telegram Web App кнопка */}
          {window.Telegram && window.Telegram.WebApp ? (
            <div className="card p-6 space-y-4">
              <p className="text-purple-200 text-sm">
                Приложение запущено в Telegram Web App
              </p>
              <div className="loading w-6 h-6 border-2 border-purple-300 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            /* Демо режим для разработки */
            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Демо режим</h3>
              <p className="text-purple-200 text-sm">
                Для тестирования вне Telegram используйте демо-вход
              </p>
              <button
                onClick={demoLogin}
                className="btn-primary w-full"
              >
                🚀 Демо вход
              </button>
            </div>
          )}

          <div className="text-xs text-purple-400 space-y-1">
            <p>💫 Персональные предсказания каждый день</p>
            <p>⭐ Оплата через Telegram Stars (XTR)</p>
            <p>🏆 Рейтинговая система пользователей</p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AuthGuard; 