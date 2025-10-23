'use client';

import React, { useState } from 'react';

interface VehicleInfoStepProps {
  data: {
    vehicleType?: string;
    enginePower?: number;
    vehicleBrand?: string;
    vehicleModel?: string;
    registrationNumber?: string;
  };
  onNext: (data: Partial<VehicleInfoStepProps['data']>) => void;
  onBack: () => void;
}

export function VehicleInfoStep({ data, onNext, onBack }: VehicleInfoStepProps) {
  const [vehicleType, setVehicleType] = useState(data.vehicleType || '');
  const [enginePower, setEnginePower] = useState(data.enginePower?.toString() || '');
  const [vehicleBrand, setVehicleBrand] = useState(data.vehicleBrand || '');
  const [vehicleModel, setVehicleModel] = useState(data.vehicleModel || '');
  const [registrationNumber, setRegistrationNumber] = useState(data.registrationNumber || '');

  const vehicleTypes = [
    { id: 'car', name: 'Легковой автомобиль', icon: '🚗' },
    { id: 'motorcycle', name: 'Мотоцикл', icon: '🏍️' },
    { id: 'truck', name: 'Грузовой автомобиль', icon: '🚚' },
    { id: 'bus', name: 'Автобус', icon: '🚌' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      vehicleType,
      enginePower: Number(enginePower),
      vehicleBrand,
      vehicleModel,
      registrationNumber,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--tg-theme-text-color,#000000)] mb-2">
          Информация о транспортном средстве
        </h2>
        <p className="text-sm text-[var(--tg-theme-hint-color,#999999)] mb-4">
          Укажите данные вашего ТС из свидетельства о регистрации
        </p>
      </div>

      {/* Vehicle Type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--tg-theme-text-color,#000000)]">
          Тип транспортного средства
        </label>
        <div className="grid grid-cols-2 gap-3">
          {vehicleTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setVehicleType(type.id)}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                vehicleType === type.id
                  ? 'border-[var(--tg-theme-button-color,#2563eb)] bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-3xl block mb-2">{type.icon}</span>
              <span className="text-sm font-medium text-[var(--tg-theme-text-color,#000000)]">
                {type.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Engine Power */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--tg-theme-text-color,#000000)]">
          Мощность двигателя (л.с.)
        </label>
        <div className="relative">
          <input
            type="number"
            value={enginePower}
            onChange={(e) => setEnginePower(e.target.value)}
            min="1"
            max="9999"
            className="w-full p-3 pr-12 border border-gray-300 rounded-lg bg-white text-[var(--tg-theme-text-color,#000000)]"
            placeholder="Например: 150"
            required
          />
          <span className="absolute right-3 top-3 text-[var(--tg-theme-hint-color,#999999)]">
            л.с.
          </span>
        </div>
        <p className="text-xs text-[var(--tg-theme-hint-color,#999999)]">
          💡 Указана в строке 4 свидетельства о регистрации ТС
        </p>
      </div>

      {/* Vehicle Brand */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--tg-theme-text-color,#000000)]">
          Марка автомобиля
        </label>
        <input
          type="text"
          value={vehicleBrand}
          onChange={(e) => setVehicleBrand(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-[var(--tg-theme-text-color,#000000)]"
          placeholder="Например: Toyota"
          required
        />
      </div>

      {/* Vehicle Model */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--tg-theme-text-color,#000000)]">
          Модель автомобиля
        </label>
        <input
          type="text"
          value={vehicleModel}
          onChange={(e) => setVehicleModel(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-[var(--tg-theme-text-color,#000000)]"
          placeholder="Например: Camry"
          required
        />
      </div>

      {/* Registration Number */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--tg-theme-text-color,#000000)]">
          Регистрационный номер
        </label>
        <input
          type="text"
          value={registrationNumber}
          onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-[var(--tg-theme-text-color,#000000)] uppercase"
          placeholder="Например: А123БВ777"
          required
        />
      </div>

      {/* Navigation Buttons */}
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
          disabled={!vehicleType || !enginePower}
          className="flex-1 py-4 bg-[var(--tg-theme-button-color,#2563eb)] text-[var(--tg-theme-button-text-color,#ffffff)] rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
        >
          Продолжить →
        </button>
      </div>
    </form>
  );
}

