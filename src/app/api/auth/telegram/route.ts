/**
 * API endpoint для аутентификации через Telegram WebApp
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramInitData, getOrCreateUser } from '@/lib/auth/telegram-auth';

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json();

    if (!initData) {
      return NextResponse.json(
        { error: 'initData is required' },
        { status: 400 }
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json(
        { error: 'Bot token not configured' },
        { status: 500 }
      );
    }

    // Валидируем initData
    const validatedData = validateTelegramInitData(initData, botToken);
    
    if (!validatedData) {
      return NextResponse.json(
        { error: 'Invalid initData' },
        { status: 401 }
      );
    }

    // Создаем или получаем пользователя
    const user = await getOrCreateUser(validatedData.user);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        languageCode: user.languageCode,
        photoUrl: user.photoUrl,
        isPremium: user.isPremium,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
