'use client';

import React from 'react';
import { AppHeader } from '@/components/ui/AppHeader';

export default function PaymentsPage() {
  return (
    <div className="container-narrow">
      <AppHeader title="Платежи" showBack onBack={() => history.back()} />
      <div className="section">
        <div className="card">
          <div className="text-lg" style={{ fontWeight: 600, marginBottom: 8 }}>Раздел в разработке</div>
          <div className="text-muted">Список способов оплаты и история платежей появятся позже. Навигация уже доступна.</div>
        </div>
      </div>
    </div>
  );
}
