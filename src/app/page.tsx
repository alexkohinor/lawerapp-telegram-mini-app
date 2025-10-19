'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [isTelegramApp, setIsTelegramApp] = useState(false);
  const [user, setUser] = useState<{id: string; firstName?: string; lastName?: string; username?: string;} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем, запущено ли в Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setIsTelegramApp(true);
      
      // Расширяем приложение
      tg.expand();
      
      // Получаем данные пользователя
      const telegramUser = tg.initDataUnsafe?.user;
      if (telegramUser) {
        setUser({
          id: telegramUser.id?.toString() || 'demo-user',
          firstName: telegramUser.first_name || 'Demo',
          lastName: telegramUser.last_name || 'User',
          username: telegramUser.username || 'demo_user'
        });
      }
    }
    setIsLoading(false);
  }, []);

  const handleNavigation = (path: string) => {
    if (isTelegramApp && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
    router.push(path);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка LawerApp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚖️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LawerApp</h1>
                <p className="text-sm text-gray-600">Правовая помощь в Telegram</p>
              </div>
            </div>
            {user && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {user.firstName?.[0] || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user.firstName} {user.lastName}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Добро пожаловать в LawerApp! 🎉
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Получите профессиональную правовую помощь прямо в Telegram
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
                <span className="text-green-600">✅</span>
                <span className="text-sm text-green-700">Деплой успешен</span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-blue-600">🚀</span>
                <span className="text-sm text-blue-700">Готов к работе</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => handleNavigation('/consultations/new')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">AI Консультации</h3>
                <p className="text-blue-100 text-sm">Получите правовую помощь от ИИ</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleNavigation('/documents/generate')}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">Документы</h3>
                <p className="text-green-100 text-sm">Создайте правовые документы</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleNavigation('/disputes')}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚖️</span>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">Споры</h3>
                <p className="text-purple-100 text-sm">Управляйте правовыми спорами</p>
              </div>
            </div>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Консультации</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">💬</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Документы</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">📄</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активные споры</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">⚖️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Подписка</p>
                <p className="text-lg font-bold text-gray-900">Базовый</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Последняя активность</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600">💬</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Консультация по трудовому праву</p>
                <p className="text-sm text-gray-600">2 часа назад</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Завершено</span>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600">📄</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Претензия к застройщику</p>
                <p className="text-sm text-gray-600">5 часов назад</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Готово</span>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600">⚖️</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Спор с банком</p>
                <p className="text-sm text-gray-600">1 день назад</p>
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">В процессе</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 py-6">
          <p className="text-gray-600 text-sm">
            LawerApp успешно развернут и готов предоставлять правовую помощь через Telegram
          </p>
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={() => handleNavigation('/profile')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Профиль
            </button>
            <button
              onClick={() => handleNavigation('/subscription')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Подписка
            </button>
            <button
              onClick={() => handleNavigation('/test')}
              className="text-gray-500 hover:text-gray-600 text-sm"
            >
              Тестирование
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
