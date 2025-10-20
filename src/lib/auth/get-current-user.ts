import { NextRequest } from 'next/server';
import { User } from '@/types';

/**
 * Утилита для получения текущего пользователя из запроса
 * Основано на SECURITY_GUIDELINES.md
 */

export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  try {
    // В реальном приложении здесь должна быть проверка JWT токена
    // или валидация Telegram WebApp initData
    
    // Для демонстрации возвращаем мокового пользователя
    const mockUser: User = {
      id: '1',
      telegramId: 123456789,
      firstName: 'Иван',
      lastName: 'Иванов',
      username: 'ivan_ivanov',
      languageCode: 'ru',
      isPremium: false,
      createdAt: new Date('2024-10-01'),
      updatedAt: new Date('2024-10-16'),
    };

    return mockUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Проверка авторизации пользователя
 */
export async function requireAuth(request: NextRequest): Promise<User> {
  const user = await getCurrentUser(request);
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

/**
 * Проверка прав доступа к ресурсу
 */
export async function requireOwnership(request: NextRequest, resourceUserId: string): Promise<User> {
  const user = await requireAuth(request);
  
  if (user.id !== resourceUserId) {
    throw new Error('Forbidden');
  }
  
  return user;
}
