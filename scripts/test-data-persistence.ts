/**
 * Скрипт для тестирования Data Persistence Layer
 */

import { PrismaClient } from '@prisma/client';
import { DataManager } from '../src/lib/data/data-manager';
import { ConsultationManager } from '../src/lib/data/consultation-manager';
import { DocumentManager } from '../src/lib/data/document-manager';
import { DisputeManager } from '../src/lib/data/dispute-manager';
import { PaymentManager } from '../src/lib/data/payment-manager';
import { NotificationManager } from '../src/lib/data/notification-manager';
import { AnalyticsManager } from '../src/lib/data/analytics-manager';

const prisma = new PrismaClient();

// Тестовые данные
const testUserId = 'clx0000000000000000000000';
const testTelegramId = BigInt('1234567890');

async function testConsultationManager() {
  console.log('📋 Тестирование Consultation Manager...');
  
  try {
    const consultationManager = new ConsultationManager();
    
    // Создание консультации
    const consultation = await consultationManager.createConsultation({
      userId: testUserId,
      question: 'Тестовый вопрос по праву',
      answer: 'Тестовый ответ на вопрос',
      legalArea: 'civil-law',
      status: 'completed',
      priority: 'medium',
      source: 'manual'
    });
    console.log('✅ Консультация создана:', consultation.id);
    
    // Получение консультации
    const foundConsultation = await consultationManager.getConsultationById(consultation.id);
    console.log('✅ Консультация найдена:', foundConsultation?.id);
    
    // Обновление консультации
    const updatedConsultation = await consultationManager.updateConsultation(consultation.id, {
      status: 'completed',
      answer: 'Обновленный ответ'
    });
    console.log('✅ Консультация обновлена:', updatedConsultation.id);
    
    // Получение статистики
    const stats = await consultationManager.getConsultationStats();
    console.log('✅ Статистика консультаций получена:', stats.total);
    
    // Поиск консультаций
    const searchResults = await consultationManager.searchConsultations('тестовый');
    console.log('✅ Поиск консультаций выполнен:', searchResults.length);
    
    // Создание RAG консультации
    const ragConsultation = await consultationManager.createRAGConsultation(
      testUserId,
      'RAG вопрос',
      'civil-law',
      {
        answer: 'RAG ответ',
        sources: [{ id: 'src1', title: 'Источник', content: 'Контент', type: 'law', relevance: 0.9 }],
        confidence: 0.9,
        legalReferences: ['ГК РФ'],
        suggestedActions: ['Проверить документы']
      }
    );
    console.log('✅ RAG консультация создана:', ragConsultation.id);
    
    return consultation;
    
  } catch (error) {
    console.error('❌ Ошибка Consultation Manager:', error);
    throw error;
  }
}

async function testDocumentManager() {
  console.log('\n📄 Тестирование Document Manager...');
  
  try {
    const documentManager = new DocumentManager();
    
    // Создание документа
    const document = await documentManager.createDocument({
      userId: testUserId,
      title: 'Тестовый документ',
      description: 'Описание тестового документа',
      fileName: 'test-document.pdf',
      fileSize: 1024000,
      mimeType: 'application/pdf',
      documentType: 'contract',
      legalArea: 'civil-law',
      status: 'uploaded',
      tags: ['тест', 'документ']
    });
    console.log('✅ Документ создан:', document.id);
    
    // Получение документа
    const foundDocument = await documentManager.getDocumentById(document.id);
    console.log('✅ Документ найден:', foundDocument?.id);
    
    // Обновление статуса документа
    const updatedDocument = await documentManager.updateDocumentStatus(
      document.id,
      'processed',
      { processingTime: 5000, pages: 10 }
    );
    console.log('✅ Статус документа обновлен:', updatedDocument.status);
    
    // Добавление тегов
    const documentWithTags = await documentManager.addTagsToDocument(
      document.id,
      ['важный', 'подписан']
    );
    console.log('✅ Теги добавлены:', documentWithTags.tags);
    
    // Получение статистики
    const stats = await documentManager.getDocumentStats();
    console.log('✅ Статистика документов получена:', stats.total);
    
    // Поиск документов
    const searchResults = await documentManager.searchDocuments('тестовый');
    console.log('✅ Поиск документов выполнен:', searchResults.length);
    
    return document;
    
  } catch (error) {
    console.error('❌ Ошибка Document Manager:', error);
    throw error;
  }
}

async function testDisputeManager() {
  console.log('\n⚖️ Тестирование Dispute Manager...');
  
  try {
    const disputeManager = new DisputeManager();
    
    // Создание спора
    const dispute = await disputeManager.createDispute({
      userId: testUserId,
      title: 'Тестовый спор',
      description: 'Описание тестового спора',
      legalArea: 'consumer-rights',
      status: 'open',
      priority: 'high',
      disputeType: 'consumer',
      estimatedValue: 50000,
      currency: 'RUB',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tags: ['тест', 'спор']
    });
    console.log('✅ Спор создан:', dispute.id);
    
    // Получение спора
    const foundDispute = await disputeManager.getDisputeById(dispute.id);
    console.log('✅ Спор найден:', foundDispute?.id);
    
    // Обновление статуса спора
    const updatedDispute = await disputeManager.updateDisputeStatus(
      dispute.id,
      'in_progress',
      testUserId
    );
    console.log('✅ Статус спора обновлен:', updatedDispute.status);
    
    // Получение timeline
    const timeline = await disputeManager.getDisputeTimeline(dispute.id);
    console.log('✅ Timeline получен:', timeline.length, 'событий');
    
    // Получение статистики
    const stats = await disputeManager.getDisputeStats();
    console.log('✅ Статистика споров получена:', stats.total);
    
    // Поиск споров
    const searchResults = await disputeManager.searchDisputes('тестовый');
    console.log('✅ Поиск споров выполнен:', searchResults.length);
    
    // Получение споров с истекающими дедлайнами
    const expiringDisputes = await disputeManager.getDisputesWithExpiringDeadlines(7);
    console.log('✅ Споры с истекающими дедлайнами:', expiringDisputes.length);
    
    return dispute;
    
  } catch (error) {
    console.error('❌ Ошибка Dispute Manager:', error);
    throw error;
  }
}

async function testPaymentManager() {
  console.log('\n💳 Тестирование Payment Manager...');
  
  try {
    const paymentManager = new PaymentManager();
    
    // Создание платежа за подписку
    const subscriptionPayment = await paymentManager.createSubscriptionPayment(
      testUserId,
      'premium',
      990,
      'RUB',
      'yookassa',
      'ext_payment_123'
    );
    console.log('✅ Платеж за подписку создан:', subscriptionPayment.id);
    
    // Создание платежа за консультацию
    const consultationPayment = await paymentManager.createConsultationPayment(
      testUserId,
      500,
      'RUB',
      'yoomoney',
      'consultation_123',
      'ext_payment_456'
    );
    console.log('✅ Платеж за консультацию создан:', consultationPayment.id);
    
    // Обновление статуса платежа
    const updatedPayment = await paymentManager.updatePaymentStatus(
      subscriptionPayment.id,
      'completed',
      'ext_payment_123'
    );
    console.log('✅ Статус платежа обновлен:', updatedPayment.status);
    
    // Получение платежа по внешнему ID
    const foundPayment = await paymentManager.getPaymentByExternalId('ext_payment_123');
    console.log('✅ Платеж найден по внешнему ID:', foundPayment?.id);
    
    // Получение статистики
    const stats = await paymentManager.getPaymentStats();
    console.log('✅ Статистика платежей получена:', stats.total);
    
    // Получение доходов по периодам
    const revenue = await paymentManager.getRevenueByPeriod(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date(),
      'day'
    );
    console.log('✅ Доходы по периодам получены:', revenue.length, 'периодов');
    
    return subscriptionPayment;
    
  } catch (error) {
    console.error('❌ Ошибка Payment Manager:', error);
    throw error;
  }
}

async function testNotificationManager() {
  console.log('\n🔔 Тестирование Notification Manager...');
  
  try {
    const notificationManager = new NotificationManager();
    
    // Создание уведомления
    const notification = await notificationManager.createNotification({
      userId: testUserId,
      type: 'info',
      title: 'Тестовое уведомление',
      message: 'Это тестовое уведомление',
      priority: 'medium',
      category: 'system',
      isRead: false,
      actionUrl: '/test',
      actionText: 'Перейти'
    });
    console.log('✅ Уведомление создано:', notification.id);
    
    // Создание уведомления о платеже
    const paymentNotification = await notificationManager.createPaymentNotification(
      testUserId,
      'payment_123',
      'completed',
      990,
      'RUB'
    );
    console.log('✅ Уведомление о платеже создано:', paymentNotification.id);
    
    // Создание уведомления о консультации
    const consultationNotification = await notificationManager.createConsultationNotification(
      testUserId,
      'consultation_123',
      'completed',
      'Тестовый вопрос'
    );
    console.log('✅ Уведомление о консультации создано:', consultationNotification.id);
    
    // Создание уведомления о споре
    const disputeNotification = await notificationManager.createDisputeNotification(
      testUserId,
      'dispute_123',
      'created',
      'Тестовый спор'
    );
    console.log('✅ Уведомление о споре создано:', disputeNotification.id);
    
    // Создание уведомления о документе
    const documentNotification = await notificationManager.createDocumentNotification(
      testUserId,
      'document_123',
      'processed',
      'test-document.pdf'
    );
    console.log('✅ Уведомление о документе создано:', documentNotification.id);
    
    // Отметка как прочитанное
    const readNotification = await notificationManager.markAsRead(notification.id);
    console.log('✅ Уведомление отмечено как прочитанное:', readNotification.isRead);
    
    // Получение непрочитанных уведомлений
    const unreadNotifications = await notificationManager.getUnreadNotifications(testUserId);
    console.log('✅ Непрочитанные уведомления получены:', unreadNotifications.length);
    
    // Получение статистики
    const stats = await notificationManager.getNotificationStats();
    console.log('✅ Статистика уведомлений получена:', stats.total);
    
    // Очистка истекших уведомлений
    const cleaned = await notificationManager.cleanupExpiredNotifications();
    console.log('✅ Истекшие уведомления очищены:', cleaned);
    
    return notification;
    
  } catch (error) {
    console.error('❌ Ошибка Notification Manager:', error);
    throw error;
  }
}

async function testAnalyticsManager() {
  console.log('\n📊 Тестирование Analytics Manager...');
  
  try {
    const analyticsManager = new AnalyticsManager();
    
    const period = {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      groupBy: 'day' as const
    };
    
    // Получение аналитики пользователей
    const userAnalytics = await analyticsManager.getUserAnalytics(period);
    console.log('✅ Аналитика пользователей получена:', userAnalytics.totalUsers);
    
    // Получение бизнес-аналитики
    const businessAnalytics = await analyticsManager.getBusinessAnalytics(period);
    console.log('✅ Бизнес-аналитика получена:', businessAnalytics.revenue.total);
    
    // Получение системной аналитики
    const systemAnalytics = await analyticsManager.getSystemAnalytics(period);
    console.log('✅ Системная аналитика получена:', systemAnalytics.performance.uptime);
    
    // Получение временных рядов
    const userTimeSeries = await analyticsManager.getTimeSeriesData('users', period);
    console.log('✅ Временные ряды пользователей получены:', userTimeSeries.length);
    
    const revenueTimeSeries = await analyticsManager.getTimeSeriesData('revenue', period);
    console.log('✅ Временные ряды доходов получены:', revenueTimeSeries.length);
    
    // Получение дашборда
    const dashboard = await analyticsManager.getAnalyticsDashboard(period);
    console.log('✅ Дашборд аналитики получен');
    
    return dashboard;
    
  } catch (error) {
    console.error('❌ Ошибка Analytics Manager:', error);
    throw error;
  }
}

async function testDataManager() {
  console.log('\n🗄️ Тестирование Data Manager (Integration)...');
  
  try {
    const dataManager = new DataManager({
      enableAnalytics: true,
      enableNotifications: true,
      enableCaching: false
    });
    
    // Получение обзора системы
    const overview = await dataManager.getSystemOverview();
    console.log('✅ Обзор системы получен:', overview.users.total, 'пользователей');
    
    // Создание консультации с уведомлением
    const consultation = await dataManager.createConsultationWithNotification(
      testUserId,
      'Интеграционный тест консультации',
      'civil-law',
      'medium'
    );
    console.log('✅ Консультация с уведомлением создана:', consultation.id);
    
    // Создание документа с уведомлением
    const document = await dataManager.createDocumentWithNotification(
      testUserId,
      {
        title: 'Интеграционный тест документа',
        fileName: 'integration-test.pdf',
        fileSize: 2048000,
        mimeType: 'application/pdf',
        documentType: 'contract',
        legalArea: 'civil-law'
      }
    );
    console.log('✅ Документ с уведомлением создан:', document.id);
    
    // Создание спора с уведомлением
    const dispute = await dataManager.createDisputeWithNotification(
      testUserId,
      {
        title: 'Интеграционный тест спора',
        description: 'Описание интеграционного теста',
        legalArea: 'consumer-rights',
        priority: 'high',
        disputeType: 'consumer'
      }
    );
    console.log('✅ Спор с уведомлением создан:', dispute.id);
    
    // Создание платежа с уведомлением
    const payment = await dataManager.createPaymentWithNotification(
      testUserId,
      {
        amount: 1500,
        currency: 'RUB',
        description: 'Интеграционный тест платежа',
        paymentMethod: 'yookassa',
        paymentType: 'consultation'
      }
    );
    console.log('✅ Платеж с уведомлением создан:', payment.id);
    
    // Получение аналитики
    const analytics = await dataManager.getSystemAnalytics({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      groupBy: 'day'
    });
    console.log('✅ Аналитика системы получена');
    
    // Получение сводки по пользователю
    const userSummary = await dataManager.getUserDataSummary(testUserId);
    console.log('✅ Сводка по пользователю получена:', userSummary.consultations, 'консультаций');
    
    // Поиск по всем типам данных
    const searchResults = await dataManager.searchAll('тест', testUserId, 10);
    console.log('✅ Поиск по всем данным выполнен:', searchResults.consultations.length + searchResults.documents.length);
    
    // Очистка истекших данных
    const cleanupResult = await dataManager.cleanupExpiredData();
    console.log('✅ Очистка данных выполнена:', cleanupResult.notifications, 'уведомлений');
    
    return overview;
    
  } catch (error) {
    console.error('❌ Ошибка Data Manager:', error);
    throw error;
  }
}

async function testDatabaseOperations() {
  console.log('\n🗄️ Тестирование операций с базой данных...');
  
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
    
    // Создаем тестовый документ
    const testDocument = await prisma.document.create({
      data: {
        userId: testUser.id,
        title: 'Тестовый документ',
        fileName: 'test.pdf',
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
        status: 'open',
        priority: 'medium'
      }
    });
    console.log('✅ Тестовый спор создан:', testDispute.id);
    
    // Создаем тестовый платеж
    const testPayment = await prisma.payment.create({
      data: {
        userId: testUser.id,
        amount: 1000,
        currency: 'RUB',
        description: 'Тестовый платеж',
        paymentMethod: 'yookassa',
        status: 'completed',
        paymentType: 'subscription'
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
        priority: 'medium',
        category: 'system',
        isRead: false
      }
    });
    console.log('✅ Тестовое уведомление создано:', testNotification.id);
    
    // Очищаем тестовые данные
    await prisma.notification.delete({ where: { id: testNotification.id } });
    await prisma.payment.delete({ where: { id: testPayment.id } });
    await prisma.dispute.delete({ where: { id: testDispute.id } });
    await prisma.document.delete({ where: { id: testDocument.id } });
    await prisma.consultation.delete({ where: { id: testConsultation.id } });
    await prisma.session.delete({ where: { id: testSession.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✅ Тестовые данные очищены');
    
  } catch (error) {
    console.error('❌ Ошибка операций с БД:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Запуск тестирования Data Persistence Layer\n');
  
  try {
    // 1. Тестируем операции с БД
    await testDatabaseOperations();
    
    // 2. Тестируем Consultation Manager
    await testConsultationManager();
    
    // 3. Тестируем Document Manager
    await testDocumentManager();
    
    // 4. Тестируем Dispute Manager
    await testDisputeManager();
    
    // 5. Тестируем Payment Manager
    await testPaymentManager();
    
    // 6. Тестируем Notification Manager
    await testNotificationManager();
    
    // 7. Тестируем Analytics Manager
    await testAnalyticsManager();
    
    // 8. Тестируем Data Manager (интеграционный тест)
    await testDataManager();
    
    console.log('\n🎉 Все тесты Data Persistence Layer прошли успешно!');
    
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
