'use client';

import React, { useState, useEffect } from 'react';

interface SubscriptionStatusProps {
  className?: string;
}

interface StatusData {
  isSubscribed: boolean;
  documentsUsed: number;
  documentsLimit: number;
  isPremium: boolean;
  daysUntilReset: number;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<StatusData>({
    isSubscribed: false,
    documentsUsed: 0,
    documentsLimit: 1,
    isPremium: false,
    daysUntilReset: 30
  });

  useEffect(() => {
    const updateStatus = () => {
      const isSubscribed = localStorage.getItem('telegram_subscription') === 'true';
      const documentsUsed = parseInt(localStorage.getItem('documents_used') || '0');
      const isPremium = localStorage.getItem('is_premium') === 'true';
      
      // Вычисляем дни до сброса лимита (каждый месяц)
      const lastReset = localStorage.getItem('last_reset_date');
      const now = new Date();
      const resetDate = lastReset ? new Date(lastReset) : new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const daysUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      setStatus({
        isSubscribed,
        documentsUsed,
        documentsLimit: isPremium ? 999 : 1,
        isPremium,
        daysUntilReset: Math.max(0, daysUntilReset)
      });
    };

    updateStatus();
    
    // Обновляем статус каждые 30 секунд
    const interval = setInterval(updateStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleUpgrade = () => {
    // В реальном приложении здесь была бы интеграция с платежной системой
    alert('Переход к оплате премиум-тарифа...');
  };

  const handleResetLimit = () => {
    // Сбрасываем лимит (для демо)
    localStorage.setItem('documents_used', '0');
    localStorage.setItem('last_reset_date', new Date().toISOString());
    setStatus(prev => ({ ...prev, documentsUsed: 0 }));
  };

  if (!status.isSubscribed) {
    return (
      <div className={`subscription-status ${className}`} style={{
        padding: '12px 16px',
        background: 'var(--tg-theme-secondary-bg-color, #f3f4f6)',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        margin: '8px 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🔒</span>
          <div style={{ flex: 1 }}>
            <p style={{ 
              margin: '0 0 4px 0', 
              fontSize: '14px', 
              fontWeight: '500',
              color: 'var(--tg-theme-text-color, #111827)'
            }}>
              Подписка не активна
            </p>
            <p style={{ 
              margin: '0', 
              fontSize: '12px', 
              color: 'var(--tg-theme-hint-color, #6b7280)'
            }}>
              Подпишитесь на канал для доступа к услугам
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status.isPremium) {
    return (
      <div className={`subscription-status ${className}`} style={{
        padding: '12px 16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '8px',
        border: '1px solid #667eea',
        margin: '8px 0',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>💎</span>
          <div style={{ flex: 1 }}>
            <p style={{ 
              margin: '0 0 4px 0', 
              fontSize: '14px', 
              fontWeight: '500'
            }}>
              Премиум-аккаунт
            </p>
            <p style={{ 
              margin: '0', 
              fontSize: '12px', 
              opacity: 0.9
            }}>
              Безлимитный доступ ко всем функциям
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`subscription-status ${className}`} style={{
      padding: '12px 16px',
      background: 'var(--tg-theme-bg-color, #ffffff)',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      margin: '8px 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>📊</span>
          <div>
            <p style={{ 
              margin: '0 0 4px 0', 
              fontSize: '14px', 
              fontWeight: '500',
              color: 'var(--tg-theme-text-color, #111827)'
            }}>
              Документов использовано: {status.documentsUsed}/{status.documentsLimit}
            </p>
            <p style={{ 
              margin: '0', 
              fontSize: '12px', 
              color: 'var(--tg-theme-hint-color, #6b7280)'
            }}>
              Лимит обновится через {status.daysUntilReset} дней
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {status.documentsUsed >= status.documentsLimit && (
            <button
              onClick={handleResetLimit}
              style={{
                padding: '6px 12px',
                background: 'var(--tg-theme-secondary-bg-color, #f3f4f6)',
                color: 'var(--tg-theme-text-color, #111827)',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Сбросить
            </button>
          )}
          
          <button
            onClick={handleUpgrade}
            style={{
              padding: '6px 12px',
              background: 'var(--tg-theme-button-color, #2563eb)',
              color: 'var(--tg-theme-button-text-color, #ffffff)',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Премиум
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div style={{
        marginTop: '8px',
        width: '100%',
        height: '4px',
        background: 'var(--tg-theme-secondary-bg-color, #f3f4f6)',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${(status.documentsUsed / status.documentsLimit) * 100}%`,
          height: '100%',
          background: status.documentsUsed >= status.documentsLimit 
            ? '#ef4444' 
            : 'var(--tg-theme-button-color, #2563eb)',
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
};

export default SubscriptionStatus;
