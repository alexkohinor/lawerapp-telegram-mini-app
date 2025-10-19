'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HapticFeedback } from '@/components/telegram/HapticFeedback';
import { BackButton } from '@/components/telegram/BackButton';
import { useTelegramUser } from '@/hooks/useTelegramUser';

interface Consultation {
  id: string;
  category: string;
  categoryIcon: string;
  question: string;
  answer?: string;
  status: 'pending' | 'completed' | 'in_progress';
  createdAt: string;
  updatedAt: string;
}

const MOCK_CONSULTATIONS: Consultation[] = [
  {
    id: '1',
    category: 'Трудовое право',
    categoryIcon: '👷',
    question: 'Мой работодатель не выплачивает зарплату уже 2 месяца. Что мне делать?',
    answer: 'Согласно ст. 136 ТК РФ, заработная плата должна выплачиваться не реже чем каждые полмесяца. Рекомендую: 1) Написать претензию работодателю, 2) Обратиться в трудовую инспекцию, 3) Подать иск в суд о взыскании задолженности.',
    status: 'completed',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:45:00Z',
  },
  {
    id: '2',
    category: 'Гражданское право',
    categoryIcon: '🏠',
    question: 'Как расторгнуть договор купли-продажи квартиры, если продавец скрыл дефекты?',
    status: 'in_progress',
    createdAt: '2024-01-14T15:20:00Z',
    updatedAt: '2024-01-14T15:20:00Z',
  },
  {
    id: '3',
    category: 'Семейное право',
    categoryIcon: '👨‍��‍👧‍👦',
    question: 'Как оформить развод через суд, если есть несовершеннолетние дети?',
    status: 'pending',
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z',
  },
];

export default function ConsultationsPage() {
  const router = useRouter();
  const { hapticFeedback } = useTelegramUser();
  const [consultations] = useState<Consultation[]>(MOCK_CONSULTATIONS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'in_progress'>('all');

  const filteredConsultations = consultations.filter(consultation => 
    filter === 'all' || consultation.status === filter
  );

  const getStatusBadge = (status: Consultation['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Завершено</Badge>;
      case 'in_progress':
        return <Badge variant="warning">В процессе</Badge>;
      case 'pending':
        return <Badge variant="info">Ожидает</Badge>;
      default:
        return <Badge variant="secondary">Неизвестно</Badge>;
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

  const handleConsultationClick = (consultation: Consultation) => {
    hapticFeedback('light');
    router.push(`/consultations/${consultation.id}`);
  };

  const handleNewConsultation = () => {
    hapticFeedback('medium');
    router.push('/consultations/new');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <BackButton />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              💬 Мои консультации
            </h1>
            <p className="text-gray-600">
              История ваших обращений к AI-юристу
            </p>
          </div>
          <HapticFeedback type="medium">
            <Button
              variant="default"
              onClick={handleNewConsultation}
              className="px-6"
            >
              Новая консультация
            </Button>
          </HapticFeedback>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {consultations.length}
              </div>
              <div className="text-sm text-gray-600">Всего</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {consultations.filter(c => c.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Ожидают</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {consultations.filter(c => c.status === 'in_progress').length}
              </div>
              <div className="text-sm text-gray-600">В процессе</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {consultations.filter(c => c.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Завершено</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Все', count: consultations.length },
                { key: 'pending', label: 'Ожидают', count: consultations.filter(c => c.status === 'pending').length },
                { key: 'in_progress', label: 'В процессе', count: consultations.filter(c => c.status === 'in_progress').length },
                { key: 'completed', label: 'Завершено', count: consultations.filter(c => c.status === 'completed').length },
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

        <div className="space-y-4">
          {filteredConsultations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Нет консультаций
                </h3>
                <p className="text-gray-600 mb-4">
                  {filter === 'all' 
                    ? 'У вас пока нет консультаций. Создайте первую!'
                    : 'Нет консультаций с выбранным статусом'
                  }
                </p>
                {filter === 'all' && (
                  <HapticFeedback type="medium">
                    <Button
                      variant="default"
                      onClick={handleNewConsultation}
                    >
                      Создать консультацию
                    </Button>
                  </HapticFeedback>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredConsultations.map((consultation) => (
              <HapticFeedback key={consultation.id} type="light">
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={() => handleConsultationClick(consultation)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{consultation.categoryIcon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {consultation.category}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(consultation.createdAt)}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(consultation.status)}
                    </div>
                    
                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {consultation.question}
                    </p>
                    
                    {consultation.answer && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-green-800 line-clamp-2">
                          {consultation.answer}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </HapticFeedback>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
