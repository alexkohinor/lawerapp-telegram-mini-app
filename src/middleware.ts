import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware для защиты роутов и валидации Telegram WebApp
 * Основано на SECURITY_GUIDELINES.md
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Публичные роуты, которые не требуют аутентификации
  const publicRoutes = [
    '/',
    '/api/auth/validate-telegram',
    '/api/health',
  ];

  // Проверяем, является ли роут публичным
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith('/api/')
  );

  // Если это публичный роут, пропускаем
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Проверяем наличие Telegram WebApp данных
  const telegramInitData = request.headers.get('x-telegram-init-data');
  const userAgent = request.headers.get('user-agent') || '';

  // Проверяем, что запрос идет из Telegram WebApp
  const isTelegramWebApp = userAgent.includes('TelegramBot') || 
                          userAgent.includes('Telegram') ||
                          telegramInitData;

  if (!isTelegramWebApp) {
    // Если не из Telegram, перенаправляем на главную с предупреждением
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Проверяем валидность initData (если есть)
  if (telegramInitData) {
    // В реальном приложении здесь должна быть валидация
    // с использованием секретного ключа бота
    try {
      const urlParams = new URLSearchParams(telegramInitData);
      const user = urlParams.get('user');
      
      if (!user) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      console.error('Invalid Telegram init data:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
