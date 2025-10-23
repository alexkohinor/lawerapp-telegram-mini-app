'use client';

import React, { useState } from 'react';

interface DocumentGenerationStepProps {
  data: {
    taxType: string;
    region: string;
    taxPeriod: string;
    vehicleType?: string;
    claimedAmount?: number;
    calculatedAmount?: number;
    difference?: number;
    taxpayerName?: string;
    taxpayerINN?: string;
  };
  onComplete: () => void;
  onBack: () => void;
}

export function DocumentGenerationStep({ data, onComplete, onBack }: DocumentGenerationStepProps) {
  const [generating, setGenerating] = useState(false);
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Array<{ id: string; type: string; name: string }>>([]);

  const documentTypes = [
    { 
      id: 'recalculation_request', 
      name: 'Заявление о перерасчете',
      description: 'Запрос на перерасчет налога',
      icon: '📄',
      recommended: true
    },
    { 
      id: 'objection', 
      name: 'Возражения на акт',
      description: 'При наличии акта проверки',
      icon: '✍️',
      recommended: false
    },
    { 
      id: 'complaint', 
      name: 'Жалоба в УФНС',
      description: 'При отказе ИФНС',
      icon: '📮',
      recommended: false
    },
  ];

  const handleGenerateAll = async () => {
    setGenerating(true);

    try {
      // 1. Создаем спор
      const disputeResponse = await fetch('/api/tax/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxType: data.taxType,
          period: data.taxPeriod,
          region: data.region,
          vehicleType: data.vehicleType,
          claimedAmount: data.claimedAmount,
          calculatedAmount: data.calculatedAmount,
          status: 'draft',
        }),
      });

      if (!disputeResponse.ok) throw new Error('Ошибка создания спора');
      
      const dispute = await disputeResponse.json();
      setDisputeId(dispute.id);

      // 2. Генерируем документы
      const generatedDocs = [];
      for (const docType of documentTypes.filter(d => d.recommended)) {
        const docResponse = await fetch('/api/tax/documents/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            disputeId: dispute.id,
            documentType: docType.id,
            useAI: true,
          }),
        });

        if (docResponse.ok) {
          const doc = await docResponse.json();
          generatedDocs.push({
            id: doc.id,
            type: docType.id,
            name: docType.name,
          });
        }
      }

      setDocuments(generatedDocs);
    } catch (error) {
      console.error('Ошибка генерации:', error);
      alert('Произошла ошибка при генерации документов');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportDocument = async (documentId: string, format: 'pdf' | 'docx') => {
    try {
      const response = await fetch(`/api/tax/documents/${documentId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format }),
      });

      if (!response.ok) throw new Error('Ошибка экспорта');

      const result = await response.json();
      
      // Получаем download URL
      const downloadResponse = await fetch(`/api/tax/documents/${documentId}/download`);
      const { url } = await downloadResponse.json();

      // Скачиваем файл
      window.open(url, '_blank');
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      alert('Не удалось экспортировать документ');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--tg-theme-text-color,#000000)] mb-2">
          Генерация документов
        </h2>
        <p className="text-sm text-[var(--tg-theme-hint-color,#999999)] mb-4">
          AI создаст профессиональные юридические документы
        </p>
      </div>

      {!disputeId ? (
        <>
          {/* Summary */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">
              📋 Сводка по спору
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Налогоплательщик:</span>
                <span className="font-medium">{data.taxpayerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ИНН:</span>
                <span className="font-medium">{data.taxpayerINN}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Вид налога:</span>
                <span className="font-medium">Транспортный</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Период:</span>
                <span className="font-medium">{data.taxPeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Переплата:</span>
                <span className="font-bold text-red-600">
                  {data.difference?.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>
          </div>

          {/* Documents to generate */}
          <div className="space-y-3">
            <h3 className="font-semibold text-[var(--tg-theme-text-color,#000000)]">
              Будут созданы документы:
            </h3>
            {documentTypes.map((doc) => (
              <div
                key={doc.id}
                className={`p-4 rounded-lg border-2 ${
                  doc.recommended
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{doc.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{doc.name}</h4>
                      {doc.recommended && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                          Рекомендуется
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {doc.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateAll}
            disabled={generating}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold disabled:opacity-50 hover:opacity-90 transition-all shadow-lg"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                Генерируем документы...
              </span>
            ) : (
              '🤖 Сгенерировать с помощью AI'
            )}
          </button>

          <button
            onClick={onBack}
            className="w-full py-3 border-2 border-gray-300 text-[var(--tg-theme-text-color,#000000)] rounded-lg font-semibold hover:bg-gray-50 transition-all"
          >
            ← Назад
          </button>
        </>
      ) : (
        <>
          {/* Success */}
          <div className="text-center py-6">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-green-600 mb-2">
              Документы успешно созданы!
            </h3>
            <p className="text-sm text-gray-600">
              Вы можете скачать их в формате PDF или DOCX
            </p>
          </div>

          {/* Generated Documents */}
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{doc.name}</h4>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Готов
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportDocument(doc.id, 'pdf')}
                    className="flex-1 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition"
                  >
                    📄 PDF
                  </button>
                  <button
                    onClick={() => handleExportDocument(doc.id, 'docx')}
                    className="flex-1 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
                  >
                    📝 DOCX
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Complete Button */}
          <button
            onClick={onComplete}
            className="w-full py-4 bg-[var(--tg-theme-button-color,#2563eb)] text-[var(--tg-theme-button-text-color,#ffffff)] rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            🏠 Вернуться к списку споров
          </button>
        </>
      )}
    </div>
  );
}

