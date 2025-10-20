'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HapticFeedback } from '@/components/telegram/HapticFeedback';
import { 
  MessageSquare, 
  FileText, 
  Scale, 
  Plus,
  Sparkles,
  Zap,
  TrendingUp,
  Clock
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  variant: 'primary' | 'secondary' | 'gradient' | 'success' | 'warning' | 'danger';
  onClick: () => void;
  disabled?: boolean;
  badge?: string;
}

interface QuickActionsProps {
  onNewConsultation: () => void;
  onNewDocument: () => void;
  onNewDispute: () => void;
  onViewAll: () => void;
  isLoading?: boolean;
  userStats?: {
    consultationsThisMonth: number;
    documentsThisMonth: number;
    activeDisputes: number;
  };
}

export function QuickActions({ 
  onNewConsultation,
  onNewDocument,
  onNewDispute,
  onViewAll,
  isLoading = false,
  userStats
}: QuickActionsProps) {
  const quickActions: QuickAction[] = [
    {
      id: 'consultation',
      title: 'AI Консультация',
      description: 'Быстрая правовая помощь',
      icon: <MessageSquare className="w-5 h-5" />,
      variant: 'gradient',
      onClick: onNewConsultation,
      badge: userStats?.consultationsThisMonth ? `${userStats.consultationsThisMonth} в этом месяце` : undefined
    },
    {
      id: 'document',
      title: 'Создать документ',
      description: 'Генерация правовых документов',
      icon: <FileText className="w-5 h-5" />,
      variant: 'success',
      onClick: onNewDocument,
      badge: userStats?.documentsThisMonth ? `${userStats.documentsThisMonth} в этом месяце` : undefined
    },
    {
      id: 'dispute',
      title: 'Новый спор',
      description: 'Начать правовой спор',
      icon: <Scale className="w-5 h-5" />,
      variant: 'warning',
      onClick: onNewDispute,
      badge: userStats?.activeDisputes ? `${userStats.activeDisputes} активных` : undefined
    }
  ];

  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white hover:from-blue-700 hover:via-purple-700 hover:to-blue-900 shadow-lg hover:shadow-xl';
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl';
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 shadow-lg hover:shadow-xl';
      case 'secondary':
        return 'bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-md hover:shadow-lg';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
          <CardDescription>Загрузка...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-3"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>Быстрые действия</span>
            </CardTitle>
            <CardDescription>
              Начните работу с популярными функциями
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Основные действия */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <HapticFeedback key={action.id} impact="light">
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 shadow-md"
                  onClick={action.onClick}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {action.title}
                        </h3>
                        {action.badge && (
                          <div className="text-xs text-gray-500 mt-1">
                            {action.badge}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3">
                      {action.description}
                    </p>
                    
                    <Button
                      className={`w-full text-sm ${getVariantClasses(action.variant)}`}
                      size="sm"
                      disabled={action.disabled}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Создать
                    </Button>
                  </CardContent>
                </Card>
              </HapticFeedback>
            ))}
          </div>

          {/* Дополнительные действия */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <HapticFeedback impact="light">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={onViewAll}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Просмотреть все
                </Button>
              </HapticFeedback>
              
              <HapticFeedback impact="light">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // TODO: Implement help/tutorial
                    console.log('Help clicked');
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Как начать
                </Button>
              </HapticFeedback>
            </div>
          </div>

          {/* Статистика использования */}
          {userStats && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Активность в этом месяце</span>
                </div>
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>{userStats.consultationsThisMonth} консультаций</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>{userStats.documentsThisMonth} документов</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{userStats.activeDisputes} споров</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
