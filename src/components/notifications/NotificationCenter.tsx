'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Check, 
  X, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  Trash2,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { notificationService, Notification, NotificationType } from '@/lib/notifications/notification-service';

/**
 * Компонент центра уведомлений
 * Основано на MONITORING_AND_ANALYTICS.md
 */

interface NotificationCenterProps {
  userId?: string;
  maxNotifications?: number;
}

export function NotificationCenter({ userId, maxNotifications = 50 }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId]);

  const loadNotifications = () => {
    if (!userId) return;
    
    setIsLoading(true);
    const userNotifications = notificationService.getUserNotifications(userId, maxNotifications);
    setNotifications(userNotifications);
    setIsLoading(false);
  };

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
    loadNotifications();
  };

  const handleDelete = (notificationId: string) => {
    notificationService.delete(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.readAt) {
        notificationService.markAsRead(notification.id);
      }
    });
    loadNotifications();
  };

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || notification.type === filter
  );

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case NotificationType.ERROR:
        return <XCircle className="w-5 h-5 text-red-600" />;
      case NotificationType.WARNING:
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case NotificationType.CRITICAL:
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'border-l-green-500 bg-green-50';
      case NotificationType.ERROR:
        return 'border-l-red-500 bg-red-50';
      case NotificationType.WARNING:
        return 'border-l-yellow-500 bg-yellow-50';
      case NotificationType.CRITICAL:
        return 'border-l-red-500 bg-red-100';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const unreadCount = notifications.filter(n => !n.readAt).length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Уведомления
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Уведомления
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {unreadCount}
              </span>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as NotificationType | 'all')}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">Все</option>
              <option value={NotificationType.INFO}>Информация</option>
              <option value={NotificationType.SUCCESS}>Успех</option>
              <option value={NotificationType.WARNING}>Предупреждение</option>
              <option value={NotificationType.ERROR}>Ошибка</option>
              <option value={NotificationType.CRITICAL}>Критическое</option>
            </select>
            
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                variant="outline"
                size="sm"
              >
                <Check className="w-4 h-4 mr-1" />
                Прочитать все
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Управление уведомлениями и алертами
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Нет уведомлений</p>
            <p className="text-sm">Здесь будут появляться важные уведомления</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border-l-4 ${getNotificationColor(notification.type)} ${
                  !notification.readAt ? 'ring-2 ring-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {notification.createdAt.toLocaleString()}
                        </span>
                        {notification.channels.length > 0 && (
                          <span>
                            Каналы: {notification.channels.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    {!notification.readAt && (
                      <Button
                        onClick={() => handleMarkAsRead(notification.id)}
                        variant="ghost"
                        size="sm"
                        title="Отметить как прочитанное"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(notification.id)}
                      variant="ghost"
                      size="sm"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {notification.actions && notification.actions.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {notification.actions.map((action) => (
                      <Button
                        key={action.id}
                        variant={action.style === 'primary' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          // Обработка действия
                          console.log('Action clicked:', action.action);
                        }}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
