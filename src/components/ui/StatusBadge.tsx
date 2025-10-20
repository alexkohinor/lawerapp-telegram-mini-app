'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const badgeVariants = {
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  default: 'bg-gray-100 text-gray-800 border-gray-200',
};

const badgeSizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-2.5 py-1.5 text-sm',
  lg: 'px-3 py-2 text-base',
};

const Badge: React.FC<{
  variant: 'success' | 'warning' | 'danger' | 'info' | 'default';
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ 
  variant = 'default', 
  children, 
  className = '',
  size = 'md'
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className = '' 
}) => {
  const statusConfig = {
    ACTIVE: { variant: 'info' as const, label: 'Активный' },
    PENDING: { variant: 'warning' as const, label: 'В ожидании' },
    RESOLVED: { variant: 'success' as const, label: 'Решен' },
    CLOSED: { variant: 'default' as const, label: 'Закрыт' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.CLOSED;

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;