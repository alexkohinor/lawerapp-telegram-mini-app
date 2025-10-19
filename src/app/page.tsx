'use client';

import React, { useState, useEffect } from 'react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setMounted(true);
    
    // Обновляем время каждую секунду
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('ru-RU'));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleButtonClick = () => {
    setClickCount(prev => prev + 1);
    alert(`Приложение работает! Кнопка нажата ${clickCount + 1} раз(а)`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Добро пожаловать в LawerApp
        </h1>
        <p className="text-gray-600 mb-4">
          Правовая помощь в Telegram
        </p>
        
        <div className="mb-6 space-y-2">
          <p className="text-sm text-gray-500">
            Текущее время: <span className="font-mono">{currentTime}</span>
          </p>
          <p className="text-sm text-gray-500">
            Кнопка нажата: <span className="font-bold text-blue-600">{clickCount}</span> раз(а)
          </p>
        </div>
        
              <div className="space-y-3">
                <button
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={handleButtonClick}
                >
                  Тестовая кнопка
                </button>

                <button
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  onClick={() => {
                    setClickCount(0);
                    alert('Счетчик сброшен!');
                  }}
                >
                  Сбросить счетчик
                </button>

                <button
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                  onClick={() => {
                    window.location.href = '/miniapp-test';
                  }}
                >
                  📱 Тест Mini App
                </button>

                <button
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
                  onClick={() => {
                    window.location.href = '/test';
                  }}
                >
                  🧪 Расширенное тестирование
                </button>
              </div>
      </div>
    </div>
  );
}