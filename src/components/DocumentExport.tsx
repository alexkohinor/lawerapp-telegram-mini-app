'use client';

import React, { useState } from 'react';
import { DocumentExportProps } from '@/types/document';

export const DocumentExport: React.FC<DocumentExportProps> = ({
  documentContent,
  documentTitle,
  onExport
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'docx' | 'pdf' | null>(null);

  const handleExport = async (format: 'docx' | 'pdf') => {
    setIsExporting(true);
    setExportFormat(format);
    
    // Симулируем процесс экспорта
    setTimeout(() => {
      // В реальном приложении здесь был бы вызов API для генерации файла
      const blob = new Blob([documentContent], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentTitle}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setIsExporting(false);
      setExportFormat(null);
      onExport(format);
    }, 2000);
  };

  if (isExporting) {
    return (
      <div style={{ 
        padding: '40px 20px', 
        textAlign: 'center',
        background: 'var(--tg-theme-bg-color, #ffffff)',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <h3 style={{ margin: '0 0 10px 0', color: 'var(--tg-theme-text-color, #111827)' }}>
          Экспортируем документ...
        </h3>
        <p style={{ margin: 0, color: 'var(--tg-theme-hint-color, #6b7280)' }}>
          Генерируем файл в формате {exportFormat?.toUpperCase()}
        </p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px',
      background: 'var(--tg-theme-bg-color, #ffffff)',
      borderRadius: '12px',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{ 
        margin: '0 0 15px 0', 
        color: 'var(--tg-theme-text-color, #111827)',
        textAlign: 'center'
      }}>
        Экспорт документа
      </h3>
      
      <p style={{ 
        margin: '0 0 20px 0', 
        color: 'var(--tg-theme-hint-color, #6b7280)',
        textAlign: 'center',
        fontSize: '14px'
      }}>
        Выберите формат для скачивания готового документа
      </p>

      <div style={{ 
        marginBottom: '20px',
        padding: '12px',
        background: 'var(--tg-theme-secondary-bg-color, #f3f4f6)',
        borderRadius: '8px',
        fontSize: '14px',
        color: 'var(--tg-theme-text-color, #111827)'
      }}>
        <strong>Документ:</strong> {documentTitle}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={() => handleExport('docx')}
          style={{
            padding: '16px',
            background: 'var(--tg-theme-button-color, #2563eb)',
            color: 'var(--tg-theme-button-text-color, #ffffff)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          📄 Скачать DOCX
        </button>
        
        <button
          onClick={() => handleExport('pdf')}
          style={{
            padding: '16px',
            background: 'var(--tg-theme-secondary-bg-color, #f3f4f6)',
            color: 'var(--tg-theme-text-color, #111827)',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          📋 Скачать PDF
        </button>
      </div>
      
      <div style={{ 
        marginTop: '15px', 
        fontSize: '12px', 
        color: 'var(--tg-theme-hint-color, #6b7280)',
        textAlign: 'center'
      }}>
        Документ будет автоматически скачан в выбранном формате
      </div>
    </div>
  );
};

export default DocumentExport;
