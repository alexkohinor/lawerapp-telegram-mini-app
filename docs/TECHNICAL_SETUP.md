# ⚙️ Техническая настройка LawerApp Telegram Mini App

## 📋 Обзор настройки

Это руководство поможет вам настроить полное окружение разработки для LawerApp Telegram Mini App за **30 минут**.

---

## 🚀 Быстрый старт (5 минут)

### **1. Создание проекта**
```bash
# Создание Next.js проекта
npx create-next-app@latest lawerapp-telegram-mini-app --typescript --tailwind --app --src-dir --import-alias "@/*"

# Переход в директорию
cd lawerapp-telegram-mini-app

# Установка основных зависимостей
npm install @twa-dev/sdk zustand @prisma/client prisma zod @hookform/resolvers react-hook-form
npm install axios # для TimeWeb Cloud интеграции
npm install @radix-ui/react-slot @radix-ui/react-dialog
npm install class-variance-authority clsx tailwind-merge

# Российские платежные системы
npm install yookassa-sdk yoomoney-sdk qiwi-sdk
```

### **2. Настройка Telegram Bot**
```bash
# 1. Откройте @BotFather в Telegram
# 2. Отправьте команду /newbot
# 3. Следуйте инструкциям для создания бота
# 4. Сохраните токен бота
```

### **3. Запуск в режиме разработки**
```bash
npm run dev
```

**Готово!** Проект запущен на `http://localhost:3000`

---

## 🛠️ Детальная настройка

### **1. Структура проекта**

```bash
lawerapp-telegram-mini-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes
│   │   ├── (dashboard)/       # Dashboard routes
│   │   ├── api/               # API routes
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/            # React Components
│   │   ├── ui/               # Base UI components
│   │   ├── forms/            # Form components
│   │   ├── layout/           # Layout components
│   │   └── features/         # Feature components
│   ├── lib/                  # Core libraries
│   │   ├── auth/            # Authentication
│   │   ├── database/        # Database layer
│   │   ├── ai/              # AI services
│   │   ├── telegram/        # Telegram integration
│   │   ├── utils/           # Utilities
│   │   └── types/           # TypeScript types
│   ├── hooks/               # Custom React hooks
│   ├── store/               # State management
│   └── styles/              # Styling
├── public/                  # Static assets
├── prisma/                  # Database schema
├── tests/                   # Test files
├── .env.local              # Environment variables
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
└── package.json
```

### **2. Установка зависимостей**

#### **Основные зависимости**
```bash
# Core framework
npm install next@latest react@latest react-dom@latest

# TypeScript
npm install -D typescript @types/react @types/node @types/react-dom

# Styling
npm install tailwindcss postcss autoprefixer
npm install -D @tailwindcss/forms @tailwindcss/typography

# State management
npm install zustand

# Forms and validation
npm install react-hook-form @hookform/resolvers zod

# Database
npm install @prisma/client prisma

# Telegram integration
npm install @twa-dev/sdk

# AI services
npm install openai

# TimeWeb Cloud integration
npm install axios

# Российские платежные системы
npm install yookassa-sdk
npm install yoomoney-sdk
npm install qiwi-sdk

# Utilities
npm install clsx tailwind-merge
npm install date-fns
npm install uuid
npm install -D @types/uuid
```

#### **Dev dependencies**
```bash
# Code quality
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D prettier eslint-config-prettier eslint-plugin-prettier

# Testing
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D jest-environment-jsdom

# Development tools
npm install -D @types/node
npm install -D husky lint-staged
```

### **3. Конфигурация TypeScript**

#### **tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### **4. Конфигурация Tailwind CSS**

#### **tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        telegram: {
          bg: 'var(--tg-theme-bg-color)',
          text: 'var(--tg-theme-text-color)',
          hint: 'var(--tg-theme-hint-color)',
          link: 'var(--tg-theme-link-color)',
          button: 'var(--tg-theme-button-color)',
          'button-text': 'var(--tg-theme-button-text-color)',
          secondary: 'var(--tg-theme-secondary-bg-color)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### **5. Конфигурация Next.js**

#### **next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['telegram.org', 'cdn.telegram.org'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### **6. Настройка базы данных**

#### **Prisma schema**
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  telegramId String  @unique
  username  String?
  firstName String?
  lastName  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  disputes Dispute[]
  
  @@map("users")
}

model Dispute {
  id          String      @id @default(cuid())
  title       String
  description String
  type        DisputeType
  status      DisputeStatus @default(ACTIVE)
  amount      Float?
  deadline    DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  documents   Document[]
  
  @@map("disputes")
}

model Document {
  id        String       @id @default(cuid())
  title     String
  content   String
  type      DocumentType
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
  
  disputeId String
  dispute   Dispute      @relation(fields: [disputeId], references: [id], onDelete: Cascade)
  
  @@map("documents")
}

enum DisputeType {
  CONSUMER_RIGHTS
  CONTRACT_DISPUTE
  SERVICE_QUALITY
  DELIVERY_ISSUE
  OTHER
}

enum DisputeStatus {
  ACTIVE
  RESOLVED
  CLOSED
  ESCALATED
}

enum DocumentType {
  CLAIM
  COMPLAINT
  CONTRACT
  OTHER
}
```

#### **Инициализация Prisma**
```bash
# Генерация Prisma Client
npx prisma generate

# Создание миграции
npx prisma migrate dev --name init

# Просмотр базы данных
npx prisma studio
```

### **7. Переменные окружения**

#### **.env.local**
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/lawerapp"

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
```

### **8. Настройка Telegram Bot**

#### **Создание бота**
```bash
# 1. Откройте @BotFather в Telegram
# 2. Отправьте /newbot
# 3. Введите название бота: LawerApp
# 4. Введите username: lawerapp_bot
# 5. Сохраните токен бота
```

#### **Настройка WebApp**
```bash
# 1. Отправьте /setmenubutton
# 2. Выберите вашего бота
# 3. Введите текст кнопки: Открыть LawerApp
# 4. Введите URL: https://your-domain.vercel.app
```

#### **Настройка команд**
```bash
# 1. Отправьте /setcommands
# 2. Выберите вашего бота
# 3. Введите команды:
start - Запустить приложение
help - Помощь
support - Поддержка
```

### **9. Базовая интеграция с Telegram**

#### **Telegram Provider**
```typescript
// src/lib/telegram/telegram-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { WebApp } from '@twa-dev/sdk';

interface TelegramContextType {
  webApp: typeof WebApp;
  user: any;
  isReady: boolean;
}

const TelegramContext = createContext<TelegramContextType | null>(null);

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const webApp = WebApp;
      
      webApp.ready();
      webApp.expand();
      
      setUser(webApp.initDataUnsafe.user);
      setIsReady(true);
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ webApp: WebApp, user, isReady }}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider');
  }
  return context;
};
```

#### **Главный layout**
```typescript
// src/app/layout.tsx
import { Inter } from 'next/font/google';
import { TelegramProvider } from '@/lib/telegram/telegram-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'LawerApp - Правовая помощь',
  description: 'AI-консультации и управление спорами в Telegram',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <TelegramProvider>
          {children}
        </TelegramProvider>
      </body>
    </html>
  );
}
```

### **10. Базовая главная страница**

#### **Главная страница**
```typescript
// src/app/page.tsx
'use client';

import { useTelegram } from '@/lib/telegram/telegram-provider';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, isReady } = useTelegram();

  useEffect(() => {
    if (isReady && user) {
      console.log('Telegram user:', user);
    }
  }, [isReady, user]);

  return (
    <div className="min-h-screen bg-telegram-bg text-telegram-text p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          Добро пожаловать в LawerApp!
        </h1>
        
        {user && (
          <div className="bg-telegram-secondary p-4 rounded-lg mb-4">
            <p>Привет, {user.first_name}!</p>
            <p className="text-sm text-telegram-hint">
              ID: {user.id}
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          <button className="w-full bg-telegram-button text-telegram-button-text p-4 rounded-lg">
            Создать спор
          </button>
          
          <button className="w-full bg-telegram-button text-telegram-button-text p-4 rounded-lg">
            AI Консультация
          </button>
          
          <button className="w-full bg-telegram-button text-telegram-button-text p-4 rounded-lg">
            Мои споры
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🧪 Тестирование настройки

### **1. Проверка Telegram интеграции**
```bash
# 1. Откройте вашего бота в Telegram
# 2. Нажмите /start
# 3. Нажмите кнопку "Открыть LawerApp"
# 4. Убедитесь, что приложение открывается
# 5. Проверьте, что данные пользователя отображаются
```

### **2. Проверка базы данных**
```bash
# Запуск Prisma Studio
npx prisma studio

# Проверка подключения
npx prisma db push
```

### **3. Настройка российских платежных систем**

#### **ЮKassa (Яндекс.Касса)**
```bash
# 1. Перейдите на https://yookassa.ru
# 2. Создайте аккаунт
# 3. Получите Shop ID и Secret Key
# 4. Добавьте в переменные окружения
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
# 3. Получите Client ID и Client Secret
# 4. Настройте интеграцию
```

#### **QIWI**
```bash
# 1. Перейдите на https://qiwi.com
# 2. Создайте аккаунт
# 3. Получите Secret Key
# 4. Настройте интеграцию
```

### **4. Проверка AI интеграции с TimeWeb Cloud**
```typescript
// Тестовый API endpoint
// src/app/api/test-ai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    // Тест TimeWeb Cloud AI API
    const response = await axios.post(`${process.env.TIMEWEB_API_URL}/v1/chat/completions`, {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Ты - помощник по правовым вопросам."
        },
        {
          role: "user",
          content: message
        }
      ],
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.TIMEWEB_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json({
      response: response.data.choices[0].message.content
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get AI response from TimeWeb Cloud' },
      { status: 500 }
    );
  }
}
```

---

## 🚀 Деплой

### **1. Подготовка к деплою**
```bash
# Сборка проекта
npm run build

# Проверка сборки
npm run start
```

### **2. Деплой на Vercel**
```bash
# Установка Vercel CLI
npm install -g vercel

# Логин в Vercel
vercel login

# Деплой
vercel --prod
```

### **3. Настройка переменных окружения в Vercel**
```bash
# В панели Vercel добавьте все переменные из .env.local
# Особенно важно:
# - DATABASE_URL
# - TELEGRAM_BOT_TOKEN
# - OPENAI_API_KEY
```

### **4. Обновление Telegram Bot**
```bash
# Обновите WebApp URL в @BotFather
# /setmenubutton -> ваш-домен.vercel.app
```

---

## 🔧 Полезные команды

### **Разработка**
```bash
# Запуск в режиме разработки
npm run dev

# Сборка проекта
npm run build

# Запуск продакшн версии
npm run start

# Линтинг
npm run lint

# Форматирование кода
npm run format
```

### **База данных**
```bash
# Генерация Prisma Client
npx prisma generate

# Создание миграции
npx prisma migrate dev --name migration_name

# Сброс базы данных
npx prisma migrate reset

# Просмотр базы данных
npx prisma studio
```

### **Тестирование**
```bash
# Запуск тестов
npm run test

# Запуск тестов в watch режиме
npm run test:watch

# Покрытие кода
npm run test:coverage
```

---

## 🐛 Решение проблем

### **Проблема: Telegram WebApp не открывается**
```bash
# Решение:
# 1. Проверьте, что URL в @BotFather правильный
# 2. Убедитесь, что приложение доступно по HTTPS
# 3. Проверьте, что бот добавлен в контакты
```

### **Проблема: Ошибки TypeScript**
```bash
# Решение:
# 1. Перезапустите TypeScript сервер в VS Code
# 2. Убедитесь, что все типы установлены
# 3. Проверьте tsconfig.json
```

### **Проблема: Ошибки базы данных**
```bash
# Решение:
# 1. Проверьте DATABASE_URL
# 2. Убедитесь, что база данных доступна
# 3. Запустите npx prisma db push
```

### **Проблема: TimeWeb Cloud AI API не работает**
```bash
# Решение:
# 1. Проверьте TIMEWEB_API_KEY
# 2. Убедитесь, что у вас есть доступ к TimeWeb Cloud
# 3. Проверьте лимиты API в TimeWeb Cloud
# 4. Убедитесь, что TIMEWEB_API_URL правильный
```

### **Проблема: Российские платежные системы не работают**
```bash
# Решение:
# 1. Проверьте API ключи для каждой системы
# 2. Убедитесь, что аккаунты активированы
# 3. Проверьте лимиты и комиссии
# 4. Убедитесь, что webhook'и настроены правильно
# 5. Проверьте соответствие требованиям 152-ФЗ
```

### **Проблема: Telegram Stars не работают**
```bash
# Решение:
# 1. Убедитесь, что бот настроен для приема платежей
# 2. Проверьте, что приложение опубликовано
# 3. Убедитесь, что пользователь в России
# 4. Проверьте лимиты Telegram Stars
```

---

## 📚 Дополнительные ресурсы

### **Документация**
- [Next.js Documentation](https://nextjs.org/docs)
- [Telegram WebApp API](https://core.telegram.org/bots/webapps)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### **Полезные инструменты**
- [Telegram Bot Father](https://t.me/BotFather)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Prisma Studio](https://www.prisma.io/studio)
- [TimeWeb Cloud Dashboard](https://timeweb.cloud)
- [OpenAI Playground](https://platform.openai.com/playground)

### **Российские платежные системы**
- [ЮKassa Dashboard](https://yookassa.ru)
- [ЮMoney Dashboard](https://yoomoney.ru)
- [QIWI Dashboard](https://qiwi.com)
- [СБП Documentation](https://sbp.nspk.ru)
- [Центральный банк РФ](https://cbr.ru)

---

## ✅ Чек-лист готовности

- [ ] Next.js проект создан
- [ ] TypeScript настроен
- [ ] Tailwind CSS настроен
- [ ] Telegram Bot создан
- [ ] База данных настроена
- [ ] Prisma настроен
- [ ] Переменные окружения настроены
- [ ] Telegram интеграция работает
- [ ] Российские платежные системы настроены
- [ ] Telegram Stars работают
- [ ] Проект собирается без ошибок
- [ ] Деплой на Vercel выполнен
- [ ] WebApp открывается в Telegram

**Готово!** 🎉 Ваше окружение разработки настроено и готово к работе!

---

*Руководство по настройке подготовлено: 16 октября 2025*  
*Версия: 1.0*  
*Время настройки: 30 минут ⏱️*
