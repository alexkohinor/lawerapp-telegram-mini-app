'use client';

import * as React from 'react';
import { AlertDashboard } from '@/components/alerts/AlertDashboard';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Bell, 
  Settings, 
  RefreshCw,
  BarChart3,
  TrendingUp
} from 'lucide-react';

/**
 * Страница управления алертами и уведомлениями
 * Основано на MONITORING_AND_ANALYTICS.md
 */

export default function AlertsPage() {
  const [activeTab, setActiveTab] = React.useState<'alerts' | 'notifications'>('alerts');
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Симуляция обновления данных
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8" />
            Алерты и уведомления
          </h1>
          <p className="text-gray-600 mt-2">
            Мониторинг системных алертов и управление уведомлениями
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
          
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Настройки
          </Button>
        </div>
      </div>

      {/* Табы */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'alerts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Алерты системы
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Bell className="w-4 h-4 inline mr-2" />
            Уведомления
          </button>
        </nav>
      </div>

      {/* Контент */}
      {activeTab === 'alerts' ? (
        <AlertDashboard refreshInterval={30000} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Центр уведомлений */}
          <div className="lg:col-span-2">
            <NotificationCenter userId="current_user" maxNotifications={50} />
          </div>

          {/* Дополнительная информация */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Статистика уведомлений
              </CardTitle>
              <CardDescription>
                Аналитика по типам и каналам уведомлений
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Всего уведомлений</p>
                    <p className="text-sm text-gray-600">За последние 24 часа</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">1,247</p>
                    <p className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12% за час
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Успешные доставки</p>
                    <p className="text-sm text-gray-600">По всем каналам</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">98.5%</p>
                    <p className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +0.2% за час
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Среднее время доставки</p>
                    <p className="text-sm text-gray-600">Внутри приложения</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-600">245ms</p>
                    <p className="text-sm text-yellow-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +5ms за час
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Каналы уведомлений</CardTitle>
              <CardDescription>
                Распределение по каналам доставки
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">В приложении</span>
                  </div>
                  <span className="text-sm text-gray-600">65%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Telegram</span>
                  </div>
                  <span className="text-sm text-gray-600">25%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <span className="text-sm text-gray-600">8%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium">SMS</span>
                  </div>
                  <span className="text-sm text-gray-600">2%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
