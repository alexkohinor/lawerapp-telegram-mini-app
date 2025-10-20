'use client';

import * as React from 'react';
import { RealTimeMetrics } from '@/components/monitoring/RealTimeMetrics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  Download, 
  RefreshCw,
  Settings,
  BarChart3,
  TrendingUp
} from 'lucide-react';

/**
 * Страница мониторинга системы
 * Основано на MONITORING_AND_ANALYTICS.md
 */

export default function MonitoringPage() {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Симуляция обновления данных
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExportMetrics = () => {
    // Экспорт метрик в формате Prometheus
    const metricsUrl = '/api/metrics';
    window.open(metricsUrl, '_blank');
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Activity className="w-8 h-8" />
            Мониторинг системы
          </h1>
          <p className="text-gray-600 mt-2">
            Отслеживание производительности и состояния всех компонентов приложения
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
          
          <Button
            onClick={handleExportMetrics}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Экспорт метрик
          </Button>
          
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Настройки
          </Button>
        </div>
      </div>

      {/* Основные метрики */}
      <RealTimeMetrics refreshInterval={5000} />

      {/* Дополнительные секции */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Алерты и уведомления */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Алерты и уведомления
            </CardTitle>
            <CardDescription>
              Активные предупреждения и критические события
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-yellow-800">Высокая нагрузка на CPU</p>
                  <p className="text-sm text-yellow-600">CPU usage: 85% - превышает порог в 80%</p>
                </div>
                <span className="text-xs text-yellow-600">2 мин назад</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-green-800">Система работает стабильно</p>
                  <p className="text-sm text-green-600">Все сервисы функционируют нормально</p>
                </div>
                <span className="text-xs text-green-600">5 мин назад</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-blue-800">Новый пользователь зарегистрирован</p>
                  <p className="text-sm text-blue-600">ID: 12345, план: Premium</p>
                </div>
                <span className="text-xs text-blue-600">10 мин назад</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Аналитика производительности */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Аналитика производительности
            </CardTitle>
            <CardDescription>
              Тренды и статистика за последние 24 часа
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Среднее время ответа</p>
                  <p className="text-sm text-gray-600">API endpoints</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">245ms</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    -12% за час
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Успешность запросов</p>
                  <p className="text-sm text-gray-600">HTTP статус коды</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">99.8%</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +0.1% за час
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Использование памяти</p>
                  <p className="text-sm text-gray-600">Heap usage</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-600">78%</p>
                  <p className="text-sm text-yellow-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +5% за час
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Активные соединения</p>
                  <p className="text-sm text-gray-600">WebSocket connections</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">1,247</p>
                  <p className="text-sm text-blue-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +23 за час
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Информация о системе */}
      <Card>
        <CardHeader>
          <CardTitle>Информация о системе</CardTitle>
          <CardDescription>
            Технические детали и конфигурация
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Версия приложения</h4>
              <p className="text-sm text-gray-600">v1.0.0</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Время работы</h4>
              <p className="text-sm text-gray-600">7 дней 14 часов</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Node.js версия</h4>
              <p className="text-sm text-gray-600">v18.17.0</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Окружение</h4>
              <p className="text-sm text-gray-600">Production</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
