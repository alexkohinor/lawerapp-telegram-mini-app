'use client';

import React from 'react';
import { ExtractedDataProps } from '@/types/document';

export const ExtractedData: React.FC<ExtractedDataProps> = ({
  data,
  onEdit,
  onConfirm
}) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#10b981'; // green
    if (confidence >= 0.6) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'Высокая';
    if (confidence >= 0.6) return 'Средняя';
    return 'Низкая';
  };

  return (
    <div style={{ 
      padding: '20px',
      background: 'var(--tg-theme-bg-color, #ffffff)',
      borderRadius: '12px',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h3 style={{ margin: 0, color: 'var(--tg-theme-text-color, #111827)' }}>
          Извлеченные данные
        </h3>
        <div style={{
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500',
          background: `${getConfidenceColor(data.confidence)}20`,
          color: getConfidenceColor(data.confidence)
        }}>
          Точность: {getConfidenceText(data.confidence)}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ 
          margin: '0 0 10px 0', 
          color: 'var(--tg-theme-text-color, #111827)',
          fontSize: '16px'
        }}>
          Тип документа
        </h4>
        <div style={{
          padding: '12px',
          background: 'var(--tg-theme-secondary-bg-color, #f3f4f6)',
          borderRadius: '8px',
          fontSize: '14px',
          color: 'var(--tg-theme-text-color, #111827)'
        }}>
          {data.title}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ 
          margin: '0 0 10px 0', 
          color: 'var(--tg-theme-text-color, #111827)',
          fontSize: '16px'
        }}>
          Стороны
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            padding: '12px',
            background: 'var(--tg-theme-secondary-bg-color, #f3f4f6)',
            borderRadius: '8px'
          }}>
            <div style={{ 
              fontWeight: '600', 
              marginBottom: '8px',
              color: 'var(--tg-theme-text-color, #111827)'
            }}>
              Продавец/Исполнитель
            </div>
            <div style={{ fontSize: '14px', color: 'var(--tg-theme-text-color, #111827)' }}>
              <div><strong>Название:</strong> {data.parties.seller.name}</div>
              <div><strong>Адрес:</strong> {data.parties.seller.address}</div>
              <div><strong>Телефон:</strong> {data.parties.seller.phone}</div>
            </div>
          </div>
          
          <div style={{
            padding: '12px',
            background: 'var(--tg-theme-secondary-bg-color, #f3f4f6)',
            borderRadius: '8px'
          }}>
            <div style={{ 
              fontWeight: '600', 
              marginBottom: '8px',
              color: 'var(--tg-theme-text-color, #111827)'
            }}>
              Покупатель/Заказчик
            </div>
            <div style={{ fontSize: '14px', color: 'var(--tg-theme-text-color, #111827)' }}>
              <div><strong>ФИО:</strong> {data.parties.buyer.name}</div>
              <div><strong>Адрес:</strong> {data.parties.buyer.address}</div>
              <div><strong>Телефон:</strong> {data.parties.buyer.phone}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ 
          margin: '0 0 10px 0', 
          color: 'var(--tg-theme-text-color, #111827)',
          fontSize: '16px'
        }}>
          Суть вопроса
        </h4>
        <div style={{
          padding: '12px',
          background: 'var(--tg-theme-secondary-bg-color, #f3f4f6)',
          borderRadius: '8px',
          fontSize: '14px',
          color: 'var(--tg-theme-text-color, #111827)'
        }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Проблема:</strong> {data.issue}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Требование:</strong> {data.demand}
          </div>
          <div>
            <strong>Сумма:</strong> {data.amount.toLocaleString('ru-RU')} ₽
          </div>
        </div>
      </div>

      <div style={{ 
        padding: '12px',
        background: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>💡</span>
          <strong style={{ color: '#0c4a6e' }}>ИИ-анализ завершен</strong>
        </div>
        <p style={{ 
          margin: 0, 
          fontSize: '14px', 
          color: '#0c4a6e',
          lineHeight: '1.4'
        }}>
          Данные успешно извлечены из документа. Вы можете отредактировать их при необходимости или перейти к генерации ответного документа.
        </p>
      </div>

      <button
        onClick={onConfirm}
        style={{
          width: '100%',
          padding: '16px',
          background: 'var(--tg-theme-button-color, #2563eb)',
          color: 'var(--tg-theme-button-text-color, #ffffff)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '600'
        }}
      >
        Продолжить с этими данными
      </button>
    </div>
  );
};

export default ExtractedData;
