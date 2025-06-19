import React from 'react';
import { useQuery } from 'react-query';
import { Trophy, Crown, Award, Star } from 'lucide-react';

import { userAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Rankings = () => {
  const { data: rankings, isLoading, error } = useQuery(
    'rankings',
    userAPI.getRankings,
    {
      refetchInterval: 60000 // Обновляем каждую минуту
    }
  );

  if (isLoading) {
    return <LoadingSpinner message="Загрузка рейтинга..." />;
  }

  if (error) {
    return (
      <div className="text-center card p-8">
        <p className="text-red-400">Ошибка загрузки рейтинга</p>
      </div>
    );
  }

  const topUsers = rankings?.data || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Заголовок */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text flex items-center justify-center space-x-3">
          <Trophy className="w-10 h-10 text-yellow-400" />
          <span>Рейтинг пользователей</span>
        </h1>
        <p className="text-purple-200 text-lg">
          Топ пользователей по количеству купленных предсказаний
        </p>
      </div>

      {/* Статистика */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold text-white">{topUsers.length}</div>
          <div className="text-purple-200 text-sm">Всего пользователей</div>
        </div>
        
        <div className="card p-6 text-center">
          <div className="text-3xl mb-2">🔮</div>
          <div className="text-2xl font-bold text-white">
            {topUsers.reduce((sum, user) => sum + (user.predictions_count || 0), 0)}
          </div>
          <div className="text-purple-200 text-sm">Всего предсказаний</div>
        </div>
        
        <div className="card p-6 text-center">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-2xl font-bold text-white">
            {topUsers.reduce((sum, user) => sum + (user.predictions_count || 0), 0)} XTR
          </div>
          <div className="text-purple-200 text-sm">Stars потрачено</div>
        </div>
      </div>

      {/* Топ-3 пользователя */}
      {topUsers.length >= 3 && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* 2 место */}
          <div className="order-2 md:order-1">
            <TopUserCard user={topUsers[1]} position={2} />
          </div>
          
          {/* 1 место */}
          <div className="order-1 md:order-2">
            <TopUserCard user={topUsers[0]} position={1} isWinner />
          </div>
          
          {/* 3 место */}
          <div className="order-3">
            <TopUserCard user={topUsers[2]} position={3} />
          </div>
        </div>
      )}

      {/* Полный рейтинг */}
      <div className="card p-6">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center space-x-2">
          <Award className="w-6 h-6 text-purple-400" />
          <span>Полный рейтинг</span>
        </h2>

        {topUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤷‍♂️</div>
            <p className="text-purple-200">Пока нет пользователей в рейтинге</p>
            <p className="text-purple-300 text-sm mt-2">
              Купите первое предсказание, чтобы попасть в топ!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {topUsers.map((user, index) => (
              <RankingRow
                key={user.id}
                user={user}
                position={index + 1}
                isTop3={index < 3}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TopUserCard = ({ user, position, isWinner = false }) => {
  const getPositionIcon = (pos) => {
    switch (pos) {
      case 1: return <Crown className="w-8 h-8 text-yellow-400" />;
      case 2: return <Award className="w-8 h-8 text-gray-400" />;
      case 3: return <Award className="w-8 h-8 text-orange-400" />;
      default: return <Trophy className="w-8 h-8 text-purple-400" />;
    }
  };

  const getPositionColor = (pos) => {
    switch (pos) {
      case 1: return 'border-yellow-400 bg-yellow-900 bg-opacity-20';
      case 2: return 'border-gray-400 bg-gray-900 bg-opacity-20';
      case 3: return 'border-orange-400 bg-orange-900 bg-opacity-20';
      default: return 'border-purple-400';
    }
  };

  return (
    <div className={`card p-6 text-center border-2 ${getPositionColor(position)} ${
      isWinner ? 'transform scale-105' : ''
    }`}>
      <div className="space-y-4">
        <div className="flex justify-center">
          {getPositionIcon(position)}
        </div>
        
        <div>
          <div className="text-2xl font-bold text-white mb-1">
            {user.first_name}
          </div>
          <div className="text-purple-200 text-sm">
            #{position} место
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-lg font-semibold text-white">
              {user.predictions_count || 0}
            </span>
          </div>
          <div className="text-purple-300 text-xs">
            предсказаний куплено
          </div>
        </div>
      </div>
    </div>
  );
};

const RankingRow = ({ user, position, isTop3 }) => {
  const getPositionEmoji = (pos) => {
    switch (pos) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${pos}.`;
    }
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg transition-all ${
      isTop3 
        ? 'bg-gradient-to-r from-purple-800 to-purple-700 bg-opacity-30 border border-purple-500 border-opacity-50' 
        : 'bg-purple-900 bg-opacity-20 hover:bg-purple-800 hover:bg-opacity-30'
    }`}>
      <div className="flex items-center space-x-4">
        <div className="text-2xl font-bold text-white min-w-[3rem] text-center">
          {getPositionEmoji(position)}
        </div>
        
        <div>
          <div className="text-lg font-semibold text-white">
            {user.first_name}
          </div>
          <div className="text-purple-300 text-sm">
            ID: {user.telegram_id}
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="flex items-center space-x-2 text-lg font-bold text-white">
          <Star className="w-5 h-5 text-yellow-400" />
          <span>{user.predictions_count || 0}</span>
        </div>
        <div className="text-purple-300 text-xs">
          предсказаний
        </div>
      </div>
    </div>
  );
};

export default Rankings; 