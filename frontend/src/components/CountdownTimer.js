import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ seconds: initialSeconds }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          // Обновляем страницу когда таймер закончился
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(secs).padStart(2, '0')
    };
  };

  if (seconds <= 0) {
    return (
      <div className="text-center">
        <div className="text-2xl font-bold text-green-400">
          ✅ Время вышло!
        </div>
        <p className="text-purple-200 text-sm mt-2">
          Обновите страницу, чтобы купить новое предсказание
        </p>
      </div>
    );
  }

  const { hours, minutes, seconds: secs } = formatTime(seconds);

  return (
    <div className="flex items-center justify-center space-x-4">
      <TimeUnit value={hours} label="часов" />
      <span className="text-purple-300 text-xl">:</span>
      <TimeUnit value={minutes} label="минут" />
      <span className="text-purple-300 text-xl">:</span>
      <TimeUnit value={secs} label="секунд" />
    </div>
  );
};

const TimeUnit = ({ value, label }) => (
  <div className="text-center">
    <div className="bg-purple-800 bg-opacity-50 rounded-lg px-3 py-2 min-w-[50px]">
      <div className="text-2xl font-bold text-white font-mono">
        {value}
      </div>
    </div>
    <div className="text-xs text-purple-300 mt-1">
      {label}
    </div>
  </div>
);

export default CountdownTimer; 