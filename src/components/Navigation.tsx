'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Главная', icon: '🏠' },
    { href: '/tax-disputes', label: 'Налоги', icon: '🚗' },
    { href: '/consultations', label: 'AI Юрист', icon: '🤖' },
    { href: '/documents', label: 'Документы', icon: '📄' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--tg-theme-bg-color,#ffffff)] border-t border-gray-200 z-50">
      <div className="max-w-4xl mx-auto px-2">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-3 px-2 transition-colors ${
                  isActive
                    ? 'text-[var(--tg-theme-button-color,#2563eb)]'
                    : 'text-[var(--tg-theme-hint-color,#999999)]'
                }`}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

