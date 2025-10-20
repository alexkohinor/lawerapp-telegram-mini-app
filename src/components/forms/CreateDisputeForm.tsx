'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateDisputeSchema, type CreateDisputeRequest } from '@/lib/validations/dispute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Scale, 
  Calendar, 
  DollarSign, 
  Tag, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

/**
 * Форма для создания нового спора
 * Основано на FEATURE_SPECIFICATION.md
 */

interface CreateDisputeFormProps {
  onSubmit: (data: CreateDisputeRequest) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const disputeTypes = [
  { value: 'consumer_protection', label: 'Защита прав потребителей' },
  { value: 'labor', label: 'Трудовое право' },
  { value: 'contract', label: 'Договорные отношения' },
  { value: 'property', label: 'Недвижимость' },
  { value: 'family', label: 'Семейное право' },
  { value: 'criminal', label: 'Уголовное право' },
  { value: 'administrative', label: 'Административное право' },
];

const legalCategories = [
  { value: 'civil', label: 'Гражданское право' },
  { value: 'criminal', label: 'Уголовное право' },
  { value: 'administrative', label: 'Административное право' },
  { value: 'labor', label: 'Трудовое право' },
  { value: 'family', label: 'Семейное право' },
  { value: 'tax', label: 'Налоговое право' },
  { value: 'corporate', label: 'Корпоративное право' },
];

const priorityLevels = [
  { value: 'low', label: 'Низкий', color: 'text-gray-600' },
  { value: 'medium', label: 'Средний', color: 'text-blue-600' },
  { value: 'high', label: 'Высокий', color: 'text-orange-600' },
  { value: 'urgent', label: 'Срочный', color: 'text-red-600' },
];

export function CreateDisputeForm({ onSubmit, onCancel, isLoading = false }: CreateDisputeFormProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<CreateDisputeRequest>({
    resolver: zodResolver(CreateDisputeSchema),
    defaultValues: {
      priority: 'medium',
      currency: 'RUB',
      tags: [],
    },
  });

  const watchedType = watch('type');
  const watchedCategory = watch('category');

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    setValue('tags', updatedTags);
  };

  const handleFormSubmit = async (data: CreateDisputeRequest) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Scale className="w-5 h-5" />
          <span>Создание нового спора</span>
        </CardTitle>
        <CardDescription>
          Заполните форму для создания правового спора
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Основная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Основная информация</h3>
            
            <div>
              <Input
                label="Название спора"
                placeholder="Краткое описание проблемы"
                {...register('title')}
                error={errors.title?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                {...register('description')}
                placeholder="Подробное описание ситуации..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={4}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Тип и категория */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Классификация</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип спора
                </label>
                <select
                  {...register('type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Выберите тип</option>
                  {disputeTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Правовая категория
                </label>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Выберите категорию</option>
                  {legalCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Приоритет и сумма */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Дополнительные параметры</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Приоритет
                </label>
                <select
                  {...register('priority')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {priorityLevels.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
                {errors.priority && (
                  <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
                )}
              </div>

              <div>
                <Input
                  label="Сумма спора (₽)"
                  type="number"
                  placeholder="0"
                  {...register('amount', { valueAsNumber: true })}
                  error={errors.amount?.message}
                  leftIcon={<DollarSign className="w-4 h-4" />}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Срок решения (необязательно)
              </label>
              <Input
                type="date"
                {...register('deadline', { valueAsDate: true })}
                error={errors.deadline?.message}
                leftIcon={<Calendar className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Теги */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Теги</h3>
            
            <div className="flex space-x-2">
              <Input
                placeholder="Добавить тег"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                leftIcon={<Tag className="w-4 h-4" />}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!newTag.trim() || tags.length >= 10}
              >
                Добавить
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-500">
              Максимум 10 тегов. Используйте теги для быстрого поиска и категоризации.
            </p>
          </div>

          {/* Кнопки */}
          <div className="flex space-x-4 pt-4">
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Создать спор
                </>
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Отмена
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
