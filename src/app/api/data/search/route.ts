/**
 * API роут для поиска по всем типам данных
 */

import { NextRequest, NextResponse } from 'next/server';
import { DataManager } from '@/lib/data/data-manager';
import { z } from 'zod';

// Схема валидации запроса
const searchRequestSchema = z.object({
  query: z.string().min(1, 'Поисковый запрос не может быть пустым'),
  userId: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(20)
});

// Инициализация DataManager
const dataManager = new DataManager({
  enableAnalytics: true,
  enableNotifications: true,
  enableCaching: false
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация запроса
    const validatedData = searchRequestSchema.parse(body);
    
    const results = await dataManager.searchAll(
      validatedData.query,
      validatedData.userId,
      validatedData.limit
    );

    return NextResponse.json({
      success: true,
      data: {
        query: validatedData.query,
        results,
        total: results.consultations.length + 
               results.documents.length + 
               results.disputes.length + 
               results.payments.length
      }
    });

  } catch (error) {
    console.error('Search API Error:', error);
    
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
