/**
 * Dispute Manager - управление спорами в базе данных
 */

import { prisma } from '../prisma';

export interface DisputeData {
  userId: string;
  title: string;
  description: string;
  legalArea?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  disputeType?: 'consumer' | 'labor' | 'civil' | 'criminal' | 'administrative' | 'other';
  estimatedValue?: number;
  currency?: string;
  deadline?: Date;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface DisputeResult {
  id: string;
  userId: string;
  title: string;
  description: string;
  legalArea?: string;
  status: string;
  priority: string;
  disputeType?: string;
  estimatedValue?: number;
  currency?: string;
  deadline?: Date;
  metadata?: Record<string, any>;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface DisputeFilters {
  userId?: string;
  status?: string;
  priority?: string;
  disputeType?: string;
  legalArea?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface DisputeStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
  byLegalArea: Record<string, number>;
  averageResolutionTime: number;
  resolutionRate: number;
  totalEstimatedValue: number;
}

export interface TimelineEventData {
  disputeId: string;
  type: 'created' | 'updated' | 'status_changed' | 'document_added' | 'comment_added' | 'deadline_set' | 'resolved';
  description: string;
  userId: string;
  metadata?: Record<string, any>;
}

export class DisputeManager {
  /**
   * Создание нового спора
   */
  async createDispute(data: DisputeData): Promise<DisputeResult> {
    try {
      const dispute = await prisma.dispute.create({
        data: {
          userId: data.userId,
          title: data.title,
          description: data.description,
          legalArea: data.legalArea,
          status: data.status,
          priority: data.priority,
          disputeType: data.disputeType,
          estimatedValue: data.estimatedValue,
          currency: data.currency,
          deadline: data.deadline,
          metadata: data.metadata as any,
          tags: data.tags
        }
      });

      // Создаем событие в timeline
      await this.addTimelineEvent({
        disputeId: dispute.id,
        type: 'created',
        description: `Спор "${data.title}" создан`,
        userId: data.userId
      });

      return {
        id: dispute.id,
        userId: dispute.userId,
        title: dispute.title,
        description: dispute.description,
        legalArea: dispute.legalArea,
        status: dispute.status,
        priority: dispute.priority,
        disputeType: dispute.disputeType,
        estimatedValue: dispute.estimatedValue,
        currency: dispute.currency,
        deadline: dispute.deadline,
        metadata: dispute.metadata as Record<string, any>,
        tags: dispute.tags,
        createdAt: dispute.createdAt,
        updatedAt: dispute.updatedAt,
        resolvedAt: dispute.resolvedAt
      };

    } catch (error) {
      console.error('Create Dispute Error:', error);
      throw new Error(`Ошибка создания спора: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение спора по ID
   */
  async getDisputeById(id: string): Promise<DisputeResult | null> {
    try {
      const dispute = await prisma.dispute.findUnique({
        where: { id }
      });

      if (!dispute) {
        return null;
      }

      return {
        id: dispute.id,
        userId: dispute.userId,
        title: dispute.title,
        description: dispute.description,
        legalArea: dispute.legalArea,
        status: dispute.status,
        priority: dispute.priority,
        disputeType: dispute.disputeType,
        estimatedValue: dispute.estimatedValue,
        currency: dispute.currency,
        deadline: dispute.deadline,
        metadata: dispute.metadata as Record<string, any>,
        tags: dispute.tags,
        createdAt: dispute.createdAt,
        updatedAt: dispute.updatedAt,
        resolvedAt: dispute.resolvedAt
      };

    } catch (error) {
      console.error('Get Dispute Error:', error);
      throw new Error(`Ошибка получения спора: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение споров с фильтрацией
   */
  async getDisputes(filters: DisputeFilters = {}): Promise<DisputeResult[]> {
    try {
      const where: any = {};

      if (filters.userId) where.userId = filters.userId;
      if (filters.status) where.status = filters.status;
      if (filters.priority) where.priority = filters.priority;
      if (filters.disputeType) where.disputeType = filters.disputeType;
      if (filters.legalArea) where.legalArea = filters.legalArea;
      if (filters.tags && filters.tags.length > 0) {
        where.tags = { hasSome: filters.tags };
      }
      
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
        if (filters.dateTo) where.createdAt.lte = filters.dateTo;
      }

      const disputes = await prisma.dispute.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0
      });

      return disputes.map(dispute => ({
        id: dispute.id,
        userId: dispute.userId,
        title: dispute.title,
        description: dispute.description,
        legalArea: dispute.legalArea,
        status: dispute.status,
        priority: dispute.priority,
        disputeType: dispute.disputeType,
        estimatedValue: dispute.estimatedValue,
        currency: dispute.currency,
        deadline: dispute.deadline,
        metadata: dispute.metadata as Record<string, any>,
        tags: dispute.tags,
        createdAt: dispute.createdAt,
        updatedAt: dispute.updatedAt,
        resolvedAt: dispute.resolvedAt
      }));

    } catch (error) {
      console.error('Get Disputes Error:', error);
      throw new Error(`Ошибка получения споров: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Обновление спора
   */
  async updateDispute(
    id: string,
    updates: Partial<DisputeData>
  ): Promise<DisputeResult> {
    try {
      const oldDispute = await prisma.dispute.findUnique({
        where: { id },
        select: { status: true, title: true }
      });

      const dispute = await prisma.dispute.update({
        where: { id },
        data: {
          ...updates,
          updatedAt: new Date(),
          resolvedAt: updates.status === 'resolved' ? new Date() : undefined
        }
      });

      // Создаем событие в timeline если статус изменился
      if (oldDispute && updates.status && oldDispute.status !== updates.status) {
        await this.addTimelineEvent({
          disputeId: id,
          type: 'status_changed',
          description: `Статус изменен с "${oldDispute.status}" на "${updates.status}"`,
          userId: updates.userId || oldDispute.userId || '',
          metadata: {
            oldStatus: oldDispute.status,
            newStatus: updates.status
          }
        });
      }

      return {
        id: dispute.id,
        userId: dispute.userId,
        title: dispute.title,
        description: dispute.description,
        legalArea: dispute.legalArea,
        status: dispute.status,
        priority: dispute.priority,
        disputeType: dispute.disputeType,
        estimatedValue: dispute.estimatedValue,
        currency: dispute.currency,
        deadline: dispute.deadline,
        metadata: dispute.metadata as Record<string, any>,
        tags: dispute.tags,
        createdAt: dispute.createdAt,
        updatedAt: dispute.updatedAt,
        resolvedAt: dispute.resolvedAt
      };

    } catch (error) {
      console.error('Update Dispute Error:', error);
      throw new Error(`Ошибка обновления спора: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Удаление спора
   */
  async deleteDispute(id: string): Promise<boolean> {
    try {
      await prisma.dispute.delete({
        where: { id }
      });

      return true;
    } catch (error) {
      console.error('Delete Dispute Error:', error);
      return false;
    }
  }

  /**
   * Получение споров пользователя
   */
  async getUserDisputes(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<DisputeResult[]> {
    return this.getDisputes({
      userId,
      limit,
      offset
    });
  }

  /**
   * Получение статистики споров
   */
  async getDisputeStats(filters: DisputeFilters = {}): Promise<DisputeStats> {
    try {
      const where: any = {};

      if (filters.userId) where.userId = filters.userId;
      if (filters.legalArea) where.legalArea = filters.legalArea;
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
        if (filters.dateTo) where.createdAt.lte = filters.dateTo;
      }

      const [
        total,
        byStatus,
        byPriority,
        byType,
        byLegalArea,
        resolvedDisputes,
        totalValue
      ] = await Promise.all([
        prisma.dispute.count({ where }),
        prisma.dispute.groupBy({
          by: ['status'],
          where,
          _count: { status: true }
        }),
        prisma.dispute.groupBy({
          by: ['priority'],
          where,
          _count: { priority: true }
        }),
        prisma.dispute.groupBy({
          by: ['disputeType'],
          where,
          _count: { disputeType: true }
        }),
        prisma.dispute.groupBy({
          by: ['legalArea'],
          where,
          _count: { legalArea: true }
        }),
        prisma.dispute.count({
          where: { ...where, status: 'resolved' }
        }),
        prisma.dispute.aggregate({
          where,
          _sum: { estimatedValue: true }
        })
      ]);

      const byStatusMap: Record<string, number> = {};
      byStatus.forEach(item => {
        byStatusMap[item.status || 'unknown'] = item._count.status;
      });

      const byPriorityMap: Record<string, number> = {};
      byPriority.forEach(item => {
        byPriorityMap[item.priority || 'unknown'] = item._count.priority;
      });

      const byTypeMap: Record<string, number> = {};
      byType.forEach(item => {
        byTypeMap[item.disputeType || 'unknown'] = item._count.disputeType;
      });

      const byLegalAreaMap: Record<string, number> = {};
      byLegalArea.forEach(item => {
        byLegalAreaMap[item.legalArea || 'unknown'] = item._count.legalArea;
      });

      return {
        total,
        byStatus: byStatusMap,
        byPriority: byPriorityMap,
        byType: byTypeMap,
        byLegalArea: byLegalAreaMap,
        averageResolutionTime: 0, // В реальном приложении расчет времени
        resolutionRate: total > 0 ? (resolvedDisputes / total) * 100 : 0,
        totalEstimatedValue: totalValue._sum.estimatedValue || 0
      };

    } catch (error) {
      console.error('Get Dispute Stats Error:', error);
      throw new Error(`Ошибка получения статистики: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Поиск споров по тексту
   */
  async searchDisputes(
    query: string,
    userId?: string,
    limit: number = 20
  ): Promise<DisputeResult[]> {
    try {
      const where: any = {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      };

      if (userId) {
        where.userId = userId;
      }

      const disputes = await prisma.dispute.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return disputes.map(dispute => ({
        id: dispute.id,
        userId: dispute.userId,
        title: dispute.title,
        description: dispute.description,
        legalArea: dispute.legalArea,
        status: dispute.status,
        priority: dispute.priority,
        disputeType: dispute.disputeType,
        estimatedValue: dispute.estimatedValue,
        currency: dispute.currency,
        deadline: dispute.deadline,
        metadata: dispute.metadata as Record<string, any>,
        tags: dispute.tags,
        createdAt: dispute.createdAt,
        updatedAt: dispute.updatedAt,
        resolvedAt: dispute.resolvedAt
      }));

    } catch (error) {
      console.error('Search Disputes Error:', error);
      throw new Error(`Ошибка поиска споров: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Добавление события в timeline
   */
  async addTimelineEvent(data: TimelineEventData): Promise<void> {
    try {
      await prisma.timelineEvent.create({
        data: {
          disputeId: data.disputeId,
          type: data.type,
          description: data.description,
          userId: data.userId,
          metadata: data.metadata as any
        }
      });
    } catch (error) {
      console.error('Add Timeline Event Error:', error);
      throw new Error(`Ошибка добавления события: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение timeline событий для спора
   */
  async getDisputeTimeline(disputeId: string): Promise<Array<{
    id: string;
    type: string;
    description: string;
    userId: string;
    createdAt: Date;
    metadata?: Record<string, any>;
  }>> {
    try {
      const events = await prisma.timelineEvent.findMany({
        where: { disputeId },
        orderBy: { createdAt: 'asc' }
      });

      return events.map(event => ({
        id: event.id,
        type: event.type,
        description: event.description,
        userId: event.userId,
        createdAt: event.createdAt,
        metadata: event.metadata as Record<string, any>
      }));

    } catch (error) {
      console.error('Get Dispute Timeline Error:', error);
      throw new Error(`Ошибка получения timeline: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Обновление статуса спора
   */
  async updateDisputeStatus(
    id: string,
    status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled',
    userId: string
  ): Promise<DisputeResult> {
    return this.updateDispute(id, { status, userId });
  }

  /**
   * Установка дедлайна для спора
   */
  async setDisputeDeadline(
    id: string,
    deadline: Date,
    userId: string
  ): Promise<DisputeResult> {
    const result = await this.updateDispute(id, { deadline, userId });
    
    // Добавляем событие в timeline
    await this.addTimelineEvent({
      disputeId: id,
      type: 'deadline_set',
      description: `Установлен дедлайн: ${deadline.toLocaleDateString()}`,
      userId,
      metadata: { deadline }
    });

    return result;
  }

  /**
   * Получение споров с истекающими дедлайнами
   */
  async getDisputesWithExpiringDeadlines(days: number = 7): Promise<DisputeResult[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const disputes = await prisma.dispute.findMany({
        where: {
          deadline: {
            lte: futureDate,
            gte: new Date()
          },
          status: {
            in: ['open', 'in_progress']
          }
        },
        orderBy: { deadline: 'asc' }
      });

      return disputes.map(dispute => ({
        id: dispute.id,
        userId: dispute.userId,
        title: dispute.title,
        description: dispute.description,
        legalArea: dispute.legalArea,
        status: dispute.status,
        priority: dispute.priority,
        disputeType: dispute.disputeType,
        estimatedValue: dispute.estimatedValue,
        currency: dispute.currency,
        deadline: dispute.deadline,
        metadata: dispute.metadata as Record<string, any>,
        tags: dispute.tags,
        createdAt: dispute.createdAt,
        updatedAt: dispute.updatedAt,
        resolvedAt: dispute.resolvedAt
      }));

    } catch (error) {
      console.error('Get Expiring Disputes Error:', error);
      throw new Error(`Ошибка получения споров с истекающими дедлайнами: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }
}

export default DisputeManager;
