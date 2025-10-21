/**
 * Notification Manager - система уведомлений
 */

import { prisma } from '../prisma';

export interface NotificationData {
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'payment' | 'consultation' | 'dispute' | 'document';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'system' | 'payment' | 'consultation' | 'dispute' | 'document' | 'subscription' | 'other';
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, unknown>;
  expiresAt?: Date;
}

export interface NotificationResult {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

export interface NotificationFilters {
  userId?: string;
  type?: string;
  priority?: string;
  category?: string;
  isRead?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
  readRate: number;
}

export class NotificationManager {
  /**
   * Создание уведомления
   */
  async createNotification(data: NotificationData): Promise<NotificationResult> {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          isRead: data.isRead,
        }
      });

      return {
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        readAt: notification.readAt || undefined
      };

    } catch (error) {
      console.error('Create Notification Error:', error);
      throw new Error(`Ошибка создания уведомления: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение уведомления по ID
   */
  async getNotificationById(id: string): Promise<NotificationResult | null> {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id }
      });

      if (!notification) {
        return null;
      }

      return {
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        readAt: notification.readAt || undefined
      };

    } catch (error) {
      console.error('Get Notification Error:', error);
      throw new Error(`Ошибка получения уведомления: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение уведомлений с фильтрацией
   */
  async getNotifications(filters: NotificationFilters = {}): Promise<NotificationResult[]> {
    try {
      const where: Record<string, unknown> = {};

      if (filters.userId) where.userId = filters.userId;
      if (filters.type) where.type = filters.type;
      if (filters.priority) where.priority = filters.priority;
      if (filters.category) where.category = filters.category;
      if (filters.isRead !== undefined) where.isRead = filters.isRead;
      
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) (where.createdAt as Record<string, unknown>).gte = filters.dateFrom;
        if (filters.dateTo) (where.createdAt as Record<string, unknown>).lte = filters.dateTo;
      }

      // Исключаем истекшие уведомления
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ];

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: [
          { createdAt: 'desc' }
        ],
        take: filters.limit || 50,
        skip: filters.offset || 0
      });

      return notifications.map(notification => ({
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        readAt: notification.readAt || undefined
      }));

    } catch (error) {
      console.error('Get Notifications Error:', error);
      throw new Error(`Ошибка получения уведомлений: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Обновление уведомления
   */
  async updateNotification(
    id: string,
    updates: Partial<NotificationData>
  ): Promise<NotificationResult> {
    try {
      const notification = await prisma.notification.update({
        where: { id },
        data: {
          ...updates,
          readAt: updates.isRead && !updates.isRead ? new Date() : undefined
        }
      });

      return {
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        readAt: notification.readAt || undefined
      };

    } catch (error) {
      console.error('Update Notification Error:', error);
      throw new Error(`Ошибка обновления уведомления: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Отметка уведомления как прочитанного
   */
  async markAsRead(id: string): Promise<NotificationResult> {
    return this.updateNotification(id, { isRead: true });
  }

  /**
   * Отметка уведомления как непрочитанного
   */
  async markAsUnread(id: string): Promise<NotificationResult> {
    return this.updateNotification(id, { isRead: false });
  }

  /**
   * Отметка всех уведомлений пользователя как прочитанных
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date(),
        }
      });

      return result.count;
    } catch (error) {
      console.error('Mark All as Read Error:', error);
      throw new Error(`Ошибка отметки всех уведомлений: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Удаление уведомления
   */
  async deleteNotification(id: string): Promise<boolean> {
    try {
      await prisma.notification.delete({
        where: { id }
      });

      return true;
    } catch (error) {
      console.error('Delete Notification Error:', error);
      return false;
    }
  }

  /**
   * Получение уведомлений пользователя
   */
  async getUserNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false
  ): Promise<NotificationResult[]> {
    return this.getNotifications({
      userId,
      limit,
      offset,
      isRead: unreadOnly ? false : undefined
    });
  }

  /**
   * Получение непрочитанных уведомлений пользователя
   */
  async getUnreadNotifications(
    userId: string,
    limit: number = 20
  ): Promise<NotificationResult[]> {
    return this.getNotifications({
      userId,
      isRead: false,
      limit
    });
  }

  /**
   * Получение статистики уведомлений
   */
  async getNotificationStats(filters: NotificationFilters = {}): Promise<NotificationStats> {
    try {
      const where: Record<string, unknown> = {};

      if (filters.userId) where.userId = filters.userId;
      if (filters.category) where.category = filters.category;
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) (where.createdAt as Record<string, unknown>).gte = filters.dateFrom;
        if (filters.dateTo) (where.createdAt as Record<string, unknown>).lte = filters.dateTo;
      }

      // Исключаем истекшие уведомления
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ];

      const [
        total,
        unread,
        byType,
        byPriority,
        byCategory
      ] = await Promise.all([
        prisma.notification.count({ where }),
        prisma.notification.count({
          where: { ...where, isRead: false }
        }),
        prisma.notification.groupBy({
          by: ['type'],
          where,
          _count: { type: true }
        }),
        Promise.resolve([]),
        Promise.resolve([])
      ]);

      const byTypeMap: Record<string, number> = {};
      byType.forEach(item => {
        byTypeMap[item.type || 'unknown'] = item._count.type;
      });

      const byPriorityMap: Record<string, number> = {};
      const byCategoryMap: Record<string, number> = {};

      return {
        total,
        unread,
        byType: byTypeMap,
        byPriority: byPriorityMap,
        byCategory: byCategoryMap,
        readRate: total > 0 ? ((total - unread) / total) * 100 : 0
      };

    } catch (error) {
      console.error('Get Notification Stats Error:', error);
      throw new Error(`Ошибка получения статистики: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Очистка истекших уведомлений
   */
  async cleanupExpiredNotifications(): Promise<number> {
    try {
      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 дней назад
          }
        }
      });

      return result.count;
    } catch (error) {
      console.error('Cleanup Expired Notifications Error:', error);
      return 0;
    }
  }

  /**
   * Создание уведомления о платеже
   */
  async createPaymentNotification(
    userId: string,
    paymentId: string,
    status: 'completed' | 'failed' | 'pending',
    amount: number,
    currency: string
  ): Promise<NotificationResult> {
    const messages = {
      completed: `Платеж на сумму ${amount} ${currency} успешно обработан`,
      failed: `Платеж на сумму ${amount} ${currency} не прошел`,
      pending: `Платеж на сумму ${amount} ${currency} обрабатывается`
    };

    const types = {
      completed: 'success' as const,
      failed: 'error' as const,
      pending: 'info' as const
    };

    return this.createNotification({
      userId,
      type: types[status],
      title: 'Уведомление о платеже',
      message: messages[status],
      priority: status === 'failed' ? 'high' : 'medium',
      category: 'payment',
      isRead: false,
      actionUrl: `/payments/${paymentId}`,
      actionText: 'Посмотреть детали',
      metadata: { paymentId, amount, currency, status }
    });
  }

  /**
   * Создание уведомления о консультации
   */
  async createConsultationNotification(
    userId: string,
    consultationId: string,
    status: 'completed' | 'failed' | 'processing',
    question: string
  ): Promise<NotificationResult> {
    const messages = {
      completed: `Консультация по вопросу "${question.substring(0, 50)}..." завершена`,
      failed: `Консультация по вопросу "${question.substring(0, 50)}..." не удалась`,
      processing: `Консультация по вопросу "${question.substring(0, 50)}..." обрабатывается`
    };

    const types = {
      completed: 'success' as const,
      failed: 'error' as const,
      processing: 'info' as const
    };

    return this.createNotification({
      userId,
      type: types[status],
      title: 'Уведомление о консультации',
      message: messages[status],
      priority: status === 'failed' ? 'high' : 'medium',
      category: 'consultation',
      isRead: false,
      actionUrl: `/consultations/${consultationId}`,
      actionText: 'Посмотреть ответ',
      metadata: { consultationId, status }
    });
  }

  /**
   * Создание уведомления о споре
   */
  async createDisputeNotification(
    userId: string,
    disputeId: string,
    status: 'created' | 'updated' | 'resolved' | 'deadline_approaching',
    title: string
  ): Promise<NotificationResult> {
    const messages = {
      created: `Спор "${title}" создан`,
      updated: `Спор "${title}" обновлен`,
      resolved: `Спор "${title}" разрешен`,
      deadline_approaching: `Приближается дедлайн по спору "${title}"`
    };

    const types = {
      created: 'info' as const,
      updated: 'info' as const,
      resolved: 'success' as const,
      deadline_approaching: 'warning' as const
    };

    const priorities = {
      created: 'medium' as const,
      updated: 'medium' as const,
      resolved: 'high' as const,
      deadline_approaching: 'urgent' as const
    };

    return this.createNotification({
      userId,
      type: types[status],
      title: 'Уведомление о споре',
      message: messages[status],
      priority: priorities[status],
      category: 'dispute',
      isRead: false,
      actionUrl: `/disputes/${disputeId}`,
      actionText: 'Посмотреть спор',
      metadata: { disputeId, status }
    });
  }

  /**
   * Создание уведомления о документе
   */
  async createDocumentNotification(
    userId: string,
    documentId: string,
    status: 'uploaded' | 'processed' | 'failed',
    fileName: string
  ): Promise<NotificationResult> {
    const messages = {
      uploaded: `Документ "${fileName}" загружен`,
      processed: `Документ "${fileName}" обработан`,
      failed: `Ошибка обработки документа "${fileName}"`
    };

    const types = {
      uploaded: 'info' as const,
      processed: 'success' as const,
      failed: 'error' as const
    };

    return this.createNotification({
      userId,
      type: types[status],
      title: 'Уведомление о документе',
      message: messages[status],
      priority: status === 'failed' ? 'high' : 'medium',
      category: 'document',
      isRead: false,
      actionUrl: `/documents/${documentId}`,
      actionText: 'Посмотреть документ',
      metadata: { documentId, fileName, status }
    });
  }

  /**
   * Создание системного уведомления
   */
  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    actionUrl?: string,
    actionText?: string
  ): Promise<NotificationResult> {
    return this.createNotification({
      userId,
      type: 'info',
      title,
      message,
      priority,
      category: 'system',
      isRead: false,
      actionUrl,
      actionText,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 дней
    });
  }
}

export default NotificationManager;
