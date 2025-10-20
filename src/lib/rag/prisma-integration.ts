/**
 * Prisma Integration для RAG системы
 * Связывает RAG результаты с базой данных
 */

import { prisma } from '../prisma';
import type { RAGResult, LegalSource } from './rag-service';

export interface RAGMetadata {
  tokensUsed: number;
  costUsd: number;
  responseTimeMs: number;
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export interface DocumentProcessingMetadata {
  originalName: string;
  s3Key: string;
  fileSize: number;
  mimeType: string;
  legalArea?: string;
  documentType?: string;
}

export class RAGPrismaIntegration {
  /**
   * Сохранение RAG консультации в базу данных
   */
  async saveConsultation(
    userId: string,
    question: string,
    ragResult: RAGResult,
    metadata: RAGMetadata
  ): Promise<string> {
    try {
      const consultation = await prisma.ragConsultation.create({
        data: {
          userId,
          question,
          answer: ragResult.answer,
          legalArea: ragResult.legalArea,
          sources: ragResult.sources as any, // JSON field
          confidence: ragResult.confidence,
          tokensUsed: metadata.tokensUsed,
          costUsd: metadata.costUsd,
          responseTimeMs: metadata.responseTimeMs,
          status: 'completed',
          completedAt: new Date()
        }
      });

      // Сохраняем мониторинг AI
      await prisma.aiMonitoring.create({
        data: {
          consultationId: consultation.id,
          model: metadata.model,
          tokensInput: metadata.inputTokens,
          tokensOutput: metadata.outputTokens,
          responseTimeMs: metadata.responseTimeMs,
          costUsd: metadata.costUsd
        }
      });

      return consultation.id;
    } catch (error) {
      console.error('RAG Prisma Integration Error - saveConsultation:', error);
      throw new Error(`Ошибка сохранения консультации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Сохранение обработанного документа
   */
  async saveProcessedDocument(
    userId: string,
    metadata: DocumentProcessingMetadata,
    chunksCount: number,
    vectorDbIds: string[],
    processingStatus: 'pending' | 'processing' | 'completed' | 'error' = 'completed',
    errorMessage?: string
  ): Promise<string> {
    try {
      const document = await prisma.processedDocument.create({
        data: {
          userId,
          originalName: metadata.originalName,
          s3Key: metadata.s3Key,
          fileSize: metadata.fileSize,
          mimeType: metadata.mimeType,
          chunksCount,
          legalArea: metadata.legalArea,
          documentType: metadata.documentType,
          processingStatus,
          vectorDbIds,
          errorMessage,
          processedAt: processingStatus === 'completed' ? new Date() : undefined
        }
      });

      return document.id;
    } catch (error) {
      console.error('RAG Prisma Integration Error - saveProcessedDocument:', error);
      throw new Error(`Ошибка сохранения обработанного документа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Сохранение чанков документа
   */
  async saveDocumentChunks(
    documentId: string,
    chunks: Array<{
      chunkIndex: number;
      content: string;
      startPosition: number;
      endPosition: number;
      vectorId?: string;
      embedding?: number[];
    }>
  ): Promise<void> {
    try {
      await prisma.documentChunk.createMany({
        data: chunks.map(chunk => ({
          documentId,
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          startPosition: chunk.startPosition,
          endPosition: chunk.endPosition,
          vectorId: chunk.vectorId,
          embedding: chunk.embedding
        }))
      });
    } catch (error) {
      console.error('RAG Prisma Integration Error - saveDocumentChunks:', error);
      throw new Error(`Ошибка сохранения чанков документа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Сохранение RAG запроса
   */
  async saveRAGQuery(
    userId: string,
    query: string,
    legalArea?: string,
    maxResults: number = 5,
    threshold: number = 0.7,
    results?: LegalSource[]
  ): Promise<string> {
    try {
      const ragQuery = await prisma.ragQuery.create({
        data: {
          userId,
          query,
          legalArea,
          maxResults,
          threshold,
          results: results as any // JSON field
        }
      });

      return ragQuery.id;
    } catch (error) {
      console.error('RAG Prisma Integration Error - saveRAGQuery:', error);
      throw new Error(`Ошибка сохранения RAG запроса: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Обновление счетчика использованных документов
   */
  async incrementDocumentsUsed(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          documentsUsed: {
            increment: 1
          }
        }
      });
    } catch (error) {
      console.error('RAG Prisma Integration Error - incrementDocumentsUsed:', error);
      throw new Error(`Ошибка обновления счетчика документов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение статистики пользователя
   */
  async getUserStats(userId: string): Promise<{
    documentsUsed: number;
    totalConsultations: number;
    totalProcessedDocuments: number;
    totalRAGQueries: number;
    subscriptionPlan: string;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          documentsUsed: true,
          subscriptionPlan: true,
          _count: {
            select: {
              ragConsultations: true,
              processedDocuments: true,
              ragQueries: true
            }
          }
        }
      });

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      return {
        documentsUsed: user.documentsUsed,
        totalConsultations: user._count.ragConsultations,
        totalProcessedDocuments: user._count.processedDocuments,
        totalRAGQueries: user._count.ragQueries,
        subscriptionPlan: user.subscriptionPlan
      };
    } catch (error) {
      console.error('RAG Prisma Integration Error - getUserStats:', error);
      throw new Error(`Ошибка получения статистики пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение истории RAG консультаций пользователя
   */
  async getUserConsultations(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Array<{
    id: string;
    question: string;
    answer: string | null;
    legalArea: string | null;
    confidence: number | null;
    createdAt: Date;
    status: string;
  }>> {
    try {
      const consultations = await prisma.ragConsultation.findMany({
        where: { userId },
        select: {
          id: true,
          question: true,
          answer: true,
          legalArea: true,
          confidence: true,
          createdAt: true,
          status: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return consultations;
    } catch (error) {
      console.error('RAG Prisma Integration Error - getUserConsultations:', error);
      throw new Error(`Ошибка получения консультаций: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение обработанных документов пользователя
   */
  async getUserProcessedDocuments(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Array<{
    id: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    legalArea: string | null;
    documentType: string | null;
    processingStatus: string;
    chunksCount: number;
    createdAt: Date;
    processedAt: Date | null;
  }>> {
    try {
      const documents = await prisma.processedDocument.findMany({
        where: { userId },
        select: {
          id: true,
          originalName: true,
          fileSize: true,
          mimeType: true,
          legalArea: true,
          documentType: true,
          processingStatus: true,
          chunksCount: true,
          createdAt: true,
          processedAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return documents;
    } catch (error) {
      console.error('RAG Prisma Integration Error - getUserProcessedDocuments:', error);
      throw new Error(`Ошибка получения обработанных документов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение статистики системы
   */
  async getSystemStats(): Promise<{
    totalUsers: number;
    totalConsultations: number;
    totalProcessedDocuments: number;
    totalRAGQueries: number;
    totalChunks: number;
    averageConfidence: number;
    totalCostUsd: number;
  }> {
    try {
      const [
        totalUsers,
        totalConsultations,
        totalProcessedDocuments,
        totalRAGQueries,
        totalChunks,
        confidenceStats,
        costStats
      ] = await Promise.all([
        prisma.user.count(),
        prisma.ragConsultation.count(),
        prisma.processedDocument.count(),
        prisma.ragQuery.count(),
        prisma.documentChunk.count(),
        prisma.ragConsultation.aggregate({
          _avg: { confidence: true }
        }),
        prisma.ragConsultation.aggregate({
          _sum: { costUsd: true }
        })
      ]);

      return {
        totalUsers,
        totalConsultations,
        totalProcessedDocuments,
        totalRAGQueries,
        totalChunks,
        averageConfidence: confidenceStats._avg.confidence || 0,
        totalCostUsd: costStats._sum.costUsd || 0
      };
    } catch (error) {
      console.error('RAG Prisma Integration Error - getSystemStats:', error);
      throw new Error(`Ошибка получения статистики системы: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Проверка лимитов пользователя
   */
  async checkUserLimits(userId: string): Promise<{
    canUseDocument: boolean;
    documentsUsed: number;
    documentsLimit: number;
    isPremium: boolean;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          documentsUsed: true,
          subscriptionPlan: true
        }
      });

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      const isPremium = user.subscriptionPlan === 'premium' || user.subscriptionPlan === 'business';
      const documentsLimit = isPremium ? 999 : 1; // Лимит для бесплатных пользователей
      const canUseDocument = user.documentsUsed < documentsLimit;

      return {
        canUseDocument,
        documentsUsed: user.documentsUsed,
        documentsLimit,
        isPremium
      };
    } catch (error) {
      console.error('RAG Prisma Integration Error - checkUserLimits:', error);
      throw new Error(`Ошибка проверки лимитов пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }
}

export default RAGPrismaIntegration;
