/**
 * User Manager - главный сервис управления пользователями
 * Объединяет аутентификацию, сессии, подписки и лимиты
 */

import { TelegramAuthService, TelegramAuthData, AuthenticatedUser } from './telegram-auth';
import { SessionManager, SessionData } from './session-manager';
import { SubscriptionManager, UserSubscription, SubscriptionPlan } from './subscription-manager';
import { UsageLimitsManager, UsageStats } from './usage-limits-manager';

export interface UserProfile {
  id: string;
  telegramId: bigint;
  telegramUsername?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  subscription: UserSubscription;
  usage: UsageStats;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}

export interface AuthResult {
  user: AuthenticatedUser;
  session: SessionData;
  profile: UserProfile;
}

export interface LoginRequest {
  telegramAuthData: TelegramAuthData;
  userAgent?: string;
  ipAddress?: string;
}

export class UserManager {
  private telegramAuth: TelegramAuthService;
  private sessionManager: SessionManager;
  private subscriptionManager: SubscriptionManager;
  private usageLimitsManager: UsageLimitsManager;

  constructor(botToken: string) {
    this.telegramAuth = new TelegramAuthService(botToken);
    this.sessionManager = new SessionManager();
    this.subscriptionManager = new SubscriptionManager();
    this.usageLimitsManager = new UsageLimitsManager();
  }

  /**
   * Полная аутентификация пользователя
   */
  async authenticateUser(request: LoginRequest): Promise<AuthResult> {
    try {
      // 1. Аутентификация через Telegram
      const user = await this.telegramAuth.authenticateUser(request.telegramAuthData);

      // 2. Создание сессии
      const session = await this.sessionManager.createSession({
        userId: user.id,
        telegramId: user.telegramId,
        userAgent: request.userAgent,
        ipAddress: request.ipAddress
      });

      // 3. Получение полного профиля
      const profile = await this.getUserProfile(user.id);

      return {
        user,
        session,
        profile
      };

    } catch (error) {
      console.error('User Authentication Error:', error);
      throw new Error(`Ошибка аутентификации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Валидация сессии
   */
  async validateSession(sessionToken: string): Promise<AuthResult | null> {
    try {
      // 1. Валидация сессии
      const session = await this.sessionManager.validateSession(sessionToken);
      if (!session) {
        return null;
      }

      // 2. Получение пользователя
      const user = await this.telegramAuth.getUserByTelegramId(Number(session.telegramId));
      if (!user) {
        return null;
      }

      // 3. Получение профиля
      const profile = await this.getUserProfile(user.id);

      return {
        user,
        session,
        profile
      };

    } catch (error) {
      console.error('Session Validation Error:', error);
      return null;
    }
  }

  /**
   * Получение полного профиля пользователя
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      // Получаем данные пользователя
      const user = await this.telegramAuth.getUserByTelegramId(0); // Временное решение
      if (!user || user.id !== userId) {
        throw new Error('Пользователь не найден');
      }

      // Получаем подписку
      const subscription = await this.subscriptionManager.getUserSubscription(userId);

      // Получаем статистику использования
      const usage = await this.usageLimitsManager.checkUserLimits(userId);

      return {
        id: user.id,
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername,
        firstName: user.firstName,
        lastName: user.lastName,
        subscription,
        usage,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      };

    } catch (error) {
      console.error('Get User Profile Error:', error);
      throw new Error(`Ошибка получения профиля: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Обновление профиля пользователя
   */
  async updateUserProfile(
    userId: string,
    updates: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      email?: string;
    }
  ): Promise<UserProfile> {
    try {
      // Обновляем данные пользователя
      await this.telegramAuth.updateUserProfile(userId, updates);

      // Возвращаем обновленный профиль
      return await this.getUserProfile(userId);

    } catch (error) {
      console.error('Update User Profile Error:', error);
      throw new Error(`Ошибка обновления профиля: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Обновление плана подписки
   */
  async updateSubscription(
    userId: string,
    newPlan: SubscriptionPlan,
    expiresAt?: Date
  ): Promise<UserProfile> {
    try {
      // Обновляем подписку
      await this.subscriptionManager.updateUserSubscription(userId, newPlan, expiresAt);

      // Возвращаем обновленный профиль
      return await this.getUserProfile(userId);

    } catch (error) {
      console.error('Update Subscription Error:', error);
      throw new Error(`Ошибка обновления подписки: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Проверка лимитов пользователя
   */
  async checkUserLimits(userId: string): Promise<UsageStats> {
    return this.usageLimitsManager.checkUserLimits(userId);
  }

  /**
   * Проверка возможности использования ресурса
   */
  async canUseResource(
    userId: string,
    resourceType: 'documents' | 'consultations' | 'disputes' | 'api_calls'
  ): Promise<boolean> {
    return this.usageLimitsManager.canUseResource(userId, resourceType);
  }

  /**
   * Увеличение счетчика использования
   */
  async incrementUsage(
    userId: string,
    resourceType: 'documents' | 'consultations' | 'disputes',
    amount: number = 1
  ): Promise<void> {
    await this.usageLimitsManager.incrementUsage(userId, resourceType, amount);
  }

  /**
   * Завершение сессии
   */
  async logout(sessionToken: string): Promise<boolean> {
    return this.sessionManager.terminateSession(sessionToken);
  }

  /**
   * Завершение всех сессий пользователя
   */
  async logoutAllSessions(userId: string): Promise<number> {
    return this.sessionManager.terminateAllUserSessions(userId);
  }

  /**
   * Получение активных сессий пользователя
   */
  async getUserSessions(userId: string): Promise<SessionData[]> {
    return this.sessionManager.getUserActiveSessions(userId);
  }

  /**
   * Получение статистики пользователя
   */
  async getUserStats(userId: string) {
    return this.telegramAuth.getUserStats(userId);
  }

  /**
   * Деактивация пользователя
   */
  async deactivateUser(userId: string): Promise<void> {
    try {
      // Завершаем все сессии
      await this.sessionManager.terminateAllUserSessions(userId);

      // Деактивируем пользователя
      await this.telegramAuth.deactivateUser(userId);

    } catch (error) {
      console.error('Deactivate User Error:', error);
      throw new Error(`Ошибка деактивации пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение всех доступных планов подписки
   */
  getAllSubscriptionPlans() {
    return this.subscriptionManager.getAllPlans();
  }

  /**
   * Получение рекомендаций по обновлению плана
   */
  async getUpgradeRecommendations(userId: string) {
    return this.usageLimitsManager.getUpgradeRecommendations(userId);
  }

  /**
   * Получение статистики системы
   */
  async getSystemStats(): Promise<{
    users: {
      total: number;
      active: number;
      byPlan: Record<SubscriptionPlan, number>;
    };
    sessions: {
      total: number;
      active: number;
      expired: number;
    };
    usage: {
      totalDocuments: number;
      totalConsultations: number;
      totalDisputes: number;
      averageUsagePerUser: number;
    };
    revenue: {
      monthly: number;
      byPlan: Record<SubscriptionPlan, number>;
    };
  }> {
    try {
      const [
        userStats,
        sessionStats,
        usageStats,
        subscriptionStats
      ] = await Promise.all([
        this.telegramAuth.getActiveUsers(1000),
        this.sessionManager.getSessionStats(),
        this.usageLimitsManager.getGlobalUsageStats(),
        this.subscriptionManager.getSubscriptionStats()
      ]);

      const usersByPlan: Record<SubscriptionPlan, number> = {
        free: subscriptionStats.freeUsers,
        premium: subscriptionStats.premiumUsers,
        business: subscriptionStats.businessUsers,
        enterprise: subscriptionStats.enterpriseUsers
      };

      const revenueByPlan: Record<SubscriptionPlan, number> = {
        free: 0,
        premium: subscriptionStats.premiumUsers * 990,
        business: subscriptionStats.businessUsers * 2990,
        enterprise: subscriptionStats.enterpriseUsers * 9990
      };

      return {
        users: {
          total: subscriptionStats.totalUsers,
          active: userStats.length,
          byPlan: usersByPlan
        },
        sessions: {
          total: sessionStats.totalSessions,
          active: sessionStats.activeSessions,
          expired: sessionStats.expiredSessions
        },
        usage: {
          totalDocuments: usageStats.totalDocuments,
          totalConsultations: usageStats.totalConsultations,
          totalDisputes: usageStats.totalDisputes,
          averageUsagePerUser: usageStats.averageUsagePerUser
        },
        revenue: {
          monthly: subscriptionStats.monthlyRevenue,
          byPlan: revenueByPlan
        }
      };

    } catch (error) {
      console.error('Get System Stats Error:', error);
      throw new Error(`Ошибка получения статистики системы: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Очистка истекших данных
   */
  async cleanupExpiredData(): Promise<{
    expiredSessions: number;
    expiredSubscriptions: number;
  }> {
    try {
      const [expiredSessions, expiredSubscriptions] = await Promise.all([
        this.sessionManager.cleanupExpiredSessions(),
        this.subscriptionManager.checkExpiredSubscriptions()
      ]);

      return {
        expiredSessions,
        expiredSubscriptions
      };

    } catch (error) {
      console.error('Cleanup Expired Data Error:', error);
      throw new Error(`Ошибка очистки данных: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }
}

export default UserManager;
