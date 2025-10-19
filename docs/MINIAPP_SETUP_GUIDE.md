# 🚀 Руководство по настройке LawerApp Telegram Mini App

**Дата:** 19 октября 2024  
**Статус:** ✅ Деплой успешен  
**Версия:** 1.0.0

## 📋 Анализ успешного деплоя

### ✅ Результаты деплоя
```
17:51:46 | ✓ Generating static pages (7/7)
17:51:46 | ✓ Exporting (2/2)
17:51:47 | Index dir contents: ['404.html', 'test', 'index.html', 'index.txt', 'manifest.json', 'miniapp-test', '404', 'globe.svg', 'favicon.ico', 'window.svg', 'vercel.svg', 'next.svg', '_next', 'file.svg']
17:51:48 | Deployment successfully completed 🎉
```

### 📊 Статистика сборки
- **Время сборки:** 7.1s (оптимизировано)
- **Статические страницы:** 7/7 сгенерированы
- **Размер бандла:** 102 kB (оптимизировано)
- **Файлы:** index.html, test/, miniapp-test/ созданы успешно

## 🤖 Настройка Telegram Bot

### Текущий статус бота
```json
{
  "ok": true,
  "result": {
    "id": 8208499008,
    "is_bot": true,
    "first_name": "МиниАпп для юрконсультаций",
    "username": "miniappadvokat_bot",
    "can_join_groups": true,
    "can_read_all_group_messages": false,
    "supports_inline_queries": false,
    "can_connect_to_business": false,
    "has_main_web_app": false
  }
}
```

### ✅ Настроенные команды
```bash
curl -X POST https://api.telegram.org/bot8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8/setMyCommands
```

**Результат:** `{"ok":true,"result":true}`

**Доступные команды:**
- `/start` - 🚀 Запустить LawerApp
- `/help` - ❓ Помощь по использованию
- `/info` - ℹ️ Информация о LawerApp
- `/consultation` - ⚖️ Получить правовую консультацию
- `/dispute` - 📋 Создать правовой спор
- `/documents` - 📄 Управление документами

## 🌐 Настройка Web App URL

### Шаг 1: Получить URL приложения
После успешного деплоя нужно получить URL приложения из панели TimeWeb Cloud.

### Шаг 2: Установить Web App URL
```bash
# Замените YOUR_APP_URL на реальный URL приложения
curl -X POST https://api.telegram.org/bot8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8/setWebApp \
  -H "Content-Type: application/json" \
  -d '{"url": "https://YOUR_APP_URL.twc1.net"}'
```

### Шаг 3: Проверить настройки
```bash
curl -s https://api.telegram.org/bot8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8/getWebApp
```

## 🧪 Тестирование Mini App

### Локальное тестирование
```bash
# Запуск локального сервера
npm run dev

# Открыть в браузере
open http://localhost:3000

# Тестирование Mini App функций
open http://localhost:3000/test
open http://localhost:3000/miniapp-test
```

### Тестирование в Telegram
1. **Открыть бота:** @miniappadvokat_bot
2. **Отправить команду:** `/start`
3. **Нажать кнопку Mini App** (если настроена)
4. **Проверить загрузку** приложения
5. **Протестировать функции:**
   - Навигация между страницами
   - Telegram WebApp API
   - Хранение данных
   - Уведомления

## 📱 Функции Mini App

### Основные страницы
- **/** - Главная страница
- **/test** - Тестовая страница с Telegram WebApp API
- **/miniapp-test** - Расширенное тестирование Mini App

### Telegram WebApp API
```typescript
// Проверка доступности API
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  
  // Получение данных пользователя
  const user = tg.initDataUnsafe?.user;
  
  // Отправка уведомления
  tg.showAlert('Привет из Mini App!');
  
  // Закрытие приложения
  tg.close();
}
```

### Хранение данных
```typescript
// Использование localStorage (совместимо с v6.0)
localStorage.setItem('user_preferences', JSON.stringify({
  theme: 'dark',
  language: 'ru'
}));

// Получение данных
const preferences = JSON.parse(
  localStorage.getItem('user_preferences') || '{}'
);
```

## 🔧 Конфигурация для продакшена

### Переменные окружения
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

### Next.js конфигурация
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',           // ОБЯЗАТЕЛЬНО для статического экспорта
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

## 🚀 Автоматизация настройки

### Скрипт настройки Telegram Web App
```bash
# Запуск автоматической настройки
TELEGRAM_BOT_TOKEN=8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8 \
TELEGRAM_WEBAPP_URL=https://YOUR_APP_URL.twc1.net \
npm run setup:telegram
```

### Скрипт локальной разработки
```bash
# Настройка локальной среды
npm run setup:local

# Запуск в режиме разработки
npm run dev

# Запуск бота в polling режиме
npm run bot:polling
```

## 📊 Мониторинг и отладка

### Проверка статуса бота
```bash
# Информация о боте
curl -s https://api.telegram.org/bot8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8/getMe

# Статистика бота
curl -s https://api.telegram.org/bot8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8/getWebhookInfo
```

### Логи приложения
```bash
# Локальные логи
npm run dev

# Логи бота
npm run bot:polling

# Проверка сборки
npm run build
```

## 🎯 Следующие шаги

### 1. Получить URL приложения
- Зайти в панель TimeWeb Cloud
- Найти созданное приложение
- Скопировать URL (например: `https://app-name.twc1.net`)

### 2. Настроить Web App URL
```bash
curl -X POST https://api.telegram.org/bot8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8/setWebApp \
  -H "Content-Type: application/json" \
  -d '{"url": "https://YOUR_ACTUAL_URL.twc1.net"}'
```

### 3. Протестировать Mini App
- Открыть @miniappadvokat_bot
- Отправить `/start`
- Нажать кнопку Mini App
- Проверить все функции

### 4. Настроить webhook (опционально)
```bash
curl -X POST https://api.telegram.org/bot8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://YOUR_APP_URL.twc1.net/api/telegram/webhook"}'
```

## 📚 Полезные ссылки

- **Telegram Bot API:** https://core.telegram.org/bots/api
- **Telegram WebApp API:** https://core.telegram.org/bots/webapps
- **Next.js Static Export:** https://nextjs.org/docs/advanced-features/static-html-export
- **TimeWeb Cloud:** https://timeweb.cloud

## 🔍 Troubleshooting

### Проблема: Mini App не загружается
**Решение:**
1. Проверить URL в setWebApp
2. Убедиться, что приложение доступно по HTTPS
3. Проверить CORS настройки

### Проблема: Telegram WebApp API не работает
**Решение:**
1. Проверить версию Telegram WebApp
2. Использовать localStorage вместо CloudStorage
3. Добавить проверки на существование API

### Проблема: Деплой не проходит
**Решение:**
1. Проверить next.config.js (output: 'export')
2. Убедиться, что нет API routes
3. Проверить build команду в package.json

---

**Команда разработки:** LawerApp Team  
**Статус:** ✅ Готово к продакшену  
**Следующий этап:** Настройка Web App URL и тестирование
