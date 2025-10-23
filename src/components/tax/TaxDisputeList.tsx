'use client';

import React, { useState, useEffect } from 'react';

interface TaxDisputeListProps {
  onCreateNew: () => void;
}

interface TaxDispute {
  id: string;
  taxType: string;
  period: string;
  region: string;
  claimedAmount: number;
  calculatedAmount: number;
  status: string;
  createdAt: string;
}

export function TaxDisputeList({ onCreateNew }: TaxDisputeListProps) {
  const [disputes, setDisputes] = useState<TaxDispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    try {
      // В реальном приложении здесь будет запрос к API
      // const response = await fetch('/api/tax/disputes');
      // const data = await response.json();
      // setDisputes(data);
      
      // Пока показываем заглушку
      setDisputes([]);
    } catch (error) {
      console.error('Ошибка загрузки споров:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; className: string }> = {
      draft: { text: 'Черновик', className: 'bg-gray-200 text-gray-700' },
      pending: { text: 'В работе', className: 'bg-blue-200 text-blue-700' },
      submitted: { text: 'Подан', className: 'bg-purple-200 text-purple-700' },
      resolved: { text: 'Решен', className: 'bg-green-200 text-green-700' },
      rejected: { text: 'Отклонен', className: 'bg-red-200 text-red-700' },
    };

    const badge = badges[status] || badges.draft;
    return (
      <span className={`text-xs px-2 py-1 rounded ${badge.className}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-[var(--tg-theme-hint-color,#999999)]">
          Загружаем споры...
        </p>
      </div>
    );
  }

  if (disputes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-[var(--tg-theme-text-color,#000000)] mb-2">
          У вас пока нет споров
        </h3>
        <p className="text-sm text-[var(--tg-theme-hint-color,#999999)] mb-6">
          Создайте первый спор для автоматической генерации документов
        </p>
        <button
          onClick={onCreateNew}
          className="px-6 py-3 bg-[var(--tg-theme-button-color,#2563eb)] text-[var(--tg-theme-button-text-color,#ffffff)] rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg"
        >
          ➕ Создать первый спор
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {disputes.map((dispute) => (
        <div
          key={dispute.id}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => {/* Открыть детали спора */}}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--tg-theme-text-color,#000000)] mb-1">
                {dispute.taxType === 'transport' ? '🚗 Транспортный налог' : dispute.taxType}
              </h3>
              <p className="text-sm text-[var(--tg-theme-hint-color,#999999)]">
                {dispute.region} • {dispute.period}
              </p>
            </div>
            {getStatusBadge(dispute.status)}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Начислено:</span>
              <span className="font-medium text-red-600">
                {dispute.claimedAmount.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Должно быть:</span>
              <span className="font-medium text-green-600">
                {dispute.calculatedAmount.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
              <span className="font-medium">Переплата:</span>
              <span className="font-bold text-red-600">
                {(dispute.claimedAmount - dispute.calculatedAmount).toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-[var(--tg-theme-hint-color,#999999)]">
              Создан {new Date(dispute.createdAt).toLocaleDateString('ru-RU')}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Открыть действия
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Подробнее →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

