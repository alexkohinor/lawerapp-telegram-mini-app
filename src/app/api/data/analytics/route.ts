/**
 * API роут для получения аналитики системы
 */

import { NextRequest, NextResponse } from 'next/server';
import { DataManager } from '@/lib/data/data-manager';
import { z } from 'zod';

// Схема валидации запроса
const analyticsRequestSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  groupBy: z.enum(['day', 'week', 'month', 'year']).default('day')
});

// Инициализация DataManager
const dataManager = new DataManager({
  enableAnalytics: true,
  enableNotifications: true,
  enableCaching: false
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const groupBy = searchParams.get('groupBy') || 'day';

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Параметры startDate и endDate обязательны' },
        { status: 400 }
      );
    }

    // Валидация запроса
    const validatedData = analyticsRequestSchema.parse({
      startDate,
      endDate,
      groupBy
    });

    const analytics = await dataManager.getSystemAnalytics({
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
      groupBy: validatedData.groupBy
    });

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get Analytics API Error:', error);
    
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
