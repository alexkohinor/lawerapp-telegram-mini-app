'use client';

import React, { useState } from 'react';
import DocumentUpload from '@/components/DocumentUpload';
import ExtractedData from '@/components/ExtractedData';
import SolutionProposal from '@/components/SolutionProposal';
import DocumentExport from '@/components/DocumentExport';
import { ExtractedData as ExtractedDataType, Solution } from '@/types/document';

type WorkflowStep = 'upload' | 'extracted' | 'solutions' | 'export';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [extractedData, setExtractedData] = useState<ExtractedDataType | null>(null);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [generatedDocument, setGeneratedDocument] = useState<string>('');

  const handleDocumentUploaded = (file: File, type: 'camera' | 'file') => {
    console.log('Document uploaded:', file.name, type);
  };

  const handleAnalysisComplete = (data: ExtractedDataType) => {
    setExtractedData(data);
    setCurrentStep('extracted');
    console.log('Analysis complete:', data);
  };

  const handleDataConfirmed = () => {
    setCurrentStep('solutions');
  };

  const handleSolutionSelected = (solution: Solution) => {
    setSelectedSolution(solution);
    console.log('Solution selected:', solution);
  };

  const handleGenerateDocument = (solution: Solution) => {
    // Генерируем документ на основе извлеченных данных и выбранного решения
    const document = generateDocument(extractedData!, solution);
    setGeneratedDocument(document);
    setCurrentStep('export');
    console.log('Document generated:', document);
  };

  const generateDocument = (data: ExtractedDataType, solution: Solution) => {
    return `
${solution.title.toUpperCase()}

Дата: ${new Date().toLocaleDateString('ru-RU')}

От: ${data.parties.buyer.name}
Адрес: ${data.parties.buyer.address}
Телефон: ${data.parties.buyer.phone}

Кому: ${data.parties.seller.name}
Адрес: ${data.parties.seller.address}

Уважаемые господа!

Настоящим уведомляю вас о том, что ${data.issue.toLowerCase()}.

Согласно ст. 18 Закона РФ "О защите прав потребителей", потребитель в случае обнаружения недостатков товара имеет право потребовать:
- замены товара на товар надлежащего качества;
- соразмерного уменьшения покупной цены;
- незамедлительного безвозмездного устранения недостатков товара;
- возмещения расходов на устранение недостатков товара;
- возврата уплаченной за товар суммы.

${solution.description}

Требую: ${data.demand}

В случае неисполнения моих требований в течение 10 дней с момента получения настоящего обращения, я буду вынужден обратиться в суд с требованием о защите нарушенных прав.

Приложение: копии документов, подтверждающих факт покупки товара.

${data.parties.buyer.name}
${new Date().toLocaleDateString('ru-RU')}
    `.trim();
  };

  const handleExport = (format: 'docx' | 'pdf') => {
    console.log('Exporting document in format:', format);
    // В реальном приложении здесь был бы вызов API для экспорта
  };

  const resetWorkflow = () => {
    setCurrentStep('upload');
    setExtractedData(null);
    setSelectedSolution(null);
    setGeneratedDocument('');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <DocumentUpload
            onDocumentUploaded={handleDocumentUploaded}
            onAnalysisComplete={handleAnalysisComplete}
          />
        );
      
      case 'extracted':
        return extractedData ? (
          <ExtractedData
            data={extractedData}
            onEdit={(field, value) => {
              // В реальном приложении здесь была бы логика редактирования
              console.log('Edit field:', field, value);
            }}
            onConfirm={handleDataConfirmed}
          />
        ) : null;
      
      case 'solutions':
        return extractedData ? (
          <SolutionProposal
            extractedData={extractedData}
            onSolutionSelected={handleSolutionSelected}
            onGenerateDocument={handleGenerateDocument}
          />
        ) : null;
      
      case 'export':
        return (
          <DocumentExport
            documentContent={generatedDocument}
            documentTitle={selectedSolution?.title || 'Документ'}
            onExport={handleExport}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ 
          color: 'var(--tg-theme-text-color, #111827)', 
          marginBottom: '10px',
          fontSize: '24px'
        }}>
          Юридический ассистент
        </h1>
        
        <p style={{ 
          color: 'var(--tg-theme-hint-color, #6b7280)',
          fontSize: '14px',
          margin: 0
        }}>
          Загрузите документ → ИИ проанализирует → Предложит решение → Сгенерирует ответ
        </p>
      </div>

      {/* Progress indicator */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '30px',
        gap: '8px'
      }}>
        {['upload', 'extracted', 'solutions', 'export'].map((step, index) => (
          <div
            key={step}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: currentStep === step 
                ? 'var(--tg-theme-button-color, #2563eb)' 
                : index < ['upload', 'extracted', 'solutions', 'export'].indexOf(currentStep)
                ? '#10b981'
                : '#e5e7eb',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>

      {/* Current step content */}
      {renderCurrentStep()}

      {/* Navigation buttons */}
      {currentStep !== 'upload' && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '20px',
          gap: '12px'
        }}>
          <button
            onClick={resetWorkflow}
            style={{
              padding: '12px 20px',
              background: 'var(--tg-theme-secondary-bg-color, #f3f4f6)',
              color: 'var(--tg-theme-text-color, #111827)',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Начать заново
          </button>
          
          <button
            onClick={() => window.location.href = '/consultations'}
            style={{
              padding: '12px 20px',
              background: 'var(--tg-theme-button-color, #2563eb)',
              color: 'var(--tg-theme-button-text-color, #ffffff)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            AI Консультации →
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        marginTop: '30px', 
        textAlign: 'center',
        fontSize: '12px', 
        color: 'var(--tg-theme-hint-color, #6b7280)'
      }}>
        <p style={{ margin: '0 0 10px 0' }}>
          Не является юридической услугой.
        </p>
        
        <a
          href="https://t.me/+79688398919"
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            color: 'var(--tg-theme-link-color, #2563eb)', 
            textDecoration: 'underline' 
          }}
        >
          Связаться с адвокатом
        </a>
      </div>
    </div>
  );
}