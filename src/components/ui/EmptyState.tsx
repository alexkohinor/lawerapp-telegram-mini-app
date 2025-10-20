'use client';

import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '⚠️',
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 24 }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      {description && (
        <div className="text-muted" style={{ marginBottom: 16 }}>{description}</div>
      )}
      {actionText && onAction && (
        <Button onClick={onAction}>{actionText}</Button>
      )}
    </div>
  );
};

export default EmptyState;

