'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HapticFeedback } from '@/components/telegram/HapticFeedback';
import { 
  MessageSquare, 
  ArrowLeft, 
  Send, 
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lightbulb,
  BookOpen,
  Scale,
  Home,
  Heart,
  ShoppingCart,
  Shield
} from 'lucide-react';

const LEGAL_CATEGORIES = [
  { id: 'трудовое право', name: 'Трудовое право', icon: <Scale className="w-5 h-5" />, description: 'Трудовые споры, увольнения, зарплата' },
  { id: 'жилищное право', name: 'Жилищное право', icon: <Home className="w-5 h-5" />, description: 'Квартиры, коммунальные услуги, соседи' },
  { id: 'семейное право', name: 'Семейное право', icon: <Heart className="w-5 h-5" />, description: 'Развод, алименты, опека' },
  { id: 'гражданское право', name: 'Гражданское право', icon: <BookOpen className="w-5 h-5" />, description: 'Договоры, сделки, наследство' },
  { id: 'защита прав потребителей', name: 'Защита прав потребителей', icon: <ShoppingCart className="w-5 h-5" />, description: 'Возврат товаров, некачественные услуги' },
  { id: 'уголовное право', name: 'Уголовное право', icon: <Shield className="w-5 h-5" />, description: 'Преступления, защита по уголовным делам' },
  { id: 'административное право', name: 'Административное право', icon: <Scale className="w-5 h-5" />, description: 'Штрафы, административные нарушения' }
];

export default function NewConsultationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useUser();
  const { showAlert } = useTelegramUser();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [query, setQuery] = useState('');
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    if (!query.trim()) {
      showAlert('Пожалуйста, опишите ваш вопрос');
      return;
    }

    if (!selectedCategory) {
      showAlert('Пожалуйста, выберите категорию права');
      return;
    }

    if (!user?.id) {
      showAlert('Ошибка аутентификации');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/ai/consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          query: query.trim(),
          category: selectedCategory,
          context: context.trim() || undefined
        }),
      });

      const result = await response.json();

      if (result.success) {
        showAlert('Консультация создана успешно!');
        router.push(`/consultations/${result.data.id}`);
      } else {
        showAlert(result.error || 'Ошибка при создании консультации');
      }
    } catch (error) {
      console.error('Error creating consultation:', error);
      showAlert('Ошибка сети при создании консультации');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = LEGAL_CATEGORIES.find(cat => cat.id === categoryId);
    return category?.icon || <MessageSquare className="w-5 h-5" />;
  };

  const getCategoryDescription = (categoryId: string) => {
    const category = LEGAL_CATEGORIES.find(cat => cat.id === categoryId);
    return category?.description || '';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Доступ ограничен</CardTitle>
            <CardDescription className="text-center">
              Необходима авторизация для создания консультации
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="p-4 space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <HapticFeedback impact="light">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Назад</span>
            </Button>
          </HapticFeedback>
          <h1 className="text-2xl font-bold text-gray-900">
            Новая AI Консультация
          </h1>
        </div>

        {/* Category Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Scale className="w-6 h-6 text-blue-600" />
              <span>Выберите категорию права</span>
            </CardTitle>
            <CardDescription>
              Это поможет AI дать более точный и релевантный ответ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {LEGAL_CATEGORIES.map((category) => (
                <HapticFeedback key={category.id} impact="light">
                  <Card
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      selectedCategory === category.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          selectedCategory === category.id 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {category.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {category.name}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {category.description}
                          </p>
                        </div>
                        {selectedCategory === category.id && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </HapticFeedback>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Category Info */}
        {selectedCategory && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                  {getCategoryIcon(selectedCategory)}
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">
                    {LEGAL_CATEGORIES.find(cat => cat.id === selectedCategory)?.name}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {getCategoryDescription(selectedCategory)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Query Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-6 h-6 text-green-600" />
              <span>Опишите вашу ситуацию</span>
            </CardTitle>
            <CardDescription>
              Чем подробнее вы опишете ситуацию, тем точнее будет ответ AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ваш вопрос *
              </label>
              <textarea
                placeholder="Например: Мой работодатель не выплачивает зарплату уже 2 месяца. Что я могу сделать?"
                value={query}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] resize-none"
                maxLength={2000}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Минимум 10 символов для качественного ответа
                </p>
                <span className="text-xs text-gray-500">
                  {query.length}/2000
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дополнительный контекст (необязательно)
              </label>
              <textarea
                placeholder="Дополнительная информация, которая может помочь в решении вопроса..."
                value={context}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContext(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px] resize-none"
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Документы, даты, имена, суммы и т.д.
                </p>
                <span className="text-xs text-gray-500">
                  {context.length}/1000
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-800">
              <Lightbulb className="w-5 h-5" />
              <span>Советы для лучшего ответа</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-yellow-700">
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Укажите конкретные даты, суммы, имена</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Опишите последовательность событий</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Упомяните имеющиеся документы</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Сформулируйте конкретный вопрос</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="space-y-4">
          <Button
            variant="gradient"
            size="xl"
            onClick={handleSubmit}
            disabled={isSubmitting || !query.trim() || !selectedCategory || query.length < 10}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Генерируем ответ...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Получить AI консультацию
              </>
            )}
          </Button>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Ответ будет сгенерирован с использованием GPT-4 и российского законодательства
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
