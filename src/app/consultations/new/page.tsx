'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HapticFeedback } from '@/components/telegram/HapticFeedback';
import { BackButton } from '@/components/telegram/BackButton';
import { useTelegramUser } from '@/hooks/useTelegramUser';

const LEGAL_CATEGORIES = [
  { id: 'labor', name: 'Трудовое право', icon: '👷', description: 'Трудовые споры, увольнения, зарплата' },
  { id: 'civil', name: 'Гражданское право', icon: '🏠', description: 'Договоры, сделки, имущество' },
  { id: 'family', name: 'Семейное право', icon: '👨‍👩‍👧‍👦', description: 'Разводы, алименты, опека' },
  { id: 'criminal', name: 'Уголовное право', icon: '⚖️', description: 'Преступления, защита, обвинения' },
  { id: 'administrative', name: 'Административное право', icon: '🏛️', description: 'Штрафы, лицензии, госуслуги' },
  { id: 'tax', name: 'Налоговое право', icon: '💰', description: 'Налоги, декларации, проверки' },
  { id: 'consumer', name: 'Защита прав потребителей', icon: '🛒', description: 'Возвраты, гарантии, качество' },
  { id: 'business', name: 'Предпринимательское право', icon: '🏢', description: 'Бизнес, регистрация, лицензии' },
];

export default function NewConsultationPage() {
  const router = useRouter();
  const { hapticFeedback, showAlert } = useTelegramUser();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCategorySelect = (categoryId: string) => {
    hapticFeedback('light');
    setSelectedCategory(categoryId);
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !question.trim()) {
      showAlert('Пожалуйста, выберите категорию и задайте вопрос');
      return;
    }

    setIsLoading(true);
    hapticFeedback('medium');

    try {
      // Имитация отправки запроса
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showAlert('Ваш вопрос отправлен! AI-юрист готовит ответ...');
      router.push('/consultations');
    } catch {
      showAlert('Произошла ошибка при отправке вопроса');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategoryData = LEGAL_CATEGORIES.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <BackButton />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💬 AI Консультация
          </h1>
          <p className="text-gray-600">
            Получите профессиональную правовую помощь от ИИ-юриста
          </p>
        </div>

        {/* Category Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Выберите категорию права</CardTitle>
            <CardDescription>
              Это поможет AI-юристу дать более точный ответ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LEGAL_CATEGORIES.map((category) => (
                <HapticFeedback key={category.id} type="light">
                  <button
                    onClick={() => handleCategorySelect(category.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedCategory === category.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {category.description}
                        </p>
                      </div>
                      {selectedCategory === category.id && (
                        <Badge variant="info">Выбрано</Badge>
                      )}
                    </div>
                  </button>
                </HapticFeedback>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Question Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Опишите вашу ситуацию</CardTitle>
            <CardDescription>
              Чем подробнее вы опишете ситуацию, тем точнее будет ответ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Например: Мой работодатель не выплачивает зарплату уже 2 месяца. Что мне делать?"
              className="w-full h-32 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                {question.length}/1000 символов
              </p>
              {question.length > 100 && (
                <Badge variant="success">Достаточно подробно</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Selected Category Summary */}
        {selectedCategoryData && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>{selectedCategoryData.icon}</span>
                <span>Выбранная категория</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-1">
                  {selectedCategoryData.name}
                </h3>
                <p className="text-blue-700 text-sm">
                  {selectedCategoryData.description}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="text-center">
          <HapticFeedback type="medium">
            <Button
              variant="default"
              size="xl"
              onClick={handleSubmit}
              loading={isLoading}
              disabled={!selectedCategory || !question.trim() || isLoading}
              className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isLoading ? 'Отправляем вопрос...' : 'Получить консультацию'}
            </Button>
          </HapticFeedback>
        </div>

        {/* Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">💡 Советы для лучшего ответа</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Опишите ситуацию максимально подробно</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Укажите важные даты и сроки</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Приложите документы, если есть</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Задайте конкретные вопросы</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}