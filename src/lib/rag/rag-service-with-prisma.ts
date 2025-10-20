/**
 * RAG Service с интеграцией Prisma
 * Расширенная версия RAG сервиса с сохранением в базу данных
 */

import { RAGService } from './rag-service';
import { RAGPrismaIntegration } from './prisma-integration';
import { RAGConfig } from './config';
import type { RAGQuery, RAGResult, LegalArea } from './rag-service';

export interface RAGServiceWithPrismaOptions {
  saveToDatabase?: boolean;
  trackUsage?: boolean;
  userId?: string;
}

export class RAGServiceWithPrisma extends RAGService {
  private prismaIntegration: RAGPrismaIntegration;

  constructor(config: RAGConfig) {
    super(config);
    this.prismaIntegration = new RAGPrismaIntegration();
  }

  /**
   * Расширенный запрос с сохранением в базу данных
   */
  async queryWithPersistence(
    query: RAGQuery,
    options: RAGServiceWithPrismaOptions = {}
  ): Promise<RAGResult & { consultationId?: string; queryId?: string }> {
    const startTime = Date.now();
    
    try {
      // Выполняем обычный RAG запрос
      const ragResult = await this.query(query);
      
      // Если включено сохранение в БД и есть userId
      if (options.saveToDatabase && options.userId) {
        const responseTime = Date.now() - startTime;
        
        // Создаем метаданные для сохранения
        const metadata = {
          tokensUsed: this.estimateTokens(ragResult.answer),
          costUsd: this.estimateCost(ragResult.answer),
          responseTimeMs: responseTime,
          model: 'gpt-4',
          inputTokens: this.estimateTokens(query.question),
          outputTokens: this.estimateTokens(ragResult.answer)
        };

        // Сохраняем консультацию
        const consultationId = await this.prismaIntegration.saveConsultation(
          options.userId,
          query.question,
          ragResult,
          metadata
        );

        // Сохраняем RAG запрос
        const queryId = await this.prismaIntegration.saveRAGQuery(
          options.userId,
          query.question,
          query.legalArea,
          query.maxResults,
          query.threshold,
          ragResult.sources
        );

        // Обновляем счетчик использованных документов если включено отслеживание
        if (options.trackUsage) {
          await this.prismaIntegration.incrementDocumentsUsed(options.userId);
        }

        return {
          ...ragResult,
          consultationId,
          queryId
        };
      }

      return ragResult;
    } catch (error) {
      console.error('RAG Service with Prisma Error:', error);
      throw new Error(`Ошибка RAG запроса с сохранением: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Обработка документа с сохранением в базу данных
   */
  async processDocumentWithPersistence(
    userId: string,
    file: File | Buffer,
    metadata: {
      originalName: string;
      s3Key: string;
      fileSize: number;
      mimeType: string;
      legalArea?: string;
      documentType?: string;
    },
    options: {
      chunkSize?: number;
      chunkOverlap?: number;
      saveChunks?: boolean;
    } = {}
  ): Promise<{
    documentId: string;
    chunksCount: number;
    processingTime: number;
    status: 'success' | 'error';
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      // Здесь была бы интеграция с DocumentProcessor
      // Для демо возвращаем мок-результат
      const chunksCount = Math.floor(Math.random() * 10) + 1;
      const vectorDbIds = Array.from({ length: chunksCount }, (_, i) => `chunk_${i}_${Date.now()}`);
      
      // Сохраняем обработанный документ
      const documentId = await this.prismaIntegration.saveProcessedDocument(
        userId,
        metadata,
        chunksCount,
        vectorDbIds,
        'completed'
      );

      // Если включено сохранение чанков
      if (options.saveChunks) {
        const chunks = Array.from({ length: chunksCount }, (_, i) => ({
          chunkIndex: i,
          content: `Chunk ${i + 1} content for ${metadata.originalName}`,
          startPosition: i * 1000,
          endPosition: (i + 1) * 1000,
          vectorId: vectorDbIds[i]
        }));

        await this.prismaIntegration.saveDocumentChunks(documentId, chunks);
      }

      const processingTime = Date.now() - startTime;

      return {
        documentId,
        chunksCount,
        processingTime,
        status: 'success'
      };
    } catch (error) {
      console.error('Document Processing with Prisma Error:', error);
      
      return {
        documentId: '',
        chunksCount: 0,
        processingTime: Date.now() - startTime,
        status: 'error',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Получение статистики пользователя
   */
  async getUserStats(userId: string) {
    return this.prismaIntegration.getUserStats(userId);
  }

  /**
   * Получение истории консультаций пользователя
   */
  async getUserConsultations(userId: string, limit: number = 10, offset: number = 0) {
    return this.prismaIntegration.getUserConsultations(userId, limit, offset);
  }

  /**
   * Получение обработанных документов пользователя
   */
  async getUserProcessedDocuments(userId: string, limit: number = 10, offset: number = 0) {
    return this.prismaIntegration.getUserProcessedDocuments(userId, limit, offset);
  }

  /**
   * Получение статистики системы
   */
  async getSystemStats() {
    return this.prismaIntegration.getSystemStats();
  }

  /**
   * Проверка лимитов пользователя
   */
  async checkUserLimits(userId: string) {
    return this.prismaIntegration.checkUserLimits(userId);
  }

  /**
   * Оценка количества токенов (упрощенная)
   */
  private estimateTokens(text: string): number {
    // Упрощенная оценка: примерно 4 символа на токен
    return Math.ceil(text.length / 4);
  }

  /**
   * Оценка стоимости (упрощенная)
   */
  private estimateCost(text: string): number {
    const tokens = this.estimateTokens(text);
    // Примерная стоимость GPT-4: $0.03 за 1K токенов
    return (tokens / 1000) * 0.03;
  }
}

export default RAGServiceWithPrisma;
