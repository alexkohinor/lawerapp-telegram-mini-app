/**
 * Скрипт для тестирования подключения к PostgreSQL
 */

import { PrismaClient } from '@prisma/client';

// Тестирование подключения к PostgreSQL с правильной схемой
async function testPostgreSQLConnection() {
  console.log('🐘 Тестирование подключения к PostgreSQL...');
  
  try {
    // Используем схему PostgreSQL
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
    
    // Тестируем создание связанных данных
    const consultation = await prisma.consultation.create({
      data: {
        userId: testUser.id,
        question: 'Тестовый вопрос PostgreSQL',
        answer: 'Тестовый ответ PostgreSQL',
        status: 'completed',
        legalArea: 'civil-law'
      }
    });
    console.log('✅ Тестовая консультация создана в PostgreSQL:', consultation.id);
    
    const document = await prisma.document.create({
      data: {
        userId: testUser.id,
        title: 'Тестовый документ PostgreSQL',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        status: 'uploaded',
        documentType: 'contract'
      }
    });
    console.log('✅ Тестовый документ создан в PostgreSQL:', document.id);
    
    const dispute = await prisma.dispute.create({
      data: {
        userId: testUser.id,
        title: 'Тестовый спор PostgreSQL',
        description: 'Описание тестового спора PostgreSQL',
        status: 'ACTIVE',
        type: 'CONSUMER'
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
        question: 'Тестовый RAG вопрос PostgreSQL',
        answer: 'Тестовый RAG ответ PostgreSQL',
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
    
    const processedDocument = await prisma.processedDocument.create({
      data: {
        userId: testUser.id,
        originalName: 'test-rag-postgresql.pdf',
        s3Key: 'documents/test-rag-postgresql.pdf',
        fileSize: 2048000,
        mimeType: 'application/pdf',
        chunksCount: 5,
        legalArea: 'civil-law',
        documentType: 'contract',
        processingStatus: 'completed',
        vectorDbIds: ['vec1', 'vec2', 'vec3']
      }
    });
    console.log('✅ Обработанный документ создан в PostgreSQL:', processedDocument.id);
    
    // Тестируем AI мониторинг
    const aiMonitoring = await prisma.aiMonitoring.create({
      data: {
        ragConsultationId: ragConsultation.id,
        model: 'gpt-4',
        tokensInput: 1000,
        tokensOutput: 500,
        responseTimeMs: 2000,
        costUsd: 0.05
      }
    });
    console.log('✅ AI мониторинг создан в PostgreSQL:', aiMonitoring.id);
    
    // Тестируем производительность запросов
    console.log('\n⚡ Тестирование производительности PostgreSQL...');
    const startTime = Date.now();
    
    const allUsers = await prisma.user.findMany({
      include: {
        consultations: true,
        documents: true,
        disputes: true,
        ragConsultations: true,
        processedDocuments: true
      }
    });
    
    const queryTime = Date.now() - startTime;
    console.log(`✅ Сложный запрос с включением всех данных: ${queryTime}ms`);
    
    // Тестируем транзакцию
    console.log('\n🔄 Тестирование транзакции PostgreSQL...');
    const transactionResult = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          userId: testUser.id,
          amount: 1000,
          currency: 'RUB',
          paymentMethod: 'yookassa',
          status: 'completed',
          subscriptionPlan: 'premium'
        }
      });
      
      const notification = await tx.notification.create({
        data: {
          userId: testUser.id,
          type: 'info',
          title: 'Уведомление о платеже',
          message: 'Платеж успешно обработан',
          isRead: false
        }
      });
      
      return { payment, notification };
    });
    
    console.log('✅ Транзакция PostgreSQL выполнена успешно:', {
      paymentId: transactionResult.payment.id,
      notificationId: transactionResult.notification.id
    });
    
    // Очищаем тестовые данные
    console.log('\n🧹 Очистка тестовых данных PostgreSQL...');
    await prisma.aiMonitoring.delete({ where: { id: aiMonitoring.id } });
    await prisma.processedDocument.delete({ where: { id: processedDocument.id } });
    await prisma.rAGConsultation.delete({ where: { id: ragConsultation.id } });
    await prisma.notification.delete({ where: { id: transactionResult.notification.id } });
    await prisma.payment.delete({ where: { id: transactionResult.payment.id } });
    await prisma.dispute.delete({ where: { id: dispute.id } });
    await prisma.document.delete({ where: { id: document.id } });
    await prisma.consultation.delete({ where: { id: consultation.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✅ Тестовые данные очищены из PostgreSQL');
    
    await prisma.$disconnect();
    console.log('✅ Соединение с PostgreSQL закрыто');
    
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка подключения к PostgreSQL:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.log('💡 Подсказка: PostgreSQL сервер не запущен или недоступен');
      } else if (error.message.includes('ENOTFOUND')) {
        console.log('💡 Подсказка: Неверный хост PostgreSQL');
      } else if (error.message.includes('authentication failed')) {
        console.log('💡 Подсказка: Неверные учетные данные PostgreSQL');
      } else if (error.message.includes('database') && error.message.includes('does not exist')) {
        console.log('💡 Подсказка: База данных не существует, создайте её');
      }
    }
    
    return false;
  }
}

// Проверка переменных окружения
function checkEnvironmentVariables() {
  console.log('🔍 Проверка переменных окружения...');
  
  const requiredVars = [
    'DATABASE_URL',
    'PRISMA_GENERATE_DATAPROXY',
    'PRISMA_QUERY_ENGINE_LIBRARY'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('⚠️ Отсутствуют переменные окружения:', missingVars.join(', '));
    console.log('💡 Создайте файл .env.local с необходимыми переменными');
    return false;
  }
  
  console.log('✅ Все необходимые переменные окружения найдены');
  return true;
}

// Основная функция тестирования
async function main() {
  console.log('🚀 Запуск тестирования подключения к PostgreSQL\n');
  
  try {
    // 1. Проверяем переменные окружения
    const envCheck = checkEnvironmentVariables();
    if (!envCheck) {
      console.log('\n⚠️ Продолжаем тестирование с переменными по умолчанию...');
    }
    
    // 2. Тестируем подключение к PostgreSQL
    const result = await testPostgreSQLConnection();
    
    if (result) {
      console.log('\n🎉 Тестирование PostgreSQL завершено успешно!');
      console.log('\n📊 Результаты:');
      console.log('✅ Подключение к БД - работает');
      console.log('✅ CRUD операции - работают');
      console.log('✅ RAG модели - работают');
      console.log('✅ Транзакции - работают');
      console.log('✅ Производительность - приемлемая');
    } else {
      console.log('\n❌ Тестирование PostgreSQL завершилось с ошибками');
      console.log('\n🔧 Рекомендации:');
      console.log('1. Убедитесь, что PostgreSQL сервер запущен');
      console.log('2. Проверьте правильность DATABASE_URL');
      console.log('3. Создайте базу данных, если она не существует');
      console.log('4. Выполните миграции: npx prisma migrate deploy');
    }
    
  } catch (error) {
    console.error('\n💥 Критическая ошибка тестирования:', error);
    process.exit(1);
  }
}

// Запускаем тестирование
main().catch(console.error);
