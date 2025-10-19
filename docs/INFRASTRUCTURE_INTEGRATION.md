# 🏗️ Интеграция с инфраструктурой advokat-fomin.ru

## 📋 Обзор

LawerApp использует существующую инфраструктуру проекта `advokat-fomin.ru` для экономии ресурсов и упрощения управления.

## 🗄️ **База данных PostgreSQL**

### Подключение
```env
DATABASE_URL=postgresql://username:MBc9P>1vm0ZUbM@host:port/database
DIRECT_URL=postgresql://username:MBc9P>1vm0ZUbM@host:port/database
```

### Схема данных
- **lawerapp_users** - пользователи Telegram Mini App
- **lawerapp_consultations** - AI консультации
- **lawerapp_disputes** - правовые споры
- **lawerapp_documents** - сгенерированные документы
- **lawerapp_payments** - платежи и подписки
- **lawerapp_notifications** - уведомления
- **lawerapp_sessions** - сессии NextAuth
- **lawerapp_accounts** - аккаунты провайдеров
- **lawerapp_ai_monitoring** - мониторинг AI

### Инициализация
```bash
# Создание таблиц и индексов
npm run db:init

# Генерация Prisma клиента
npm run db:generate

# Открытие Prisma Studio
npm run db:studio
```

## 📦 **S3 Storage**

### Конфигурация
```env
S3_ENDPOINT=https://s3.twcstorage.ru
S3_REGION=ru-1
S3_ACCESS_KEY=HU9SKJH9UHKTA19WZ7I1
S3_SECRET_KEY=YvTaAAvMARx66APUUszIWqRhlH2sbDyTbe4K9xlc
S3_BUCKET_NAME=359416c4-cb070b85-cb95-43f1-be0a-7736f395109b
```

### Структура файлов
```
lawerapp/
├── documents/          # Документы пользователей
│   └── {userId}/
│       └── {documentId}/
│           └── {filename}
├── avatars/           # Аватары пользователей
│   └── {userId}/
│       └── {filename}
└── temp/              # Временные файлы
    └── {timestamp}-{filename}
```

### Использование
```typescript
import { s3Service } from '@/lib/storage/s3-service';

// Загрузка документа
const url = await s3Service.uploadUserDocument(
  userId,
  documentId,
  'contract.pdf',
  fileBuffer,
  'application/pdf'
);

// Получение файла
const file = await s3Service.getFile(key);

// Генерация подписанного URL
const signedUrl = await s3Service.getSignedUrl(key, 3600);
```

## 🤖 **Telegram Bot**

### Конфигурация
```env
TELEGRAM_BOT_TOKEN=8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8
TELEGRAM_BOT_USERNAME=miniappadvokat_bot
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret_here
```

### Функции
- **Уведомления** - отправка уведомлений пользователям
- **Навигация** - кнопки для перехода в Mini App
- **AI консультации** - обработка сообщений как AI-запросов
- **Мониторинг** - интеграция с системой алертов

## 🧠 **AI Services**

### OpenAI
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Мониторинг AI
- **Токены** - отслеживание использования
- **Стоимость** - расчет затрат на API
- **Время ответа** - мониторинг производительности
- **Ошибки** - логирование ошибок

## 💳 **Платежные системы**

### Российские провайдеры
- **ЮKassa** - основная платежная система
- **ЮMoney** - альтернативный способ оплаты
- **СБП** - система быстрых платежей
- **Telegram Stars** - встроенные платежи Telegram

### Интеграция
```typescript
import { PaymentManager } from '@/lib/payments/payment-manager';

const payment = await PaymentManager.initiatePayment({
  amount: 990,
  currency: 'RUB',
  method: 'yookassa',
  userId: user.id,
  subscriptionPlan: 'basic'
});
```

## 🔒 **Безопасность**

### Аутентификация
- **NextAuth** - основная система аутентификации
- **Telegram WebApp** - интеграция с Telegram
- **JWT токены** - для API запросов

### Шифрование
- **AES-256-GCM** - шифрование персональных данных
- **HTTPS** - защищенная передача данных
- **API ключи** - защита внешних сервисов

## 📊 **Мониторинг**

### Метрики
- **Prometheus** - сбор метрик
- **Grafana** - визуализация
- **Алерты** - уведомления о проблемах

### Логирование
- **Структурированные логи** - JSON формат
- **Уровни логирования** - DEBUG, INFO, WARN, ERROR
- **Ротация логов** - автоматическая очистка

## 🚀 **Развертывание**

### Локальная разработка
```bash
# Установка зависимостей
npm install

# Инициализация базы данных
npm run db:init

# Запуск в режиме разработки
npm run dev:all
```

### Продакшен
```bash
# Сборка приложения
npm run build

# Запуск продакшена
npm start
```

## 🔧 **Обслуживание**

### Резервное копирование
- **PostgreSQL** - ежедневные бэкапы
- **S3** - версионирование файлов
- **Конфигурация** - Git репозиторий

### Мониторинг
- **Здоровье сервисов** - проверка доступности
- **Производительность** - метрики времени ответа
- **Использование ресурсов** - CPU, память, диск

## 📈 **Масштабирование**

### Горизонтальное масштабирование
- **Load Balancer** - распределение нагрузки
- **Множественные инстансы** - репликация приложения
- **Кэширование** - Redis для сессий

### Вертикальное масштабирование
- **Увеличение ресурсов** - CPU, RAM, диск
- **Оптимизация запросов** - индексы БД
- **CDN** - кэширование статических файлов

## 🛠️ **Устранение неполадок**

### Частые проблемы
1. **Ошибки подключения к БД** - проверка DATABASE_URL
2. **Проблемы с S3** - проверка ключей доступа
3. **Ошибки Telegram Bot** - проверка токена
4. **Проблемы с AI** - проверка OpenAI API ключа

### Логи и отладка
```bash
# Просмотр логов
tail -f logs/app.log

# Отладка базы данных
npm run db:studio

# Проверка подключений
npm run health-check
```

---

**Важно:** Все сервисы должны быть настроены в соответствии с российским законодательством и требованиями безопасности.
