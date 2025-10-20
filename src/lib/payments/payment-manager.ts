import { PaymentMethod, PaymentRequest, PaymentResult, SubscriptionPlan } from '@/types';

/**
 * Менеджер платежей для российских способов оплаты
 * Основано на PAYMENT_INTEGRATION.md и DEVELOPMENT_ROADMAP.md
 */

interface PaymentProvider {
  name: string;
  type: PaymentMethod;
  isAvailable: boolean;
  processPayment: (request: PaymentRequest) => Promise<PaymentResult>;
  validatePayment: (paymentId: string) => Promise<boolean>;
}

interface TelegramStarsProvider extends PaymentProvider {
  type: 'telegram_stars';
  processPayment: (request: PaymentRequest) => Promise<PaymentResult>;
}

interface BankCardProvider extends PaymentProvider {
  type: 'bank_card';
  processPayment: (request: PaymentRequest) => Promise<PaymentResult>;
}

interface SBPProvider extends PaymentProvider {
  type: 'sbp';
  processPayment: (request: PaymentRequest) => Promise<PaymentResult>;
}

interface YooMoneyProvider extends PaymentProvider {
  type: 'yoomoney';
  processPayment: (request: PaymentRequest) => Promise<PaymentResult>;
}

interface QIWIProvider extends PaymentProvider {
  type: 'qiwi';
  processPayment: (request: PaymentRequest) => Promise<PaymentResult>;
}

export class PaymentManager {
  private providers: Map<PaymentMethod, PaymentProvider> = new Map();
  private webApp: any;

  constructor() {
    this.initializeProviders();
  }

  /**
   * Инициализация провайдеров платежей
   */
  private initializeProviders(): void {
    // Telegram Stars
    this.providers.set('telegram_stars', {
      name: 'Telegram Stars',
      type: 'telegram_stars',
      isAvailable: true,
      processPayment: this.processTelegramStarsPayment.bind(this),
      validatePayment: this.validateTelegramStarsPayment.bind(this),
    });

    // Банковские карты (Visa/MasterCard/MIR)
    this.providers.set('bank_card', {
      name: 'Банковские карты',
      type: 'bank_card',
      isAvailable: true,
      processPayment: this.processBankCardPayment.bind(this),
      validatePayment: this.validateBankCardPayment.bind(this),
    });

    // Система быстрых платежей (СБП)
    this.providers.set('sbp', {
      name: 'Система быстрых платежей',
      type: 'sbp',
      isAvailable: true,
      processPayment: this.processSBPPayment.bind(this),
      validatePayment: this.validateSBPPayment.bind(this),
    });

    // ЮMoney (Яндекс.Деньги)
    this.providers.set('yoomoney', {
      name: 'ЮMoney',
      type: 'yoomoney',
      isAvailable: true,
      processPayment: this.processYooMoneyPayment.bind(this),
      validatePayment: this.validateYooMoneyPayment.bind(this),
    });

    // QIWI
    this.providers.set('qiwi', {
      name: 'QIWI',
      type: 'qiwi',
      isAvailable: true,
      processPayment: this.processQIWIPayment.bind(this),
      validatePayment: this.validateQIWIPayment.bind(this),
    });
  }

  /**
   * Получение доступных способов оплаты
   */
  getAvailablePaymentMethods(): PaymentMethod[] {
    return Array.from(this.providers.values())
      .filter(provider => provider.isAvailable)
      .map(provider => provider.type);
  }

  /**
   * Получение информации о способе оплаты
   */
  getPaymentMethodInfo(method: PaymentMethod): PaymentProvider | null {
    return this.providers.get(method) || null;
  }

  /**
   * Обработка платежа
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    const provider = this.providers.get(request.method);
    
    if (!provider) {
      throw new Error(`Payment method ${request.method} not supported`);
    }

    if (!provider.isAvailable) {
      throw new Error(`Payment method ${request.method} is not available`);
    }

    try {
      // Валидируем запрос
      this.validatePaymentRequest(request);

      // Обрабатываем платеж
      const result = await provider.processPayment(request);

      // Логируем результат
      console.log(`Payment processed: ${request.method}, Amount: ${request.amount}, Status: ${result.status}`);

      return result;
    } catch (error) {
      console.error('Payment processing error:', error);
      throw new Error(`Payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Валидация платежа
   */
  async validatePayment(paymentId: string, method: PaymentMethod): Promise<boolean> {
    const provider = this.providers.get(method);
    
    if (!provider) {
      throw new Error(`Payment method ${method} not supported`);
    }

    try {
      return await provider.validatePayment(paymentId);
    } catch (error) {
      console.error('Payment validation error:', error);
      return false;
    }
  }

  /**
   * Обработка платежа через Telegram Stars
   */
  private async processTelegramStarsPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Получаем Telegram WebApp
      const webApp = (window as any).Telegram?.WebApp;
      if (!webApp) {
        throw new Error('Telegram WebApp not available');
      }

      // Создаем инвойс для Telegram Stars
      const invoice = {
        title: request.description || 'Оплата подписки LawerApp',
        description: `Оплата за ${request.plan?.name || 'услугу'}`,
        payload: JSON.stringify({
          userId: request.userId,
          planId: request.plan?.id,
          amount: request.amount,
        }),
        provider_token: process.env.NEXT_PUBLIC_TELEGRAM_PAYMENT_TOKEN,
        currency: 'XTR', // Telegram Stars
        prices: [{
          label: request.description || 'Оплата',
          amount: Math.round(request.amount * 100), // Конвертируем в копейки
        }],
      };

      // Отправляем инвойс
      webApp.showInvoice(invoice, (status: string) => {
        if (status === 'paid') {
          console.log('Telegram Stars payment successful');
        } else {
          console.log('Telegram Stars payment failed:', status);
        }
      });

      return {
        id: `tg_stars_${Date.now()}`,
        status: 'pending',
        method: 'telegram_stars',
        amount: request.amount,
        currency: 'XTR',
        timestamp: new Date(),
        metadata: {
          invoice: invoice,
        },
      };
    } catch (error) {
      console.error('Telegram Stars payment error:', error);
      throw new Error('Telegram Stars payment failed');
    }
  }

  /**
   * Обработка платежа через банковские карты
   */
  private async processBankCardPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // В реальном приложении здесь будет интеграция с YooKassa или Tinkoff
      const response = await fetch('/api/payments/bank-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: 'RUB',
          description: request.description,
          userId: request.userId,
          planId: request.plan?.id,
          cardData: request.cardData,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Bank card payment failed');
      }

      return {
        id: result.paymentId,
        status: result.status,
        method: 'bank_card',
        amount: request.amount,
        currency: 'RUB',
        timestamp: new Date(),
        metadata: {
          confirmationUrl: result.confirmationUrl,
          paymentMethodId: result.paymentMethodId,
        },
      };
    } catch (error) {
      console.error('Bank card payment error:', error);
      throw new Error('Bank card payment failed');
    }
  }

  /**
   * Обработка платежа через СБП
   */
  private async processSBPPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/payments/sbp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: 'RUB',
          description: request.description,
          userId: request.userId,
          planId: request.plan?.id,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'SBP payment failed');
      }

      return {
        id: result.paymentId,
        status: result.status,
        method: 'sbp',
        amount: request.amount,
        currency: 'RUB',
        timestamp: new Date(),
        metadata: {
          qrCode: result.qrCode,
          deepLink: result.deepLink,
        },
      };
    } catch (error) {
      console.error('SBP payment error:', error);
      throw new Error('SBP payment failed');
    }
  }

  /**
   * Обработка платежа через ЮMoney
   */
  private async processYooMoneyPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/payments/yoomoney', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: 'RUB',
          description: request.description,
          userId: request.userId,
          planId: request.plan?.id,
          yoomoneyAccount: request.yoomoneyAccount,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'YooMoney payment failed');
      }

      return {
        id: result.paymentId,
        status: result.status,
        method: 'yoomoney',
        amount: request.amount,
        currency: 'RUB',
        timestamp: new Date(),
        metadata: {
          confirmationUrl: result.confirmationUrl,
        },
      };
    } catch (error) {
      console.error('YooMoney payment error:', error);
      throw new Error('YooMoney payment failed');
    }
  }

  /**
   * Обработка платежа через QIWI
   */
  private async processQIWIPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/payments/qiwi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: 'RUB',
          description: request.description,
          userId: request.userId,
          planId: request.plan?.id,
          qiwiAccount: request.qiwiAccount,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'QIWI payment failed');
      }

      return {
        id: result.paymentId,
        status: result.status,
        method: 'qiwi',
        amount: request.amount,
        currency: 'RUB',
        timestamp: new Date(),
        metadata: {
          confirmationUrl: result.confirmationUrl,
        },
      };
    } catch (error) {
      console.error('QIWI payment error:', error);
      throw new Error('QIWI payment failed');
    }
  }

  /**
   * Валидация платежа Telegram Stars
   */
  private async validateTelegramStarsPayment(paymentId: string): Promise<boolean> {
    // В реальном приложении здесь будет проверка статуса платежа через Telegram API
    return true;
  }

  /**
   * Валидация платежа банковской картой
   */
  private async validateBankCardPayment(paymentId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/payments/validate/${paymentId}`, {
        method: 'GET',
      });

      const result = await response.json();
      return result.success && result.status === 'succeeded';
    } catch (error) {
      console.error('Bank card validation error:', error);
      return false;
    }
  }

  /**
   * Валидация платежа СБП
   */
  private async validateSBPPayment(paymentId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/payments/validate/${paymentId}`, {
        method: 'GET',
      });

      const result = await response.json();
      return result.success && result.status === 'succeeded';
    } catch (error) {
      console.error('SBP validation error:', error);
      return false;
    }
  }

  /**
   * Валидация платежа ЮMoney
   */
  private async validateYooMoneyPayment(paymentId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/payments/validate/${paymentId}`, {
        method: 'GET',
      });

      const result = await response.json();
      return result.success && result.status === 'succeeded';
    } catch (error) {
      console.error('YooMoney validation error:', error);
      return false;
    }
  }

  /**
   * Валидация платежа QIWI
   */
  private async validateQIWIPayment(paymentId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/payments/validate/${paymentId}`, {
        method: 'GET',
      });

      const result = await response.json();
      return result.success && result.status === 'succeeded';
    } catch (error) {
      console.error('QIWI validation error:', error);
      return false;
    }
  }

  /**
   * Валидация запроса на платеж
   */
  private validatePaymentRequest(request: PaymentRequest): void {
    if (!request.method) {
      throw new Error('Payment method is required');
    }

    if (!request.amount || request.amount <= 0) {
      throw new Error('Valid amount is required');
    }

    if (!request.userId) {
      throw new Error('User ID is required');
    }

    if (!request.plan) {
      throw new Error('Subscription plan is required');
    }

    // Проверяем специфичные для метода поля
    switch (request.method) {
      case 'bank_card':
        if (!request.cardData) {
          throw new Error('Card data is required for bank card payment');
        }
        break;
      case 'yoomoney':
        if (!request.yoomoneyAccount) {
          throw new Error('YooMoney account is required');
        }
        break;
      case 'qiwi':
        if (!request.qiwiAccount) {
          throw new Error('QIWI account is required');
        }
        break;
    }
  }
}

// Экспорт синглтона
export const paymentManager = new PaymentManager();
