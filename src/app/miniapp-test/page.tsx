'use client';

import React, { useState, useEffect } from 'react';

export default function MiniAppTestPage() {
  const [telegramData, setTelegramData] = useState<{
    version: string;
    platform: string;
    colorScheme: string;
    user?: {
      first_name?: string;
    };
    themeParams: Record<string, string>;
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
  } | null>(null);
  const [isInTelegram, setIsInTelegram] = useState(false);

  useEffect(() => {
    // Проверяем, запущено ли в Telegram
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setIsInTelegram(true);
      setTelegramData({
        version: tg.version,
        platform: tg.platform,
        colorScheme: tg.colorScheme,
        user: tg.initDataUnsafe?.user,
        themeParams: tg.themeParams,
        isExpanded: tg.isExpanded,
        viewportHeight: tg.viewportHeight,
        viewportStableHeight: tg.viewportStableHeight,
      });
      
      // Расширяем приложение
      tg.expand();
      tg.ready();
    }
  }, []);

  const testTelegramAPI = () => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Тест вибрации
      if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
        alert('✅ Вибрация работает!');
      }
      
      // Тест закрытия
      setTimeout(() => {
        if (confirm('Закрыть Mini App?')) {
          tg.close();
        }
      }, 1000);
    } else {
      alert('❌ Запущено не в Telegram WebApp');
    }
  };

  const openInTelegram = () => {
    const telegramUrl = 'https://t.me/miniappadvokat_bot?startapp=lawerapp';
    window.open(telegramUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            🏛️ LawerApp Mini App Test
          </h1>

          {/* Статус Telegram */}
          <div className={`p-4 rounded-lg mb-6 ${
            isInTelegram 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <h2 className="text-xl font-semibold mb-3">
              {isInTelegram ? '✅ Запущено в Telegram' : '⚠️ Запущено в браузере'}
            </h2>
            
            {isInTelegram && telegramData ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><strong>Версия:</strong> {telegramData.version}</div>
                <div><strong>Платформа:</strong> {telegramData.platform}</div>
                <div><strong>Тема:</strong> {telegramData.colorScheme}</div>
                <div><strong>Пользователь:</strong> {telegramData.user?.first_name || 'Неизвестно'}</div>
                <div><strong>Развернуто:</strong> {telegramData.isExpanded ? 'Да' : 'Нет'}</div>
                <div><strong>Высота:</strong> {telegramData.viewportHeight}px</div>
              </div>
            ) : (
              <p className="text-gray-600">
                Для полного тестирования Mini App откройте его в Telegram
              </p>
            )}
          </div>

          {/* Кнопки тестирования */}
          <div className="space-y-4 mb-6">
            <button
              onClick={testTelegramAPI}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              🧪 Тест Telegram API
            </button>

            {!isInTelegram && (
              <button
                onClick={openInTelegram}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                📱 Открыть в Telegram
              </button>
            )}

            <button
              onClick={() => window.location.href = '/test'}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              🔧 Расширенное тестирование
            </button>
          </div>

          {/* Информация о Mini App */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">📱 О Mini App</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Название:</strong> LawerApp - Правовая помощь</p>
              <p><strong>Бот:</strong> @miniappadvokat_bot</p>
              <p><strong>Версия:</strong> 1.0.0</p>
              <p><strong>Функции:</strong> AI консультации, генерация документов, управление спорами</p>
            </div>
          </div>

          {/* Инструкции */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">📋 Как протестировать:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Нажмите &quot;Открыть в Telegram&quot; (если не в Telegram)</li>
              <li>Telegram откроется и запустит Mini App</li>
              <li>Нажмите &quot;Тест Telegram API&quot; для проверки функций</li>
              <li>Проверьте все интерактивные элементы</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
