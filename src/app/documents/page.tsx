'use client';

import React, { useState } from 'react';
import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Stepper } from '@/components/ui/Stepper';

interface DocumentForm {
  type: string;
  title: string;
  description: string;
  parties: {
    name: string;
    address: string;
    phone: string;
  }[];
  details: Record<string, string>;
}

const documentTypes = [
  { id: 'claim', name: 'Претензия', description: 'О нарушении прав потребителя' },
  { id: 'contract', name: 'Договор', description: 'Оказания услуг' },
  { id: 'complaint', name: 'Жалоба', description: 'В Роспотребнадзор' },
];

const steps = ['Тип документа', 'Информация', 'Стороны', 'Детали', 'Предпросмотр'];

export default function DocumentsPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<DocumentForm>({
    type: '',
    title: '',
    description: '',
    parties: [{ name: '', address: '', phone: '' }],
    details: {}
  });
  const [showPreview, setShowPreview] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState('');

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = () => {
    // Mock document generation
    const mockDocument = `
ПРЕТЕНЗИЯ
о нарушении прав потребителя

${form.parties[0]?.name || '[Наименование продавца]'}
Адрес: ${form.parties[0]?.address || '[Адрес продавца]'}

От: ${form.parties[1]?.name || '[Ваше ФИО]'}
Адрес: ${form.parties[1]?.address || '[Ваш адрес]'}
Телефон: ${form.parties[1]?.phone || '[Ваш телефон]'}

${form.description || '[Описание ситуации]'}

Требую: ${form.details.demand || '[Ваше требование]'}

${form.parties[1]?.name || '[Ваше ФИО]'}
${new Date().toLocaleDateString('ru-RU')}
    `.trim();
    
    setGeneratedDocument(mockDocument);
    setShowPreview(true);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Выберите тип документа</h3>
            <div className="grid grid-cols-1 gap-4">
              {documentTypes.map((type) => (
                <div
                  key={type.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    form.type === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setForm(prev => ({ ...prev, type: type.id }))}
                >
                  <h4 className="font-medium">{type.name}</h4>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Основная информация</h3>
            <Input
              label="Название документа"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Введите название"
            />
            <div>
              <label className="block text-sm font-medium mb-2">Описание ситуации</label>
              <textarea
                className="w-full p-3 border rounded-lg"
                rows={4}
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Опишите ситуацию подробно"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Стороны договора</h3>
            {form.parties.map((party, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">
                  {index === 0 ? 'Продавец/Исполнитель' : 'Покупатель/Заказчик'}
                </h4>
                <div className="space-y-3">
                  <Input
                    label="ФИО/Название"
                    value={party.name}
                    onChange={(e) => {
                      const newParties = [...form.parties];
                      newParties[index] = { ...party, name: e.target.value };
                      setForm(prev => ({ ...prev, parties: newParties }));
                    }}
                    placeholder="Введите ФИО или название организации"
                  />
                  <Input
                    label="Адрес"
                    value={party.address}
                    onChange={(e) => {
                      const newParties = [...form.parties];
                      newParties[index] = { ...party, address: e.target.value };
                      setForm(prev => ({ ...prev, parties: newParties }));
                    }}
                    placeholder="Введите адрес"
                  />
                  <Input
                    label="Телефон"
                    value={party.phone}
                    onChange={(e) => {
                      const newParties = [...form.parties];
                      newParties[index] = { ...party, phone: e.target.value };
                      setForm(prev => ({ ...prev, parties: newParties }));
                    }}
                    placeholder="Введите телефон"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Дополнительные детали</h3>
            <Input
              label="Ваше требование"
              value={form.details.demand || ''}
              onChange={(e) => setForm(prev => ({ 
                ...prev, 
                details: { ...prev.details, demand: e.target.value }
              }))}
              placeholder="Что именно вы требуете?"
            />
            <Input
              label="Сумма (если применимо)"
              value={form.details.amount || ''}
              onChange={(e) => setForm(prev => ({ 
                ...prev, 
                details: { ...prev.details, amount: e.target.value }
              }))}
              placeholder="Введите сумму в рублях"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container-narrow">
      <AppHeader title="Генерация документов" showBack onBack={() => history.back()} />
      
      <div className="section">
        <Stepper 
          currentStep={currentStep} 
          totalSteps={steps.length} 
          steps={steps} 
        />
      </div>

      <div className="section">
        <Card>
          {renderStepContent()}
        </Card>
      </div>

      <div className="section">
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            Назад
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button onClick={handleGenerate}>
              Сгенерировать документ
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Далее
            </Button>
          )}
        </div>
      </div>

      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Предпросмотр документа"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {generatedDocument}
            </pre>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
            >
              Закрыть
            </Button>
            <Button onClick={() => {
              // Mock download
              const blob = new Blob([generatedDocument], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${form.title || 'document'}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}>
              Скачать
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
