#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  console.log('🔌 Тестирование подключения к базе данных...\n');

  try {
    // 1. Проверяем подключение
    console.log('1. Проверка подключения...');
    await prisma.$connect();
    console.log('✅ Подключение к БД успешно установлено\n');

    // 2. Проверяем таблицы
    console.log('2. Проверка существования таблиц...');
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name LIKE 'lawerapp_%'
      ORDER BY name;
    `;
    console.log('📋 Найденные таблицы:');
    (tables as any[]).forEach((table: any) => {
      console.log(`   - ${table.name}`);
    });
    console.log('');

    // 3. Проверяем количество записей в каждой таблице
    console.log('3. Статистика записей в таблицах...');
    const userCount = await prisma.user.count();
    const disputeCount = await prisma.dispute.count();
    const consultationCount = await prisma.consultation.count();
    const documentCount = await prisma.document.count();
    const paymentCount = await prisma.payment.count();
    const timelineCount = await prisma.timelineEvent.count();

    console.log(`   👥 Пользователи: ${userCount}`);
    console.log(`   ⚖️ Споры: ${disputeCount}`);
    console.log(`   💬 Консультации: ${consultationCount}`);
    console.log(`   📄 Документы: ${documentCount}`);
    console.log(`   💳 Платежи: ${paymentCount}`);
    console.log(`   📅 События timeline: ${timelineCount}`);
    console.log('');

    // 4. Тестируем создание тестовой записи
    console.log('4. Тестирование создания записи...');
    const testUser = await prisma.user.create({
      data: {
        telegramId: BigInt(999999999),
        telegramUsername: 'test_user',
        firstName: 'Test',
        lastName: 'User',
        phone: '+79999999999',
        email: 'test@example.com',
      },
    });
    console.log(`✅ Создан тестовый пользователь: ${testUser.firstName} ${testUser.lastName} (ID: ${testUser.id})`);

    // 5. Тестируем создание тестового спора
    const testDispute = await prisma.dispute.create({
      data: {
        userId: testUser.id,
        title: 'Тестовый спор для проверки БД',
        description: 'Это тестовый спор, созданный для проверки работы базы данных',
        type: 'OTHER',
        status: 'ACTIVE',
        priority: 'MEDIUM',
        amount: 1000,
      },
    });
    console.log(`✅ Создан тестовый спор: ${testDispute.title} (ID: ${testDispute.id})`);

    // 6. Тестируем создание timeline события
    const testTimelineEvent = await prisma.timelineEvent.create({
      data: {
        disputeId: testDispute.id,
        type: 'CREATED',
        description: 'Тестовое событие для проверки БД',
        userId: testUser.id,
      },
    });
    console.log(`✅ Создано timeline событие: ${testTimelineEvent.description} (ID: ${testTimelineEvent.id})`);

    // 7. Тестируем чтение с relations
    console.log('\n5. Тестирование чтения с relations...');
    const disputeWithRelations = await prisma.dispute.findUnique({
      where: { id: testDispute.id },
      include: {
        user: true,
        documents: true,
        timeline: true,
      },
    });

    if (disputeWithRelations) {
      console.log(`✅ Спор найден: ${disputeWithRelations.title}`);
      console.log(`   👤 Пользователь: ${disputeWithRelations.user.firstName} ${disputeWithRelations.user.lastName}`);
      console.log(`   📄 Документов: ${disputeWithRelations.documents.length}`);
      console.log(`   📅 Событий timeline: ${disputeWithRelations.timeline.length}`);
    }

    // 8. Очищаем тестовые данные
    console.log('\n6. Очистка тестовых данных...');
    await prisma.timelineEvent.deleteMany({
      where: { disputeId: testDispute.id },
    });
    await prisma.dispute.delete({
      where: { id: testDispute.id },
    });
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    console.log('✅ Тестовые данные удалены');

    // 9. Тестируем транзакции
    console.log('\n7. Тестирование транзакций...');
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          telegramId: BigInt(888888888),
          telegramUsername: 'transaction_test',
          firstName: 'Transaction',
          lastName: 'Test',
        },
      });

      const dispute = await tx.dispute.create({
        data: {
          userId: user.id,
          title: 'Транзакционный тест',
          description: 'Тест транзакций',
          type: 'OTHER',
          status: 'ACTIVE',
          priority: 'LOW',
        },
      });

      await tx.timelineEvent.create({
        data: {
          disputeId: dispute.id,
          type: 'CREATED',
          description: 'Создан в транзакции',
          userId: user.id,
        },
      });

      console.log('✅ Транзакция выполнена успешно');
    });

    // Очищаем данные транзакции
    await prisma.timelineEvent.deleteMany({
      where: { description: 'Создан в транзакции' },
    });
    await prisma.dispute.deleteMany({
      where: { title: 'Транзакционный тест' },
    });
    await prisma.user.deleteMany({
      where: { telegramUsername: 'transaction_test' },
    });

    console.log('\n🎉 Все тесты подключения к БД прошли успешно!');
    console.log('✅ База данных полностью функциональна');

  } catch (error) {
    console.error('❌ Ошибка при тестировании БД:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Подключение к БД закрыто');
  }
}

// Запускаем тест
testDatabaseConnection().catch((error) => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});
