'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HapticFeedback } from '@/components/telegram/HapticFeedback';
import { BackButton } from '@/components/telegram/BackButton';
import { useTelegramUser } from '@/hooks/useTelegramUser';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  subscription: {
    type: 'free' | 'premium' | 'pro';
    expiresAt?: string;
    features: string[];
  };
  stats: {
    consultations: number;
    documents: number;
    disputes: number;
    joinedAt: string;
  };
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: 'ru' | 'en';
  };
}

const MOCK_PROFILE: UserProfile = {
  id: '1',
  firstName: 'Иван',
  lastName: 'Иванов',
  username: 'ivan_ivanov',
  phone: '+7 (999) 123-45-67',
  email: 'ivan@example.com',
  subscription: {
    type: 'premium',
    expiresAt: '2024-12-31T23:59:59Z',
    features: [
      'Неограниченные AI-консультации',
      'Генерация документов',
      'Управление спорами',
      'Приоритетная поддержка'
    ]
  },
  stats: {
    consultations: 15,
    documents: 8,
    disputes: 3,
    joinedAt: '2024-01-01T00:00:00Z'
  },
  preferences: {
    notifications: true,
    theme: 'auto',
    language: 'ru'
  }
};

export default function ProfilePage() {
  const router = useRouter();
  const { hapticFeedback, showAlert } = useTelegramUser();
  const [profile] = useState<UserProfile>(MOCK_PROFILE);
  const [isEditing, setIsEditing] = useState(false);

  const getSubscriptionBadge = (type: UserProfile['subscription']['type']) => {
    switch (type) {
      case 'pro':
        return <Badge variant="danger" className="text-xs">PRO</Badge>;
      case 'premium':
        return <Badge variant="warning" className="text-xs">PREMIUM</Badge>;
      case 'free':
        return <Badge variant="secondary" className="text-xs">FREE</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">UNKNOWN</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleEdit = () => {
    hapticFeedback('light');
    setIsEditing(true);
  };

  const handleSave = () => {
    hapticFeedback('medium');
    setIsEditing(false);
    showAlert('Профиль успешно обновлен!');
  };

  const handleCancel = () => {
    hapticFeedback('light');
    setIsEditing(false);
  };

  const handleSubscription = () => {
    hapticFeedback('medium');
    router.push('/subscription');
  };

  const handleSettings = () => {
    hapticFeedback('light');
    router.push('/settings');
  };

  const handleSupport = () => {
    hapticFeedback('light');
    router.push('/support');
  };

  const handleBackToMain = () => {
    hapticFeedback('light');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <BackButton onClick={handleBackToMain} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl text-white font-bold">
              {profile.firstName[0]}{profile.lastName[0]}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="text-gray-600">
            @{profile.username}
          </p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            {getSubscriptionBadge(profile.subscription.type)}
            <span className="text-sm text-gray-500">
              Пользователь с {formatDate(profile.stats.joinedAt)}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {profile.stats.consultations}
              </div>
              <div className="text-sm text-gray-600">Консультаций</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {profile.stats.documents}
              </div>
              <div className="text-sm text-gray-600">Документов</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {profile.stats.disputes}
              </div>
              <div className="text-sm text-gray-600">Споров</div>
            </CardContent>
          </Card>
        </div>

        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Личная информация</CardTitle>
            <CardDescription>
              Основные данные профиля
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Имя
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      defaultValue={profile.firstName}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Фамилия
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      defaultValue={profile.lastName}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.lastName}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    defaultValue={profile.phone}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.phone}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    defaultValue={profile.email}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.email}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Подписка</CardTitle>
            <CardDescription>
              Текущий план и возможности
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {profile.subscription.type === 'premium' ? 'Premium' : 
                     profile.subscription.type === 'pro' ? 'Pro' : 'Free'} план
                  </h3>
                  {profile.subscription.expiresAt && (
                    <p className="text-sm text-gray-600">
                      Действует до {formatDate(profile.subscription.expiresAt)}
                    </p>
                  )}
                </div>
                <HapticFeedback type="light">
                  <Button
                    variant="outline"
                    onClick={handleSubscription}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    Управлять
                  </Button>
                </HapticFeedback>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Включенные возможности:
                </p>
                <ul className="space-y-1">
                  {profile.subscription.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HapticFeedback type="light">
                <Button
                  variant="outline"
                  onClick={() => router.push('/consultations')}
                  className="h-auto p-4 text-left justify-start"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">💬</span>
                    <div>
                      <div className="font-semibold">AI-консультации</div>
                      <div className="text-xs text-gray-500">{profile.stats.consultations} консультаций</div>
                    </div>
                  </div>
                </Button>
              </HapticFeedback>
              
              <HapticFeedback type="light">
                <Button
                  variant="outline"
                  onClick={() => router.push('/documents')}
                  className="h-auto p-4 text-left justify-start"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📄</span>
                    <div>
                      <div className="font-semibold">Документы</div>
                      <div className="text-xs text-gray-500">{profile.stats.documents} документов</div>
                    </div>
                  </div>
                </Button>
              </HapticFeedback>
              
              <HapticFeedback type="light">
                <Button
                  variant="outline"
                  onClick={() => router.push('/disputes')}
                  className="h-auto p-4 text-left justify-start"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">⚖️</span>
                    <div>
                      <div className="font-semibold">Споры</div>
                      <div className="text-xs text-gray-500">{profile.stats.disputes} споров</div>
                    </div>
                  </div>
                </Button>
              </HapticFeedback>
              
              <HapticFeedback type="light">
                <Button
                  variant="outline"
                  onClick={handleSettings}
                  className="h-auto p-4 text-left justify-start"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">⚙️</span>
                    <div>
                      <div className="font-semibold">Настройки</div>
                      <div className="text-xs text-gray-500">Персонализация</div>
                    </div>
                  </div>
                </Button>
              </HapticFeedback>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          {isEditing ? (
            <>
              <HapticFeedback type="medium">
                <Button
                  variant="default"
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Сохранить изменения
                </Button>
              </HapticFeedback>
              <HapticFeedback type="light">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Отмена
                </Button>
              </HapticFeedback>
            </>
          ) : (
            <>
              <HapticFeedback type="light">
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="flex-1"
                >
                  ✏️ Редактировать профиль
                </Button>
              </HapticFeedback>
              <HapticFeedback type="light">
                <Button
                  variant="outline"
                  onClick={handleSupport}
                  className="flex-1"
                >
                  🆘 Поддержка
                </Button>
              </HapticFeedback>
            </>
          )}
        </div>
      </div>
    </div>
  );
}