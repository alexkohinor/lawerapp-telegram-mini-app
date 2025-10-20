'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HapticFeedback } from '@/components/telegram/HapticFeedback';
import { 
  Crown, 
  Star, 
  Check, 
  X, 
  Zap, 
  Shield, 
  Clock,
  ArrowLeft,
  CreditCard,
  Sparkles,
  TrendingUp,
  Users,
  Building
} from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  limitations: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
  consultationsLimit: number;
  documentsLimit: number;
  disputesLimit: number;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useUser();
  const { showAlert } = useTelegramUser();
  
  const [currentPlan, setCurrentPlan] = useState<string>('FREE');
  const [isLoading, setIsLoading] = useState(false);

  const plans: SubscriptionPlan[] = [
    {
      id: 'FREE',
      name: 'Бесплатный',
      price: 0,
      period: 'навсегда',
      description: 'Базовые возможности для начала работы',
      features: [
        '5 AI консультаций в месяц',
        '3 документа в месяц',
        'Базовые шаблоны документов',
        'Поддержка в Telegram',
        'Мобильное приложение'
      ],
      limitations: [
        'Ограниченное количество консультаций',
        'Базовые шаблоны документов',
        'Стандартная поддержка'
      ],
      icon: <Star className="w-6 h-6" />,
      color: 'bg-gray-100 text-gray-800',
      consultationsLimit: 5,
      documentsLimit: 3,
      disputesLimit: 10
    },
    {
      id: 'PREMIUM',
      name: 'Премиум',
      price: 990,
      period: 'в месяц',
      description: 'Расширенные возможности для активных пользователей',
      features: [
        '50 AI консультаций в месяц',
        '20 документов в месяц',
        'Все шаблоны документов',
        'Приоритетная поддержка',
        'Экспорт в PDF/DOCX',
        'История консультаций',
        'Уведомления в Telegram'
      ],
      limitations: [],
      popular: true,
      icon: <Crown className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
      consultationsLimit: 50,
      documentsLimit: 20,
      disputesLimit: 50
    },
    {
      id: 'BUSINESS',
      name: 'Бизнес',
      price: 2990,
      period: 'в месяц',
      description: 'Максимальные возможности для профессионалов',
      features: [
        '200 AI консультаций в месяц',
        '100 документов в месяц',
        'Все шаблоны + кастомные',
        'Персональный менеджер',
        'API доступ',
        'Белый лейбл',
        'Аналитика и отчеты',
        'Командная работа'
      ],
      limitations: [],
      icon: <Building className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      consultationsLimit: 200,
      documentsLimit: 100,
      disputesLimit: 200
    }
  ];

  useEffect(() => {
    if (user) {
      setCurrentPlan(user.isPremium ? 'PREMIUM' : 'FREE');
    }
  }, [user]);

  const handleSelectPlan = async (planId: string) => {
    if (planId === currentPlan) {
      showAlert('Этот план уже активен');
      return;
    }

    setIsLoading(true);
    
    try {
      // Заглушка для демонстрации
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (planId === 'FREE') {
        showAlert('Переход на бесплатный план будет доступен в следующих версиях');
      } else {
        showAlert('Платежная система будет интегрирована в следующих версиях. Пока что все функции доступны бесплатно!');
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      showAlert('Ошибка при выборе плана');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPlan = () => {
    return plans.find(plan => plan.id === currentPlan) || plans[0];
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Бесплатно';
    return `${price.toLocaleString('ru-RU')} ₽`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Доступ ограничен</CardTitle>
            <CardDescription className="text-center">
              Необходима авторизация для просмотра подписок
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="p-4 space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <HapticFeedback impact="light">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Назад</span>
            </Button>
          </HapticFeedback>
          <h1 className="text-2xl font-bold text-gray-900">
            Подписка
          </h1>
        </div>

        {/* Current Plan Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="w-6 h-6 text-yellow-600" />
              <span>Текущий план</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCurrentPlan().color}`}>
                  {getCurrentPlan().icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getCurrentPlan().name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getCurrentPlan().description}
                  </p>
                </div>
              </div>
              <Badge className={getCurrentPlan().color}>
                Активен
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 hover:shadow-lg ${
                plan.popular ? 'ring-2 ring-yellow-500 shadow-lg' : ''
              } ${
                plan.id === currentPlan ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Популярный
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center ${plan.color} mb-4`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(plan.price)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {plan.period}
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Features */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Включено:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Ограничения:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-4">
                    <HapticFeedback impact="light">
                      <Button
                        className={`w-full ${
                          plan.id === currentPlan 
                            ? 'bg-gray-100 text-gray-600 cursor-not-allowed' 
                            : plan.popular 
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' 
                              : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        disabled={plan.id === currentPlan || isLoading}
                        onClick={() => handleSelectPlan(plan.id)}
                      >
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        ) : plan.id === currentPlan ? (
                          'Текущий план'
                        ) : plan.price === 0 ? (
                          'Выбрать'
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Подключить
                          </>
                        )}
                      </Button>
                    </HapticFeedback>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Methods Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <span>Способы оплаты</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Банковские карты</h4>
                <p className="text-sm text-gray-600">Visa, MasterCard, МИР</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Telegram Stars</h4>
                <p className="text-sm text-gray-600">Внутренняя валюта Telegram</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">ЮKassa</h4>
                <p className="text-sm text-gray-600">СБП, электронные кошельки</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Часто задаваемые вопросы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Можно ли отменить подписку?
                </h4>
                <p className="text-sm text-gray-600">
                  Да, вы можете отменить подписку в любое время. Доступ к функциям сохранится до конца оплаченного периода.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Что происходит при превышении лимитов?
                </h4>
                <p className="text-sm text-gray-600">
                  При превышении лимитов вы получите уведомление с предложением обновить план или дождаться следующего месяца.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Безопасны ли платежи?
                </h4>
                <p className="text-sm text-gray-600">
                  Все платежи обрабатываются через защищенные платежные системы. Мы не храним данные ваших карт.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Notice */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Платежная система в разработке
            </h3>
            <p className="text-gray-600 mb-4">
              Пока что все функции доступны бесплатно! Платежная интеграция будет добавлена в следующих версиях.
            </p>
            <HapticFeedback impact="light">
              <Button
                variant="outline"
                onClick={() => showAlert('Следите за обновлениями в нашем Telegram канале!')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Узнать о новостях
              </Button>
            </HapticFeedback>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
