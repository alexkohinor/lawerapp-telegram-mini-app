# 🚀 TimeWeb Cloud Deployment Rules - LawerApp

## ⚠️ КРИТИЧЕСКИ ВАЖНО: Избегайте рекурсии!

### ❌ НИКОГДА НЕ ДЕЛАЙТЕ:
```json
{
  "scripts": {
    "build": "./build-script.sh"  // где build-script.sh содержит npm run build
  }
}
```

### ✅ ВСЕГДА ДЕЛАЙТЕ:
```json
{
  "scripts": {
    "build": "next build && mkdir -p out && cp -r .next/server/app/* out/ 2>/dev/null || true && cp -r public/* out/ 2>/dev/null || true"
  }
}
```

## 📋 Обязательная конфигурация

### 1. Next.js Configuration (next.config.js)
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

### 2. Package.json Requirements
```json
{
  "scripts": {
    "build": "next build && mkdir -p out && cp -r .next/server/app/* out/ 2>/dev/null || true && cp -r public/* out/ 2>/dev/null || true"
  },
  "dependencies": {
    "next": "^15.5.6",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@twa-dev/sdk": "^8.0.2"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

### 3. Обязательные файлы

#### .nvmrc
```
18.20.0
```

#### .npmrc
```
fetch-timeout=600000
fetch-retry-maxtime=600000
fetch-retry-mintime=10000
```

## 🚫 Запрещенные файлы

**НЕ СОЗДАВАЙТЕ:**
- ❌ `build-for-timeweb.sh`
- ❌ `build-and-export.sh`
- ❌ Любые внешние build скрипты

## 🔧 Environment Variables

### Обязательные переменные для TimeWeb Cloud:
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.timeweb.cloud
DATABASE_URL=postgresql://user:pass@host:port/db
S3_ENDPOINT=https://s3.twcstorage.ru
S3_REGION=ru-1
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_BUCKET_NAME=your_bucket_name
TELEGRAM_BOT_TOKEN=your_bot_token
```

## 🧪 Тестирование перед деплоем

### Локальная проверка:
```bash
# Очистка
rm -rf out .next

# Сборка
npm run build

# Проверка результата
ls -la out/  # Должен показать index.html
```

### Ожидаемый результат:
```
out/
├── index.html          # ✅ Главная страница
├── _not-found.html     # ✅ 404 страница
├── test.html           # ✅ Тестовая страница
├── miniapp-test.html   # ✅ Mini App тест
├── favicon.ico         # ✅ Иконка
├── manifest.json       # ✅ Манифест
└── ...                 # ✅ Другие статические файлы
```

## 🐛 Troubleshooting

### Проблема: Деплой зацикливается
**Причина:** Рекурсия в build скриптах
**Решение:**
1. Удалите все внешние build скрипты
2. Встройте команды напрямую в package.json
3. Убедитесь, что нет цепочки: `npm run build` → `./script.sh` → `npm run build`

### Проблема: "index.html not found in /out"
**Причина:** Папка out не создается
**Решение:**
1. Проверьте, что build скрипт создает папку `out`
2. Убедитесь, что файлы копируются из `.next/server/app/` в `out/`
3. Проверьте `output: 'export'` в next.config.js

### Проблема: "ECONNRESET" при установке зависимостей
**Причина:** Таймауты npm
**Решение:**
1. Добавьте `.npmrc` с настройками таймаутов
2. Удалите неиспользуемые зависимости
3. Используйте `npm ci --omit=dev`

## 📝 Git Commit Messages

### Используйте понятные сообщения:
```
🚀 ULTIMATE FIX: Remove recursive build scripts, inline build commands
🔧 Fix: TimeWeb Cloud deployment configuration  
✅ Test: Local build verification
🚀 Deploy: TimeWeb Cloud optimization
```

## 🔒 Security

### НЕ КОММИТЬТЕ:
- `.env` файлы
- API ключи
- Пароли
- Приватные данные

### ИСПОЛЬЗУЙТЕ:
- `env.example` для шаблонов
- Переменные окружения в TimeWeb Cloud
- `.gitignore` для исключения чувствительных файлов

## 🎯 Результат

Следуя этим правилам, деплой на TimeWeb Cloud будет:
- ✅ **Быстрым** (без рекурсии)
- ✅ **Надежным** (правильная конфигурация)
- ✅ **Стабильным** (оптимизированные зависимости)
- ✅ **Безопасным** (правильные переменные окружения)

## 📚 Дополнительные ресурсы

- [TimeWeb Cloud Documentation](https://timeweb.cloud/docs)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)

---

**Последнее обновление:** 19 октября 2024  
**Статус:** ✅ Протестировано и работает
