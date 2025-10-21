/**
 * Usage Limits Manager - контроль лимитов использования
 */

import { prisma } from '../prisma';
import { SubscriptionManager, SubscriptionPlan } from './subscription-manager';

export interface UsageLimit {
  type: 'documents' | 'consultations' | 'disputes' | 'api_calls';
  used: number;
  limit: number;
  canUse: boolean;
  resetDate?: Date;
  period: 'daily' | 'monthly' | 'total';
}

export interface UsageStats {
  documents: UsageLimit;
  consultations: UsageLimit;
  disputes: UsageLimit;
  apiCalls: UsageLimit;
  plan: SubscriptionPlan;
  isActive: boolean;
  nextResetDate?: Date;
}

export interface UsageEvent {
  userId: string;
  type: 'document_upload' | 'consultation' | 'dispute_creation' | 'api_call';
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export class UsageLimitsManager {
  private subscriptionManager: SubscriptionManager;

  constructor() {
    this.subscriptionManager = new SubscriptionManager();
  }

  /**
   * Проверка лимитов пользователя
   */
  async checkUserLimits(userId: string): Promise<UsageStats> {
    try {
      const subscription = await this.subscriptionManager.getUserSubscription(userId);
      
      // Получаем статистику использования
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          documentsUsed: true,
          _count: {
            select: {
              consultations: true,
              disputes: true
            }
          }
        }
      });

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      // Вычисляем лимиты на основе плана подписки
      const documentsLimit = subscription.features.maxDocuments === -1 ? 999999 : subscription.features.maxDocuments;
      const consultationsLimit = subscription.features.maxConsultations === -1 ? 999999 : subscription.features.maxConsultations;
      const disputesLimit = subscription.features.maxDisputes === -1 ? 999999 : subscription.features.maxDisputes;

      // Для демо API calls лимит
      const apiCallsLimit = subscription.plan === 'free' ? 100 : 10000;

      return {
        documents: {
          type: 'documents',
          used: user.documentsUsed,
          limit: documentsLimit,
          canUse: user.documentsUsed < documentsLimit,
          period: 'total'
        },
        consultations: {
          type: 'consultations',
          used: user._count.consultations,
          limit: consultationsLimit,
          canUse: user._count.consultations < consultationsLimit,
          period: 'total'
        },
        disputes: {
          type: 'disputes',
          used: user._count.disputes,
          limit: disputesLimit,
          canUse: user._count.disputes < disputesLimit,
          period: 'total'
        },
        apiCalls: {
          type: 'api_calls',
          used: 0, // В реальном приложении из отдельной таблицы
          limit: apiCallsLimit,
          canUse: true,
          period: 'monthly'
        },
        plan: subscription.plan,
        isActive: subscription.isActive
      };

    } catch (error) {
      console.error('Check User Limits Error:', error);
      throw new Error(`Ошибка проверки лимитов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Проверка возможности использования ресурса
   */
  async canUseResource(
    userId: string, 
    resourceType: 'documents' | 'consultations' | 'disputes' | 'api_calls'
  ): Promise<boolean> {
    try {
      const limits = await this.checkUserLimits(userId);
      
      switch (resourceType) {
        case 'documents':
          return limits.documents.canUse;
        case 'consultations':
          return limits.consultations.canUse;
        case 'disputes':
          return limits.disputes.canUse;
        case 'api_calls':
          return limits.apiCalls.canUse;
        default:
          return false;
      }
    } catch (error) {
      console.error('Can Use Resource Error:', error);
      return false;
    }
  }

  /**
   * Увеличение счетчика использования
   */
  async incrementUsage(
    userId: string,
    resourceType: 'documents' | 'consultations' | 'disputes',
    amount: number = 1
  ): Promise<void> {
    try {
      switch (resourceType) {
        case 'documents':
          await prisma.user.update({
            where: { id: userId },
            data: {
              documentsUsed: {
                increment: amount
              }
            }
          });
          break;
        case 'consultations':
          // В реальном приложении здесь был бы отдельный счетчик
          // Для демо используем существующую логику
          break;
        case 'disputes':
          // В реальном приложении здесь был бы отдельный счетчик
          // Для демо используем существующую логику
          break;
      }
    } catch (error) {
      console.error('Increment Usage Error:', error);
      throw new Error(`Ошибка увеличения счетчика: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Сброс счетчиков использования (для админов)
   */
  async resetUserUsage(userId: string, resourceType?: 'documents' | 'consultations' | 'disputes'): Promise<void> {
    try {
      if (resourceType === 'documents' || !resourceType) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            documentsUsed: 0
          }
        });
      }

      // В реальном приложении здесь был бы сброс других счетчиков
    } catch (error) {
      console.error('Reset User Usage Error:', error);
      throw new Error(`Ошибка сброса счетчиков: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение истории использования
   */
  async getUsageHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<UsageEvent[]> {
    try {
      // В реальном приложении здесь была бы отдельная таблица для истории использования
      // Для демо возвращаем пустой массив
      return [];
    } catch (error) {
      console.error('Get Usage History Error:', error);
      throw new Error(`Ошибка получения истории: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Запись события использования
   */
  async recordUsageEvent(event: UsageEvent): Promise<void> {
    try {
      // В реальном приложении здесь была бы запись в таблицу usage_events
      console.log('Usage Event:', event);
    } catch (error) {
      console.error('Record Usage Event Error:', error);
      throw new Error(`Ошибка записи события: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение статистики использования по всем пользователям
   */
  async getGlobalUsageStats(): Promise<{
    totalDocuments: number;
    totalConsultations: number;
    totalDisputes: number;
    averageUsagePerUser: number;
    topUsers: Array<{
      userId: string;
      documentsUsed: number;
      consultationsCount: number;
      disputesCount: number;
    }>;
  }> {
    try {
      const [
        totalDocuments,
        totalConsultations,
        totalDisputes,
        totalUsers,
        topUsers
      ] = await Promise.all([
        prisma.user.aggregate({
          _sum: { documentsUsed: true }
        }),
        prisma.consultation.count(),
        prisma.dispute.count(),
        prisma.user.count(),
        prisma.user.findMany({
          select: {
            id: true,
            documentsUsed: true,
            _count: {
              select: {
                consultations: true,
                disputes: true
              }
            }
          },
          orderBy: { documentsUsed: 'desc' },
          take: 10
        })
      ]);

      const averageUsagePerUser = totalUsers > 0 ? 
        (totalDocuments._sum.documentsUsed || 0) / totalUsers : 0;

      return {
        totalDocuments: totalDocuments._sum.documentsUsed || 0,
        totalConsultations,
        totalDisputes,
        averageUsagePerUser,
        topUsers: topUsers.map(user => ({
          userId: user.id,
          documentsUsed: user.documentsUsed,
          consultationsCount: user._count.consultations,
          disputesCount: user._count.disputes
        }))
      };

    } catch (error) {
      console.error('Get Global Usage Stats Error:', error);
      throw new Error(`Ошибка получения глобальной статистики: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Проверка превышения лимитов
   */
  async checkLimitViolations(): Promise<Array<{
    userId: string;
    violations: string[];
    plan: SubscriptionPlan;
  }>> {
    try {
      const violations: Array<{
        userId: string;
        violations: string[];
        plan: SubscriptionPlan;
      }> = [];

      // Получаем всех пользователей с их статистикой
      const users = await prisma.user.findMany({
        select: {
          id: true,
          subscriptionPlan: true,
          documentsUsed: true,
          _count: {
            select: {
              consultations: true,
              disputes: true
            }
          }
        }
      });

      for (const user of users) {
        const plan = user.subscriptionPlan as SubscriptionPlan;
        const subscription = await this.subscriptionManager.getUserSubscription(user.id);
        const userViolations: string[] = [];

        // Проверяем лимиты документов
        if (subscription.features.maxDocuments !== -1 && 
            user.documentsUsed >= subscription.features.maxDocuments) {
          userViolations.push('documents');
        }

        // Проверяем лимиты консультаций
        if (subscription.features.maxConsultations !== -1 && 
            user._count.consultations >= subscription.features.maxConsultations) {
          userViolations.push('consultations');
        }

        // Проверяем лимиты споров
        if (subscription.features.maxDisputes !== -1 && 
            user._count.disputes >= subscription.features.maxDisputes) {
          userViolations.push('disputes');
        }

        if (userViolations.length > 0) {
          violations.push({
            userId: user.id,
            violations: userViolations,
            plan
          });
        }
      }

      return violations;

    } catch (error) {
      console.error('Check Limit Violations Error:', error);
      throw new Error(`Ошибка проверки нарушений: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение рекомендаций по обновлению плана
   */
  async getUpgradeRecommendations(userId: string): Promise<{
    currentPlan: SubscriptionPlan;
    recommendedPlan: SubscriptionPlan;
    reasons: string[];
    savings: number;
  }> {
    try {
      const limits = await this.checkUserLimits(userId);
      const currentPlan = limits.plan;
      
      let recommendedPlan: SubscriptionPlan = currentPlan;
      const reasons: string[] = [];
      let savings = 0;

      // Анализируем использование и даем рекомендации
      if (currentPlan === 'free') {
        if (limits.documents.used >= limits.documents.limit * 0.8) {
          recommendedPlan = 'premium';
          reasons.push('Превышение лимита документов');
        }
        if (limits.consultations.used >= limits.consultations.limit * 0.8) {
          recommendedPlan = 'premium';
          reasons.push('Превышение лимита консультаций');
        }
      } else if (currentPlan === 'premium') {
        if (limits.documents.used >= limits.documents.limit * 0.8) {
          recommendedPlan = 'business';
          reasons.push('Превышение лимита документов');
        }
        if (limits.consultations.used >= limits.consultations.limit * 0.8) {
          recommendedPlan = 'business';
          reasons.push('Превышение лимита консультаций');
        }
      }

      // Вычисляем экономию (упрощенно)
      if (recommendedPlan !== currentPlan) {
        const currentPricing = this.subscriptionManager['planPricing'][currentPlan];
        const recommendedPricing = this.subscriptionManager['planPricing'][recommendedPlan];
        savings = recommendedPricing.price - currentPricing.price;
      }

      return {
        currentPlan,
        recommendedPlan,
        reasons,
        savings
      };

    } catch (error) {
      console.error('Get Upgrade Recommendations Error:', error);
      throw new Error(`Ошибка получения рекомендаций: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }
}

export default UsageLimitsManager;
