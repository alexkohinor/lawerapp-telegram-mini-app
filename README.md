# 📱 LawerApp Telegram Mini App

Telegram Mini App для правовой помощи с AI консультациями, генерацией документов и управлением спорами.

## 🚀 Особенности

- 🤖 **AI консультации** - интеллектуальные правовые советы
- 📄 **Генерация документов** - автоматическое создание правовых документов
- ⚖️ **Управление спорами** - отслеживание и управление правовыми спорами
- 💳 **Платежная система** - интеграция с Telegram Stars и банковскими картами
- 🇷🇺 **Российская инфраструктура** - все данные в TimeWeb Cloud

## 🛠️ Технологический стек

- **Frontend**: Next.js 14, React 18, TypeScript
- **Стилизация**: Tailwind CSS, shadcn/ui
- **Telegram**: @twa-dev/sdk
- **База данных**: PostgreSQL (TimeWeb Cloud)
- **AI сервисы**: TimeWeb Cloud AI, OpenAI GPT-4
- **Состояние**: Zustand
- **Формы**: React Hook Form + Zod
- **Тестирование**: Jest + Testing Library

## 📦 Установка

1. **Клонирование репозитория**
   ```bash
   git clone https://github.com/your-org/lawerapp-telegram-mini-app.git
   cd lawerapp-telegram-mini-app
   ```

2. **Установка зависимостей**
   ```bash
   npm install
   ```

3. **Настройка окружения**
   ```bash
   cp env.example .env.local
   # Заполните переменные окружения
   ```

4. **Настройка базы данных**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Запуск в режиме разработки**
   ```bash
   npm run dev
   ```

## 🔧 Доступные команды

- `npm run dev` - запуск в режиме разработки
- `npm run build` - сборка для продакшена
- `npm run start` - запуск продакшен версии
- `npm run lint` - проверка кода линтером
- `npm run test` - запуск тестов
- `npm run db:generate` - генерация Prisma клиента
- `npm run db:push` - синхронизация схемы с БД
- `npm run db:studio` - открытие Prisma Studio

## 📁 Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (auth)/            # Auth routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── globals.css        # Глобальные стили
│   ├── layout.tsx         # Корневой layout
│   └── page.tsx           # Главная страница
├── components/            # React компоненты
│   ├── ui/               # Базовые UI компоненты
│   ├── forms/            # Компоненты форм
│   ├── layout/           # Layout компоненты
│   └── features/         # Feature компоненты
├── lib/                  # Core libraries
│   ├── ai/              # AI сервисы (TimeWeb Cloud)
│   ├── telegram/        # Telegram интеграция
│   ├── database/        # База данных
│   └── utils/           # Утилитарные функции
├── hooks/               # Кастомные React хуки
├── store/               # Управление состоянием
└── types/               # TypeScript типы
```

## 🔑 Переменные окружения

Скопируйте `env.example` в `.env.local` и заполните:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/lawerapp"

# Telegram
TELEGRAM_BOT_TOKEN="your_bot_token_here"

# TimeWeb Cloud
TIMEWEB_API_KEY="your_timeweb_api_key"
TIMEWEB_API_URL="https://api.timeweb.cloud"

# AI Services
OPENAI_API_KEY="your_openai_api_key"
```

## 🤖 Настройка Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен бота
3. Настройте WebApp URL: `/setmenubutton`
4. Добавьте команды: `/setcommands`

## 🚀 Деплой

### Vercel (рекомендуется)

1. Подключите репозиторий к Vercel
2. Настройте переменные окружения
3. Деплой автоматически при push в main

### Другие платформы

```bash
npm run build
npm run start
```

## 🧪 Тестирование

```bash
# Запуск всех тестов
npm run test

# Запуск тестов в watch режиме
npm run test:watch

# Покрытие кода
npm run test:coverage
```

## 📊 Мониторинг

- **Vercel Analytics** - метрики производительности
- **TimeWeb Cloud** - мониторинг AI сервисов
- **Prisma Studio** - управление базой данных

## 🤝 Участие в разработке

1. Форкните репозиторий
2. Создайте feature ветку
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE) файл.

## 📞 Поддержка

- 📧 Email: support@lawerapp.com
- 💬 Telegram: @LawerAppSupport
- 📚 Документация: [docs/](docs/)

---

**LawerApp Telegram Mini App** - правовая помощь в вашем кармане! ⚖️📱
