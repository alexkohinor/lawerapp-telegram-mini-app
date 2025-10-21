/**
 * Session Manager - управление пользовательскими сессиями
 */

import { prisma } from '../prisma';
import crypto from 'crypto';

export interface SessionData {
  id: string;
  userId: string;
  telegramId: bigint;
  sessionToken: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface CreateSessionData {
  userId: string;
  telegramId: bigint;
  userAgent?: string;
  ipAddress?: string;
  expiresInHours?: number;
}

export class SessionManager {
  private defaultExpirationHours: number;

  constructor(defaultExpirationHours: number = 24) {
    this.defaultExpirationHours = defaultExpirationHours;
  }

  /**
   * Создание новой сессии
   */
  async createSession(data: CreateSessionData): Promise<SessionData> {
    try {
      // Генерируем уникальный токен сессии
      const sessionToken = this.generateSessionToken();
      
      // Вычисляем время истечения
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (data.expiresInHours || this.defaultExpirationHours));

      // Создаем сессию в базе данных
      const session = await prisma.session.create({
        data: {
          userId: data.userId,
          sessionToken,
          expiresAt
        }
      });

      return {
        id: session.id,
        userId: session.userId,
        telegramId: data.telegramId,
        sessionToken: session.sessionToken,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt
      };

    } catch (error) {
      console.error('Create Session Error:', error);
      throw new Error(`Ошибка создания сессии: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Валидация сессии по токену
   */
  async validateSession(sessionToken: string): Promise<SessionData | null> {
    try {
      const session = await prisma.session.findFirst({
        where: {
          sessionToken,
          expiresAt: {
            gt: new Date()
          }
        },
        include: {
          user: {
            select: {
              telegramId: true
            }
          }
        }
      });

      if (!session) {
        return null;
      }

      // Обновляем время последней активности
      // Обновление активности сессии не требуется, так как поле lastActivityAt отсутствует в схеме

      return {
        id: session.id,
        userId: session.userId,
        telegramId: session.user.telegramId,
        sessionToken: session.sessionToken,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt
      };

    } catch (error) {
      console.error('Validate Session Error:', error);
      return null;
    }
  }

  /**
   * Обновление сессии (продление времени жизни)
   */
  async refreshSession(sessionToken: string, expiresInHours?: number): Promise<SessionData | null> {
    try {
      const session = await this.validateSession(sessionToken);
      
      if (!session) {
        return null;
      }

      // Вычисляем новое время истечения
      const newExpiresAt = new Date();
      newExpiresAt.setHours(newExpiresAt.getHours() + (expiresInHours || this.defaultExpirationHours));

      // Обновляем сессию
      const updatedSession = await prisma.session.update({
        where: { id: session.id },
        data: {
          expiresAt: newExpiresAt
        }
      });

      return {
        ...session,
        expiresAt: updatedSession.expiresAt
      };

    } catch (error) {
      console.error('Refresh Session Error:', error);
      return null;
    }
  }

  /**
   * Завершение сессии
   */
  async terminateSession(sessionToken: string): Promise<boolean> {
    try {
      const result = await prisma.session.updateMany({
        where: {
          sessionToken
        },
        data: {
          expiresAt: new Date(0) // Устанавливаем дату истечения в прошлое
        }
      });

      return result.count > 0;
    } catch (error) {
      console.error('Terminate Session Error:', error);
      return false;
    }
  }

  /**
   * Завершение всех сессий пользователя
   */
  async terminateAllUserSessions(userId: string): Promise<number> {
    try {
      const result = await prisma.session.updateMany({
        where: {
          userId
        },
        data: {
          expiresAt: new Date(0) // Устанавливаем дату истечения в прошлое
        }
      });

      return result.count;
    } catch (error) {
      console.error('Terminate All User Sessions Error:', error);
      return 0;
    }
  }

  /**
   * Получение активных сессий пользователя
   */
  async getUserActiveSessions(userId: string): Promise<SessionData[]> {
    try {
      const sessions = await prisma.session.findMany({
        where: {
          userId,
          expiresAt: {
            gt: new Date()
          }
        },
        include: {
          user: {
            select: {
              telegramId: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return sessions.map(session => ({
        id: session.id,
        userId: session.userId,
        telegramId: session.user.telegramId,
        sessionToken: session.sessionToken,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt
      }));

    } catch (error) {
      console.error('Get User Active Sessions Error:', error);
      throw new Error(`Ошибка получения активных сессий: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Очистка истекших сессий
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await prisma.session.deleteMany({
        where: {
          expiresAt: {
            lte: new Date()
          }
        }
      });

      return result.count;
    } catch (error) {
      console.error('Cleanup Expired Sessions Error:', error);
      return 0;
    }
  }

  /**
   * Получение статистики сессий
   */
  async getSessionStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
    averageSessionDuration: number;
  }> {
    try {
      const now = new Date();
      
      const [
        totalSessions,
        activeSessions,
        expiredSessions,
        avgDuration
      ] = await Promise.all([
        prisma.session.count(),
        prisma.session.count({
          where: {
            expiresAt: { gt: now }
          }
        }),
        prisma.session.count({
          where: {
            expiresAt: { lte: now }
          }
        }),
        Promise.resolve({ _avg: { createdAt: 0 } }) // Для демо возвращаем 0
      ]);

      return {
        totalSessions,
        activeSessions,
        expiredSessions,
        averageSessionDuration: 0 // avgDuration._avg.duration || 0
      };

    } catch (error) {
      console.error('Get Session Stats Error:', error);
      throw new Error(`Ошибка получения статистики сессий: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Генерация токена сессии
   */
  private generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Проверка активности сессии
   */
  async isSessionActive(sessionToken: string): Promise<boolean> {
    try {
      const session = await prisma.session.findFirst({
        where: {
          sessionToken,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      return !!session;
    } catch (error) {
      console.error('Check Session Active Error:', error);
      return false;
    }
  }

  /**
   * Получение информации о сессии
   */
  async getSessionInfo(sessionToken: string): Promise<SessionData | null> {
    try {
      const session = await prisma.session.findFirst({
        where: { sessionToken },
        include: {
          user: {
            select: {
              telegramId: true
            }
          }
        }
      });

      if (!session) {
        return null;
      }

      return {
        id: session.id,
        userId: session.userId,
        telegramId: session.user.telegramId,
        sessionToken: session.sessionToken,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt
      };

    } catch (error) {
      console.error('Get Session Info Error:', error);
      return null;
    }
  }
}

export default SessionManager;
