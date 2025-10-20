/**
 * API роут для валидации сессии пользователя
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserManager } from '@/lib/auth/user-manager';
import { z } from 'zod';

// Схема валидации запроса
const validateRequestSchema = z.object({
  sessionToken: z.string().min(1, 'Токен сессии обязателен')
});

// Инициализация UserManager
const userManager = new UserManager(process.env.TELEGRAM_BOT_TOKEN || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация запроса
    const validatedData = validateRequestSchema.parse(body);
    
    // Валидация сессии
    const authResult = await userManager.validateSession(validatedData.sessionToken);
    
    if (!authResult) {
      return NextResponse.json(
        {
          error: 'Недействительная сессия',
          details: 'Сессия истекла или не существует'
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: authResult.user.id,
          telegramId: authResult.user.telegramId.toString(),
          telegramUsername: authResult.user.telegramUsername,
          firstName: authResult.user.firstName,
          lastName: authResult.user.lastName,
          subscriptionPlan: authResult.user.subscriptionPlan,
          isActive: authResult.user.isActive,
          documentsUsed: authResult.user.documentsUsed,
          lastLoginAt: authResult.user.lastLoginAt,
          createdAt: authResult.user.createdAt
        },
        session: {
          id: authResult.session.id,
          sessionToken: authResult.session.sessionToken,
          expiresAt: authResult.session.expiresAt,
          isActive: authResult.session.isActive,
          lastActivityAt: authResult.session.lastActivityAt
        },
        profile: {
          subscription: authResult.profile.subscription,
          usage: authResult.profile.usage
        }
      }
    });

  } catch (error) {
    console.error('Validate Session API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Ошибка валидации',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}
