/**
 * Middleware для мониторинга API запросов
 * Основано на MONITORING_AND_ANALYTICS.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { prometheusMetrics } from './prometheus-metrics';
import { performanceMonitor } from './performance-monitor';
import { errorMonitor } from './error-monitor';

interface APIMonitoringOptions {
  trackResponseTime?: boolean;
  trackErrors?: boolean;
  trackUserActivity?: boolean;
  trackRateLimit?: boolean;
}

/**
 * Middleware для мониторинга API запросов
 */
export function withAPIMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: APIMonitoringOptions = {}
) {
  const {
    trackResponseTime = true,
    trackErrors = true,
    trackUserActivity = true,
    trackRateLimit = true
  } = options;

  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const method = req.method;
    const url = req.url;
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const userId = req.headers.get('x-user-id') || 'anonymous';
    const sessionId = req.headers.get('x-session-id') || 'unknown';

    // Создаем уникальный ID для запроса
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Увеличиваем счетчик запросов
      prometheusMetrics.incrementCounter('http_requests_total', {
        method,
        endpoint: new URL(url).pathname,
        user_agent: userAgent.includes('bot') ? 'bot' : 'browser'
      });

      // Отслеживаем активность пользователя
      if (trackUserActivity && userId !== 'anonymous') {
        prometheusMetrics.incrementCounter('user_activity_total', {
          user_id: userId,
          action: 'api_request'
        });
      }

      // Выполняем основной обработчик
      const response = await handler(req);

      // Измеряем время ответа
      if (trackResponseTime) {
        const responseTime = Date.now() - startTime;
        prometheusMetrics.observeHistogram('http_request_duration_seconds', responseTime / 1000, {
          method,
          endpoint: new URL(url).pathname,
          status_code: response.status.toString()
        });
      }

      // Логируем успешный запрос
      errorMonitor.logInfo('API Request Completed', {
        requestId,
        method,
        url,
        statusCode: response.status,
        responseTime: Date.now() - startTime,
        userId,
        sessionId
      });

      return response;

    } catch (error) {
      // Измеряем время до ошибки
      if (trackResponseTime) {
        const responseTime = Date.now() - startTime;
        prometheusMetrics.observeHistogram('http_request_duration_seconds', responseTime / 1000, {
          method,
          endpoint: new URL(url).pathname,
          status_code: '500'
        });
      }

      // Отслеживаем ошибки
      if (trackErrors) {
        prometheusMetrics.incrementCounter('http_errors_total', {
          method,
          endpoint: new URL(url).pathname,
          error_type: error instanceof Error ? error.constructor.name : 'Unknown'
        });

        errorMonitor.logError('API Request Failed', {
          requestId,
          method,
          url,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          userId,
          sessionId
        });
      }

      // Возвращаем ошибку
      return NextResponse.json(
        { 
          error: 'Internal Server Error',
          requestId,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware для отслеживания rate limiting
 */
export function withRateLimitMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    windowMs?: number;
    maxRequests?: number;
    keyGenerator?: (req: NextRequest) => string;
  } = {}
) {
  const {
    windowMs = 60000, // 1 минута
    maxRequests = 100,
    keyGenerator = (req) => req.headers.get('x-forwarded-for') || req.ip || 'unknown'
  } = options;

  const requests = new Map<string, { count: number; resetTime: number }>();

  return async (req: NextRequest): Promise<NextResponse> => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Очищаем старые записи
    for (const [k, v] of requests) {
      if (v.resetTime < windowStart) {
        requests.delete(k);
      }
    }

    // Получаем или создаем запись для ключа
    let record = requests.get(key);
    if (!record || record.resetTime < windowStart) {
      record = { count: 0, resetTime: now + windowMs };
      requests.set(key, record);
    }

    // Проверяем лимит
    if (record.count >= maxRequests) {
      // Увеличиваем счетчик rate limit hits
      prometheusMetrics.incrementCounter('rate_limit_hits_total', {
        endpoint: new URL(req.url).pathname,
        user_agent: req.headers.get('user-agent')?.includes('bot') ? 'bot' : 'browser'
      });

      errorMonitor.logWarning('Rate Limit Exceeded', {
        key,
        count: record.count,
        maxRequests,
        windowMs,
        endpoint: new URL(req.url).pathname
      });

      return NextResponse.json(
        { 
          error: 'Too Many Requests',
          retryAfter: Math.ceil((record.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString()
          }
        }
      );
    }

    // Увеличиваем счетчик
    record.count++;

    // Выполняем основной обработчик
    return handler(req);
  };
}

/**
 * Middleware для отслеживания аутентификации
 */
export function withAuthMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const authHeader = req.headers.get('authorization');
    const isAuthenticated = !!authHeader;
    const userId = req.headers.get('x-user-id') || 'anonymous';

    // Отслеживаем попытки аутентификации
    if (isAuthenticated) {
      prometheusMetrics.incrementCounter('authentication_success_total', {
        user_id: userId
      });
    } else {
      prometheusMetrics.incrementCounter('authentication_failed_total', {
        endpoint: new URL(req.url).pathname
      });

      errorMonitor.logWarning('Authentication Failed', {
        endpoint: new URL(req.url).pathname,
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for') || req.ip
      });
    }

    return handler(req);
  };
}

/**
 * Утилита для создания мониторинга API endpoint
 */
export function createMonitoredAPI(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: APIMonitoringOptions & {
    rateLimit?: {
      windowMs?: number;
      maxRequests?: number;
    };
    requireAuth?: boolean;
  } = {}
) {
  let monitoredHandler = handler;

  // Добавляем мониторинг аутентификации
  if (options.requireAuth) {
    monitoredHandler = withAuthMonitoring(monitoredHandler);
  }

  // Добавляем rate limiting
  if (options.rateLimit) {
    monitoredHandler = withRateLimitMonitoring(monitoredHandler, options.rateLimit);
  }

  // Добавляем общий мониторинг
  monitoredHandler = withAPIMonitoring(monitoredHandler, options);

  return monitoredHandler;
}
