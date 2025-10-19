'use client';

import React, { useEffect } from 'react';

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
      
      const handleClick = () => {
        if (onClick) {
          onClick();
        } else {
          window.history.back();
        }
      };
      
      tg.BackButton.onClick(handleClick);
      
      return () => {
        tg.BackButton.offClick(handleClick);
        tg.BackButton.hide();
      };
    }
  }, [isVisible, onClick]);

  return null;
}
