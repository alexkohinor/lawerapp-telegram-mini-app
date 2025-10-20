'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useTelegramAuth } from '@/lib/telegram/telegram-auth';
import { User } from '@/types';

/**
 * Хук для управления состоянием аутентификации
 * Основано на ARCHITECTURE.md и SECURITY_GUIDELINES.md
 */

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: (user: User) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Хук для работы с аутентификацией
 */
export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    setLoading,
    setError,
    clearError,
  } = useAuthStore();

  const { user: telegramUser, isAuthenticated: telegramAuth, login: telegramLogin } = useTelegramAuth();

  // Синхронизация с Telegram аутентификацией
  React.useEffect(() => {
    if (telegramAuth && telegramUser && !isAuthenticated) {
      // Конвертируем TelegramUser в User
      const userData: User = {
        id: telegramUser.id.toString(),
        telegramId: telegramUser.id,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        username: telegramUser.username,
        languageCode: telegramUser.language_code,
        isPremium: telegramUser.is_premium,
        photoUrl: telegramUser.photo_url,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      login(userData);
    } else if (!telegramAuth && isAuthenticated) {
      logout();
    }
  }, [telegramAuth, telegramUser, isAuthenticated, login, logout]);

  const handleLogin = React.useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      const telegramUserData = await telegramLogin();
      if (telegramUserData) {
        // В реальном приложении здесь должен быть API вызов
        // для создания/обновления пользователя в базе данных
        const userData: User = {
          id: telegramUserData.id.toString(),
          telegramId: telegramUserData.id,
          firstName: telegramUserData.first_name,
          lastName: telegramUserData.last_name,
          username: telegramUserData.username,
          languageCode: telegramUserData.language_code,
          isPremium: telegramUserData.is_premium,
          photoUrl: telegramUserData.photo_url,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        login(userData);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ошибка аутентификации');
    } finally {
      setLoading(false);
    }
  }, [telegramLogin, login, setLoading, setError, clearError]);

  const handleLogout = React.useCallback(() => {
    logout();
    // В реальном приложении здесь должен быть API вызов
    // для очистки сессии на сервере
  }, [logout]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    clearError,
  };
}

// Импорт React для хуков
import * as React from 'react';
