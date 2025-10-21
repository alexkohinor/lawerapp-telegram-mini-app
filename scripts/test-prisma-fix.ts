/**
 * Тест исправления Prisma Data Proxy проблемы
 */

import { PrismaClient } from '@prisma/client';

async function testPrismaConnection() {
  console.log('🔧 Тестирование исправления Prisma Data Proxy...');
  
  try {
    // Создаем новый Prisma Client с явными настройками
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      log: ['query', 'error', 'warn'],
      errorFormat: 'pretty',
    });
    
    console.log('✅ Prisma Client создан');
    console.log('📊 DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 20) + '...');
    
    // Тестируем подключение
    await prisma.$connect();
    console.log('✅ Подключение к БД установлено');
    
    // Тестируем простой запрос
    const userCount = await prisma.user.count();
    console.log('✅ Количество пользователей:', userCount);
    
    // Тестируем создание пользователя
    const testUser = await prisma.user.create({
      data: {
        telegramId: BigInt('1234567890'),
        telegramUsername: 'test_fix',
        firstName: 'Test',
        lastName: 'Fix',
        subscriptionPlan: 'free',
        isActive: true,
        documentsUsed: 0
      }
    });
    console.log('✅ Тестовый пользователь создан:', testUser.id);
    
    // Тестируем чтение
    const user = await prisma.user.findUnique({
      where: { id: testUser.id }
    });
    console.log('✅ Пользователь прочитан:', user?.firstName);
    
    // Очищаем
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✅ Тестовый пользователь удален');
    
    await prisma.$disconnect();
    console.log('✅ Соединение закрыто');
    
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Запуск тестирования исправления Prisma\n');
  
  const result = await testPrismaConnection();
  
  if (result) {
    console.log('\n🎉 Prisma Data Proxy проблема исправлена!');
  } else {
    console.log('\n❌ Проблема с Prisma Data Proxy не исправлена');
  }
}

main().catch(console.error);
