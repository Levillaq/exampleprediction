import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Sparkles, Star, Clock, Calendar, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

import { predictionAPI, paymentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import PredictionCard from '../components/PredictionCard';
import CountdownTimer from '../components/CountdownTimer';

const Home = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Запрос текущего предсказания
  const { data: todayPrediction, isLoading: predictionLoading } = useQuery(
    'todayPrediction',
    predictionAPI.getTodayPrediction,
    {
      refetchInterval: 60000, // Обновляем каждую минуту
      retry: 1,
    }
  );

  // Запрос возможности покупки
  const { data: canPurchaseData, isLoading: purchaseLoading } = useQuery(
    'canPurchase',
    predictionAPI.canPurchase,
    {
      refetchInterval: 30000, // Обновляем каждые 30 секунд
      retry: 1,
    }
  );

  // Мутация для создания платежа
  const createPaymentMutation = useMutation(paymentAPI.createInvoice, {
    onSuccess: (data) => {
      handlePaymentCreated(data.data);
    },
    onError: (error) => {
      toast.error('Ошибка создания платежа');
      setIsProcessingPayment(false);
    },
  });

  const handlePaymentCreated = (paymentData) => {
    const { payment_id, invoice_url } = paymentData;
    
    // Если в Telegram Web App, используем Telegram API для платежа
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Открываем Telegram invoice
      tg.openInvoice(invoice_url, (status) => {
        if (status === 'paid') {
          confirmPayment(payment_id);
        } else {
          setIsProcessingPayment(false);
          toast.error('Платеж отменен');
        }
      });
    } else {
      // Для демо версии - симулируем успешную оплату
      setTimeout(() => {
        confirmPayment(payment_id);
      }, 2000);
      
      toast.success('Демо-платеж обрабатывается...');
    }
  };

  const confirmPayment = async (paymentId) => {
    try {
      await paymentAPI.confirmPayment(paymentId);
      
      // Обновляем данные
      queryClient.invalidateQueries('todayPrediction');
      queryClient.invalidateQueries('canPurchase');
      queryClient.invalidateQueries('userPredictions');
      
      toast.success('🔮 Предсказание получено!');
    } catch (error) {
      toast.error('Ошибка подтверждения платежа');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePurchasePrediction = () => {
    if (!canPurchaseData?.data?.can_purchase) {
      toast.error('Сегодня предсказание уже куплено');
      return;
    }

    setIsProcessingPayment(true);
    createPaymentMutation.mutate();
  };

  if (predictionLoading || purchaseLoading) {
    return <LoadingSpinner />;
  }

  const hasTodayPrediction = todayPrediction?.data;
  const canPurchase = canPurchaseData?.data?.can_purchase;
  const nextAvailableSeconds = canPurchaseData?.data?.next_available_in_seconds;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Заголовок */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <span className="text-8xl crystal-ball">🔮</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold gradient-text">
          Предикшн Бот
        </h1>
        <p className="text-purple-200 text-lg max-w-2xl mx-auto">
          Получайте персональные предсказания каждый день, основанные на вашем знаке зодиака
        </p>
      </div>

      {/* Информация о пользователе */}
      {user && (
        <div className="card p-6 text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="text-3xl">
              {user.zodiac_sign ? getZodiacEmoji(user.zodiac_sign) : '❓'}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Привет, {user.first_name}!
              </h2>
              <p className="text-purple-200">
                {user.zodiac_sign ? getZodiacTitle(user.zodiac_sign) : 'Выберите знак зодиака в профиле'}
              </p>
            </div>
          </div>
          
          <div className="flex justify-center items-center space-x-6 text-sm text-purple-200">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 star" />
              <span>{user.predictions_count} предсказаний</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Сегодня: {new Date().toLocaleDateString('ru-RU')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Основной контент */}
      <div className="space-y-6">
        {hasTodayPrediction ? (
          // Показываем сегодняшнее предсказание
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-center text-white">
              Ваше предсказание на сегодня
            </h3>
            <PredictionCard prediction={hasTodayPrediction} showDate={false} />
            
            {/* Счетчик до следующего дня */}
            {nextAvailableSeconds > 0 && (
              <div className="card p-6 text-center">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <Clock className="w-5 h-5 text-purple-300" />
                  <span className="text-purple-200">
                    Следующее предсказание через:
                  </span>
                </div>
                <CountdownTimer seconds={nextAvailableSeconds} />
              </div>
            )}
          </div>
        ) : (
          // Показываем кнопку покупки
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-center text-white">
              Получите предсказание на сегодня
            </h3>
            
            <div className="card p-8 text-center space-y-6">
              <div className="space-y-3">
                <div className="text-6xl">🌟</div>
                <h4 className="text-xl font-semibold text-white">
                  Персональное предсказание
                </h4>
                <p className="text-purple-200 max-w-md mx-auto">
                  Узнайте, что готовят для вас звезды сегодня. 
                  Каждое предсказание уникально и создано специально для вашего знака зодиака.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-3 text-2xl font-bold text-white">
                  <Star className="w-6 h-6 star" />
                  <span>1 XTR</span>
                  <Star className="w-6 h-6 star" />
                </div>

                <button
                  onClick={handlePurchasePrediction}
                  disabled={!canPurchase || isProcessingPayment || !user?.zodiac_sign}
                  className={`btn-primary btn-payment w-full max-w-sm mx-auto flex items-center justify-center space-x-2 text-lg ${
                    isProcessingPayment ? 'loading' : ''
                  }`}
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="loading w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Обработка...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Купить предсказание</span>
                    </>
                  )}
                </button>

                {!user?.zodiac_sign && (
                  <p className="text-yellow-300 text-sm">
                    ⚠️ Сначала выберите знак зодиака в профиле
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Информационные карточки */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <h4 className="font-semibold text-white mb-2">Персональные</h4>
          <p className="text-purple-200 text-sm">
            Каждое предсказание создано специально для вашего знака зодиака
          </p>
        </div>
        
        <div className="card p-6 text-center">
          <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <h4 className="font-semibold text-white mb-2">Ежедневные</h4>
          <p className="text-purple-200 text-sm">
            Новое предсказание каждый день в 00:00 по вашему времени
          </p>
        </div>
        
        <div className="card p-6 text-center">
          <Star className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <h4 className="font-semibold text-white mb-2">Доступные</h4>
          <p className="text-purple-200 text-sm">
            Всего 1 XTR Star за каждое персональное предсказание
          </p>
        </div>
      </div>
    </div>
  );
};

// Утилиты для знаков зодиака
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
  return titles[sign] || 'Неизвестный знак';
};

export default Home; 