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
    const w = typeof window !== 'undefined' ? window : undefined;
    // Narrow types without 'any'
    type TGWebApp = { BackButton: { show: () => void; hide: () => void; onClick: (cb: () => void) => void } };
    type TGGlobal = { Telegram?: { WebApp?: TGWebApp } };
    const tg = (w && (w as unknown as TGGlobal).Telegram?.WebApp) as TGWebApp | undefined;
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
    <div style={{ 
      padding: '8px 16px', 
      position: 'sticky', 
      top: 0, 
      background: 'var(--tg-theme-bg-color, #ffffff)', 
      zIndex: 10, 
      borderBottom: '1px solid #e5e7eb',
      minHeight: '44px',
      boxSizing: 'border-box'
    }}>
      <div className="nav-responsive">
        {showBack && (
          <button
            onClick={onBack}
            className="nav-item"
            style={{ 
              flex: '0 0 auto',
              minWidth: '60px',
              maxWidth: '80px'
            }}
            aria-label="Назад"
          >
            ← Назад
          </button>
        )}
        
        <div className="nav-item active" style={{ 
          flex: '1 1 auto',
          minWidth: 0,
          maxWidth: 'none'
        }}>
          <span style={{
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {title}
          </span>
        </div>
        
        {showHome && (
          <a 
            href={homeHref} 
            className="nav-item"
            style={{ 
              flex: '0 0 auto',
              minWidth: '60px',
              maxWidth: '80px',
              textDecoration: 'none'
            }}
          >
            Домой
          </a>
        )}
        
        {showContact && (
          <a 
            href={contactHref} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="nav-item"
            style={{ 
              flex: '0 0 auto',
              minWidth: '60px',
              maxWidth: '80px',
              textDecoration: 'none'
            }}
          >
            Конт
          </a>
        )}
      </div>
    </div>
  );
};

export default AppHeader;

