'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export const Tabs: React.FC<TabsProps> = ({ 
  tabs, 
  activeTab, 
  onChange, 
  className = '',
  variant = 'default'
}) => {
  const tabVariants = {
    default: 'border-b border-gray-200',
    pills: 'bg-gray-100 p-1 rounded-lg',
    underline: 'border-b-2 border-gray-200',
  };

  const tabButtonVariants = {
    default: {
      base: 'px-4 py-2 text-sm font-medium border-b-2 border-transparent transition-colors',
      active: 'border-blue-500 text-blue-600',
      inactive: 'text-gray-500 hover:text-gray-700 hover:border-gray-300',
      disabled: 'text-gray-400 cursor-not-allowed',
    },
    pills: {
      base: 'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
      active: 'bg-white text-gray-900 shadow-sm',
      inactive: 'text-gray-600 hover:text-gray-900',
      disabled: 'text-gray-400 cursor-not-allowed',
    },
    underline: {
      base: 'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
      active: 'border-blue-500 text-blue-600',
      inactive: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
      disabled: 'text-gray-400 cursor-not-allowed border-transparent',
    },
  };

  const currentVariant = tabButtonVariants[variant];

  return (
    <div className={cn('tabs', tabVariants[variant], className)}>
      <nav className="flex space-x-8" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isDisabled = tab.disabled;

          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && onChange(tab.id)}
              disabled={isDisabled}
              role="tab"
              aria-selected={isActive}
              aria-disabled={isDisabled}
              className={cn(
                currentVariant.base,
                isActive && currentVariant.active,
                !isActive && !isDisabled && currentVariant.inactive,
                isDisabled && currentVariant.disabled,
                'flex items-center gap-2'
              )}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full',
                    isActive
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Tabs;
