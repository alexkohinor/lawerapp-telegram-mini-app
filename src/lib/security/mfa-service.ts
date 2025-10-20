/**
 * Multi-Factor Authentication Service
 * Основано на SECURITY_GUIDELINES.md - Zero Trust Architecture
 */

import { securityMonitoring } from '@/lib/monitoring/security-monitoring';
import { SecurityEvent } from '@/lib/monitoring/security-monitoring';
import { generateId } from '@/lib/utils';

export interface MFAMethod {
  id: string;
  type: 'sms' | 'email' | 'totp' | 'backup_codes';
  name: string;
  isEnabled: boolean;
  isVerified: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

export interface MFAChallenge {
  id: string;
  userId: string;
  method: MFAMethod['type'];
  code: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  isUsed: boolean;
}

export interface MFAVerificationResult {
  success: boolean;
  method: MFAMethod['type'];
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Сервис Multi-Factor Authentication
 * Реализует Zero Trust принципы для дополнительной защиты
 */
export class MFAService {
  private readonly challenges: Map<string, MFAChallenge> = new Map();
  private readonly userMethods: Map<string, MFAMethod[]> = new Map();

  /**
   * Инициирует MFA процесс для пользователя
   * @param userId ID пользователя
   * @param method Метод аутентификации
   * @param ipAddress IP адрес пользователя
   * @param userAgent User Agent браузера
   * @returns ID вызова MFA
   */
  async initiateMFA(
    userId: string,
    method: MFAMethod['type'],
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    // Проверяем, что у пользователя включен этот метод
    const userMethods = this.getUserMethods(userId);
    const enabledMethod = userMethods.find(m => m.type === method && m.isEnabled && m.isVerified);
    
    if (!enabledMethod) {
      securityMonitoring.logEvent(
        SecurityEvent.UNAUTHORIZED_ACCESS,
        userId,
        { method, reason: 'MFA method not enabled or verified' },
        'high'
      );
      throw new Error('MFA method not enabled or verified');
    }

    // Генерируем код в зависимости от метода
    let code: string;
    switch (method) {
      case 'sms':
        code = this.generateSMSCode();
        break;
      case 'email':
        code = this.generateEmailCode();
        break;
      case 'totp':
        code = this.generateTOTPCode();
        break;
      case 'backup_codes':
        code = this.generateBackupCode();
        break;
      default:
        throw new Error('Unsupported MFA method');
    }

    // Создаем вызов MFA
    const challengeId = generateId();
    const challenge: MFAChallenge = {
      id: challengeId,
      userId,
      method,
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 минут
      attempts: 0,
      maxAttempts: 3,
      isUsed: false,
    };

    this.challenges.set(challengeId, challenge);

    // Отправляем код пользователю
    await this.sendCode(userId, method, code);

    // Логируем инициацию MFA
    securityMonitoring.logEvent(
      SecurityEvent.MFA_INITIATED,
      userId,
      { method, challengeId, ipAddress, userAgent },
      'medium'
    );

    return challengeId;
  }

  /**
   * Проверяет MFA код
   * @param challengeId ID вызова MFA
   * @param code Введенный код
   * @param ipAddress IP адрес пользователя
   * @param userAgent User Agent браузера
   * @returns Результат проверки
   */
  async verifyMFA(
    challengeId: string,
    code: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<MFAVerificationResult> {
    const challenge = this.challenges.get(challengeId);
    
    if (!challenge) {
      securityMonitoring.logEvent(
        SecurityEvent.UNAUTHORIZED_ACCESS,
        undefined,
        { challengeId, reason: 'Challenge not found' },
        'high'
      );
      throw new Error('MFA challenge not found');
    }

    if (challenge.isUsed) {
      securityMonitoring.logEvent(
        SecurityEvent.UNAUTHORIZED_ACCESS,
        challenge.userId,
        { challengeId, reason: 'Challenge already used' },
        'high'
      );
      throw new Error('MFA challenge already used');
    }

    if (challenge.expiresAt < new Date()) {
      securityMonitoring.logEvent(
        SecurityEvent.UNAUTHORIZED_ACCESS,
        challenge.userId,
        { challengeId, reason: 'Challenge expired' },
        'medium'
      );
      throw new Error('MFA challenge expired');
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      securityMonitoring.logEvent(
        SecurityEvent.BRUTE_FORCE_ATTEMPT,
        challenge.userId,
        { challengeId, attempts: challenge.attempts },
        'critical'
      );
      throw new Error('Too many MFA attempts');
    }

    challenge.attempts++;

    // Проверяем код
    const isValid = await this.validateCode(challenge.method, code, challenge.code);
    
    if (!isValid) {
      securityMonitoring.logEvent(
        SecurityEvent.INVALID_CREDENTIALS,
        challenge.userId,
        { challengeId, method: challenge.method, attempts: challenge.attempts },
        'medium'
      );
      throw new Error('Invalid MFA code');
    }

    // Отмечаем вызов как использованный
    challenge.isUsed = true;
    this.challenges.delete(challengeId);

    // Обновляем последнее использование метода
    const userMethods = this.getUserMethods(challenge.userId);
    const method = userMethods.find(m => m.type === challenge.method);
    if (method) {
      method.lastUsed = new Date();
    }

    // Логируем успешную аутентификацию
    securityMonitoring.logEvent(
      SecurityEvent.MFA_SUCCESS,
      challenge.userId,
      { method: challenge.method, challengeId, ipAddress, userAgent },
      'low'
    );

    return {
      success: true,
      method: challenge.method,
      timestamp: new Date(),
      ipAddress,
      userAgent,
    };
  }

  /**
   * Добавляет новый MFA метод для пользователя
   * @param userId ID пользователя
   * @param method Тип метода
   * @param name Название метода
   * @returns Созданный метод
   */
  async addMFAMethod(userId: string, method: MFAMethod['type'], name: string): Promise<MFAMethod> {
    const mfaMethod: MFAMethod = {
      id: generateId(),
      type: method,
      name,
      isEnabled: false,
      isVerified: false,
      createdAt: new Date(),
    };

    const userMethods = this.getUserMethods(userId);
    userMethods.push(mfaMethod);
    this.userMethods.set(userId, userMethods);

    securityMonitoring.logEvent(
      SecurityEvent.MFA_METHOD_ADDED,
      userId,
      { method, methodId: mfaMethod.id },
      'low'
    );

    return mfaMethod;
  }

  /**
   * Включает MFA метод для пользователя
   * @param userId ID пользователя
   * @param methodId ID метода
   */
  async enableMFAMethod(userId: string, methodId: string): Promise<void> {
    const userMethods = this.getUserMethods(userId);
    const method = userMethods.find(m => m.id === methodId);
    
    if (!method) {
      throw new Error('MFA method not found');
    }

    method.isEnabled = true;
    method.isVerified = true;

    securityMonitoring.logEvent(
      SecurityEvent.MFA_METHOD_ENABLED,
      userId,
      { method: method.type, methodId },
      'low'
    );
  }

  /**
   * Отключает MFA метод для пользователя
   * @param userId ID пользователя
   * @param methodId ID метода
   */
  async disableMFAMethod(userId: string, methodId: string): Promise<void> {
    const userMethods = this.getUserMethods(userId);
    const method = userMethods.find(m => m.id === methodId);
    
    if (!method) {
      throw new Error('MFA method not found');
    }

    method.isEnabled = false;

    securityMonitoring.logEvent(
      SecurityEvent.MFA_METHOD_DISABLED,
      userId,
      { method: method.type, methodId },
      'low'
    );
  }

  /**
   * Получает все MFA методы пользователя
   * @param userId ID пользователя
   * @returns Массив методов
   */
  getUserMethods(userId: string): MFAMethod[] {
    return this.userMethods.get(userId) || [];
  }

  /**
   * Проверяет, требуется ли MFA для пользователя
   * @param userId ID пользователя
   * @returns true, если требуется MFA
   */
  isMFARequired(userId: string): boolean {
    const userMethods = this.getUserMethods(userId);
    return userMethods.some(m => m.isEnabled && m.isVerified);
  }

  /**
   * Генерирует SMS код
   * @returns 6-значный код
   */
  private generateSMSCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Генерирует Email код
   * @returns 8-значный код
   */
  private generateEmailCode(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }

  /**
   * Генерирует TOTP код
   * @returns 6-значный код
   */
  private generateTOTPCode(): string {
    // В реальной системе здесь будет генерация TOTP кода
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Генерирует резервный код
   * @returns 10-значный код
   */
  private generateBackupCode(): string {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }

  /**
   * Отправляет код пользователю
   * @param userId ID пользователя
   * @param method Метод отправки
   * @param code Код для отправки
   */
  private async sendCode(userId: string, method: MFAMethod['type'], code: string): Promise<void> {
    // В реальной системе здесь будет интеграция с SMS/Email провайдерами
    console.log(`Sending ${method} code ${code} to user ${userId}`);
    
    // Имитация отправки
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Проверяет код в зависимости от метода
   * @param method Метод аутентификации
   * @param inputCode Введенный код
   * @param expectedCode Ожидаемый код
   * @returns true, если код верный
   */
  private async validateCode(
    method: MFAMethod['type'],
    inputCode: string,
    expectedCode: string
  ): Promise<boolean> {
    switch (method) {
      case 'sms':
      case 'email':
      case 'backup_codes':
        return inputCode === expectedCode;
      case 'totp':
        // В реальной системе здесь будет проверка TOTP кода
        return inputCode === expectedCode;
      default:
        return false;
    }
  }
}

export const mfaService = new MFAService();
