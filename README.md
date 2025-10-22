# 🏛️ LawerApp - Telegram Mini App

**Правовая помощь с AI в Telegram**

LawerApp - это Telegram Mini App для получения правовых консультаций с использованием искусственного интеллекта. Приложение предоставляет пользователям быстрый доступ к правовой информации, генерации документов и управлению правовыми спорами.

## 🎯 Статус проекта

**Версия:** 3.0.0  
**Статус:** ✅ Phase 7.6 - Telegram Mini App ЗАВЕРШЕНО  
**Последнее обновление:** 2024-10-22

### ✅ Завершенные фазы
- **Phase 0-6**: Базовая настройка, UI/UX, навигация, доступность
- **Phase 7.1-7.5**: Документы, споры, Prisma интеграция, аутентификация, данные
- **Phase 7.6**: Telegram Mini App - статический интерфейс ✅

### 🔄 В разработке
- **Phase 7.7-7.8**: Платежи, расширенная Telegram интеграция
- **Phase 8**: RAG система и база знаний
- **Phase 9**: Продвинутые AI функции

### 📱 Telegram Mini App
Миниапп полностью функционален и готов к использованию:
- ✅ **Мгновенная загрузка** без зависания
- ✅ **Полный интерфейс** для всех функций
- ✅ **Загрузка файлов** и фотографирование
- ✅ **Интеграция с Telegram** WebApp SDK

## ✨ Основные функции

- 🤖 **AI Консультации** - Получение правовых консультаций с помощью OpenAI
- ⚖️ **Управление спорами** - Создание и отслеживание правовых споров
- 📄 **Генерация документов** - Автоматическое создание правовых документов
- 📱 **Telegram Mini App** - Полнофункциональный интерфейс в Telegram
- 📁 **Загрузка файлов** - Поддержка PDF, DOC, DOCX, изображений
- 📷 **Камера** - Фотографирование документов
- 💳 **Платежная система** - Интеграция с российскими платежными системами
- 📊 **Мониторинг** - Отслеживание производительности и ошибок
- 🔔 **Уведомления** - Система алертов и уведомлений

## 🛠️ Технологический стек

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Mini App**: Статический HTML + Telegram WebApp SDK
- **Backend**: Next.js API Routes, Prisma ORM
- **База данных**: PostgreSQL (TimeWeb Cloud)
- **Хранилище**: S3 (TimeWeb Cloud)
- **AI**: OpenAI GPT-4, RAG система
- **Платежи**: ЮKassa, ЮMoney, СБП
- **Деплой**: TimeWeb Cloud
- **Мониторинг**: Prometheus, Grafana

## 🚀 Быстрый старт

### Автоматическая настройка (Рекомендуется)

```bash
# Клонируйте репозиторий
git clone https://github.com/alexkohinor/lawerapp-telegram-mini-app.git
cd lawerapp-telegram-mini-app

# Автоматическая настройка локальной среды
npm run setup:local

# Запустите приложение
npm run dev
```

### Ручная настройка

#### Предварительные требования

- Node.js 18+ 
- npm или yarn
- PostgreSQL
- OpenAI API ключ
- Telegram Bot Token

#### Установка

1. **Клонируйте репозиторий:**
```bash
git clone https://github.com/alexkohinor/lawerapp-telegram-mini-app.git
cd lawerapp-telegram-mini-app
```

2. **Установите зависимости:**
```bash
npm install
```

3. **Настройте переменные окружения:**
```bash
cp .env.example .env.local
# Отредактируйте .env.local с вашими данными
```

4. **Инициализируйте базу данных:**
```bash
npm run db:generate
npm run db:init
```

5. **Запустите приложение:**
```bash
npm run dev
```

## 📁 Структура проекта

```
lawerapp-telegram-mini-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API маршруты
│   │   ├── consultations/     # Страницы консультаций
│   │   ├── disputes/          # Страницы споров
│   │   └── page.tsx           # Главная страница
│   ├── components/            # React компоненты
│   │   ├── ui/               # UI компоненты
│   │   ├── layout/           # Компоненты макета
│   │   └── features/         # Функциональные компоненты
│   ├── lib/                  # Утилиты и сервисы
│   │   ├── database/         # Prisma схема
│   │   ├── payments/         # Платежные системы
│   │   ├── ai/              # AI сервисы
│   │   └── telegram/        # Telegram интеграция
│   └── types/               # TypeScript типы
├── prisma/                  # Prisma схема и миграции
├── docs/                   # Документация
├── scripts/               # Скрипты для разработки
└── public/               # Статические файлы
```

## 🔧 Команды разработки

```bash
# Разработка
npm run dev              # Запуск в режиме разработки
npm run dev:all          # Запуск приложения и бота

# Сборка
npm run build            # Сборка для продакшена
npm run start            # Запуск продакшен версии

# База данных
npm run db:generate      # Генерация Prisma клиента
npm run db:push          # Применение изменений схемы
npm run db:migrate       # Создание миграций
npm run db:studio        # Открытие Prisma Studio
npm run db:init          # Инициализация БД
npm run db:test          # Тест подключения к БД

# Telegram Bot
npm run bot              # Запуск бота
npm run bot:dev          # Запуск бота в режиме разработки

# Тестирование
npm run test             # Запуск тестов
npm run test:watch       # Тесты в режиме наблюдения
npm run test:coverage    # Покрытие тестами

# Линтинг
npm run lint             # Проверка кода
npm run lint:fix         # Автоисправление
```

## 🌐 Деплой

### TimeWeb Cloud

1. **Создайте приложение в TimeWeb Cloud:**
```bash
# Используйте MCP Server TimeWeb Cloud
mcp_timeweb-mcp-server_create_timeweb_app
```

2. **Настройте переменные окружения в панели TimeWeb**

3. **Деплой автоматически выполнится при push в main ветку**

### Переменные окружения

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username

# База данных
DATABASE_URL=postgresql://user:password@host:port/database

# S3 Storage
S3_ENDPOINT=https://s3.twcstorage.ru
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_BUCKET_NAME=your_bucket_name

# AI Services
OPENAI_API_KEY=your_openai_key

# Платежные системы
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key
```

## 📊 Мониторинг

- **Метрики**: Prometheus + Grafana
- **Логи**: Структурированное логирование
- **Алерты**: Автоматические уведомления
- **Здоровье**: Health check endpoints

## 🔒 Безопасность

- **Аутентификация**: NextAuth + Telegram WebApp
- **Авторизация**: Role-based access control
- **Шифрование**: AES-256-GCM для персональных данных
- **Валидация**: Zod схемы для всех входных данных
- **Rate Limiting**: Защита от злоупотреблений

## 🛠️ Полезные команды

### Разработка
```bash
npm run dev              # Запуск в режиме разработки
npm run build            # Сборка для продакшена
npm run start            # Запуск продакшен версии
npm run lint             # Проверка кода линтером
npm run lint:fix         # Исправление ошибок линтера
npm run type-check       # Проверка типов TypeScript
npm run format           # Форматирование кода
```

### База данных
```bash
npm run db:generate      # Генерация Prisma клиента
npm run db:push          # Отправка схемы в БД
npm run db:migrate       # Создание миграций
npm run db:studio        # Просмотр БД в браузере
npm run db:init          # Инициализация БД
npm run db:test          # Тест подключения к БД
```

### Telegram Bot
```bash
npm run bot:polling      # Запуск бота в polling режиме
npm run setup:telegram   # Настройка Telegram Web App
```

### Настройка
```bash
npm run setup:local      # Автоматическая настройка локальной среды
```

## 📚 Документация

- [Настройка локальной среды](docs/LOCAL_DEVELOPMENT_SETUP.md)
- [Правила деплоя TimeWeb Cloud](docs/TIMEWEB_DEPLOYMENT_RULES.md)
- [Настройка инфраструктуры](docs/INFRASTRUCTURE_INTEGRATION.md)
- [Настройка TimeWeb Cloud](docs/TIMEWEB_CLOUD_SETUP.md)
- [Настройка базы данных](docs/DATABASE_SETUP.md)
- [API документация](docs/API.md)
- [Руководство по развертыванию](docs/DEPLOYMENT.md)

## 🤝 Участие в разработке

1. Fork репозитория
2. Создайте feature ветку (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 📞 Поддержка

- **Email**: support@lawerapp.ru
- **Telegram**: [@lawerapp_support](https://t.me/lawerapp_support)
- **Документация**: [docs.lawerapp.ru](https://docs.lawerapp.ru)

## 🙏 Благодарности

- OpenAI за предоставление AI API
- Telegram за платформу Mini Apps
- TimeWeb за облачную инфраструктуру
- Сообщество разработчиков за вклад в проект

---

**LawerApp** - Правовая помощь нового поколения 🤖⚖️