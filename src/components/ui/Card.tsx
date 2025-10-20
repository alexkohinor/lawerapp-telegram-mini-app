'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  hover = false,
  onClick,
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };
  
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';
  
  const combinedClassName = `
    bg-white rounded-lg border border-gray-200
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${hoverClass}
    ${clickableClass}
    ${className}
  `;
  
  return (
    <div className={combinedClassName} onClick={onClick}>
      {children}
    </div>
  );
};
