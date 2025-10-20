'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  FileText, 
  Scale, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';

interface StatsData {
  consultations: {
    total: number;
    thisMonth: number;
    pending: number;
  };
  documents: {
    total: number;
    thisMonth: number;
    byType: Record<string, number>;
  };
  disputes: {
    total: number;
    active: number;
    resolved: number;
    escalated: number;
  };
  subscription: {
    plan: string;
    consultationsUsed: number;
    consultationsLimit: number;
    documentsUsed: number;
    documentsLimit: number;
  };
}

interface StatsCardsProps {
  stats: StatsData;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading = false }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const consultationUsagePercent = (stats.subscription.consultationsUsed / stats.subscription.consultationsLimit) * 100;
  const documentUsagePercent = (stats.subscription.documentsUsed / stats.subscription.documentsLimit) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* AI Консультации */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <Badge variant="outline" className="text-xs">
              {stats.subscription.plan}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">
              {stats.consultations.total}
            </div>
            <div className="text-sm text-gray-600">
              Всего консультаций
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">
                {stats.consultations.thisMonth} в этом месяце
              </span>
              <span className="text-blue-600 font-medium">
                {stats.subscription.consultationsUsed}/{stats.subscription.consultationsLimit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(consultationUsagePercent, 100)}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Документы */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <Badge variant="outline" className="text-xs">
              {Object.keys(stats.documents.byType).length} типов
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">
              {stats.documents.total}
            </div>
            <div className="text-sm text-gray-600">
              Сгенерировано документов
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">
                {stats.documents.thisMonth} в этом месяце
              </span>
              <span className="text-purple-600 font-medium">
                {stats.subscription.documentsUsed}/{stats.subscription.documentsLimit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(documentUsagePercent, 100)}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Споры */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                stats.disputes.escalated > 0 
                  ? 'text-red-600 border-red-200' 
                  : 'text-green-600 border-green-200'
              }`}
            >
              {stats.disputes.escalated > 0 ? 'Требует внимания' : 'Все в порядке'}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">
              {stats.disputes.total}
            </div>
            <div className="text-sm text-gray-600">
              Активных споров
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-500">{stats.disputes.active}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-500">{stats.disputes.resolved}</span>
              </div>
              {stats.disputes.escalated > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-600">{stats.disputes.escalated}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Прогресс */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                consultationUsagePercent > 80 || documentUsagePercent > 80
                  ? 'text-orange-600 border-orange-200'
                  : 'text-green-600 border-green-200'
              }`}
            >
              {consultationUsagePercent > 80 || documentUsagePercent > 80 ? 'Лимит близок' : 'Хорошо'}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round((consultationUsagePercent + documentUsagePercent) / 2)}%
            </div>
            <div className="text-sm text-gray-600">
              Использование лимитов
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Консультации</span>
                <span className="text-blue-600 font-medium">
                  {Math.round(consultationUsagePercent)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Документы</span>
                <span className="text-purple-600 font-medium">
                  {Math.round(documentUsagePercent)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
