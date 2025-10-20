'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { StickyBottomBar } from '@/components/ui/StickyBottomBar';

export default function Home() {
  const router = useRouter();

  return (
    <div className="container-narrow">
      <main>
        <h1 className="text-2xl" style={{ marginBottom: 16 }}>Юридический ассистент</h1>

        <div className="grid-1 section">
          <div className="card">
            <div className="text-lg" style={{ fontWeight: 600, marginBottom: 8 }}>AI Консультации</div>
            <div className="text-muted" style={{ marginBottom: 12 }}>Получите правовую консультацию с помощью искусственного интеллекта</div>
            <button className="btn-primary" onClick={() => router.push('/consultations')}>Открыть консультации</button>
          </div>

          <div className="card">
            <div className="text-lg" style={{ fontWeight: 600, marginBottom: 8 }}>Документы</div>
            <div className="text-muted" style={{ marginBottom: 12 }}>Генерация правовых документов и шаблонов</div>
            <button className="btn-primary" onClick={() => router.push('/documents')}>Создать документ</button>
          </div>

          <div className="card">
            <div className="text-lg" style={{ fontWeight: 600, marginBottom: 8 }}>Споры</div>
            <div className="text-muted" style={{ marginBottom: 12 }}>Управление правовыми спорами и делами</div>
            <button className="btn-primary" onClick={() => router.push('/disputes')}>Управлять спорами</button>
          </div>

          <div className="card">
            <div className="text-lg" style={{ fontWeight: 600, marginBottom: 8 }}>Платежи</div>
            <div className="text-muted" style={{ marginBottom: 12 }}>Интеграция с российскими платежными системами</div>
            <button className="btn-primary" onClick={() => router.push('/payments')}>Оплатить услуги</button>
          </div>

          <div className="card">
            <div className="text-muted" style={{ marginBottom: 12 }}>Не является юридической услугой.</div>
          </div>
        </div>

        <StickyBottomBar>
          <a
            href="https://t.me/+79688398919"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ width: '100%' }}
          >
            Связаться с адвокатом
          </a>
        </StickyBottomBar>
      </main>
    </div>
  );
}