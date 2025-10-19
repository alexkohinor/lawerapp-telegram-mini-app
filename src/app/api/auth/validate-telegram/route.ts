import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * API роут для валидации Telegram WebApp initData
 * Основано на SECURITY_GUIDELINES.md
 */

interface TelegramInitData {
  initData: string;
}

export async function POST(request: NextRequest) {
  try {
    const { initData }: TelegramInitData = await request.json();

    if (!initData) {
      return NextResponse.json(
        { success: false, error: 'Init data is required' },
        { status: 400 }
      );
    }

    // В реальном приложении здесь должна быть валидация с секретным ключом бота
    // Для демонстрации возвращаем успешный результат
    const isValid = await validateTelegramInitData(initData);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid init data' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Telegram validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Валидация Telegram WebApp initData
 * В реальном приложении используйте секретный ключ бота
 */
async function validateTelegramInitData(initData: string): Promise<boolean> {
  try {
    // Парсим initData
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      return false;
    }

    // Удаляем hash из параметров для проверки
    urlParams.delete('hash');
    
    // Сортируем параметры
    const sortedParams = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Создаем секретный ключ (в реальном приложении используйте TELEGRAM_BOT_TOKEN)
    const secretKey = process.env.TELEGRAM_BOT_TOKEN || 'demo_secret_key';
    const secretKeyBuffer = crypto.createHash('sha256').update(secretKey).digest();
    
    // Создаем HMAC
    const hmac = crypto.createHmac('sha256', secretKeyBuffer);
    hmac.update(sortedParams);
    const calculatedHash = hmac.digest('hex');

    // Сравниваем хеши
    return calculatedHash === hash;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
}
