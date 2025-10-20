'use client';

import React, { useState } from 'react';
import { SolutionProposalProps, Solution } from '@/types/document';

export const SolutionProposal: React.FC<SolutionProposalProps> = ({
  extractedData,
  onSolutionSelected,
  onGenerateDocument
}) => {
  const [selectedSolution, setSelectedSolution] = useState<string | null>(null);

  // Генерируем предложения на основе типа документа
  const getSolutions = (documentType: string): Solution[] => {
    switch (documentType) {
      case 'pretenziya':
        return [
          {
            id: 'response_pretenziya',
            title: 'Ответ на претензию',
            description: 'Составить официальный ответ на полученную претензию с обоснованием позиции',
            type: 'response',
            priority: 'high',
            estimatedTime: '15-20 минут',
            successRate: 0.85
          },
          {
            id: 'counter_pretenziya',
            title: 'Встречная претензия',
            description: 'Подать встречную претензию с обоснованием своих требований',
            type: 'counter',
            priority: 'medium',
            estimatedTime: '25-30 минут',
            successRate: 0.75
          },
          {
            id: 'negotiation',
            title: 'Предложение о досудебном урегулировании',
            description: 'Составить предложение о мирном решении спора без обращения в суд',
            type: 'negotiation',
            priority: 'high',
            estimatedTime: '20-25 минут',
            successRate: 0.90
          }
        ];
      case 'contract':
        return [
          {
            id: 'contract_review',
            title: 'Анализ договора',
            description: 'Проанализировать договор на предмет нарушений и рисков',
            type: 'analysis',
            priority: 'high',
            estimatedTime: '30-40 минут',
            successRate: 0.80
          },
          {
            id: 'contract_amendments',
            title: 'Предложения по изменению договора',
            description: 'Подготовить предложения по улучшению условий договора',
            type: 'amendments',
            priority: 'medium',
            estimatedTime: '25-35 минут',
            successRate: 0.70
          }
        ];
      default:
        return [
          {
            id: 'general_analysis',
            title: 'Правовой анализ ситуации',
            description: 'Провести комплексный анализ правовой ситуации и предложить варианты решения',
            type: 'analysis',
            priority: 'high',
            estimatedTime: '20-30 минут',
            successRate: 0.75
          }
        ];
    }
  };

  const solutions = getSolutions(extractedData.documentType);

  const handleSolutionSelect = (solutionId: string) => {
    setSelectedSolution(solutionId);
    const solution = solutions.find(s => s.id === solutionId);
    if (solution) {
      onSolutionSelected(solution);
    }
  };

  const handleGenerate = () => {
    const solution = solutions.find(s => s.id === selectedSolution);
    if (solution) {
      onGenerateDocument(solution);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return 'Неизвестно';
    }
  };

  return (
    <div style={{ 
      padding: '20px',
      background: 'var(--tg-theme-bg-color, #ffffff)',
      borderRadius: '12px',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          margin: '0 0 10px 0', 
          color: 'var(--tg-theme-text-color, #111827)',
          textAlign: 'center'
        }}>
          ИИ предлагает решения
        </h3>
        <p style={{ 
          margin: 0, 
          color: 'var(--tg-theme-hint-color, #6b7280)',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          Выберите наиболее подходящий вариант для вашей ситуации
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {solutions.map((solution) => (
          <div
            key={solution.id}
            onClick={() => handleSolutionSelect(solution.id)}
            style={{
              padding: '16px',
              border: selectedSolution === solution.id 
                ? '2px solid var(--tg-theme-button-color, #2563eb)' 
                : '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              background: selectedSolution === solution.id 
                ? 'rgba(37, 99, 235, 0.05)' 
                : 'var(--tg-theme-bg-color, #ffffff)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '8px'
            }}>
              <h4 style={{ 
                margin: 0, 
                color: 'var(--tg-theme-text-color, #111827)',
                fontSize: '16px'
              }}>
                {solution.title}
              </h4>
              <div style={{
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                background: `${getPriorityColor(solution.priority)}20`,
                color: getPriorityColor(solution.priority)
              }}>
                {getPriorityText(solution.priority)}
              </div>
            </div>
            
            <p style={{ 
              margin: '0 0 12px 0', 
              color: 'var(--tg-theme-hint-color, #6b7280)',
              fontSize: '14px',
              lineHeight: '1.4'
            }}>
              {solution.description}
            </p>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              fontSize: '12px',
              color: 'var(--tg-theme-hint-color, #6b7280)'
            }}>
              <span>⏱️ {solution.estimatedTime}</span>
              <span>📊 Успешность: {Math.round(solution.successRate * 100)}%</span>
            </div>
          </div>
        ))}
      </div>

      {selectedSolution && (
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
            <span style={{ fontSize: '16px' }}>✅</span>
            <strong style={{ color: '#0c4a6e' }}>Решение выбрано</strong>
          </div>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: '#0c4a6e',
            lineHeight: '1.4'
          }}>
            ИИ-ассистент готов сгенерировать документ на основе выбранного решения.
          </p>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={!selectedSolution}
        style={{
          width: '100%',
          padding: '16px',
          background: selectedSolution 
            ? 'var(--tg-theme-button-color, #2563eb)' 
            : 'var(--tg-theme-secondary-bg-color, #f3f4f6)',
          color: selectedSolution 
            ? 'var(--tg-theme-button-text-color, #ffffff)' 
            : 'var(--tg-theme-hint-color, #6b7280)',
          border: 'none',
          borderRadius: '8px',
          cursor: selectedSolution ? 'pointer' : 'not-allowed',
          fontSize: '16px',
          fontWeight: '600',
          opacity: selectedSolution ? 1 : 0.5
        }}
      >
        {selectedSolution ? 'Сгенерировать документ' : 'Выберите решение'}
      </button>
    </div>
  );
};

export default SolutionProposal;
