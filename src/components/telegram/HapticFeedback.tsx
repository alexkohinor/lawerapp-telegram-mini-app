'use client';

import React from 'react';

interface HapticFeedbackProps {
  children: React.ReactNode;
  type?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
  onTap?: () => void;
}

export function HapticFeedback({ 
  children, 
  type = 'light', 
  onTap 
}: HapticFeedbackProps) {
  const handleTap = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      const tg = window.Telegram.WebApp;
      
      switch (type) {
        case 'light':
          tg.HapticFeedback.impactOccurred('light');
          break;
        case 'medium':
          tg.HapticFeedback.impactOccurred('medium');
          break;
        case 'heavy':
          tg.HapticFeedback.impactOccurred('heavy');
          break;
        case 'rigid':
          tg.HapticFeedback.impactOccurred('rigid');
          break;
        case 'soft':
          tg.HapticFeedback.impactOccurred('soft');
          break;
      }
    }
    
    if (onTap) {
      onTap();
    }
  };

  return (
    <div onClick={handleTap} style={{ cursor: 'pointer' }}>
      {children}
    </div>
  );
}
