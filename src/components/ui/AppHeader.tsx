'use client';

import React, { useEffect } from 'react';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showHome?: boolean;
  homeHref?: string;
  showContact?: boolean;
  contactHref?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, showBack = false, onBack, showHome = true, homeHref = '/', showContact = true, contactHref = 'https://t.me/+79688398919' }) => {
  useEffect(() => {
    const tg = (typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : undefined);
    if (!tg) return;
    if (showBack) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        onBack?.();
      });
    } else {
      tg.BackButton.hide();
    }
    return () => {
      try { tg?.BackButton?.hide?.(); } catch {}
    };
  }, [showBack, onBack]);

  return (
    <div style={{ padding: '12px 16px', position: 'sticky', top: 0, background: 'var(--telegram-bg)', zIndex: 10, borderBottom: '1px solid var(--telegram-border)' }}>
      <div className="container-narrow" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {showBack && (
            <button
              onClick={onBack}
              className="btn-outline"
              style={{ height: 36, padding: '0 12px' }}
              aria-label="Назад"
            >
              Назад
            </button>
          )}
          <h1 className="text-xl" style={{ fontWeight: 700, margin: 0 }}>{title}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {showHome && (
            <a href={homeHref} className="btn-outline" style={{ height: 36, padding: '0 12px', textDecoration: 'none' }}>Домой</a>
          )}
          {showContact && (
            <a href={contactHref} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ height: 36, padding: '0 12px', textDecoration: 'none' }}>Контакты</a>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppHeader;

