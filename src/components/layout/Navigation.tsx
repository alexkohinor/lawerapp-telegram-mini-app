'use client';

import * as React from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import {
  Home,
  MessageSquare,
  Scale,
  FileText,
  CreditCard,
  User,
  Settings,
  Menu
} from 'lucide-react';

/**
 * Компонент навигации для LawerApp
 * Основано на UI_COMPONENTS.md и DESIGN_SYSTEM.md
 */

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Главная',
    icon: <Home className="w-5 h-5" />,
    href: '/',
  },
  {
    id: 'consultations',
    label: 'Консультации',
    icon: <MessageSquare className="w-5 h-5" />,
    href: '/consultations',
  },
  {
    id: 'disputes',
    label: 'Споры',
    icon: <Scale className="w-5 h-5" />,
    href: '/disputes',
  },
  {
    id: 'documents',
    label: 'Документы',
    icon: <FileText className="w-5 h-5" />,
    href: '/documents',
  },
  {
    id: 'subscription',
    label: 'Подписка',
    icon: <CreditCard className="w-5 h-5" />,
    href: '/subscription',
  },
  {
    id: 'profile',
    label: 'Профиль',
    icon: <User className="w-5 h-5" />,
    href: '/profile',
  },
];

export function Navigation() {
  const { user, isAuthenticated } = useUser();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Header Navigation */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">LawerApp</h1>
                <p className="text-xs text-gray-600">Правовая помощь</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)}>
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="p-6">
              {/* User Profile */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">@{user?.username || 'user'}</p>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-gray-600">{item.icon}</span>
                    <span className="flex-1 text-gray-900">{item.label}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </a>
                ))}
              </nav>

              {/* Settings */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <a
                  href="/settings"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900">Настройки</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden">
        <div className="flex items-center justify-around">
          {navigationItems.slice(0, 4).map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-0 flex-1"
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-600 truncate w-full text-center">
                {item.label}
              </span>
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}

