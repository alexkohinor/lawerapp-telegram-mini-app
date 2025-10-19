# 🇷🇺 Настройка российских сервисов для LawerApp

## 📋 Обзор

LawerApp использует исключительно российские сервисы и платежные системы в соответствии с требованиями российского законодательства.

## 🤖 Telegram Bot

### Создание бота
1. Найдите [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду `/newbot`
3. Введите имя бота: `LawerApp - Правовая помощь`
4. Введите username: `miniappadvokat_bot`
5. Получите токен и добавьте в `.env.local`:
   ```env
   TELEGRAM_BOT_TOKEN=ваш_токен_от_BotFather
   TELEGRAM_BOT_USERNAME=miniappadvokat_bot
   ```

### Настройка команд бота
```bash
npm run bot
```

## ☁️ TimeWeb Cloud

### 1. Регистрация и настройка
1. Зарегистрируйтесь на [timeweb.com](https://timeweb.com)
2. Создайте новый проект
3. Получите API ключи в панели управления

### 2. Конфигурация
```env
TIMEWEB_API_KEY=ваш_api_ключ
TIMEWEB_PROJECT_ID=ваш_project_id
TIMEWEB_API_URL=https://api.timeweb.com
```

### 3. Сервисы TimeWeb Cloud
- **PostgreSQL** - основная база данных
- **Redis** - кэширование и сессии
- **Объектное хранилище** - файлы и документы
- **Мониторинг** - метрики и алерты

## 💳 Российские платежные системы

### 1. ЮKassa (Яндекс.Касса)
1. Зарегистрируйтесь на [yookassa.ru](https://yookassa.ru)
2. Создайте магазин
3. Получите Shop ID и Secret Key

```env
YOOKASSA_SHOP_ID=ваш_shop_id
YOOKASSA_SECRET_KEY=ваш_secret_key
NEXT_PUBLIC_YOOKASSA_SHOP_ID=ваш_shop_id
```

### 2. ЮMoney (Яндекс.Деньги)
1. Зарегистрируйтесь на [yoomoney.ru](https://yoomoney.ru)
2. Создайте приложение
3. Получите Client ID и Client Secret

```env
YOOMONEY_CLIENT_ID=ваш_client_id
YOOMONEY_CLIENT_SECRET=ваш_client_secret
```

### 3. QIWI
1. Зарегистрируйтесь на [qiwi.com](https://qiwi.com)
2. Создайте приложение
3. Получите Secret Key

```env
QIWI_SECRET_KEY=ваш_secret_key
```

### 4. СБП (Система быстрых платежей)
1. Подключитесь к СБП через банк-партнер
2. Получите API ключ

```env
SBP_API_KEY=ваш_api_ключ
```

## 🔒 Безопасность

### 1. JWT токены
```env
JWT_SECRET=сгенерируйте_случайную_строку_32_символа
```

### 2. Шифрование данных
```env
ENCRYPTION_KEY=сгенерируйте_случайную_строку_32_символа
```

### 3. NextAuth
```env
NEXTAUTH_SECRET=сгенерируйте_случайную_строку
NEXTAUTH_URL=https://ваш-домен.com
```

## 📊 Мониторинг и аналитика

### 1. Prometheus метрики
```env
PROMETHEUS_AUTH_TOKEN=сгенерируйте_токен_для_доступа_к_метрикам
```

### 2. Sentry (опционально)
```env
SENTRY_DSN=ваш_sentry_dsn
```

### 3. Яндекс.Метрика (опционально)
```env
ANALYTICS_ID=ваш_yandex_metrica_id
```

## 🚀 Запуск приложения

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка переменных окружения
```bash
cp env.example .env.local
# Отредактируйте .env.local с вашими данными
```

### 3. Запуск в режиме разработки
```bash
# Только веб-приложение
npm run dev

# Только Telegram бот
npm run bot

# Все вместе
npm run dev:all
```

### 4. Сборка для продакшена
```bash
npm run build
npm start
```

## 🔧 Настройка webhook для Telegram

### 1. Локальная разработка
Используйте ngrok для туннелирования:
```bash
npx ngrok http 3000
```

### 2. Продакшен
```bash
npm run setup-webhook
```

## 📱 Интеграция с Telegram Mini App

### 1. Настройка в BotFather
1. Отправьте `/newapp` в [@BotFather](https://t.me/BotFather)
2. Выберите вашего бота
3. Укажите URL приложения: `https://ваш-домен.com`
4. Загрузите иконку приложения

### 2. Конфигурация приложения
```env
NEXT_PUBLIC_APP_URL=https://ваш-домен.com
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=miniappadvokat_bot
```

## 🛡️ Соответствие российскому законодательству

### 1. 152-ФЗ "О персональных данных"
- ✅ Шифрование персональных данных
- ✅ Согласие на обработку
- ✅ Логирование доступа
- ✅ Уведомление об утечках

### 2. 149-ФЗ "Об информации"
- ✅ Хранение данных в России
- ✅ Локальные сервисы
- ✅ Российские платежные системы

### 3. Налоговое законодательство
- ✅ Интеграция с российскими банками
- ✅ Поддержка СБП
- ✅ Соответствие требованиям ЦБ РФ

## 🔍 Проверка конфигурации

### 1. Проверка переменных окружения
```bash
npm run type-check
```

### 2. Тестирование бота
```bash
npm run bot
# Отправьте /start боту в Telegram
```

### 3. Проверка веб-приложения
```bash
npm run dev
# Откройте http://localhost:3000
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в консоли
2. Убедитесь, что все переменные окружения настроены
3. Проверьте доступность российских сервисов
4. Обратитесь к документации TimeWeb Cloud

---

**Важно:** Все сервисы должны быть настроены в соответствии с российским законодательством и требованиями безопасности.
