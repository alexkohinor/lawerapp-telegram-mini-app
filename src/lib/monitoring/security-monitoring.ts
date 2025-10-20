import { DataAccessAudit } from '../storage/data-encryption';

/**
 * Система мониторинга безопасности
 * Основано на DATA_STORAGE_ARCHITECTURE.md и SECURITY_GUIDELINES.md
 */

interface SecurityEvent {
  id: string;
  type: 'suspicious_activity' | 'rate_limit_exceeded' | 'unauthorized_access' | 'data_breach' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  description: string;
  metadata: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
}

interface SecurityMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  topSuspiciousIPs: Array<{ ip: string; count: number }>;
  topSuspiciousUsers: Array<{ userId: string; count: number }>;
  last24Hours: number;
  last7Days: number;
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: (event: SecurityEvent) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'log' | 'alert' | 'block' | 'escalate';
  enabled: boolean;
}

export class SecurityMonitoring {
  private static instance: SecurityMonitoring;
  private events: SecurityEvent[] = [];
  private alertRules: AlertRule[] = [];
  private alertCallbacks: Array<(event: SecurityEvent) => void> = [];

  private constructor() {
    this.initializeAlertRules();
  }

  static getInstance(): SecurityMonitoring {
    if (!SecurityMonitoring.instance) {
      SecurityMonitoring.instance = new SecurityMonitoring();
    }
    return SecurityMonitoring.instance;
  }

  /**
   * Инициализация правил алертов
   */
  private initializeAlertRules(): void {
    this.alertRules = [
      {
        id: 'multiple_failed_logins',
        name: 'Множественные неудачные попытки входа',
        description: 'Более 5 неудачных попыток входа с одного IP за 10 минут',
        condition: (event) => {
          return event.type === 'unauthorized_access' && 
                 event.metadata.failedAttempts > 5 &&
                 event.metadata.timeWindow === '10min';
        },
        severity: 'high',
        action: 'block',
        enabled: true,
      },
      {
        id: 'suspicious_data_access',
        name: 'Подозрительный доступ к данным',
        description: 'Необычный паттерн доступа к персональным данным',
        condition: (event) => {
          return event.type === 'suspicious_activity' &&
                 event.metadata.dataAccessPattern === 'unusual';
        },
        severity: 'medium',
        action: 'alert',
        enabled: true,
      },
      {
        id: 'rate_limit_exceeded',
        name: 'Превышение лимитов запросов',
        description: 'Превышение лимитов API запросов',
        condition: (event) => {
          return event.type === 'rate_limit_exceeded' &&
                 event.metadata.requestCount > 1000;
        },
        severity: 'medium',
        action: 'alert',
        enabled: true,
      },
      {
        id: 'data_breach_attempt',
        name: 'Попытка утечки данных',
        description: 'Попытка массового экспорта данных',
        condition: (event) => {
          return event.type === 'data_breach' &&
                 event.metadata.exportSize > 10000;
        },
        severity: 'critical',
        action: 'escalate',
        enabled: true,
      },
    ];
  }

  /**
   * Логирование события безопасности
   */
  async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      resolved: false,
      ...event,
    };

    this.events.push(securityEvent);

    // Логируем в аудит
    await DataAccessAudit.logAccess(
      event.userId || 'system',
      'SECURITY_EVENT',
      'SECURITY',
      securityEvent.id,
      {
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        timestamp: securityEvent.timestamp,
      }
    );

    // Проверяем правила алертов
    await this.checkAlertRules(securityEvent);

    console.log('Security event logged:', securityEvent);
  }

  /**
   * Проверка правил алертов
   */
  private async checkAlertRules(event: SecurityEvent): Promise<void> {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      if (rule.condition(event)) {
        await this.triggerAlert(rule, event);
      }
    }
  }

  /**
   * Срабатывание алерта
   */
  private async triggerAlert(rule: AlertRule, event: SecurityEvent): Promise<void> {
    const alertEvent = {
      ...event,
      severity: rule.severity,
      metadata: {
        ...event.metadata,
        ruleId: rule.id,
        ruleName: rule.name,
        action: rule.action,
      },
    };

    // Выполняем действие
    switch (rule.action) {
      case 'log':
        console.log('Security alert (log):', alertEvent);
        break;
      case 'alert':
        await this.sendAlert(alertEvent);
        break;
      case 'block':
        await this.blockUser(event.userId, event.ipAddress);
        await this.sendAlert(alertEvent);
        break;
      case 'escalate':
        await this.escalateToSecurityTeam(alertEvent);
        break;
    }

    // Уведомляем подписчиков
    this.alertCallbacks.forEach(callback => callback(alertEvent));
  }

  /**
   * Отправка алерта
   */
  private async sendAlert(event: SecurityEvent): Promise<void> {
    // В реальном приложении здесь будет отправка уведомлений
    // (email, Slack, Telegram, SMS и т.д.)
    console.log('SECURITY ALERT:', {
      severity: event.severity,
      type: event.type,
      description: event.description,
      userId: event.userId,
      ipAddress: event.ipAddress,
      timestamp: event.timestamp,
    });
  }

  /**
   * Блокировка пользователя
   */
  private async blockUser(userId?: string, ipAddress?: string): Promise<void> {
    if (userId) {
      // Блокируем пользователя
      console.log('Blocking user:', userId);
    }
    
    if (ipAddress) {
      // Блокируем IP адрес
      console.log('Blocking IP:', ipAddress);
    }
  }

  /**
   * Эскалация в команду безопасности
   */
  private async escalateToSecurityTeam(event: SecurityEvent): Promise<void> {
    // В реальном приложении здесь будет эскалация
    console.log('ESCALATING TO SECURITY TEAM:', event);
  }

  /**
   * Получение метрик безопасности
   */
  getSecurityMetrics(timeRange: '24h' | '7d' | '30d' = '24h'): SecurityMetrics {
    const now = new Date();
    const timeRangeMs = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }[timeRange];

    const cutoffTime = new Date(now.getTime() - timeRangeMs);
    const filteredEvents = this.events.filter(event => event.timestamp >= cutoffTime);

    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    const ipCounts: Record<string, number> = {};
    const userCounts: Record<string, number> = {};

    filteredEvents.forEach(event => {
      // Подсчет по типам
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      
      // Подсчет по серьезности
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
      
      // Подсчет IP адресов
      if (event.ipAddress) {
        ipCounts[event.ipAddress] = (ipCounts[event.ipAddress] || 0) + 1;
      }
      
      // Подсчет пользователей
      if (event.userId) {
        userCounts[event.userId] = (userCounts[event.userId] || 0) + 1;
      }
    });

    return {
      totalEvents: filteredEvents.length,
      eventsByType,
      eventsBySeverity,
      topSuspiciousIPs: Object.entries(ipCounts)
        .map(([ip, count]) => ({ ip, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topSuspiciousUsers: Object.entries(userCounts)
        .map(([userId, count]) => ({ userId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      last24Hours: this.events.filter(e => 
        e.timestamp >= new Date(now.getTime() - 24 * 60 * 60 * 1000)
      ).length,
      last7Days: this.events.filter(e => 
        e.timestamp >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      ).length,
    };
  }

  /**
   * Обнаружение аномалий
   */
  async detectAnomalies(): Promise<SecurityEvent[]> {
    const anomalies: SecurityEvent[] = [];
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Анализируем события за последние 24 часа
    const recentEvents = this.events.filter(e => e.timestamp >= last24h);

    // Проверяем на необычную активность
    const userActivity = new Map<string, number>();
    const ipActivity = new Map<string, number>();

    recentEvents.forEach(event => {
      if (event.userId) {
        userActivity.set(event.userId, (userActivity.get(event.userId) || 0) + 1);
      }
      if (event.ipAddress) {
        ipActivity.set(event.ipAddress, (ipActivity.get(event.ipAddress) || 0) + 1);
      }
    });

    // Обнаруживаем пользователей с необычно высокой активностью
    userActivity.forEach((count, userId) => {
      if (count > 100) { // Пороговое значение
        anomalies.push({
          id: this.generateEventId(),
          type: 'anomaly',
          severity: 'medium',
          userId,
          description: `Unusual high activity detected for user: ${count} events in 24h`,
          metadata: { eventCount: count, timeWindow: '24h' },
          timestamp: now,
          resolved: false,
        });
      }
    });

    // Обнаруживаем IP адреса с необычно высокой активностью
    ipActivity.forEach((count, ipAddress) => {
      if (count > 200) { // Пороговое значение
        anomalies.push({
          id: this.generateEventId(),
          type: 'anomaly',
          severity: 'high',
          ipAddress,
          description: `Unusual high activity detected from IP: ${count} events in 24h`,
          metadata: { eventCount: count, timeWindow: '24h' },
          timestamp: now,
          resolved: false,
        });
      }
    });

    return anomalies;
  }

  /**
   * Подписка на алерты
   */
  onAlert(callback: (event: SecurityEvent) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Отписка от алертов
   */
  offAlert(callback: (event: SecurityEvent) => void): void {
    const index = this.alertCallbacks.indexOf(callback);
    if (index > -1) {
      this.alertCallbacks.splice(index, 1);
    }
  }

  /**
   * Генерация ID события
   */
  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}

// Экспорт синглтона
export const securityMonitoring = SecurityMonitoring.getInstance();
