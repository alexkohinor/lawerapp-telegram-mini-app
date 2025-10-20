/**
 * Сервис мониторинга ошибок и логирования
 * Основано на MONITORING_AND_ANALYTICS.md
 */

import { prometheusMetrics } from './prometheus-metrics';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  stack?: string;
}

export interface ErrorReport {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  url?: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

/**
 * Сервис для мониторинга ошибок и логирования
 */
export class ErrorMonitor {
  private logs: LogEntry[] = [];
  private errors: ErrorReport[] = [];
  private maxLogs: number = 1000;
  private maxErrors: number = 500;

  constructor() {
    this.setupGlobalErrorHandlers();
  }

  /**
   * Настройка глобальных обработчиков ошибок
   */
  private setupGlobalErrorHandlers(): void {
    // Обработчик необработанных ошибок
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.logError('Unhandled Error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        });
      });

      // Обработчик необработанных промисов
      window.addEventListener('unhandledrejection', (event) => {
        this.logError('Unhandled Promise Rejection', {
          reason: event.reason,
          stack: event.reason?.stack
        });
      });
    }

    // Обработчик ошибок Node.js
    if (typeof process !== 'undefined') {
      process.on('uncaughtException', (error) => {
        this.logError('Uncaught Exception', {
          message: error.message,
          stack: error.stack
        });
      });

      process.on('unhandledRejection', (reason, promise) => {
        this.logError('Unhandled Rejection', {
          reason: reason,
          promise: promise
        });
      });
    }
  }

  /**
   * Логирование сообщения
   */
  log(level: LogLevel, message: string, context?: Record<string, any>): void {
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      userId: context?.userId,
      sessionId: context?.sessionId,
      requestId: context?.requestId
    };

    this.logs.push(logEntry);

    // Ограничиваем количество логов
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Отправляем метрики в Prometheus
    prometheusMetrics.incrementCounter('logs_total', {
      level: level
    });

    // Выводим в консоль в зависимости от уровня
    this.outputToConsole(logEntry);
  }

  /**
   * Логирование ошибки
   */
  logError(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context);

    // Создаем отчет об ошибке
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      timestamp: new Date(),
      level: LogLevel.ERROR,
      message,
      stack: context?.stack,
      context,
      userId: context?.userId,
      sessionId: context?.sessionId,
      requestId: context?.requestId,
      userAgent: context?.userAgent,
      url: context?.url,
      resolved: false
    };

    this.errors.push(errorReport);

    // Ограничиваем количество ошибок
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Отправляем метрики в Prometheus
    prometheusMetrics.incrementCounter('errors_total', {
      level: LogLevel.ERROR
    });
  }

  /**
   * Логирование предупреждения
   */
  logWarning(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
    prometheusMetrics.incrementCounter('logs_total', {
      level: LogLevel.WARN
    });
  }

  /**
   * Логирование информации
   */
  logInfo(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
    prometheusMetrics.incrementCounter('logs_total', {
      level: LogLevel.INFO
    });
  }

  /**
   * Логирование отладки
   */
  logDebug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
    prometheusMetrics.incrementCounter('logs_total', {
      level: LogLevel.DEBUG
    });
  }

  /**
   * Вывод в консоль
   */
  private outputToConsole(logEntry: LogEntry): void {
    const timestamp = logEntry.timestamp.toISOString();
    const contextStr = logEntry.context ? JSON.stringify(logEntry.context, null, 2) : '';
    
    const logMessage = `[${timestamp}] ${logEntry.level.toUpperCase()}: ${logEntry.message}${contextStr ? '\n' + contextStr : ''}`;

    switch (logEntry.level) {
      case LogLevel.DEBUG:
        console.debug(logMessage);
        break;
      case LogLevel.INFO:
        console.info(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(logMessage);
        break;
    }
  }

  /**
   * Генерация ID для ошибки
   */
  private generateErrorId(): string {
    return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Получение логов
   */
  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filteredLogs = this.logs;
    
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    
    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }
    
    return filteredLogs;
  }

  /**
   * Получение ошибок
   */
  getErrors(resolved?: boolean, limit?: number): ErrorReport[] {
    let filteredErrors = this.errors;
    
    if (resolved !== undefined) {
      filteredErrors = filteredErrors.filter(error => error.resolved === resolved);
    }
    
    if (limit) {
      filteredErrors = filteredErrors.slice(-limit);
    }
    
    return filteredErrors;
  }

  /**
   * Отметка ошибки как решенной
   */
  resolveError(errorId: string, resolvedBy: string): boolean {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      error.resolvedAt = new Date();
      error.resolvedBy = resolvedBy;
      return true;
    }
    return false;
  }

  /**
   * Получение статистики ошибок
   */
  getErrorStats(): {
    total: number;
    resolved: number;
    unresolved: number;
    byLevel: Record<string, number>;
  } {
    const total = this.errors.length;
    const resolved = this.errors.filter(e => e.resolved).length;
    const unresolved = total - resolved;
    
    const byLevel: Record<string, number> = {};
    this.errors.forEach(error => {
      byLevel[error.level] = (byLevel[error.level] || 0) + 1;
    });

    return {
      total,
      resolved,
      unresolved,
      byLevel
    };
  }

  /**
   * Очистка старых логов
   */
  cleanupOldLogs(maxAge: number = 86400000): void { // 24 часа по умолчанию
    const cutoff = new Date(Date.now() - maxAge);
    this.logs = this.logs.filter(log => log.timestamp > cutoff);
  }

  /**
   * Очистка старых ошибок
   */
  cleanupOldErrors(maxAge: number = 604800000): void { // 7 дней по умолчанию
    const cutoff = new Date(Date.now() - maxAge);
    this.errors = this.errors.filter(error => error.timestamp > cutoff);
  }
}

// Экспорт глобального экземпляра
export const errorMonitor = new ErrorMonitor();
