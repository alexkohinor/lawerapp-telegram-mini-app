/**
 * Telegram Authentication Service
 * Аутентификация пользователей через Telegram WebApp
 */

import { prisma } from '../prisma';
import crypto from 'crypto';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
  query_id?: string;
  user?: TelegramUser;
}

export interface AuthenticatedUser {
  id: string;
  telegramId: bigint;
  telegramUsername?: string;
  firstName?: string;
  lastName?: string;
  subscriptionPlan: string;
  isActive: boolean;
  documentsUsed: number;
  lastLoginAt?: Date;
  createdAt: Date;
}

export class TelegramAuthService {
  private botToken: string;

  constructor(botToken: string) {
    this.botToken = botToken;
  }

  /**
   * Валидация данных аутентификации Telegram
   */
  validateTelegramAuth(authData: TelegramAuthData): boolean {
    try {
      const { hash, ...data } = authData;
      
      // Создаем строку для проверки подписи
      const dataCheckString = Object.keys(data)
        .sort()
        .map(key => `${key}=${data[key as keyof typeof data]}`)
        .join('\n');

      // Создаем секретный ключ
      const secretKey = crypto
        .createHash('sha256')
        .update(this.botToken)
        .digest();

      // Вычисляем HMAC
      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      // Проверяем подпись
      return calculatedHash === hash;
    } catch (error) {
      console.error('Telegram Auth Validation Error:', error);
      return false;
    }
  }

  /**
   * Аутентификация пользователя через Telegram
   */
  async authenticateUser(authData: TelegramAuthData): Promise<AuthenticatedUser> {
    try {
      // Валидируем данные
      if (!this.validateTelegramAuth(authData)) {
        throw new Error('Неверные данные аутентификации Telegram');
      }

      // Проверяем, не устарели ли данные (максимум 24 часа)
      const authDate = new Date(authData.auth_date * 1000);
      const now = new Date();
      const timeDiff = now.getTime() - authDate.getTime();
      const hoursDiff = timeDiff / (1000 * 3600);

      if (hoursDiff > 24) {
        throw new Error('Данные аутентификации устарели');
      }

      // Ищем или создаем пользователя
      const user = await prisma.user.upsert({
        where: { telegramId: BigInt(authData.id) },
        update: {
          telegramUsername: authData.username,
          firstName: authData.first_name,
          lastName: authData.last_name,
          lastLoginAt: new Date(),
          isActive: true
        },
        create: {
          telegramId: BigInt(authData.id),
          telegramUsername: authData.username,
          firstName: authData.first_name,
          lastName: authData.last_name,
          subscriptionPlan: 'free',
          isActive: true,
          documentsUsed: 0,
          lastLoginAt: new Date()
        }
      });

      return {
        id: user.id,
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        subscriptionPlan: user.subscriptionPlan,
        isActive: user.isActive,
        documentsUsed: user.documentsUsed,
        lastLoginAt: user.lastLoginAt || undefined,
        createdAt: user.createdAt
      };

    } catch (error) {
      console.error('Telegram Authentication Error:', error);
      throw new Error(`Ошибка аутентификации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение пользователя по Telegram ID
   */
  async getUserByTelegramId(telegramId: number): Promise<AuthenticatedUser | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { telegramId: BigInt(telegramId) }
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        subscriptionPlan: user.subscriptionPlan,
        isActive: user.isActive,
        documentsUsed: user.documentsUsed,
        lastLoginAt: user.lastLoginAt || undefined,
        createdAt: user.createdAt
      };

    } catch (error) {
      console.error('Get User by Telegram ID Error:', error);
      throw new Error(`Ошибка получения пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
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
  ): Promise<AuthenticatedUser> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      });

      return {
        id: user.id,
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        subscriptionPlan: user.subscriptionPlan,
        isActive: user.isActive,
        documentsUsed: user.documentsUsed,
        lastLoginAt: user.lastLoginAt || undefined,
        createdAt: user.createdAt
      };

    } catch (error) {
      console.error('Update User Profile Error:', error);
      throw new Error(`Ошибка обновления профиля: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Деактивация пользователя
   */
  async deactivateUser(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Deactivate User Error:', error);
      throw new Error(`Ошибка деактивации пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение статистики пользователя
   */
  async getUserStats(userId: string): Promise<{
    totalConsultations: number;
    totalDocuments: number;
    totalDisputes: number;
    documentsUsed: number;
    subscriptionPlan: string;
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          documentsUsed: true,
          subscriptionPlan: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          _count: {
            select: {
              consultations: true,
              documents: true,
              disputes: true
            }
          }
        }
      });

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      return {
        totalConsultations: user._count.consultations,
        totalDocuments: user._count.documents,
        totalDisputes: user._count.disputes,
        documentsUsed: user.documentsUsed,
        subscriptionPlan: user.subscriptionPlan,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt || undefined,
        createdAt: user.createdAt
      };

    } catch (error) {
      console.error('Get User Stats Error:', error);
      throw new Error(`Ошибка получения статистики: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Проверка активности пользователя
   */
  async isUserActive(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isActive: true }
      });

      return user?.isActive || false;
    } catch (error) {
      console.error('Check User Active Error:', error);
      return false;
    }
  }

  /**
   * Получение всех активных пользователей
   */
  async getActiveUsers(limit: number = 100, offset: number = 0): Promise<AuthenticatedUser[]> {
    try {
      const users = await prisma.user.findMany({
        where: { isActive: true },
        orderBy: { lastLoginAt: 'desc' },
        take: limit,
        skip: offset
      });

      return users.map((user) => ({
        id: user.id,
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        subscriptionPlan: user.subscriptionPlan,
        isActive: user.isActive,
        documentsUsed: user.documentsUsed,
        lastLoginAt: user.lastLoginAt || undefined,
        createdAt: user.createdAt
      }));

    } catch (error) {
      console.error('Get Active Users Error:', error);
      throw new Error(`Ошибка получения активных пользователей: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }
}

export default TelegramAuthService;
