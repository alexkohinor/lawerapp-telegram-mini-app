<!-- 6a4086b2-1baa-473e-861b-03f87886e543 f8115e65-6552-4d68-93a4-e0ed3578368e -->
# План: Исправление деплоя и запуск Mini App

## Анализ логов

Деплой **технически успешен** - `index.html` создан и найден во второй попытке:
- Первая попытка (17:16:10): ERROR - index.html not found
- Вторая попытка (17:17:29): SUCCESS - index.html найден в `/out`
- Сборка завершилась успешно: `✓ Generating static pages (7/7)`

## Проблема

**Конфликт конфигурации**: `next.config.js` закомментирован `output: 'export'`, но `package.json` build команда копирует файлы из `.next/server/app/` в `out/`. Это создает несогласованность.

Согласно правилам Cursor (.cursorrules):
```javascript
output: 'export',           // ОБЯЗАТЕЛЬНО для статического экспорта
trailingSlash: true,        // ОБЯЗАТЕЛЬНО для TimeWeb Cloud
```

## Исправления

### 1. Привести next.config.js в соответствие с правилами

**Файл:** `next.config.js`

**Проблема:**
```javascript
// output: 'export', // Отключаем для поддержки API routes
```

**Решение:** Включить `output: 'export'` и удалить несовместимые опции
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',           // ОБЯЗАТЕЛЬНО для TimeWeb Cloud
  trailingSlash: true,        // ОБЯЗАТЕЛЬНО для TimeWeb Cloud
  images: {
    unoptimized: true,        // ОБЯЗАТЕЛЬНО для статического экспорта
    domains: ['telegram.org', 'cdn.telegram.org'],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
```

**Удалить:** `async headers()` и `async rewrites()` - несовместимы со статическим экспортом

### 2. Оптимизировать build команду

**Файл:** `package.json`

**Текущая команда:**
```json
"build": "next build && mkdir -p out && cp -r .next/server/app/* out/ 2>/dev/null || true && cp -r public/* out/ 2>/dev/null || true"
```

**Проблема:** Копирование из `.next/server/app/` излишне при `output: 'export'`, т.к. Next.js сам создает `out/`

**Решение:** Упростить команду
```json
"build": "next build"
```

При `output: 'export'` Next.js автоматически создаст папку `out/` с правильным содержимым.

### 3. Проверить статус деплоя

Команды для проверки доступности приложения:
```bash
# Проверить HTTP статус
curl -I https://alexkohinor-lawerapp-telegram-mini-app-7e7a.twc1.net

# Если домен недоступен, создать новое приложение через TimeWeb Cloud API
```

### 4. Настроить Telegram Web App

**Скрипт:** `scripts/setup-telegram-webapp.ts`

Выполнить автоматическую настройку:
```bash
TELEGRAM_BOT_TOKEN=8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8 \
TELEGRAM_WEBAPP_URL=https://[новый-домен].twc1.net \
npm run setup:telegram
```

Команды для ручной настройки:
```bash
# Получить информацию о боте
curl https://api.telegram.org/bot8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8/getMe

# Установить команды бота
curl -X POST https://api.telegram.org/bot8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8/setMyCommands \
  -H "Content-Type: application/json" \
  -d '{"commands":[{"command":"start","description":"🚀 Запустить LawerApp"}]}'
```

### 5. Создать env.example для продакшена

**Файл:** `env.production.example`

```env
# Production Environment Variables for TimeWeb Cloud
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.twc1.net
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=miniappadvokat_bot
S3_ENDPOINT=https://s3.twcstorage.ru
S3_REGION=ru-1
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_BUCKET_NAME=your_bucket_name
```

### 6. Протестировать Mini App

После деплоя:
1. Открыть бота @miniappadvokat_bot в Telegram
2. Отправить команду `/start`
3. Нажать на кнопку Mini App (если есть)
4. Проверить загрузку приложения
5. Проверить функционал (тестовая страница `/test`, `/miniapp-test`)

### 7. Документация изменений

**Файл:** `docs/DEPLOYMENT_FIX.md`

Создать документ с описанием:
- Найденной проблемы (конфликт конфигурации)
- Примененного решения (включение `output: 'export'`)
- Результатов тестирования

## Порядок выполнения

1. Исправить `next.config.js` (включить `output: 'export'`, удалить headers)
2. Упростить build команду в `package.json`
3. Протестировать локально: `npm run build` и проверить `out/index.html`
4. Закоммитить изменения
5. Запушить в GitHub
6. Проверить статус деплоя на TimeWeb Cloud
7. Настроить Telegram Web App URL через `npm run setup:telegram`
8. Протестировать Mini App в Telegram

## Ожидаемый результат

- ✅ Конфигурация соответствует правилам Cursor
- ✅ Build команда упрощена и работает корректно
- ✅ `out/index.html` создается автоматически
- ✅ Деплой проходит без ошибок
- ✅ Telegram Web App URL настроен
- ✅ Mini App доступен через Telegram бота

### To-dos

- [ ] Исправить next.config.js - включить output: 'export' и удалить несовместимые опции
- [ ] Упростить build команду в package.json - удалить ручное копирование файлов
- [ ] Протестировать локальную сборку - проверить создание out/index.html
- [ ] Закоммитить исправления конфигурации
- [ ] Запушить изменения в GitHub
- [ ] Проверить статус деплоя на TimeWeb Cloud
- [ ] Настроить Telegram Web App URL и команды бота
- [ ] Протестировать Mini App в Telegram
- [ ] Создать документацию об исправлениях деплоя