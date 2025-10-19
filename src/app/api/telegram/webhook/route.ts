/**
 * Telegram Webhook API Route
 * Основано на TECHNICAL_SETUP.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { bot } from '@/bot/telegram-bot';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    
    // Проверяем, что запрос от Telegram
    const telegramSecret = request.headers.get('x-telegram-bot-api-secret-token');
    if (process.env.TELEGRAM_WEBHOOK_SECRET && telegramSecret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Обрабатываем webhook
    await bot.handleUpdate(JSON.parse(body));
    
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Проверка webhook
  return new NextResponse('Telegram Webhook is working', { status: 200 });
}
