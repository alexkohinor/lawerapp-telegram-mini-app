/**
 * User Context для управления состоянием пользователя
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getUserFromInitData, isTelegramWebApp } from '@/lib/auth/telegram-auth';

export interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  photoUrl?: string;
  isPremium: boolean;
  createdAt: Date;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isTelegramApp: boolean;
  login: (user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTelegramApp, setIsTelegramApp] = useState(false);

  // Проверяем, запущено ли в Telegram WebApp
  useEffect(() => {
    const isTelegram = isTelegramWebApp();
    setIsTelegramApp(isTelegram);

    if (isTelegram) {
      // Получаем пользователя из initData
      const telegramUser = getUserFromInitData();
      
      if (telegramUser) {
        // Аутентифицируемся через API
        authenticateUser(telegramUser);
      } else {
        setIsLoading(false);
      }
    } else {
      // В браузере - проверяем localStorage
      const savedUser = localStorage.getItem('lawerapp_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('lawerapp_user');
        }
      }
      setIsLoading(false);
    }
  }, []);

  const authenticateUser = async (telegramUser: any) => {
    try {
      // Для статического экспорта создаем пользователя локально
      const mockUser: User = {
        id: telegramUser.id?.toString() || 'demo-user',
        telegramId: telegramUser.id?.toString() || 'demo-telegram-id',
        username: telegramUser.username || 'demo_user',
        firstName: telegramUser.first_name || 'Demo',
        lastName: telegramUser.last_name || 'User',
        languageCode: telegramUser.language_code || 'ru',
        photoUrl: telegramUser.photo_url,
        isPremium: telegramUser.is_premium || false,
        createdAt: new Date()
      };

      setUser(mockUser);
      
      // Сохраняем в localStorage для браузера
      localStorage.setItem('lawerapp_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('lawerapp_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lawerapp_user');
  };

  const refreshUser = async () => {
    if (isTelegramApp && window.Telegram?.WebApp?.initData) {
      const telegramUser = getUserFromInitData();
      if (telegramUser) {
        await authenticateUser(telegramUser);
      }
    }
  };

  const value: UserContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isTelegramApp,
    login,
    logout,
    refreshUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
