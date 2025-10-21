/**
 * Document Manager - управление метаданными документов
 */

import { prisma } from '../prisma';

export interface DocumentData {
  userId: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  filePath?: string;
  s3Key?: string;
  documentType?: 'contract' | 'agreement' | 'claim' | 'lawsuit' | 'other';
  legalArea?: string;
  status: 'uploaded' | 'processing' | 'processed' | 'failed';
  metadata?: Record<string, unknown>;
  tags?: string[];
}

export interface DocumentResult {
  id: string;
  userId: string;
  title: string;
  fileSize: number;
  mimeType: string;
  filePath?: string;
  documentType?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentFilters {
  userId?: string;
  documentType?: string;
  legalArea?: string;
  status?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface DocumentStats {
  total: number;
  totalSize: number;
  byType: Record<string, number>;
  byLegalArea: Record<string, number>;
  byStatus: Record<string, number>;
  averageSize: number;
  processingRate: number;
}

export class DocumentManager {
  /**
   * Создание записи о документе
   */
  async createDocument(data: DocumentData): Promise<DocumentResult> {
    try {
      const document = await prisma.document.create({
        data: {
          userId: data.userId,
          title: data.title,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
          filePath: data.filePath,
          documentType: data.documentType,
          status: data.status,
        }
      });

      return {
        id: document.id,
        userId: document.userId,
        title: document.title,
        fileSize: document.fileSize || 0,
        mimeType: document.mimeType || '',
        filePath: document.filePath || undefined,
        documentType: document.documentType || undefined,
        status: document.status,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      };

    } catch (error) {
      console.error('Create Document Error:', error);
      throw new Error(`Ошибка создания документа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение документа по ID
   */
  async getDocumentById(id: string): Promise<DocumentResult | null> {
    try {
      const document = await prisma.document.findUnique({
        where: { id }
      });

      if (!document) {
        return null;
      }

      return {
        id: document.id,
        userId: document.userId,
        title: document.title,
        fileSize: document.fileSize || 0,
        mimeType: document.mimeType || '',
        filePath: document.filePath || undefined,
        documentType: document.documentType || undefined,
        status: document.status,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      };

    } catch (error) {
      console.error('Get Document Error:', error);
      throw new Error(`Ошибка получения документа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение документов с фильтрацией
   */
  async getDocuments(filters: DocumentFilters = {}): Promise<DocumentResult[]> {
    try {
      const where: Record<string, unknown> = {};

      if (filters.userId) where.userId = filters.userId;
      if (filters.documentType) where.documentType = filters.documentType;
      if (filters.legalArea) where.legalArea = filters.legalArea;
      if (filters.status) where.status = filters.status;
      if (filters.tags && filters.tags.length > 0) {
        where.tags = { hasSome: filters.tags };
      }
      
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) (where.createdAt as Record<string, unknown>).gte = filters.dateFrom;
        if (filters.dateTo) (where.createdAt as Record<string, unknown>).lte = filters.dateTo;
      }

      const documents = await prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0
      });

      return documents.map(document => ({
        id: document.id,
        userId: document.userId,
        title: document.title,
        fileSize: document.fileSize || 0,
        mimeType: document.mimeType || '',
        filePath: document.filePath || undefined,
        documentType: document.documentType || undefined,
        status: document.status,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      }));

    } catch (error) {
      console.error('Get Documents Error:', error);
      throw new Error(`Ошибка получения документов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Обновление документа
   */
  async updateDocument(
    id: string,
    updates: Partial<DocumentData>
  ): Promise<DocumentResult> {
    try {
      const document = await prisma.document.update({
        where: { id },
        data: {
          ...updates,
          updatedAt: new Date(),
        }
      });

      return {
        id: document.id,
        userId: document.userId,
        title: document.title,
        fileSize: document.fileSize || 0,
        mimeType: document.mimeType || '',
        filePath: document.filePath || undefined,
        documentType: document.documentType || undefined,
        status: document.status,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      };

    } catch (error) {
      console.error('Update Document Error:', error);
      throw new Error(`Ошибка обновления документа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Удаление документа
   */
  async deleteDocument(id: string): Promise<boolean> {
    try {
      await prisma.document.delete({
        where: { id }
      });

      return true;
    } catch (error) {
      console.error('Delete Document Error:', error);
      return false;
    }
  }

  /**
   * Получение документов пользователя
   */
  async getUserDocuments(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<DocumentResult[]> {
    return this.getDocuments({
      userId,
      limit,
      offset
    });
  }

  /**
   * Получение статистики документов
   */
  async getDocumentStats(filters: DocumentFilters = {}): Promise<DocumentStats> {
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
        totalSize,
        byType,
        byLegalArea,
        byStatus,
        processedDocuments
      ] = await Promise.all([
        prisma.document.count({ where }),
        prisma.document.aggregate({
          where,
          _sum: { fileSize: true }
        }),
        prisma.document.groupBy({
          by: ['documentType'],
          where,
          _count: { documentType: true }
        }),
        Promise.resolve([]),
        prisma.document.groupBy({
          by: ['status'],
          where,
          _count: { status: true }
        }),
        prisma.document.count({
          where: { ...where, status: 'processed' }
        })
      ]);

      const byTypeMap: Record<string, number> = {};
      byType.forEach(item => {
        byTypeMap[item.documentType || 'unknown'] = item._count.documentType;
      });

      const byLegalAreaMap: Record<string, number> = {};

      const byStatusMap: Record<string, number> = {};
      byStatus.forEach(item => {
        byStatusMap[item.status || 'unknown'] = item._count.status;
      });

      return {
        total,
        totalSize: totalSize._sum.fileSize || 0,
        byType: byTypeMap,
        byLegalArea: byLegalAreaMap,
        byStatus: byStatusMap,
        averageSize: total > 0 ? (totalSize._sum.fileSize || 0) / total : 0,
        processingRate: total > 0 ? (processedDocuments / total) * 100 : 0
      };

    } catch (error) {
      console.error('Get Document Stats Error:', error);
      throw new Error(`Ошибка получения статистики: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Поиск документов по тексту
   */
  async searchDocuments(
    query: string,
    userId?: string,
    limit: number = 20
  ): Promise<DocumentResult[]> {
    try {
      const where: Record<string, unknown> = {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { fileName: { contains: query, mode: 'insensitive' } }
        ]
      };

      if (userId) {
        where.userId = userId;
      }

      const documents = await prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return documents.map(document => ({
        id: document.id,
        userId: document.userId,
        title: document.title,
        fileSize: document.fileSize || 0,
        mimeType: document.mimeType || '',
        filePath: document.filePath || undefined,
        documentType: document.documentType || undefined,
        status: document.status,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      }));

    } catch (error) {
      console.error('Search Documents Error:', error);
      throw new Error(`Ошибка поиска документов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Добавление тегов к документу
   */
  async addTagsToDocument(id: string, tags: string[]): Promise<DocumentResult> {
    try {
      const document = await prisma.document.findUnique({
        where: { id },
        select: { id: true }
      });

      if (!document) {
        throw new Error('Документ не найден');
      }

      return await this.updateDocument(id, { status: 'processed' });

    } catch (error) {
      console.error('Add Tags Error:', error);
      throw new Error(`Ошибка добавления тегов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Удаление тегов из документа
   */
  async removeTagsFromDocument(id: string, tags: string[]): Promise<DocumentResult> {
    try {
      const document = await prisma.document.findUnique({
        where: { id },
        select: { id: true }
      });

      if (!document) {
        throw new Error('Документ не найден');
      }

      return await this.updateDocument(id, { status: 'processed' });

    } catch (error) {
      console.error('Remove Tags Error:', error);
      throw new Error(`Ошибка удаления тегов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение документов по тегам
   */
  async getDocumentsByTags(tags: string[], userId?: string): Promise<DocumentResult[]> {
    return this.getDocuments({
      tags,
      userId
    });
  }

  /**
   * Обновление статуса документа
   */
  async updateDocumentStatus(
    id: string,
    status: 'uploaded' | 'processing' | 'processed' | 'failed',
    metadata?: Record<string, unknown>
  ): Promise<DocumentResult> {
    return this.updateDocument(id, {
      status,
      metadata: metadata ? { ...metadata } : undefined
    });
  }
}

export default DocumentManager;
