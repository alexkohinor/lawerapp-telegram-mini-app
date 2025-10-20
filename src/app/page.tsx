'use client';

import React, { useEffect } from 'react';

export default function Home() {
  // One-time cache busting only on first load
  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('cacheBusted')) {
      sessionStorage.setItem('cacheBusted', 'true');
      const currentUrl = new URL(window.location.href);
      if (!currentUrl.searchParams.has('v')) {
        currentUrl.searchParams.set('v', Date.now().toString());
        window.location.href = currentUrl.toString();
      }
    }
  }, []);

  // Navigation function that works in Telegram WebApp
  const navigateTo = (path: string) => {
    console.log('Navigating to:', path);
    if (typeof window !== 'undefined') {
      try {
        // For Telegram WebApp, use window.location for navigation
        const baseUrl = window.location.origin;
        const fullUrl = `${baseUrl}${path}`;
        console.log('Full URL:', fullUrl);
        window.location.href = fullUrl;
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback to window.location
        window.location.href = path;
      }
    }
  };

  // Handle button clicks with haptic feedback
  const handleButtonClick = (path: string) => {
    console.log('Button clicked, navigating to:', path);
    
    // Add haptic feedback if available
    if (typeof window !== 'undefined' && (window as unknown as { Telegram?: { WebApp?: { HapticFeedback?: { impactOccurred: (type: string) => void } } } }).Telegram?.WebApp?.HapticFeedback) {
      try {
        (window as unknown as { Telegram: { WebApp: { HapticFeedback: { impactOccurred: (type: string) => void } } } }).Telegram.WebApp.HapticFeedback.impactOccurred('light');
        console.log('Haptic feedback triggered');
      } catch {
        console.log('Haptic feedback not available');
      }
    }
    
    // Navigate to the path
    navigateTo(path);
  };

  return (
    <div style={{ padding: '16px', maxWidth: '100%' }}>
      <main>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '16px', 
          color: 'var(--tg-theme-text-color, #111827)',
          textAlign: 'center'
        }}>
          Юридический ассистент
        </h1>

        <div style={{ marginBottom: '16px' }}>
          <div className="card">
            <h2>AI Консультации</h2>
            <p>Получите правовую консультацию с помощью искусственного интеллекта</p>
            <button 
              className="btn" 
              onClick={() => handleButtonClick('/consultations')}
              style={{ cursor: 'pointer' }}
            >
              Открыть консультации
            </button>
          </div>

          <div className="card">
            <h2>Документы</h2>
            <p>Генерация правовых документов и шаблонов</p>
            <button 
              className="btn" 
              onClick={() => handleButtonClick('/documents')}
              style={{ cursor: 'pointer' }}
            >
              Создать документ
            </button>
          </div>

          <div className="card">
            <h2>Споры</h2>
            <p>Управление правовыми спорами и делами</p>
            <button 
              className="btn" 
              onClick={() => handleButtonClick('/disputes')}
              style={{ cursor: 'pointer' }}
            >
              Управлять спорами
            </button>
          </div>

          <div className="card">
            <h2>Платежи</h2>
            <p>Интеграция с российскими платежными системами</p>
            <button 
              className="btn" 
              onClick={() => handleButtonClick('/payments')}
              style={{ cursor: 'pointer' }}
            >
              Оплатить услуги
            </button>
          </div>

          <div className="disclaimer">
            Не является юридической услугой.
          </div>
        </div>

        <a
          href="https://t.me/+79688398919"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-link"
        >
          Связаться с адвокатом
        </a>
      </main>
    </div>
  );
}