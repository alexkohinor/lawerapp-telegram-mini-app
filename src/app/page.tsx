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
            <button className="btn" onClick={() => router.push('/consultations')}>
              Открыть консультации
            </button>
          </div>

          <div className="card">
            <h2>Документы</h2>
            <p>Генерация правовых документов и шаблонов</p>
            <button className="btn" onClick={() => router.push('/documents')}>
              Создать документ
            </button>
          </div>

          <div className="card">
            <h2>Споры</h2>
            <p>Управление правовыми спорами и делами</p>
            <button className="btn" onClick={() => router.push('/disputes')}>
              Управлять спорами
            </button>
          </div>

          <div className="card">
            <h2>Платежи</h2>
            <p>Интеграция с российскими платежными системами</p>
            <button className="btn" onClick={() => router.push('/payments')}>
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