'use client';

import React, { useEffect } from 'react';

type ThemeParams = Partial<{
  bg_color: string;
  text_color: string;
  hint_color: string;
  link_color: string;
  button_color: string;
  button_text_color: string;
  secondary_bg_color: string;
}>;

type TGWebApp = {
  themeParams?: ThemeParams;
};

type TGGlobal = { Telegram?: { WebApp?: TGWebApp } };

export default function ThemeBridge() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tg = (window as unknown as TGGlobal).Telegram?.WebApp;
    const tp = tg?.themeParams;
    if (!tp) return;
    const root = document.documentElement;
    const map: Record<string, string | undefined> = {
      '--tg-theme-bg-color': tp.bg_color,
      '--tg-theme-text-color': tp.text_color,
      '--tg-theme-hint-color': tp.hint_color,
      '--tg-theme-link-color': tp.link_color,
      '--tg-theme-button-color': tp.button_color,
      '--tg-theme-button-text-color': tp.button_text_color,
      '--tg-theme-secondary-bg-color': tp.secondary_bg_color,
    };
    Object.entries(map).forEach(([k, v]) => {
      if (v) root.style.setProperty(k, v);
    });
  }, []);

  return null;
}


