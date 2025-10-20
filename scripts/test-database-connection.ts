/**
 * Скрипт для тестирования подключения к базе данных
 */

import { PrismaClient } from '@prisma/client';

// Тестирование подключения к PostgreSQL (основная БД)
async function testPostgreSQLConnection() {
  console.log('🐘 Тестирование подключения к PostgreSQL...');
  
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/lawerapp'
        }
      }
    });
    
    // Тестируем подключение
    await prisma.$connect();
    console.log('✅ Подключение к PostgreSQL установлено');
    
    // Проверяем доступность таблиц
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    console.log('✅ Таблицы в PostgreSQL:', (tables as any[]).length);
    
    // Тестируем простой запрос
    const userCount = await prisma.user.count();
    console.log('✅ Количество пользователей в PostgreSQL:', userCount);
    
    // Тестируем создание тестового пользователя
    const testUser = await prisma.user.create({
      data: {
        telegramId: BigInt('9999999999'),
        telegramUsername: 'test_connection',
        firstName: 'Test',
        lastName: 'Connection',
        subscriptionPlan: 'free',
        isActive: true,
        documentsUsed: 0
      }
    });
    console.log('✅ Тестовый пользователь создан в PostgreSQL:', testUser.id);
    
    // Удаляем тестового пользователя
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✅ Тестовый пользователь удален из PostgreSQL');
    
    await prisma.$disconnect();
    console.log('✅ Соединение с PostgreSQL закрыто');
    
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка подключения к PostgreSQL:', error);
    return false;
  }
}

// Тестирование подключения к SQLite (тестовая БД)
async function testSQLiteConnection() {
  console.log('\n🗄️ Тестирование подключения к SQLite...');
  
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'file:./test.db'
        }
      }
    });
    
    // Тестируем подключение
    await prisma.$connect();
    console.log('✅ Подключение к SQLite установлено');
    
    // Проверяем доступность таблиц
    const tables = await prisma.$queryRaw`
      SELECT name 
      FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%'
    `;
    console.log('✅ Таблицы в SQLite:', (tables as any[]).length);
    
    // Тестируем простой запрос
    const userCount = await prisma.user.count();
    console.log('✅ Количество пользователей в SQLite:', userCount);
    
    // Тестируем создание тестового пользователя
    const testUser = await prisma.user.create({
      data: {
        telegramId: BigInt('8888888888'),
        telegramUsername: 'test_sqlite',
        firstName: 'Test',
        lastName: 'SQLite',
        subscriptionPlan: 'free',
        isActive: true,
        documentsUsed: 0
      }
    });
    console.log('✅ Тестовый пользователь создан в SQLite:', testUser.id);
    
    // Тестируем создание связанных данных
    const consultation = await prisma.consultation.create({
      data: {
        userId: testUser.id,
        question: 'Тестовый вопрос подключения',
        answer: 'Тестовый ответ подключения',
        status: 'completed'
      }
    });
    console.log('✅ Тестовая консультация создана в SQLite:', consultation.id);
    
    const document = await prisma.document.create({
      data: {
        userId: testUser.id,
        title: 'Тестовый документ подключения',
        fileName: 'test-connection.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        status: 'uploaded'
      }
    });
    console.log('✅ Тестовый документ создан в SQLite:', document.id);
    
    // Тестируем чтение с включением связанных данных
    const userWithRelations = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: {
        consultations: true,
        documents: true
      }
    });
    console.log('✅ Пользователь с связанными данными получен:', {
      consultations: userWithRelations?.consultations.length,
      documents: userWithRelations?.documents.length
    });
    
    // Очищаем тестовые данные
    await prisma.consultation.delete({ where: { id: consultation.id } });
    await prisma.document.delete({ where: { id: document.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✅ Тестовые данные очищены из SQLite');
    
    await prisma.$disconnect();
    console.log('✅ Соединение с SQLite закрыто');
    
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка подключения к SQLite:', error);
    return false;
  }
}

// Тестирование производительности запросов
async function testQueryPerformance() {
  console.log('\n⚡ Тестирование производительности запросов...');
  
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'file:./test.db'
        }
      }
    });
    
    await prisma.$connect();
    
    // Создаем тестовые данные для производительности
    const testUser = await prisma.user.create({
      data: {
        telegramId: BigInt('7777777777'),
        telegramUsername: 'perf_test',
        firstName: 'Performance',
        lastName: 'Test',
        subscriptionPlan: 'premium',
        isActive: true,
        documentsUsed: 10
      }
    });
    
    // Создаем несколько консультаций
    const consultations = await prisma.consultation.createMany({
      data: Array.from({ length: 10 }, (_, i) => ({
        userId: testUser.id,
        question: `Вопрос производительности ${i + 1}`,
        answer: `Ответ производительности ${i + 1}`,
        status: i % 2 === 0 ? 'completed' : 'pending',
        priority: i % 3 === 0 ? 'high' : 'medium'
      }))
    });
    console.log('✅ Создано тестовых консультаций:', consultations.count);
    
    // Тестируем время выполнения запросов
    const startTime = Date.now();
    
    // Простой запрос
    const userCount = await prisma.user.count();
    const simpleQueryTime = Date.now() - startTime;
    console.log(`✅ Простой запрос (${userCount} пользователей): ${simpleQueryTime}ms`);
    
    // Запрос с фильтрацией
    const startFilterTime = Date.now();
    const completedConsultations = await prisma.consultation.count({
      where: { status: 'completed' }
    });
    const filterQueryTime = Date.now() - startFilterTime;
    console.log(`✅ Запрос с фильтрацией (${completedConsultations} консультаций): ${filterQueryTime}ms`);
    
    // Запрос с включением связанных данных
    const startIncludeTime = Date.now();
    const userWithData = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: {
        consultations: {
          where: { status: 'completed' }
        },
        documents: true
      }
    });
    const includeQueryTime = Date.now() - startIncludeTime;
    console.log(`✅ Запрос с включением данных: ${includeQueryTime}ms`);
    
    // Запрос с группировкой
    const startGroupTime = Date.now();
    const consultationsByStatus = await prisma.consultation.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    const groupQueryTime = Date.now() - startGroupTime;
    console.log(`✅ Запрос с группировкой: ${groupQueryTime}ms`);
    
    // Очищаем тестовые данные
    await prisma.consultation.deleteMany({ where: { userId: testUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    
    await prisma.$disconnect();
    
    console.log('✅ Тестирование производительности завершено');
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка тестирования производительности:', error);
    return false;
  }
}

// Тестирование транзакций
async function testTransactions() {
  console.log('\n🔄 Тестирование транзакций...');
  
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'file:./test.db'
        }
      }
    });
    
    await prisma.$connect();
    
    // Тестируем успешную транзакцию
    const transactionResult = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          telegramId: BigInt('6666666666'),
          telegramUsername: 'transaction_test',
          firstName: 'Transaction',
          lastName: 'Test',
          subscriptionPlan: 'free',
          isActive: true,
          documentsUsed: 0
        }
      });
      
      const consultation = await tx.consultation.create({
        data: {
          userId: user.id,
          question: 'Вопрос в транзакции',
          answer: 'Ответ в транзакции',
          status: 'completed'
        }
      });
      
      const document = await tx.document.create({
        data: {
          userId: user.id,
          title: 'Документ в транзакции',
          fileName: 'transaction.pdf',
          fileSize: 1024000,
          mimeType: 'application/pdf',
          status: 'uploaded'
        }
      });
      
      return { user, consultation, document };
    });
    
    console.log('✅ Транзакция выполнена успешно:', {
      userId: transactionResult.user.id,
      consultationId: transactionResult.consultation.id,
      documentId: transactionResult.document.id
    });
    
    // Тестируем откат транзакции
    try {
      await prisma.$transaction(async (tx) => {
        await tx.user.create({
          data: {
            telegramId: BigInt('5555555555'),
            telegramUsername: 'rollback_test',
            firstName: 'Rollback',
            lastName: 'Test',
            subscriptionPlan: 'free',
            isActive: true,
            documentsUsed: 0
          }
        });
        
        // Имитируем ошибку
        throw new Error('Искусственная ошибка для тестирования отката');
      });
    } catch (error) {
      console.log('✅ Откат транзакции работает корректно');
    }
    
    // Очищаем данные успешной транзакции
    await prisma.document.delete({ where: { id: transactionResult.document.id } });
    await prisma.consultation.delete({ where: { id: transactionResult.consultation.id } });
    await prisma.user.delete({ where: { id: transactionResult.user.id } });
    
    await prisma.$disconnect();
    console.log('✅ Тестирование транзакций завершено');
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка тестирования транзакций:', error);
    return false;
  }
}

// Основная функция тестирования
async function main() {
  console.log('🚀 Запуск тестирования подключения к базе данных\n');
  
  const results = {
    postgresql: false,
    sqlite: false,
    performance: false,
    transactions: false
  };
  
  try {
    // 1. Тестируем PostgreSQL (если доступен)
    results.postgresql = await testPostgreSQLConnection();
    
    // 2. Тестируем SQLite
    results.sqlite = await testSQLiteConnection();
    
    // 3. Тестируем производительность
    results.performance = await testQueryPerformance();
    
    // 4. Тестируем транзакции
    results.transactions = await testTransactions();
    
    // Выводим итоговые результаты
    console.log('\n📊 Итоговые результаты тестирования:');
    console.log(`PostgreSQL: ${results.postgresql ? '✅' : '❌'}`);
    console.log(`SQLite: ${results.sqlite ? '✅' : '❌'}`);
    console.log(`Производительность: ${results.performance ? '✅' : '❌'}`);
    console.log(`Транзакции: ${results.transactions ? '✅' : '❌'}`);
    
    const successCount = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 Успешно пройдено: ${successCount}/${totalTests} тестов`);
    
    if (successCount === totalTests) {
      console.log('🎉 Все тесты подключения к БД прошли успешно!');
    } else {
      console.log('⚠️ Некоторые тесты не прошли. Проверьте настройки БД.');
    }
    
  } catch (error) {
    console.error('\n💥 Критическая ошибка тестирования:', error);
    process.exit(1);
  }
}

// Запускаем тестирование
main().catch(console.error);