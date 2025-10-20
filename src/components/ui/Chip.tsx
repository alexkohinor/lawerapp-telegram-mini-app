'use client';

import React from 'react';

interface ChipProps {
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export default function Chip({ children, onClick, selected = false, className = '' }: ChipProps) {
  const base = 'chip hit-lg';
  const selStyle: React.CSSProperties | undefined = selected
    ? { background: 'var(--telegram-accent)', color: 'var(--tg-theme-button-text-color, #fff)', borderColor: 'var(--telegram-accent)' }
    : undefined;
  return (
    <button className={`${base} ${className}`} onClick={onClick} style={selStyle}>
      {children}
    </button>
  );
}


