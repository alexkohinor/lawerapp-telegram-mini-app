/**
 * Prometheus метрики для мониторинга приложения
 * Основано на MONITORING_AND_ANALYTICS.md
 */

interface MetricValue {
  value: number;
  labels?: Record<string, string>;
  timestamp?: number;
}

interface CounterMetric {
  name: string;
  help: string;
  type: 'counter';
  values: MetricValue[];
}

interface GaugeMetric {
  name: string;
  help: string;
  type: 'gauge';
  values: MetricValue[];
}

interface HistogramMetric {
  name: string;
  help: string;
  type: 'histogram';
  buckets: number[];
  values: MetricValue[];
}

type Metric = CounterMetric | GaugeMetric | HistogramMetric;

/**
 * Сервис для сбора и экспорта Prometheus метрик
 */
export class PrometheusMetricsService {
  private metrics: Map<string, Metric> = new Map();

  constructor() {
    this.initializeDefaultMetrics();
  }

  /**
   * Инициализация стандартных метрик
   */
  private initializeDefaultMetrics(): void {
    // Метрики пользователей
    this.registerCounter('user_registrations_total', 'Total number of user registrations');
    this.registerCounter('user_logins_total', 'Total number of user logins');
    this.registerGauge('active_users_current', 'Current number of active users');

    // Метрики AI консультаций
    this.registerCounter('ai_consultations_total', 'Total number of AI consultations');
    this.registerHistogram('ai_consultation_duration_seconds', 'Duration of AI consultations in seconds', [0.1, 0.5, 1, 2, 5, 10]);
    this.registerGauge('ai_consultations_in_progress', 'Number of AI consultations currently in progress');

    // Метрики документов
    this.registerCounter('documents_generated_total', 'Total number of documents generated');
    this.registerHistogram('document_generation_duration_seconds', 'Duration of document generation in seconds', [0.5, 1, 2, 5, 10, 30]);

    // Метрики споров
    this.registerCounter('disputes_created_total', 'Total number of disputes created');
    this.registerGauge('disputes_active_current', 'Current number of active disputes');

    // Метрики платежей
    this.registerCounter('payments_total', 'Total number of payments');
    this.registerCounter('payments_successful_total', 'Total number of successful payments');
    this.registerCounter('payments_failed_total', 'Total number of failed payments');
    this.registerGauge('payment_success_rate', 'Payment success rate (0-1)');

    // Метрики производительности
    this.registerHistogram('http_request_duration_seconds', 'HTTP request duration in seconds', [0.1, 0.5, 1, 2, 5, 10]);
    this.registerCounter('http_requests_total', 'Total number of HTTP requests');
    this.registerGauge('memory_usage_bytes', 'Memory usage in bytes');
    this.registerGauge('cpu_usage_percent', 'CPU usage percentage');

    // Метрики безопасности
    this.registerCounter('security_events_total', 'Total number of security events');
    this.registerCounter('failed_authentication_attempts_total', 'Total number of failed authentication attempts');
    this.registerCounter('rate_limit_hits_total', 'Total number of rate limit hits');
  }

  /**
   * Регистрация счетчика
   */
  private registerCounter(name: string, help: string): void {
    this.metrics.set(name, {
      name,
      help,
      type: 'counter',
      values: []
    });
  }

  /**
   * Регистрация датчика
   */
  private registerGauge(name: string, help: string): void {
    this.metrics.set(name, {
      name,
      help,
      type: 'gauge',
      values: []
    });
  }

  /**
   * Регистрация гистограммы
   */
  private registerHistogram(name: string, help: string, buckets: number[]): void {
    this.metrics.set(name, {
      name,
      help,
      type: 'histogram',
      buckets,
      values: []
    });
  }

  /**
   * Увеличение счетчика
   */
  incrementCounter(name: string, labels?: Record<string, string>): void {
    const metric = this.metrics.get(name) as CounterMetric;
    if (metric) {
      const existingValue = metric.values.find(v => 
        JSON.stringify(v.labels) === JSON.stringify(labels)
      );
      
      if (existingValue) {
        existingValue.value += 1;
      } else {
        metric.values.push({
          value: 1,
          labels,
          timestamp: Date.now()
        });
      }
    }
  }

  /**
   * Установка значения датчика
   */
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const metric = this.metrics.get(name) as GaugeMetric;
    if (metric) {
      const existingValue = metric.values.find(v => 
        JSON.stringify(v.labels) === JSON.stringify(labels)
      );
      
      if (existingValue) {
        existingValue.value = value;
        existingValue.timestamp = Date.now();
      } else {
        metric.values.push({
          value,
          labels,
          timestamp: Date.now()
        });
      }
    }
  }

  /**
   * Добавление значения в гистограмму
   */
  observeHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const metric = this.metrics.get(name) as HistogramMetric;
    if (metric) {
      metric.values.push({
        value,
        labels,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Экспорт метрик в формате Prometheus
   */
  exportMetrics(): string {
    let output = '';
    
    for (const [name, metric] of this.metrics) {
      // Добавляем HELP и TYPE комментарии
      output += `# HELP ${metric.name} ${metric.help}\n`;
      output += `# TYPE ${metric.name} ${metric.type}\n`;
      
      // Добавляем значения
      for (const value of metric.values) {
        let line = metric.name;
        
        // Добавляем лейблы
        if (value.labels && Object.keys(value.labels).length > 0) {
          const labelPairs = Object.entries(value.labels)
            .map(([key, val]) => `${key}="${val}"`)
            .join(',');
          line += `{${labelPairs}}`;
        }
        
        line += ` ${value.value}`;
        
        // Добавляем timestamp если есть
        if (value.timestamp) {
          line += ` ${value.timestamp}`;
        }
        
        output += line + '\n';
      }
      
      output += '\n';
    }
    
    return output;
  }

  /**
   * Получение метрики по имени
   */
  getMetric(name: string): Metric | undefined {
    return this.metrics.get(name);
  }

  /**
   * Получение всех метрик
   */
  getAllMetrics(): Map<string, Metric> {
    return new Map(this.metrics);
  }

  /**
   * Очистка старых метрик (старше указанного времени)
   */
  cleanupOldMetrics(maxAge: number = 3600000): void { // 1 час по умолчанию
    const now = Date.now();
    
    for (const [name, metric] of this.metrics) {
      metric.values = metric.values.filter(value => 
        !value.timestamp || (now - value.timestamp) < maxAge
      );
    }
  }
}

// Экспорт глобального экземпляра
export const prometheusMetrics = new PrometheusMetricsService();
