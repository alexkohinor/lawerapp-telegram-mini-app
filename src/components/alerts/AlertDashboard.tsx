'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Filter,
  RefreshCw,
  Settings,
  Eye,
  Check,
  X
} from 'lucide-react';
import { alertService, Alert, AlertStatus, AlertSeverity, AlertRule } from '@/lib/alerts/alert-service';

/**
 * Компонент дашборда алертов
 * Основано на MONITORING_AND_ANALYTICS.md
 */

interface AlertDashboardProps {
  refreshInterval?: number;
}

export function AlertDashboard({ refreshInterval = 30000 }: AlertDashboardProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [filter, setFilter] = useState<AlertStatus | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadData = () => {
    setIsLoading(true);
    const allAlerts = alertService.getAllAlerts(100);
    const allRules = alertService.getRules();
    setAlerts(allAlerts);
    setRules(allRules);
    setIsLoading(false);
  };

  const handleAcknowledge = (alertId: string) => {
    alertService.acknowledgeAlert(alertId, 'current_user');
    loadData();
  };

  const handleResolve = (alertId: string) => {
    alertService.resolveAlert(alertId, 'current_user');
    loadData();
  };

  const filteredAlerts = alerts.filter(alert => {
    const statusMatch = filter === 'all' || alert.status === filter;
    const severityMatch = severityFilter === 'all' || alert.severity === severityFilter;
    return statusMatch && severityMatch;
  });

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return <XCircle className="w-5 h-5 text-red-600" />;
      case AlertSeverity.HIGH:
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case AlertSeverity.MEDIUM:
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return 'border-l-red-500 bg-red-50';
      case AlertSeverity.HIGH:
        return 'border-l-orange-500 bg-orange-50';
      case AlertSeverity.MEDIUM:
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.ACTIVE:
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case AlertStatus.ACKNOWLEDGED:
        return <Eye className="w-4 h-4 text-yellow-600" />;
      case AlertStatus.RESOLVED:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.ACTIVE:
        return 'bg-red-100 text-red-800';
      case AlertStatus.ACKNOWLEDGED:
        return 'bg-yellow-100 text-yellow-800';
      case AlertStatus.RESOLVED:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = alertService.getStats();
  const activeAlerts = alerts.filter(a => a.status === AlertStatus.ACTIVE);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Активные</p>
                <p className="text-2xl font-bold text-red-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Подтвержденные</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.acknowledged}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Разрешенные</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего</p>
                <p className="text-2xl font-bold text-gray-600">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры и управление */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Алерты системы</CardTitle>
            <div className="flex items-center gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as AlertStatus | 'all')}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">Все статусы</option>
                <option value={AlertStatus.ACTIVE}>Активные</option>
                <option value={AlertStatus.ACKNOWLEDGED}>Подтвержденные</option>
                <option value={AlertStatus.RESOLVED}>Разрешенные</option>
              </select>
              
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as AlertSeverity | 'all')}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">Все серьезности</option>
                <option value={AlertSeverity.CRITICAL}>Критические</option>
                <option value={AlertSeverity.HIGH}>Высокие</option>
                <option value={AlertSeverity.MEDIUM}>Средние</option>
                <option value={AlertSeverity.LOW}>Низкие</option>
              </select>
              
              <Button onClick={loadData} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Мониторинг и управление системными алертами
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Нет алертов</p>
              <p className="text-sm">Система работает стабильно</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">
                            {alert.title}
                          </h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(alert.status)}`}>
                            {alert.status}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            Сработал: {alert.triggeredAt.toLocaleString()}
                          </span>
                          <span>
                            Значение: {alert.value} (порог: {alert.threshold})
                          </span>
                          {alert.tags.length > 0 && (
                            <span>
                              Теги: {alert.tags.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      {alert.status === AlertStatus.ACTIVE && (
                        <>
                          <Button
                            onClick={() => handleAcknowledge(alert.id)}
                            variant="outline"
                            size="sm"
                            title="Подтвердить"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleResolve(alert.id)}
                            variant="outline"
                            size="sm"
                            title="Разрешить"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {alert.status === AlertStatus.ACKNOWLEDGED && (
                        <Button
                          onClick={() => handleResolve(alert.id)}
                          variant="outline"
                          size="sm"
                          title="Разрешить"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Правила алертов */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Правила алертов</CardTitle>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Настроить
            </Button>
          </div>
          <CardDescription>
            Активные правила мониторинга системы
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => (
              <div key={rule.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{rule.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rule.enabled ? 'Включено' : 'Отключено'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                <div className="text-xs text-gray-500">
                  <p>Метрика: {rule.metric}</p>
                  <p>Условие: {rule.condition} {rule.threshold}</p>
                  <p>Серьезность: {rule.severity}</p>
                  <p>Каналы: {rule.notificationChannels.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
