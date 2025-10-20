'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  nextAction?: string;
  nextActionDate?: string;
}

const MOCK_DISPUTES: Dispute[] = [
  {
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
    description: 'Обнаружены дефекты в отделке квартиры, требующие устранения',
    nextAction: 'Подача претензии',
    nextActionDate: '2024-01-25T00:00:00Z',
  },
  {
    id: '2',
    title: 'Возврат товара ненадлежащего качества',
    type: 'Защита прав потребителей',
    icon: '🛒',
    category: 'Потребительские права',
    status: 'pending',
    priority: 'medium',
    opponent: 'Интернет-магазин "ТехноМир"',
    amount: 25000,
    createdAt: '2024-01-18T09:20:00Z',
    updatedAt: '2024-01-18T09:20:00Z',
    description: 'Товар не соответствует заявленным характеристикам',
    nextAction: 'Ожидание ответа от продавца',
    nextActionDate: '2024-01-28T00:00:00Z',
  },
  {
    id: '3',
    title: 'Трудовой спор по увольнению',
    type: 'Трудовой спор',
    icon: '👷',
    category: 'Трудовое право',
    status: 'escalated',
    priority: 'urgent',
    opponent: 'ООО "Работодатель"',
    amount: 150000,
    createdAt: '2024-01-10T16:45:00Z',
    updatedAt: '2024-01-22T11:30:00Z',
    description: 'Незаконное увольнение без выплаты компенсации',
    nextAction: 'Подача иска в суд',
    nextActionDate: '2024-01-30T00:00:00Z',
  },
  {
    id: '4',
    title: 'Спор по алиментам',
    type: 'Семейный спор',
    icon: '👨‍👩‍👧‍👦',
    category: 'Семейное право',
    status: 'resolved',
    priority: 'high',
    opponent: 'Бывший супруг',
    amount: 30000,
    createdAt: '2024-01-05T12:00:00Z',
    updatedAt: '2024-01-19T15:20:00Z',
    description: 'Взыскание задолженности по алиментам',
    nextAction: 'Документы готовы к подаче',
  },
  {
    id: '5',
    title: 'Спор с банком по кредиту',
    type: 'Банковский спор',
    icon: '🏦',
    category: 'Финансовые услуги',
    status: 'closed',
    priority: 'medium',
    opponent: 'ПАО "Сбербанк"',
    amount: 100000,
    createdAt: '2023-12-20T14:30:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    description: 'Спор по начислению процентов по кредиту',
  },
];

export default function DisputesPage() {
  const router = useRouter();
  const { hapticFeedback } = useTelegramUser();
  const [disputes] = useState<Dispute[]>(MOCK_DISPUTES);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'escalated' | 'resolved' | 'closed'>('all');

  const filteredDisputes = disputes.filter(dispute => 
    filter === 'all' || dispute.status === filter
  );

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
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

  const handleDisputeClick = (dispute: Dispute) => {
    hapticFeedback('light');
    router.push(`/disputes/${dispute.id}`);
  };

  const handleNewDispute = () => {
    hapticFeedback('medium');
    router.push('/disputes/new');
  };

  const getStatusCount = (status: Dispute['status']) => {
    return disputes.filter(dispute => dispute.status === status).length;
  };

  const getTotalAmount = () => {
    return disputes
      .filter(dispute => dispute.status === 'active' || dispute.status === 'pending' || dispute.status === 'escalated')
      .reduce((sum, dispute) => sum + (dispute.amount || 0), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <BackButton />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ⚖️ Мои споры
            </h1>
            <p className="text-gray-600">
              Управляйте вашими правовыми спорами
            </p>
          </div>
          <HapticFeedback type="medium">
            <Button
              variant="default"
              onClick={handleNewDispute}
              className="px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Новый спор
            </Button>
          </HapticFeedback>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {disputes.length}
              </div>
              <div className="text-sm text-gray-600">Всего споров</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {getStatusCount('active') + getStatusCount('pending') + getStatusCount('escalated')}
              </div>
              <div className="text-sm text-gray-600">Активных</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {getStatusCount('resolved')}
              </div>
              <div className="text-sm text-gray-600">Решено</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatAmount(getTotalAmount())}
              </div>
              <div className="text-sm text-gray-600">Сумма споров</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Все', count: disputes.length },
                { key: 'active', label: 'Активные', count: getStatusCount('active') },
                { key: 'pending', label: 'Ожидают', count: getStatusCount('pending') },
                { key: 'escalated', label: 'Эскалированы', count: getStatusCount('escalated') },
                { key: 'resolved', label: 'Решены', count: getStatusCount('resolved') },
                { key: 'closed', label: 'Закрыты', count: getStatusCount('closed') },
              ].map(({ key, label, count }) => (
                <HapticFeedback key={key} type="light">
                  <Button
                    variant={filter === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(key as typeof filter)}
                    className="relative"
                  >
                    {label}
                    {count > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="ml-2 px-1.5 py-0.5 text-xs"
                      >
                        {count}
                      </Badge>
                    )}
                  </Button>
                </HapticFeedback>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Disputes List */}
        <div className="space-y-4">
          {filteredDisputes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">⚖️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Нет споров
                </h3>
                <p className="text-gray-600 mb-4">
                  {filter === 'all' 
                    ? 'У вас пока нет споров. Создайте первый!'
                    : 'Нет споров с выбранным статусом'
                  }
                </p>
                {filter === 'all' && (
                  <HapticFeedback type="medium">
                    <Button
                      variant="default"
                      onClick={handleNewDispute}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Создать спор
                    </Button>
                  </HapticFeedback>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredDisputes.map((dispute) => (
              <HapticFeedback key={dispute.id} type="light">
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={() => handleDisputeClick(dispute)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{dispute.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {dispute.title}
                            </h3>
                            {getPriorityBadge(dispute.priority)}
                          </div>
                          <p className="text-sm text-gray-500 mb-1">
                            {dispute.type} • {dispute.opponent}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(dispute.createdAt)}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(dispute.status)}
                    </div>
                    
                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {dispute.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {dispute.amount && (
                          <div className="text-sm font-semibold text-purple-600">
                            {formatAmount(dispute.amount)}
                          </div>
                        )}
                        <Badge variant="info" className="text-xs">
                          {dispute.category}
                        </Badge>
                      </div>
                      
                      {dispute.nextAction && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            Следующее действие:
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {dispute.nextAction}
                          </p>
                          {dispute.nextActionDate && (
                            <p className="text-xs text-gray-400">
                              {formatDate(dispute.nextActionDate)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </HapticFeedback>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">🚀 Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <HapticFeedback type="light">
                <Button
                  variant="outline"
                  onClick={() => router.push('/disputes/new')}
                  className="h-auto p-4 text-left justify-start"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">⚖️</span>
                    <div>
                      <div className="font-semibold">Создать спор</div>
                      <div className="text-xs text-gray-500">Новый правовой спор</div>
                    </div>
                  </div>
                </Button>
              </HapticFeedback>
              
              <HapticFeedback type="light">
                <Button
                  variant="outline"
                  onClick={() => setFilter('active')}
                  className="h-auto p-4 text-left justify-start"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🔥</span>
                    <div>
                      <div className="font-semibold">Активные споры</div>
                      <div className="text-xs text-gray-500">{getStatusCount('active')} споров</div>
                    </div>
                  </div>
                </Button>
              </HapticFeedback>
              
              <HapticFeedback type="light">
                <Button
                  variant="outline"
                  onClick={() => setFilter('escalated')}
                  className="h-auto p-4 text-left justify-start"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🚨</span>
                    <div>
                      <div className="font-semibold">Эскалированные</div>
                      <div className="text-xs text-gray-500">{getStatusCount('escalated')} споров</div>
                    </div>
                  </div>
                </Button>
              </HapticFeedback>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}