'use client';

import React from 'react';

export default function Home() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: '#111827', marginBottom: '20px' }}>
        Юридический ассистент
      </h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p>Приложение загружается успешно!</p>
        <p>Все системы работают нормально.</p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button 
          style={{ 
            padding: '12px 20px', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
          onClick={() => window.location.href = '/consultations'}
        >
          AI Консультации
        </button>
        
        <button 
          style={{ 
            padding: '12px 20px', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
          onClick={() => window.location.href = '/documents'}
        >
          Документы
        </button>
        
        <button 
          style={{ 
            padding: '12px 20px', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
          onClick={() => window.location.href = '/disputes'}
        >
          Споры
        </button>
        
        <button 
          style={{ 
            padding: '12px 20px', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
          onClick={() => window.location.href = '/payments'}
        >
          Платежи
        </button>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#6b7280' }}>
        Не является юридической услугой.
      </div>
      
      <a
        href="https://t.me/+79688398919"
        target="_blank"
        rel="noopener noreferrer"
        style={{ 
          display: 'block', 
          marginTop: '20px', 
          color: '#2563eb', 
          textDecoration: 'underline' 
        }}
      >
        Связаться с адвокатом
      </a>
    </div>
  );
}