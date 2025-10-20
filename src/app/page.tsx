'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HapticFeedback } from '@/components/telegram/HapticFeedback';
import { useTelegramUser } from '@/hooks/useTelegramUser';

export default function HomePage() {
  const router = useRouter();
  const { isTelegramApp, user, isLoading, hapticFeedback, expand } = useTelegramUser();

  useEffect(() => {
    if (isTelegramApp) {
      expand();
    }
  }, [isTelegramApp, expand]);

  const handleNavigation = (path: string) => {
    hapticFeedback('light');
    router.push(path);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Mock data для статистики
  const dashboardStats = {
    consultations: 12,
    documents: 8,
    disputes: 2,
    subscription: 'Premium'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Compact Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">⚖️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LawerApp</h1>
                <p className="text-xs text-gray-600">Правовая помощь</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {user && (
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-xs">
                      {user.firstName?.[0] || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.firstName}
                  </span>
                </div>
              )}
              <HapticFeedback type="light">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigation('/profile')}
                  className="text-xs px-2 py-1"
                >
                  👤
                </Button>
              </HapticFeedback>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-blue-600">
                {dashboardStats.consultations}
              </div>
              <div className="text-xs text-gray-600">Консультации</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-green-600">
                {dashboardStats.documents}
              </div>
              <div className="text-xs text-gray-600">Документы</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-purple-600">
                {dashboardStats.disputes}
              </div>
              <div className="text-xs text-gray-600">Споры</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Badge variant="warning" className="text-xs">
                {dashboardStats.subscription}
              </Badge>
              <div className="text-xs text-gray-600 mt-1">Подписка</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="space-y-3 mb-6">
          <HapticFeedback type="light">
            <Button
              variant="default"
              size="lg"
              onClick={() => handleNavigation('/consultations/new')}
              className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <div className="flex items-center space-x-3 w-full">
                <span className="text-2xl">💬</span>
                <div className="text-left">
                  <div className="font-bold text-lg">AI Консультации</div>
                  <div className="text-blue-100 text-sm">Получите правовую помощь от ИИ</div>
                </div>
              </div>
            </Button>
          </HapticFeedback>

          <HapticFeedback type="light">
            <Button
              variant="default"
              size="lg"
              onClick={() => handleNavigation('/documents/generate')}
              className="w-full h-16 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <div className="flex items-center space-x-3 w-full">
                <span className="text-2xl">📄</span>
                <div className="text-left">
                  <div className="font-bold text-lg">Документы</div>
                  <div className="text-green-100 text-sm">Создайте правовые документы</div>
                </div>
              </div>
            </Button>
          </HapticFeedback>

          <HapticFeedback type="light">
            <Button
              variant="default"
              size="lg"
              onClick={() => handleNavigation('/disputes')}
              className="w-full h-16 bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <div className="flex items-center space-x-3 w-full">
                <span className="text-2xl">⚖️</span>
                <div className="text-left">
                  <div className="font-bold text-lg">Споры</div>
                  <div className="text-purple-100 text-sm">Управляйте правовыми спорами</div>
                </div>
              </div>
            </Button>
          </HapticFeedback>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-2 gap-3">
          <HapticFeedback type="light">
            <Button
              variant="outline"
              onClick={() => handleNavigation('/consultations')}
              className="h-12 flex items-center justify-center space-x-2"
            >
              <span>📋</span>
              <span className="text-sm">История</span>
            </Button>
          </HapticFeedback>
          
          <HapticFeedback type="light">
            <Button
              variant="outline"
              onClick={() => handleNavigation('/documents')}
              className="h-12 flex items-center justify-center space-x-2"
            >
              <span>📁</span>
              <span className="text-sm">Мои документы</span>
            </Button>
          </HapticFeedback>
        </div>
      </div>
    </div>
  );
}