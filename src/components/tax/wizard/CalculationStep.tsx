'use client';

import React, { useState, useEffect } from 'react';

interface CalculationStepProps {
  data: {
    region: string;
    taxPeriod: string;
    vehicleType?: string;
    enginePower?: number;
    claimedAmount?: number;
  };
  onNext: (data: { calculatedAmount: number; difference: number; grounds: string[] }) => void;
  onBack: () => void;
}

export function CalculationStep({ data, onNext, onBack }: CalculationStepProps) {
  const [loading, setLoading] = useState(false);
  const [calculatedAmount, setCalculatedAmount] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    calculateTax();
  }, []);

  const calculateTax = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tax/calculator/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region: data.region,
          vehicleType: data.vehicleType,
          enginePower: data.enginePower,
          year: parseInt(data.taxPeriod),
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка расчета налога');
      }

      const result = await response.json();
      setCalculatedAmount(result.amount);
      setRate(result.rate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const difference = calculatedAmount !== null && data.claimedAmount
    ? data.claimedAmount - calculatedAmount
    : 0;

  const grounds = [
    'Неправильно применена налоговая ставка',
    'Неверно указана налоговая база (мощность двигателя)',
    'Нарушение порядка расчета налога',
  ];

  const handleContinue = () => {
    if (calculatedAmount !== null) {
      onNext({
        calculatedAmount,
        difference,
        grounds,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--tg-theme-text-color,#000000)] mb-2">
          Расчет налога
        </h2>
        <p className="text-sm text-[var(--tg-theme-hint-color,#999999)] mb-4">
          Автоматический расчет правильной суммы налога
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-[var(--tg-theme-hint-color,#999999)]">
            Рассчитываем налог...
          </p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
          <button
            onClick={calculateTax}
            className="mt-3 text-sm text-blue-600 underline"
          >
            Попробовать снова
          </button>
        </div>
      ) : calculatedAmount !== null ? (
        <>
          {/* Calculation Details */}
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">
                📊 Детали расчета
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Мощность двигателя:</span>
                  <span className="font-medium">{data.enginePower} л.с.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Налоговая ставка:</span>
                  <span className="font-medium">{rate} руб./л.с.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Регион:</span>
                  <span className="font-medium">{data.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Период:</span>
                  <span className="font-medium">{data.taxPeriod}</span>
                </div>
              </div>
            </div>

            {/* Comparison */}
            <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
              <h3 className="font-semibold text-[var(--tg-theme-text-color,#000000)] mb-3">
                💰 Сравнение сумм
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Начислено ИФНС:</span>
                  <span className="text-lg font-bold text-red-600">
                    {data.claimedAmount?.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Правильная сумма:</span>
                  <span className="text-lg font-bold text-green-600">
                    {calculatedAmount.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">
                      {difference > 0 ? 'Переплата:' : 'Недоплата:'}
                    </span>
                    <span className={`text-xl font-bold ${
                      difference > 0 ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {Math.abs(difference).toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis */}
            {difference > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">
                  ✅ Основания для оспаривания
                </h3>
                <ul className="space-y-2 text-sm text-green-800">
                  {grounds.map((ground, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>{ground}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {difference <= 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  ⚠️ Внимание
                </h3>
                <p className="text-sm text-yellow-800">
                  Расчетная сумма совпадает с начисленной или меньше. 
                  Возможно, налог начислен правильно.
                </p>
              </div>
            )}
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
              onClick={handleContinue}
              className="flex-1 py-4 bg-[var(--tg-theme-button-color,#2563eb)] text-[var(--tg-theme-button-text-color,#ffffff)] rounded-lg font-semibold hover:opacity-90 transition-all"
            >
              {difference > 0 ? 'Создать документы →' : 'Продолжить →'}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

