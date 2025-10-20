/**
 * API роут для очистки истекших данных
 */

import { NextRequest, NextResponse } from 'next/server';
import { DataManager } from '@/lib/data/data-manager';

// Инициализация DataManager
const dataManager = new DataManager({
  enableAnalytics: true,
  enableNotifications: true,
  enableCaching: false
});

export async function POST(request: NextRequest) {
  try {
    const cleanupResult = await dataManager.cleanupExpiredData();

    return NextResponse.json({
      success: true,
      data: {
        message: 'Очистка данных завершена',
        results: cleanupResult,
        summary: {
          totalCleaned: cleanupResult.notifications + 
                       cleanupResult.sessions + 
                       cleanupResult.subscriptions
        }
      }
    });

  } catch (error) {
    console.error('Cleanup API Error:', error);
    
    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}
