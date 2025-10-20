'use client';

import React from 'react';

interface StickyBottomBarProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const StickyBottomBar: React.FC<StickyBottomBarProps> = ({ children, className, style }) => {
  return (
    <div className={`sticky-bottom ${className || ''}`} style={style}>
      <div className="container-narrow" style={{ padding: '0 16px', display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '100%' }}>
        <div style={{ width: '100%', maxWidth: '100%' }}>{children}</div>
      </div>
    </div>
  );
};

export default StickyBottomBar;

