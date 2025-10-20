'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HapticFeedback } from '@/components/telegram/HapticFeedback';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  CreditCard, 
  Download,
  Edit,
  Save,
  X,
  Crown,
  Star,
  TrendingUp,
  Calendar,
  Globe,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

interface UserProfile {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  isPremium: boolean;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionInfo {
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  consultationsUsed: number;
  consultationsLimit: number;
  documentsUsed: number;
  documentsLimit: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useUser();
  const { showAlert } = useTelegramUser();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    username: ''
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      loadProfile();
    }
  }, [isAuthenticated, user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setIsLoadingProfile(true);
    try {
      // Загружаем профиль пользователя
      setProfile({
        id: user.id,
        telegramId: user.telegramId.toString(),
        username: user.username || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        languageCode: user.languageCode || 'ru',
        isPremium: user.isPremium,
        photoUrl: user.photoUrl || '',
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      });

      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || ''
      });

      // Загружаем информацию о подписке (заглушка)
      setSubscription({
        plan: user.isPremium ? 'PREMIUM' : 'FREE',
        status: 'ACTIVE',
        startDate: user.createdAt.toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 дней
        autoRenew: false,
        consultationsUsed: 3,
        consultationsLimit: user.isPremium ? 50 : 5,
        documentsUsed: 1,
        documentsLimit: user.isPremium ? 20 : 3
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      showAlert('Ошибка при загрузке профиля');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      // TODO: Implement profile update API
      showAlert('Обновление профиля будет добавлено в следующих версиях');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      showAlert('Ошибка при сохранении профиля');
    }
  };

  const handleExportData = () => {
    if (!profile) return;
    
    const data = {
      profile,
      subscription,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lawerapp-profile-${profile.telegramId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showAlert('Данные профиля экспортированы');
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'PREMIUM':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'BUSINESS':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'PREMIUM':
        return 'Премиум';
      case 'BUSINESS':
        return 'Бизнес';
      default:
        return 'Бесплатный';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Доступ ограничен</CardTitle>
            <CardDescription className="text-center">
              Необходима авторизация для просмотра профиля
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="p-4 space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Профиль
          </h1>
          <div className="flex items-center space-x-2">
            <HapticFeedback impact="light">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Экспорт</span>
              </Button>
            </HapticFeedback>
            <HapticFeedback impact="light">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-1"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                <span>{isEditing ? 'Отмена' : 'Изменить'}</span>
              </Button>
            </HapticFeedback>
          </div>
        </div>

        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-6 h-6 text-blue-600" />
              <span>Личная информация</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Avatar and Basic Info */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {profile?.firstName?.[0] || profile?.username?.[0] || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {profile?.firstName} {profile?.lastName}
                    </h3>
                    {profile?.isPremium && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    @{profile?.username || 'username'}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {profile?.telegramId}
                  </p>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Имя
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.firstName || 'Не указано'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Фамилия
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.lastName || 'Не указано'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">@{profile?.username || 'Не указано'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Язык
                  </label>
                  <p className="text-gray-900">
                    {profile?.languageCode === 'ru' ? 'Русский' : profile?.languageCode || 'Не указано'}
                  </p>
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-3 pt-4">
                  <HapticFeedback impact="light">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Отмена
                    </Button>
                  </HapticFeedback>
                  <HapticFeedback impact="light">
                    <Button
                      variant="gradient"
                      onClick={handleSaveProfile}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Сохранить
                    </Button>
                  </HapticFeedback>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Info */}
        {subscription && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-6 h-6 text-green-600" />
                <span>Подписка</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getPlanLabel(subscription.plan)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Активна до {formatDate(subscription.endDate)}
                    </p>
                  </div>
                  <Badge className={getPlanColor(subscription.plan)}>
                    {subscription.plan}
                  </Badge>
                </div>

                {/* Usage Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Консультации</span>
                      <span className="text-sm text-gray-600">
                        {subscription.consultationsUsed}/{subscription.consultationsLimit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(subscription.consultationsUsed / subscription.consultationsLimit) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Документы</span>
                      <span className="text-sm text-gray-600">
                        {subscription.documentsUsed}/{subscription.documentsLimit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(subscription.documentsUsed / subscription.documentsLimit) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {subscription.plan === 'FREE' && (
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-5 h-5 text-yellow-600" />
                      <h4 className="font-semibold text-yellow-800">Обновите до Premium</h4>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      Получите больше консультаций и документов
                    </p>
                    <HapticFeedback impact="light">
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={() => router.push('/subscription')}
                      >
                        <Crown className="w-4 h-4 mr-1" />
                        Обновить план
                      </Button>
                    </HapticFeedback>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-6 h-6 text-gray-600" />
              <span>Информация об аккаунте</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Дата регистрации</span>
                <span className="text-sm text-gray-900">
                  {profile ? formatDate(profile.createdAt) : 'Неизвестно'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Последнее обновление</span>
                <span className="text-sm text-gray-900">
                  {profile ? formatDate(profile.updatedAt) : 'Неизвестно'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Telegram ID</span>
                <span className="text-sm text-gray-900 font-mono">
                  {profile?.telegramId}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <HapticFeedback impact="light">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/subscription')}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Управление подпиской
                </Button>
              </HapticFeedback>
              
              <HapticFeedback impact="light">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => showAlert('Настройки уведомлений будут добавлены в следующих версиях')}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Уведомления
                </Button>
              </HapticFeedback>
              
              <HapticFeedback impact="light">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => showAlert('Настройки конфиденциальности будут добавлены в следующих версиях')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Конфиденциальность
                </Button>
              </HapticFeedback>
              
              <HapticFeedback impact="light">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleExportData}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Экспорт данных
                </Button>
              </HapticFeedback>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}