'use client';

import React, { useEffect, useRef } from 'react';

interface MainButtonProps {
  text: string;
  color?: string;
  textColor?: string;
  isActive?: boolean;
  isVisible?: boolean;
  onClick?: () => void;
}

export function MainButton({ 
  text, 
  color, 
  textColor, 
  isActive = true, 
  isVisible = true,
  onClick 
}: MainButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Настраиваем главную кнопку
      tg.MainButton.setText(text);
      tg.MainButton.setParams({
        color: color || '#2481cc',
        text_color: textColor || '#ffffff',
      });
      
      if (isVisible) {
        tg.MainButton.show();
      } else {
        tg.MainButton.hide();
      }
      
      if (isActive) {
        tg.MainButton.enable();
      } else {
        tg.MainButton.disable();
      }
      
      // Обработчик клика
      const handleClick = () => {
        if (onClick && isActive) {
          onClick();
        }
      };
      
      tg.MainButton.onClick(handleClick);
      
      // Очистка при размонтировании
      return () => {
        tg.MainButton.offClick(handleClick);
        tg.MainButton.hide();
      };
    }
  }, [text, color, textColor, isActive, isVisible, onClick]);

  // Скрытый элемент для совместимости
  return <button ref={buttonRef} style={{ display: 'none' }} />;
}