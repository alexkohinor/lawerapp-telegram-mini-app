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
  FileText, 
  ArrowLeft, 
  Sparkles,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Loader2,
  Scale,
  AlertCircle,
  BookOpen,
  Shield,
  ShoppingCart,
  Home,
  Heart
} from 'lucide-react';

const DOCUMENT_TEMPLATES = [
  { 
    id: 'CLAIM', 
    name: 'Претензия', 
    description: 'Официальное требование к нарушителю прав',
    icon: <AlertCircle className="w-6 h-6" />,
    color: 'bg-red-100 text-red-800',
    category: 'защита прав потребителей',
    fields: ['название_организации', 'адрес_организации', 'суть_нарушения', 'требования', 'срок_исполнения']
  },
  { 
    id: 'COMPLAINT', 
    name: 'Жалоба', 
    description: 'Обращение в контролирующие органы',
    icon: <Shield className="w-6 h-6" />,
    color: 'bg-orange-100 text-orange-800',
    category: 'административное право',
    fields: ['орган_жалобы', 'суть_проблемы', 'доказательства', 'требования']
  },
  { 
    id: 'CONTRACT', 
    name: 'Договор', 
    description: 'Соглашение между сторонами',
    icon: <Scale className="w-6 h-6" />,
    color: 'bg-blue-100 text-blue-800',
    category: 'гражданское право',
    fields: ['сторона_1', 'сторона_2', 'предмет_договора', 'условия', 'срок_действия', 'ответственность']
  },
  { 
    id: 'AGREEMENT', 
    name: 'Соглашение', 
    description: 'Взаимное согласие по спорным вопросам',
    icon: <CheckCircle className="w-6 h-6" />,
    color: 'bg-green-100 text-green-800',
    category: 'гражданское право',
    fields: ['стороны', 'предмет_соглашения', 'условия', 'обязательства']
  },
  { 
    id: 'POWER_OF_ATTORNEY', 
    name: 'Доверенность', 
    description: 'Документ на представление интересов',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'bg-purple-100 text-purple-800',
    category: 'гражданское право',
    fields: ['доверитель', 'доверенное_лицо', 'полномочия', 'срок_действия', 'место_действия']
  }
];

interface DocumentFormData {
  [key: string]: string;
}

export default function GenerateDocumentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useUser();
  const { showAlert } = useTelegramUser();
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState<DocumentFormData>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam) {
      setSelectedTemplate(typeParam);
    }
  }, [searchParams]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setFormData({});
    setPreview('');
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) {
      showAlert('Пожалуйста, выберите тип документа');
      return;
    }

    const template = DOCUMENT_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template) return;

    // Проверяем заполненность обязательных полей
    const requiredFields = template.fields;
    const missingFields = requiredFields.filter(field => !formData[field]?.trim());
    
    if (missingFields.length > 0) {
      showAlert(`Пожалуйста, заполните все обязательные поля: ${missingFields.join(', ')}`);
      return;
    }

    if (!user?.id) {
      showAlert('Ошибка аутентификации');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          template: selectedTemplate,
          data: formData
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPreview(result.data.content);
        showAlert('Документ сгенерирован успешно!');
      } else {
        showAlert(result.error || 'Ошибка при генерации документа');
      }
    } catch (error) {
      console.error('Error generating document:', error);
      showAlert('Ошибка сети при генерации документа');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!preview || !user?.id) return;

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          title: `${DOCUMENT_TEMPLATES.find(t => t.id === selectedTemplate)?.name} - ${new Date().toLocaleDateString()}`,
          content: preview,
          type: selectedTemplate,
          metadata: {
            template: selectedTemplate,
            variables: formData,
            generatedAt: new Date().toISOString()
          }
        }),
      });

      const result = await response.json();

      if (result.success) {
        showAlert('Документ сохранен!');
        router.push(`/documents/${result.data.id}`);
      } else {
        showAlert(result.error || 'Ошибка при сохранении документа');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      showAlert('Ошибка сети при сохранении документа');
    }
  };

  const getSelectedTemplate = () => {
    return DOCUMENT_TEMPLATES.find(t => t.id === selectedTemplate);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Доступ ограничен</CardTitle>
            <CardDescription className="text-center">
              Необходима авторизация для создания документов
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
            Создать документ
          </h1>
        </div>

        {/* Template Selection */}
        {!selectedTemplate && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <span>Выберите тип документа</span>
              </CardTitle>
              <CardDescription>
                Выберите подходящий шаблон для вашего документа
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DOCUMENT_TEMPLATES.map((template) => (
                  <HapticFeedback key={template.id} impact="light">
                    <Card
                      className="cursor-pointer transition-all duration-300 hover:shadow-lg"
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${template.color}`}>
                            {template.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {template.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {template.description}
                            </p>
                            <Badge className="text-xs">
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </HapticFeedback>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Template Info */}
        {selectedTemplate && !preview && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getSelectedTemplate()?.color}`}>
                  {getSelectedTemplate()?.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">
                    {getSelectedTemplate()?.name}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {getSelectedTemplate()?.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTemplate('')}
                  className="ml-auto"
                >
                  Изменить
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        {selectedTemplate && !preview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-green-600" />
                <span>Заполните данные</span>
              </CardTitle>
              <CardDescription>
                Укажите необходимую информацию для генерации документа
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getSelectedTemplate()?.fields.map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} *
                  </label>
                  <textarea
                    placeholder={`Введите ${field.replace(/_/g, ' ')}...`}
                    value={formData[field] || ''}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px] resize-none"
                    required
                  />
                </div>
              ))}
              
              <div className="pt-4">
                <Button
                  variant="gradient"
                  size="xl"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Генерируем документ...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Сгенерировать документ
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview */}
        {preview && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-6 h-6 text-green-600" />
                  <span>Предпросмотр документа</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <HapticFeedback impact="light">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreview('')}
                    >
                      Изменить
                    </Button>
                  </HapticFeedback>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono">
                  {preview}
                </pre>
              </div>
              
              <div className="flex space-x-3 mt-4">
                <HapticFeedback impact="light">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(preview);
                      showAlert('Документ скопирован в буфер обмена');
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Копировать
                  </Button>
                </HapticFeedback>
                
                <HapticFeedback impact="light">
                  <Button
                    variant="gradient"
                    onClick={handleSave}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Сохранить документ
                  </Button>
                </HapticFeedback>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
