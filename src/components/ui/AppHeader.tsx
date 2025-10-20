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
      background: 'var(--telegram-bg)', 
      zIndex: 10, 
      borderBottom: '1px solid var(--telegram-border)',
      minHeight: '44px'
    }}>
      <div className="container-narrow" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 4, 
        justifyContent: 'space-between',
        minWidth: 0
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 4,
          flex: 1,
          minWidth: 0
        }}>
          {showBack && (
            <button
              onClick={onBack}
              className="btn-outline hit-lg"
              style={{ 
                height: 32, 
                padding: '0 8px',
                fontSize: '12px',
                flexShrink: 0
              }}
              aria-label="Назад"
            >
              ←
            </button>
          )}
          <h1 className="text-lg" style={{ 
            fontWeight: 600, 
            margin: 0,
            flex: 1,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minWidth: 0
          }}>
            {title}
          </h1>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 4,
          flexShrink: 0
        }}>
          {showHome && (
            <a 
              href={homeHref} 
              className="btn-outline hit-lg" 
              style={{ 
                height: 32, 
                padding: '0 8px', 
                textDecoration: 'none',
                fontSize: '12px',
                whiteSpace: 'nowrap'
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
              className="btn-primary hit-lg" 
              style={{ 
                height: 32, 
                padding: '0 8px', 
                textDecoration: 'none',
                fontSize: '12px',
                whiteSpace: 'nowrap'
              }}
            >
              Конт
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppHeader;

