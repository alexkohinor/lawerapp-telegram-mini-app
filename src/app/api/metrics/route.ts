/**
 * API endpoint для экспорта Prometheus метрик
 * Основано на MONITORING_AND_ANALYTICS.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { prometheusMetrics } from '@/lib/monitoring/prometheus-metrics';

export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию (в продакшене должен быть защищен)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.METRICS_AUTH_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Очищаем старые метрики
    prometheusMetrics.cleanupOldMetrics();

    // Экспортируем метрики
    const metrics = prometheusMetrics.exportMetrics();

    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error exporting metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
