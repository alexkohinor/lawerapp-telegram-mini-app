'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HapticFeedback } from '@/components/telegram/HapticFeedback';
import { BackButton } from '@/components/telegram/BackButton';
import { useTelegramUser } from '@/hooks/useTelegramUser';

const DISPUTE_TYPES = [
  {
    id: 'civil',
    name: 'Гражданский спор',
    icon: '🏠',
    description: 'Споры по договорам, недвижимости, имуществу',
    category: 'Гражданское право',
    fields: [
      { name: 'contract_type', label: 'Тип договора', type: 'select', options: ['Купля-продажа', 'Аренда', 'Подряд', 'Услуги', 'Другое'], required: true },
      { name: 'dispute_subject', label: 'Предмет спора', type: 'text', required: true },
      { name: 'amount', label: 'Сумма спора', type: 'number', required: false },
      { name: 'contract_date', label: 'Дата заключения договора', type: 'date', required: false },
    ]
  },
  {
    id: 'labor',
    name: 'Трудовой спор',
    icon: '👷',
    description: 'Споры с работодателем, увольнения, зарплата',
    category: 'Трудовое право',
    fields: [
      { name: 'employer_name', label: 'Наименование работодателя', type: 'text', required: true },
      { name: 'position', label: 'Должность', type: 'text', required: true },
      { name: 'dispute_type', label: 'Тип спора', type: 'select', options: ['Невыплата зарплаты', 'Незаконное увольнение', 'Нарушение условий труда', 'Другое'], required: true },
      { name: 'employment_date', label: 'Дата трудоустройства', type: 'date', required: false },
    ]
  },
  {
    id: 'consumer',
    name: 'Защита прав потребителей',
    icon: '🛒',
    description: 'Споры с продавцами, возврат товаров, качество',
    category: 'Потребительские права',
    fields: [
      { name: 'seller_name', label: 'Наименование продавца', type: 'text', required: true },
      { name: 'product_name', label: 'Наименование товара', type: 'text', required: true },
      { name: 'purchase_date', label: 'Дата покупки', type: 'date', required: true },
      { name: 'defect_description', label: 'Описание дефекта', type: 'textarea', required: true },
    ]
  },
  {
    id: 'family',
    name: 'Семейный спор',
    icon: '👨‍👩‍👧‍👦',
    description: 'Разводы, алименты, раздел имущества',
    category: 'Семейное право',
    fields: [
      { name: 'dispute_type', label: 'Тип спора', type: 'select', options: ['Развод', 'Алименты', 'Раздел имущества', 'Опека над детьми', 'Другое'], required: true },
      { name: 'marriage_date', label: 'Дата заключения брака', type: 'date', required: false },
      { name: 'children_count', label: 'Количество детей', type: 'number', required: false },
      { name: 'property_value', label: 'Стоимость имущества', type: 'number', required: false },
    ]
  },
  {
    id: 'banking',
    name: 'Банковский спор',
    icon: '🏦',
    description: 'Споры с банками, кредиты, вклады',
    category: 'Финансовые услуги',
    fields: [
      { name: 'bank_name', label: 'Наименование банка', type: 'text', required: true },
      { name: 'service_type', label: 'Тип услуги', type: 'select', options: ['Кредит', 'Вклад', 'Карта', 'Переводы', 'Другое'], required: true },
      { name: 'contract_number', label: 'Номер договора', type: 'text', required: false },
      { name: 'dispute_amount', label: 'Сумма спора', type: 'number', required: false },
    ]
  },
  {
    id: 'administrative',
    name: 'Административный спор',
    icon: '🏛️',
    description: 'Споры с госорганами, штрафы, лицензии',
    category: 'Административное право',
    fields: [
      { name: 'authority_name', label: 'Наименование органа', type: 'text', required: true },
      { name: 'violation_type', label: 'Тип нарушения', type: 'select', options: ['Штраф', 'Лишение лицензии', 'Отказ в услуге', 'Другое'], required: true },
      { name: 'violation_date', label: 'Дата нарушения', type: 'date', required: false },
      { name: 'fine_amount', label: 'Размер штрафа', type: 'number', required: false },
    ]
  },
];

export default function NewDisputePage() {
  const router = useRouter();
  const { hapticFeedback, showAlert } = useTelegramUser();
  const [selectedType, setSelectedType] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});
  const [isCreating, setIsCreating] = useState(false);

  const selectedTypeData = DISPUTE_TYPES.find(type => type.id === selectedType);

  const handleTypeSelect = (typeId: string) => {
    hapticFeedback('light');
    setSelectedType(typeId);
    setFormData({});
  };

  const handleFieldChange = (fieldName: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleCreate = async () => {
    if (!selectedTypeData) return;

    const requiredFields = selectedTypeData.fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.name]);

    if (missingFields.length > 0) {
      showAlert(`Пожалуйста, заполните обязательные поля: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    setIsCreating(true);
    hapticFeedback('medium');

    try {
      // Имитация создания спора
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showAlert('Спор успешно создан! AI-юрист проанализирует вашу ситуацию.');
      router.push('/disputes');
    } catch (error) {
      showAlert('Произошла ошибка при создании спора');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <BackButton />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ⚖️ Новый спор
          </h1>
          <p className="text-gray-600">
            Создайте новый правовой спор для анализа AI-юристом
          </p>
        </div>

        {/* Type Selection */}
        {!selectedType && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Выберите тип спора</CardTitle>
              <CardDescription>
                Выберите подходящую категорию для вашего спора
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DISPUTE_TYPES.map((type) => (
                  <HapticFeedback key={type.id} type="light">
                    <button
                      onClick={() => handleTypeSelect(type.id)}
                      className="p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm transition-all duration-200 text-left"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{type.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {type.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {type.description}
                          </p>
                          <Badge variant="info" className="text-xs">
                            {type.category}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  </HapticFeedback>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        {selectedTypeData && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>{selectedTypeData.icon}</span>
                <span>{selectedTypeData.name}</span>
              </CardTitle>
              <CardDescription>
                Заполните информацию о вашем споре
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedTypeData.fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder={`Введите ${field.label.toLowerCase()}`}
                      />
                    )}
                    
                    {field.type === 'number' && (
                      <input
                        type="number"
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || 0)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder={`Введите ${field.label.toLowerCase()}`}
                      />
                    )}
                    
                    {field.type === 'date' && (
                      <input
                        type="date"
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    )}
                    
                    {field.type === 'textarea' && (
                      <textarea
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        placeholder={`Опишите ${field.label.toLowerCase()}`}
                      />
                    )}
                    
                    {field.type === 'select' && (
                      <select
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Выберите опцию</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        {selectedTypeData && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Дополнительная информация</CardTitle>
              <CardDescription>
                Опишите подробности вашего спора
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание ситуации
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Подробно опишите ситуацию, которая привела к спору..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ваши требования
                  </label>
                  <textarea
                    value={formData.requirements || ''}
                    onChange={(e) => handleFieldChange('requirements', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Что вы хотите получить в результате разрешения спора?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Документы и доказательства
                  </label>
                  <textarea
                    value={formData.evidence || ''}
                    onChange={(e) => handleFieldChange('evidence', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Перечислите имеющиеся у вас документы, фотографии, свидетельские показания..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Button */}
        {selectedTypeData && (
          <div className="text-center mb-6">
            <HapticFeedback type="medium">
              <Button
                variant="default"
                size="xl"
                onClick={handleCreate}
                loading={isCreating}
                disabled={isCreating}
                className="px-8 py-4 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isCreating ? 'Создаем спор...' : 'Создать спор'}
              </Button>
            </HapticFeedback>
          </div>
        )}

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💡 Советы по созданию спора</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-purple-500 mt-1">✓</span>
                <span>Опишите ситуацию максимально подробно и объективно</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-500 mt-1">✓</span>
                <span>Укажите точные даты, суммы и факты</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-500 mt-1">✓</span>
                <span>Приложите все имеющиеся документы</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-500 mt-1">✓</span>
                <span>Сформулируйте четкие требования</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-500 mt-1">✓</span>
                <span>AI-юрист проанализирует ваш случай и предложит план действий</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}