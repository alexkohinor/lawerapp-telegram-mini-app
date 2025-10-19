'use client';

import { useState, useEffect } from 'react';
import { isTelegramWebApp, getUserFromInitData, TelegramUser } from '@/lib/auth/telegram-auth';

export function useTelegramUser() {
  const [isTelegramApp, setIsTelegramApp] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTelegramApp = () => {
      const isTelegram = isTelegramWebApp();
      setIsTelegramApp(isTelegram);
      
      if (isTelegram) {
        const telegramUser = getUserFromInitData();
        setUser(telegramUser);
      }
      
      setIsLoading(false);
    };

    checkTelegramApp();
  }, []);

  const showAlert = (message: string) => {
    if (isTelegramApp && window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert(message);
    } else {
      alert(message);
    }
  };

  const showConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (isTelegramApp && window.Telegram?.WebApp) {
        window.Telegram.WebApp.showConfirm(message, (confirmed) => {
          resolve(confirmed);
        });
      } else {
        resolve(confirm(message));
      }
    });
  };

  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
    if (isTelegramApp && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
    }
  };

  const expand = () => {
    if (isTelegramApp && window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
    }
  };

  const close = () => {
    if (isTelegramApp && window.Telegram?.WebApp) {
      window.Telegram.WebApp.close();
    }
  };

  return {
    isTelegramApp,
    user,
    isLoading,
    showAlert,
    showConfirm,
    hapticFeedback,
    expand,
    close,
  };
}
