# 🛠️ Настройка локальной среды разработки

## 📋 Предварительные требования

### 1. Установка Node.js
```bash
# Установите Node.js 18+ (рекомендуется 18.20.0)
nvm install 18.20.0
nvm use 18.20.0
```

### 2. Установка PostgreSQL
```bash
# macOS (с Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Windows
# Скачайте с https://www.postgresql.org/download/windows/
```

### 3. Создание локальной базы данных
```bash
# Подключитесь к PostgreSQL
psql postgres

# Создайте базу данных
CREATE DATABASE lawerapp_dev;
CREATE USER lawerapp_user WITH PASSWORD 'lawerapp_password';
GRANT ALL PRIVILEGES ON DATABASE lawerapp_dev TO lawerapp_user;
\q
```

## 🔧 Настройка переменных окружения

### 1. Создайте файл `.env.local`
```bash
cp env.example .env.local
```

### 2. Обновите `.env.local` с локальными настройками:
```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8
TELEGRAM_BOT_USERNAME=miniappadvokat_bot
TELEGRAM_WEBAPP_URL=http://localhost:3000
TELEGRAM_WEBHOOK_SECRET=local_webhook_secret

# Database Configuration (Local PostgreSQL)
DATABASE_URL=postgresql://lawerapp_user:lawerapp_password@localhost:5432/lawerapp_dev
DIRECT_URL=postgresql://lawerapp_user:lawerapp_password@localhost:5432/lawerapp_dev

# S3 Storage Configuration (TimeWeb Cloud - для тестирования)
S3_ENDPOINT=https://s3.twcstorage.ru
S3_REGION=ru-1
S3_ACCESS_KEY=HU9SKJH9UHKTA19WZ7I1
S3_SECRET_KEY=YvTaAAvMARx66APUUszIWqRhlH2sbDyTbe4K9xlc
S3_BUCKET_NAME=359416c4-a17c2034-cfcb-4343-baa2-855d4646e7eb

# Swift Storage Configuration (TimeWeb Cloud)
SWIFT_ENDPOINT=https://swift.twcstorage.ru
SWIFT_ACCESS_KEY=co78122:swift
SWIFT_SECRET_KEY=1B5sCIJ0QymD7uoDtGmbozXgfxb51j5hXIFLauGs

# Development
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Security (для локальной разработки)
NEXTAUTH_SECRET=local_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=local_jwt_secret_key
ENCRYPTION_KEY=local_encryption_key_32_chars

# AI Services (добавьте ваши ключи)
# OPENAI_API_KEY=your_openai_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## 🚀 Запуск проекта

### 1. Установка зависимостей
```bash
npm install
```

### 2. Инициализация базы данных
```bash
# Генерация Prisma клиента
npx prisma generate

# Создание миграций
npx prisma migrate dev --name init

# Или инициализация через скрипт
npm run db:init
```

### 3. Запуск в режиме разработки
```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

## 🧪 Тестирование

### 1. Тест подключения к базе данных
```bash
npm run db:test
```

### 2. Тест Telegram Mini App
```bash
npm run test:miniapp
```

### 3. Запуск Telegram бота в polling режиме
```bash
npm run bot:polling
```

## 📁 Структура проекта

```
lawerapp-telegram-mini-app/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React компоненты
│   ├── lib/                 # Утилиты и сервисы
│   └── types/               # TypeScript типы
├── prisma/
│   └── schema.prisma        # Схема базы данных
├── scripts/                 # Скрипты для разработки
├── docs/                    # Документация
├── .env.local              # Локальные переменные окружения
└── package.json            # Зависимости и скрипты
```

## 🔍 Полезные команды

```bash
# Проверка типов TypeScript
npm run type-check

# Линтинг кода
npm run lint

# Исправление ошибок линтера
npm run lint:fix

# Форматирование кода
npm run format

# Сборка для продакшена
npm run build

# Просмотр базы данных
npx prisma studio

# Сброс базы данных
npx prisma migrate reset
```

## 🐛 Troubleshooting

### Проблема: "Environment variable not found: DATABASE_URL"
**Решение:** Убедитесь, что файл `.env.local` создан и содержит правильный `DATABASE_URL`

### Проблема: "Connection refused" при подключении к PostgreSQL
**Решение:** 
1. Убедитесь, что PostgreSQL запущен: `brew services start postgresql`
2. Проверьте, что база данных создана
3. Проверьте правильность данных подключения в `.env.local`

### Проблема: "Module not found" ошибки
**Решение:** 
1. Удалите `node_modules` и `package-lock.json`
2. Выполните `npm install`

### Проблема: Telegram бот не отвечает
**Решение:**
1. Проверьте правильность `TELEGRAM_BOT_TOKEN` в `.env.local`
2. Убедитесь, что бот запущен: `npm run bot:polling`

## 📚 Дополнительные ресурсы

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram WebApp API](https://core.telegram.org/bots/webapps)

---

**Последнее обновление:** 19 октября 2024  
**Статус:** ✅ Готово к использованию
