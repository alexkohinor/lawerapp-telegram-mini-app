'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HapticFeedback } from '@/components/telegram/HapticFeedback';
import { BackButton } from '@/components/telegram/BackButton';
import { useTelegramUser } from '@/hooks/useTelegramUser';

const DOCUMENT_TEMPLATES = [
  {
    id: 'labor-contract',
    name: 'Трудовой договор',
    icon: '👷',
    description: 'Договор между работодателем и работником',
    category: 'Трудовое право',
    fields: [
      { name: 'employer_name', label: 'Наименование работодателя', type: 'text', required: true },
      { name: 'employee_name', label: 'ФИО работника', type: 'text', required: true },
      { name: 'position', label: 'Должность', type: 'text', required: true },
      { name: 'salary', label: 'Размер заработной платы', type: 'number', required: true },
      { name: 'start_date', label: 'Дата начала работы', type: 'date', required: true },
      { name: 'work_schedule', label: 'Режим работы', type: 'select', options: ['Полный день', 'Неполный день', 'Сменный график'], required: true },
    ]
  },
  {
    id: 'rental-agreement',
    name: 'Договор аренды',
    icon: '🏠',
    description: 'Договор аренды недвижимого имущества',
    category: 'Гражданское право',
    fields: [
      { name: 'landlord_name', label: 'ФИО арендодателя', type: 'text', required: true },
      { name: 'tenant_name', label: 'ФИО арендатора', type: 'text', required: true },
      { name: 'property_address', label: 'Адрес объекта', type: 'text', required: true },
      { name: 'rent_amount', label: 'Размер арендной платы', type: 'number', required: true },
      { name: 'rent_period', label: 'Срок аренды', type: 'text', required: true },
      { name: 'deposit', label: 'Размер залога', type: 'number', required: false },
    ]
  },
  {
    id: 'pre-trial-claim',
    name: 'Досудебная претензия',
    icon: '📋',
    description: 'Претензия для досудебного урегулирования спора',
    category: 'Гражданское право',
    fields: [
      { name: 'claimant_name', label: 'ФИО заявителя', type: 'text', required: true },
      { name: 'respondent_name', label: 'ФИО ответчика', type: 'text', required: true },
      { name: 'dispute_description', label: 'Описание спора', type: 'textarea', required: true },
      { name: 'claim_amount', label: 'Сумма требований', type: 'number', required: false },
      { name: 'deadline', label: 'Срок для ответа', type: 'date', required: true },
    ]
  },
  {
    id: 'power-of-attorney',
    name: 'Доверенность',
    icon: '📜',
    description: 'Доверенность на представление интересов',
    category: 'Гражданское право',
    fields: [
      { name: 'principal_name', label: 'ФИО доверителя', type: 'text', required: true },
      { name: 'agent_name', label: 'ФИО поверенного', type: 'text', required: true },
      { name: 'powers', label: 'Полномочия', type: 'textarea', required: true },
      { name: 'validity_period', label: 'Срок действия', type: 'text', required: true },
      { name: 'notarization', label: 'Требуется нотариальное удостоверение', type: 'checkbox', required: false },
    ]
  },
  {
    id: 'divorce-petition',
    name: 'Исковое заявление о разводе',
    icon: '💔',
    description: 'Заявление о расторжении брака',
    category: 'Семейное право',
    fields: [
      { name: 'plaintiff_name', label: 'ФИО истца', type: 'text', required: true },
      { name: 'defendant_name', label: 'ФИО ответчика', type: 'text', required: true },
      { name: 'marriage_date', label: 'Дата заключения брака', type: 'date', required: true },
      { name: 'children_info', label: 'Информация о детях', type: 'textarea', required: false },
      { name: 'property_division', label: 'Раздел имущества', type: 'textarea', required: false },
      { name: 'alimony', label: 'Алименты', type: 'textarea', required: false },
    ]
  },
  {
    id: 'consumer-complaint',
    name: 'Жалоба в Роспотребнадзор',
    icon: '🛒',
    description: 'Жалоба на нарушение прав потребителей',
    category: 'Защита прав потребителей',
    fields: [
      { name: 'complainant_name', label: 'ФИО заявителя', type: 'text', required: true },
      { name: 'company_name', label: 'Наименование организации', type: 'text', required: true },
      { name: 'violation_description', label: 'Описание нарушения', type: 'textarea', required: true },
      { name: 'damage_amount', label: 'Размер ущерба', type: 'number', required: false },
      { name: 'evidence', label: 'Доказательства', type: 'textarea', required: false },
    ]
  },
];

export default function DocumentGenerationPage() {
  const router = useRouter();
  const { hapticFeedback, showAlert } = useTelegramUser();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<string>('');

  const selectedTemplateData = DOCUMENT_TEMPLATES.find(template => template.id === selectedTemplate);

  const handleTemplateSelect = (templateId: string) => {
    hapticFeedback('light');
    setSelectedTemplate(templateId);
    setFormData({});
    setGeneratedDocument('');
  };

  const handleFieldChange = (fieldName: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleGenerate = async () => {
    if (!selectedTemplateData) return;

    const requiredFields = selectedTemplateData.fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.name]);

    if (missingFields.length > 0) {
      showAlert(`Пожалуйста, заполните обязательные поля: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    setIsGenerating(true);
    hapticFeedback('medium');

    try {
      // Имитация генерации документа
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockDocument = generateMockDocument(selectedTemplateData, formData);
      setGeneratedDocument(mockDocument);
      
      showAlert('Документ успешно сгенерирован!');
    } catch (error) {
      showAlert('Произошла ошибка при генерации документа');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockDocument = (template: typeof DOCUMENT_TEMPLATES[0], data: Record<string, any>) => {
    // Простая генерация документа на основе шаблона
    let document = `ДОКУМЕНТ: ${template.name}\n\n`;
    
    template.fields.forEach(field => {
      if (data[field.name]) {
        document += `${field.label}: ${data[field.name]}\n`;
      }
    });
    
    document += `\nДата составления: ${new Date().toLocaleDateString('ru-RU')}\n`;
    document += `\n---\n\nЭтот документ сгенерирован автоматически и требует проверки юристом.`;
    
    return document;
  };

  const handleDownload = () => {
    hapticFeedback('light');
    const blob = new Blob([generatedDocument], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplateData?.name || 'document'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBackToDocuments = () => {
    hapticFeedback('light');
    router.push('/documents');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <BackButton onClick={handleBackToDocuments} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📄 Генерация документа
          </h1>
          <p className="text-gray-600">
            Создайте правовой документ с помощью AI-юриста
          </p>
        </div>

        {/* Template Selection */}
        {!selectedTemplate && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Выберите тип документа</CardTitle>
              <CardDescription>
                Выберите подходящий шаблон для вашего документа
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DOCUMENT_TEMPLATES.map((template) => (
                  <HapticFeedback key={template.id} type="light">
                    <button
                      onClick={() => handleTemplateSelect(template.id)}
                      className="p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-green-300 hover:shadow-sm transition-all duration-200 text-left"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{template.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {template.description}
                          </p>
                          <Badge variant="info" className="text-xs">
                            {template.category}
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
        {selectedTemplateData && !generatedDocument && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>{selectedTemplateData.icon}</span>
                <span>{selectedTemplateData.name}</span>
              </CardTitle>
              <CardDescription>
                Заполните необходимые поля для генерации документа
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedTemplateData.fields.map((field) => (
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
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder={`Введите ${field.label.toLowerCase()}`}
                      />
                    )}
                    
                    {field.type === 'number' && (
                      <input
                        type="number"
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || 0)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder={`Введите ${field.label.toLowerCase()}`}
                      />
                    )}
                    
                    {field.type === 'date' && (
                      <input
                        type="date"
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    )}
                    
                    {field.type === 'textarea' && (
                      <textarea
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        placeholder={`Опишите ${field.label.toLowerCase()}`}
                      />
                    )}
                    
                    {field.type === 'select' && (
                      <select
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Выберите опцию</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {field.type === 'checkbox' && (
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData[field.name] || false}
                          onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{field.label}</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generate Button */}
        {selectedTemplateData && !generatedDocument && (
          <div className="text-center mb-6">
            <HapticFeedback type="medium">
              <Button
                variant="default"
                size="xl"
                onClick={handleGenerate}
                loading={isGenerating}
                disabled={isGenerating}
                className="px-8 py-4 text-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isGenerating ? 'Генерируем документ...' : 'Сгенерировать документ'}
              </Button>
            </HapticFeedback>
          </div>
        )}

        {/* Generated Document */}
        {generatedDocument && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>✅</span>
                <span>Сгенерированный документ</span>
              </CardTitle>
              <CardDescription>
                Документ готов к скачиванию
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {generatedDocument}
                </pre>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <HapticFeedback type="light">
                  <Button
                    variant="default"
                    onClick={handleDownload}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                  >
                    📥 Скачать документ
                  </Button>
                </HapticFeedback>
                
                <HapticFeedback type="light">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setGeneratedDocument('');
                      setFormData({});
                    }}
                    className="flex-1"
                  >
                    🔄 Создать новый
                  </Button>
                </HapticFeedback>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💡 Советы по созданию документов</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Заполните все обязательные поля (отмечены *)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Проверьте правильность введенных данных</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Для важных документов рекомендуется консультация юриста</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Сохраните сгенерированный документ в безопасном месте</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}