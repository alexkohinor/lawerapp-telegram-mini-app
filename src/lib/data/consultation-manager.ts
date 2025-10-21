/**
 * Consultation Manager - управление консультациями в базе данных
 */

import { prisma } from '../prisma';
import { RAGPrismaIntegration } from '../rag/prisma-integration';
import { LegalSource } from '../rag/rag-service';

export interface ConsultationData {
  userId: string;
  question: string;
  answer?: string;
  legalArea?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  source?: 'manual' | 'rag' | 'ai_generated';
  metadata?: Record<string, unknown>;
}

export interface ConsultationResult {
  id: string;
  userId: string;
  question: string;
  answer?: string;
  legalArea?: string;
  status: string;
  priority?: string;
  source?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  completedAt?: Date;
}

export interface ConsultationFilters {
  userId?: string;
  status?: string;
  legalArea?: string;
  priority?: string;
  source?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface ConsultationStats {
  total: number;
  byStatus: Record<string, number>;
  byLegalArea: Record<string, number>;
  averageResponseTime: number;
  completionRate: number;
}

export class ConsultationManager {
  private ragIntegration: RAGPrismaIntegration;

  constructor() {
    this.ragIntegration = new RAGPrismaIntegration();
  }

  /**
   * Создание новой консультации
   */
  async createConsultation(data: ConsultationData): Promise<ConsultationResult> {
    try {
      const consultation = await prisma.consultation.create({
        data: {
          userId: data.userId,
          question: data.question,
          answer: data.answer,
          legalArea: data.legalArea,
          status: data.status,
        }
      });

      return {
        id: consultation.id,
        userId: consultation.userId,
        question: consultation.question,
        answer: consultation.answer || undefined,
        legalArea: consultation.legalArea || undefined,
        status: consultation.status,
        createdAt: consultation.createdAt,
        completedAt: consultation.completedAt || undefined
      };

    } catch (error) {
      console.error('Create Consultation Error:', error);
      throw new Error(`Ошибка создания консультации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение консультации по ID
   */
  async getConsultationById(id: string): Promise<ConsultationResult | null> {
    try {
      const consultation = await prisma.consultation.findUnique({
        where: { id }
      });

      if (!consultation) {
        return null;
      }

      return {
        id: consultation.id,
        userId: consultation.userId,
        question: consultation.question,
        answer: consultation.answer || undefined,
        legalArea: consultation.legalArea || undefined,
        status: consultation.status,
        createdAt: consultation.createdAt,
        completedAt: consultation.completedAt || undefined
      };

    } catch (error) {
      console.error('Get Consultation Error:', error);
      throw new Error(`Ошибка получения консультации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение консультаций с фильтрацией
   */
  async getConsultations(filters: ConsultationFilters = {}): Promise<ConsultationResult[]> {
    try {
      const where: Record<string, unknown> = {};

      if (filters.userId) where.userId = filters.userId;
      if (filters.status) where.status = filters.status;
      if (filters.legalArea) where.legalArea = filters.legalArea;
      if (filters.priority) where.priority = filters.priority;
      if (filters.source) where.source = filters.source;
      
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) (where.createdAt as Record<string, unknown>).gte = filters.dateFrom;
        if (filters.dateTo) (where.createdAt as Record<string, unknown>).lte = filters.dateTo;
      }

      const consultations = await prisma.consultation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0
      });

      return consultations.map(consultation => ({
        id: consultation.id,
        userId: consultation.userId,
        question: consultation.question,
        answer: consultation.answer || undefined,
        legalArea: consultation.legalArea || undefined,
        status: consultation.status,
        createdAt: consultation.createdAt,
        completedAt: consultation.completedAt || undefined
      }));

    } catch (error) {
      console.error('Get Consultations Error:', error);
      throw new Error(`Ошибка получения консультаций: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Обновление консультации
   */
  async updateConsultation(
    id: string,
    updates: Partial<ConsultationData>
  ): Promise<ConsultationResult> {
    try {
      const consultation = await prisma.consultation.update({
        where: { id },
        data: {
          ...updates,
          completedAt: updates.status === 'completed' ? new Date() : undefined
        }
      });

      return {
        id: consultation.id,
        userId: consultation.userId,
        question: consultation.question,
        answer: consultation.answer || undefined,
        legalArea: consultation.legalArea || undefined,
        status: consultation.status,
        createdAt: consultation.createdAt,
        completedAt: consultation.completedAt || undefined
      };

    } catch (error) {
      console.error('Update Consultation Error:', error);
      throw new Error(`Ошибка обновления консультации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Удаление консультации
   */
  async deleteConsultation(id: string): Promise<boolean> {
    try {
      await prisma.consultation.delete({
        where: { id }
      });

      return true;
    } catch (error) {
      console.error('Delete Consultation Error:', error);
      return false;
    }
  }

  /**
   * Создание RAG консультации с интеграцией
   */
  async createRAGConsultation(
    userId: string,
    question: string,
    legalArea?: string,
    ragResult?: {
      answer: string;
      sources: unknown[];
      confidence: number;
      legalReferences: string[];
      suggestedActions: string[];
    }
  ): Promise<ConsultationResult> {
    try {
      // Создаем обычную консультацию
      const consultation = await this.createConsultation({
        userId,
        question,
        answer: ragResult?.answer,
        legalArea,
        status: ragResult ? 'completed' : 'pending',
        source: 'rag',
        metadata: ragResult ? {
          sources: ragResult.sources,
          confidence: ragResult.confidence,
          legalReferences: ragResult.legalReferences,
          suggestedActions: ragResult.suggestedActions
        } : undefined
      });

      // Если есть RAG результат, сохраняем его отдельно
      if (ragResult) {
        await this.ragIntegration.saveConsultation(
          userId,
          question,
          {
            answer: ragResult.answer,
            sources: ragResult.sources as LegalSource[],
            confidence: ragResult.confidence,
            legalReferences: ragResult.legalReferences,
            suggestedActions: ragResult.suggestedActions,
          },
          {
            tokensUsed: this.estimateTokens(ragResult.answer),
            costUsd: this.estimateCost(ragResult.answer),
            responseTimeMs: 0, // Будет заполнено при реальном запросе
            model: 'gpt-4',
            inputTokens: this.estimateTokens(question),
            outputTokens: this.estimateTokens(ragResult.answer)
          }
        );
      }

      return consultation;

    } catch (error) {
      console.error('Create RAG Consultation Error:', error);
      throw new Error(`Ошибка создания RAG консультации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение консультаций пользователя
   */
  async getUserConsultations(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<ConsultationResult[]> {
    return this.getConsultations({
      userId,
      limit,
      offset
    });
  }

  /**
   * Получение статистики консультаций
   */
  async getConsultationStats(filters: ConsultationFilters = {}): Promise<ConsultationStats> {
    try {
      const where: Record<string, unknown> = {};

      if (filters.userId) where.userId = filters.userId;
      if (filters.legalArea) where.legalArea = filters.legalArea;
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) (where.createdAt as Record<string, unknown>).gte = filters.dateFrom;
        if (filters.dateTo) (where.createdAt as Record<string, unknown>).lte = filters.dateTo;
      }

      const [
        total,
        byStatus,
        byLegalArea,
        completedConsultations,
        avgResponseTime
      ] = await Promise.all([
        prisma.consultation.count({ where }),
        prisma.consultation.groupBy({
          by: ['status'],
          where,
          _count: { status: true }
        }),
        prisma.consultation.groupBy({
          by: ['legalArea'],
          where,
          _count: { legalArea: true }
        }),
        prisma.consultation.count({
          where: { ...where, status: 'completed' }
        }),
        prisma.consultation.aggregate({
          where: { ...where, status: 'completed' },
          _avg: {
            // В реальном приложении здесь был бы расчет времени ответа
          }
        })
      ]);

      const byStatusMap: Record<string, number> = {};
      byStatus.forEach(item => {
        byStatusMap[item.status] = item._count.status;
      });

      const byLegalAreaMap: Record<string, number> = {};
      byLegalArea.forEach(item => {
        byLegalAreaMap[item.legalArea || 'unknown'] = item._count.legalArea;
      });


      return {
        total,
        byStatus: byStatusMap,
        byLegalArea: byLegalAreaMap,
        averageResponseTime: 0, // avgResponseTime._avg.responseTime || 0
        completionRate: total > 0 ? (completedConsultations / total) * 100 : 0
      };

    } catch (error) {
      console.error('Get Consultation Stats Error:', error);
      throw new Error(`Ошибка получения статистики: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Поиск консультаций по тексту
   */
  async searchConsultations(
    query: string,
    userId?: string,
    limit: number = 20
  ): Promise<ConsultationResult[]> {
    try {
      const where: Record<string, unknown> = {
        OR: [
          { question: { contains: query, mode: 'insensitive' } },
          { answer: { contains: query, mode: 'insensitive' } }
        ]
      };

      if (userId) {
        where.userId = userId;
      }

      const consultations = await prisma.consultation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return consultations.map(consultation => ({
        id: consultation.id,
        userId: consultation.userId,
        question: consultation.question,
        answer: consultation.answer || undefined,
        legalArea: consultation.legalArea || undefined,
        status: consultation.status,
        createdAt: consultation.createdAt,
        completedAt: consultation.completedAt || undefined
      }));

    } catch (error) {
      console.error('Search Consultations Error:', error);
      throw new Error(`Ошибка поиска консультаций: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Оценка количества токенов (упрощенная)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Оценка стоимости (упрощенная)
   */
  private estimateCost(text: string): number {
    const tokens = this.estimateTokens(text);
    return (tokens / 1000) * 0.03; // Примерная стоимость GPT-4
  }
}

export default ConsultationManager;
