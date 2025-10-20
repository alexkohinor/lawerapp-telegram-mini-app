/**
 * E2E tests for authentication flow
 * Основано на TESTING_STRATEGY.md
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Telegram WebApp
    await page.addInitScript(() => {
      window.Telegram = {
        WebApp: {
          initData: 'test-init-data',
          initDataUnsafe: {
            user: {
              id: 123456789,
              first_name: 'Test',
              last_name: 'User',
              username: 'testuser',
              language_code: 'ru',
            },
            auth_date: Date.now(),
            hash: 'test-hash',
          },
          version: '6.0',
          platform: 'web',
          colorScheme: 'light',
          themeParams: {},
          isExpanded: true,
          viewportHeight: 600,
          viewportStableHeight: 600,
          headerColor: '#ffffff',
          backgroundColor: '#ffffff',
          isClosingConfirmationEnabled: false,
          BackButton: {
            isVisible: false,
            onClick: () => {},
            offClick: () => {},
            show: () => {},
            hide: () => {},
          },
          MainButton: {
            text: 'Continue',
            color: '#2481cc',
            textColor: '#ffffff',
            isVisible: false,
            isActive: true,
            isProgressVisible: false,
            setText: () => {},
            onClick: () => {},
            offClick: () => {},
            show: () => {},
            hide: () => {},
            enable: () => {},
            disable: () => {},
            showProgress: () => {},
            hideProgress: () => {},
            setParams: () => {},
          },
          HapticFeedback: {
            impactOccurred: () => {},
            notificationOccurred: () => {},
            selectionChanged: () => {},
          },
          CloudStorage: {
            setItem: () => {},
            getItem: () => {},
            getItems: () => {},
            removeItem: () => {},
            removeItems: () => {},
            getKeys: () => {},
          },
          ready: () => {},
          expand: () => {},
          close: () => {},
          sendData: () => {},
          switchInlineQuery: () => {},
          openLink: () => {},
          openTelegramLink: () => {},
          openInvoice: () => {},
          showPopup: () => {},
          showAlert: () => {},
          showConfirm: () => {},
          showScanQrPopup: () => {},
          closeScanQrPopup: () => {},
          readTextFromClipboard: () => {},
          requestWriteAccess: () => {},
          requestContact: () => {},
        },
      };
    });
  });

  test('should display user information after authentication', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check if user information is displayed
    await expect(page.locator('text=Test User')).toBeVisible();
    await expect(page.locator('text=@testuser')).toBeVisible();

    // Check if navigation is visible
    await expect(page.locator('text=Главная')).toBeVisible();
    await expect(page.locator('text=AI Консультация')).toBeVisible();
    await expect(page.locator('text=Мои споры')).toBeVisible();
  });

  test('should navigate to different pages', async ({ page }) => {
    await page.goto('/');

    // Test navigation to AI Chat
    await page.click('text=AI Консультация');
    await expect(page).toHaveURL('/ai-chat');
    await expect(page.locator('text=AI Консультация')).toBeVisible();

    // Test navigation to Disputes
    await page.click('text=Мои споры');
    await expect(page).toHaveURL('/disputes');
    await expect(page.locator('text=Мои споры')).toBeVisible();

    // Test navigation to Documents
    await page.click('text=Документы');
    await expect(page).toHaveURL('/documents');
    await expect(page.locator('text=Мои Документы')).toBeVisible();

    // Test navigation to Subscription
    await page.click('text=Подписка');
    await expect(page).toHaveURL('/subscription');
    await expect(page.locator('text=Управление подпиской')).toBeVisible();

    // Test navigation to Security
    await page.click('text=Безопасность');
    await expect(page).toHaveURL('/security');
    await expect(page.locator('text=Безопасность')).toBeVisible();
  });

  test('should handle mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check if mobile navigation is visible
    await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();

    // Test mobile navigation
    await page.click('[data-testid="mobile-nav-ai-chat"]');
    await expect(page).toHaveURL('/ai-chat');

    await page.click('[data-testid="mobile-nav-disputes"]');
    await expect(page).toHaveURL('/disputes');
  });

  test('should display user menu', async ({ page }) => {
    await page.goto('/');

    // Click on user menu button
    await page.click('[data-testid="user-menu-button"]');

    // Check if user menu is visible
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('text=Test User')).toBeVisible();
    await expect(page.locator('text=@testuser')).toBeVisible();

    // Test menu items
    await expect(page.locator('text=Настройки')).toBeVisible();
  });

  test('should handle unauthenticated access', async ({ page }) => {
    // Mock unauthenticated state
    await page.addInitScript(() => {
      window.Telegram = {
        WebApp: {
          initData: '',
          initDataUnsafe: {
            user: undefined,
            auth_date: 0,
            hash: '',
          },
          version: '6.0',
          platform: 'web',
          colorScheme: 'light',
          themeParams: {},
          isExpanded: true,
          viewportHeight: 600,
          viewportStableHeight: 600,
          headerColor: '#ffffff',
          backgroundColor: '#ffffff',
          isClosingConfirmationEnabled: false,
          BackButton: {
            isVisible: false,
            onClick: () => {},
            offClick: () => {},
            show: () => {},
            hide: () => {},
          },
          MainButton: {
            text: 'Continue',
            color: '#2481cc',
            textColor: '#ffffff',
            isVisible: false,
            isActive: true,
            isProgressVisible: false,
            setText: () => {},
            onClick: () => {},
            offClick: () => {},
            show: () => {},
            hide: () => {},
            enable: () => {},
            disable: () => {},
            showProgress: () => {},
            hideProgress: () => {},
            setParams: () => {},
          },
          HapticFeedback: {
            impactOccurred: () => {},
            notificationOccurred: () => {},
            selectionChanged: () => {},
          },
          CloudStorage: {
            setItem: () => {},
            getItem: () => {},
            getItems: () => {},
            removeItem: () => {},
            removeItems: () => {},
            getKeys: () => {},
          },
          ready: () => {},
          expand: () => {},
          close: () => {},
          sendData: () => {},
          switchInlineQuery: () => {},
          openLink: () => {},
          openTelegramLink: () => {},
          openInvoice: () => {},
          showPopup: () => {},
          showAlert: () => {},
          showConfirm: () => {},
          showScanQrPopup: () => {},
          closeScanQrPopup: () => {},
          readTextFromClipboard: () => {},
          requestWriteAccess: () => {},
          requestContact: () => {},
        },
      };
    });

    await page.goto('/');

    // Check if authentication message is displayed
    await expect(page.locator('text=Для доступа к приложению необходимо авторизоваться через Telegram')).toBeVisible();
  });
});
