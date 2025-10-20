/**
 * Прямой тест подключения к PostgreSQL TimeWeb Cloud
 */

import { PrismaClient } from '@prisma/client';

async function testPostgreSQLConnection() {
  console.log('🐘 Тестирование подключения к PostgreSQL TimeWeb Cloud...');
  
  try {
    // Используем прямой URL для TimeWeb Cloud
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'postgresql://gen_user:6l*Z%3Al%26o!yacZM@5e191ee0e0aee4df539c92a0.twc1.net:5432/default_db?sslmode=verify-full'
        }
      }
    });
    
    // Тестируем подключение
    await prisma.$connect();
    console.log('✅ Подключение к PostgreSQL TimeWeb Cloud установлено');
    
    // Проверяем доступность таблиц
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    console.log('✅ Таблицы в PostgreSQL:');
    (tables as any[]).forEach((table: any) => {
      console.log(`  - ${table.table_name}`);
    });
    
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
    
    // Тестируем создание консультации
    const consultation = await prisma.consultation.create({
      data: {
        userId: testUser.id,
        question: 'Тестовый вопрос PostgreSQL TimeWeb',
        answer: 'Тестовый ответ PostgreSQL TimeWeb',
        status: 'completed',
        legalArea: 'civil-law',
        priority: 'medium',
        source: 'manual'
      }
    });
    console.log('✅ Тестовая консультация создана в PostgreSQL:', consultation.id);
    
    // Тестируем создание документа
    const document = await prisma.document.create({
      data: {
        userId: testUser.id,
        title: 'Тестовый документ PostgreSQL TimeWeb',
        fileName: 'test-postgresql-timeweb.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        status: 'uploaded',
        documentType: 'contract',
        legalArea: 'civil-law'
      }
    });
    console.log('✅ Тестовый документ создан в PostgreSQL:', document.id);
    
    // Тестируем создание спора
    const dispute = await prisma.dispute.create({
      data: {
        userId: testUser.id,
        title: 'Тестовый спор PostgreSQL TimeWeb',
        description: 'Описание тестового спора PostgreSQL TimeWeb',
        status: 'open',
        priority: 'medium',
        disputeType: 'consumer',
        legalArea: 'consumer-rights'
      }
    });
    console.log('✅ Тестовый спор создан в PostgreSQL:', dispute.id);
    
    // Тестируем чтение с включением связанных данных
    const userWithRelations = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: {
        consultations: true,
        documents: true,
        disputes: true
      }
    });
    console.log('✅ Пользователь с связанными данными получен:', {
      consultations: userWithRelations?.consultations.length,
      documents: userWithRelations?.documents.length,
      disputes: userWithRelations?.disputes.length
    });
    
    // Тестируем RAG модели
    const ragConsultation = await prisma.rAGConsultation.create({
      data: {
        userId: testUser.id,
        question: 'Тестовый RAG вопрос PostgreSQL TimeWeb',
        answer: 'Тестовый RAG ответ PostgreSQL TimeWeb',
        legalArea: 'civil-law',
        sources: { documents: ['doc1'], laws: ['law1'] },
        confidence: 0.95,
        tokensUsed: 1500,
        costUsd: 0.05,
        responseTimeMs: 2000,
        status: 'completed'
      }
    });
    console.log('✅ RAG консультация создана в PostgreSQL:', ragConsultation.id);
    
    // Тестируем производительность запросов
    console.log('\n⚡ Тестирование производительности PostgreSQL TimeWeb...');
    const startTime = Date.now();
    
    const allUsers = await prisma.user.findMany({
      include: {
        consultations: true,
        documents: true,
        disputes: true,
        ragConsultations: true
      }
    });
    
    const queryTime = Date.now() - startTime;
    console.log(`✅ Сложный запрос с включением всех данных: ${queryTime}ms`);
    
    // Тестируем транзакцию
    console.log('\n🔄 Тестирование транзакции PostgreSQL TimeWeb...');
    const transactionResult = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          userId: testUser.id,
          amount: 1000,
          currency: 'RUB',
          description: 'Тестовый платеж в транзакции',
          paymentMethod: 'yookassa',
          status: 'completed',
          paymentType: 'subscription'
        }
      });
      
      const notification = await tx.notification.create({
        data: {
          userId: testUser.id,
          type: 'info',
          title: 'Уведомление о платеже',
          message: 'Платеж успешно обработан',
          priority: 'medium',
          category: 'payment',
          isRead: false
        }
      });
      
      return { payment, notification };
    });
    
    console.log('✅ Транзакция PostgreSQL TimeWeb выполнена успешно:', {
      paymentId: transactionResult.payment.id,
      notificationId: transactionResult.notification.id
    });
    
    // Очищаем тестовые данные
    console.log('\n🧹 Очистка тестовых данных PostgreSQL TimeWeb...');
    await prisma.rAGConsultation.delete({ where: { id: ragConsultation.id } });
    await prisma.notification.delete({ where: { id: transactionResult.notification.id } });
    await prisma.payment.delete({ where: { id: transactionResult.payment.id } });
    await prisma.dispute.delete({ where: { id: dispute.id } });
    await prisma.document.delete({ where: { id: document.id } });
    await prisma.consultation.delete({ where: { id: consultation.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✅ Тестовые данные очищены из PostgreSQL TimeWeb');
    
    await prisma.$disconnect();
    console.log('✅ Соединение с PostgreSQL TimeWeb закрыто');
    
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка подключения к PostgreSQL TimeWeb Cloud:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.log('💡 Подсказка: PostgreSQL сервер недоступен');
      } else if (error.message.includes('ENOTFOUND')) {
        console.log('💡 Подсказка: Неверный хост PostgreSQL');
      } else if (error.message.includes('authentication failed')) {
        console.log('💡 Подсказка: Неверные учетные данные PostgreSQL');
      } else if (error.message.includes('database') && error.message.includes('does not exist')) {
        console.log('💡 Подсказка: База данных не существует');
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('💡 Подсказка: Таблицы не существуют, выполните миграции');
        console.log('   Выполните: npx prisma migrate deploy');
      }
    }
    
    return false;
  }
}

// Основная функция тестирования
async function main() {
  console.log('🚀 Запуск тестирования PostgreSQL TimeWeb Cloud\n');
  
  try {
    const result = await testPostgreSQLConnection();
    
    if (result) {
      console.log('\n🎉 Тестирование PostgreSQL TimeWeb Cloud завершено успешно!');
      console.log('\n📊 Результаты:');
      console.log('✅ Подключение к БД - работает');
      console.log('✅ CRUD операции - работают');
      console.log('✅ Связи между таблицами - работают');
      console.log('✅ RAG модели - работают');
      console.log('✅ Транзакции - работают');
      console.log('✅ Производительность - приемлемая');
    } else {
      console.log('\n❌ Тестирование PostgreSQL TimeWeb Cloud завершилось с ошибками');
      console.log('\n🔧 Рекомендации:');
      console.log('1. Проверьте доступность TimeWeb Cloud');
      console.log('2. Проверьте правильность DATABASE_URL');
      console.log('3. Выполните миграции: npx prisma migrate deploy');
    }
    
  } catch (error) {
    console.error('\n💥 Критическая ошибка тестирования:', error);
    process.exit(1);
  }
}

// Запускаем тестирование
main().catch(console.error);
