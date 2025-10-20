'use client';

import React, { useRef } from 'react';

interface ComposerProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (v: string) => void;
  onSend: () => void;
}

export default function Composer({ value, placeholder, disabled, onChange, onSend }: ComposerProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const autoGrow = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => { onChange(e.target.value); autoGrow(); }}
        placeholder={placeholder}
        style={{
          flex: 1,
          resize: 'none',
          maxHeight: 160,
          padding: '10px 12px',
          borderRadius: 12,
          border: '1px solid var(--telegram-border)'
        }}
      />
      <button
        className="btn-primary"
        onClick={onSend}
        disabled={!value.trim() || !!disabled}
        style={{ minWidth: 120, maxWidth: '40%' }}
      >
        Отправить
      </button>
    </div>
  );
}


