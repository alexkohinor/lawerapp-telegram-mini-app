'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      icon: '🚗',
      title: 'Транспортный налог',
      description: 'Автоматический расчет и генерация документов для оспаривания',
      link: '/tax-disputes',
      available: true
    },
    {
      icon: '🏠',
      title: 'Налог на имущество',
      description: 'Скоро: проверка расчетов и создание возражений',
      link: '#',
      available: false
    },
    {
      icon: '🌾',
      title: 'Земельный налог',
      description: 'Скоро: помощь в оспаривании земельного налога',
      link: '#',
      available: false
    },
    {
      icon: '🤖',
      title: 'AI Консультации',
      description: 'Получите ответы на юридические вопросы',
      link: '/consultations',
      available: true
    },
  ];

  const stats = [
    { value: '95%', label: 'Успешных споров' },
    { value: '₽8,500', label: 'Средняя экономия' },
    { value: '24ч', label: 'Время создания' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="px-4 pt-8 pb-12 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">⚖️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Оспаривание налогов с AI
          </h1>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">
            Автоматическая генерация юридических документов для защиты ваших прав
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/tax-disputes"
          className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
        >
          🚀 Начать оспаривание
        </Link>
      </div>

      {/* Features */}
      <div className="px-4 pb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
          Доступные услуги
        </h2>
        <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
          {features.map((feature, index) => (
            <Link
              key={index}
              href={feature.available ? feature.link : '#'}
              className={`block p-6 bg-white rounded-lg shadow-sm border-2 transition-all ${
                feature.available
                  ? 'border-transparent hover:border-blue-300 hover:shadow-md cursor-pointer'
                  : 'border-gray-200 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{feature.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    {!feature.available && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        Скоро
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
                {feature.available && (
                  <span className="text-2xl text-blue-600">→</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="px-4 pb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
          Как это работает
        </h2>
        <div className="max-w-md mx-auto space-y-4">
          {[
            { step: '1', text: 'Введите данные о налоговом требовании', icon: '📝' },
            { step: '2', text: 'AI проанализирует ситуацию и найдет ошибки', icon: '🤖' },
            { step: '3', text: 'Сгенерируем профессиональные документы', icon: '📄' },
            { step: '4', text: 'Скачайте в PDF/DOCX и подайте в ИФНС', icon: '✅' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                {item.step}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{item.icon}</span>
                  <p className="text-gray-700">{item.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-4 pb-8">
        <div className="max-w-md mx-auto p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 text-center">
            ⚠️ Сервис не является юридической консультацией. Для получения профессиональной помощи обратитесь к адвокату.
          </p>
          <a
            href="https://t.me/+79688398919"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-blue-600 underline mt-3 text-sm"
          >
            Связаться с адвокатом
          </a>
        </div>
      </div>
    </div>
  );
}