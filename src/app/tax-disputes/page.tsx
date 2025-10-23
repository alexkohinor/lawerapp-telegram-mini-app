'use client';

import React, { useState } from 'react';
import { TaxDisputeWizard } from '@/components/tax/TaxDisputeWizard';
import { TaxDisputeList } from '@/components/tax/TaxDisputeList';

export default function TaxDisputesPage() {
  const [activeView, setActiveView] = useState<'list' | 'create'>('list');

  return (
    <div className="min-h-screen bg-[var(--tg-theme-bg-color,#ffffff)] p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--tg-theme-text-color,#000000)] mb-2">
          Оспаривание налогов
        </h1>
        <p className="text-sm text-[var(--tg-theme-hint-color,#999999)]">
          Автоматическая генерация документов для оспаривания налоговых требований
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveView('list')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            activeView === 'list'
              ? 'bg-[var(--tg-theme-button-color,#2563eb)] text-[var(--tg-theme-button-text-color,#ffffff)]'
              : 'bg-[var(--tg-theme-secondary-bg-color,#f3f4f6)] text-[var(--tg-theme-text-color,#000000)]'
          }`}
        >
          📋 Мои споры
        </button>
        <button
          onClick={() => setActiveView('create')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            activeView === 'create'
              ? 'bg-[var(--tg-theme-button-color,#2563eb)] text-[var(--tg-theme-button-text-color,#ffffff)]'
              : 'bg-[var(--tg-theme-secondary-bg-color,#f3f4f6)] text-[var(--tg-theme-text-color,#000000)]'
          }`}
        >
          ➕ Создать спор
        </button>
      </div>

      {/* Content */}
      {activeView === 'list' ? (
        <TaxDisputeList onCreateNew={() => setActiveView('create')} />
      ) : (
        <TaxDisputeWizard onComplete={() => setActiveView('list')} />
      )}

      {/* Info Banner */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">
              Как это работает?
            </h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Укажите данные о налоговом требовании</li>
              <li>2. AI проанализирует ситуацию</li>
              <li>3. Сгенерируем юридические документы</li>
              <li>4. Экспортируйте в PDF/DOCX</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

