'use client';

import React, { useState, useEffect } from 'react';

interface SubscriptionCheckProps {
  onSubscriptionVerified: (isSubscribed: boolean) => void;
  onLimitExceeded: () => void;
  children: React.ReactNode;
}

interface SubscriptionStatus {
  isSubscribed: boolean;
  documentsUsed: number;
  documentsLimit: number;
  isPremium: boolean;
}

export const SubscriptionCheck: React.FC<SubscriptionCheckProps> = ({
  onSubscriptionVerified,
  onLimitExceeded,
  children
}) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isSubscribed: false,
    documentsUsed: 0,
    documentsLimit: 1,
    isPremium: false
  });
  const [isChecking, setIsChecking] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Проверяем подписку на канал
  const checkTelegramSubscription = async () => {
    try {
      // В реальном приложении здесь был бы вызов Telegram Bot API
      // Для демо используем localStorage
      const storedStatus = localStorage.getItem('telegram_subscription');
      const isSubscribed = storedStatus === 'true';
      
      setSubscriptionStatus(prev => ({
        ...prev,
        isSubscribed
      }));
      
      onSubscriptionVerified(isSubscribed);
      return isSubscribed;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  };

  // Проверяем лимит документов
  const checkDocumentLimit = () => {
    const documentsUsed = parseInt(localStorage.getItem('documents_used') || '0');
    const isPremium = localStorage.getItem('is_premium') === 'true';
    
    setSubscriptionStatus(prev => ({
      ...prev,
      documentsUsed,
      isPremium,
      documentsLimit: isPremium ? 999 : 1
    }));

    if (!isPremium && documentsUsed >= 1) {
      onLimitExceeded();
      return false;
    }
    
    return true;
  };

  // Увеличиваем счетчик использованных документов
  const incrementDocumentUsage = () => {
    const currentUsed = parseInt(localStorage.getItem('documents_used') || '0');
    const newUsed = currentUsed + 1;
    localStorage.setItem('documents_used', newUsed.toString());
    
    setSubscriptionStatus(prev => ({
      ...prev,
      documentsUsed: newUsed
    }));

    if (!subscriptionStatus.isPremium && newUsed >= 1) {
      onLimitExceeded();
    }
  };

  // Проверяем подписку при загрузке
  useEffect(() => {
    const initializeSubscription = async () => {
      setIsChecking(true);
      
      const isSubscribed = await checkTelegramSubscription();
      const hasLimit = checkDocumentLimit();
      
      if (!isSubscribed) {
        setShowSubscriptionModal(true);
      }
      
      setIsChecking(false);
    };

    initializeSubscription();
  }, []);

  // Обработчик подписки
  const handleSubscribe = () => {
    // Открываем канал в Telegram
    window.open('https://t.me/fominadvokat', '_blank');
    
    // В реальном приложении здесь была бы проверка через Bot API
    // Для демо просто устанавливаем подписку
    localStorage.setItem('telegram_subscription', 'true');
    setSubscriptionStatus(prev => ({ ...prev, isSubscribed: true }));
    setShowSubscriptionModal(false);
    onSubscriptionVerified(true);
  };

  // Обработчик покупки премиума
  const handleUpgradeToPremium = () => {
    // В реальном приложении здесь была бы интеграция с платежной системой
    alert('Переход к оплате премиум-тарифа...');
  };

  if (isChecking) {
    return (
      <div style={{ 
        padding: '40px 20px', 
        textAlign: 'center',
        background: 'var(--tg-theme-bg-color, #ffffff)',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '5px solid #f3f3f3', 
          borderTop: '5px solid var(--tg-theme-button-color, #2563eb)', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px auto'
        }} />
        <p style={{ 
          color: 'var(--tg-theme-text-color, #111827)', 
          fontSize: '16px', 
          fontWeight: '500' 
        }}>
          Проверяем подписку...
        </p>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  // Модальное окно подписки
  if (showSubscriptionModal) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          background: 'var(--tg-theme-bg-color, #ffffff)',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h2 style={{
            margin: '0 0 16px 0',
            color: 'var(--tg-theme-text-color, #111827)',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            🔒 Доступ ограничен
          </h2>
          
          <p style={{
            margin: '0 0 20px 0',
            color: 'var(--tg-theme-hint-color, #6b7280)',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            Для использования бесплатной услуги необходимо подписаться на канал адвоката
          </p>
          
          <div style={{
            background: 'var(--tg-theme-secondary-bg-color, #f3f4f6)',
            borderRadius: '12px',
            padding: '16px',
            margin: '20px 0',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              margin: '0 0 8px 0',
              color: 'var(--tg-theme-text-color, #111827)',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              📢 Канал адвоката
            </h3>
            <p style={{
              margin: '0 0 12px 0',
              color: 'var(--tg-theme-hint-color, #6b7280)',
              fontSize: '14px'
            }}>
              Получайте актуальную правовую информацию и советы
            </p>
            <a
              href="https://t.me/fominadvokat"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: 'var(--tg-theme-button-color, #2563eb)',
                color: 'var(--tg-theme-button-text-color, #ffffff)',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Подписаться на канал
            </a>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '20px'
          }}>
            <button
              onClick={() => setShowSubscriptionModal(false)}
              style={{
                flex: 1,
                padding: '12px 20px',
                background: 'var(--tg-theme-secondary-bg-color, #f3f4f6)',
                color: 'var(--tg-theme-text-color, #111827)',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Отмена
            </button>
            <button
              onClick={handleSubscribe}
              style={{
                flex: 1,
                padding: '12px 20px',
                background: 'var(--tg-theme-button-color, #2563eb)',
                color: 'var(--tg-theme-button-text-color, #ffffff)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Подписаться
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Проверяем лимит документов
  if (!subscriptionStatus.isPremium && subscriptionStatus.documentsUsed >= subscriptionStatus.documentsLimit) {
    return (
      <div style={{
        padding: '20px',
        background: 'var(--tg-theme-bg-color, #ffffff)',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <h2 style={{
          margin: '0 0 16px 0',
          color: 'var(--tg-theme-text-color, #111827)',
          fontSize: '20px',
          fontWeight: '600'
        }}>
          📊 Лимит исчерпан
        </h2>
        
        <p style={{
          margin: '0 0 20px 0',
          color: 'var(--tg-theme-hint-color, #6b7280)',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          Вы использовали {subscriptionStatus.documentsUsed} из {subscriptionStatus.documentsLimit} бесплатных документов
        </p>
        
        <div style={{
          background: 'var(--tg-theme-secondary-bg-color, #f3f4f6)',
          borderRadius: '12px',
          padding: '16px',
          margin: '20px 0',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{
            margin: '0 0 8px 0',
            color: 'var(--tg-theme-text-color, #111827)',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            💎 Премиум-тариф
          </h3>
          <p style={{
            margin: '0 0 12px 0',
            color: 'var(--tg-theme-hint-color, #6b7280)',
            fontSize: '14px'
          }}>
            Безлимитный доступ ко всем функциям
          </p>
          <button
            onClick={handleUpgradeToPremium}
            style={{
              width: '100%',
              padding: '12px 20px',
              background: 'var(--tg-theme-button-color, #2563eb)',
              color: 'var(--tg-theme-button-text-color, #ffffff)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Перейти на премиум
          </button>
        </div>
        
        <p style={{
          margin: '0',
          color: 'var(--tg-theme-hint-color, #6b7280)',
          fontSize: '12px'
        }}>
          Лимит обновится в следующем месяце
        </p>
      </div>
    );
  }

  // Если все проверки пройдены, показываем контент
  return (
    <div>
      {children}
      {/* Скрытый компонент для управления лимитами */}
      <DocumentLimitManager 
        onDocumentUsed={incrementDocumentUsage}
        subscriptionStatus={subscriptionStatus}
      />
    </div>
  );
};

// Компонент для управления лимитами документов
interface DocumentLimitManagerProps {
  onDocumentUsed: () => void;
  subscriptionStatus: SubscriptionStatus;
}

const DocumentLimitManager: React.FC<DocumentLimitManagerProps> = ({
  onDocumentUsed,
  subscriptionStatus
}) => {
  // Этот компонент будет использоваться для отслеживания использования документов
  return null;
};

export default SubscriptionCheck;
