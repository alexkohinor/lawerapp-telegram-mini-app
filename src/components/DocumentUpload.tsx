'use client';

import React, { useState, useRef } from 'react';
import { DocumentUploadProps, ExtractedData } from '@/types/document';

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onDocumentUploaded,
  onAnalysisComplete
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [isMultiPage, setIsMultiPage] = useState(false);
  const [uploadedPages, setUploadedPages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const multiPageInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file, 'file');
    }
  };

  const handleCameraUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file, 'camera');
    }
  };

  const handleMultiPageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setUploadedPages(prev => [...prev, ...files]);
    }
  };

  const removePage = (index: number) => {
    setUploadedPages(prev => prev.filter((_, i) => i !== index));
  };

  const processMultiPage = () => {
    if (uploadedPages.length === 0) return;
    
    setIsUploading(true);
    // Симулируем обработку многостраничного документа
    setTimeout(() => {
      const mockExtractedData: ExtractedData = {
        documentType: 'pretenziya',
        title: 'Претензия о нарушении прав потребителя',
        parties: {
          seller: {
            name: 'ООО "Магазин электроники"',
            address: 'г. Москва, ул. Тверская, д. 1',
            phone: '+7 (495) 123-45-67'
          },
          buyer: {
            name: 'Иванов Иван Иванович',
            address: 'г. Москва, ул. Ленина, д. 10, кв. 5',
            phone: '+7 (999) 123-45-67'
          }
        },
        issue: 'Товар ненадлежащего качества',
        amount: 25000,
        demand: 'Возврат денежных средств',
        date: new Date().toISOString(),
        confidence: 0.85
      };
      
      onAnalysisComplete(mockExtractedData);
      setIsUploading(false);
    }, 3000);
  };

  const processFile = async (file: File, type: 'camera' | 'file') => {
    // Проверяем лимит документов
    const documentsUsed = parseInt(localStorage.getItem('documents_used') || '0');
    const isPremium = localStorage.getItem('is_premium') === 'true';
    
    if (!isPremium && documentsUsed >= 1) {
      alert('Вы исчерпали лимит бесплатных документов. Перейдите на премиум-тариф для продолжения.');
      return;
    }

    setIsUploading(true);
    setUploadedFile(file);
    
    // Создаем preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Симулируем AI анализ
    setTimeout(() => {
      const mockExtractedData: ExtractedData = {
        documentType: 'pretenziya',
        title: 'Претензия о нарушении прав потребителя',
        parties: {
          seller: {
            name: 'ООО "Магазин электроники"',
            address: 'г. Москва, ул. Тверская, д. 1',
            phone: '+7 (495) 123-45-67'
          },
          buyer: {
            name: 'Иванов Иван Иванович',
            address: 'г. Москва, ул. Ленина, д. 10, кв. 5',
            phone: '+7 (999) 123-45-67'
          }
        },
        issue: 'Товар ненадлежащего качества',
        amount: 25000,
        demand: 'Возврат денежных средств',
        date: new Date().toISOString(),
        confidence: 0.85
      };
      
      // Увеличиваем счетчик использованных документов
      if (!isPremium) {
        localStorage.setItem('documents_used', (documentsUsed + 1).toString());
      }
      
      onDocumentUploaded(file, type);
      onAnalysisComplete(mockExtractedData);
      setIsUploading(false);
    }, 2000);
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setIsUploading(false);
    setPrivacyConsent(false);
    setIsMultiPage(false);
    setUploadedPages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (multiPageInputRef.current) multiPageInputRef.current.value = '';
  };

  if (isUploading) {
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
          Анализируем документ...
        </h3>
        <p style={{ margin: 0, color: 'var(--tg-theme-hint-color, #6b7280)' }}>
          ИИ-ассистент извлекает ключевые данные
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

  if (uploadedFile && previewUrl) {
    return (
      <div style={{ 
        padding: '20px',
        background: 'var(--tg-theme-bg-color, #ffffff)',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: 'var(--tg-theme-text-color, #111827)' }}>
            Документ загружен
          </h3>
          <button
            onClick={resetUpload}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--tg-theme-hint-color, #6b7280)',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ✕
          </button>
        </div>
        
        <div style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '10px',
          marginBottom: '15px',
          background: '#f9fafb'
        }}>
          <img 
            src={previewUrl} 
            alt="Document preview" 
            style={{ 
              width: '100%', 
              height: '200px', 
              objectFit: 'contain',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <div style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color, #6b7280)' }}>
          <p style={{ margin: '0 0 5px 0' }}>
            <strong>Файл:</strong> {uploadedFile.name}
          </p>
          <p style={{ margin: 0 }}>
            <strong>Размер:</strong> {(uploadedFile.size / 1024).toFixed(1)} KB
          </p>
        </div>
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
        Загрузите документ для анализа
      </h3>
      
      <p style={{ 
        margin: '0 0 20px 0', 
        color: 'var(--tg-theme-hint-color, #6b7280)',
        textAlign: 'center',
        fontSize: '14px'
      }}>
        Сфотографируйте документ или загрузите файл. ИИ-ассистент проанализирует его и предложит решение.
      </p>

      
      {/* Переключатель для многостраничных документов */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          color: 'var(--tg-theme-text-color, #111827)'
        }}>
          <input
            type="checkbox"
            checked={isMultiPage}
            onChange={(e) => setIsMultiPage(e.target.checked)}
            style={{ margin: 0 }}
          />
          Документ многостраничный (несколько страниц)
        </label>
      </div>

      {!isMultiPage ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => {
              if (!privacyConsent) {
                alert('Необходимо дать согласие на обработку персональных данных');
                return;
              }
              cameraInputRef.current?.click();
            }}
            disabled={!privacyConsent}
            style={{
              padding: '16px',
              background: privacyConsent ? 'var(--tg-theme-button-color, #2563eb)' : '#9ca3af',
              color: 'var(--tg-theme-button-text-color, #ffffff)',
              border: 'none',
              borderRadius: '8px',
              cursor: privacyConsent ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            📷 Сфотографировать документ
          </button>
          
          <button
            onClick={() => {
              if (!privacyConsent) {
                alert('Необходимо дать согласие на обработку персональных данных');
                return;
              }
              fileInputRef.current?.click();
            }}
            disabled={!privacyConsent}
            style={{
              padding: '16px',
              background: privacyConsent ? 'var(--tg-theme-secondary-bg-color, #f3f4f6)' : '#f3f4f6',
              color: privacyConsent ? 'var(--tg-theme-text-color, #111827)' : '#9ca3af',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: privacyConsent ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            📁 Выбрать файл
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => {
              if (!privacyConsent) {
                alert('Необходимо дать согласие на обработку персональных данных');
                return;
              }
              multiPageInputRef.current?.click();
            }}
            disabled={!privacyConsent}
            style={{
              padding: '16px',
              background: privacyConsent ? 'var(--tg-theme-button-color, #2563eb)' : '#9ca3af',
              color: 'var(--tg-theme-button-text-color, #ffffff)',
              border: 'none',
              borderRadius: '8px',
              cursor: privacyConsent ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            📷 Добавить страницы документа
          </button>
          
          {uploadedPages.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--tg-theme-text-color, #111827)' }}>
                Загруженные страницы ({uploadedPages.length}):
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {uploadedPages.map((file, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: 'var(--tg-theme-secondary-bg-color, #f3f4f6)',
                    borderRadius: '6px',
                    fontSize: '13px'
                  }}>
                    <span>Страница {index + 1}: {file.name}</span>
                    <button
                      onClick={() => removePage(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={processMultiPage}
                disabled={uploadedPages.length === 0}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: uploadedPages.length > 0 ? 'var(--tg-theme-button-color, #2563eb)' : '#9ca3af',
                  color: 'var(--tg-theme-button-text-color, #ffffff)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: uploadedPages.length > 0 ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginTop: '10px'
                }}
              >
                Проанализировать многостраничный документ
              </button>
            </div>
          )}
        </div>
      )}

      {/* Согласие на обработку ПД */}
      <div style={{ marginTop: '20px' }}>
        <label style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          cursor: 'pointer',
          fontSize: 'clamp(10px, 2.5vw, 12px)',
          color: 'var(--tg-theme-text-color, #111827)',
          lineHeight: '1.3'
        }}>
          <input
            type="checkbox"
            checked={privacyConsent}
            onChange={(e) => setPrivacyConsent(e.target.checked)}
            style={{ 
              margin: 0, 
              marginTop: '2px',
              transform: 'scale(0.9)',
              minWidth: '14px',
              minHeight: '14px'
            }}
          />
          <span style={{
            fontSize: 'clamp(10px, 2.5vw, 12px)',
            lineHeight: '1.3',
            wordBreak: 'break-word'
          }}>
            Я даю согласие на обработку персональных данных, содержащихся в загружаемых документах, 
            в соответствии с Федеральным законом &quot;О персональных данных&quot; № 152-ФЗ. 
            Данные будут использованы исключительно для анализа документа и генерации ответа.
          </span>
        </label>
      </div>
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraUpload}
        style={{ display: 'none' }}
      />
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <input
        ref={multiPageInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleMultiPageUpload}
        style={{ display: 'none' }}
      />
      
      <div style={{ 
        marginTop: '15px', 
        fontSize: '12px', 
        color: 'var(--tg-theme-hint-color, #6b7280)',
        textAlign: 'center'
      }}>
        Поддерживаемые форматы: PDF, DOC, DOCX, JPG, PNG
      </div>
    </div>
  );
};

export default DocumentUpload;
