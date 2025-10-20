'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  CreditCard, 
  Smartphone, 
  QrCode, 
  Wallet, 
  Star,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Lock,
  Shield
} from 'lucide-react';

/**
 * Форма оплаты для российских способов оплаты
 * Основано на PAYMENT_INTEGRATION.md и UI_COMPONENTS.md
 */

interface PaymentFormProps {
  plan: {
    id: string;
    name: string;
    price: number;
    currency: string;
    features: string[];
  };
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
}

interface PaymentMethodInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isAvailable: boolean;
  fee?: number;
  processingTime?: string;
}

export function PaymentForm({ plan, onPaymentSuccess, onPaymentError, onCancel }: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    holder: '',
  });
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [yoomoneyAccount, setYoomoneyAccount] = useState('');
  const [qiwiAccount, setQiwiAccount] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Доступные способы оплаты
  const paymentMethods: PaymentMethodInfo[] = [
    {
      id: 'telegram_stars',
      name: 'Telegram Stars',
      description: 'Оплата через внутреннюю валюту Telegram',
      icon: <Star className="w-5 h-5" />,
      isAvailable: true,
      processingTime: 'Мгновенно',
    },
    {
      id: 'bank_card',
      name: 'Банковская карта',
      description: 'Visa, MasterCard, МИР',
      icon: <CreditCard className="w-5 h-5" />,
      isAvailable: true,
      fee: 0,
      processingTime: '1-3 минуты',
    },
    {
      id: 'sbp',
      name: 'Система быстрых платежей',
      description: 'СБП - быстрая оплата через банковское приложение',
      icon: <QrCode className="w-5 h-5" />,
      isAvailable: true,
      processingTime: 'Мгновенно',
    },
    {
      id: 'yoomoney',
      name: 'ЮMoney',
      description: 'Яндекс.Деньги - популярный электронный кошелек',
      icon: <Wallet className="w-5 h-5" />,
      isAvailable: true,
      processingTime: '1-2 минуты',
    },
    {
      id: 'qiwi',
      name: 'QIWI',
      description: 'QIWI кошелек - удобная оплата',
      icon: <Smartphone className="w-5 h-5" />,
      isAvailable: true,
      processingTime: '1-2 минуты',
    },
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedMethod) {
      newErrors.method = 'Выберите способ оплаты';
    }

    if (selectedMethod === 'bank_card') {
      if (!cardData.number || cardData.number.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Введите корректный номер карты';
      }
      if (!cardData.expiry || !/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
        newErrors.cardExpiry = 'Введите дату в формате MM/YY';
      }
      if (!cardData.cvv || cardData.cvv.length < 3) {
        newErrors.cardCvv = 'Введите CVV код';
      }
      if (!cardData.holder || cardData.holder.trim().length < 2) {
        newErrors.cardHolder = 'Введите имя держателя карты';
      }
    }

    if (selectedMethod === 'yoomoney' && !yoomoneyAccount.trim()) {
      newErrors.yoomoneyAccount = 'Введите номер кошелька ЮMoney';
    }

    if (selectedMethod === 'qiwi' && !qiwiAccount.trim()) {
      newErrors.qiwiAccount = 'Введите номер QIWI кошелька';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setErrors({});

    try {
      const paymentRequest = {
        method: selectedMethod,
        amount: plan.price,
        currency: plan.currency,
        description: `Оплата подписки ${plan.name}`,
        userId: 'current_user_id', // В реальном приложении получаем из контекста
        plan: plan,
        ...(selectedMethod === 'bank_card' && { cardData }),
        ...(selectedMethod === 'yoomoney' && { yoomoneyAccount }),
        ...(selectedMethod === 'qiwi' && { qiwiAccount }),
      };

      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest),
      });

      const result = await response.json();

      if (result.success) {
        onPaymentSuccess(result.data);
      } else {
        throw new Error(result.error || 'Ошибка обработки платежа');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onPaymentError(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Информация о плане */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Оплата подписки</span>
            <span className="text-2xl font-bold text-primary-600">
              {plan.price} {plan.currency}
            </span>
          </CardTitle>
          <CardDescription>
            {plan.name} • {plan.features.length} функций
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Выбор способа оплаты */}
      <Card>
        <CardHeader>
          <CardTitle>Способ оплаты</CardTitle>
          <CardDescription>
            Выберите удобный для вас способ оплаты
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedMethod === method.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${!method.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => method.isAvailable && handleMethodSelect(method.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      selectedMethod === method.id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {method.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{method.name}</h3>
                      <p className="text-sm text-gray-600">{method.description}</p>
                      {method.processingTime && (
                        <p className="text-xs text-gray-500 mt-1">
                          Время обработки: {method.processingTime}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {method.fee !== undefined && (
                      <span className="text-sm text-gray-500">
                        Комиссия: {method.fee}%
                      </span>
                    )}
                    {selectedMethod === method.id && (
                      <CheckCircle className="w-5 h-5 text-primary-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {errors.method && (
            <p className="text-sm text-red-600 mt-2">{errors.method}</p>
          )}
        </CardContent>
      </Card>

      {/* Детали карты */}
      {selectedMethod === 'bank_card' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Данные карты</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Номер карты
              </label>
              <Input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardData.number}
                onChange={(e) => setCardData(prev => ({ ...prev, number: formatCardNumber(e.target.value) }))}
                error={errors.cardNumber}
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Срок действия
                </label>
                <Input
                  type="text"
                  placeholder="MM/YY"
                  value={cardData.expiry}
                  onChange={(e) => setCardData(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                  error={errors.cardExpiry}
                  maxLength={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <div className="relative">
                  <Input
                    type={showCardDetails ? 'text' : 'password'}
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                    error={errors.cardCvv}
                    maxLength={4}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCardDetails(!showCardDetails)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showCardDetails ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя держателя карты
              </label>
              <Input
                type="text"
                placeholder="IVAN IVANOV"
                value={cardData.holder}
                onChange={(e) => setCardData(prev => ({ ...prev, holder: e.target.value.toUpperCase() }))}
                error={errors.cardHolder}
              />
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Ваши данные защищены SSL-шифрованием</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ЮMoney */}
      {selectedMethod === 'yoomoney' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>ЮMoney кошелек</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Номер кошелька
              </label>
              <Input
                type="text"
                placeholder="410011234567890"
                value={yoomoneyAccount}
                onChange={(e) => setYoomoneyAccount(e.target.value.replace(/\D/g, ''))}
                error={errors.yoomoneyAccount}
              />
              <p className="text-xs text-gray-500 mt-1">
                Введите 11-значный номер вашего ЮMoney кошелька
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QIWI */}
      {selectedMethod === 'qiwi' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5" />
              <span>QIWI кошелек</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Номер кошелька
              </label>
              <Input
                type="text"
                placeholder="+7 900 123 45 67"
                value={qiwiAccount}
                onChange={(e) => setQiwiAccount(e.target.value)}
                error={errors.qiwiAccount}
              />
              <p className="text-xs text-gray-500 mt-1">
                Введите номер телефона, привязанный к QIWI кошельку
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Кнопки действий */}
      <div className="flex space-x-3">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1"
          disabled={isProcessing}
        >
          Отмена
        </Button>
        <Button
          onClick={handlePayment}
          disabled={isProcessing || !selectedMethod}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Обработка...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Оплатить {plan.price} {plan.currency}
            </>
          )}
        </Button>
      </div>

      {/* Предупреждение о безопасности */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Безопасность платежей</h4>
              <p className="text-sm text-blue-700 mt-1">
                Все платежи обрабатываются через защищенные сервисы. 
                Мы не сохраняем данные ваших карт и кошельков.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
