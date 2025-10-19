'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  MessageSquare, 
  Scale, 
  FileText, 
  CreditCard, 
  Settings,
  BarChart3,
  Bell
} from 'lucide-react';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = '' }: NavigationProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      name: 'Главная',
      href: '/',
      icon: Home,
      current: pathname === '/'
    },
    {
      name: 'Консультации',
      href: '/consultations',
      icon: MessageSquare,
      current: pathname === '/consultations'
    },
    {
      name: 'Споры',
      href: '/disputes',
      icon: Scale,
      current: pathname === '/disputes'
    },
    {
      name: 'Документы',
      href: '/documents',
      icon: FileText,
      current: pathname === '/documents'
    },
    {
      name: 'Платежи',
      href: '/payments',
      icon: CreditCard,
      current: pathname === '/payments'
    },
    {
      name: 'Мониторинг',
      href: '/monitoring',
      icon: BarChart3,
      current: pathname === '/monitoring'
    },
    {
      name: 'Алерты',
      href: '/alerts',
      icon: Bell,
      current: pathname === '/alerts'
    },
    {
      name: 'Настройки',
      href: '/settings',
      icon: Settings,
      current: pathname === '/settings'
    }
  ];

  return (
    <nav className={`bg-white shadow-sm border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                LawerApp
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      item.current
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Telegram Mini App
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  item.current
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-3" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}