'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Activity, 
  Users, 
  MessageSquare, 
  FileText, 
  CreditCard, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

/**
 * Компонент для отображения метрик в реальном времени
 * Основано на MONITORING_AND_ANALYTICS.md
 */

interface MetricData {
  name: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'stable';
  unit?: string;
  description: string;
}

interface RealTimeMetricsProps {
  refreshInterval?: number;
}

export function RealTimeMetrics({ refreshInterval = 5000 }: RealTimeMetricsProps) {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        
        // Симуляция получения метрик (в реальном приложении это будет API вызов)
        const mockMetrics: MetricData[] = [
          {
            name: 'active_users',
            value: Math.floor(Math.random() * 1000) + 500,
            change: Math.floor(Math.random() * 20) - 10,
            changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
            unit: 'пользователей',
            description: 'Активные пользователи'
          },
          {
            name: 'ai_consultations',
            value: Math.floor(Math.random() * 100) + 50,
            change: Math.floor(Math.random() * 15) - 5,
            changeType: Math.random() > 0.3 ? 'increase' : 'decrease',
            unit: 'консультаций',
            description: 'AI консультации за час'
          },
          {
            name: 'documents_generated',
            value: Math.floor(Math.random() * 200) + 100,
            change: Math.floor(Math.random() * 25) - 10,
            changeType: Math.random() > 0.4 ? 'increase' : 'decrease',
            unit: 'документов',
            description: 'Документы за час'
          },
          {
            name: 'disputes_created',
            value: Math.floor(Math.random() * 50) + 20,
            change: Math.floor(Math.random() * 10) - 5,
            changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
            unit: 'споров',
            description: 'Споры за час'
          },
          {
            name: 'payment_success_rate',
            value: Math.floor(Math.random() * 20) + 80,
            change: Math.floor(Math.random() * 5) - 2,
            changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
            unit: '%',
            description: 'Успешность платежей'
          },
          {
            name: 'response_time',
            value: Math.floor(Math.random() * 500) + 100,
            change: Math.floor(Math.random() * 100) - 50,
            changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
            unit: 'мс',
            description: 'Время ответа API'
          }
        ];

        setMetrics(mockMetrics);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Первоначальная загрузка
    fetchMetrics();

    // Настройка интервала обновления
    const interval = setInterval(fetchMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getChangeIcon = (changeType?: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getChangeColor = (changeType?: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getMetricIcon = (name: string) => {
    switch (name) {
      case 'active_users':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'ai_consultations':
        return <MessageSquare className="w-5 h-5 text-purple-600" />;
      case 'documents_generated':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'disputes_created':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'payment_success_rate':
        return <CreditCard className="w-5 h-5 text-indigo-600" />;
      case 'response_time':
        return <Activity className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Метрики в реальном времени</h2>
          <p className="text-gray-600">
            Последнее обновление: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Обновляется каждые {refreshInterval / 1000}с</span>
        </div>
      </div>

      {/* Метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.name} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getMetricIcon(metric.name)}
                  <h3 className="font-medium text-gray-900">{metric.description}</h3>
                </div>
                {metric.change !== undefined && (
                  <div className={`flex items-center space-x-1 ${getChangeColor(metric.changeType)}`}>
                    {getChangeIcon(metric.changeType)}
                    <span className="text-sm font-medium">
                      {metric.change > 0 ? '+' : ''}{metric.change}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-900">
                  {metric.value.toLocaleString()}
                  {metric.unit && (
                    <span className="text-lg font-normal text-gray-600 ml-1">
                      {metric.unit}
                    </span>
                  )}
                </div>
                
                {metric.change !== undefined && (
                  <div className="text-sm text-gray-600">
                    {metric.changeType === 'increase' ? 'Увеличилось' : 
                     metric.changeType === 'decrease' ? 'Уменьшилось' : 'Без изменений'} 
                    за последний час
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Дополнительная информация */}
      <Card>
        <CardHeader>
          <CardTitle>Статус системы</CardTitle>
          <CardDescription>
            Общее состояние всех сервисов и компонентов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">API Сервер</p>
                <p className="text-sm text-gray-600">Работает</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">База данных</p>
                <p className="text-sm text-gray-600">Подключена</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">AI Сервис</p>
                <p className="text-sm text-gray-600">Активен</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Платежная система</p>
                <p className="text-sm text-gray-600">Доступна</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
