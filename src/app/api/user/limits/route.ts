/**
 * API роут для проверки лимитов пользователя
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserManager } from '@/lib/auth/user-manager';
import { z } from 'zod';

// Схема валидации запроса
const checkLimitsSchema = z.object({
  sessionToken: z.string().min(1, 'Токен сессии обязателен'),
  resourceType: z.enum(['documents', 'consultations', 'disputes', 'api_calls']).optional()
});

// Инициализация UserManager
const userManager = new UserManager(process.env.TELEGRAM_BOT_TOKEN || '');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionToken = searchParams.get('sessionToken');
    const resourceType = searchParams.get('resourceType');

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

    // Если указан конкретный тип ресурса
    if (resourceType) {
      const canUse = await userManager.canUseResource(
        authResult.user.id,
        resourceType as 'documents' | 'consultations' | 'disputes' | 'api_calls'
      );

      return NextResponse.json({
        success: true,
        data: {
          resourceType,
          canUse,
          userId: authResult.user.id
        }
      });
    }

    // Получение всех лимитов
    const limits = await userManager.checkUserLimits(authResult.user.id);

    return NextResponse.json({
      success: true,
      data: {
        limits,
        userId: authResult.user.id
      }
    });

  } catch (error) {
    console.error('Check Limits API Error:', error);
    
    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация запроса
    const validatedData = checkLimitsSchema.parse(body);
    
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

    // Если указан конкретный тип ресурса
    if (validatedData.resourceType) {
      const canUse = await userManager.canUseResource(
        authResult.user.id,
        validatedData.resourceType
      );

      return NextResponse.json({
        success: true,
        data: {
          resourceType: validatedData.resourceType,
          canUse,
          userId: authResult.user.id
        }
      });
    }

    // Получение всех лимитов
    const limits = await userManager.checkUserLimits(authResult.user.id);

    return NextResponse.json({
      success: true,
      data: {
        limits,
        userId: authResult.user.id
      }
    });

  } catch (error) {
    console.error('Check Limits API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Ошибка валидации',
          details: error.issues
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
