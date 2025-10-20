'use client';

import { useState } from 'react';

export default function Home() {
  const [isTelegramApp, setIsTelegramApp] = useState(false);

  return (
    <div className="container">
      <main style={{ padding: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '20px', color: '#333' }}>
          Юридический ассистент
        </h1>
        
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          
          <div className="grid grid-2" style={{ marginTop: '30px' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} 
                 onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                 onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <h3 style={{ color: '#007bff', marginBottom: '10px' }}>AI Консультации</h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                Получите правовую консультацию с помощью искусственного интеллекта
              </p>
              <button 
                className="btn" 
                style={{ 
                  width: '100%',
                  padding: '10px 20px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
                onClick={() => alert('Функция AI консультаций в разработке')}
              >
                Получить консультацию
              </button>
            </div>
            
            <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} 
                 onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                 onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <h3 style={{ color: '#28a745', marginBottom: '10px' }}>Документы</h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                Генерация правовых документов и шаблонов
              </p>
              <button 
                className="btn" 
                style={{ 
                  width: '100%',
                  padding: '10px 20px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
                onClick={() => alert('Генератор документов в разработке')}
              >
                Создать документ
              </button>
            </div>
            
            <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} 
                 onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                 onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <h3 style={{ color: '#ffc107', marginBottom: '10px' }}>Споры</h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                Управление правовыми спорами и делами
              </p>
              <button 
                className="btn" 
                style={{ 
                  width: '100%',
                  padding: '10px 20px',
                  background: '#ffc107',
                  color: '#333',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
                onClick={() => alert('Управление спорами в разработке')}
              >
                Управлять спорами
              </button>
            </div>
            
            <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} 
                 onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                 onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <h3 style={{ color: '#dc3545', marginBottom: '10px' }}>Платежи</h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                Интеграция с российскими платежными системами
              </p>
              <button 
                className="btn" 
                style={{ 
                  width: '100%',
                  padding: '10px 20px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
                onClick={() => alert('Платежная система в разработке')}
              >
                Оплатить услуги
              </button>
            </div>
          </div>
          
          <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
              Не является юридической услугой.
            </p>
            <a 
              href="https://t.me/+79688398919" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn"
              style={{ 
                display: 'inline-block',
                padding: '12px 24px',
                background: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold'
              }}
            >
              Связаться с адвокатом
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}