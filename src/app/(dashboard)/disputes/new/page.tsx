'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HapticFeedback } from '@/components/telegram/HapticFeedback';
import { 
  Scale, 
  ArrowLeft, 
  Save,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  Lightbulb,
  DollarSign,
  Calendar,
  Tag,
  FileText
} from 'lucide-react';

const DISPUTE_TYPES = [
  { 
    id: 'CONSUMER_RIGHTS', 
    name: 'Защита прав потребителей', 
    description: 'Возврат товаров, некачественные услуги',
    icon: <AlertCircle className="w-5 h-5" />,
    color: 'bg-purple-100 text-purple-800'
  },
  { 
    id: 'CONTRACT_DISPUTE', 
    name: 'Договорной спор', 
    description: 'Нарушение условий договора',
    icon: <FileText className="w-5 h-5" />,
    color: 'bg-indigo-100 text-indigo-800'
  },
  { 
    id: 'SERVICE_QUALITY', 
    name: 'Качество услуг', 
    description: 'Плохое качество оказанных услуг',
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'bg-teal-100 text-teal-800'
  },
  { 
    id: 'DELIVERY_ISSUE', 
    name: 'Проблема с доставкой', 
    description: 'Задержки, повреждения при доставке',
    icon: <Clock className="w-5 h-5" />,
    color: 'bg-orange-100 text-orange-800'
  },
  { 
    id: 'OTHER', 
    name: 'Прочее', 
    description: 'Другие виды споров',
    icon: <Scale className="w-5 h-5" />,
    color: 'bg-gray-100 text-gray-800'
  }
];

const PRIORITY_LEVELS = [
  { id: 'low', name: 'Низкий', description: 'Не срочно', color: 'bg-gray-100 text-gray-800' },
  { id: 'medium', name: 'Средний', description: 'Обычная важность', color: 'bg-blue-100 text-blue-800' },
  { id: 'high', name: 'Высокий', description: 'Срочно', color: 'bg-red-100 text-red-800' }
];

interface DisputeFormData {
  title: string;
  description: string;
  type: string;
  priority: string;
  estimatedValue: string;
  deadline: string;
}

export default function NewDisputePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useUser();
  const { showAlert } = useTelegramUser();
  
  const [formData, setFormData] = useState<DisputeFormData>({
    title: '',
    description: '',
    type: '',
    priority: 'medium',
    estimatedValue: '',
    deadline: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (field: keyof DisputeFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      showAlert('Пожалуйста, укажите название спора');
      return;
    }

    if (!formData.description.trim()) {
      showAlert('Пожалуйста, опишите суть спора');
      return;
    }

    if (!formData.type) {
      showAlert('Пожалуйста, выберите тип спора');
      return;
    }

    if (!user?.id) {
      showAlert('Ошибка аутентификации');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/disputes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          title: formData.title.trim(),
          description: formData.description.trim(),
          type: formData.type,
          priority: formData.priority,
          estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
        }),
      });

      const result = await response.json();

      if (result.success) {
        showAlert('Спор создан успешно!');
        router.push(`/disputes/${result.data.id}`);
      } else {
        showAlert(result.error || 'Ошибка при создании спора');
      }
    } catch (error) {
      console.error('Error creating dispute:', error);
      showAlert('Ошибка сети при создании спора');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedType = () => {
    return DISPUTE_TYPES.find(t => t.id === formData.type);
  };

  const getSelectedPriority = () => {
    return PRIORITY_LEVELS.find(p => p.id === formData.priority);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Доступ ограничен</CardTitle>
            <CardDescription className="text-center">
              Необходима авторизация для создания спора
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
            Новый спор
          </h1>
        </div>

        {/* Dispute Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Scale className="w-6 h-6 text-blue-600" />
              <span>Тип спора</span>
            </CardTitle>
            <CardDescription>
              Выберите категорию, которая лучше всего описывает ваш спор
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DISPUTE_TYPES.map((type) => (
                <HapticFeedback key={type.id} impact="light">
                  <Card
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      formData.type === type.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleFieldChange('type', type.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          formData.type === type.id 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {type.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {type.name}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {type.description}
                          </p>
                        </div>
                        {formData.type === type.id && (
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

        {/* Selected Type Info */}
        {formData.type && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                  {getSelectedType()?.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">
                    {getSelectedType()?.name}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {getSelectedType()?.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-green-600" />
              <span>Основная информация</span>
            </CardTitle>
            <CardDescription>
              Опишите суть спора и укажите важные детали
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название спора *
              </label>
              <input
                type="text"
                placeholder="Краткое описание спора..."
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={100}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Краткое и понятное название
                </p>
                <span className="text-xs text-gray-500">
                  {formData.title.length}/100
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание спора *
              </label>
              <textarea
                placeholder="Подробно опишите ситуацию, что произошло, какие права нарушены..."
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] resize-none"
                maxLength={2000}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Чем подробнее описание, тем лучше
                </p>
                <span className="text-xs text-gray-500">
                  {formData.description.length}/2000
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Tag className="w-6 h-6 text-purple-600" />
              <span>Дополнительные детали</span>
            </CardTitle>
            <CardDescription>
              Укажите приоритет и другие важные параметры
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Приоритет
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRIORITY_LEVELS.map((priority) => (
                  <HapticFeedback key={priority.id} impact="light">
                    <Card
                      className={`cursor-pointer transition-all duration-300 ${
                        formData.priority === priority.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleFieldChange('priority', priority.id)}
                    >
                      <CardContent className="p-3 text-center">
                        <h4 className="font-semibold text-sm text-gray-900">
                          {priority.name}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {priority.description}
                        </p>
                      </CardContent>
                    </Card>
                  </HapticFeedback>
                ))}
              </div>
            </div>

            {/* Estimated Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Оценочная стоимость спора (руб.)
              </label>
              <input
                type="number"
                placeholder="0"
                value={formData.estimatedValue}
                onChange={(e) => handleFieldChange('estimatedValue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">
                Сумма ущерба или спорная сумма (необязательно)
              </p>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дедлайн (если есть)
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => handleFieldChange('deadline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500 mt-1">
                Дата, до которой нужно решить спор
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-800">
              <Lightbulb className="w-5 h-5" />
              <span>Советы для эффективного спора</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-yellow-700">
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Соберите все документы и доказательства</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Укажите конкретные даты и факты</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Сформулируйте четкие требования</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Приложите фотографии, чеки, переписку</span>
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
            disabled={isSubmitting || !formData.title.trim() || !formData.description.trim() || !formData.type}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Создаем спор...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Создать спор
              </>
            )}
          </Button>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              После создания спора вы сможете прикреплять документы и отслеживать прогресс
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
