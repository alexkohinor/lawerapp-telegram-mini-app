/**
 * Subscription Manager - управление подписками пользователей
 */

import { prisma } from '../prisma';

export type SubscriptionPlan = 'free' | 'premium' | 'business' | 'enterprise';

export interface SubscriptionFeatures {
  maxDocuments: number;
  maxConsultations: number;
  maxDisputes: number;
  prioritySupport: boolean;
  advancedAnalytics: boolean;
  customTemplates: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
}

export interface SubscriptionInfo {
  plan: SubscriptionPlan;
  features: SubscriptionFeatures;
  expiresAt?: Date;
  isActive: boolean;
  autoRenew: boolean;
  pricePerMonth?: number;
  currency?: string;
}

export interface UserSubscription {
  userId: string;
  plan: SubscriptionPlan;
  features: SubscriptionFeatures;
  expiresAt?: Date;
  isActive: boolean;
  autoRenew: boolean;
  pricePerMonth?: number;
  currency?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SubscriptionManager {
  private readonly subscriptionPlans: Record<SubscriptionPlan, SubscriptionFeatures> = {
    free: {
      maxDocuments: 1,
      maxConsultations: 5,
      maxDisputes: 1,
      prioritySupport: false,
      advancedAnalytics: false,
      customTemplates: false,
      apiAccess: false,
      whiteLabel: false
    },
    premium: {
      maxDocuments: 50,
      maxConsultations: 100,
      maxDisputes: 10,
      prioritySupport: true,
      advancedAnalytics: true,
      customTemplates: true,
      apiAccess: false,
      whiteLabel: false
    },
    business: {
      maxDocuments: 200,
      maxConsultations: 500,
      maxDisputes: 50,
      prioritySupport: true,
      advancedAnalytics: true,
      customTemplates: true,
      apiAccess: true,
      whiteLabel: false
    },
    enterprise: {
      maxDocuments: -1, // unlimited
      maxConsultations: -1, // unlimited
      maxDisputes: -1, // unlimited
      prioritySupport: true,
      advancedAnalytics: true,
      customTemplates: true,
      apiAccess: true,
      whiteLabel: true
    }
  };

  private readonly planPricing: Record<SubscriptionPlan, { price: number; currency: string }> = {
    free: { price: 0, currency: 'RUB' },
    premium: { price: 990, currency: 'RUB' },
    business: { price: 2990, currency: 'RUB' },
    enterprise: { price: 9990, currency: 'RUB' }
  };

  /**
   * Получение информации о плане подписки
   */
  getSubscriptionInfo(plan: SubscriptionPlan): SubscriptionInfo {
    const features = this.subscriptionPlans[plan];
    const pricing = this.planPricing[plan];

    return {
      plan,
      features,
      isActive: plan !== 'free',
      autoRenew: plan !== 'free',
      pricePerMonth: pricing.price,
      currency: pricing.currency
    };
  }

  /**
   * Получение всех доступных планов
   */
  getAllPlans(): Record<SubscriptionPlan, SubscriptionInfo> {
    const plans = {} as Record<SubscriptionPlan, SubscriptionInfo>;
    
    for (const plan of Object.keys(this.subscriptionPlans) as SubscriptionPlan[]) {
      plans[plan] = this.getSubscriptionInfo(plan);
    }

    return plans;
  }

  /**
   * Получение подписки пользователя
   */
  async getUserSubscription(userId: string): Promise<UserSubscription> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          subscriptionPlan: true,
          subscriptionExpiresAt: true
        }
      });

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      const plan = user.subscriptionPlan as SubscriptionPlan;
      const features = this.subscriptionPlans[plan];
      const pricing = this.planPricing[plan];

      // Проверяем, не истекла ли подписка
      const isActive = plan === 'free' || 
        (user.subscriptionExpiresAt && user.subscriptionExpiresAt > new Date());

      return {
        userId,
        plan,
        features,
        expiresAt: user.subscriptionExpiresAt,
        isActive,
        autoRenew: plan !== 'free',
        pricePerMonth: pricing.price,
        currency: pricing.currency,
        createdAt: new Date(), // В реальном приложении из БД
        updatedAt: new Date()
      };

    } catch (error) {
      console.error('Get User Subscription Error:', error);
      throw new Error(`Ошибка получения подписки: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Обновление плана подписки пользователя
   */
  async updateUserSubscription(
    userId: string,
    newPlan: SubscriptionPlan,
    expiresAt?: Date
  ): Promise<UserSubscription> {
    try {
      const features = this.subscriptionPlans[newPlan];
      const pricing = this.planPricing[newPlan];

      // Вычисляем дату истечения для платных планов
      let subscriptionExpiresAt = expiresAt;
      if (newPlan !== 'free' && !subscriptionExpiresAt) {
        subscriptionExpiresAt = new Date();
        subscriptionExpiresAt.setMonth(subscriptionExpiresAt.getMonth() + 1);
      }

      // Обновляем пользователя
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionPlan: newPlan,
          subscriptionExpiresAt
        }
      });

      return {
        userId,
        plan: newPlan,
        features,
        expiresAt: subscriptionExpiresAt,
        isActive: newPlan === 'free' || (subscriptionExpiresAt && subscriptionExpiresAt > new Date()),
        autoRenew: newPlan !== 'free',
        pricePerMonth: pricing.price,
        currency: pricing.currency,
        createdAt: new Date(),
        updatedAt: new Date()
      };

    } catch (error) {
      console.error('Update User Subscription Error:', error);
      throw new Error(`Ошибка обновления подписки: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Проверка лимитов пользователя
   */
  async checkUserLimits(userId: string): Promise<{
    documents: { used: number; limit: number; canUse: boolean };
    consultations: { used: number; limit: number; canUse: boolean };
    disputes: { used: number; limit: number; canUse: boolean };
    plan: SubscriptionPlan;
    isActive: boolean;
  }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
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

      const documentsUsed = user.documentsUsed;
      const consultationsUsed = user._count.consultations;
      const disputesUsed = user._count.disputes;

      const documentsLimit = subscription.features.maxDocuments === -1 ? 999999 : subscription.features.maxDocuments;
      const consultationsLimit = subscription.features.maxConsultations === -1 ? 999999 : subscription.features.maxConsultations;
      const disputesLimit = subscription.features.maxDisputes === -1 ? 999999 : subscription.features.maxDisputes;

      return {
        documents: {
          used: documentsUsed,
          limit: documentsLimit,
          canUse: documentsUsed < documentsLimit
        },
        consultations: {
          used: consultationsUsed,
          limit: consultationsLimit,
          canUse: consultationsUsed < consultationsLimit
        },
        disputes: {
          used: disputesUsed,
          limit: disputesLimit,
          canUse: disputesUsed < disputesLimit
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
   * Проверка возможности использования функции
   */
  async canUseFeature(userId: string, feature: keyof SubscriptionFeatures): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      return subscription.features[feature] && subscription.isActive;
    } catch (error) {
      console.error('Check Feature Access Error:', error);
      return false;
    }
  }

  /**
   * Получение статистики подписок
   */
  async getSubscriptionStats(): Promise<{
    totalUsers: number;
    freeUsers: number;
    premiumUsers: number;
    businessUsers: number;
    enterpriseUsers: number;
    activeSubscriptions: number;
    expiredSubscriptions: number;
    monthlyRevenue: number;
  }> {
    try {
      const now = new Date();
      
      const [
        totalUsers,
        freeUsers,
        premiumUsers,
        businessUsers,
        enterpriseUsers,
        activeSubscriptions,
        expiredSubscriptions
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { subscriptionPlan: 'free' } }),
        prisma.user.count({ where: { subscriptionPlan: 'premium' } }),
        prisma.user.count({ where: { subscriptionPlan: 'business' } }),
        prisma.user.count({ where: { subscriptionPlan: 'enterprise' } }),
        prisma.user.count({
          where: {
            subscriptionPlan: { not: 'free' },
            subscriptionExpiresAt: { gt: now }
          }
        }),
        prisma.user.count({
          where: {
            subscriptionPlan: { not: 'free' },
            subscriptionExpiresAt: { lte: now }
          }
        })
      ]);

      // Вычисляем месячный доход
      const monthlyRevenue = 
        premiumUsers * this.planPricing.premium.price +
        businessUsers * this.planPricing.business.price +
        enterpriseUsers * this.planPricing.enterprise.price;

      return {
        totalUsers,
        freeUsers,
        premiumUsers,
        businessUsers,
        enterpriseUsers,
        activeSubscriptions,
        expiredSubscriptions,
        monthlyRevenue
      };

    } catch (error) {
      console.error('Get Subscription Stats Error:', error);
      throw new Error(`Ошибка получения статистики подписок: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Продление подписки
   */
  async renewSubscription(userId: string, months: number = 1): Promise<UserSubscription> {
    try {
      const currentSubscription = await this.getUserSubscription(userId);
      
      if (currentSubscription.plan === 'free') {
        throw new Error('Нельзя продлить бесплатную подписку');
      }

      const newExpiresAt = new Date();
      newExpiresAt.setMonth(newExpiresAt.getMonth() + months);

      return await this.updateUserSubscription(userId, currentSubscription.plan, newExpiresAt);

    } catch (error) {
      console.error('Renew Subscription Error:', error);
      throw new Error(`Ошибка продления подписки: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Отмена подписки
   */
  async cancelSubscription(userId: string): Promise<UserSubscription> {
    try {
      return await this.updateUserSubscription(userId, 'free');

    } catch (error) {
      console.error('Cancel Subscription Error:', error);
      throw new Error(`Ошибка отмены подписки: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Проверка истечения подписок
   */
  async checkExpiredSubscriptions(): Promise<number> {
    try {
      const now = new Date();
      
      const result = await prisma.user.updateMany({
        where: {
          subscriptionPlan: { not: 'free' },
          subscriptionExpiresAt: { lte: now }
        },
        data: {
          subscriptionPlan: 'free',
          subscriptionExpiresAt: null
        }
      });

      return result.count;
    } catch (error) {
      console.error('Check Expired Subscriptions Error:', error);
      return 0;
    }
  }
}

export default SubscriptionManager;
