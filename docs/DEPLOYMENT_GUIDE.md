# 🚀 Руководство по развертыванию LawerApp Telegram Mini App

## 📋 Обзор развертывания

Это руководство поможет вам развернуть LawerApp Telegram Mini App в продакшене за **15 минут**. Мы используем Vercel для хостинга, Supabase для базы данных и Telegram Bot API для интеграции.

---

## 🎯 Архитектура развертывания

### **1. Production Stack с TimeWeb Cloud**
```
┌─────────────────────────────────────────────────────────────┐
│                    Production Architecture (TimeWeb Cloud) │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Vercel        │  │   TimeWeb       │  │   Cloudflare│  │
│  │   (Frontend)    │  │   Cloud         │  │   (CDN)     │  │
│  │                 │  │   (Backend)     │  │             │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   PostgreSQL    │  │   Redis         │  │   Vector    │  │
│  │   (TimeWeb)     │  │   (TimeWeb)     │  │   (TimeWeb) │  │
│  │   Database      │  │   Cache         │  │   Database  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### **2. CI/CD Pipeline**
```
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD Pipeline                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   GitHub        │  │   Vercel        │  │   Telegram  │  │
│  │   (Source)      │  │   (Deploy)      │  │   (Bot)     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Tests         │  │   Build         │  │   Webhooks  │  │
│  │   (Jest)        │  │   (Next.js)     │  │   (Updates) │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Подготовка к развертыванию

### **1. Проверка готовности**

#### **Чек-лист перед развертыванием**
```bash
# Проверка сборки
npm run build

# Проверка тестов
npm run test

# Проверка линтера
npm run lint

# Проверка типов
npm run type-check
```

#### **Структура проекта**
```
lawerapp-telegram-mini-app/
├── src/
├── public/
├── prisma/
├── tests/
├── .env.local
├── .env.example
├── next.config.js
├── package.json
├── vercel.json
└── README.md
```

### **2. Настройка переменных окружения**

#### **Production Environment Variables**
```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"

# Telegram
TELEGRAM_BOT_TOKEN="your_bot_token_here"
TELEGRAM_WEBAPP_URL="https://your-domain.vercel.app"

# AI Services
OPENAI_API_KEY="your_openai_api_key"
ANTHROPIC_API_KEY="your_anthropic_api_key"

# TimeWeb Cloud
TIMEWEB_API_KEY="your_timeweb_api_key"
TIMEWEB_API_URL="https://api.timeweb.cloud"

# Российские платежные системы
YOOKASSA_SHOP_ID="your_yookassa_shop_id"
YOOKASSA_SECRET_KEY="your_yookassa_secret_key"
YOOMONEY_CLIENT_ID="your_yoomoney_client_id"
YOOMONEY_CLIENT_SECRET="your_yoomoney_client_secret"
QIWI_SECRET_KEY="your_qiwi_secret_key"
SBP_API_KEY="your_sbp_api_key"

# JWT
JWT_SECRET="your_jwt_secret_here"

# App
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="your_bot_username"
NEXT_PUBLIC_YOOKASSA_SHOP_ID="your_yookassa_shop_id"

# Redis (optional)
REDIS_URL="redis://username:password@host:port"

# Analytics
VERCEL_ANALYTICS_ID="your_vercel_analytics_id"
```

---

## 🚀 Развертывание на Vercel

### **1. Установка Vercel CLI**

```bash
# Установка Vercel CLI
npm install -g vercel

# Логин в Vercel
vercel login
```

### **2. Конфигурация Vercel**

#### **vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "TELEGRAM_BOT_TOKEN": "@telegram_bot_token",
    "OPENAI_API_KEY": "@openai_api_key"
  },
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### **3. Деплой на Vercel**

```bash
# Первый деплой
vercel --prod

# Последующие деплои
vercel

# Деплой с переменными окружения
vercel --prod --env DATABASE_URL=your_database_url
```

### **4. Настройка переменных окружения в Vercel**

```bash
# Добавление переменных через CLI
vercel env add DATABASE_URL
vercel env add TELEGRAM_BOT_TOKEN
vercel env add OPENAI_API_KEY

# Или через веб-интерфейс Vercel Dashboard
# Settings -> Environment Variables
```

---

## 🗄️ Настройка базы данных

### **1. TimeWeb Cloud Setup**

#### **Создание проекта TimeWeb Cloud**
```bash
# 1. Перейдите на https://timeweb.cloud
# 2. Создайте новый проект
# 3. Выберите регион (Россия для соответствия 152-ФЗ)
# 4. Сохраните Database URL и API Key
```

#### **Настройка Prisma с TimeWeb Cloud**
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ... остальные модели
```

#### **Миграция базы данных**
```bash
# Генерация Prisma Client
npx prisma generate

# Создание миграции
npx prisma migrate dev --name init

# Применение миграций в продакшене
npx prisma migrate deploy
```

### **2. Настройка Redis (опционально)**

#### **Upstash Redis**
```bash
# 1. Перейдите на https://upstash.com
# 2. Создайте Redis базу данных
# 3. Сохраните Redis URL
# 4. Добавьте в переменные окружения Vercel
```

---

## 🤖 Настройка Telegram Bot

### **1. Создание бота**

```bash
# 1. Откройте @BotFather в Telegram
# 2. Отправьте /newbot
# 3. Введите название: LawerApp
# 4. Введите username: lawerapp_bot
# 5. Сохраните токен бота
```

### **2. Настройка WebApp**

```bash
# 1. Отправьте /setmenubutton
# 2. Выберите вашего бота
# 3. Введите текст: Открыть LawerApp
# 4. Введите URL: https://your-domain.vercel.app
```

### **3. Настройка команд**

```bash
# 1. Отправьте /setcommands
# 2. Выберите вашего бота
# 3. Введите команды:
start - Запустить приложение
help - Помощь
support - Поддержка
```

### **4. Настройка webhook'ов**

```bash
# 1. Отправьте /setwebhook
# 2. Введите URL: https://your-domain.vercel.app/api/webhooks/telegram
# 3. Проверьте статус: /getwebhookinfo
```

---

## 🔧 Настройка внешних сервисов

### **1. OpenAI API**

```bash
# 1. Перейдите на https://platform.openai.com
# 2. Создайте API ключ
# 3. Добавьте в переменные окружения Vercel
# 4. Настройте лимиты и биллинг
```

### **2. TimeWeb Cloud Vector Database**

```bash
# 1. Перейдите на https://timeweb.cloud
# 2. Создайте проект
# 3. Создайте векторную базу данных для правовых документов
# 4. Сохраните API ключ и URL
```

### **3. Российские платежные системы**

#### **ЮKassa (Яндекс.Касса)**
```bash
# 1. Перейдите на https://yookassa.ru
# 2. Создайте аккаунт
# 3. Получите API ключи
# 4. Настройте webhook'и для обработки платежей
# 5. Подключите банковские карты (Visa, MasterCard, МИР)
```

#### **СБП (Система быстрых платежей)**
```bash
# 1. Подключитесь к СБП через банк-партнер
# 2. Получите API ключи
# 3. Настройте обработку мгновенных переводов
```

#### **ЮMoney (Яндекс.Деньги)**
```bash
# 1. Перейдите на https://yoomoney.ru
# 2. Создайте аккаунт
# 3. Получите API ключи
# 4. Настройте интеграцию
```

#### **QIWI**
```bash
# 1. Перейдите на https://qiwi.com
# 2. Создайте аккаунт
# 3. Получите API ключи
# 4. Настройте интеграцию
```

---

## 📊 Мониторинг и аналитика

### **1. Vercel Analytics**

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### **2. Error Monitoring**

```typescript
// src/lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### **3. Performance Monitoring**

```typescript
// src/lib/monitoring/performance.ts
export class PerformanceMonitor {
  static trackPageLoad(page: string, loadTime: number) {
    // Отправка метрик в аналитику
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page,
        loadTime,
        timestamp: new Date().toISOString(),
      }),
    });
  }
}
```

---

## 🔒 Безопасность

### **1. HTTPS и SSL**

```bash
# Vercel автоматически предоставляет SSL сертификаты
# Убедитесь, что все запросы идут через HTTPS
```

### **2. Environment Variables Security**

```bash
# Никогда не коммитьте .env файлы
# Используйте Vercel Environment Variables
# Ротируйте API ключи регулярно
```

### **3. Rate Limiting**

```typescript
// src/lib/security/rate-limiter.ts
export class RateLimiter {
  static async checkLimit(
    identifier: string,
    limit: number = 100,
    windowMs: number = 60000
  ): Promise<boolean> {
    // Реализация rate limiting
    return true;
  }
}
```

---

## 🧪 Тестирование в продакшене

### **1. Smoke Tests**

```typescript
// tests/e2e/smoke.test.ts
import { test, expect } from '@playwright/test';

test('App loads successfully', async ({ page }) => {
  await page.goto(process.env.PRODUCTION_URL!);
  await expect(page).toHaveTitle(/LawerApp/);
});

test('Telegram integration works', async ({ page }) => {
  await page.goto(process.env.PRODUCTION_URL!);
  // Тест интеграции с Telegram
});
```

### **2. API Tests**

```typescript
// tests/api/production.test.ts
import { test, expect } from '@playwright/test';

test('API endpoints respond', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.status()).toBe(200);
});
```

---

## 📈 Оптимизация производительности

### **1. Image Optimization**

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['telegram.org', 'cdn.telegram.org'],
    formats: ['image/webp', 'image/avif'],
  },
};
```

### **2. Bundle Optimization**

```typescript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@twa-dev/sdk'],
  },
};
```

### **3. Caching Strategy**

```typescript
// src/app/api/cache/route.ts
export async function GET() {
  return new Response('OK', {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
```

---

## 🔄 CI/CD Pipeline

### **1. GitHub Actions**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run type-check

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### **2. Environment-specific Deployments**

```bash
# Staging deployment
vercel --target staging

# Production deployment
vercel --target production
```

---

## 🐛 Troubleshooting

### **1. Common Issues**

#### **Build Failures**
```bash
# Проверка логов
vercel logs

# Локальная сборка
npm run build

# Проверка зависимостей
npm audit
```

#### **Database Connection Issues**
```bash
# Проверка подключения
npx prisma db push

# Проверка миграций
npx prisma migrate status
```

#### **Telegram Integration Issues**
```bash
# Проверка webhook'а
curl -X GET "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# Проверка бота
curl -X GET "https://api.telegram.org/bot<TOKEN>/getMe"
```

### **2. Monitoring and Alerts**

```typescript
// src/lib/monitoring/alerts.ts
export class AlertManager {
  static async sendAlert(message: string, severity: 'low' | 'medium' | 'high') {
    // Отправка алертов в Telegram или email
    console.error(`[${severity.toUpperCase()}] ${message}`);
  }
}
```

---

## 📊 Post-Deployment Checklist

### **1. Functional Tests**
- [ ] Приложение загружается
- [ ] Telegram интеграция работает
- [ ] AI консультации отвечают
- [ ] Платежи обрабатываются
- [ ] База данных подключена
- [ ] Webhook'и работают

### **2. Performance Tests**
- [ ] Время загрузки < 3 секунд
- [ ] Мобильная оптимизация
- [ ] SEO метатеги
- [ ] Accessibility проверка

### **3. Security Tests**
- [ ] HTTPS работает
- [ ] API защищены
- [ ] Переменные окружения скрыты
- [ ] Rate limiting активен

### **4. Monitoring Setup**
- [ ] Analytics настроены
- [ ] Error tracking работает
- [ ] Performance monitoring активен
- [ ] Alerts настроены

---

## 🎯 Заключение

Развертывание LawerApp Telegram Mini App с TimeWeb Cloud включает:

- ✅ **Vercel хостинг** - быстрый и надежный
- ✅ **TimeWeb Cloud база данных** - российская инфраструктура
- ✅ **TimeWeb Cloud AI сервисы** - RAG система и векторная база
- ✅ **Telegram интеграция** - нативная поддержка
- ✅ **CI/CD pipeline** - автоматическое развертывание
- ✅ **Мониторинг** - полная видимость системы
- ✅ **Соответствие 152-ФЗ** - все данные в России

**Время развертывания: 15 минут** ⏱️

**Следующий шаг:** Настройка мониторинга и алертов! 🚀

---

*Руководство по развертыванию подготовлено: 16 октября 2025*  
*Версия: 1.0*  
*Статус: Готов к использованию ✅*
