/**
 * API роут для получения общего обзора системы
 */

import { NextRequest, NextResponse } from 'next/server';
import { DataManager } from '@/lib/data/data-manager';

// Инициализация DataManager
const dataManager = new DataManager({
  enableAnalytics: true,
  enableNotifications: true,
  enableCaching: false
});

export async function GET(request: NextRequest) {
  try {
    const overview = await dataManager.getSystemOverview();

    return NextResponse.json({
      success: true,
      data: overview
    });

  } catch (error) {
    console.error('Get System Overview API Error:', error);
    
    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}
