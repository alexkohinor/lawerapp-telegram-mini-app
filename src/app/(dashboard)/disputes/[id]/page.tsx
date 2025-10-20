'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Scale, 
  Calendar, 
  DollarSign, 
  Tag, 
  MessageSquare,
  Edit,
  Trash2,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

/**
 * Страница детального просмотра спора
 * Основано на FEATURE_SPECIFICATION.md
 */

interface Dispute {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  category: string;
  amount?: number;
  currency: string;
  deadline?: Date;
  tags: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Array<{
    id: string;
    content: string;
    type: string;
    senderId: string;
    senderType: string;
    createdAt: Date;
  }>;
}

const statusConfig = {
  draft: { label: 'Черновик', color: 'bg-gray-100 text-gray-800', icon: FileText },
  active: { label: 'Активный', color: 'bg-blue-100 text-blue-800', icon: Clock },
  in_progress: { label: 'В работе', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  resolved: { label: 'Решен', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  closed: { label: 'Закрыт', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
};

const priorityConfig = {
  low: { label: 'Низкий', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Средний', color: 'bg-blue-100 text-blue-800' },
  high: { label: 'Высокий', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Срочный', color: 'bg-red-100 text-red-800' },
};

const typeLabels = {
  consumer_protection: 'Защита прав потребителей',
  labor: 'Трудовое право',
  contract: 'Договорные отношения',
  property: 'Недвижимость',
  family: 'Семейное право',
  criminal: 'Уголовное право',
  administrative: 'Административное право',
};

const categoryLabels = {
  civil: 'Гражданское право',
  criminal: 'Уголовное право',
  administrative: 'Административное право',
  labor: 'Трудовое право',
  family: 'Семейное право',
  tax: 'Налоговое право',
  corporate: 'Корпоративное право',
};

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const disputeId = params.id as string;

  useEffect(() => {
    const fetchDispute = async () => {
      try {
        const response = await fetch(`/api/disputes/${disputeId}`);
        const result = await response.json();

        if (result.success) {
          setDispute(result.data);
        } else {
          setError(result.error || 'Ошибка загрузки спора');
        }
      } catch (error) {
        console.error('Error fetching dispute:', error);
        setError('Ошибка загрузки спора');
      } finally {
        setIsLoading(false);
      }
    };

    if (disputeId) {
      fetchDispute();
    }
  }, [disputeId]);

  const handleEdit = () => {
    router.push(`/disputes/${disputeId}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот спор?')) {
      return;
    }

    try {
      const response = await fetch(`/api/disputes/${disputeId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        router.push('/disputes');
      } else {
        alert('Ошибка при удалении спора');
      }
    } catch (error) {
      console.error('Error deleting dispute:', error);
      alert('Ошибка при удалении спора');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !dispute) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ошибка загрузки
              </h3>
              <p className="text-gray-600 mb-4">
                {error || 'Спор не найден'}
              </p>
              <Button onClick={() => router.push('/disputes')}>
                Вернуться к списку
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  const StatusIcon = statusConfig[dispute.status as keyof typeof statusConfig]?.icon || Clock;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{dispute.title}</h1>
                  <p className="text-sm text-gray-600">ID: {dispute.id}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Редактировать
                </Button>
                <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Удалить
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Status and Priority */}
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${statusConfig[dispute.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'}`}>
              <StatusIcon className="w-4 h-4" />
              <span>{statusConfig[dispute.status as keyof typeof statusConfig]?.label || dispute.status}</span>
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityConfig[dispute.priority as keyof typeof priorityConfig]?.color || 'bg-gray-100 text-gray-800'}`}>
              {priorityConfig[dispute.priority as keyof typeof priorityConfig]?.label || dispute.priority}
            </span>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Описание</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{dispute.description}</p>
            </CardContent>
          </Card>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Информация о споре</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Тип:</span>
                  <span className="font-medium">
                    {typeLabels[dispute.type as keyof typeof typeLabels] || dispute.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Категория:</span>
                  <span className="font-medium">
                    {categoryLabels[dispute.category as keyof typeof categoryLabels] || dispute.category}
                  </span>
                </div>
                {dispute.amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Сумма:</span>
                    <span className="font-medium">
                      {formatCurrency(dispute.amount)} {dispute.currency}
                    </span>
                  </div>
                )}
                {dispute.deadline && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Срок:</span>
                    <span className="font-medium">
                      {formatDate(dispute.deadline)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Метаданные</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Создан:</span>
                  <span className="font-medium">
                    {formatDate(dispute.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Обновлен:</span>
                  <span className="font-medium">
                    {formatDate(dispute.updatedAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Сообщений:</span>
                  <span className="font-medium">
                    {dispute.messages.length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tags */}
          {dispute.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Теги</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {dispute.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>История сообщений</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dispute.messages.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Пока нет сообщений
                </p>
              ) : (
                <div className="space-y-4">
                  {dispute.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.senderType === 'user'
                          ? 'bg-primary-50 border-l-4 border-primary-500'
                          : 'bg-gray-50 border-l-4 border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {message.senderType === 'user' ? 'Вы' : 'Система'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
