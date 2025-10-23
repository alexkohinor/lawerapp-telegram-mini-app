'use client';

import React, { useState } from 'react';

interface TaxRequirementStepProps {
  data: {
    inspectionNumber?: string;
    inspectionName?: string;
    requirementNumber?: string;
    requirementDate?: string;
    claimedAmount?: number;
    taxpayerName?: string;
    taxpayerINN?: string;
    taxpayerAddress?: string;
    taxpayerPhone?: string;
  };
  onNext: (data: Partial<TaxRequirementStepProps['data']>) => void;
  onBack: () => void;
}

export function TaxRequirementStep({ data, onNext, onBack }: TaxRequirementStepProps) {
  const [inspectionNumber, setInspectionNumber] = useState(data.inspectionNumber || '');
  const [inspectionName, setInspectionName] = useState(data.inspectionName || '');
  const [requirementNumber, setRequirementNumber] = useState(data.requirementNumber || '');
  const [requirementDate, setRequirementDate] = useState(data.requirementDate || '');
  const [claimedAmount, setClaimedAmount] = useState(data.claimedAmount?.toString() || '');
  const [taxpayerName, setTaxpayerName] = useState(data.taxpayerName || '');
  const [taxpayerINN, setTaxpayerINN] = useState(data.taxpayerINN || '');
  const [taxpayerAddress, setTaxpayerAddress] = useState(data.taxpayerAddress || '');
  const [taxpayerPhone, setTaxpayerPhone] = useState(data.taxpayerPhone || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      inspectionNumber,
      inspectionName,
      requirementNumber,
      requirementDate,
      claimedAmount: Number(claimedAmount),
      taxpayerName,
      taxpayerINN,
      taxpayerAddress,
      taxpayerPhone,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--tg-theme-text-color,#000000)] mb-2">
          Данные налогового требования
        </h2>
        <p className="text-sm text-[var(--tg-theme-hint-color,#999999)] mb-4">
          Информация из полученного требования ИФНС
        </p>
      </div>

      {/* ИФНС Info */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-[var(--tg-theme-text-color,#000000)]">
          Данные ИФНС
        </h3>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--tg-theme-text-color,#000000)]">
            Номер инспекции
          </label>
          <input
            type="text"
            value={inspectionNumber}
            onChange={(e) => setInspectionNumber(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-[var(--tg-theme-text-color,#000000)]"
            placeholder="Например: 23"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--tg-theme-text-color,#000000)]">
            Название инспекции
          </label>
          <input
            type="text"
            value={inspectionName}
            onChange={(e) => setInspectionName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-[var(--tg-theme-text-color,#000000)]"
            placeholder="ИФНС России № 23 по г. Москве"
          />
        </div>
      </div>

      {/* Requirement Details */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--tg-theme-text-color,#000000)]">
            Номер требования
          </label>
          <input
            type="text"
            value={requirementNumber}
            onChange={(e) => setRequirementNumber(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-[var(--tg-theme-text-color,#000000)]"
            placeholder="Например: 12345"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--tg-theme-text-color,#000000)]">
            Дата требования
          </label>
          <input
            type="date"
            value={requirementDate}
            onChange={(e) => setRequirementDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-[var(--tg-theme-text-color,#000000)]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--tg-theme-text-color,#000000)]">
            Начисленная сумма (руб.)
          </label>
          <div className="relative">
            <input
              type="number"
              value={claimedAmount}
              onChange={(e) => setClaimedAmount(e.target.value)}
              min="0"
              step="0.01"
              className="w-full p-3 pr-12 border border-gray-300 rounded-lg bg-white text-[var(--tg-theme-text-color,#000000)]"
              placeholder="Например: 8500"
              required
            />
            <span className="absolute right-3 top-3 text-[var(--tg-theme-hint-color,#999999)]">
              ₽
            </span>
          </div>
        </div>
      </div>

      {/* Taxpayer Info */}
      <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-[var(--tg-theme-text-color,#000000)]">
          Ваши данные
        </h3>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--tg-theme-text-color,#000000)]">
            ФИО полностью
          </label>
          <input
            type="text"
            value={taxpayerName}
            onChange={(e) => setTaxpayerName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-[var(--tg-theme-text-color,#000000)]"
            placeholder="Иванов Иван Иванович"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--tg-theme-text-color,#000000)]">
            ИНН
          </label>
          <input
            type="text"
            value={taxpayerINN}
            onChange={(e) => setTaxpayerINN(e.target.value)}
            maxLength={12}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-[var(--tg-theme-text-color,#000000)]"
            placeholder="123456789012"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--tg-theme-text-color,#000000)]">
            Адрес регистрации
          </label>
          <textarea
            value={taxpayerAddress}
            onChange={(e) => setTaxpayerAddress(e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-[var(--tg-theme-text-color,#000000)]"
            placeholder="г. Москва, ул. Ленина, д. 1, кв. 1"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--tg-theme-text-color,#000000)]">
            Телефон
          </label>
          <input
            type="tel"
            value={taxpayerPhone}
            onChange={(e) => setTaxpayerPhone(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-[var(--tg-theme-text-color,#000000)]"
            placeholder="+7 (999) 123-45-67"
            required
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-4 border-2 border-gray-300 text-[var(--tg-theme-text-color,#000000)] rounded-lg font-semibold hover:bg-gray-50 transition-all"
        >
          ← Назад
        </button>
        <button
          type="submit"
          className="flex-1 py-4 bg-[var(--tg-theme-button-color,#2563eb)] text-[var(--tg-theme-button-text-color,#ffffff)] rounded-lg font-semibold hover:opacity-90 transition-all"
        >
          Продолжить →
        </button>
      </div>
    </form>
  );
}

