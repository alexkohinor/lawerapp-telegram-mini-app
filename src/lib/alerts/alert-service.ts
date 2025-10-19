/**
 * Alert Service для LawerApp
 * Простая реализация для локального тестирования
 */

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  userId?: string;
  isActive: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isEnabled: boolean;
}

class AlertService {
  private alerts: Alert[] = [];
  private rules: AlertRule[] = [
    {
      id: 'high_error_rate',
      name: 'Высокий уровень ошибок',
      condition: 'error_rate > 5%',
      severity: 'high',
      isEnabled: true
    },
    {
      id: 'slow_response',
      name: 'Медленный ответ API',
      condition: 'response_time > 2000ms',
      severity: 'medium',
      isEnabled: true
    },
    {
      id: 'database_connection',
      name: 'Проблемы с базой данных',
      condition: 'db_connection_failed',
      severity: 'critical',
      isEnabled: true
    }
  ];

  createAlert(type: Alert['type'], title: string, message: string, userId?: string): Alert {
    const alert: Alert = {
      id: Date.now().toString(),
      type,
      title,
      message,
      userId,
      isActive: true,
      createdAt: new Date()
    };

    this.alerts.push(alert);
    console.log('🚨 Алерт создан:', alert);
    
    return alert;
  }

  getAlerts(userId?: string): Alert[] {
    if (userId) {
      return this.alerts.filter(a => a.userId === userId);
    }
    return this.alerts;
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => a.isActive);
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isActive = false;
      alert.resolvedAt = new Date();
      console.log('✅ Алерт разрешен:', alertId);
    }
  }

  getStats() {
    return {
      total: this.alerts.length,
      active: this.alerts.filter(a => a.isActive).length,
      resolved: this.alerts.filter(a => !a.isActive).length,
      critical: this.alerts.filter(a => a.isActive && a.type === 'error').length
    };
  }

  getRules(): AlertRule[] {
    return this.rules;
  }

  updateRule(ruleId: string, updates: Partial<AlertRule>): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      Object.assign(rule, updates);
      console.log('📝 Правило обновлено:', ruleId);
    }
  }

  // Методы для мониторинга
  checkSystemHealth(): { status: 'healthy' | 'warning' | 'critical'; alerts: Alert[] } {
    const activeAlerts = this.getActiveAlerts();
    const criticalAlerts = activeAlerts.filter(a => a.type === 'error');
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (criticalAlerts.length > 0) {
      status = 'critical';
    } else if (activeAlerts.length > 0) {
      status = 'warning';
    }

    return { status, alerts: activeAlerts };
  }

  // Автоматическое создание алертов
  checkErrorRate(errorRate: number): void {
    if (errorRate > 5) {
      this.createAlert(
        'error',
        'Высокий уровень ошибок',
        `Уровень ошибок составляет ${errorRate}%, что превышает допустимый порог в 5%`
      );
    }
  }

  checkResponseTime(responseTime: number): void {
    if (responseTime > 2000) {
      this.createAlert(
        'warning',
        'Медленный ответ API',
        `Время ответа API составляет ${responseTime}ms, что превышает допустимый порог в 2000ms`
      );
    }
  }

  checkDatabaseConnection(isConnected: boolean): void {
    if (!isConnected) {
      this.createAlert(
        'error',
        'Проблемы с базой данных',
        'Не удается подключиться к базе данных'
      );
    }
  }
}

export const alertService = new AlertService();
