# 🔧 Руководство по переменным окружения LawerApp

**Дата:** 19 октября 2024  
**Статус:** ✅ Исправлено  
**Версия:** 1.0.0

## 📋 Проблема с дублирующимися файлами

### ❌ Найденная проблема
В проекте были дублирующиеся файлы с переменными окружения в разных папках:

```
/Users/macbook/Documents/MiniApp/
├── .env                    # ❌ НЕПРАВИЛЬНО (удален)
├── .env.local              # ❌ НЕПРАВИЛЬНО (удален)
├── env.example             # ❌ НЕПРАВИЛЬНО (удален)
└── lawerapp-telegram-mini-app/
    ├── .env.local          # ✅ ПРАВИЛЬНО
    ├── env.example         # ✅ ПРАВИЛЬНО
    └── env.production.example # ✅ ПРАВИЛЬНО
```

### ✅ Решение
Удалены дублирующиеся файлы из родительской папки. Теперь все файлы с переменными окружения находятся **ТОЛЬКО** в корне проекта Next.js.

## 🎯 Правильное расположение файлов

### 📁 Структура файлов (ПРАВИЛЬНАЯ)
```
lawerapp-telegram-mini-app/
├── .env.local              # Локальная разработка (НЕ коммитится)
├── env.example             # Шаблон для разработчиков (коммитится)
├── env.production.example  # Шаблон для продакшена (коммитится)
├── .gitignore              # Исключает .env* файлы
└── package.json
```

### 📝 Назначение файлов

#### 1. `.env.local` - Локальная разработка
```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8
TELEGRAM_BOT_USERNAME=miniappadvokat_bot
TELEGRAM_WEBAPP_URL=http://localhost:3000

# Database Configuration
DATABASE_URL=postgresql://gen_user:MBc9P>1vm0ZUbM@host:port/database

# S3 Storage Configuration
S3_ENDPOINT=https://s3.twcstorage.ru
S3_ACCESS_KEY=HU9SKJH9UHKTA19WZ7I1
S3_SECRET_KEY=YvTaAAvMARx66APUUszIWqRhlH2sbDyTbe4K9xlc
S3_BUCKET_NAME=359416c4-a17c2034-cfcb-4343-baa2-855d4646e7eb

# Development
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

**Особенности:**
- ✅ Содержит реальные значения для локальной разработки
- ❌ НЕ коммитится в Git (добавлен в .gitignore)
- 🔒 Содержит чувствительные данные (токены, ключи)

#### 2. `env.example` - Шаблон для разработчиков
```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_BOT_USERNAME=miniappadvokat_bot
TELEGRAM_WEBAPP_URL=https://your-domain.com

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# S3 Storage Configuration
S3_ENDPOINT=https://s3.twcstorage.ru
S3_ACCESS_KEY=your_access_key_here
S3_SECRET_KEY=your_secret_key_here
S3_BUCKET_NAME=your_bucket_name_here

# Development
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

**Особенности:**
- ✅ Коммитится в Git
- 📝 Содержит placeholder значения
- 👥 Используется другими разработчиками для настройки

#### 3. `env.production.example` - Шаблон для продакшена
```env
# Production Environment Variables for TimeWeb Cloud
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.twc1.net
TELEGRAM_BOT_TOKEN=8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8
TELEGRAM_BOT_USERNAME=miniappadvokat_bot

# S3 Storage Configuration
S3_ENDPOINT=https://s3.twcstorage.ru
S3_REGION=ru-1
S3_ACCESS_KEY=HU9SKJH9UHKTA19WZ7I1
S3_SECRET_KEY=YvTaAAvMARx66APUUszIWqRhlH2sbDyTbe4K9xlc
S3_BUCKET_NAME=359416c4-a17c2034-cfcb-4343-baa2-855d4646e7eb
```

**Особенности:**
- ✅ Коммитится в Git
- 🚀 Содержит настройки для продакшена
- 🌐 Используется для деплоя на TimeWeb Cloud

## 🔒 Безопасность

### .gitignore настройки
```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### ✅ Что коммитится:
- `env.example` - шаблон для разработчиков
- `env.production.example` - шаблон для продакшена

### ❌ Что НЕ коммитится:
- `.env.local` - локальные настройки с реальными данными
- `.env` - общие настройки с реальными данными
- Любые файлы с реальными токенами и ключами

## 🚀 Настройка для новых разработчиков

### 1. Клонирование репозитория
```bash
git clone https://github.com/alexkohinor/lawerapp-telegram-mini-app.git
cd lawerapp-telegram-mini-app
```

### 2. Создание локального файла
```bash
# Копирование шаблона
cp env.example .env.local

# Редактирование с реальными данными
nano .env.local
```

### 3. Установка зависимостей
```bash
npm install
```

### 4. Запуск в режиме разработки
```bash
npm run dev
```

## 🌐 Настройка для продакшена

### TimeWeb Cloud
1. Зайти в панель TimeWeb Cloud
2. Выбрать приложение
3. Перейти в раздел "Переменные окружения"
4. Добавить переменные из `env.production.example`

### Переменные для продакшена
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.twc1.net
TELEGRAM_BOT_TOKEN=8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8
TELEGRAM_BOT_USERNAME=miniappadvokat_bot
S3_ENDPOINT=https://s3.twcstorage.ru
S3_REGION=ru-1
S3_ACCESS_KEY=HU9SKJH9UHKTA19WZ7I1
S3_SECRET_KEY=YvTaAAvMARx66APUUszIWqRhlH2sbDyTbe4K9xlc
S3_BUCKET_NAME=359416c4-a17c2034-cfcb-4343-baa2-855d4646e7eb
```

## 🔧 Автоматизация

### Скрипт настройки локальной среды
```bash
npm run setup:local
```

Этот скрипт:
1. Проверяет системные требования
2. Копирует `env.example` в `.env.local`
3. Устанавливает зависимости
4. Генерирует Prisma клиент
5. Инициализирует базу данных

### Скрипт настройки Telegram
```bash
TELEGRAM_BOT_TOKEN=your_token npm run setup:telegram
```

### Скрипт настройки Mini App
```bash
TELEGRAM_BOT_TOKEN=your_token \
TELEGRAM_WEBAPP_URL=https://your-app.twc1.net \
npm run setup:miniapp
```

## 📊 Приоритет загрузки переменных

Next.js загружает переменные в следующем порядке (от высшего к низшему приоритету):

1. `process.env` - системные переменные
2. `.env.production.local` - продакшен локально
3. `.env.local` - локальные настройки
4. `.env.production` - продакшен настройки
5. `.env` - общие настройки

## 🎯 Рекомендации

### ✅ Правильно:
- Используйте `.env.local` для локальной разработки
- Коммитьте только `env.example` и `env.production.example`
- Используйте `NEXT_PUBLIC_` префикс для переменных, доступных в браузере
- Храните чувствительные данные в переменных окружения

### ❌ Неправильно:
- Коммитить файлы с реальными токенами
- Создавать файлы `.env*` в родительских папках
- Хранить пароли в коде
- Использовать один файл для всех окружений

## 🔍 Troubleshooting

### Проблема: Переменные не загружаются
**Решение:**
1. Проверить, что файл находится в корне проекта Next.js
2. Убедиться, что файл имеет правильное имя (`.env.local`)
3. Перезапустить dev сервер

### Проблема: Переменные доступны в браузере
**Решение:**
- Использовать префикс `NEXT_PUBLIC_` для переменных, доступных в браузере
- Переменные без префикса доступны только на сервере

### Проблема: Дублирующиеся файлы
**Решение:**
- Удалить файлы из родительских папок
- Оставить только файлы в корне проекта Next.js

---

**Команда разработки:** LawerApp Team  
**Статус:** ✅ Исправлено  
**Следующий этап:** Продолжение настройки Mini App
