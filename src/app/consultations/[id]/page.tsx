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
  followUpQuestions?: string[];
}

const MOCK_CONSULTATION: Consultation = {
  id: '1',
  category: 'Трудовое право',
  categoryIcon: '👷',
  question: 'Мой работодатель не выплачивает зарплату уже 2 месяца. Что мне делать?',
  answer: `Согласно ст. 136 ТК РФ, заработная плата должна выплачиваться не реже чем каждые полмесяца. В вашей ситуации рекомендую следующие действия:

**1. Досудебное урегулирование:**
- Напишите письменную претензию работодателю с требованием выплатить задолженность
- Укажите точную сумму задолженности и сроки выплаты
- Сохраните копию претензии и доказательства её отправки

**2. Обращение в контролирующие органы:**
- Подайте жалобу в Государственную инспекцию труда
- Обратитесь в прокуратуру по месту нахождения работодателя
- Подайте заявление в Роструд через официальный сайт

**3. Судебная защита:**
- Подайте иск в суд о взыскании задолженности по заработной плате
- Требуйте компенсацию морального вреда
- Подайте заявление о банкротстве работодателя (если есть признаки)

**Важные документы:**
- Трудовой договор
- Документы о размере заработной платы
- Справки о невыплаченной зарплате
- Переписка с работодателем

**Сроки:**
- Иск можно подать в течение 3 месяцев с момента нарушения
- Работодатель обязан выплатить задолженность в течение 15 дней после требования`,
  status: 'completed',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:45:00Z',
  followUpQuestions: [
    'Как правильно составить претензию работодателю?',
    'Какие документы нужны для подачи иска в суд?',
    'Можно ли требовать компенсацию морального вреда?',
    'Что делать, если работодатель объявил себя банкротом?',
  ],
};

export default function ConsultationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { hapticFeedback, showAlert } = useTelegramUser();
  const [consultation] = useState<Consultation>(MOCK_CONSULTATION);
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);

  const getStatusBadge = (status: Consultation['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Завершено</Badge>;
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
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFollowUpQuestion = (question: string) => {
    hapticFeedback('light');
    setIsAskingFollowUp(true);
    
    // Имитация отправки дополнительного вопроса
    setTimeout(() => {
      showAlert('Дополнительный вопрос отправлен! AI-юрист готовит ответ...');
      setIsAskingFollowUp(false);
    }, 2000);
  };

  const handleNewConsultation = () => {
    hapticFeedback('medium');
    router.push('/consultations/new');
  };

  const handleBackToConsultations = () => {
    hapticFeedback('light');
    router.push('/consultations');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <BackButton onClick={handleBackToConsultations} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              💬 Консультация #{consultation.id}
            </h1>
            <p className="text-gray-600">
              {formatDate(consultation.createdAt)}
            </p>
          </div>
          {getStatusBadge(consultation.status)}
        </div>

        {/* Category */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{consultation.categoryIcon}</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {consultation.category}
                </h3>
                <p className="text-sm text-gray-600">
                  Категория права
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>❓</span>
              <span>Ваш вопрос</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-800 leading-relaxed">
                {consultation.question}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Answer */}
        {consultation.answer ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🤖</span>
                <span>Ответ AI-юриста</span>
              </CardTitle>
              <CardDescription>
                Ответ подготовлен на основе российского законодательства
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="prose prose-sm max-w-none">
                  {consultation.answer.split('\n').map((paragraph, index) => {
                    if (paragraph.trim() === '') return <br key={index} />;
                    
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return (
                        <h4 key={index} className="font-semibold text-green-900 mt-4 mb-2">
                          {paragraph.slice(2, -2)}
                        </h4>
                      );
                    }
                    
                    return (
                      <p key={index} className="text-green-800 leading-relaxed mb-2">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI-юрист готовит ответ
              </h3>
              <p className="text-gray-600">
                Обычно это занимает 1-2 минуты
              </p>
            </CardContent>
          </Card>
        )}

        {/* Follow-up Questions */}
        {consultation.answer && consultation.followUpQuestions && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>💡</span>
                <span>Дополнительные вопросы</span>
              </CardTitle>
              <CardDescription>
                Возможно, вас заинтересуют эти уточняющие вопросы
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {consultation.followUpQuestions.map((question, index) => (
                  <HapticFeedback key={index} type="light">
                    <button
                      onClick={() => handleFollowUpQuestion(question)}
                      disabled={isAskingFollowUp}
                      className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                    >
                      <p className="text-sm text-gray-700">
                        {question}
                      </p>
                    </button>
                  </HapticFeedback>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <HapticFeedback type="medium">
            <Button
              variant="gradient"
              onClick={handleNewConsultation}
              className="flex-1"
            >
              Новая консультация
            </Button>
          </HapticFeedback>
          
          <HapticFeedback type="light">
            <Button
              variant="outline"
              onClick={handleBackToConsultations}
              className="flex-1"
            >
              Все консультации
            </Button>
          </HapticFeedback>
        </div>

        {/* Legal Notice */}
        <Card className="mt-8">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <span className="text-yellow-500 text-xl">⚠️</span>
              <div className="text-sm text-gray-600">
                <p className="font-semibold mb-1">Важная информация:</p>
                <p>
                  Ответы AI-юриста носят информационный характер и не заменяют 
                  профессиональную юридическую консультацию. Для сложных правовых 
                  вопросов рекомендуется обратиться к квалифицированному юристу.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}