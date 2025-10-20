/**
 * Payment Manager - отслеживание платежей в базе данных
 */

import { prisma } from '../prisma';

export interface PaymentData {
  userId: string;
  amount: number;
  currency: string;
  description: string;
  paymentMethod: 'yookassa' | 'yoomoney' | 'qiwi' | 'sbp' | 'card' | 'other';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentType: 'subscription' | 'consultation' | 'document_processing' | 'dispute_handling' | 'other';
  externalPaymentId?: string;
  subscriptionPlan?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  description: string;
  paymentMethod: string;
  status: string;
  paymentType: string;
  externalPaymentId?: string;
  subscriptionPlan?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
}

export interface PaymentFilters {
  userId?: string;
  status?: string;
  paymentMethod?: string;
  paymentType?: string;
  subscriptionPlan?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface PaymentStats {
  total: number;
  totalAmount: number;
  byStatus: Record<string, number>;
  byMethod: Record<string, number>;
  byType: Record<string, number>;
  byCurrency: Record<string, number>;
  successRate: number;
  averageAmount: number;
  monthlyRevenue: number;
}

export class PaymentManager {
  /**
   * Создание записи о платеже
   */
  async createPayment(data: PaymentData): Promise<PaymentResult> {
    try {
      const payment = await prisma.payment.create({
        data: {
          userId: data.userId,
          amount: data.amount,
          currency: data.currency,
          description: data.description,
          paymentMethod: data.paymentMethod,
          status: data.status,
          paymentType: data.paymentType,
          externalPaymentId: data.externalPaymentId,
          subscriptionPlan: data.subscriptionPlan,
          metadata: data.metadata as any
        }
      });

      return {
        id: payment.id,
        userId: payment.userId,
        amount: payment.amount,
        currency: payment.currency,
        description: payment.description,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        paymentType: payment.paymentType,
        externalPaymentId: payment.externalPaymentId,
        subscriptionPlan: payment.subscriptionPlan,
        metadata: payment.metadata as Record<string, any>,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        completedAt: payment.completedAt,
        failedAt: payment.failedAt
      };

    } catch (error) {
      console.error('Create Payment Error:', error);
      throw new Error(`Ошибка создания платежа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение платежа по ID
   */
  async getPaymentById(id: string): Promise<PaymentResult | null> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id }
      });

      if (!payment) {
        return null;
      }

      return {
        id: payment.id,
        userId: payment.userId,
        amount: payment.amount,
        currency: payment.currency,
        description: payment.description,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        paymentType: payment.paymentType,
        externalPaymentId: payment.externalPaymentId,
        subscriptionPlan: payment.subscriptionPlan,
        metadata: payment.metadata as Record<string, any>,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        completedAt: payment.completedAt,
        failedAt: payment.failedAt
      };

    } catch (error) {
      console.error('Get Payment Error:', error);
      throw new Error(`Ошибка получения платежа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение платежа по внешнему ID
   */
  async getPaymentByExternalId(externalPaymentId: string): Promise<PaymentResult | null> {
    try {
      const payment = await prisma.payment.findFirst({
        where: { externalPaymentId }
      });

      if (!payment) {
        return null;
      }

      return {
        id: payment.id,
        userId: payment.userId,
        amount: payment.amount,
        currency: payment.currency,
        description: payment.description,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        paymentType: payment.paymentType,
        externalPaymentId: payment.externalPaymentId,
        subscriptionPlan: payment.subscriptionPlan,
        metadata: payment.metadata as Record<string, any>,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        completedAt: payment.completedAt,
        failedAt: payment.failedAt
      };

    } catch (error) {
      console.error('Get Payment by External ID Error:', error);
      throw new Error(`Ошибка получения платежа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение платежей с фильтрацией
   */
  async getPayments(filters: PaymentFilters = {}): Promise<PaymentResult[]> {
    try {
      const where: any = {};

      if (filters.userId) where.userId = filters.userId;
      if (filters.status) where.status = filters.status;
      if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;
      if (filters.paymentType) where.paymentType = filters.paymentType;
      if (filters.subscriptionPlan) where.subscriptionPlan = filters.subscriptionPlan;
      
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
        if (filters.dateTo) where.createdAt.lte = filters.dateTo;
      }

      const payments = await prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0
      });

      return payments.map(payment => ({
        id: payment.id,
        userId: payment.userId,
        amount: payment.amount,
        currency: payment.currency,
        description: payment.description,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        paymentType: payment.paymentType,
        externalPaymentId: payment.externalPaymentId,
        subscriptionPlan: payment.subscriptionPlan,
        metadata: payment.metadata as Record<string, any>,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        completedAt: payment.completedAt,
        failedAt: payment.failedAt
      }));

    } catch (error) {
      console.error('Get Payments Error:', error);
      throw new Error(`Ошибка получения платежей: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Обновление платежа
   */
  async updatePayment(
    id: string,
    updates: Partial<PaymentData>
  ): Promise<PaymentResult> {
    try {
      const payment = await prisma.payment.update({
        where: { id },
        data: {
          ...updates,
          updatedAt: new Date(),
          completedAt: updates.status === 'completed' ? new Date() : undefined,
          failedAt: updates.status === 'failed' ? new Date() : undefined
        }
      });

      return {
        id: payment.id,
        userId: payment.userId,
        amount: payment.amount,
        currency: payment.currency,
        description: payment.description,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        paymentType: payment.paymentType,
        externalPaymentId: payment.externalPaymentId,
        subscriptionPlan: payment.subscriptionPlan,
        metadata: payment.metadata as Record<string, any>,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        completedAt: payment.completedAt,
        failedAt: payment.failedAt
      };

    } catch (error) {
      console.error('Update Payment Error:', error);
      throw new Error(`Ошибка обновления платежа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Обновление статуса платежа
   */
  async updatePaymentStatus(
    id: string,
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded',
    externalPaymentId?: string
  ): Promise<PaymentResult> {
    const updates: Partial<PaymentData> = { status };
    if (externalPaymentId) {
      updates.externalPaymentId = externalPaymentId;
    }

    return this.updatePayment(id, updates);
  }

  /**
   * Получение платежей пользователя
   */
  async getUserPayments(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<PaymentResult[]> {
    return this.getPayments({
      userId,
      limit,
      offset
    });
  }

  /**
   * Получение статистики платежей
   */
  async getPaymentStats(filters: PaymentFilters = {}): Promise<PaymentStats> {
    try {
      const where: any = {};

      if (filters.userId) where.userId = filters.userId;
      if (filters.paymentType) where.paymentType = filters.paymentType;
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
        if (filters.dateTo) where.createdAt.lte = filters.dateTo;
      }

      const [
        total,
        totalAmount,
        byStatus,
        byMethod,
        byType,
        byCurrency,
        completedPayments,
        monthlyRevenue
      ] = await Promise.all([
        prisma.payment.count({ where }),
        prisma.payment.aggregate({
          where,
          _sum: { amount: true }
        }),
        prisma.payment.groupBy({
          by: ['status'],
          where,
          _count: { status: true }
        }),
        prisma.payment.groupBy({
          by: ['paymentMethod'],
          where,
          _count: { paymentMethod: true }
        }),
        prisma.payment.groupBy({
          by: ['paymentType'],
          where,
          _count: { paymentType: true }
        }),
        prisma.payment.groupBy({
          by: ['currency'],
          where,
          _count: { currency: true }
        }),
        prisma.payment.count({
          where: { ...where, status: 'completed' }
        }),
        prisma.payment.aggregate({
          where: {
            ...where,
            status: 'completed',
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          },
          _sum: { amount: true }
        })
      ]);

      const byStatusMap: Record<string, number> = {};
      byStatus.forEach(item => {
        byStatusMap[item.status || 'unknown'] = item._count.status;
      });

      const byMethodMap: Record<string, number> = {};
      byMethod.forEach(item => {
        byMethodMap[item.paymentMethod || 'unknown'] = item._count.paymentMethod;
      });

      const byTypeMap: Record<string, number> = {};
      byType.forEach(item => {
        byTypeMap[item.paymentType || 'unknown'] = item._count.paymentType;
      });

      const byCurrencyMap: Record<string, number> = {};
      byCurrency.forEach(item => {
        byCurrencyMap[item.currency || 'unknown'] = item._count.currency;
      });

      return {
        total,
        totalAmount: totalAmount._sum.amount || 0,
        byStatus: byStatusMap,
        byMethod: byMethodMap,
        byType: byTypeMap,
        byCurrency: byCurrencyMap,
        successRate: total > 0 ? (completedPayments / total) * 100 : 0,
        averageAmount: total > 0 ? (totalAmount._sum.amount || 0) / total : 0,
        monthlyRevenue: monthlyRevenue._sum.amount || 0
      };

    } catch (error) {
      console.error('Get Payment Stats Error:', error);
      throw new Error(`Ошибка получения статистики: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Поиск платежей по описанию
   */
  async searchPayments(
    query: string,
    userId?: string,
    limit: number = 20
  ): Promise<PaymentResult[]> {
    try {
      const where: any = {
        description: { contains: query, mode: 'insensitive' }
      };

      if (userId) {
        where.userId = userId;
      }

      const payments = await prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return payments.map(payment => ({
        id: payment.id,
        userId: payment.userId,
        amount: payment.amount,
        currency: payment.currency,
        description: payment.description,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        paymentType: payment.paymentType,
        externalPaymentId: payment.externalPaymentId,
        subscriptionPlan: payment.subscriptionPlan,
        metadata: payment.metadata as Record<string, any>,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        completedAt: payment.completedAt,
        failedAt: payment.failedAt
      }));

    } catch (error) {
      console.error('Search Payments Error:', error);
      throw new Error(`Ошибка поиска платежей: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Создание платежа за подписку
   */
  async createSubscriptionPayment(
    userId: string,
    subscriptionPlan: string,
    amount: number,
    currency: string,
    paymentMethod: string,
    externalPaymentId?: string
  ): Promise<PaymentResult> {
    return this.createPayment({
      userId,
      amount,
      currency,
      description: `Оплата подписки ${subscriptionPlan}`,
      paymentMethod: paymentMethod as any,
      status: 'pending',
      paymentType: 'subscription',
      externalPaymentId,
      subscriptionPlan
    });
  }

  /**
   * Создание платежа за консультацию
   */
  async createConsultationPayment(
    userId: string,
    amount: number,
    currency: string,
    paymentMethod: string,
    consultationId?: string,
    externalPaymentId?: string
  ): Promise<PaymentResult> {
    return this.createPayment({
      userId,
      amount,
      currency,
      description: `Оплата консультации${consultationId ? ` #${consultationId}` : ''}`,
      paymentMethod: paymentMethod as any,
      status: 'pending',
      paymentType: 'consultation',
      externalPaymentId,
      metadata: consultationId ? { consultationId } : undefined
    });
  }

  /**
   * Получение платежей за подписки
   */
  async getSubscriptionPayments(
    userId?: string,
    limit: number = 20
  ): Promise<PaymentResult[]> {
    return this.getPayments({
      userId,
      paymentType: 'subscription',
      limit
    });
  }

  /**
   * Получение платежей за консультации
   */
  async getConsultationPayments(
    userId?: string,
    limit: number = 20
  ): Promise<PaymentResult[]> {
    return this.getPayments({
      userId,
      paymentType: 'consultation',
      limit
    });
  }

  /**
   * Получение доходов по периодам
   */
  async getRevenueByPeriod(
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<Array<{
    period: string;
    amount: number;
    count: number;
  }>> {
    try {
      // В реальном приложении здесь был бы сложный SQL запрос для группировки
      // Для демо возвращаем упрощенный результат
      const payments = await prisma.payment.findMany({
        where: {
          status: 'completed',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          amount: true,
          createdAt: true
        }
      });

      const grouped: Record<string, { amount: number; count: number }> = {};

      payments.forEach(payment => {
        const date = new Date(payment.createdAt);
        let period: string;

        switch (groupBy) {
          case 'day':
            period = date.toISOString().split('T')[0];
            break;
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            period = weekStart.toISOString().split('T')[0];
            break;
          case 'month':
            period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          default:
            period = date.toISOString().split('T')[0];
        }

        if (!grouped[period]) {
          grouped[period] = { amount: 0, count: 0 };
        }

        grouped[period].amount += payment.amount;
        grouped[period].count += 1;
      });

      return Object.entries(grouped).map(([period, data]) => ({
        period,
        amount: data.amount,
        count: data.count
      }));

    } catch (error) {
      console.error('Get Revenue by Period Error:', error);
      throw new Error(`Ошибка получения доходов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }
}

export default PaymentManager;
