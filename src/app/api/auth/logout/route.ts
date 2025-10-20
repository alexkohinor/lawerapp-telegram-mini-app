/**
 * API роут для выхода пользователя из системы
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserManager } from '@/lib/auth/user-manager';
import { z } from 'zod';

// Схема валидации запроса
const logoutRequestSchema = z.object({
  sessionToken: z.string().min(1, 'Токен сессии обязателен'),
  logoutAll: z.boolean().optional().default(false)
});

// Инициализация UserManager
const userManager = new UserManager(process.env.TELEGRAM_BOT_TOKEN || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация запроса
    const validatedData = logoutRequestSchema.parse(body);
    
    let result: boolean | number = false;
    
    if (validatedData.logoutAll) {
      // Завершаем все сессии пользователя
      // Сначала получаем userId из сессии
      const authResult = await userManager.validateSession(validatedData.sessionToken);
      if (authResult) {
        result = await userManager.logoutAllSessions(authResult.user.id);
      }
    } else {
      // Завершаем только текущую сессию
      result = await userManager.logout(validatedData.sessionToken);
    }

    if (!result) {
      return NextResponse.json(
        {
          error: 'Ошибка выхода',
          details: 'Сессия не найдена или уже завершена'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: validatedData.logoutAll ? 
          `Завершено ${result} сессий` : 
          'Сессия успешно завершена',
        logoutAll: validatedData.logoutAll,
        sessionsTerminated: typeof result === 'number' ? result : 1
      }
    });

  } catch (error) {
    console.error('Logout API Error:', error);
    
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
