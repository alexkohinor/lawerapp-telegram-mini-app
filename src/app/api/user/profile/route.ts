/**
 * API роут для управления профилем пользователя
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserManager } from '@/lib/auth/user-manager';
import { z } from 'zod';

// Схема валидации запроса
const profileUpdateSchema = z.object({
  sessionToken: z.string().min(1, 'Токен сессии обязателен'),
  updates: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional()
  })
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

    // Получение профиля пользователя
    const profile = await userManager.getUserProfile(authResult.user.id);

    return NextResponse.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Get Profile API Error:', error);
    
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
    const validatedData = profileUpdateSchema.parse(body);
    
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

    // Обновление профиля
    const updatedProfile = await userManager.updateUserProfile(
      authResult.user.id,
      validatedData.updates
    );

    return NextResponse.json({
      success: true,
      data: updatedProfile
    });

  } catch (error) {
    console.error('Update Profile API Error:', error);
    
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
