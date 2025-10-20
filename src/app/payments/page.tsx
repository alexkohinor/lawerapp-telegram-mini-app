'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  minAmount: number;
  maxAmount: number;
  fee: number;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  description: string;
  method: string;
  status: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  paymentUrl: string;
}

interface PaymentForm {
  amount: string;
  description: string;
  method: string;
}

const generatePaymentUrl = (method: string, amount: number): string => {
  switch (method) {
    case 'TELEGRAM_STARS':
      return `https://t.me/star_transfer?amount=${amount}`;
    case 'YUKASSA':
      return `https://yookassa.ru/payment?amount=${amount}`;
    case 'SBP':
      return `https://sbp.nspk.ru/payment?amount=${amount}`;
    case 'YUMONEY':
      return `https://yoomoney.ru/payment?amount=${amount}`;
    case 'QIWI':
      return `https://qiwi.com/payment?amount=${amount}`;
    default:
      return `https://payment.example.com?amount=${amount}`;
  }
};

const calculateFee = (amount: number, methodId: string): number => {
  const method = {
    'TELEGRAM_STARS': 0,
    'YUKASSA': 2.9,
    'SBP': 0.5,
    'YUMONEY': 2.5,
    'QIWI': 2.0
  }[methodId] || 0;
  
  return Math.round(amount * (method / 100));
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [form, setForm] = useState<PaymentForm>({
    amount: '',
    description: '',
    method: 'TELEGRAM_STARS'
  });

  const statusColors = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'FAILED': 'bg-red-100 text-red-800',
    'CANCELLED': 'bg-gray-100 text-gray-800'
  };

  const statusLabels = {
    'PENDING': 'Ожидает оплаты',
    'COMPLETED': 'Оплачен',
    'FAILED': 'Ошибка оплаты',
    'CANCELLED': 'Отменен'
  };

  useEffect(() => {
    loadPaymentMethods();
    loadPayments();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      // Mock payment methods
      const methods: PaymentMethod[] = [
        {
          id: 'TELEGRAM_STARS',
          name: 'Telegram Stars',
          description: 'Оплата звездами Telegram',
          icon: '⭐',
          minAmount: 1,
          maxAmount: 10000,
          fee: 0
        },
        {
          id: 'YUKASSA',
          name: 'ЮKassa',
          description: 'Банковские карты, СБП, электронные кошельки',
          icon: '💳',
          minAmount: 1,
          maxAmount: 1000000,
          fee: 2.9
        },
        {
          id: 'SBP',
          name: 'Система быстрых платежей',
          description: 'СБП через мобильное приложение банка',
          icon: '📱',
          minAmount: 1,
          maxAmount: 1000000,
          fee: 0.5
        },
        {
          id: 'YUMONEY',
          name: 'ЮMoney',
          description: 'Яндекс.Деньги',
          icon: '💰',
          minAmount: 1,
          maxAmount: 100000,
          fee: 2.5
        },
        {
          id: 'QIWI',
          name: 'QIWI',
          description: 'QIWI кошелек',
          icon: '🟣',
          minAmount: 1,
          maxAmount: 15000,
          fee: 2.0
        }
      ];
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const loadPayments = async () => {
    try {
      // Mock payments data
      const mockPayments: Payment[] = [
        {
          id: 'payment_1',
          amount: 1000,
          currency: 'RUB',
          description: 'Оплата консультации',
          method: 'TELEGRAM_STARS',
          status: 'COMPLETED',
          metadata: { fee: 0 },
          createdAt: new Date().toISOString(),
          paymentUrl: 'https://t.me/star_transfer?amount=1000'
        }
      ];
      setPayments(mockPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!form.amount || parseFloat(form.amount) <= 0) {
      alert('Пожалуйста, введите корректную сумму');
      return;
    }

    const selectedMethod = paymentMethods.find(m => m.id === form.method);
    if (!selectedMethod) {
      alert('Пожалуйста, выберите способ оплаты');
      return;
    }

    const amount = parseFloat(form.amount);
    if (amount < selectedMethod.minAmount || amount > selectedMethod.maxAmount) {
      alert(`Сумма должна быть от ${selectedMethod.minAmount} до ${selectedMethod.maxAmount} рублей`);
      return;
    }

    try {
      // Mock payment creation
      const newPayment: Payment = {
        id: `payment_${Date.now()}`,
        amount,
        currency: 'RUB',
        description: form.description || 'Оплата услуг LawerApp',
        method: form.method,
        status: 'PENDING',
        metadata: { fee: calculateFee(amount, form.method) },
        createdAt: new Date().toISOString(),
        paymentUrl: generatePaymentUrl(form.method, amount)
      };
      
      setPayments(prev => [newPayment, ...prev]);
      setShowCreateModal(false);
      setForm({
        amount: '',
        description: '',
        method: 'TELEGRAM_STARS'
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Ошибка при создании платежа. Попробуйте еще раз.');
    }
  };

  const handlePaymentAction = (payment: Payment) => {
    if (payment.status === 'PENDING') {
      window.open(payment.paymentUrl, '_blank');
    } else {
      setSelectedPayment(payment);
    }
  };

  const getMethodIcon = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    return method?.icon || '💳';
  };

  const getMethodName = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    return method?.name || methodId;
  };

  const calculateFee = (amount: number, methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (!method) return 0;
    
    if (method.fee === 0) return 0;
    return Math.round(amount * (method.fee / 100));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка платежей...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Платежи
            </h1>
            <p className="text-gray-600">
              Управляйте платежами и подписками
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            Создать платеж
          </Button>
        </div>

        {/* Payment Methods */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Доступные способы оплаты</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  form.method === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setForm(prev => ({ ...prev, method: method.id }))}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{method.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {method.minAmount} - {method.maxAmount} руб.
                      {method.fee > 0 && ` • Комиссия ${method.fee}%`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Payments List */}
        {payments.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Платежи не найдены
            </h3>
            <p className="text-gray-600 mb-4">
              Создайте ваш первый платеж
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              Создать платеж
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id} hover className="cursor-pointer" onClick={() => handlePaymentAction(payment)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{getMethodIcon(payment.method)}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{payment.description}</h3>
                      <p className="text-sm text-gray-600">
                        {getMethodName(payment.method)} • {payment.amount} {payment.currency}
                        {(payment.metadata.fee as number) > 0 && (
                          <span className="text-gray-500">
                            {' '}(включая комиссию {payment.metadata.fee as number} руб.)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.createdAt).toLocaleString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-sm rounded-full ${statusColors[payment.status as keyof typeof statusColors]}`}>
                      {statusLabels[payment.status as keyof typeof statusLabels]}
                    </span>
                    
                    {payment.status === 'PENDING' && (
                      <Button size="sm">
                        Оплатить
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Payment Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Создать платеж"
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Сумма (руб.)"
              type="number"
              value={form.amount}
              onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="1000"
              required
            />
            
            <Input
              label="Описание"
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Оплата консультации"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Способ оплаты
              </label>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      form.method === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setForm(prev => ({ ...prev, method: method.id }))}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{method.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{method.name}</h4>
                        <p className="text-sm text-gray-600">{method.description}</p>
                        {method.fee > 0 && (
                          <p className="text-xs text-gray-500">Комиссия: {method.fee}%</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {form.amount && form.method && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Сумма:</span>
                  <span>{form.amount} руб.</span>
                </div>
                {calculateFee(parseFloat(form.amount) || 0, form.method) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Комиссия:</span>
                    <span>{calculateFee(parseFloat(form.amount) || 0, form.method)} руб.</span>
                  </div>
                )}
                <div className="flex justify-between font-medium border-t pt-2 mt-2">
                  <span>Итого:</span>
                  <span>
                    {parseFloat(form.amount) + calculateFee(parseFloat(form.amount) || 0, form.method)} руб.
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Отмена
              </Button>
              <Button 
                onClick={handleCreatePayment}
                disabled={!form.amount || parseFloat(form.amount) <= 0}
              >
                Создать платеж
              </Button>
            </div>
          </div>
        </Modal>

        {/* Payment Details Modal */}
        <Modal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          title="Детали платежа"
          size="md"
        >
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Сумма</h4>
                  <p className="text-lg font-semibold">
                    {selectedPayment.amount} {selectedPayment.currency}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Статус</h4>
                  <span className={`px-3 py-1 text-sm rounded-full ${statusColors[selectedPayment.status as keyof typeof statusColors]}`}>
                    {statusLabels[selectedPayment.status as keyof typeof statusLabels]}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Описание</h4>
                <p className="text-gray-600">{selectedPayment.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Способ оплаты</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{getMethodIcon(selectedPayment.method)}</span>
                  <span>{getMethodName(selectedPayment.method)}</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Дата создания</h4>
                <p className="text-gray-600">
                  {new Date(selectedPayment.createdAt).toLocaleString('ru-RU')}
                </p>
              </div>
              
              {selectedPayment.status === 'PENDING' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    Для завершения оплаты перейдите по ссылке: 
                    <a 
                      href={selectedPayment.paymentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline ml-1"
                    >
                      Оплатить
                    </a>
                  </p>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPayment(null)}
                >
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
