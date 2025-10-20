'use client';

import React from 'react';
import { AppHeader } from '@/components/ui/AppHeader';

export default function DocumentsPage() {
  return (
    <div className="container-narrow">
      <AppHeader title="Генерация документов" showBack onBack={() => history.back()} />
      <div className="section">
        <div className="card">
          <div className="text-lg" style={{ fontWeight: 600, marginBottom: 8 }}>Раздел в разработке</div>
          <div className="text-muted">Функция генерации документов будет добавлена позже. Сейчас доступна навигация и базовый интерфейс.</div>
        </div>
      </div>
    </div>
  );
}
