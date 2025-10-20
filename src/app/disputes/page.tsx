'use client';

import React from 'react';
import { AppHeader } from '@/components/ui/AppHeader';

export default function DisputesPage() {
  return (
    <div className="container-narrow">
      <AppHeader title="Управление спорами" showBack onBack={() => history.back()} />
      <div className="section">
        <div className="card">
          <div className="text-lg" style={{ fontWeight: 600, marginBottom: 8 }}>Раздел в разработке</div>
          <div className="text-muted">Список споров будет доступен после обновления. Навигация и темы уже работают.</div>
        </div>
      </div>
    </div>
  );
}
