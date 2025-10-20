/**
 * Сервис уведомлений и алертов
 * Основано на MONITORING_AND_ANALYTICS.md и FEATURE_SPECIFICATION.md
 */

import { prometheusMetrics } from '@/lib/monitoring/prometheus-metrics';
import { errorMonitor } from '@/lib/monitoring/error-monitor';

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  TELEGRAM = 'telegram',
  EMAIL = 'email',
  SMS = 'sms',
  WEBHOOK = 'webhook'
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId?: string;
  channels: NotificationChannel[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  style: 'primary' | 'secondary' | 'danger';
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  title: string;
  message: string;
  channels: NotificationChannel[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  variables: string[];
}

/**
 * Сервис для управления уведомлениями
 */
export class NotificationService {
  private notifications: Map<string, Notification> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private subscribers: Map<string, (notification: Notification) => void> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Инициализация шаблонов уведомлений
   */
  private initializeTemplates(): void {
    const templates: NotificationTemplate[] = [
      {
        id: 'user_registration',
        name: 'Регистрация пользователя',
        type: NotificationType.SUCCESS,
        title: 'Добро пожаловать в LawerApp!',
        message: 'Вы успешно зарегистрированы. Начните с бесплатной AI консультации.',
        channels: [NotificationChannel.IN_APP, NotificationChannel.TELEGRAM],
        priority: 'medium',
        variables: ['userName', 'planName']
      },
      {
        id: 'ai_consultation_complete',
        name: 'AI консультация завершена',
        type: NotificationType.INFO,
        title: 'Консультация готова',
        message: 'Ваша AI консультация по вопросу "{question}" завершена.',
        channels: [NotificationChannel.IN_APP, NotificationChannel.TELEGRAM],
        priority: 'medium',
        variables: ['question', 'consultationId']
      },
      {
        id: 'document_generated',
        name: 'Документ сгенерирован',
        type: NotificationType.SUCCESS,
        title: 'Документ готов',
        message: 'Ваш документ "{documentName}" успешно сгенерирован.',
        channels: [NotificationChannel.IN_APP, NotificationChannel.TELEGRAM],
        priority: 'medium',
        variables: ['documentName', 'documentId']
      },
      {
        id: 'dispute_status_change',
        name: 'Изменение статуса спора',
        type: NotificationType.INFO,
        title: 'Статус спора обновлен',
        message: 'Статус вашего спора "{disputeTitle}" изменен на "{newStatus}".',
        channels: [NotificationChannel.IN_APP, NotificationChannel.TELEGRAM],
        priority: 'high',
        variables: ['disputeTitle', 'newStatus', 'disputeId']
      },
      {
        id: 'payment_success',
        name: 'Успешная оплата',
        type: NotificationType.SUCCESS,
        title: 'Оплата прошла успешно',
        message: 'Ваша оплата на сумму {amount} {currency} прошла успешно.',
        channels: [NotificationChannel.IN_APP, NotificationChannel.TELEGRAM],
        priority: 'high',
        variables: ['amount', 'currency', 'paymentId']
      },
      {
        id: 'payment_failed',
        name: 'Ошибка оплаты',
        type: NotificationType.ERROR,
        title: 'Ошибка при оплате',
        message: 'Произошла ошибка при обработке платежа. Попробуйте еще раз.',
        channels: [NotificationChannel.IN_APP, NotificationChannel.TELEGRAM],
        priority: 'high',
        variables: ['errorMessage', 'paymentId']
      },
      {
        id: 'subscription_expiring',
        name: 'Подписка истекает',
        type: NotificationType.WARNING,
        title: 'Подписка истекает',
        message: 'Ваша подписка "{planName}" истекает через {daysLeft} дней.',
        channels: [NotificationChannel.IN_APP, NotificationChannel.TELEGRAM, NotificationChannel.EMAIL],
        priority: 'high',
        variables: ['planName', 'daysLeft', 'subscriptionId']
      },
      {
        id: 'security_alert',
        name: 'Предупреждение безопасности',
        type: NotificationType.CRITICAL,
        title: 'Обнаружена подозрительная активность',
        message: 'Обнаружена подозрительная активность в вашем аккаунте. Проверьте безопасность.',
        channels: [NotificationChannel.IN_APP, NotificationChannel.TELEGRAM, NotificationChannel.EMAIL],
        priority: 'urgent',
        variables: ['activityType', 'timestamp']
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Создание уведомления из шаблона
   */
  createFromTemplate(
    templateId: string,
    variables: Record<string, any>,
    userId?: string,
    customChannels?: NotificationChannel[]
  ): Notification {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    let title = template.title;
    let message = template.message;

    // Заменяем переменные в тексте
    template.variables.forEach(variable => {
      const value = variables[variable] || `{${variable}}`;
      title = title.replace(`{${variable}}`, value);
      message = message.replace(`{${variable}}`, value);
    });

    const notification: Notification = {
      id: this.generateNotificationId(),
      type: template.type,
      title,
      message,
      userId,
      channels: customChannels || template.channels,
      priority: template.priority,
      createdAt: new Date(),
      metadata: variables
    };

    return this.create(notification);
  }

  /**
   * Создание уведомления
   */
  create(notification: Omit<Notification, 'id' | 'createdAt'>): Notification {
    const fullNotification: Notification = {
      ...notification,
      id: this.generateNotificationId(),
      createdAt: new Date()
    };

    this.notifications.set(fullNotification.id, fullNotification);

    // Отправляем уведомление по каналам
    this.sendNotification(fullNotification);

    // Отправляем метрики
    prometheusMetrics.incrementCounter('notifications_created_total', {
      type: fullNotification.type,
      priority: fullNotification.priority,
      channel: fullNotification.channels.join(',')
    });

    // Логируем создание уведомления
    errorMonitor.logInfo('Notification Created', {
      notificationId: fullNotification.id,
      type: fullNotification.type,
      userId: fullNotification.userId,
      channels: fullNotification.channels
    });

    return fullNotification;
  }

  /**
   * Отправка уведомления по каналам
   */
  private async sendNotification(notification: Notification): Promise<void> {
    for (const channel of notification.channels) {
      try {
        await this.sendToChannel(notification, channel);
      } catch (error) {
        errorMonitor.logError('Failed to send notification', {
          notificationId: notification.id,
          channel,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  /**
   * Отправка уведомления в конкретный канал
   */
  private async sendToChannel(notification: Notification, channel: NotificationChannel): Promise<void> {
    switch (channel) {
      case NotificationChannel.IN_APP:
        await this.sendInApp(notification);
        break;
      case NotificationChannel.TELEGRAM:
        await this.sendTelegram(notification);
        break;
      case NotificationChannel.EMAIL:
        await this.sendEmail(notification);
        break;
      case NotificationChannel.SMS:
        await this.sendSMS(notification);
        break;
      case NotificationChannel.WEBHOOK:
        await this.sendWebhook(notification);
        break;
    }
  }

  /**
   * Отправка в приложение
   */
  private async sendInApp(notification: Notification): Promise<void> {
    // Уведомляем подписчиков
    this.subscribers.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        errorMonitor.logError('Failed to notify subscriber', {
          notificationId: notification.id,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });
  }

  /**
   * Отправка в Telegram
   */
  private async sendTelegram(notification: Notification): Promise<void> {
    // В реальном приложении здесь будет интеграция с Telegram Bot API
    console.log(`Telegram notification: ${notification.title} - ${notification.message}`);
  }

  /**
   * Отправка по email
   */
  private async sendEmail(notification: Notification): Promise<void> {
    // В реальном приложении здесь будет интеграция с email сервисом
    console.log(`Email notification: ${notification.title} - ${notification.message}`);
  }

  /**
   * Отправка SMS
   */
  private async sendSMS(notification: Notification): Promise<void> {
    // В реальном приложении здесь будет интеграция с SMS сервисом
    console.log(`SMS notification: ${notification.title} - ${notification.message}`);
  }

  /**
   * Отправка webhook
   */
  private async sendWebhook(notification: Notification): Promise<void> {
    // В реальном приложении здесь будет отправка webhook
    console.log(`Webhook notification: ${notification.title} - ${notification.message}`);
  }

  /**
   * Получение уведомлений пользователя
   */
  getUserNotifications(userId: string, limit?: number): Notification[] {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return limit ? userNotifications.slice(0, limit) : userNotifications;
  }

  /**
   * Отметка уведомления как прочитанного
   */
  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (notification && !notification.readAt) {
      notification.readAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Удаление уведомления
   */
  delete(notificationId: string): boolean {
    return this.notifications.delete(notificationId);
  }

  /**
   * Подписка на уведомления
   */
  subscribe(subscriberId: string, callback: (notification: Notification) => void): void {
    this.subscribers.set(subscriberId, callback);
  }

  /**
   * Отписка от уведомлений
   */
  unsubscribe(subscriberId: string): void {
    this.subscribers.delete(subscriberId);
  }

  /**
   * Очистка старых уведомлений
   */
  cleanupOldNotifications(maxAge: number = 604800000): void { // 7 дней по умолчанию
    const cutoff = new Date(Date.now() - maxAge);
    for (const [id, notification] of this.notifications) {
      if (notification.createdAt < cutoff) {
        this.notifications.delete(id);
      }
    }
  }

  /**
   * Генерация ID уведомления
   */
  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Получение статистики уведомлений
   */
  getStats(): {
    total: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    unread: number;
  } {
    const notifications = Array.from(this.notifications.values());
    const total = notifications.length;
    const unread = notifications.filter(n => !n.readAt).length;

    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    notifications.forEach(notification => {
      byType[notification.type] = (byType[notification.type] || 0) + 1;
      byPriority[notification.priority] = (byPriority[notification.priority] || 0) + 1;
    });

    return { total, byType, byPriority, unread };
  }
}

// Экспорт глобального экземпляра
export const notificationService = new NotificationService();
