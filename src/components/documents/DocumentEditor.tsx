'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  FileText, 
  Save, 
  Download, 
  Eye, 
  Edit3, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Settings,
  Trash2
} from 'lucide-react';

/**
 * Редактор документов
 * Основано на UI_COMPONENTS.md и FEATURE_SPECIFICATION.md
 */

interface DocumentEditorProps {
  documentId?: string;
  templateId: string;
  initialData?: Record<string, any>;
  onSave?: (document: any) => void;
  onPreview?: (document: any) => void;
  onDownload?: (document: any) => void;
  readOnly?: boolean;
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number';
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  description?: string;
}

export function DocumentEditor({
  documentId,
  templateId,
  initialData = {},
  onSave,
  onPreview,
  onDownload,
  readOnly = false,
}: DocumentEditorProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatedDocument, setGeneratedDocument] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Поля формы в зависимости от шаблона
  const formFields: FormField[] = getFormFieldsForTemplate(templateId);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));

    // Очищаем ошибку при изменении поля
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    formFields.forEach(field => {
      if (field.required && (!formData[field.name] || formData[field.name].toString().trim() === '')) {
        newErrors[field.name] = `${field.label} обязательно для заполнения`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validateForm()) {
      return;
    }

    setIsGenerating(true);
    try {
      // В реальном приложении здесь будет вызов API для генерации документа
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          data: formData,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedDocument(result.data);
        setShowPreview(true);
      } else {
        throw new Error(result.error || 'Ошибка генерации документа');
      }
    } catch (error) {
      console.error('Error generating document:', error);
      setErrors({ general: 'Ошибка при генерации документа' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (generatedDocument && onSave) {
      onSave(generatedDocument);
    }
  };

  const handlePreview = () => {
    if (generatedDocument && onPreview) {
      onPreview(generatedDocument);
    }
    setShowPreview(!showPreview);
  };

  const handleDownload = () => {
    if (generatedDocument && onDownload) {
      onDownload(generatedDocument);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={readOnly}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
                error ? 'border-red-500' : 'border-gray-300'
              } ${readOnly ? 'bg-gray-100' : ''}`}
            />
            {field.description && (
              <p className="text-xs text-gray-500">{field.description}</p>
            )}
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              disabled={readOnly}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              } ${readOnly ? 'bg-gray-100' : ''}`}
            >
              <option value="">Выберите...</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {field.description && (
              <p className="text-xs text-gray-500">{field.description}</p>
            )}
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              disabled={readOnly}
              error={error}
            />
            {field.description && (
              <p className="text-xs text-gray-500">{field.description}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={readOnly}
              error={error}
            />
            {field.description && (
              <p className="text-xs text-gray-500">{field.description}</p>
            )}
          </div>
        );

      default:
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={readOnly}
              error={error}
            />
            {field.description && (
              <p className="text-xs text-gray-500">{field.description}</p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Редактор документов</span>
          </CardTitle>
          <CardDescription>
            Заполните форму для генерации правового документа
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Форма */}
      <Card>
        <CardHeader>
          <CardTitle>Данные документа</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {formFields.map(renderField)}

          {/* Общие ошибки */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || readOnly}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Генерация...
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Сгенерировать документ
                </>
              )}
            </Button>

            {generatedDocument && (
              <>
                <Button
                  onClick={handlePreview}
                  variant="outline"
                  disabled={readOnly}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? 'Скрыть' : 'Предпросмотр'}
                </Button>

                <Button
                  onClick={handleSave}
                  variant="outline"
                  disabled={readOnly}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить
                </Button>

                <Button
                  onClick={handleDownload}
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Скачать
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Предпросмотр документа */}
      {showPreview && generatedDocument && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Предпросмотр документа</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: generatedDocument.content }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Информация о документе */}
      {generatedDocument && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Информация о документе</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">ID документа:</span>
                <p className="text-gray-600">{generatedDocument.id}</p>
              </div>
              <div>
                <span className="font-medium">Дата создания:</span>
                <p className="text-gray-600">
                  {new Date(generatedDocument.metadata.generatedAt).toLocaleString('ru-RU')}
                </p>
              </div>
              <div>
                <span className="font-medium">Шаблон:</span>
                <p className="text-gray-600">{generatedDocument.metadata.templateId}</p>
              </div>
              <div>
                <span className="font-medium">Версия:</span>
                <p className="text-gray-600">{generatedDocument.metadata.version}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Получение полей формы для шаблона
 */
function getFormFieldsForTemplate(templateId: string): FormField[] {
  const templates: Record<string, FormField[]> = {
    consumer_claim: [
      {
        name: 'seller_name',
        label: 'Название продавца/организации',
        type: 'text',
        required: true,
        placeholder: 'ООО "Название компании"',
        description: 'Полное наименование продавца товара или услуги',
      },
      {
        name: 'product_description',
        label: 'Описание товара/услуги',
        type: 'textarea',
        required: true,
        placeholder: 'Подробное описание приобретенного товара или услуги',
        description: 'Укажите модель, артикул, характеристики товара',
      },
      {
        name: 'problem_description',
        label: 'Описание проблемы',
        type: 'textarea',
        required: true,
        placeholder: 'Подробно опишите возникшую проблему',
        description: 'Опишите, в чем заключается нарушение ваших прав',
      },
      {
        name: 'demands',
        label: 'Ваши требования',
        type: 'textarea',
        required: true,
        placeholder: 'Укажите, что вы требуете от продавца',
        description: 'Например: возврат денег, замена товара, устранение недостатков',
      },
      {
        name: 'purchase_date',
        label: 'Дата покупки',
        type: 'date',
        required: false,
        description: 'Дата приобретения товара или услуги',
      },
      {
        name: 'receipt_number',
        label: 'Номер чека/документа',
        type: 'text',
        required: false,
        placeholder: 'Номер чека или другого документа о покупке',
      },
    ],
    labor_lawsuit: [
      {
        name: 'employer_name',
        label: 'Название работодателя',
        type: 'text',
        required: true,
        placeholder: 'ООО "Название компании"',
        description: 'Полное наименование организации-работодателя',
      },
      {
        name: 'position',
        label: 'Должность',
        type: 'text',
        required: true,
        placeholder: 'Ваша должность в организации',
        description: 'Должность, которую вы занимали',
      },
      {
        name: 'employment_period',
        label: 'Период работы',
        type: 'text',
        required: true,
        placeholder: 'с 01.01.2020 по 31.12.2023',
        description: 'Период трудовых отношений',
      },
      {
        name: 'violation_description',
        label: 'Описание нарушения',
        type: 'textarea',
        required: true,
        placeholder: 'Подробно опишите нарушение трудовых прав',
        description: 'Опишите, какие права были нарушены',
      },
      {
        name: 'demands',
        label: 'Ваши требования',
        type: 'textarea',
        required: true,
        placeholder: 'Укажите, что вы требуете',
        description: 'Например: восстановление на работе, взыскание зарплаты',
      },
      {
        name: 'salary_amount',
        label: 'Размер заработной платы',
        type: 'number',
        required: false,
        placeholder: '50000',
        description: 'Размер заработной платы в рублях',
      },
    ],
  };

  return templates[templateId] || [];
}
