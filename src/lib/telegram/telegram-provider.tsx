'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { WebApp } from '@twa-dev/sdk';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface TelegramContextType {
  webApp: typeof WebApp;
  user: TelegramUser | null;
  isReady: boolean;
  theme: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
    secondary_bg_color: string;
  };
  platform: string;
  version: string;
  sendData: (data: string) => void;
  close: () => void;
  showAlert: (message: string) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
}

const TelegramContext = createContext<TelegramContextType | null>(null);

interface TelegramProviderProps {
  children: ReactNode;
}

export const TelegramProvider: React.FC<TelegramProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [theme, setTheme] = useState({
    bg_color: '#ffffff',
    text_color: '#000000',
    hint_color: '#999999',
    link_color: '#2481cc',
    button_color: '#2481cc',
    button_text_color: '#ffffff',
    secondary_bg_color: '#f1f1f1',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const webApp = WebApp;
      
      // Инициализация WebApp
      webApp.ready();
      webApp.expand();
      
      // Получение данных пользователя
      const initData = webApp.initDataUnsafe;
      if (initData.user) {
        setUser(initData.user as TelegramUser);
      }
      
      // Получение темы
      if (webApp.themeParams) {
        setTheme({
          bg_color: webApp.themeParams.bg_color || theme.bg_color,
          text_color: webApp.themeParams.text_color || theme.text_color,
          hint_color: webApp.themeParams.hint_color || theme.hint_color,
          link_color: webApp.themeParams.link_color || theme.link_color,
          button_color: webApp.themeParams.button_color || theme.button_color,
          button_text_color: webApp.themeParams.button_text_color || theme.button_text_color,
          secondary_bg_color: webApp.themeParams.secondary_bg_color || theme.secondary_bg_color,
        });
      }
      
      // Обновление CSS переменных
      const root = document.documentElement;
      root.style.setProperty('--tg-theme-bg-color', theme.bg_color);
      root.style.setProperty('--tg-theme-text-color', theme.text_color);
      root.style.setProperty('--tg-theme-hint-color', theme.hint_color);
      root.style.setProperty('--tg-theme-link-color', theme.link_color);
      root.style.setProperty('--tg-theme-button-color', theme.button_color);
      root.style.setProperty('--tg-theme-button-text-color', theme.button_text_color);
      root.style.setProperty('--tg-theme-secondary-bg-color', theme.secondary_bg_color);
      
      setIsReady(true);
      
      // Обработчики событий
      webApp.onEvent('themeChanged', () => {
        if (webApp.themeParams) {
          setTheme({
            bg_color: webApp.themeParams.bg_color || theme.bg_color,
            text_color: webApp.themeParams.text_color || theme.text_color,
            hint_color: webApp.themeParams.hint_color || theme.hint_color,
            link_color: webApp.themeParams.link_color || theme.link_color,
            button_color: webApp.themeParams.button_color || theme.button_color,
            button_text_color: webApp.themeParams.button_text_color || theme.button_text_color,
            secondary_bg_color: webApp.themeParams.secondary_bg_color || theme.secondary_bg_color,
          });
        }
      });
      
      webApp.onEvent('viewportChanged', () => {
        // Обновление viewport при изменении размера
        const viewportHeight = webApp.viewportHeight;
        if (viewportHeight) {
          root.style.setProperty('--tg-viewport-height', `${viewportHeight}px`);
        }
      });
    }
  }, [theme]);

  const contextValue: TelegramContextType = {
    webApp: WebApp,
    user,
    isReady,
    theme,
    platform: WebApp.platform,
    version: WebApp.version,
    sendData: (data: string) => WebApp.sendData(data),
    close: () => WebApp.close(),
    showAlert: (message: string) => WebApp.showAlert(message),
    showConfirm: (message: string, callback?: (confirmed: boolean) => void) => {
      WebApp.showConfirm(message, callback);
    },
  };

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = (): TelegramContextType => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider');
  }
  return context;
};
