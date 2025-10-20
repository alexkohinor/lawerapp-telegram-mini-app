'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HapticFeedback } from '@/components/telegram/HapticFeedback';
import { BackButton } from '@/components/telegram/BackButton';
import { useTelegramUser } from '@/hooks/useTelegramUser';

interface Dispute {
  id: string;
  title: string;
  type: string;
  icon: string;
  category: string;
  status: 'active' | 'resolved' | 'pending' | 'escalated' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  opponent: string;
  amount?: number;
  createdAt: string;
  updatedAt: string;
  description: string;
  requirements: string;
  evidence: string;
  timeline: Array<{
    id: string;
    date: string;
    action: string;
    description: string;
    status: 'completed' | 'pending' | 'in_progress';
  }>;
  nextAction?: string;
  nextActionDate?: string;
  aiAnalysis?: string;
  recommendations?: string[];
}

const MOCK_DISPUTE: Dispute = {
  id: '1',
  title: 'Спор с застройщиком по качеству квартиры',
  type: 'Гражданский спор',
  icon: '🏠',
  category: 'Недвижимость',
  status: 'active',
  priority: 'high',
  opponent: 'ООО "СтройИнвест"',
  amount: 500000,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-20T14:15:00Z',
  description: 'Обнаружены дефекты в отделке квартиры, требующие устранения. Застройщик отказывается устранять недостатки, ссылаясь на то, что они не являются существенными.',
  requirements: 'Требую устранения всех выявленных дефектов в течение 30 дней или возврата части стоимости квартиры в размере 500 000 рублей.',
  evidence: 'Фотографии дефектов, акт приема-передачи квартиры, договор долевого участия, переписка с застройщиком.',
  timeline: [
    {
      id: '1',
      date: '2024-01-15T10:30:00Z',
      action: 'Спор создан',
      description: 'Пользователь создал спор с застройщиком',
      status: 'completed'
    },
    {
      id: '2',
      date: '2024-01-16T09:15:00Z',
      action: 'AI-анализ завершен',
      description: 'AI-юрист проанализировал ситуацию и подготовил рекомендации',
      status: 'completed'
    },
    {
      id: '3',
      date: '2024-01-18T14:20:00Z',
      action: 'Претензия отправлена',
      description: 'Отправлена досудебная претензия застройщику',
      status: 'completed'
    },
    {
      id: '4',
      date: '2024-01-25T00:00:00Z',
      action: 'Ожидание ответа',
      description: 'Ожидание ответа на претензию от застройщика',
      status: 'in_progress'
    },
    {
      id: '5',
      date: '2024-02-01T00:00:00Z',
      action: 'Подача иска',
      description: 'При отсутствии ответа - подача иска в суд',
      status: 'pending'
    }
  ],
  nextAction: 'Подача иска в суд',
  nextActionDate: '2024-02-01T00:00:00Z',
  aiAnalysis: 'Анализ вашего спора показывает, что у вас есть хорошие шансы на успех. Застройщик обязан устранить недостатки в соответствии с договором долевого участия. Рекомендуется последовательность действий: претензия → суд.',
  recommendations: [
    'Собрать дополнительные доказательства дефектов (экспертиза)',
    'Подготовить исковое заявление в суд',
    'Рассмотреть возможность медиации',
    'Обратиться в Роспотребнадзор для проверки застройщика'
  ]
};

export default function DisputeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { hapticFeedback, showAlert } = useTelegramUser();
  const [dispute] = useState<Dispute>(MOCK_DISPUTE);

  const getStatusBadge = (status: Dispute['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="warning">Активный</Badge>;
      case 'pending':
        return <Badge variant="info">Ожидает</Badge>;
      case 'escalated':
        return <Badge variant="danger">Эскалирован</Badge>;
      case 'resolved':
        return <Badge variant="success">Решен</Badge>;
      case 'closed':
        return <Badge variant="secondary">Закрыт</Badge>;
      default:
        return <Badge variant="secondary">Неизвестно</Badge>;
    }
  };

  const getPriorityBadge = (priority: Dispute['priority']) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="danger" className="text-xs">СРОЧНО</Badge>;
      case 'high':
        return <Badge variant="warning" className="text-xs">ВЫСОКИЙ</Badge>;
      case 'medium':
        return <Badge variant="info" className="text-xs">СРЕДНИЙ</Badge>;
      case 'low':
        return <Badge variant="secondary" className="text-xs">НИЗКИЙ</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">НЕИЗВЕСТНО</Badge>;
    }
  };

  const getTimelineStatusBadge = (status: 'completed' | 'pending' | 'in_progress') => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" className="text-xs">Выполнено</Badge>;
      case 'in_progress':
        return <Badge variant="warning" className="text-xs">В процессе</Badge>;
      case 'pending':
        return <Badge variant="info" className="text-xs">Ожидает</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Неизвестно</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleBackToDisputes = () => {
    hapticFeedback('light');
    router.push('/disputes');
  };

  const handleEdit = () => {
    hapticFeedback('light');
    router.push(`/disputes/${dispute.id}/edit`);
  };

  const handleChat = () => {
    hapticFeedback('light');
    router.push(`/disputes/${dispute.id}/chat`);
  };

  const handleDocuments = () => {
    hapticFeedback('light');
    router.push(`/disputes/${dispute.id}/documents`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <BackButton onClick={handleBackToDisputes} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ⚖️ {dispute.title}
            </h1>
            <p className="text-gray-600">
              {formatDate(dispute.createdAt)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getPriorityBadge(dispute.priority)}
            {getStatusBadge(dispute.status)}
          </div>
        </div>

        {/* Dispute Info */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{dispute.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {dispute.type}
                </h3>
                <p className="text-sm text-gray-600">
                  {dispute.category} • Против: {dispute.opponent}
                </p>
                {dispute.amount && (
                  <p className="text-sm font-semibold text-purple-600">
                    Сумма спора: {formatAmount(dispute.amount)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Описание спора</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {dispute.description}
            </p>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ваши требования</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {dispute.requirements}
            </p>
          </CardContent>
        </Card>

        {/* Evidence */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Документы и доказательства</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {dispute.evidence}
            </p>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        {dispute.aiAnalysis && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🤖</span>
                <span>Анализ AI-юриста</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 leading-relaxed">
                  {dispute.aiAnalysis}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {dispute.recommendations && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Рекомендации</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {dispute.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Хронология спора</CardTitle>
            <CardDescription>
              История действий по разрешению спора
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dispute.timeline.map((item, index) => (
                <div key={item.id} className="flex items-start space-x-4">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    item.status === 'completed' ? 'bg-green-500' :
                    item.status === 'in_progress' ? 'bg-yellow-500' :
                    'bg-gray-300'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {item.action}
                      </h4>
                      {getTimelineStatusBadge(item.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {item.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(item.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Action */}
        {dispute.nextAction && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Следующее действие</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">
                  {dispute.nextAction}
                </h4>
                {dispute.nextActionDate && (
                  <p className="text-sm text-yellow-700">
                    Срок: {formatDate(dispute.nextActionDate)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <HapticFeedback type="medium">
            <Button
              variant="default"
              onClick={handleChat}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              💬 Чат с AI
            </Button>
          </HapticFeedback>
          
          <HapticFeedback type="light">
            <Button
              variant="outline"
              onClick={handleDocuments}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              📄 Документы
            </Button>
          </HapticFeedback>
          
          <HapticFeedback type="light">
            <Button
              variant="outline"
              onClick={handleEdit}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              ✏️ Редактировать
            </Button>
          </HapticFeedback>
        </div>

        {/* Legal Notice */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <span className="text-yellow-500 text-xl">⚠️</span>
              <div className="text-sm text-gray-600">
                <p className="font-semibold mb-1">Важная информация:</p>
                <p>
                  Анализ и рекомендации AI-юриста носят информационный характер и не заменяют 
                  профессиональную юридическую консультацию. Для сложных правовых вопросов 
                  рекомендуется обратиться к квалифицированному юристу.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}