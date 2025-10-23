'use client';

import React, { useState } from 'react';

interface TaxTypeStepProps {
  data: {
    taxType: string;
    taxPeriod: string;
    region: string;
  };
  onNext: (data: Partial<TaxTypeStepProps['data']>) => void;
}

export function TaxTypeStep({ data, onNext }: TaxTypeStepProps) {
  const [taxType, setTaxType] = useState(data.taxType || '');
  const [taxPeriod, setTaxPeriod] = useState(data.taxPeriod || new Date().getFullYear().toString());
  const [region, setRegion] = useState(data.region || 'Москва');

  const taxTypes = [
    { id: 'transport', name: 'Транспортный налог', icon: '🚗', description: 'На автомобили, мотоциклы и другие ТС' },
    { id: 'property', name: 'Налог на имущество', icon: '🏠', description: 'На недвижимость физических лиц', disabled: true },
    { id: 'land', name: 'Земельный налог', icon: '🌾', description: 'На земельные участки', disabled: true },
  ];

  const regions = [
    'Москва',
    'Санкт-Петербург',
    'Московская область',
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taxType) {
      onNext({ taxType, taxPeriod, region });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--tg-theme-text-color,#000000)] mb-2">
          Выберите тип налога
        </h2>
        <p className="text-sm text-[var(--tg-theme-hint-color,#999999)] mb-4">
          Какой налог вы хотите оспорить?
        </p>
      </div>

      {/* Tax Type Selection */}
      <div className="space-y-3">
        {taxTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            disabled={type.disabled}
            onClick={() => setTaxType(type.id)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              taxType === type.id
                ? 'border-[var(--tg-theme-button-color,#2563eb)] bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${type.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{type.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[var(--tg-theme-text-color,#000000)]">
                    {type.name}
                  </h3>
                  {type.disabled && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      Скоро
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--tg-theme-hint-color,#999999)] mt-1">
                  {type.description}
                </p>
              </div>
              {taxType === type.id && (
                <span className="text-2xl">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Region Selection */}
      {taxType && (
        <div className="space-y-2 animate-fadeIn">
          <label className="block text-sm font-medium text-[var(--tg-theme-text-color,#000000)]">
            Регион
          </label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-[var(--tg-theme-text-color,#000000)]"
            required
          >
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      )}

      {/* Tax Period Selection */}
      {taxType && (
        <div className="space-y-2 animate-fadeIn">
          <label className="block text-sm font-medium text-[var(--tg-theme-text-color,#000000)]">
            Налоговый период
          </label>
          <select
            value={taxPeriod}
            onChange={(e) => setTaxPeriod(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-[var(--tg-theme-text-color,#000000)]"
            required
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!taxType}
        className="w-full py-4 bg-[var(--tg-theme-button-color,#2563eb)] text-[var(--tg-theme-button-text-color,#ffffff)] rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
      >
        Продолжить →
      </button>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </form>
  );
}

