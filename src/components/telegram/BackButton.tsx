'use client';

import { useEffect } from 'react';

interface BackButtonProps {
  isVisible?: boolean;
  onClick?: () => void;
}

export function BackButton({ isVisible = true, onClick }: BackButtonProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      if (isVisible) {
        tg.BackButton.show();
      } else {
        tg.BackButton.hide();
      }
      
      // Обработчик клика
      const handleClick = () => {
        if (onClick) {
          onClick();
        } else {
          // По умолчанию - история браузера
          window.history.back();
        }
      };
      
      tg.BackButton.onClick(handleClick);
      
      // Очистка при размонтировании
      return () => {
        tg.BackButton.offClick(handleClick);
        tg.BackButton.hide();
      };
    }
  }, [isVisible, onClick]);

  return null;
}