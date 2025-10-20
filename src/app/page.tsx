'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
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

  // Handle button clicks with haptic feedback and navigation
  const handleButtonClick = (path: string) => {
    console.log('Button clicked, navigating to:', path);
    console.log('Current location:', window.location.href);
    console.log('Router available:', !!router);
    
    // Add haptic feedback if available
    if (typeof window !== 'undefined' && (window as unknown as { Telegram?: { WebApp?: { HapticFeedback?: { impactOccurred: (type: string) => void } } } }).Telegram?.WebApp?.HapticFeedback) {
      try {
        (window as unknown as { Telegram: { WebApp: { HapticFeedback: { impactOccurred: (type: string) => void } } } }).Telegram.WebApp.HapticFeedback.impactOccurred('light');
        console.log('Haptic feedback triggered');
      } catch {
        console.log('Haptic feedback not available');
      }
    }
    
    // Try multiple navigation methods
    try {
      console.log('Attempting router.push...');
      router.push(path);
      console.log('Router.push completed');
    } catch (error) {
      console.error('Router navigation failed:', error);
      console.log('Falling back to window.location...');
      window.location.href = path;
    }
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