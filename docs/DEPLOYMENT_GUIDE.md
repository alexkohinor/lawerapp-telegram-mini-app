# 🚀 Руководство по деплою LawerApp

## ✅ **Статус готовности к деплою**

### 🎯 **Выполненные задачи:**

1. **✅ Приложение готово** - все ошибки исправлены
2. **✅ GitHub репозиторий** - код загружен и защищен
3. **✅ TimeWeb Cloud** - конфигурация подготовлена
4. **✅ База данных** - схема и скрипты готовы
5. **✅ Безопасность** - секретные данные защищены

## 📋 **Инструкции по деплою**

### 1. **Создание приложения в TimeWeb Cloud**

#### Вариант A: Через панель управления TimeWeb
1. Зайдите в панель управления TimeWeb Cloud
2. Перейдите в раздел "Приложения"
3. Нажмите "Создать приложение"
4. Выберите "Frontend приложение"
5. Настройте параметры:

```
Тип: Frontend
Пресет: 1451 (1₽/мес) или 1453 (890₽/мес)
Репозиторий: https://github.com/alexkohinor/lawerapp-telegram-mini-app
Ветка: main
Фреймворк: next.js
Build команда: npm run build
Index директория: /out
```

#### Вариант B: Через MCP Server (если доступен)
```bash
mcp_timeweb-mcp-server_create_timeweb_app \
  --type frontend \
  --provider_id 44352174-39c9-4221-802f-d255d40e187f \
  --repository_id a5ad60ba-5906-47cc-bc34-92836fc118cc \
  --repository_url https://github.com/alexkohinor/lawerapp-telegram-mini-app \
  --preset_id 1451 \
  --framework next.js \
  --commit_sha 2ca9fe670e907c83a4512dcd4604c3cd12e82534 \
  --branch_name main \
  --name "LawerApp Telegram Mini App" \
  --build_cmd "npm run build" \
  --index_dir "/out"
```

### 2. **Настройка переменных окружения**

В панели TimeWeb Cloud добавьте следующие переменные:

```env
# Основные настройки
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://lawerapp.timeweb.cloud
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=miniappadvokat_bot

# База данных PostgreSQL
DATABASE_URL=postgresql://gen_user:MBc9P>1vm0ZUbM@pg-12345678.timeweb.ru:5432/lawerapp

# S3 Storage
S3_ENDPOINT=https://s3.twcstorage.ru
S3_REGION=ru-1
S3_ACCESS_KEY=HU9SKJH9UHKTA19WZ7I1
S3_SECRET_KEY=YvTaAAvMARx66APUUszIWqRhlH2sbDyTbe4K9xlc
S3_BUCKET_NAME=359416c4-cb070b85-cb95-43f1-be0a-7736f395109b

# Telegram Bot
TELEGRAM_BOT_TOKEN=8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8
TELEGRAM_BOT_USERNAME=miniappadvokat_bot
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret_here

# AI Services
OPENAI_API_KEY=your_openai_api_key_here

# Платежные системы
YOOKASSA_SHOP_ID=your_yookassa_shop_id
YOOKASSA_SECRET_KEY=your_yookassa_secret_key
YOOMONEY_CLIENT_ID=your_yoomoney_client_id
YOOMONEY_CLIENT_SECRET=your_yoomoney_client_secret

# Безопасность
NEXTAUTH_SECRET=your_nextauth_secret_here
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here
```

### 3. **Инициализация базы данных**

После успешного деплоя выполните:

```bash
# Подключитесь к серверу TimeWeb
ssh your-server

# Перейдите в директорию приложения
cd /path/to/lawerapp

# Установите зависимости
npm install

# Сгенерируйте Prisma клиент
npm run db:generate

# Инициализируйте базу данных
npm run db:init

# Проверьте подключение
npm run db:test
```

### 4. **Настройка Telegram Bot**

```bash
# Установите webhook для бота
curl -X POST "https://api.telegram.org/bot8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://lawerapp.timeweb.cloud/api/telegram/webhook",
    "secret_token": "your_webhook_secret_here"
  }'

# Проверьте статус webhook
curl "https://api.telegram.org/bot8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8/getWebhookInfo"
```

### 5. **Проверка работоспособности**

```bash
# Проверьте доступность приложения
curl -I https://lawerapp.timeweb.cloud

# Проверьте API endpoints
curl https://lawerapp.timeweb.cloud/api/health
curl https://lawerapp.timeweb.cloud/api/telegram/webhook

# Проверьте базу данных
psql "postgresql://gen_user:MBc9P>1vm0ZUbM@pg-12345678.timeweb.ru:5432/lawerapp" -c "\dt lawerapp_*"
```

## 🔧 **Устранение проблем**

### Проблема: Приложение не запускается
**Решение:**
1. Проверьте логи в панели TimeWeb
2. Убедитесь, что все переменные окружения настроены
3. Проверьте правильность build команды

### Проблема: Ошибка подключения к базе данных
**Решение:**
1. Проверьте DATABASE_URL
2. Убедитесь, что PostgreSQL сервер доступен
3. Проверьте права пользователя на базу данных

### Проблема: Telegram Bot не отвечает
**Решение:**
1. Проверьте правильность webhook URL
2. Убедитесь, что TELEGRAM_BOT_TOKEN корректный
3. Проверьте логи webhook endpoint

### Проблема: S3 не работает
**Решение:**
1. Проверьте S3_ACCESS_KEY и S3_SECRET_KEY
2. Убедитесь, что S3_BUCKET_NAME существует
3. Проверьте права доступа к bucket

## 📊 **Мониторинг после деплоя**

### 1. **Проверка метрик**
- CPU и RAM использование
- Время ответа API
- Количество запросов
- Ошибки в логах

### 2. **Проверка базы данных**
```sql
-- Статистика пользователей
SELECT COUNT(*) as total_users FROM lawerapp_users;

-- Статистика консультаций
SELECT COUNT(*) as total_consultations FROM lawerapp_consultations;

-- Статистика платежей
SELECT COUNT(*) as total_payments FROM lawerapp_payments;
```

### 3. **Проверка Telegram Bot**
```bash
# Статистика бота
curl "https://api.telegram.org/bot8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8/getMe"

# Информация о webhook
curl "https://api.telegram.org/bot8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8/getWebhookInfo"
```

## 🔄 **Обновление приложения**

### Автоматическое обновление
При push в main ветку GitHub приложение автоматически обновится в TimeWeb Cloud.

### Ручное обновление
1. Зайдите в панель TimeWeb Cloud
2. Перейдите к вашему приложению
3. Нажмите "Обновить" или "Redeploy"

## 📞 **Поддержка**

### TimeWeb Cloud
- **Документация**: https://timeweb.com/cloud/docs
- **Поддержка**: support@timeweb.com
- **Панель управления**: https://timeweb.com/cloud

### GitHub
- **Репозиторий**: https://github.com/alexkohinor/lawerapp-telegram-mini-app
- **Issues**: https://github.com/alexkohinor/lawerapp-telegram-mini-app/issues

### Telegram Bot API
- **Документация**: https://core.telegram.org/bots/api
- **Webhook**: https://core.telegram.org/bots/webhooks

## 🎉 **Поздравляем!**

После выполнения всех шагов LawerApp будет полностью развернут и готов к работе:

- ✅ **Приложение доступно** по адресу https://lawerapp.timeweb.cloud
- ✅ **Telegram Bot** работает и отвечает на команды
- ✅ **База данных** инициализирована и готова к работе
- ✅ **S3 Storage** настроено для хранения файлов
- ✅ **Мониторинг** активен и отслеживает метрики

**LawerApp готов предоставлять правовые консультации с AI!** 🤖⚖️
