'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  FileText, 
  Scale, 
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  ArrowRight
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'consultation' | 'document' | 'dispute';
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'in_progress' | 'error';
  timestamp: string;
  metadata?: {
    category?: string;
    documentType?: string;
    disputeStatus?: string;
  };
}

interface RecentActivityProps {
  activities: ActivityItem[];
  isLoading?: boolean;
  onViewAll?: () => void;
  onItemClick?: (item: ActivityItem) => void;
}

export function RecentActivity({ 
  activities, 
  isLoading = false, 
  onViewAll,
  onItemClick 
}: RecentActivityProps) {
  const getActivityIcon = (type: string, status: string) => {
    const iconClass = "w-4 h-4";
    
    switch (type) {
      case 'consultation':
        return <MessageSquare className={`${iconClass} text-blue-600`} />;
      case 'document':
        return <FileText className={`${iconClass} text-purple-600`} />;
      case 'dispute':
        return <Scale className={`${iconClass} text-green-600`} />;
      default:
        return <Clock className={`${iconClass} text-gray-600`} />;
    }
  };

  const getStatusIcon = (status: string) => {
    const iconClass = "w-3 h-3";
    
    switch (status) {
      case 'completed':
        return <CheckCircle className={`${iconClass} text-green-600`} />;
      case 'pending':
        return <Clock className={`${iconClass} text-yellow-600`} />;
      case 'in_progress':
        return <AlertCircle className={`${iconClass} text-blue-600`} />;
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-600`} />;
      default:
        return <Clock className={`${iconClass} text-gray-600`} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Завершено';
      case 'pending':
        return 'Ожидает';
      case 'in_progress':
        return 'В работе';
      case 'error':
        return 'Ошибка';
      default:
        return 'Неизвестно';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'только что';
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ч назад`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} дн назад`;
    
    return time.toLocaleDateString('ru-RU');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Последняя активность</CardTitle>
          <CardDescription>Загрузка...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Последняя активность</CardTitle>
          <CardDescription>Ваши недавние действия в приложении</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Активности пока нет
            </h3>
            <p className="text-gray-600">
              Начните использовать приложение, чтобы увидеть здесь ваши действия
            </p>
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
            <CardTitle>Последняя активность</CardTitle>
            <CardDescription>
              Ваши недавние действия в приложении
            </CardDescription>
          </div>
          {onViewAll && (
            <Button variant="outline" size="sm" onClick={onViewAll}>
              <Eye className="w-4 h-4 mr-1" />
              Все
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.slice(0, 5).map((activity) => (
            <div 
              key={activity.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
              onClick={() => onItemClick?.(activity)}
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                {getActivityIcon(activity.type, activity.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </h4>
                  <Badge className={getStatusColor(activity.status)}>
                    {getStatusIcon(activity.status)}
                    <span className="ml-1">{getStatusLabel(activity.status)}</span>
                  </Badge>
                </div>
                
                <p className="text-xs text-gray-600 truncate">
                  {activity.description}
                </p>
                
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                  
                  {activity.metadata?.category && (
                    <Badge variant="outline" className="text-xs">
                      {activity.metadata.category}
                    </Badge>
                  )}
                  
                  {activity.metadata?.documentType && (
                    <Badge variant="outline" className="text-xs">
                      {activity.metadata.documentType}
                    </Badge>
                  )}
                  
                  {activity.metadata?.disputeStatus && (
                    <Badge variant="outline" className="text-xs">
                      {activity.metadata.disputeStatus}
                    </Badge>
                  )}
                </div>
              </div>
              
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
        
        {activities.length > 5 && onViewAll && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onViewAll}
            >
              Показать все ({activities.length})
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
