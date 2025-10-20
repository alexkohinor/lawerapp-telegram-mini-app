/**
 * Скрипт для тестирования Prisma интеграции с RAG системой
 */

import { PrismaClient } from '@prisma/client';
import { RAGPrismaIntegration } from '../src/lib/rag/prisma-integration';
import { RAGServiceWithPrisma } from '../src/lib/rag/rag-service-with-prisma';
import { RAGConfig } from '../src/lib/rag/config';

// Конфигурация для тестирования
const ragConfig: RAGConfig = {
  timeWebCloud: {
    apiKey: 'test-key',
    endpoint: 'https://api.timeweb.cloud/vector-db',
    collectionName: 'test-collection'
  },
  objectStorage: {
    accessKeyId: 'test-key',
    secretAccessKey: 'test-secret',
    endpoint: 'https://s3.timeweb.cloud',
    bucketName: 'test-bucket'
  },
  embedding: {
    apiKey: 'test-key',
    endpoint: 'https://api.timeweb.cloud/embedding',
    model: 'text-embedding-ada-002'
  },
  llmModel: 'gpt-4',
  llmEndpoint: 'https://api.openai.com/v1/chat/completions'
};

const prisma = new PrismaClient();
const ragService = new RAGServiceWithPrisma(ragConfig);

async function testDatabaseConnection() {
  console.log('🔌 Тестирование подключения к базе данных...');
  
  try {
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно');
    
    // Проверяем существование таблиц
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'lawerapp_%'
    `;
    
    console.log('📊 Найденные таблицы:', tables);
    
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error);
    throw error;
  }
}

async function testUserOperations() {
  console.log('\n👤 Тестирование операций с пользователями...');
  
  try {
    // Создаем тестового пользователя
    const testUser = await prisma.user.create({
      data: {
        telegramId: BigInt(123456789),
        telegramUsername: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        subscriptionPlan: 'free',
        isActive: true,
        documentsUsed: 0
      }
    });
    
    console.log('✅ Тестовый пользователь создан:', testUser.id);
    
    // Обновляем счетчик документов
    await prisma.user.update({
      where: { id: testUser.id },
      data: { documentsUsed: { increment: 1 } }
    });
    
    console.log('✅ Счетчик документов обновлен');
    
    return testUser;
    
  } catch (error) {
    console.error('❌ Ошибка операций с пользователями:', error);
    throw error;
  }
}

async function testRAGConsultation(userId: string) {
  console.log('\n🤖 Тестирование RAG консультации...');
  
  try {
    // Создаем тестовую консультацию
    const consultation = await prisma.ragConsultation.create({
      data: {
        userId,
        question: 'Какие права имеет потребитель при возврате товара?',
        answer: 'Согласно Закону РФ "О защите прав потребителей", потребитель имеет право на возврат товара в течение 14 дней...',
        legalArea: 'consumer-rights',
        sources: [
          {
            title: 'Закон РФ "О защите прав потребителей"',
            content: 'Статья 25...',
            type: 'law',
            relevance: 0.95
          }
        ],
        confidence: 0.92,
        tokensUsed: 150,
        costUsd: 0.0045,
        responseTimeMs: 2500,
        status: 'completed',
        completedAt: new Date()
      }
    });
    
    console.log('✅ RAG консультация создана:', consultation.id);
    
    // Создаем мониторинг AI
    await prisma.aiMonitoring.create({
      data: {
        consultationId: consultation.id,
        model: 'gpt-4',
        tokensInput: 100,
        tokensOutput: 50,
        responseTimeMs: 2500,
        costUsd: 0.0045
      }
    });
    
    console.log('✅ AI мониторинг создан');
    
    return consultation;
    
  } catch (error) {
    console.error('❌ Ошибка RAG консультации:', error);
    throw error;
  }
}

async function testDocumentProcessing(userId: string) {
  console.log('\n📄 Тестирование обработки документа...');
  
  try {
    // Создаем обработанный документ
    const document = await prisma.processedDocument.create({
      data: {
        userId,
        originalName: 'test-document.pdf',
        s3Key: 'documents/test-document.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        chunksCount: 5,
        legalArea: 'consumer-rights',
        documentType: 'contract',
        processingStatus: 'completed',
        vectorDbIds: ['chunk_1', 'chunk_2', 'chunk_3', 'chunk_4', 'chunk_5'],
        processedAt: new Date()
      }
    });
    
    console.log('✅ Обработанный документ создан:', document.id);
    
    // Создаем чанки документа
    const chunks = await prisma.documentChunk.createMany({
      data: [
        {
          documentId: document.id,
          chunkIndex: 0,
          content: 'Первая часть документа о правах потребителей...',
          startPosition: 0,
          endPosition: 1000,
          vectorId: 'chunk_1'
        },
        {
          documentId: document.id,
          chunkIndex: 1,
          content: 'Вторая часть документа о возврате товаров...',
          startPosition: 1000,
          endPosition: 2000,
          vectorId: 'chunk_2'
        }
      ]
    });
    
    console.log('✅ Чанки документа созданы:', chunks.count);
    
    return document;
    
  } catch (error) {
    console.error('❌ Ошибка обработки документа:', error);
    throw error;
  }
}

async function testRAGQuery(userId: string) {
  console.log('\n🔍 Тестирование RAG запроса...');
  
  try {
    const query = await prisma.ragQuery.create({
      data: {
        userId,
        query: 'Как вернуть товар ненадлежащего качества?',
        legalArea: 'consumer-rights',
        maxResults: 5,
        threshold: 0.7,
        results: [
          {
            id: 'doc1',
            title: 'Закон о защите прав потребителей',
            content: 'Статья 18...',
            type: 'law',
            relevance: 0.95
          }
        ]
      }
    });
    
    console.log('✅ RAG запрос создан:', query.id);
    
    return query;
    
  } catch (error) {
    console.error('❌ Ошибка RAG запроса:', error);
    throw error;
  }
}

async function testRAGPrismaIntegration(userId: string) {
  console.log('\n🔗 Тестирование RAG Prisma Integration...');
  
  try {
    const integration = new RAGPrismaIntegration();
    
    // Тестируем получение статистики пользователя
    const userStats = await integration.getUserStats(userId);
    console.log('✅ Статистика пользователя получена:', userStats);
    
    // Тестируем получение консультаций
    const consultations = await integration.getUserConsultations(userId, 5);
    console.log('✅ Консультации получены:', consultations.length);
    
    // Тестируем получение документов
    const documents = await integration.getUserProcessedDocuments(userId, 5);
    console.log('✅ Документы получены:', documents.length);
    
    // Тестируем проверку лимитов
    const limits = await integration.checkUserLimits(userId);
    console.log('✅ Лимиты проверены:', limits);
    
    // Тестируем статистику системы
    const systemStats = await integration.getSystemStats();
    console.log('✅ Статистика системы получена:', systemStats);
    
  } catch (error) {
    console.error('❌ Ошибка RAG Prisma Integration:', error);
    throw error;
  }
}

async function cleanupTestData(userId: string) {
  console.log('\n🧹 Очистка тестовых данных...');
  
  try {
    // Удаляем в правильном порядке (с учетом foreign keys)
    await prisma.aiMonitoring.deleteMany({
      where: {
        consultation: {
          userId
        }
      }
    });
    
    await prisma.documentChunk.deleteMany({
      where: {
        document: {
          userId
        }
      }
    });
    
    await prisma.ragConsultation.deleteMany({
      where: { userId }
    });
    
    await prisma.processedDocument.deleteMany({
      where: { userId }
    });
    
    await prisma.ragQuery.deleteMany({
      where: { userId }
    });
    
    await prisma.user.delete({
      where: { id: userId }
    });
    
    console.log('✅ Тестовые данные очищены');
    
  } catch (error) {
    console.error('❌ Ошибка очистки данных:', error);
  }
}

async function main() {
  console.log('🚀 Запуск тестирования Prisma интеграции с RAG системой\n');
  
  let testUserId: string | null = null;
  
  try {
    // 1. Тестируем подключение к БД
    await testDatabaseConnection();
    
    // 2. Тестируем операции с пользователями
    const testUser = await testUserOperations();
    testUserId = testUser.id;
    
    // 3. Тестируем RAG консультацию
    await testRAGConsultation(testUserId);
    
    // 4. Тестируем обработку документа
    await testDocumentProcessing(testUserId);
    
    // 5. Тестируем RAG запрос
    await testRAGQuery(testUserId);
    
    // 6. Тестируем RAG Prisma Integration
    await testRAGPrismaIntegration(testUserId);
    
    console.log('\n🎉 Все тесты прошли успешно!');
    
  } catch (error) {
    console.error('\n💥 Тестирование завершилось с ошибкой:', error);
    process.exit(1);
  } finally {
    // Очищаем тестовые данные
    if (testUserId) {
      await cleanupTestData(testUserId);
    }
    
    // Закрываем соединение
    await prisma.$disconnect();
    console.log('\n👋 Соединение с базой данных закрыто');
  }
}

// Запускаем тестирование
main().catch(console.error);
