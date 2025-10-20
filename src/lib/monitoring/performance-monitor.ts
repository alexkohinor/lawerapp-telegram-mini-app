/**
 * Сервис мониторинга производительности
 * Основано на MONITORING_AND_ANALYTICS.md
 */

import { prometheusMetrics } from './prometheus-metrics';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  labels?: Record<string, string>;
}

interface MemoryUsage {
  used: number;
  total: number;
  percentage: number;
}

interface CPUUsage {
  percentage: number;
  timestamp: number;
}

/**
 * Сервис для мониторинга производительности приложения
 */
export class PerformanceMonitor {
  private activeMetrics: Map<string, PerformanceMetric> = new Map();
  private memoryUsage: MemoryUsage = { used: 0, total: 0, percentage: 0 };
  private cpuUsage: CPUUsage = { percentage: 0, timestamp: Date.now() };

  constructor() {
    this.startSystemMonitoring();
  }

  /**
   * Запуск мониторинга системных ресурсов
   */
  private startSystemMonitoring(): void {
    // Мониторинг памяти каждые 30 секунд
    setInterval(() => {
      this.updateMemoryUsage();
    }, 30000);

    // Мониторинг CPU каждые 10 секунд
    setInterval(() => {
      this.updateCPUUsage();
    }, 10000);
  }

  /**
   * Обновление информации об использовании памяти
   */
  private updateMemoryUsage(): void {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      this.memoryUsage = {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
      };

      // Отправляем метрики в Prometheus
      prometheusMetrics.setGauge('memory_usage_bytes', memUsage.heapUsed, {
        type: 'heap_used'
      });
      prometheusMetrics.setGauge('memory_usage_bytes', memUsage.heapTotal, {
        type: 'heap_total'
      });
      prometheusMetrics.setGauge('memory_usage_percentage', this.memoryUsage.percentage);
    }
  }

  /**
   * Обновление информации об использовании CPU
   */
  private updateCPUUsage(): void {
    // В браузере CPU usage недоступен, используем симуляцию
    if (typeof window !== 'undefined') {
      // Симуляция CPU usage на основе активности
      const now = Date.now();
      const timeDiff = now - this.cpuUsage.timestamp;
      
      // Простая симуляция: CPU usage зависит от времени
      const baseUsage = 10 + Math.sin(now / 10000) * 5;
      this.cpuUsage = {
        percentage: Math.max(0, Math.min(100, baseUsage)),
        timestamp: now
      };

      prometheusMetrics.setGauge('cpu_usage_percent', this.cpuUsage.percentage);
    }
  }

  /**
   * Начало измерения производительности
   */
  startMeasurement(name: string, labels?: Record<string, string>): string {
    const id = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      labels
    };

    this.activeMetrics.set(id, metric);
    return id;
  }

  /**
   * Завершение измерения производительности
   */
  endMeasurement(id: string): number | null {
    const metric = this.activeMetrics.get(id);
    if (!metric) {
      console.warn(`Performance metric with id ${id} not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // Отправляем метрику в Prometheus
    prometheusMetrics.observeHistogram(
      `${metric.name}_duration_seconds`,
      duration / 1000, // Конвертируем в секунды
      metric.labels
    );

    // Удаляем из активных метрик
    this.activeMetrics.delete(id);

    return duration;
  }

  /**
   * Измерение времени выполнения функции
   */
  async measureFunction<T>(
    name: string,
    fn: () => Promise<T>,
    labels?: Record<string, string>
  ): Promise<T> {
    const id = this.startMeasurement(name, labels);
    try {
      const result = await fn();
      this.endMeasurement(id);
      return result;
    } catch (error) {
      this.endMeasurement(id);
      throw error;
    }
  }

  /**
   * Измерение времени выполнения синхронной функции
   */
  measureSyncFunction<T>(
    name: string,
    fn: () => T,
    labels?: Record<string, string>
  ): T {
    const id = this.startMeasurement(name, labels);
    try {
      const result = fn();
      this.endMeasurement(id);
      return result;
    } catch (error) {
      this.endMeasurement(id);
      throw error;
    }
  }

  /**
   * Получение информации об использовании памяти
   */
  getMemoryUsage(): MemoryUsage {
    return { ...this.memoryUsage };
  }

  /**
   * Получение информации об использовании CPU
   */
  getCPUUsage(): CPUUsage {
    return { ...this.cpuUsage };
  }

  /**
   * Получение активных измерений
   */
  getActiveMeasurements(): PerformanceMetric[] {
    return Array.from(this.activeMetrics.values());
  }

  /**
   * Очистка старых измерений
   */
  cleanupOldMeasurements(maxAge: number = 300000): void { // 5 минут по умолчанию
    const now = performance.now();
    for (const [id, metric] of this.activeMetrics) {
      if (now - metric.startTime > maxAge) {
        this.activeMetrics.delete(id);
      }
    }
  }

  /**
   * Получение статистики производительности
   */
  getPerformanceStats(): {
    memoryUsage: MemoryUsage;
    cpuUsage: CPUUsage;
    activeMeasurements: number;
  } {
    return {
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: this.getCPUUsage(),
      activeMeasurements: this.activeMetrics.size
    };
  }
}

// Экспорт глобального экземпляра
export const performanceMonitor = new PerformanceMonitor();
