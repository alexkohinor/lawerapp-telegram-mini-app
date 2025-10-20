'use client';

import { useState } from 'react';

export default function Home() {
  const [isTelegramApp, setIsTelegramApp] = useState(false);

  return (
    <div className="container">
      <main style={{ padding: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '20px', color: '#333' }}>
          LawerApp - Telegram Mini App
        </h1>
        
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '15px', color: '#555' }}>
            Добро пожаловать в LawerApp!
          </h2>
          
          <p style={{ marginBottom: '20px', lineHeight: '1.6', color: '#666' }}>
            Это Telegram Mini App для правовой помощи с AI консультациями.
            Приложение готово к деплою на TimeWeb Cloud.
          </p>
          
          <div className="grid grid-2" style={{ marginTop: '30px' }}>
            <div className="card">
              <h3 style={{ color: '#007bff', marginBottom: '10px' }}>AI Консультации</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Получите правовую консультацию с помощью искусственного интеллекта
              </p>
            </div>
            
            <div className="card">
              <h3 style={{ color: '#28a745', marginBottom: '10px' }}>Документы</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Генерация правовых документов и шаблонов
              </p>
            </div>
            
            <div className="card">
              <h3 style={{ color: '#ffc107', marginBottom: '10px' }}>Споры</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Управление правовыми спорами и делами
              </p>
            </div>
            
            <div className="card">
              <h3 style={{ color: '#dc3545', marginBottom: '10px' }}>Платежи</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Интеграция с российскими платежными системами
              </p>
            </div>
          </div>
          
          <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ color: '#333', marginBottom: '10px' }}>Статус деплоя</h3>
            <p style={{ color: '#28a745', fontWeight: 'bold' }}>
              ✅ Приложение успешно оптимизировано для TimeWeb Cloud
            </p>
            <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
              Время установки зависимостей сокращено с 7-8 минут до 3-4 минут
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}