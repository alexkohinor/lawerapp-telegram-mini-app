'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface TelegramTheme {
  backgroundColor: string;
  textColor: string;
  hintColor: string;
  linkColor: string;
  buttonColor: string;
  buttonTextColor: string;
  secondaryBackgroundColor: string;
}

interface TelegramThemeContextType {
  theme: TelegramTheme;
  isDark: boolean;
}

const defaultTheme: TelegramTheme = {
  backgroundColor: '#ffffff',
  textColor: '#000000',
  hintColor: '#999999',
  linkColor: '#2481cc',
  buttonColor: '#2481cc',
  buttonTextColor: '#ffffff',
  secondaryBackgroundColor: '#f1f1f1',
};

const TelegramThemeContext = createContext<TelegramThemeContextType>({
  theme: defaultTheme,
  isDark: false,
});

export function TelegramThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<TelegramTheme>(defaultTheme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Получаем тему от Telegram
      const themeParams = tg.themeParams;
      
      if (themeParams) {
        const newTheme: TelegramTheme = {
          backgroundColor: themeParams.bg_color || defaultTheme.backgroundColor,
          textColor: themeParams.text_color || defaultTheme.textColor,
          hintColor: themeParams.hint_color || defaultTheme.hintColor,
          linkColor: themeParams.link_color || defaultTheme.linkColor,
          buttonColor: themeParams.button_color || defaultTheme.buttonColor,
          buttonTextColor: themeParams.button_text_color || defaultTheme.buttonTextColor,
          secondaryBackgroundColor: themeParams.secondary_bg_color || defaultTheme.secondaryBackgroundColor,
        };
        
        setTheme(newTheme);
        setIsDark(tg.colorScheme === 'dark');
        
        // Применяем CSS переменные
        const root = document.documentElement;
        root.style.setProperty('--tg-bg-color', newTheme.backgroundColor);
        root.style.setProperty('--tg-text-color', newTheme.textColor);
        root.style.setProperty('--tg-hint-color', newTheme.hintColor);
        root.style.setProperty('--tg-link-color', newTheme.linkColor);
        root.style.setProperty('--tg-button-color', newTheme.buttonColor);
        root.style.setProperty('--tg-button-text-color', newTheme.buttonTextColor);
        root.style.setProperty('--tg-secondary-bg-color', newTheme.secondaryBackgroundColor);
      }
    }
  }, []);

  return (
    <TelegramThemeContext.Provider value={{ theme, isDark }}>
      {children}
    </TelegramThemeContext.Provider>
  );
}

export function useTelegramTheme() {
  const context = useContext(TelegramThemeContext);
  if (context === undefined) {
    throw new Error('useTelegramTheme must be used within a TelegramThemeProvider');
  }
  return context;
}