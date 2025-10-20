/**
 * API роут для аутентификации пользователей через Telegram
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserManager } from '@/lib/auth/user-manager';
import { z } from 'zod';

// Схема валидации запроса
const loginRequestSchema = z.object({
  telegramAuthData: z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string().optional(),
    username: z.string().optional(),
    photo_url: z.string().optional(),
    auth_date: z.number(),
    hash: z.string()
  }),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional()
});

// Инициализация UserManager
const userManager = new UserManager(process.env.TELEGRAM_BOT_TOKEN || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация запроса
    const validatedData = loginRequestSchema.parse(body);
    
    // Получаем IP адрес из заголовков если не передан
    const ipAddress = validatedData.ipAddress || 
      request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') || 
      'unknown';

    // Получаем User-Agent
    const userAgent = validatedData.userAgent || 
      request.headers.get('user-agent') || 
      'unknown';

    // Аутентификация пользователя
    const authResult = await userManager.authenticateUser({
      telegramAuthData: validatedData.telegramAuthData,
      userAgent,
      ipAddress
    });

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
    console.error('Login API Error:', error);
    
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
        error: 'Ошибка аутентификации',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 401 }
    );
  }
}
