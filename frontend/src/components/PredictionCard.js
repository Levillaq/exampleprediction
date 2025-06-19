import React from 'react';
import { Calendar, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const PredictionCard = ({ prediction, showDate = true, className = "" }) => {
  if (!prediction) return null;

  const getZodiacEmoji = (sign) => {
    const emojis = {
      aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
      leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
      sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓'
    };
    return emojis[sign] || '🔮';
  };

  const getZodiacTitle = (sign) => {
    const titles = {
      aries: 'Овен', taurus: 'Телец', gemini: 'Близнецы', cancer: 'Рак',
      leo: 'Лев', virgo: 'Дева', libra: 'Весы', scorpio: 'Скорпион',
      sagittarius: 'Стрелец', capricorn: 'Козерог', aquarius: 'Водолей', pisces: 'Рыбы'
    };
    return titles[sign] || 'Неизвестный знак';
  };

  return (
    <div className={`card prediction-glow p-6 space-y-4 ${className}`}>
      {/* Заголовок с знаком зодиака */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getZodiacEmoji(prediction.zodiac_sign)}</span>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {getZodiacTitle(prediction.zodiac_sign)}
            </h3>
            {showDate && (
              <div className="flex items-center space-x-1 text-purple-300 text-sm">
                <Calendar className="w-3 h-3" />
                <span>
                  {format(new Date(prediction.prediction_date), 'dd MMMM yyyy', { locale: ru })}
                </span>
              </div>
            )}
          </div>
        </div>
        <Sparkles className="w-5 h-5 text-purple-400" />
      </div>

      {/* Текст предсказания */}
      <div className="bg-black bg-opacity-20 rounded-lg p-4">
        <p className="text-purple-100 leading-relaxed">
          {prediction.prediction_text}
        </p>
      </div>

      {/* Метка времени */}
      <div className="text-center text-xs text-purple-400">
        ✨ Предсказание создано специально для вас ✨
      </div>
    </div>
  );
};

export default PredictionCard; 