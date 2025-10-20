/**
 * Сервис алертов для мониторинга
 * Основано на MONITORING_AND_ANALYTICS.md
 */

import { prometheusMetrics } from '@/lib/monitoring/prometheus-metrics';
import { errorMonitor } from '@/lib/monitoring/error-monitor';
import { notificationService, NotificationType, NotificationChannel } from '@/lib/notifications/notification-service';

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  SUPPRESSED = 'suppressed'
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  severity: AlertSeverity;
  enabled: boolean;
  cooldown: number; // в миллисекундах
  lastTriggered?: Date;
  notificationChannels: NotificationChannel[];
  tags: string[];
}

export interface Alert {
  id: string;
  ruleId: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  acknowledgedBy?: string;
  resolvedBy?: string;
  value: number;
  threshold: number;
  tags: string[];
  metadata?: Record<string, any>;
}

/**
 * Сервис для управления алертами
 */
export class AlertService {
  private alerts: Map<string, Alert> = new Map();
  private rules: Map<string, AlertRule> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDefaultRules();
    this.startMonitoring();
  }

  /**
   * Инициализация стандартных правил алертов
   */
  private initializeDefaultRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'high_cpu_usage',
        name: 'Высокое использование CPU',
        description: 'CPU usage превышает 80%',
        metric: 'cpu_usage_percent',
        condition: 'gt',
        threshold: 80,
        severity: AlertSeverity.HIGH,
        enabled: true,
        cooldown: 300000, // 5 минут
        notificationChannels: [NotificationChannel.IN_APP, NotificationChannel.TELEGRAM],
        tags: ['performance', 'cpu']
      },
      {
        id: 'high_memory_usage',
        name: 'Высокое использование памяти',
        description: 'Memory usage превышает 85%',
        metric: 'memory_usage_percentage',
        condition: 'gt',
        threshold: 85,
        severity: AlertSeverity.HIGH,
        enabled: true,
        cooldown: 300000, // 5 минут
        notificationChannels: [NotificationChannel.IN_APP, NotificationChannel.TELEGRAM],
        tags: ['performance', 'memory']
      },
      {
        id: 'high_response_time',
        name: 'Высокое время ответа',
        description: 'Среднее время ответа API превышает 2 секунды',
        metric: 'http_request_duration_seconds',
        condition: 'gt',
        threshold: 2,
        severity: AlertSeverity.MEDIUM,
        enabled: true,
        cooldown: 600000, // 10 минут
        notificationChannels: [NotificationChannel.IN_APP],
        tags: ['performance', 'api']
      },
      {
        id: 'low_payment_success_rate',
        name: 'Низкая успешность платежей',
        description: 'Успешность платежей ниже 95%',
        metric: 'payment_success_rate',
        condition: 'lt',
        threshold: 95,
        severity: AlertSeverity.CRITICAL,
        enabled: true,
        cooldown: 300000, // 5 минут
        notificationChannels: [NotificationChannel.IN_APP, NotificationChannel.TELEGRAM, NotificationChannel.EMAIL],
        tags: ['business', 'payments']
      },
      {
        id: 'high_error_rate',
        name: 'Высокий уровень ошибок',
        description: 'Количество ошибок превышает 10 в минуту',
        metric: 'errors_total',
        condition: 'gt',
        threshold: 10,
        severity: AlertSeverity.HIGH,
        enabled: true,
        cooldown: 300000, // 5 минут
        notificationChannels: [NotificationChannel.IN_APP, NotificationChannel.TELEGRAM],
        tags: ['reliability', 'errors']
      },
      {
        id: 'no_active_users',
        name: 'Нет активных пользователей',
        description: 'Количество активных пользователей равно 0',
        metric: 'active_users_current',
        condition: 'eq',
        threshold: 0,
        severity: AlertSeverity.MEDIUM,
        enabled: true,
        cooldown: 1800000, // 30 минут
        notificationChannels: [NotificationChannel.IN_APP],
        tags: ['business', 'users']
      }
    ];

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  /**
   * Запуск мониторинга
   */
  private startMonitoring(): void {
    // Проверяем алерты каждые 30 секунд
    this.checkInterval = setInterval(() => {
      this.checkAlerts();
    }, 30000);
  }

  /**
   * Остановка мониторинга
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Проверка всех правил алертов
   */
  private checkAlerts(): void {
    for (const [ruleId, rule] of this.rules) {
      if (!rule.enabled) continue;

      // Проверяем cooldown
      if (rule.lastTriggered && 
          Date.now() - rule.lastTriggered.getTime() < rule.cooldown) {
        continue;
      }

      this.checkRule(rule);
    }
  }

  /**
   * Проверка конкретного правила
   */
  private checkRule(rule: AlertRule): void {
    const metric = prometheusMetrics.getMetric(rule.metric);
    if (!metric) return;

    // Получаем последнее значение метрики
    const latestValue = this.getLatestMetricValue(metric);
    if (latestValue === null) return;

    // Проверяем условие
    const shouldTrigger = this.evaluateCondition(latestValue, rule.condition, rule.threshold);
    
    if (shouldTrigger) {
      this.triggerAlert(rule, latestValue);
    }
  }

  /**
   * Получение последнего значения метрики
   */
  private getLatestMetricValue(metric: any): number | null {
    if (!metric.values || metric.values.length === 0) return null;
    
    // Сортируем по времени и берем последнее значение
    const sortedValues = metric.values
      .filter((v: any) => v.timestamp)
      .sort((a: any, b: any) => b.timestamp - a.timestamp);
    
    return sortedValues.length > 0 ? sortedValues[0].value : null;
  }

  /**
   * Оценка условия алерта
   */
  private evaluateCondition(value: number, condition: string, threshold: number): boolean {
    switch (condition) {
      case 'gt':
        return value > threshold;
      case 'lt':
        return value < threshold;
      case 'eq':
        return value === threshold;
      case 'gte':
        return value >= threshold;
      case 'lte':
        return value <= threshold;
      default:
        return false;
    }
  }

  /**
   * Срабатывание алерта
   */
  private triggerAlert(rule: AlertRule, value: number): void {
    const alertId = this.generateAlertId();
    
    const alert: Alert = {
      id: alertId,
      ruleId: rule.id,
      severity: rule.severity,
      status: AlertStatus.ACTIVE,
      title: rule.name,
      message: `${rule.description}. Текущее значение: ${value}, порог: ${rule.threshold}`,
      triggeredAt: new Date(),
      value,
      threshold: rule.threshold,
      tags: rule.tags,
      metadata: {
        ruleName: rule.name,
        metric: rule.metric,
        condition: rule.condition
      }
    };

    this.alerts.set(alertId, alert);
    rule.lastTriggered = new Date();

    // Отправляем уведомление
    this.sendAlertNotification(alert, rule);

    // Логируем срабатывание алерта
    errorMonitor.logWarning('Alert Triggered', {
      alertId,
      ruleId: rule.id,
      severity: rule.severity,
      value,
      threshold: rule.threshold
    });

    // Отправляем метрики
    prometheusMetrics.incrementCounter('alerts_triggered_total', {
      rule_id: rule.id,
      severity: rule.severity
    });
  }

  /**
   * Отправка уведомления об алерте
   */
  private sendAlertNotification(alert: Alert, rule: AlertRule): void {
    const notificationType = this.getNotificationTypeFromSeverity(alert.severity);
    
    notificationService.create({
      type: notificationType,
      title: `🚨 ${alert.title}`,
      message: alert.message,
      channels: rule.notificationChannels,
      priority: this.getPriorityFromSeverity(alert.severity),
      metadata: {
        alertId: alert.id,
        ruleId: rule.id,
        severity: alert.severity,
        value: alert.value,
        threshold: alert.threshold
      }
    });
  }

  /**
   * Получение типа уведомления из серьезности алерта
   */
  private getNotificationTypeFromSeverity(severity: AlertSeverity): NotificationType {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return NotificationType.CRITICAL;
      case AlertSeverity.HIGH:
        return NotificationType.ERROR;
      case AlertSeverity.MEDIUM:
        return NotificationType.WARNING;
      default:
        return NotificationType.INFO;
    }
  }

  /**
   * Получение приоритета из серьезности алерта
   */
  private getPriorityFromSeverity(severity: AlertSeverity): 'low' | 'medium' | 'high' | 'urgent' {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return 'urgent';
      case AlertSeverity.HIGH:
        return 'high';
      case AlertSeverity.MEDIUM:
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Подтверждение алерта
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert && alert.status === AlertStatus.ACTIVE) {
      alert.status = AlertStatus.ACKNOWLEDGED;
      alert.acknowledgedAt = new Date();
      alert.acknowledgedBy = acknowledgedBy;
      return true;
    }
    return false;
  }

  /**
   * Разрешение алерта
   */
  resolveAlert(alertId: string, resolvedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert && alert.status !== AlertStatus.RESOLVED) {
      alert.status = AlertStatus.RESOLVED;
      alert.resolvedAt = new Date();
      alert.resolvedBy = resolvedBy;
      return true;
    }
    return false;
  }

  /**
   * Получение активных алертов
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values())
      .filter(alert => alert.status === AlertStatus.ACTIVE)
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());
  }

  /**
   * Получение всех алертов
   */
  getAllAlerts(limit?: number): Alert[] {
    const allAlerts = Array.from(this.alerts.values())
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());
    
    return limit ? allAlerts.slice(0, limit) : allAlerts;
  }

  /**
   * Получение правил алертов
   */
  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Создание нового правила
   */
  createRule(rule: Omit<AlertRule, 'id'>): AlertRule {
    const newRule: AlertRule = {
      ...rule,
      id: this.generateRuleId()
    };
    
    this.rules.set(newRule.id, newRule);
    return newRule;
  }

  /**
   * Обновление правила
   */
  updateRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (rule) {
      Object.assign(rule, updates);
      return true;
    }
    return false;
  }

  /**
   * Удаление правила
   */
  deleteRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  /**
   * Генерация ID алерта
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Генерация ID правила
   */
  private generateRuleId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Получение статистики алертов
   */
  getStats(): {
    total: number;
    active: number;
    acknowledged: number;
    resolved: number;
    bySeverity: Record<string, number>;
  } {
    const alerts = Array.from(this.alerts.values());
    const total = alerts.length;
    const active = alerts.filter(a => a.status === AlertStatus.ACTIVE).length;
    const acknowledged = alerts.filter(a => a.status === AlertStatus.ACKNOWLEDGED).length;
    const resolved = alerts.filter(a => a.status === AlertStatus.RESOLVED).length;

    const bySeverity: Record<string, number> = {};
    alerts.forEach(alert => {
      bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
    });

    return { total, active, acknowledged, resolved, bySeverity };
  }
}

// Экспорт глобального экземпляра
export const alertService = new AlertService();
