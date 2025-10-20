'use client';

import React, { useState } from 'react';
import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
            <div className="radio-group">
              {documentTypes.map((type) => (
                <div
                  key={type.id}
                  className={`radio-item ${form.type === type.id ? 'selected' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, type: type.id }))}
                >
                  <input
                    type="radio"
                    name="documentType"
                    value={type.id}
                    checked={form.type === type.id}
                    onChange={() => setForm(prev => ({ ...prev, type: type.id }))}
                    className="radio-input"
                  />
                  <div className="radio-content">
                    <div className="radio-title">{type.name}</div>
                    <div className="radio-description">{type.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Основная информация</h3>
            <div>
              <label className="label">Название документа</label>
              <input
                type="text"
                className="input"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Введите название"
              />
            </div>
            <div>
              <label className="label">Описание ситуации</label>
              <textarea
                className="textarea"
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
                  <div>
                    <label className="label">ФИО/Название</label>
                    <input
                      type="text"
                      className="input"
                      value={party.name}
                      onChange={(e) => {
                        const newParties = [...form.parties];
                        newParties[index] = { ...party, name: e.target.value };
                        setForm(prev => ({ ...prev, parties: newParties }));
                      }}
                      placeholder="Введите ФИО или название организации"
                    />
                  </div>
                  <div>
                    <label className="label">Адрес</label>
                    <input
                      type="text"
                      className="input"
                      value={party.address}
                      onChange={(e) => {
                        const newParties = [...form.parties];
                        newParties[index] = { ...party, address: e.target.value };
                        setForm(prev => ({ ...prev, parties: newParties }));
                      }}
                      placeholder="Введите адрес"
                    />
                  </div>
                  <div>
                    <label className="label">Телефон</label>
                    <input
                      type="text"
                      className="input"
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
              </div>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Дополнительные детали</h3>
            <div>
              <label className="label">Ваше требование</label>
              <input
                type="text"
                className="input"
                value={form.details.demand || ''}
                onChange={(e) => setForm(prev => ({ 
                  ...prev, 
                  details: { ...prev.details, demand: e.target.value }
                }))}
                placeholder="Что именно вы требуете?"
              />
            </div>
            <div>
              <label className="label">Сумма (если применимо)</label>
              <input
                type="text"
                className="input"
                value={form.details.amount || ''}
                onChange={(e) => setForm(prev => ({ 
                  ...prev, 
                  details: { ...prev.details, amount: e.target.value }
                }))}
                placeholder="Введите сумму в рублях"
              />
            </div>
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
          <button
            className="btn-outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            Назад
          </button>
          
          {currentStep === steps.length - 1 ? (
            <button className="btn" onClick={handleGenerate}>
              Сгенерировать документ
            </button>
          ) : (
            <button className="btn" onClick={handleNext}>
              Далее
            </button>
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
