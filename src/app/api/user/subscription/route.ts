/**
 * API роут для управления подписками пользователей
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserManager } from '@/lib/auth/user-manager';
import { z } from 'zod';

// Схема валидации запроса
const subscriptionUpdateSchema = z.object({
  sessionToken: z.string().min(1, 'Токен сессии обязателен'),
  newPlan: z.enum(['free', 'premium', 'business', 'enterprise']),
  expiresAt: z.string().datetime().optional()
});

// Инициализация UserManager
const userManager = new UserManager(process.env.TELEGRAM_BOT_TOKEN || '');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionToken = searchParams.get('sessionToken');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Токен сессии обязателен' },
        { status: 400 }
      );
    }

    // Валидация сессии
    const authResult = await userManager.validateSession(sessionToken);
    
    if (!authResult) {
      return NextResponse.json(
        {
          error: 'Недействительная сессия',
          details: 'Сессия истекла или не существует'
        },
        { status: 401 }
      );
    }

    // Получение профиля с подпиской
    const profile = await userManager.getUserProfile(authResult.user.id);

    return NextResponse.json({
      success: true,
      data: {
        subscription: profile.subscription,
        usage: profile.usage,
        upgradeRecommendations: await userManager.getUpgradeRecommendations(authResult.user.id)
      }
    });

  } catch (error) {
    console.error('Get Subscription API Error:', error);
    
    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация запроса
    const validatedData = subscriptionUpdateSchema.parse(body);
    
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

    // Обновление подписки
    const expiresAt = validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined;
    const updatedProfile = await userManager.updateSubscription(
      authResult.user.id,
      validatedData.newPlan,
      expiresAt
    );

    return NextResponse.json({
      success: true,
      data: {
        subscription: updatedProfile.subscription,
        usage: updatedProfile.usage
      }
    });

  } catch (error) {
    console.error('Update Subscription API Error:', error);
    
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
