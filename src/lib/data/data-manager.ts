/**
 * Data Manager - главный сервис управления данными
 * Объединяет все компоненты Data Persistence Layer
 */

import { ConsultationManager } from './consultation-manager';
import { DocumentManager } from './document-manager';
import { DisputeManager } from './dispute-manager';
import { PaymentManager } from './payment-manager';
import { NotificationManager } from './notification-manager';
import { AnalyticsManager } from './analytics-manager';

export interface DataManagerConfig {
  enableAnalytics?: boolean;
  enableNotifications?: boolean;
  enableCaching?: boolean;
  cacheTimeout?: number;
}

export interface SystemOverview {
  users: {
    total: number;
    active: number;
    new: number;
  };
  consultations: {
    total: number;
    pending: number;
    completed: number;
  };
  documents: {
    total: number;
    processed: number;
    pending: number;
  };
  disputes: {
    total: number;
    open: number;
    resolved: number;
  };
  payments: {
    total: number;
    completed: number;
    pending: number;
    revenue: number;
  };
  notifications: {
    total: number;
    unread: number;
  };
}

export class DataManager {
  public consultations: ConsultationManager;
  public documents: DocumentManager;
  public disputes: DisputeManager;
  public payments: PaymentManager;
  public notifications: NotificationManager;
  public analytics: AnalyticsManager;

  private config: DataManagerConfig;

  constructor(config: DataManagerConfig = {}) {
    this.config = {
      enableAnalytics: true,
      enableNotifications: true,
      enableCaching: false,
      cacheTimeout: 300000, // 5 минут
      ...config
    };

    // Инициализация всех менеджеров
    this.consultations = new ConsultationManager();
    this.documents = new DocumentManager();
    this.disputes = new DisputeManager();
    this.payments = new PaymentManager();
    this.notifications = new NotificationManager();
    this.analytics = new AnalyticsManager();
  }

  /**
   * Получение общего обзора системы
   */
  async getSystemOverview(): Promise<SystemOverview> {
    try {
      const [
        userStats,
        consultationStats,
        documentStats,
        disputeStats,
        paymentStats,
        notificationStats
      ] = await Promise.all([
        this.getUserStats(),
        this.consultations.getConsultationStats(),
        this.documents.getDocumentStats(),
        this.disputes.getDisputeStats(),
        this.payments.getPaymentStats(),
        this.notifications.getNotificationStats()
      ]);

      return {
        users: {
          total: userStats.total,
          active: userStats.active,
          new: userStats.new
        },
        consultations: {
          total: consultationStats.total,
          pending: consultationStats.byStatus.pending || 0,
          completed: consultationStats.byStatus.completed || 0
        },
        documents: {
          total: documentStats.total,
          processed: documentStats.byStatus.processed || 0,
          pending: documentStats.byStatus.processing || 0
        },
        disputes: {
          total: disputeStats.total,
          open: disputeStats.byStatus.open || 0,
          resolved: disputeStats.byStatus.resolved || 0
        },
        payments: {
          total: paymentStats.total,
          completed: paymentStats.byStatus.completed || 0,
          pending: paymentStats.byStatus.pending || 0,
          revenue: paymentStats.totalAmount
        },
        notifications: {
          total: notificationStats.total,
          unread: notificationStats.unread
        }
      };

    } catch (error) {
      console.error('Get System Overview Error:', error);
      throw new Error(`Ошибка получения обзора системы: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение статистики пользователей
   */
  private async getUserStats(): Promise<{
    total: number;
    active: number;
    new: number;
  }> {
    try {
      const { prisma } = await import('../prisma');
      
      const [
        total,
        active,
        newUsers
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            lastLoginAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      return { total, active, new: newUsers };
    } catch (error) {
      console.error('Get User Stats Error:', error);
      return { total: 0, active: 0, new: 0 };
    }
  }

  /**
   * Создание консультации с уведомлением
   */
  async createConsultationWithNotification(
    userId: string,
    question: string,
    legalArea?: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ) {
    try {
      // Создаем консультацию
      const consultation = await this.consultations.createConsultation({
        userId,
        question,
        legalArea,
        status: 'pending',
        priority,
        source: 'manual'
      });

      // Создаем уведомление
      if (this.config.enableNotifications) {
        await this.notifications.createConsultationNotification(
          userId,
          consultation.id,
          'processing',
          question
        );
      }

      return consultation;
    } catch (error) {
      console.error('Create Consultation with Notification Error:', error);
      throw new Error(`Ошибка создания консультации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Создание документа с уведомлением
   */
  async createDocumentWithNotification(
    userId: string,
    documentData: {
      title: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      documentType?: 'contract' | 'agreement' | 'claim' | 'lawsuit' | 'other';
      legalArea?: string;
    }
  ) {
    try {
      // Создаем документ
      const document = await this.documents.createDocument({
        userId,
        title: documentData.title,
        fileName: documentData.fileName,
        fileSize: documentData.fileSize,
        mimeType: documentData.mimeType,
        documentType: documentData.documentType,
        legalArea: documentData.legalArea,
        status: 'uploaded'
      });

      // Создаем уведомление
      if (this.config.enableNotifications) {
        await this.notifications.createDocumentNotification(
          userId,
          document.id,
          'uploaded',
          documentData.fileName
        );
      }

      return document;
    } catch (error) {
      console.error('Create Document with Notification Error:', error);
      throw new Error(`Ошибка создания документа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Создание спора с уведомлением
   */
  async createDisputeWithNotification(
    userId: string,
    disputeData: {
      title: string;
      description: string;
      legalArea?: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      disputeType?: 'consumer' | 'labor' | 'civil' | 'criminal' | 'administrative' | 'other';
    }
  ) {
    try {
      // Создаем спор
      const dispute = await this.disputes.createDispute({
        userId,
        title: disputeData.title,
        description: disputeData.description,
        legalArea: disputeData.legalArea,
        status: 'open',
        priority: disputeData.priority,
        disputeType: disputeData.disputeType
      });

      // Создаем уведомление
      if (this.config.enableNotifications) {
        await this.notifications.createDisputeNotification(
          userId,
          dispute.id,
          'created',
          disputeData.title
        );
      }

      return dispute;
    } catch (error) {
      console.error('Create Dispute with Notification Error:', error);
      throw new Error(`Ошибка создания спора: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Создание платежа с уведомлением
   */
  async createPaymentWithNotification(
    userId: string,
    paymentData: {
      amount: number;
      currency: string;
      description: string;
      paymentMethod: 'yookassa' | 'yoomoney' | 'qiwi' | 'sbp' | 'card' | 'other';
      paymentType: 'subscription' | 'consultation' | 'document_processing' | 'dispute_handling' | 'other';
      subscriptionPlan?: string;
    }
  ) {
    try {
      // Создаем платеж
      const payment = await this.payments.createPayment({
        userId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
        paymentMethod: paymentData.paymentMethod,
        status: 'pending',
        paymentType: paymentData.paymentType,
        subscriptionPlan: paymentData.subscriptionPlan
      });

      // Создаем уведомление
      if (this.config.enableNotifications) {
        await this.notifications.createPaymentNotification(
          userId,
          payment.id,
          'pending',
          paymentData.amount,
          paymentData.currency
        );
      }

      return payment;
    } catch (error) {
      console.error('Create Payment with Notification Error:', error);
      throw new Error(`Ошибка создания платежа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение аналитики системы
   */
  async getSystemAnalytics(period: {
    startDate: Date;
    endDate: Date;
    groupBy: 'day' | 'week' | 'month' | 'year';
  }) {
    if (!this.config.enableAnalytics) {
      throw new Error('Аналитика отключена в конфигурации');
    }

    try {
      return await this.analytics.getAnalyticsDashboard(period);
    } catch (error) {
      console.error('Get System Analytics Error:', error);
      throw new Error(`Ошибка получения аналитики: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Очистка истекших данных
   */
  async cleanupExpiredData(): Promise<{
    notifications: number;
    sessions: number;
    subscriptions: number;
  }> {
    try {
      const [
        expiredNotifications,
        expiredSessions,
        expiredSubscriptions
      ] = await Promise.all([
        this.notifications.cleanupExpiredNotifications(),
        this.cleanupExpiredSessions(),
        this.cleanupExpiredSubscriptions()
      ]);

      return {
        notifications: expiredNotifications,
        sessions: expiredSessions,
        subscriptions: expiredSubscriptions
      };
    } catch (error) {
      console.error('Cleanup Expired Data Error:', error);
      throw new Error(`Ошибка очистки данных: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Очистка истекших сессий
   */
  private async cleanupExpiredSessions(): Promise<number> {
    try {
      const { prisma } = await import('../prisma');
      
      const result = await prisma.session.updateMany({
        where: {
          expiresAt: {
            lte: new Date()
          }
        },
        data: {
          expiresAt: new Date(0)
        }
      });

      return result.count;
    } catch (error) {
      console.error('Cleanup Expired Sessions Error:', error);
      return 0;
    }
  }

  /**
   * Очистка истекших подписок
   */
  private async cleanupExpiredSubscriptions(): Promise<number> {
    try {
      const { prisma } = await import('../prisma');
      
      const result = await prisma.user.updateMany({
        where: {
          subscriptionPlan: { not: 'free' },
          subscriptionExpiresAt: { lte: new Date() }
        },
        data: {
          subscriptionPlan: 'free',
          subscriptionExpiresAt: null
        }
      });

      return result.count;
    } catch (error) {
      console.error('Cleanup Expired Subscriptions Error:', error);
      return 0;
    }
  }

  /**
   * Получение статистики по пользователю
   */
  async getUserDataSummary(userId: string): Promise<{
    consultations: number;
    documents: number;
    disputes: number;
    payments: number;
    notifications: number;
    subscription: string;
    lastActivity: Date | null;
  }> {
    try {
      const [
        consultationStats,
        documentStats,
        disputeStats,
        paymentStats,
        notificationStats,
        userData
      ] = await Promise.all([
        this.consultations.getConsultationStats({ userId }),
        this.documents.getDocumentStats({ userId }),
        this.disputes.getDisputeStats({ userId }),
        this.payments.getPaymentStats({ userId }),
        this.notifications.getNotificationStats({ userId }),
        this.getUserData(userId)
      ]);

      return {
        consultations: consultationStats.total,
        documents: documentStats.total,
        disputes: disputeStats.total,
        payments: paymentStats.total,
        notifications: notificationStats.total,
        subscription: userData.subscriptionPlan,
        lastActivity: userData.lastLoginAt
      };
    } catch (error) {
      console.error('Get User Data Summary Error:', error);
      throw new Error(`Ошибка получения данных пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение данных пользователя
   */
  private async getUserData(userId: string): Promise<{
    subscriptionPlan: string;
    lastLoginAt: Date | null;
  }> {
    try {
      const { prisma } = await import('../prisma');
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          subscriptionPlan: true,
          lastLoginAt: true
        }
      });

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      return {
        subscriptionPlan: user.subscriptionPlan,
        lastLoginAt: user.lastLoginAt
      };
    } catch (error) {
      console.error('Get User Data Error:', error);
      throw new Error(`Ошибка получения данных пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Поиск по всем типам данных
   */
  async searchAll(
    query: string,
    userId?: string,
    limit: number = 20
  ): Promise<{
    consultations: unknown[];
    documents: unknown[];
    disputes: unknown[];
    payments: unknown[];
  }> {
    try {
      const [
        consultations,
        documents,
        disputes,
        payments
      ] = await Promise.all([
        this.consultations.searchConsultations(query, userId, limit),
        this.documents.searchDocuments(query, userId, limit),
        this.disputes.searchDisputes(query, userId, limit),
        this.payments.searchPayments(query, userId, limit)
      ]);

      return {
        consultations,
        documents,
        disputes,
        payments
      };
    } catch (error) {
      console.error('Search All Error:', error);
      throw new Error(`Ошибка поиска: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение конфигурации
   */
  getConfig(): DataManagerConfig {
    return { ...this.config };
  }

  /**
   * Обновление конфигурации
   */
  updateConfig(newConfig: Partial<DataManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export default DataManager;
