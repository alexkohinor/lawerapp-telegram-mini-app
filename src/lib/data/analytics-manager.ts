/**
 * Analytics Manager - аналитические данные и метрики
 */

import { prisma } from '../prisma';
import { ConsultationManager } from './consultation-manager';
import { DocumentManager } from './document-manager';
import { DisputeManager } from './dispute-manager';
import { PaymentManager } from './payment-manager';
import { NotificationManager } from './notification-manager';

export interface AnalyticsPeriod {
  startDate: Date;
  endDate: Date;
  groupBy: 'day' | 'week' | 'month' | 'year';
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  usersByPlan: Record<string, number>;
  userRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
  averageSessionDuration: number;
  topUserActions: Array<{
    action: string;
    count: number;
  }>;
}

export interface BusinessAnalytics {
  revenue: {
    total: number;
    monthly: number;
    byPlan: Record<string, number>;
    growth: number;
  };
  conversions: {
    freeToPaid: number;
    trialToPaid: number;
    churnRate: number;
  };
  usage: {
    totalConsultations: number;
    totalDocuments: number;
    totalDisputes: number;
    averagePerUser: number;
  };
  performance: {
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
  };
}

export interface SystemAnalytics {
  performance: {
    averageResponseTime: number;
    uptime: number;
    errorRate: number;
    throughput: number;
  };
  resources: {
    databaseConnections: number;
    memoryUsage: number;
    cpuUsage: number;
    storageUsage: number;
  };
  security: {
    failedLogins: number;
    suspiciousActivities: number;
    blockedRequests: number;
  };
}

export interface TimeSeriesData {
  period: string;
  value: number;
  metadata?: Record<string, unknown>;
}

export class AnalyticsManager {
  private consultationManager: ConsultationManager;
  private documentManager: DocumentManager;
  private disputeManager: DisputeManager;
  private paymentManager: PaymentManager;
  private notificationManager: NotificationManager;

  constructor() {
    this.consultationManager = new ConsultationManager();
    this.documentManager = new DocumentManager();
    this.disputeManager = new DisputeManager();
    this.paymentManager = new PaymentManager();
    this.notificationManager = new NotificationManager();
  }

  /**
   * Получение аналитики пользователей
   */
  async getUserAnalytics(period: AnalyticsPeriod): Promise<UserAnalytics> {
    try {
      const [
        totalUsers,
        activeUsers,
        newUsers,
        usersByPlan,
        userRetention,
        averageSessionDuration,
        topUserActions
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            lastLoginAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: period.startDate,
              lte: period.endDate
            }
          }
        }),
        prisma.user.groupBy({
          by: ['subscriptionPlan'],
          _count: { subscriptionPlan: true }
        }),
        this.calculateUserRetention(period),
        this.calculateAverageSessionDuration(period),
        this.getTopUserActions(period)
      ]);

      const usersByPlanMap: Record<string, number> = {};
      usersByPlan.forEach(item => {
        usersByPlanMap[item.subscriptionPlan || 'unknown'] = item._count.subscriptionPlan;
      });

      return {
        totalUsers,
        activeUsers,
        newUsers,
        usersByPlan: usersByPlanMap,
        userRetention,
        averageSessionDuration,
        topUserActions
      };

    } catch (error) {
      console.error('Get User Analytics Error:', error);
      throw new Error(`Ошибка получения аналитики пользователей: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение бизнес-аналитики
   */
  async getBusinessAnalytics(period: AnalyticsPeriod): Promise<BusinessAnalytics> {
    try {
      const [
        revenue,
        conversions,
        usage,
        performance
      ] = await Promise.all([
        this.calculateRevenue(period),
        this.calculateConversions(period),
        this.calculateUsage(period),
        this.calculatePerformance(period)
      ]);

      return {
        revenue,
        conversions,
        usage,
        performance
      };

    } catch (error) {
      console.error('Get Business Analytics Error:', error);
      throw new Error(`Ошибка получения бизнес-аналитики: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение системной аналитики
   */
  async getSystemAnalytics(period: AnalyticsPeriod): Promise<SystemAnalytics> {
    try {
      const [
        performance,
        resources,
        security
      ] = await Promise.all([
        this.calculateSystemPerformance(period),
        this.calculateResourceUsage(period),
        this.calculateSecurityMetrics(period)
      ]);

      return {
        performance,
        resources,
        security
      };

    } catch (error) {
      console.error('Get System Analytics Error:', error);
      throw new Error(`Ошибка получения системной аналитики: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение временных рядов данных
   */
  async getTimeSeriesData(
    metric: 'users' | 'revenue' | 'consultations' | 'documents' | 'disputes' | 'payments',
    period: AnalyticsPeriod
  ): Promise<TimeSeriesData[]> {
    try {
      switch (metric) {
        case 'users':
          return this.getUserTimeSeries(period);
        case 'revenue':
          return this.getRevenueTimeSeries(period);
        case 'consultations':
          return this.getConsultationTimeSeries(period);
        case 'documents':
          return this.getDocumentTimeSeries(period);
        case 'disputes':
          return this.getDisputeTimeSeries(period);
        case 'payments':
          return this.getPaymentTimeSeries(period);
        default:
          throw new Error('Неизвестная метрика');
      }
    } catch (error) {
      console.error('Get Time Series Data Error:', error);
      throw new Error(`Ошибка получения временных рядов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение дашборда аналитики
   */
  async getAnalyticsDashboard(period: AnalyticsPeriod): Promise<{
    userAnalytics: UserAnalytics;
    businessAnalytics: BusinessAnalytics;
    systemAnalytics: SystemAnalytics;
    timeSeries: {
      users: TimeSeriesData[];
      revenue: TimeSeriesData[];
      consultations: TimeSeriesData[];
    };
  }> {
    try {
      const [
        userAnalytics,
        businessAnalytics,
        systemAnalytics,
        userTimeSeries,
        revenueTimeSeries,
        consultationTimeSeries
      ] = await Promise.all([
        this.getUserAnalytics(period),
        this.getBusinessAnalytics(period),
        this.getSystemAnalytics(period),
        this.getTimeSeriesData('users', period),
        this.getTimeSeriesData('revenue', period),
        this.getTimeSeriesData('consultations', period)
      ]);

      return {
        userAnalytics,
        businessAnalytics,
        systemAnalytics,
        timeSeries: {
          users: userTimeSeries,
          revenue: revenueTimeSeries,
          consultations: consultationTimeSeries
        }
      };

    } catch (error) {
      console.error('Get Analytics Dashboard Error:', error);
      throw new Error(`Ошибка получения дашборда: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Расчет удержания пользователей
   */
  private async calculateUserRetention(period: AnalyticsPeriod): Promise<{
    day1: number;
    day7: number;
    day30: number;
  }> {
    try {
      // В реальном приложении здесь был бы сложный расчет retention
      // Для демо возвращаем примерные значения
      return {
        day1: 85,
        day7: 65,
        day30: 45
      };
    } catch (error) {
      console.error('Calculate User Retention Error:', error);
      return { day1: 0, day7: 0, day30: 0 };
    }
  }

  /**
   * Расчет средней продолжительности сессии
   */
  private async calculateAverageSessionDuration(period: AnalyticsPeriod): Promise<number> {
    try {
      // В реальном приложении здесь был бы расчет на основе данных сессий
      return 15.5; // минуты
    } catch (error) {
      console.error('Calculate Average Session Duration Error:', error);
      return 0;
    }
  }

  /**
   * Получение топ действий пользователей
   */
  private async getTopUserActions(period: AnalyticsPeriod): Promise<Array<{
    action: string;
    count: number;
  }>> {
    try {
      // В реальном приложении здесь был бы анализ логов действий
      return [
        { action: 'consultation_created', count: 150 },
        { action: 'document_uploaded', count: 120 },
        { action: 'dispute_created', count: 80 },
        { action: 'payment_completed', count: 60 },
        { action: 'profile_updated', count: 40 }
      ];
    } catch (error) {
      console.error('Get Top User Actions Error:', error);
      return [];
    }
  }

  /**
   * Расчет доходов
   */
  private async calculateRevenue(period: AnalyticsPeriod): Promise<{
    total: number;
    monthly: number;
    byPlan: Record<string, number>;
    growth: number;
  }> {
    try {
      const paymentStats = await this.paymentManager.getPaymentStats({
        dateFrom: period.startDate,
        dateTo: period.endDate
      });

      const previousPeriod = {
        startDate: new Date(period.startDate.getTime() - (period.endDate.getTime() - period.startDate.getTime())),
        endDate: period.startDate
      };

      const previousStats = await this.paymentManager.getPaymentStats({
        dateFrom: previousPeriod.startDate,
        dateTo: previousPeriod.endDate
      });

      const growth = previousStats.totalAmount > 0 ? 
        ((paymentStats.totalAmount - previousStats.totalAmount) / previousStats.totalAmount) * 100 : 0;

      return {
        total: paymentStats.totalAmount,
        monthly: paymentStats.monthlyRevenue,
        byPlan: paymentStats.byType,
        growth
      };
    } catch (error) {
      console.error('Calculate Revenue Error:', error);
      return { total: 0, monthly: 0, byPlan: {}, growth: 0 };
    }
  }

  /**
   * Расчет конверсий
   */
  private async calculateConversions(period: AnalyticsPeriod): Promise<{
    freeToPaid: number;
    trialToPaid: number;
    churnRate: number;
  }> {
    try {
      // В реальном приложении здесь был бы анализ изменений подписок
      return {
        freeToPaid: 12.5,
        trialToPaid: 8.3,
        churnRate: 5.2
      };
    } catch (error) {
      console.error('Calculate Conversions Error:', error);
      return { freeToPaid: 0, trialToPaid: 0, churnRate: 0 };
    }
  }

  /**
   * Расчет использования
   */
  private async calculateUsage(period: AnalyticsPeriod): Promise<{
    totalConsultations: number;
    totalDocuments: number;
    totalDisputes: number;
    averagePerUser: number;
  }> {
    try {
      const [
        consultationStats,
        documentStats,
        disputeStats,
        totalUsers
      ] = await Promise.all([
        this.consultationManager.getConsultationStats({
          dateFrom: period.startDate,
          dateTo: period.endDate
        }),
        this.documentManager.getDocumentStats({
          dateFrom: period.startDate,
          dateTo: period.endDate
        }),
        this.disputeManager.getDisputeStats({
          dateFrom: period.startDate,
          dateTo: period.endDate
        }),
        prisma.user.count()
      ]);

      const totalUsage = consultationStats.total + documentStats.total + disputeStats.total;
      const averagePerUser = totalUsers > 0 ? totalUsage / totalUsers : 0;

      return {
        totalConsultations: consultationStats.total,
        totalDocuments: documentStats.total,
        totalDisputes: disputeStats.total,
        averagePerUser
      };
    } catch (error) {
      console.error('Calculate Usage Error:', error);
      return { totalConsultations: 0, totalDocuments: 0, totalDisputes: 0, averagePerUser: 0 };
    }
  }

  /**
   * Расчет производительности
   */
  private async calculatePerformance(period: AnalyticsPeriod): Promise<{
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
  }> {
    try {
      const consultationStats = await this.consultationManager.getConsultationStats({
        dateFrom: period.startDate,
        dateTo: period.endDate
      });

      return {
        averageResponseTime: consultationStats.averageResponseTime,
        successRate: consultationStats.completionRate,
        errorRate: 100 - consultationStats.completionRate
      };
    } catch (error) {
      console.error('Calculate Performance Error:', error);
      return { averageResponseTime: 0, successRate: 0, errorRate: 0 };
    }
  }

  /**
   * Расчет системной производительности
   */
  private async calculateSystemPerformance(period: AnalyticsPeriod): Promise<{
    averageResponseTime: number;
    uptime: number;
    errorRate: number;
    throughput: number;
  }> {
    try {
      // В реальном приложении здесь были бы метрики системы
      return {
        averageResponseTime: 250, // мс
        uptime: 99.9, // %
        errorRate: 0.1, // %
        throughput: 1000 // запросов/мин
      };
    } catch (error) {
      console.error('Calculate System Performance Error:', error);
      return { averageResponseTime: 0, uptime: 0, errorRate: 0, throughput: 0 };
    }
  }

  /**
   * Расчет использования ресурсов
   */
  private async calculateResourceUsage(period: AnalyticsPeriod): Promise<{
    databaseConnections: number;
    memoryUsage: number;
    cpuUsage: number;
    storageUsage: number;
  }> {
    try {
      // В реальном приложении здесь были бы метрики ресурсов
      return {
        databaseConnections: 25,
        memoryUsage: 75, // %
        cpuUsage: 45, // %
        storageUsage: 60 // %
      };
    } catch (error) {
      console.error('Calculate Resource Usage Error:', error);
      return { databaseConnections: 0, memoryUsage: 0, cpuUsage: 0, storageUsage: 0 };
    }
  }

  /**
   * Расчет метрик безопасности
   */
  private async calculateSecurityMetrics(period: AnalyticsPeriod): Promise<{
    failedLogins: number;
    suspiciousActivities: number;
    blockedRequests: number;
  }> {
    try {
      // В реальном приложении здесь были бы метрики безопасности
      return {
        failedLogins: 12,
        suspiciousActivities: 3,
        blockedRequests: 8
      };
    } catch (error) {
      console.error('Calculate Security Metrics Error:', error);
      return { failedLogins: 0, suspiciousActivities: 0, blockedRequests: 0 };
    }
  }

  /**
   * Получение временных рядов пользователей
   */
  private async getUserTimeSeries(period: AnalyticsPeriod): Promise<TimeSeriesData[]> {
    try {
      // В реальном приложении здесь был бы SQL запрос для группировки по времени
      const days = Math.ceil((period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const data: TimeSeriesData[] = [];

      for (let i = 0; i < days; i++) {
        const date = new Date(period.startDate.getTime() + i * 24 * 60 * 60 * 1000);
        data.push({
          period: date.toISOString().split('T')[0],
          value: Math.floor(Math.random() * 10) + 5 // Примерные данные
        });
      }

      return data;
    } catch (error) {
      console.error('Get User Time Series Error:', error);
      return [];
    }
  }

  /**
   * Получение временных рядов доходов
   */
  private async getRevenueTimeSeries(period: AnalyticsPeriod): Promise<TimeSeriesData[]> {
    try {
      const data = await this.paymentManager.getRevenueByPeriod(
        period.startDate,
        period.endDate,
        period.groupBy === 'year' ? 'month' : period.groupBy
      );
      
      return data.map(item => ({
        period: item.period,
        value: item.amount,
        count: item.count
      }));
    } catch (error) {
      console.error('Get Revenue Time Series Error:', error);
      return [];
    }
  }

  /**
   * Получение временных рядов консультаций
   */
  private async getConsultationTimeSeries(period: AnalyticsPeriod): Promise<TimeSeriesData[]> {
    try {
      // В реальном приложении здесь был бы SQL запрос для группировки по времени
      const days = Math.ceil((period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const data: TimeSeriesData[] = [];

      for (let i = 0; i < days; i++) {
        const date = new Date(period.startDate.getTime() + i * 24 * 60 * 60 * 1000);
        data.push({
          period: date.toISOString().split('T')[0],
          value: Math.floor(Math.random() * 20) + 10 // Примерные данные
        });
      }

      return data;
    } catch (error) {
      console.error('Get Consultation Time Series Error:', error);
      return [];
    }
  }

  /**
   * Получение временных рядов документов
   */
  private async getDocumentTimeSeries(period: AnalyticsPeriod): Promise<TimeSeriesData[]> {
    try {
      // В реальном приложении здесь был бы SQL запрос для группировки по времени
      const days = Math.ceil((period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const data: TimeSeriesData[] = [];

      for (let i = 0; i < days; i++) {
        const date = new Date(period.startDate.getTime() + i * 24 * 60 * 60 * 1000);
        data.push({
          period: date.toISOString().split('T')[0],
          value: Math.floor(Math.random() * 15) + 5 // Примерные данные
        });
      }

      return data;
    } catch (error) {
      console.error('Get Document Time Series Error:', error);
      return [];
    }
  }

  /**
   * Получение временных рядов споров
   */
  private async getDisputeTimeSeries(period: AnalyticsPeriod): Promise<TimeSeriesData[]> {
    try {
      // В реальном приложении здесь был бы SQL запрос для группировки по времени
      const days = Math.ceil((period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const data: TimeSeriesData[] = [];

      for (let i = 0; i < days; i++) {
        const date = new Date(period.startDate.getTime() + i * 24 * 60 * 60 * 1000);
        data.push({
          period: date.toISOString().split('T')[0],
          value: Math.floor(Math.random() * 8) + 2 // Примерные данные
        });
      }

      return data;
    } catch (error) {
      console.error('Get Dispute Time Series Error:', error);
      return [];
    }
  }

  /**
   * Получение временных рядов платежей
   */
  private async getPaymentTimeSeries(period: AnalyticsPeriod): Promise<TimeSeriesData[]> {
    try {
      const data = await this.paymentManager.getRevenueByPeriod(
        period.startDate,
        period.endDate,
        period.groupBy === 'year' ? 'month' : period.groupBy
      );
      
      return data.map(item => ({
        period: item.period,
        value: item.amount,
        count: item.count
      }));
    } catch (error) {
      console.error('Get Payment Time Series Error:', error);
      return [];
    }
  }
}

export default AnalyticsManager;
