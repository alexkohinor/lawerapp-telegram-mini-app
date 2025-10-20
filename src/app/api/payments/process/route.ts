import { NextRequest, NextResponse } from 'next/server';
import { paymentManager } from '@/lib/payments/payment-manager';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { securityMonitoring, SecurityEvent } from '@/lib/monitoring/security-monitoring';

/**
 * API для обработки платежей
 * Основано на PAYMENT_INTEGRATION.md и DEVELOPMENT_ROADMAP.md
 */

export async function POST(request: NextRequest) {
  try {
    // Проверяем аутентификацию
    const user = await getCurrentUser();
    if (!user) {
      securityMonitoring.logEvent(
        SecurityEvent.UNAUTHORIZED_ACCESS,
        undefined,
        { endpoint: '/api/payments/process', method: 'POST' },
        'high'
      );
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Парсим тело запроса
    const body = await request.json();
    const { method, amount, currency, description, plan, cardData, yoomoneyAccount, qiwiAccount } = body;

    // Валидируем обязательные поля
    if (!method) {
      return NextResponse.json(
        { success: false, error: 'Payment method is required' },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    if (!plan || !plan.id) {
      return NextResponse.json(
        { success: false, error: 'Subscription plan is required' },
        { status: 400 }
      );
    }

    // Проверяем, что способ оплаты доступен
    const availableMethods = paymentManager.getAvailablePaymentMethods();
    if (!availableMethods.includes(method)) {
      return NextResponse.json(
        { success: false, error: `Payment method ${method} is not available` },
        { status: 400 }
      );
    }

    // Создаем запрос на платеж
    const paymentRequest = {
      method,
      amount,
      currency: currency || 'RUB',
      description: description || `Оплата подписки ${plan.name}`,
      userId: user.id,
      plan,
      ...(cardData && { cardData }),
      ...(yoomoneyAccount && { yoomoneyAccount }),
      ...(qiwiAccount && { qiwiAccount }),
    };

    // Обрабатываем платеж
    const result = await paymentManager.processPayment(paymentRequest);

    // Логируем успешный платеж
    console.log(`Payment processed for user ${user.id}:`, {
      method,
      amount,
      planId: plan.id,
      paymentId: result.id,
      status: result.status,
    });

    // В реальном приложении здесь будет сохранение платежа в базу данных
    // await savePaymentToDatabase(result, user.id, plan.id);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    
    // Логируем ошибку как событие безопасности
    securityMonitoring.handleError(
      {
        code: 'PAYMENT_PROCESSING_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: { endpoint: '/api/payments/process' },
      },
      undefined,
      { error: error instanceof Error ? error.stack : undefined }
    );

    return NextResponse.json(
      { 
        success: false, 
        error: 'Payment processing failed',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Unknown error') : 
          undefined
      },
      { status: 500 }
    );
  }
}
