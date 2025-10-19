# Настройка Telegram Mini App для LawerApp

## 🚨 Проблема с локальным тестированием

Telegram Mini App требует **HTTPS** и **публичный URL** для работы. Локальный `http://localhost:3000` не подходит для Mini App.

## 🔧 Решения для тестирования

### Вариант 1: Использование ngrok (Рекомендуется)

1. **Установите ngrok:**
   ```bash
   # macOS
   brew install ngrok
   
   # Или скачайте с https://ngrok.com/
   ```

2. **Запустите туннель:**
   ```bash
   ngrok http 3000
   ```

3. **Получите HTTPS URL** (например: `https://abc123.ngrok.io`)

4. **Настройте Web App в боте:**
   ```bash
   curl -X POST "https://api.telegram.org/bot8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8/setMyCommands" \
     -H "Content-Type: application/json" \
     -d '{
       "commands": [
         {"command": "start", "description": "Запуск бота и Mini App"},
         {"command": "help", "description": "Справка по командам"},
         {"command": "info", "description": "Информация о боте"}
       ]
     }'
   ```

5. **Используйте ссылку:** `https://t.me/miniappadvokat_bot?startapp=lawerapp`

### Вариант 2: Тестирование в браузере

1. **Откройте:** http://localhost:3000/miniapp-test
2. **Нажмите "Открыть в Telegram"**
3. **Или используйте:** http://localhost:3000/test

### Вариант 3: Деплой на TimeWeb Cloud

1. **Следуйте инструкциям в:** `docs/TIMEWEB_CLOUD_SETUP.md`
2. **После деплоя получите HTTPS URL**
3. **Настройте Web App с реальным URL**

## 📱 Текущие ссылки для тестирования

### В браузере:
- **Главная страница:** http://localhost:3000
- **Тест Mini App:** http://localhost:3000/miniapp-test
- **Расширенное тестирование:** http://localhost:3000/test
- **API Health:** http://localhost:3000/api/health

### В Telegram:
- **Бот:** @miniappadvokat_bot
- **Команды:** `/start`, `/help`, `/info`
- **Mini App ссылка:** https://t.me/miniappadvokat_bot?startapp=lawerapp

## 🔍 Диагностика проблем

### Проверка бота:
```bash
curl -X GET "https://api.telegram.org/bot8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8/getMe"
```

### Проверка Webhook:
```bash
curl -X GET "https://api.telegram.org/bot8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8/getWebhookInfo"
```

### Проверка приложения:
```bash
curl -I http://localhost:3000
```

## ✅ Что работает сейчас

- ✅ **Telegram Bot** - отвечает на команды
- ✅ **Next.js App** - работает локально
- ✅ **API Health** - все сервисы healthy
- ✅ **Webhook API** - обрабатывает запросы
- ✅ **Тестовые страницы** - без ошибок

## ❌ Что не работает

- ❌ **Mini App по ссылке** - требует HTTPS
- ❌ **Web App кнопки** - требуют публичный URL

## 🚀 Следующие шаги

1. **Установите ngrok** для локального тестирования
2. **Или деплойте на TimeWeb Cloud** для продакшена
3. **Настройте Web App** с HTTPS URL
4. **Протестируйте Mini App** в Telegram

---

**Примечание:** Для полноценного тестирования Mini App в Telegram необходим публичный HTTPS URL. Локальное тестирование возможно только через браузер.
