# 💳 Интеграция платежей в LawerApp Telegram Mini App

## 📋 Обзор платежной системы

**LawerApp** использует встроенные возможности Telegram для обработки платежей, включая Telegram Stars, банковские карты и другие способы оплаты. Интеграция обеспечивает безопасные и удобные транзакции прямо в приложении.

---

## 🎯 Платежная архитектура

### **1. Способы оплаты (доступные в РФ)**
```
┌─────────────────────────────────────────────────────────────┐
│                    Payment Methods (Russia)                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Telegram      │  │   Bank Cards    │  │   SBP       │  │
│  │   Stars         │  │   (Visa, MC,    │  │   (Fast     │  │
│  │   (Primary)     │  │   МИР)          │  │   Payments) │  │
│  │                 │  │   (ЮKassa)      │  │             │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   ЮMoney        │  │   QIWI          │  │   Bank      │  │
│  │   (Яндекс.      │  │   (Popular      │  │   Transfers │  │
│  │   Деньги)       │  │   in Russia)    │  │   (Corporate)│  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘

❌ НЕДОСТУПНЫ В РФ:
- Apple Pay, Google Pay (заблокированы)
- PayPal (заблокирован)
- Stripe (частично ограничен)
```

### **2. Тарифные планы**
```
┌─────────────────────────────────────────────────────────────┐
│                    Subscription Plans                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Free Tier     │  │   Premium       │  │   Business  │  │
│  │   ₽0/месяц      │  │   ₽990/месяц    │  │   ₽2990/месяц│  │
│  │   • 3 спора     │  │   • Unlimited   │  │   • All     │  │
│  │   • Basic AI    │  │   • Advanced AI │  │   • Team    │  │
│  │   • Email       │  │   • Priority    │  │   • API     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Student       │  │   Pay-per-use   │  │   Custom    │  │
│  │   ₽490/месяц    │  │   ₽99/документ  │  │   Enterprise│  │
│  │   • 10 споров   │  │   • No limits   │  │   • Contact │  │
│  │   • Student ID  │  │   • Pay as you  │  │   • Custom  │  │
│  │   • 50% discount│  │   • go          │  │   • pricing │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Техническая реализация

### **1. Установка зависимостей**

```bash
# Платежные сервисы
npm install stripe
npm install @stripe/stripe-js

# Утилиты
npm install uuid
npm install -D @types/uuid
```

### **2. Telegram Stars Integration**

#### **Telegram Stars Service**
```typescript
// src/lib/payments/telegram-stars-service.ts
import { WebApp } from '@twa-dev/sdk';

export class TelegramStarsService {
  private webApp: typeof WebApp;
  
  constructor() {
    this.webApp = WebApp;
  }
  
  async createPayment(
    amount: number,
    description: string,
    payload?: string
  ): Promise<PaymentResult> {
    try {
      // Создаем инвойс через Telegram Bot API
      const invoice = await this.createInvoice(amount, description, payload);
      
      // Показываем платежную форму
      const result = await this.showInvoice(invoice);
      
      return {
        success: result.status === 'paid',
        transactionId: result.transaction_id,
        amount,
        currency: 'XTR', // Telegram Stars
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Telegram Stars payment error:', error);
      throw new Error('Failed to process Telegram Stars payment');
    }
  }
  
  private async createInvoice(
    amount: number,
    description: string,
    payload?: string
  ): Promise<any> {
    const response = await fetch('/api/payments/create-invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        description,
        payload,
        currency: 'XTR',
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create invoice');
    }
    
    return await response.json();
  }
  
  private async showInvoice(invoice: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.webApp.showInvoice(invoice, (result) => {
        if (result.status === 'paid') {
          resolve(result);
        } else {
          reject(new Error('Payment was not completed'));
        }
      });
    });
  }
  
  async checkPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      const response = await fetch(`/api/payments/status/${transactionId}`);
      const data = await response.json();
      
      return {
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        timestamp: data.timestamp,
      };
    } catch (error) {
      console.error('Payment status check error:', error);
      throw new Error('Failed to check payment status');
    }
  }
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  timestamp: Date;
}

interface PaymentStatus {
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  timestamp: string;
}
```

### **3. Stripe Integration (для банковских карт)**

#### **Stripe Service**
```typescript
// src/lib/payments/stripe-service.ts
import Stripe from 'stripe';

export class StripeService {
  private stripe: Stripe;
  
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
  }
  
  async createPaymentIntent(
    amount: number,
    currency: string = 'rub',
    metadata?: Record<string, string>
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to kopecks
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      return paymentIntent;
    } catch (error) {
      console.error('Stripe payment intent error:', error);
      throw new Error('Failed to create payment intent');
    }
  }
  
  async confirmPayment(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntentId,
        {
          payment_method: paymentMethodId,
        }
      );
      
      return paymentIntent;
    } catch (error) {
      console.error('Stripe payment confirmation error:', error);
      throw new Error('Failed to confirm payment');
    }
  }
  
  async createSubscription(
    customerId: string,
    priceId: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });
      
      return subscription;
    } catch (error) {
      console.error('Stripe subscription error:', error);
      throw new Error('Failed to create subscription');
    }
  }
  
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Stripe subscription cancellation error:', error);
      throw new Error('Failed to cancel subscription');
    }
  }
}
```

### **4. Payment Manager**

#### **Unified Payment Service**
```typescript
// src/lib/payments/payment-manager.ts
import { TelegramStarsService } from './telegram-stars-service';
import { StripeService } from './stripe-service';

export type PaymentMethod = 'telegram_stars' | 'yookassa' | 'sbp' | 'yoomoney' | 'qiwi' | 'bank_transfer';

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  method: PaymentMethod;
  userId: string;
  metadata?: Record<string, string>;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  paymentUrl?: string;
  clientSecret?: string;
  error?: string;
}

export class PaymentManager {
  private telegramStarsService: TelegramStarsService;
  private stripeService: StripeService;
  
  constructor() {
    this.telegramStarsService = new TelegramStarsService();
    this.stripeService = new StripeService();
  }
  
  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      switch (request.method) {
        case 'telegram_stars':
          return await this.processTelegramStarsPayment(request);
        case 'yookassa':
          return await this.processYooKassaPayment(request);
        case 'sbp':
          return await this.processSBPPayment(request);
        case 'yoomoney':
          return await this.processYooMoneyPayment(request);
        case 'qiwi':
          return await this.processQIWIPayment(request);
        case 'bank_transfer':
          return await this.processBankTransfer(request);
        default:
          throw new Error(`Unsupported payment method: ${request.method}`);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        transactionId: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  private async processTelegramStarsPayment(
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    const result = await this.telegramStarsService.createPayment(
      request.amount,
      request.description,
      JSON.stringify(request.metadata)
    );
    
    return {
      success: result.success,
      transactionId: result.transactionId,
    };
  }
  
  private async processYooKassaPayment(
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    // Интеграция с ЮKassa для банковских карт
    const payment = await this.createYooKassaPayment(request);
    
    return {
      success: true,
      transactionId: payment.id,
      paymentUrl: payment.confirmation_url,
    };
  }
  
  private async processSBPPayment(
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    // Интеграция с СБП (Система быстрых платежей)
    const payment = await this.createSBPPayment(request);
    
    return {
      success: true,
      transactionId: payment.id,
      paymentUrl: payment.payment_url,
    };
  }
  
  private async processYooMoneyPayment(
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    // Интеграция с ЮMoney (Яндекс.Деньги)
    const payment = await this.createYooMoneyPayment(request);
    
    return {
      success: true,
      transactionId: payment.id,
      paymentUrl: payment.payment_url,
    };
  }
  
  private async processQIWIPayment(
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    // Интеграция с QIWI
    const payment = await this.createQIWIPayment(request);
    
    return {
      success: true,
      transactionId: payment.id,
      paymentUrl: payment.payment_url,
    };
  }
  
  private async processBankTransfer(
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    // Генерируем реквизиты для банковского перевода
    const bankDetails = await this.generateBankDetails(request);
    
    return {
      success: true,
      transactionId: bankDetails.transactionId,
      paymentUrl: bankDetails.paymentUrl,
    };
  }
  
  private async generateBankDetails(request: PaymentRequest) {
    // Генерация реквизитов для банковского перевода
    const transactionId = `BT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      transactionId,
      paymentUrl: `/payments/bank-transfer/${transactionId}`,
      bankDetails: {
        account: '40702810100000000000',
        bank: 'ПАО Сбербанк',
        bic: '044525225',
        purpose: `${request.description} (${transactionId})`,
        amount: request.amount,
      },
    };
  }
}
```

### **5. Subscription Management**

#### **Subscription Service**
```typescript
// src/lib/payments/subscription-service.ts
import { PaymentManager, PaymentMethod } from './payment-manager';

export type SubscriptionPlan = 'free' | 'premium' | 'business' | 'student';

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod: PaymentMethod;
  transactionId?: string;
}

export class SubscriptionService {
  private paymentManager: PaymentManager;
  
  constructor() {
    this.paymentManager = new PaymentManager();
  }
  
  async createSubscription(
    userId: string,
    plan: SubscriptionPlan,
    paymentMethod: PaymentMethod
  ): Promise<Subscription> {
    try {
      const planDetails = this.getPlanDetails(plan);
      
      const paymentRequest = {
        amount: planDetails.price,
        currency: 'rub',
        description: `Подписка ${planDetails.name}`,
        method: paymentMethod,
        userId,
        metadata: {
          plan,
          type: 'subscription',
        },
      };
      
      const paymentResult = await this.paymentManager.processPayment(paymentRequest);
      
      if (!paymentResult.success) {
        throw new Error('Payment failed');
      }
      
      const subscription: Subscription = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        plan,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + planDetails.duration * 24 * 60 * 60 * 1000),
        autoRenew: true,
        paymentMethod,
        transactionId: paymentResult.transactionId,
      };
      
      // Сохраняем подписку в базе данных
      await this.saveSubscription(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Subscription creation error:', error);
      throw new Error('Failed to create subscription');
    }
  }
  
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      
      // Отменяем подписку в платежной системе
      if (subscription.paymentMethod === 'stripe' && subscription.transactionId) {
        await this.stripeService.cancelSubscription(subscription.transactionId);
      }
      
      // Обновляем статус в базе данных
      await this.updateSubscriptionStatus(subscriptionId, 'cancelled');
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      throw new Error('Failed to cancel subscription');
    }
  }
  
  async checkSubscriptionStatus(userId: string): Promise<Subscription | null> {
    try {
      const subscription = await this.getActiveSubscription(userId);
      
      if (!subscription) {
        return null;
      }
      
      // Проверяем, не истекла ли подписка
      if (subscription.endDate < new Date() && subscription.status === 'active') {
        await this.updateSubscriptionStatus(subscription.id, 'expired');
        subscription.status = 'expired';
      }
      
      return subscription;
    } catch (error) {
      console.error('Subscription status check error:', error);
      throw new Error('Failed to check subscription status');
    }
  }
  
  private getPlanDetails(plan: SubscriptionPlan) {
    const plans = {
      free: { name: 'Free', price: 0, duration: 30 },
      premium: { name: 'Premium', price: 990, duration: 30 },
      business: { name: 'Business', price: 2990, duration: 30 },
      student: { name: 'Student', price: 490, duration: 30 },
    };
    
    return plans[plan];
  }
  
  private async saveSubscription(subscription: Subscription): Promise<void> {
    // Сохранение в базе данных
    // Реализация зависит от вашей ORM/базы данных
  }
  
  private async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    // Получение подписки из базы данных
    return null;
  }
  
  private async getActiveSubscription(userId: string): Promise<Subscription | null> {
    // Получение активной подписки пользователя
    return null;
  }
  
  private async updateSubscriptionStatus(
    subscriptionId: string,
    status: Subscription['status']
  ): Promise<void> {
    // Обновление статуса подписки в базе данных
  }
}
```

### **6. API Endpoints**

#### **Payment API**
```typescript
// src/app/api/payments/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PaymentManager } from '@/lib/payments/payment-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency, description, method, userId, metadata } = body;
    
    // Валидация входных данных
    if (!amount || !description || !method || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const paymentManager = new PaymentManager();
    const result = await paymentManager.processPayment({
      amount,
      currency: currency || 'rub',
      description,
      method,
      userId,
      metadata,
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
```

#### **Subscription API**
```typescript
// src/app/api/subscriptions/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/payments/subscription-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, plan, paymentMethod } = body;
    
    if (!userId || !plan || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const subscriptionService = new SubscriptionService();
    const subscription = await subscriptionService.createSubscription(
      userId,
      plan,
      paymentMethod
    );
    
    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
```

### **7. Frontend Components**

#### **Payment Form Component**
```typescript
// src/components/features/payments/PaymentForm.tsx
'use client';

import { useState } from 'react';
import { useTelegram } from '@/lib/telegram/telegram-provider';

interface PaymentFormProps {
  amount: number;
  description: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
}

export const PaymentForm = ({ amount, description, onSuccess, onError }: PaymentFormProps) => {
  const { user } = useTelegram();
  const [selectedMethod, setSelectedMethod] = useState<'telegram_stars' | 'yookassa' | 'sbp' | 'yoomoney' | 'qiwi'>('telegram_stars');
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePayment = async () => {
    if (!user) {
      onError('Пользователь не авторизован');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'rub',
          description,
          method: selectedMethod,
          userId: user.id.toString(),
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        onSuccess(result.transactionId);
      } else {
        onError(result.error || 'Ошибка платежа');
      }
    } catch (error) {
      onError('Ошибка сети');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-telegram-secondary p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Детали платежа</h3>
        <p className="text-sm text-telegram-hint mb-1">{description}</p>
        <p className="text-xl font-bold">{amount} ₽</p>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium">Способ оплаты</h4>
        
        <label className="flex items-center space-x-3 p-3 border border-telegram-secondary rounded-lg cursor-pointer">
          <input
            type="radio"
            name="paymentMethod"
            value="telegram_stars"
            checked={selectedMethod === 'telegram_stars'}
            onChange={(e) => setSelectedMethod(e.target.value as 'telegram_stars')}
            className="text-telegram-button"
          />
          <div>
            <p className="font-medium">Telegram Stars</p>
            <p className="text-sm text-telegram-hint">Встроенная валюта Telegram</p>
          </div>
        </label>
        
        <label className="flex items-center space-x-3 p-3 border border-telegram-secondary rounded-lg cursor-pointer">
          <input
            type="radio"
            name="paymentMethod"
            value="yookassa"
            checked={selectedMethod === 'yookassa'}
            onChange={(e) => setSelectedMethod(e.target.value as 'yookassa')}
            className="text-telegram-button"
          />
          <div>
            <p className="font-medium">Банковская карта</p>
            <p className="text-sm text-telegram-hint">Visa, MasterCard, МИР (ЮKassa)</p>
          </div>
        </label>
        
        <label className="flex items-center space-x-3 p-3 border border-telegram-secondary rounded-lg cursor-pointer">
          <input
            type="radio"
            name="paymentMethod"
            value="sbp"
            checked={selectedMethod === 'sbp'}
            onChange={(e) => setSelectedMethod(e.target.value as 'sbp')}
            className="text-telegram-button"
          />
          <div>
            <p className="font-medium">СБП</p>
            <p className="text-sm text-telegram-hint">Система быстрых платежей</p>
          </div>
        </label>
        
        <label className="flex items-center space-x-3 p-3 border border-telegram-secondary rounded-lg cursor-pointer">
          <input
            type="radio"
            name="paymentMethod"
            value="yoomoney"
            checked={selectedMethod === 'yoomoney'}
            onChange={(e) => setSelectedMethod(e.target.value as 'yoomoney')}
            className="text-telegram-button"
          />
          <div>
            <p className="font-medium">ЮMoney</p>
            <p className="text-sm text-telegram-hint">Яндекс.Деньги</p>
          </div>
        </label>
        
        <label className="flex items-center space-x-3 p-3 border border-telegram-secondary rounded-lg cursor-pointer">
          <input
            type="radio"
            name="paymentMethod"
            value="qiwi"
            checked={selectedMethod === 'qiwi'}
            onChange={(e) => setSelectedMethod(e.target.value as 'qiwi')}
            className="text-telegram-button"
          />
          <div>
            <p className="font-medium">QIWI</p>
            <p className="text-sm text-telegram-hint">Популярный в России</p>
          </div>
        </label>
      </div>
      
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full bg-telegram-button text-telegram-button-text py-3 px-4 rounded-lg font-medium disabled:opacity-50"
      >
        {isLoading ? 'Обработка...' : 'Оплатить'}
      </button>
    </div>
  );
};
```

#### **Subscription Plans Component**
```typescript
// src/components/features/payments/SubscriptionPlans.tsx
'use client';

import { useState } from 'react';
import { useTelegram } from '@/lib/telegram/telegram-provider';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '3 спора в месяц',
      'Базовые AI консультации',
      'Email поддержка',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 990,
    features: [
      'Неограниченные споры',
      'Продвинутые AI консультации',
      'Генерация документов',
      'Приоритетная поддержка',
      'Telegram уведомления',
    ],
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 2990,
    features: [
      'Все функции Premium',
      'Командная работа',
      'Аналитика и отчеты',
      'API доступ',
      'Персональный менеджер',
    ],
  },
];

export const SubscriptionPlans = () => {
  const { user } = useTelegram();
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubscribe = async (planId: string) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id.toString(),
          plan: planId,
          paymentMethod: 'telegram_stars',
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Показать успешное сообщение
        console.log('Subscription created:', result);
      } else {
        console.error('Subscription error:', result.error);
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Выберите тариф</h2>
      
      <div className="grid gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-6 rounded-lg border-2 ${
              plan.popular
                ? 'border-telegram-button bg-telegram-button/5'
                : 'border-telegram-secondary bg-telegram-secondary/20'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-telegram-button text-telegram-button-text px-3 py-1 rounded-full text-sm font-medium">
                  Популярный
                </span>
              </div>
            )}
            
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-telegram-hint"> ₽/месяц</span>
              </div>
            </div>
            
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span className="text-telegram-button">✓</span>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={isLoading || plan.id === 'free'}
              className={`w-full py-3 px-4 rounded-lg font-medium ${
                plan.id === 'free'
                  ? 'bg-telegram-secondary text-telegram-hint cursor-not-allowed'
                  : 'bg-telegram-button text-telegram-button-text'
              }`}
            >
              {plan.id === 'free' ? 'Текущий план' : 'Выбрать план'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 📊 Мониторинг и аналитика

### **1. Payment Analytics**
```typescript
// src/lib/payments/analytics.ts
export class PaymentAnalytics {
  static trackPayment(
    userId: string,
    amount: number,
    method: string,
    success: boolean,
    error?: string
  ) {
    fetch('/api/analytics/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        amount,
        method,
        success,
        error,
        timestamp: new Date().toISOString(),
      }),
    });
  }
  
  static trackSubscription(
    userId: string,
    plan: string,
    action: 'created' | 'cancelled' | 'renewed',
    amount?: number
  ) {
    fetch('/api/analytics/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        plan,
        action,
        amount,
        timestamp: new Date().toISOString(),
      }),
    });
  }
}
```

### **2. Webhook Handlers**

#### **Telegram Webhook**
```typescript
// src/app/api/webhooks/telegram/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Обработка успешного платежа
    if (body.pre_checkout_query) {
      // Подтверждаем платеж
      return NextResponse.json({ ok: true });
    }
    
    // Обработка успешного платежа
    if (body.message?.successful_payment) {
      const payment = body.message.successful_payment;
      
      // Обновляем статус подписки
      await updateSubscriptionStatus(payment.invoice_payload, 'active');
      
      // Отправляем подтверждение пользователю
      await sendPaymentConfirmation(body.message.from.id, payment);
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
```

#### **Stripe Webhook**
```typescript
// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;
    
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleSubscriptionPayment(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object);
        break;
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}
```

---

## 🔒 Безопасность

### **1. Payment Validation**
```typescript
// src/lib/payments/validation.ts
import { z } from 'zod';

export const paymentSchema = z.object({
  amount: z.number().min(1).max(1000000),
  currency: z.enum(['rub', 'usd', 'eur']),
  description: z.string().min(1).max(500),
  method: z.enum(['telegram_stars', 'stripe', 'bank_transfer']),
  userId: z.string().uuid(),
});

export const subscriptionSchema = z.object({
  plan: z.enum(['free', 'premium', 'business', 'student']),
  paymentMethod: z.enum(['telegram_stars', 'stripe', 'bank_transfer']),
  userId: z.string().uuid(),
});
```

### **2. Rate Limiting**
```typescript
// src/lib/payments/rate-limiter.ts
export class PaymentRateLimiter {
  private static attempts = new Map<string, number[]>();
  
  static async checkLimit(userId: string, limit: number = 5, windowMs: number = 300000): Promise<boolean> {
    const now = Date.now();
    const userAttempts = this.attempts.get(userId) || [];
    
    // Удаляем старые попытки
    const recentAttempts = userAttempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= limit) {
      return false;
    }
    
    // Добавляем новую попытку
    recentAttempts.push(now);
    this.attempts.set(userId, recentAttempts);
    
    return true;
  }
}
```

---

## 🧪 Тестирование

### **1. Unit Tests**
```typescript
// tests/lib/payments/telegram-stars-service.test.ts
import { TelegramStarsService } from '@/lib/payments/telegram-stars-service';

describe('TelegramStarsService', () => {
  let service: TelegramStarsService;
  
  beforeEach(() => {
    service = new TelegramStarsService();
  });
  
  it('should create payment with valid parameters', async () => {
    const result = await service.createPayment(100, 'Test payment');
    
    expect(result.success).toBeDefined();
    expect(result.transactionId).toBeDefined();
    expect(result.amount).toBe(100);
  });
  
  it('should handle payment errors', async () => {
    await expect(service.createPayment(-1, 'Invalid payment')).rejects.toThrow();
  });
});
```

### **2. Integration Tests**
```typescript
// tests/api/payments/create.test.ts
import { POST } from '@/app/api/payments/create/route';
import { NextRequest } from 'next/server';

describe('/api/payments/create', () => {
  it('should create payment with valid data', async () => {
    const request = new NextRequest('http://localhost:3000/api/payments/create', {
      method: 'POST',
      body: JSON.stringify({
        amount: 100,
        currency: 'rub',
        description: 'Test payment',
        method: 'telegram_stars',
        userId: 'test-user-id',
      }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBeDefined();
  });
});
```

---

## 📈 Оптимизация

### **1. Caching**
```typescript
// src/lib/payments/cache.ts
import { Redis } from 'ioredis';

export class PaymentCache {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
  }
  
  async cachePaymentStatus(transactionId: string, status: any, ttl: number = 3600): Promise<void> {
    const key = `payment:status:${transactionId}`;
    await this.redis.setex(key, ttl, JSON.stringify(status));
  }
  
  async getCachedPaymentStatus(transactionId: string): Promise<any | null> {
    const key = `payment:status:${transactionId}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
}
```

### **2. Retry Logic**
```typescript
// src/lib/payments/retry.ts
export class PaymentRetry {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError!;
  }
}
```

---

## 🎯 Заключение

Интеграция платежей в LawerApp Telegram Mini App обеспечивает:

- ✅ **Множественные способы оплаты** - Telegram Stars, банковские карты, банковские переводы
- ✅ **Гибкие тарифные планы** - от бесплатного до корпоративного
- ✅ **Безопасность** - валидация, rate limiting, webhook обработка
- ✅ **Мониторинг** - аналитика платежей и подписок
- ✅ **Масштабируемость** - кэширование и retry логика

**Следующий шаг:** Настройка webhook'ов и тестирование платежей! 💳🚀

---

*Интеграция платежей подготовлена: 16 октября 2025*  
*Версия: 1.0*  
*Статус: Готов к реализации ✅*
