# ☁️ Настройка TimeWeb Cloud для LawerApp

## 📋 Обзор

TimeWeb Cloud настроен для деплоя LawerApp с автоматическим подключением к PostgreSQL и S3 Storage.

## 🔧 **Настройка VCS провайдера**

### 1. Добавление GitHub провайдера

```bash
# Используйте MCP Server TimeWeb Cloud
mcp_timeweb-mcp-server_add_vcs_provider \
  --provider_type github \
  --url https://github.com/alexkohinor/lawerapp-telegram-mini-app.git \
  --login alexkohinor \
  --password YOUR_GITHUB_TOKEN
```

### 2. Проверка провайдеров

```bash
mcp_timeweb-mcp-server_get_vcs_providers
```

## 📦 **Создание приложения**

### Frontend приложение (рекомендуется)

```bash
mcp_timeweb-mcp-server_create_timeweb_app \
  --type frontend \
  --provider_id 44352174-39c9-4221-802f-d255d40e187f \
  --repository_id a5ad60ba-5906-47cc-bc34-92836fc118cc \
  --repository_url https://github.com/alexkohinor/lawerapp-telegram-mini-app \
  --preset_id 1451 \
  --framework next.js \
  --commit_sha LATEST_COMMIT_SHA \
  --branch_name main \
  --name "LawerApp Telegram Mini App" \
  --build_cmd "npm run build" \
  --index_dir "/out" \
  --envs '{
    "NODE_ENV": "production",
    "NEXT_PUBLIC_APP_URL": "https://lawerapp.timeweb.cloud",
    "NEXT_PUBLIC_TELEGRAM_BOT_USERNAME": "miniappadvokat_bot",
    "DATABASE_URL": "postgresql://gen_user:MBc9P>1vm0ZUbM@pg-12345678.timeweb.ru:5432/lawerapp",
    "S3_ENDPOINT": "https://s3.twcstorage.ru",
    "S3_ACCESS_KEY": "HU9SKJH9UHKTA19WZ7I1",
    "S3_SECRET_KEY": "YvTaAAvMARx66APUUszIWqRhlH2sbDyTbe4K9xlc",
    "S3_BUCKET_NAME": "359416c4-cb070b85-cb95-43f1-be0a-7736f395109b"
  }' \
  --comment "LawerApp - Telegram Mini App для правовых консультаций с AI"
```

### Backend приложение (альтернатива)

```bash
mcp_timeweb-mcp-server_create_timeweb_app \
  --type backend \
  --provider_id 44352174-39c9-4221-802f-d255d40e187f \
  --repository_id a5ad60ba-5906-47cc-bc34-92836fc118cc \
  --repository_url https://github.com/alexkohinor/lawerapp-telegram-mini-app \
  --preset_id 1005 \
  --framework next.js \
  --commit_sha LATEST_COMMIT_SHA \
  --branch_name main \
  --name "LawerApp Telegram Mini App" \
  --build_cmd "npm run build" \
  --run_cmd "npm start" \
  --envs '{
    "NODE_ENV": "production",
    "NEXT_PUBLIC_APP_URL": "https://lawerapp.timeweb.cloud",
    "NEXT_PUBLIC_TELEGRAM_BOT_USERNAME": "miniappadvokat_bot",
    "DATABASE_URL": "postgresql://gen_user:MBc9P>1vm0ZUbM@pg-12345678.timeweb.ru:5432/lawerapp",
    "S3_ENDPOINT": "https://s3.twcstorage.ru",
    "S3_ACCESS_KEY": "HU9SKJH9UHKTA19WZ7I1",
    "S3_SECRET_KEY": "YvTaAAvMARx66APUUszIWqRhlH2sbDyTbe4K9xlc",
    "S3_BUCKET_NAME": "359416c4-cb070b85-cb95-43f1-be0a-7736f395109b"
  }' \
  --comment "LawerApp - Telegram Mini App для правовых консультаций с AI"
```

## 💰 **Доступные пресеты**

### Frontend пресеты
- **ID: 1451** - 1₽/мес, 50Mb диск (для тестирования)
- **ID: 1453** - 890₽/мес, 2048Mb диск (для продакшена)
- **ID: 1455** - 3990₽/мес, 10240Mb диск (для высоконагруженных приложений)

### Backend пресеты
- **ID: 1003** - 188₽/мес, 1 CPU, 1GB RAM, 15GB диск
- **ID: 1005** - 355₽/мес, 1 CPU, 2GB RAM, 30GB диск
- **ID: 1007** - 555₽/мес, 2 CPU, 2GB RAM, 40GB диск
- **ID: 1018** - 655₽/мес, 2 CPU, 4GB RAM, 50GB диск

## 🔧 **Настройки деплоя для Next.js**

```json
{
  "framework": "next.js",
  "build_cmd": "npm run build",
  "index_dir": "/out",
  "run_cmd": "npm start"
}
```

## 🌐 **Переменные окружения**

### Обязательные переменные
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://lawerapp.timeweb.cloud
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=miniappadvokat_bot
```

### База данных PostgreSQL
```env
DATABASE_URL=postgresql://gen_user:MBc9P>1vm0ZUbM@pg-12345678.timeweb.ru:5432/lawerapp
```

### S3 Storage
```env
S3_ENDPOINT=https://s3.twcstorage.ru
S3_REGION=ru-1
S3_ACCESS_KEY=HU9SKJH9UHKTA19WZ7I1
S3_SECRET_KEY=YvTaAAvMARx66APUUszIWqRhlH2sbDyTbe4K9xlc
S3_BUCKET_NAME=359416c4-cb070b85-cb95-43f1-be0a-7736f395109b
```

### Telegram Bot
```env
TELEGRAM_BOT_TOKEN=8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8
TELEGRAM_BOT_USERNAME=miniappadvokat_bot
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret_here
```

### AI Services
```env
OPENAI_API_KEY=your_openai_api_key_here
```

## 🚀 **Процесс деплоя**

### 1. Подготовка репозитория
```bash
# Создание репозитория в GitHub
git init
git add .
git commit -m "Initial commit: LawerApp Telegram Mini App"
git branch -M main
git remote add origin https://github.com/alexkohinor/lawerapp-telegram-mini-app.git
git push -u origin main
```

### 2. Создание приложения в TimeWeb
```bash
# Используйте MCP Server TimeWeb Cloud
mcp_timeweb-mcp-server_create_timeweb_app
```

### 3. Настройка базы данных
```bash
# После создания приложения
npm run db:init
npm run db:test
```

### 4. Настройка Telegram Bot
```bash
# Установка webhook
curl -X POST "https://api.telegram.org/bot8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://lawerapp.timeweb.cloud/api/telegram/webhook",
    "secret_token": "your_webhook_secret_here"
  }'
```

## 🔍 **Мониторинг и отладка**

### Логи приложения
```bash
# Просмотр логов в TimeWeb Cloud панели
# Или через API
```

### Проверка статуса
```bash
# Проверка доступности приложения
curl -I https://lawerapp.timeweb.cloud

# Проверка API endpoints
curl https://lawerapp.timeweb.cloud/api/health
```

### База данных
```bash
# Подключение к PostgreSQL
psql "postgresql://gen_user:MBc9P>1vm0ZUbM@pg-12345678.timeweb.ru:5432/lawerapp"

# Проверка таблиц
\dt lawerapp_*
```

## 🛠️ **Устранение неполадок**

### Проблемы с VCS провайдером
1. Проверьте правильность GitHub токена
2. Убедитесь, что токен имеет права на репозиторий
3. Проверьте, что репозиторий существует и доступен

### Проблемы с деплоем
1. Проверьте правильность build_cmd
2. Убедитесь, что все зависимости установлены
3. Проверьте переменные окружения

### Проблемы с базой данных
1. Проверьте DATABASE_URL
2. Убедитесь, что PostgreSQL сервер доступен
3. Проверьте права пользователя на базу данных

## 📞 **Поддержка**

- **TimeWeb Cloud документация**: https://timeweb.com/cloud/docs
- **GitHub API**: https://docs.github.com/en/rest
- **Next.js деплой**: https://nextjs.org/docs/deployment

---

**Важно**: Все секретные данные (токены, пароли) должны быть настроены через переменные окружения в TimeWeb Cloud панели, а не в коде.
