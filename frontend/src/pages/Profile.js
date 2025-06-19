import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { User, Star, Edit3, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: user?.first_name || '',
    zodiac_sign: user?.zodiac_sign || ''
  });

  const updateProfileMutation = useMutation(userAPI.updateProfile, {
    onSuccess: (data) => {
      updateUser(data.data);
      setIsEditing(false);
      toast.success('Профиль обновлен!');
      queryClient.invalidateQueries('user');
    },
    onError: (error) => {
      toast.error('Ошибка обновления профиля');
    }
  });

  const handleSave = () => {
    if (!editForm.first_name.trim()) {
      toast.error('Имя не может быть пустым');
      return;
    }
    
    updateProfileMutation.mutate(editForm);
  };

  const handleCancel = () => {
    setEditForm({
      first_name: user?.first_name || '',
      zodiac_sign: user?.zodiac_sign || ''
    });
    setIsEditing(false);
  };

  const getZodiacEmoji = (sign) => {
    const emojis = {
      aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
      leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
      sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓'
    };
    return emojis[sign] || '❓';
  };

  const getZodiacTitle = (sign) => {
    const titles = {
      aries: 'Овен', taurus: 'Телец', gemini: 'Близнецы', cancer: 'Рак',
      leo: 'Лев', virgo: 'Дева', libra: 'Весы', scorpio: 'Скорпион',
      sagittarius: 'Стрелец', capricorn: 'Козерог', aquarius: 'Водолей', pisces: 'Рыбы'
    };
    return titles[sign] || 'Не выбран';
  };

  const zodiacSigns = [
    { value: '', label: 'Выберите знак зодиака' },
    { value: 'aries', label: '♈ Овен' },
    { value: 'taurus', label: '♉ Телец' },
    { value: 'gemini', label: '♊ Близнецы' },
    { value: 'cancer', label: '♋ Рак' },
    { value: 'leo', label: '♌ Лев' },
    { value: 'virgo', label: '♍ Дева' },
    { value: 'libra', label: '♎ Весы' },
    { value: 'scorpio', label: '♏ Скорпион' },
    { value: 'sagittarius', label: '♐ Стрелец' },
    { value: 'capricorn', label: '♑ Козерог' },
    { value: 'aquarius', label: '♒ Водолей' },
    { value: 'pisces', label: '♓ Рыбы' }
  ];

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Заголовок */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gradient-text">Мой профиль</h1>
        <p className="text-purple-200">Управляйте своими данными и настройками</p>
      </div>

      {/* Основная информация */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="w-8 h-8 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Основная информация</h2>
          </div>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Редактировать</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={updateProfileMutation.isLoading}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Сохранить</span>
              </button>
              <button
                onClick={handleCancel}
                className="btn-secondary flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Отмена</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Имя */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-200">
              Имя
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.first_name}
                onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                className="input w-full"
                placeholder="Введите ваше имя"
              />
            ) : (
              <div className="input bg-purple-900 bg-opacity-30">
                {user.first_name}
              </div>
            )}
          </div>

          {/* Знак зодиака */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-200">
              Знак зодиака
            </label>
            {isEditing ? (
              <select
                value={editForm.zodiac_sign}
                onChange={(e) => setEditForm(prev => ({ ...prev, zodiac_sign: e.target.value }))}
                className="select w-full"
              >
                {zodiacSigns.map(sign => (
                  <option key={sign.value} value={sign.value}>
                    {sign.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="input bg-purple-900 bg-opacity-30 flex items-center space-x-2">
                <span className="text-xl">{getZodiacEmoji(user.zodiac_sign)}</span>
                <span>{getZodiacTitle(user.zodiac_sign)}</span>
              </div>
            )}
          </div>
        </div>

        {!user.zodiac_sign && (
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 border-opacity-50 rounded-lg p-4">
            <p className="text-yellow-200 text-sm">
              ⚠️ Выберите знак зодиака, чтобы получать персональные предсказания!
            </p>
          </div>
        )}
      </div>

      {/* Статистика */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <Star className="w-6 h-6 text-purple-400" />
          <span>Статистика</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon="🔮"
            title="Предсказаний"
            value={user.predictions_count || 0}
          />
          <StatCard
            icon="📅"
            title="Дней с нами"
            value={Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)) || 0}
          />
          <StatCard
            icon="⭐"
            title="XTR потрачено"
            value={user.predictions_count || 0}
          />
          <StatCard
            icon="🏆"
            title="Позиция"
            value="—"
          />
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Информация об аккаунте
        </h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-purple-200">ID пользователя:</span>
            <span className="text-white font-mono">{user.id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-purple-200">Telegram ID:</span>
            <span className="text-white font-mono">{user.telegram_id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-purple-200">Дата регистрации:</span>
            <span className="text-white">
              {new Date(user.created_at).toLocaleDateString('ru-RU')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-purple-200">Последнее обновление:</span>
            <span className="text-white">
              {new Date(user.updated_at).toLocaleDateString('ru-RU')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <div className="bg-purple-800 bg-opacity-30 rounded-lg p-4 text-center">
    <div className="text-2xl mb-2">{icon}</div>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-xs text-purple-300">{title}</div>
  </div>
);

export default Profile; 