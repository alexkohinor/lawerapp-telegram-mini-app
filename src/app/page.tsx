'use client';

import React from 'react';

export default function HomePage() {
  const handleButtonClick = () => {
    alert('Приложение работает! Добро пожаловать в LawerApp!');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🏛️ LawerApp
        </h1>
        <p className="text-gray-600 mb-6">
          Правовая помощь в Telegram Mini App
        </p>
        
        <div className="space-y-3">
          <button
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            onClick={handleButtonClick}
          >
            ✅ Проверить работу приложения
          </button>

          <a
            href="/test"
            className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
          >
            🧪 Расширенное тестирование
          </a>

          <a
            href="/miniapp-test"
            className="block w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium text-center"
          >
            📱 Тест Mini App функций
          </a>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            🚀 Готово к использованию!
          </h3>
          <p className="text-xs text-blue-700">
            LawerApp успешно развернут и готов предоставлять правовую помощь через Telegram.
          </p>
        </div>
      </div>
    </div>
  );
}