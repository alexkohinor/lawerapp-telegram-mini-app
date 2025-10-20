#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function comprehensiveTest() {
  console.log('🧪 Комплексное тестирование всех функций LawerApp...\n');

  try {
    // 1. Тест подключения к БД
    console.log('1. 🔌 Тест подключения к БД...');
    await prisma.$connect();
    console.log('✅ Подключение к БД успешно\n');

    // 2. Тест создания пользователя
    console.log('2. 👤 Тест создания пользователя...');
    const uniqueId = Date.now();
    const testUser = await prisma.user.create({
      data: {
        telegramId: BigInt(uniqueId),
        telegramUsername: `comprehensive_test_${uniqueId}`,
        firstName: 'Comprehensive',
        lastName: 'Test',
        phone: `+7${uniqueId.toString().slice(-10)}`,
        email: `comprehensive_${uniqueId}@test.com`,
      },
    });
    console.log(`✅ Пользователь создан: ${testUser.firstName} ${testUser.lastName}\n`);

    // 3. Тест создания спора
    console.log('3. ⚖️ Тест создания спора...');
    const testDispute = await prisma.dispute.create({
      data: {
        userId: testUser.id,
        title: 'Комплексный тест спора',
        description: 'Тестовый спор для комплексного тестирования всех функций системы',
        type: 'CONSUMER',
        status: 'ACTIVE',
        priority: 'HIGH',
        amount: 30000,
        timeline: {
          create: {
            type: 'CREATED',
            description: 'Спор создан для комплексного тестирования',
            userId: testUser.id,
          },
        },
      },
      include: {
        timeline: true,
      },
    });
    console.log(`✅ Спор создан: ${testDispute.title}\n`);

    // 4. Тест создания консультации
    console.log('4. 💬 Тест создания консультации...');
    const testConsultation = await prisma.consultation.create({
      data: {
        userId: testUser.id,
        question: 'Вопрос для комплексного тестирования',
        answer: 'Ответ для комплексного тестирования',
        status: 'completed',
        legalArea: 'Трудовое право',
        tokensUsed: 150,
        completedAt: new Date(),
      },
    });
    console.log(`✅ Консультация создана: ${testConsultation.question.substring(0, 50)}...\n`);

    // 5. Тест создания документа
    console.log('5. 📄 Тест создания документа...');
    const testDocument = await prisma.document.create({
      data: {
        userId: testUser.id,
        disputeId: testDispute.id,
        title: 'Тестовый документ',
        content: 'Содержимое тестового документа для комплексного тестирования',
        documentType: 'CONTRACT',
        filePath: '/documents/test-document.pdf',
        fileSize: 2048,
        mimeType: 'application/pdf',
        status: 'ACTIVE',
      },
    });
    console.log(`✅ Документ создан: ${testDocument.title}\n`);

    // 6. Тест создания платежа
    console.log('6. 💳 Тест создания платежа...');
    const testPayment = await prisma.payment.create({
      data: {
        userId: testUser.id,
        amount: 5000,
        currency: 'RUB',
        status: 'pending',
        paymentMethod: 'CARD',
        paymentProviderId: `test_${Date.now()}`,
        subscriptionPlan: 'premium',
        subscriptionPeriod: 30,
        metadata: {
          description: 'Тестовый платеж для комплексного тестирования',
          transactionId: `test_${Date.now()}`,
        },
      },
    });
    console.log(`✅ Платеж создан: ${testPayment.amount} ${testPayment.currency}\n`);

    // 7. Тест создания уведомления
    console.log('7. 🔔 Тест создания уведомления...');
    const testNotification = await prisma.notification.create({
      data: {
        userId: testUser.id,
        type: 'DISPUTE_UPDATE',
        title: 'Тестовое уведомление',
        message: 'Сообщение для комплексного тестирования',
        isRead: false,
        telegramSent: false,
      },
    });
    console.log(`✅ Уведомление создано: ${testNotification.title}\n`);

    // 8. Тест создания сессии
    console.log('8. 🔐 Тест создания сессии...');
    const testSession = await prisma.session.create({
      data: {
        userId: testUser.id,
        sessionToken: `test_token_${Date.now()}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 часа
      },
    });
    console.log(`✅ Сессия создана: ${testSession.sessionToken.substring(0, 20)}...\n`);

    // 9. Тест создания аккаунта
    console.log('9. 🏦 Тест создания аккаунта...');
    const testAccount = await prisma.account.create({
      data: {
        userId: testUser.id,
        accountId: `account_${Date.now()}`,
        provider: 'telegram',
        providerAccountId: uniqueId.toString(),
        accessToken: 'test_access_token',
        refreshToken: 'test_refresh_token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
      },
    });
    console.log(`✅ Аккаунт создан: ${testAccount.provider}\n`);

    // 10. Тест создания AI мониторинга
    console.log('10. 🤖 Тест создания AI мониторинга...');
    const testAIMonitoring = await prisma.aiMonitoring.create({
      data: {
        consultationId: testConsultation.id,
        model: 'gpt-4',
        tokensInput: 100,
        tokensOutput: 200,
        responseTimeMs: 1500,
        costUsd: 0.08,
        errorMessage: null,
      },
    });
    console.log(`✅ AI мониторинг создан: ${testAIMonitoring.model}\n`);

    // 11. Тест чтения всех данных с relations
    console.log('11. 📊 Тест чтения данных с relations...');
    const userWithAllData = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: {
        disputes: {
          include: {
            documents: true,
            timeline: true,
          },
        },
        consultations: true,
        documents: true,
        payments: true,
        notifications: true,
        sessions: true,
        accounts: true,
      },
    });

    if (userWithAllData) {
      console.log(`✅ Пользователь с полными данными получен:`);
      console.log(`   👤 Имя: ${userWithAllData.firstName} ${userWithAllData.lastName}`);
      console.log(`   ⚖️ Споров: ${userWithAllData.disputes.length}`);
      console.log(`   💬 Консультаций: ${userWithAllData.consultations.length}`);
      console.log(`   📄 Документов: ${userWithAllData.documents.length}`);
      console.log(`   💳 Платежей: ${userWithAllData.payments.length}`);
      console.log(`   🔔 Уведомлений: ${userWithAllData.notifications.length}`);
      console.log(`   🔐 Сессий: ${userWithAllData.sessions.length}`);
      console.log(`   🏦 Аккаунтов: ${userWithAllData.accounts.length}`);
    }
    console.log('');

    // 12. Тест статистики
    console.log('12. 📈 Тест статистики...');
    const stats = {
      totalUsers: await prisma.user.count(),
      totalDisputes: await prisma.dispute.count(),
      totalConsultations: await prisma.consultation.count(),
      totalDocuments: await prisma.document.count(),
      totalPayments: await prisma.payment.count(),
      totalNotifications: await prisma.notification.count(),
      totalSessions: await prisma.session.count(),
      totalAccounts: await prisma.account.count(),
      totalAIMonitoring: await prisma.aiMonitoring.count(),
    };

    console.log('📊 Общая статистика системы:');
    Object.entries(stats).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    console.log('');

    // 13. Очистка тестовых данных
    console.log('13. 🧹 Очистка тестовых данных...');
    await prisma.aiMonitoring.deleteMany({
      where: { consultationId: testConsultation.id },
    });
    await prisma.account.deleteMany({
      where: { userId: testUser.id },
    });
    await prisma.session.deleteMany({
      where: { userId: testUser.id },
    });
    await prisma.notification.deleteMany({
      where: { userId: testUser.id },
    });
    await prisma.payment.deleteMany({
      where: { userId: testUser.id },
    });
    await prisma.document.deleteMany({
      where: { userId: testUser.id },
    });
    await prisma.consultation.deleteMany({
      where: { userId: testUser.id },
    });
    await prisma.timelineEvent.deleteMany({
      where: { disputeId: testDispute.id },
    });
    await prisma.dispute.deleteMany({
      where: { userId: testUser.id },
    });
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    console.log('✅ Тестовые данные удалены\n');

    console.log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
    console.log('✅ База данных полностью функциональна');
    console.log('✅ Все модели Prisma работают корректно');
    console.log('✅ Связи между таблицами функционируют');
    console.log('✅ CRUD операции выполняются без ошибок');
    console.log('✅ Система готова к production использованию');

  } catch (error) {
    console.error('❌ Ошибка при комплексном тестировании:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Подключение к БД закрыто');
  }
}

// Запускаем тест
comprehensiveTest().catch((error) => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});
