'use client';

import React, { useState, useEffect } from 'react';

export default function TestPage() {
  const [telegramData, setTelegramData] = useState<{
    version: string;
    platform: string;
    colorScheme: string;
    user?: {
      first_name?: string;
    };
    themeParams: Record<string, string>;
  } | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    // Проверяем, запущено ли в Telegram
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setTelegramData({
        version: tg.version,
        platform: tg.platform,
        colorScheme: tg.colorScheme,
        user: tg.initDataUnsafe?.user,
        themeParams: tg.themeParams,
      });
      
      // Расширяем приложение
      tg.expand();
      
      addTestResult('✅ Telegram WebApp обнаружен');
      addTestResult(`📱 Платформа: ${tg.platform}`);
      addTestResult(`👤 Пользователь: ${tg.initDataUnsafe?.user?.first_name || 'Неизвестно'}`);
    } else {
      addTestResult('⚠️ Запущено не в Telegram WebApp');
      addTestResult('💡 Откройте в Telegram для полного тестирования');
    }
  }, []);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testHaptic = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      addTestResult('✅ Вибрация работает');
    } else {
      addTestResult('❌ Вибрация недоступна');
    }
  };

  const testAlert = () => {
    if (window.Telegram?.WebApp) {
      try {
        // В версии 6.0 многие методы не поддерживаются, используем простой alert
        alert('Тест уведомления!');
        addTestResult('✅ Уведомление показано (через alert)');
      } catch (error) {
        addTestResult(`❌ Ошибка уведомления: ${error.message || error}`);
      }
    } else {
      alert('Тест уведомления!');
      addTestResult('✅ Браузерное уведомление показано');
    }
  };

  const testAPI = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        addTestResult('✅ API работает');
        addTestResult(`📊 Статус: ${data.status}`);
      } else {
        addTestResult('❌ API не отвечает');
      }
    } catch (error) {
      addTestResult(`❌ Ошибка API: ${error}`);
    }
  };

  const testWebhook = async () => {
    try {
      const response = await fetch('/api/telegram/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          update_id: 1,
          message: {
            message_id: 1,
            from: { id: 123456789, first_name: 'Test', username: 'testuser' },
            chat: { id: 123456789, type: 'private' },
            date: Math.floor(Date.now() / 1000),
            text: '/start'
          }
        })
      });
      
      if (response.ok) {
        addTestResult('✅ Webhook API работает');
      } else {
        addTestResult('❌ Webhook API не отвечает');
      }
    } catch (error) {
      addTestResult(`❌ Ошибка Webhook: ${error}`);
    }
  };

  const testStorage = () => {
    // CloudStorage не поддерживается в версии 6.0, используем localStorage как fallback
    try {
      if (typeof Storage !== 'undefined') {
        localStorage.setItem('test_key', 'test_value');
        const value = localStorage.getItem('test_key');
        
        if (value === 'test_value') {
          addTestResult('✅ Local Storage работает (CloudStorage недоступен в v6.0)');
          localStorage.removeItem('test_key'); // Очищаем тестовые данные
        } else {
          addTestResult('❌ Local Storage не работает');
        }
      } else {
        addTestResult('❌ Storage API недоступен');
      }
    } catch (error) {
      addTestResult(`❌ Ошибка Storage: ${error.message || error}`);
    }
  };

  const closeApp = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.close();
    } else {
      addTestResult('❌ Функция закрытия недоступна');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🧪 Тест Telegram Mini App
        </h1>

        {/* Информация о Telegram */}
        {telegramData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-3">
              📱 Информация о Telegram
            </h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Версия:</strong> {telegramData.version}</div>
              <div><strong>Платформа:</strong> {telegramData.platform}</div>
              <div><strong>Тема:</strong> {telegramData.colorScheme}</div>
              <div><strong>Пользователь:</strong> {telegramData.user?.first_name || 'Неизвестно'}</div>
            </div>
          </div>
        )}

        {/* Кнопки тестирования */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔧 Тестирование функций
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={testHaptic}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Тест вибрации
            </button>
            <button
              onClick={testAlert}
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Тест уведомления
            </button>
            <button
              onClick={testAPI}
              className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Тест API
            </button>
            <button
              onClick={testWebhook}
              className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Тест Webhook
            </button>
            <button
              onClick={testStorage}
              className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Тест Storage
            </button>
            <button
              onClick={closeApp}
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Закрыть приложение
            </button>
          </div>
        </div>

        {/* Результаты тестов */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📊 Результаты тестов
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">Тесты еще не запущены</p>
            ) : (
              testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-sm ${
                    result.includes('✅') ? 'bg-green-50 text-green-800' :
                    result.includes('❌') ? 'bg-red-50 text-red-800' :
                    result.includes('⚠️') ? 'bg-yellow-50 text-yellow-800' :
                    'bg-gray-50 text-gray-800'
                  }`}
                >
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ссылки */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-2">
            🔗 Для полного тестирования откройте в Telegram:
          </p>
          <a
            href="https://t.me/miniappadvokat_bot?startapp=lawerapp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Открыть в Telegram
          </a>
        </div>
      </div>
    </div>
  );
}
