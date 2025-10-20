'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, User } from 'lucide-react';

/**
 * Компонент для защиты роутов
 * Основано на SECURITY_GUIDELINES.md
 */

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <CardTitle>Требуется авторизация</CardTitle>
            <CardDescription>
              Для доступа к этому разделу необходимо войти через Telegram
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={login} 
              className="w-full" 
              size="lg"
            >
              <User className="w-4 h-4 mr-2" />
              Войти через Telegram
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Безопасная авторизация через Telegram WebApp
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
