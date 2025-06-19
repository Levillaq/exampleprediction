import React from 'react';
import { useQuery } from 'react-query';
import { History as HistoryIcon, Calendar, Sparkles } from 'lucide-react';

import { predictionAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PredictionCard from '../components/PredictionCard';

const History = () => {
  const { data: predictions, isLoading, error } = useQuery(
    'userPredictions',
    predictionAPI.getUserPredictions
  );

  if (isLoading) {
    return <LoadingSpinner message="Загрузка истории..." />;
  }

  if (error) {
    return (
      <div className="text-center card p-8">
        <p className="text-red-400">Ошибка загрузки истории</p>
      </div>
    );
  }

  const userPredictions = predictions?.data || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Заголовок */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text flex items-center justify-center space-x-3">
          <HistoryIcon className="w-10 h-10 text-purple-400" />
          <span>История предсказаний</span>
        </h1>
        <p className="text-purple-200 text-lg">
          Все ваши персональные предсказания в одном месте
        </p>
      </div>

      {/* Статистика */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="text-3xl mb-2">🔮</div>
          <div className="text-2xl font-bold text-white">{userPredictions.length}</div>
          <div className="text-purple-200 text-sm">Всего предсказаний</div>
        </div>
        
        <div className="card p-6 text-center">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-2xl font-bold text-white">{userPredictions.length} XTR</div>
          <div className="text-purple-200 text-sm">Stars потрачено</div>
        </div>
        
        <div className="card p-6 text-center">
          <div className="text-3xl mb-2">📅</div>
          <div className="text-2xl font-bold text-white">
            {userPredictions.length > 0 
              ? Math.floor((new Date() - new Date(userPredictions[userPredictions.length - 1].created_at)) / (1000 * 60 * 60 * 24)) + 1
              : 0
            }
          </div>
          <div className="text-purple-200 text-sm">Дней с первого предсказания</div>
        </div>
      </div>

      {/* Список предсказаний */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span>Ваши предсказания</span>
          </h2>
          
          {userPredictions.length > 0 && (
            <div className="text-sm text-purple-300">
              Показано {userPredictions.length} предсказаний
            </div>
          )}
        </div>

        {userPredictions.length === 0 ? (
          <EmptyHistory />
        ) : (
          <div className="space-y-4">
            {userPredictions.map((prediction) => (
              <PredictionCard
                key={prediction.id}
                prediction={prediction}
                showDate={true}
                className="hover:scale-[1.02] transition-transform duration-200"
              />
            ))}
          </div>
        )}
      </div>

      {/* Призыв к действию */}
      {userPredictions.length > 0 && (
        <div className="card p-6 text-center bg-gradient-to-r from-purple-800 to-purple-700 bg-opacity-30">
          <div className="space-y-3">
            <div className="text-2xl">✨</div>
            <h3 className="text-lg font-semibold text-white">
              Готовы к новому предсказанию?
            </h3>
            <p className="text-purple-200 text-sm">
              Каждый день - новая возможность узнать, что готовят для вас звезды
            </p>
            <a 
              href="/"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Получить предсказание на сегодня</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

const EmptyHistory = () => (
  <div className="card p-12 text-center space-y-6">
    <div className="text-8xl opacity-50">🔮</div>
    
    <div className="space-y-3">
      <h3 className="text-2xl font-semibold text-white">
        История пуста
      </h3>
      <p className="text-purple-200 max-w-md mx-auto">
        У вас пока нет предсказаний. Получите первое персональное предсказание прямо сейчас!
      </p>
    </div>

    <div className="space-y-4">
      <a 
        href="/"
        className="btn-primary inline-flex items-center space-x-2"
      >
        <Sparkles className="w-4 h-4" />
        <span>Получить первое предсказание</span>
      </a>
      
      <div className="text-xs text-purple-400 space-y-1">
        <p>💫 Персональные предсказания для вашего знака зодиака</p>
        <p>⭐ Всего 1 XTR Star за предсказание</p>
        <p>🕐 Новое предсказание каждый день</p>
      </div>
    </div>
  </div>
);

export default History; 