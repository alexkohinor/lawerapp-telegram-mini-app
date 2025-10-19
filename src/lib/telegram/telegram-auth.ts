'use client';

/**
 * Telegram аутентификация для LawerApp
 * Основано на .cursor/rules и ARCHITECTURE.md
 */

import * as React from 'react';
import { TelegramUser } from '@/types';

// Расширяем глобальный объект Window для Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: TelegramUser;
          auth_date?: number;
          hash?: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: Record<string, string>;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        isVerticalSwipesEnabled: boolean;
        ready(): void;
        expand(): void;
        close(): void;
        sendData(data: string): void;
        showPopup(params: {
          title: string;
          message: string;
          buttons?: Array<{
            id: string;
            type: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text: string;
          }>;
        }, callback?: (buttonId: string) => void): void;
        showAlert(message: string, callback?: () => void): void;
        showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
        showScanQrPopup(params: {
          text?: string;
        }, callback?: (text: string) => void): void;
        closeScanQrPopup(): void;
        readTextFromClipboard(callback?: (text: string) => void): void;
        requestWriteAccess(callback?: (granted: boolean) => void): void;
        requestContact(callback?: (granted: boolean) => void): void;
        openLink(url: string, options?: { try_instant_view?: boolean }): void;
        openTelegramLink(url: string): void;
        openInvoice(url: string, callback?: (status: string) => void): void;
        enableClosingConfirmation(): void;
        disableClosingConfirmation(): void;
        onEvent(eventType: string, eventHandler: () => void): void;
        offEvent(eventType: string, eventHandler: () => void): void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText(text: string): void;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
          show(): void;
          hide(): void;
          enable(): void;
          disable(): void;
          showProgress(leaveActive?: boolean): void;
          hideProgress(): void;
          setParams(params: {
            text?: string;
            color?: string;
            text_color?: string;
            is_active?: boolean;
            is_visible?: boolean;
          }): void;
        };
        BackButton: {
          isVisible: boolean;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
          show(): void;
          hide(): void;
        };
        HapticFeedback: {
          impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
          notificationOccurred(type: 'error' | 'success' | 'warning'): void;
          selectionChanged(): void;
        };
      };
    };
  }
}

/**
 * Хук для работы с Telegram WebApp
 */
export function useTelegramWebApp() {
  const webApp = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

  const init = React.useCallback(() => {
    if (webApp) {
      webApp.ready();
      webApp.expand();
    }
  }, [webApp]);

  const close = React.useCallback(() => {
    if (webApp) {
      webApp.close();
    }
  }, [webApp]);

  const showPopup = React.useCallback((
    title: string,
    message: string,
    buttons?: Array<{
      id: string;
      type: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }>,
    callback?: (buttonId: string) => void
  ) => {
    if (webApp) {
      webApp.showPopup({ title, message, buttons }, callback);
    }
  }, [webApp]);

  const showAlert = React.useCallback((message: string, callback?: () => void) => {
    if (webApp) {
      webApp.showAlert(message, callback);
    }
  }, [webApp]);

  const showConfirm = React.useCallback((message: string, callback?: (confirmed: boolean) => void) => {
    if (webApp) {
      webApp.showConfirm(message, callback);
    }
  }, [webApp]);

  const hapticFeedback = React.useCallback((type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred(type);
    }
  }, [webApp]);

  const notificationFeedback = React.useCallback((type: 'error' | 'success' | 'warning') => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.notificationOccurred(type);
    }
  }, [webApp]);

  return {
    webApp,
    init,
    close,
    showPopup,
    showAlert,
    showConfirm,
    hapticFeedback,
    notificationFeedback,
    isSupported: !!webApp,
    user: webApp?.initDataUnsafe.user,
    theme: webApp?.colorScheme || 'light',
    platform: webApp?.platform || 'unknown',
    version: webApp?.version || 'unknown',
  };
}

/**
 * Хук для Telegram аутентификации
 */
export function useTelegramAuth() {
  const { webApp, user, isSupported } = useTelegramWebApp();

  const isAuthenticated = React.useMemo(() => {
    return !!user && !!webApp?.initData;
  }, [user, webApp]);

  const validateInitData = React.useCallback(async (): Promise<boolean> => {
    if (!webApp?.initData) return false;

    try {
      // В реальном приложении здесь должна быть валидация на сервере
      // с использованием секретного ключа бота
      const response = await fetch('/api/auth/validate-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initData: webApp.initData,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to validate Telegram init data:', error);
      return false;
    }
  }, [webApp]);

  const login = React.useCallback(async () => {
    if (!isSupported) {
      throw new Error('Telegram WebApp is not supported');
    }

    const isValid = await validateInitData();
    if (!isValid) {
      throw new Error('Invalid Telegram authentication data');
    }

    return user;
  }, [isSupported, validateInitData, user]);

  const logout = React.useCallback(() => {
    // В Telegram WebApp нет стандартного logout
    // Можно очистить локальные данные
    if (typeof window !== 'undefined') {
      localStorage.removeItem('telegram_auth');
      sessionStorage.clear();
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isSupported,
    login,
    logout,
    validateInitData,
  };
}

/**
 * Провайдер для Telegram WebApp
 */
export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const { init } = useTelegramWebApp();

  React.useEffect(() => {
    init();
  }, [init]);

  return React.createElement(React.Fragment, null, children);
}
