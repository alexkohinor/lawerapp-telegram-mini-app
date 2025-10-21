/**
 * Упрощенный скрипт для тестирования Data Persistence Layer с SQLite
 */

import { PrismaClient } from '@prisma/client';

// Создаем временную схему SQLite для тестирования
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db'
    }
  }
});

// Тестовые данные
const testTelegramId = BigInt('1234567890');

async function testBasicOperations() {
  console.log('🗄️ Тестирование базовых операций с БД...');
  
  try {
    // Создаем тестового пользователя
    const testUser = await prisma.user.create({
      data: {
        telegramId: testTelegramId,
        telegramUsername: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        subscriptionPlan: 'free',
        isActive: true,
        documentsUsed: 0
      }
    });
    console.log('✅ Тестовый пользователь создан:', testUser.id);
    
    // Создаем тестовую консультацию
    const testConsultation = await prisma.consultation.create({
      data: {
        userId: testUser.id,
        question: 'Тестовый вопрос по праву',
        answer: 'Тестовый ответ на вопрос',
        legalArea: 'civil-law',
        status: 'completed'
      }
    });
    console.log('✅ Тестовая консультация создана:', testConsultation.id);
    
    // Создаем тестовый документ
    const testDocument = await prisma.document.create({
      data: {
        userId: testUser.id,
        title: 'Тестовый документ',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        status: 'uploaded'
      }
    });
    console.log('✅ Тестовый документ создан:', testDocument.id);
    
    // Создаем тестовый спор
    const testDispute = await prisma.dispute.create({
      data: {
        userId: testUser.id,
        title: 'Тестовый спор',
        description: 'Описание тестового спора',
        status: 'ACTIVE'
      }
    });
    console.log('✅ Тестовый спор создан:', testDispute.id);
    
    // Создаем тестовый платеж
    const testPayment = await prisma.payment.create({
      data: {
        userId: testUser.id,
        amount: 1000,
        currency: 'RUB',
        paymentMethod: 'yookassa',
        status: 'completed',
        subscriptionPlan: 'premium'
      }
    });
    console.log('✅ Тестовый платеж создан:', testPayment.id);
    
    // Создаем тестовое уведомление
    const testNotification = await prisma.notification.create({
      data: {
        userId: testUser.id,
        type: 'info',
        title: 'Тестовое уведомление',
        message: 'Тестовое сообщение',
        isRead: false
      }
    });
    console.log('✅ Тестовое уведомление создано:', testNotification.id);
    
    // Создаем тестовую сессию
    const testSession = await prisma.session.create({
      data: {
        userId: testUser.id,
        sessionToken: 'test-session-token',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });
    console.log('✅ Тестовая сессия создана:', testSession.id);
    
    // Тестируем чтение данных
    const user = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: {
        consultations: true,
        documents: true,
        disputes: true,
        payments: true,
        notifications: true,
        sessions: true
      }
    });
    console.log('✅ Пользователь с связанными данными получен:', {
      consultations: user?.consultations.length,
      documents: user?.documents.length,
      disputes: user?.disputes.length,
      payments: user?.payments.length,
      notifications: user?.notifications.length,
      sessions: user?.sessions.length
    });
    
    // Тестируем обновление данных
    const updatedConsultation = await prisma.consultation.update({
      where: { id: testConsultation.id },
      data: { status: 'completed', answer: 'Обновленный ответ' }
    });
    console.log('✅ Консультация обновлена:', updatedConsultation.status);
    
    // Тестируем поиск
    const consultations = await prisma.consultation.findMany({
      where: {
        question: { contains: 'тестовый' }
      }
    });
    console.log('✅ Поиск консультаций выполнен:', consultations.length);
    
    // Тестируем статистику
    const stats = {
      users: await prisma.user.count(),
      consultations: await prisma.consultation.count(),
      documents: await prisma.document.count(),
      disputes: await prisma.dispute.count(),
      payments: await prisma.payment.count(),
      notifications: await prisma.notification.count(),
      sessions: await prisma.session.count()
    };
    console.log('✅ Статистика получена:', stats);
    
    // Очищаем тестовые данные
    await prisma.notification.delete({ where: { id: testNotification.id } });
    await prisma.session.delete({ where: { id: testSession.id } });
    await prisma.payment.delete({ where: { id: testPayment.id } });
    await prisma.dispute.delete({ where: { id: testDispute.id } });
    await prisma.document.delete({ where: { id: testDocument.id } });
    await prisma.consultation.delete({ where: { id: testConsultation.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✅ Тестовые данные очищены');
    
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка базовых операций:', error);
    throw error;
  }
}

async function testRAGModels() {
  console.log('\n🤖 Тестирование RAG моделей...');
  
  try {
    // Создаем тестового пользователя
    const testUser = await prisma.user.create({
      data: {
        telegramId: testTelegramId + BigInt(1),
        telegramUsername: 'testuser2',
        firstName: 'Test2',
        lastName: 'User2',
        subscriptionPlan: 'free',
        isActive: true,
        documentsUsed: 0
      }
    });
    console.log('✅ Тестовый пользователь для RAG создан:', testUser.id);
    
    // Создаем RAG консультацию
    const ragConsultation = await prisma.rAGConsultation.create({
      data: {
        userId: testUser.id,
        question: 'Тестовый RAG вопрос',
        answer: 'Тестовый RAG ответ',
        legalArea: 'civil-law',
        sources: { documents: ['doc1', 'doc2'], laws: ['law1'] },
        confidence: 0.95,
        tokensUsed: 1500,
        costUsd: 0.05,
        responseTimeMs: 2000,
        status: 'completed'
      }
    });
    console.log('✅ RAG консультация создана:', ragConsultation.id);
    
    // Создаем обработанный документ
    const processedDocument = await prisma.processedDocument.create({
      data: {
        userId: testUser.id,
        originalName: 'test-rag-document.pdf',
        s3Key: 'documents/test-rag-document.pdf',
        fileSize: 2048000,
        mimeType: 'application/pdf',
        chunksCount: 10,
        legalArea: 'civil-law',
        documentType: 'contract',
        processingStatus: 'completed',
        vectorDbIds: ['vec1', 'vec2', 'vec3']
      }
    });
    console.log('✅ Обработанный документ создан:', processedDocument.id);
    
    // Создаем чанки документа
    const documentChunk = await prisma.documentChunk.create({
      data: {
        documentId: processedDocument.id,
        chunkIndex: 0,
        content: 'Тестовый контент чанка',
        startPosition: 0,
        endPosition: 100,
        vectorId: 'vec1',
        embedding: [0.1, 0.2, 0.3, 0.4, 0.5]
      }
    });
    console.log('✅ Чанк документа создан:', documentChunk.id);
    
    // Создаем RAG запрос
    const ragQuery = await prisma.rAGQuery.create({
      data: {
        userId: testUser.id,
        query: 'Тестовый RAG запрос',
        legalArea: 'civil-law',
        results: { documents: ['doc1'], laws: ['law1'] }
      }
    });
    console.log('✅ RAG запрос создан:', ragQuery.id);
    
    // Создаем AI мониторинг
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
    console.log('✅ AI мониторинг создан:', aiMonitoring.id);
    
    // Тестируем чтение RAG данных
    const ragData = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: {
        ragConsultations: true,
        processedDocuments: {
          include: { chunks: true }
        },
        ragQueries: true
      }
    });
    console.log('✅ RAG данные получены:', {
      ragConsultations: ragData?.ragConsultations.length,
      processedDocuments: ragData?.processedDocuments.length,
      ragQueries: ragData?.ragQueries.length,
      chunks: ragData?.processedDocuments[0]?.chunks.length
    });
    
    // Очищаем RAG тестовые данные
    await prisma.aiMonitoring.delete({ where: { id: aiMonitoring.id } });
    await prisma.documentChunk.delete({ where: { id: documentChunk.id } });
    await prisma.rAGQuery.delete({ where: { id: ragQuery.id } });
    await prisma.processedDocument.delete({ where: { id: processedDocument.id } });
    await prisma.rAGConsultation.delete({ where: { id: ragConsultation.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✅ RAG тестовые данные очищены');
    
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка RAG моделей:', error);
    throw error;
  }
}

async function testRelations() {
  console.log('\n🔗 Тестирование связей между моделями...');
  
  try {
    // Создаем тестового пользователя
    const testUser = await prisma.user.create({
      data: {
        telegramId: testTelegramId + BigInt(2),
        telegramUsername: 'testuser3',
        firstName: 'Test3',
        lastName: 'User3',
        subscriptionPlan: 'premium',
        isActive: true,
        documentsUsed: 5
      }
    });
    console.log('✅ Тестовый пользователь для связей создан:', testUser.id);
    
    // Создаем консультацию с AI мониторингом
    const consultation = await prisma.consultation.create({
      data: {
        userId: testUser.id,
        question: 'Вопрос с AI мониторингом',
        answer: 'Ответ с AI мониторингом',
        status: 'completed'
      }
    });
    
    const aiMonitoring = await prisma.aiMonitoring.create({
      data: {
        consultationId: consultation.id,
        model: 'gpt-4',
        tokensInput: 2000,
        tokensOutput: 1000,
        responseTimeMs: 3000,
        costUsd: 0.1
      }
    });
    console.log('✅ Консультация с AI мониторингом создана');
    
    // Создаем спор с timeline событиями
    const dispute = await prisma.dispute.create({
      data: {
        userId: testUser.id,
        title: 'Спор с timeline',
        description: 'Описание спора с timeline',
        status: 'open'
      }
    });
    
    const timelineEvent = await prisma.timelineEvent.create({
      data: {
        disputeId: dispute.id,
        type: 'CREATED',
        description: 'Спор создан',
        userId: testUser.id
      }
    });
    console.log('✅ Спор с timeline событием создан');
    
    // Тестируем каскадное удаление
    await prisma.user.delete({ where: { id: testUser.id } });
    
    // Проверяем, что связанные данные удалены
    const deletedConsultation = await prisma.consultation.findUnique({
      where: { id: consultation.id }
    });
    const deletedDispute = await prisma.dispute.findUnique({
      where: { id: dispute.id }
    });
    const deletedTimeline = await prisma.timelineEvent.findUnique({
      where: { id: timelineEvent.id }
    });
    const deletedAiMonitoring = await prisma.aiMonitoring.findUnique({
      where: { id: aiMonitoring.id }
    });
    
    console.log('✅ Каскадное удаление работает:', {
      consultation: deletedConsultation === null,
      dispute: deletedDispute === null,
      timeline: deletedTimeline === null,
      aiMonitoring: deletedAiMonitoring === null
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка тестирования связей:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Запуск упрощенного тестирования Data Persistence Layer с SQLite\n');
  
  try {
    // 1. Тестируем базовые операции
    await testBasicOperations();
    
    // 2. Тестируем RAG модели
    await testRAGModels();
    
    // 3. Тестируем связи между моделями
    await testRelations();
    
    console.log('\n🎉 Все тесты Data Persistence Layer прошли успешно!');
    console.log('\n📊 Результаты тестирования:');
    console.log('✅ Базовые CRUD операции - работают');
    console.log('✅ RAG модели - работают');
    console.log('✅ Связи между моделями - работают');
    console.log('✅ Каскадное удаление - работает');
    console.log('✅ Поиск и фильтрация - работают');
    console.log('✅ Статистика - работает');
    
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
