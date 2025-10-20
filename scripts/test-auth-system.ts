/**
 * Скрипт для тестирования системы аутентификации и управления пользователями
 */

import { PrismaClient } from '@prisma/client';
import { TelegramAuthService } from '../src/lib/auth/telegram-auth';
import { SessionManager } from '../src/lib/auth/session-manager';
import { SubscriptionManager } from '../src/lib/auth/subscription-manager';
import { UsageLimitsManager } from '../src/lib/auth/usage-limits-manager';
import { UserManager } from '../src/lib/auth/user-manager';

const prisma = new PrismaClient();

// Тестовые данные
const testBotToken = 'test-bot-token';
const testTelegramAuthData = {
  id: 123456789,
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser',
  photo_url: 'https://example.com/photo.jpg',
  auth_date: Math.floor(Date.now() / 1000),
  hash: 'test-hash'
};

async function testTelegramAuth() {
  console.log('🔐 Тестирование Telegram Authentication...');
  
  try {
    const telegramAuth = new TelegramAuthService(testBotToken);
    
    // Создаем тестового пользователя
    const user = await telegramAuth.authenticateUser(testTelegramAuthData);
    console.log('✅ Пользователь аутентифицирован:', user.id);
    
    // Получаем пользователя по Telegram ID
    const foundUser = await telegramAuth.getUserByTelegramId(testTelegramAuthData.id);
    console.log('✅ Пользователь найден по Telegram ID:', foundUser?.id);
    
    // Обновляем профиль
    const updatedUser = await telegramAuth.updateUserProfile(user.id, {
      firstName: 'Updated',
      lastName: 'Name'
    });
    console.log('✅ Профиль обновлен:', updatedUser.firstName);
    
    // Получаем статистику
    const stats = await telegramAuth.getUserStats(user.id);
    console.log('✅ Статистика пользователя получена:', stats);
    
    return user;
    
  } catch (error) {
    console.error('❌ Ошибка Telegram Auth:', error);
    throw error;
  }
}

async function testSessionManager() {
  console.log('\n🔑 Тестирование Session Manager...');
  
  try {
    const sessionManager = new SessionManager();
    
    // Создаем сессию
    const session = await sessionManager.createSession({
      userId: 'test-user-id',
      telegramId: BigInt(123456789),
      userAgent: 'Test Agent',
      ipAddress: '127.0.0.1'
    });
    console.log('✅ Сессия создана:', session.id);
    
    // Валидируем сессию
    const validatedSession = await sessionManager.validateSession(session.sessionToken);
    console.log('✅ Сессия валидирована:', validatedSession?.id);
    
    // Обновляем сессию
    const refreshedSession = await sessionManager.refreshSession(session.sessionToken, 48);
    console.log('✅ Сессия обновлена:', refreshedSession?.id);
    
    // Получаем активные сессии
    const activeSessions = await sessionManager.getUserActiveSessions('test-user-id');
    console.log('✅ Активные сессии получены:', activeSessions.length);
    
    // Завершаем сессию
    const terminated = await sessionManager.terminateSession(session.sessionToken);
    console.log('✅ Сессия завершена:', terminated);
    
    return session;
    
  } catch (error) {
    console.error('❌ Ошибка Session Manager:', error);
    throw error;
  }
}

async function testSubscriptionManager() {
  console.log('\n💳 Тестирование Subscription Manager...');
  
  try {
    const subscriptionManager = new SubscriptionManager();
    
    // Получаем информацию о планах
    const allPlans = subscriptionManager.getAllPlans();
    console.log('✅ Все планы получены:', Object.keys(allPlans));
    
    // Получаем информацию о конкретном плане
    const premiumInfo = subscriptionManager.getSubscriptionInfo('premium');
    console.log('✅ Информация о Premium плане:', premiumInfo.plan);
    
    // Получаем подписку пользователя (мок)
    const userSubscription = await subscriptionManager.getUserSubscription('test-user-id');
    console.log('✅ Подписка пользователя получена:', userSubscription.plan);
    
    // Обновляем подписку
    const updatedSubscription = await subscriptionManager.updateUserSubscription(
      'test-user-id',
      'premium',
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 дней
    );
    console.log('✅ Подписка обновлена:', updatedSubscription.plan);
    
    // Проверяем лимиты
    const limits = await subscriptionManager.checkUserLimits('test-user-id');
    console.log('✅ Лимиты проверены:', limits.plan);
    
    // Получаем статистику подписок
    const stats = await subscriptionManager.getSubscriptionStats();
    console.log('✅ Статистика подписок получена:', stats.totalUsers);
    
    return updatedSubscription;
    
  } catch (error) {
    console.error('❌ Ошибка Subscription Manager:', error);
    throw error;
  }
}

async function testUsageLimitsManager() {
  console.log('\n📊 Тестирование Usage Limits Manager...');
  
  try {
    const usageLimitsManager = new UsageLimitsManager();
    
    // Проверяем лимиты пользователя
    const limits = await usageLimitsManager.checkUserLimits('test-user-id');
    console.log('✅ Лимиты пользователя проверены:', limits.plan);
    
    // Проверяем возможность использования ресурса
    const canUseDocuments = await usageLimitsManager.canUseResource('test-user-id', 'documents');
    console.log('✅ Может использовать документы:', canUseDocuments);
    
    // Увеличиваем счетчик использования
    await usageLimitsManager.incrementUsage('test-user-id', 'documents', 1);
    console.log('✅ Счетчик использования увеличен');
    
    // Получаем глобальную статистику
    const globalStats = await usageLimitsManager.getGlobalUsageStats();
    console.log('✅ Глобальная статистика получена:', globalStats.totalDocuments);
    
    // Проверяем нарушения лимитов
    const violations = await usageLimitsManager.checkLimitViolations();
    console.log('✅ Нарушения лимитов проверены:', violations.length);
    
    // Получаем рекомендации по обновлению
    const recommendations = await usageLimitsManager.getUpgradeRecommendations('test-user-id');
    console.log('✅ Рекомендации получены:', recommendations.recommendedPlan);
    
    return limits;
    
  } catch (error) {
    console.error('❌ Ошибка Usage Limits Manager:', error);
    throw error;
  }
}

async function testUserManager() {
  console.log('\n👤 Тестирование User Manager...');
  
  try {
    const userManager = new UserManager(testBotToken);
    
    // Аутентификация пользователя
    const authResult = await userManager.authenticateUser({
      telegramAuthData: testTelegramAuthData,
      userAgent: 'Test Agent',
      ipAddress: '127.0.0.1'
    });
    console.log('✅ Пользователь аутентифицирован через UserManager:', authResult.user.id);
    
    // Валидация сессии
    const validatedAuth = await userManager.validateSession(authResult.session.sessionToken);
    console.log('✅ Сессия валидирована через UserManager:', validatedAuth?.user.id);
    
    // Получение профиля
    const profile = await userManager.getUserProfile(authResult.user.id);
    console.log('✅ Профиль получен:', profile.id);
    
    // Обновление профиля
    const updatedProfile = await userManager.updateUserProfile(authResult.user.id, {
      firstName: 'Updated',
      lastName: 'Profile'
    });
    console.log('✅ Профиль обновлен:', updatedProfile.firstName);
    
    // Обновление подписки
    const updatedSubscription = await userManager.updateSubscription(
      authResult.user.id,
      'premium',
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );
    console.log('✅ Подписка обновлена:', updatedSubscription.subscription.plan);
    
    // Проверка лимитов
    const limits = await userManager.checkUserLimits(authResult.user.id);
    console.log('✅ Лимиты проверены:', limits.plan);
    
    // Получение статистики системы
    const systemStats = await userManager.getSystemStats();
    console.log('✅ Статистика системы получена:', systemStats.users.total);
    
    // Очистка истекших данных
    const cleanupResult = await userManager.cleanupExpiredData();
    console.log('✅ Очистка данных выполнена:', cleanupResult);
    
    // Выход из системы
    const logoutResult = await userManager.logout(authResult.session.sessionToken);
    console.log('✅ Выход выполнен:', logoutResult);
    
    return authResult;
    
  } catch (error) {
    console.error('❌ Ошибка User Manager:', error);
    throw error;
  }
}

async function testDatabaseOperations() {
  console.log('\n🗄️ Тестирование операций с базой данных...');
  
  try {
    // Создаем тестового пользователя
    const testUser = await prisma.user.create({
      data: {
        telegramId: BigInt(999999999),
        telegramUsername: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        subscriptionPlan: 'free',
        isActive: true,
        documentsUsed: 0
      }
    });
    console.log('✅ Тестовый пользователь создан:', testUser.id);
    
    // Создаем тестовую сессию
    const testSession = await prisma.session.create({
      data: {
        userId: testUser.id,
        sessionToken: 'test-session-token',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: true,
        userAgent: 'Test Agent',
        ipAddress: '127.0.0.1'
      }
    });
    console.log('✅ Тестовая сессия создана:', testSession.id);
    
    // Создаем тестовую консультацию
    const testConsultation = await prisma.consultation.create({
      data: {
        userId: testUser.id,
        question: 'Тестовый вопрос',
        answer: 'Тестовый ответ',
        status: 'completed'
      }
    });
    console.log('✅ Тестовая консультация создана:', testConsultation.id);
    
    // Создаем тестовый спор
    const testDispute = await prisma.dispute.create({
      data: {
        userId: testUser.id,
        title: 'Тестовый спор',
        description: 'Описание тестового спора',
        status: 'open',
        priority: 'medium'
      }
    });
    console.log('✅ Тестовый спор создан:', testDispute.id);
    
    // Очищаем тестовые данные
    await prisma.consultation.delete({ where: { id: testConsultation.id } });
    await prisma.dispute.delete({ where: { id: testDispute.id } });
    await prisma.session.delete({ where: { id: testSession.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✅ Тестовые данные очищены');
    
  } catch (error) {
    console.error('❌ Ошибка операций с БД:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Запуск тестирования системы аутентификации и управления пользователями\n');
  
  try {
    // 1. Тестируем операции с БД
    await testDatabaseOperations();
    
    // 2. Тестируем Telegram Auth
    const user = await testTelegramAuth();
    
    // 3. Тестируем Session Manager
    await testSessionManager();
    
    // 4. Тестируем Subscription Manager
    await testSubscriptionManager();
    
    // 5. Тестируем Usage Limits Manager
    await testUsageLimitsManager();
    
    // 6. Тестируем User Manager (интеграционный тест)
    await testUserManager();
    
    console.log('\n🎉 Все тесты прошли успешно!');
    
  } catch (error) {
    console.error('\n💥 Тестирование завершилось с ошибкой:', error);
    process.exit(1);
  } finally {
    // Закрываем соединение
    await prisma.$disconnect();
    console.log('\n👋 Соединение с базой данных закрыто');
  }
}

// Запускаем тестирование
main().catch(console.error);
