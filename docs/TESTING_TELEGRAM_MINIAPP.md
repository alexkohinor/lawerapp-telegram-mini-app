# 🧪 Тестирование Telegram Mini App

## 📋 **Способы тестирования LawerApp**

### 1. **🌐 Локальное тестирование в браузере**

#### Запуск приложения:
```bash
npm run dev
```

#### Доступные URL:
- **Главная страница**: http://localhost:3000
- **Тестовая страница**: http://localhost:3000/test
- **API Health Check**: http://localhost:3000/api/health

#### Что можно протестировать:
- ✅ Отображение интерфейса
- ✅ Навигация между страницами
- ✅ API endpoints
- ✅ Базовые функции React

### 2. **📱 Тестирование в Telegram WebApp**

#### Способ 1: Через Telegram Bot
1. Откройте Telegram
2. Найдите бота: [@miniappadvokat_bot](https://t.me/miniappadvokat_bot)
3. Нажмите "Запустить" или отправьте `/start`
4. Нажмите на кнопку Mini App

#### Способ 2: Прямая ссылка
```
https://t.me/miniappadvokat_bot?startapp=lawerapp
```

#### Что можно протестировать в Telegram:
- ✅ Telegram WebApp API
- ✅ Вибрация (Haptic Feedback)
- ✅ Уведомления
- ✅ Cloud Storage
- ✅ Интеграция с Telegram
- ✅ Закрытие приложения

### 3. **🔧 Автоматическое тестирование**

#### Запуск тестового скрипта:
```bash
node scripts/test-telegram-miniapp.js
```

#### Что проверяет скрипт:
- ✅ Локальное приложение работает
- ✅ Telegram Bot активен
- ✅ Webhook настроен
- ✅ API endpoints отвечают
- ✅ Создает тестовую HTML страницу

### 4. **📊 Проверка компонентов**

#### Health Check API:
```bash
curl http://localhost:3000/api/health
```

**Ожидаемый ответ:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-19T09:58:32.640Z",
  "version": "1.0.0",
  "services": {
    "database": {"status": "healthy", "message": "Database connection OK"},
    "storage": {"status": "healthy", "message": "S3 storage configured"},
    "telegram": {"status": "healthy", "message": "Telegram bot configured"}
  }
}
```

#### Webhook API:
```bash
curl -X POST http://localhost:3000/api/telegram/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "update_id": 1,
    "message": {
      "message_id": 1,
      "from": {"id": 123456789, "first_name": "Test"},
      "chat": {"id": 123456789, "type": "private"},
      "date": 1697712000,
      "text": "/start"
    }
  }'
```

### 5. **🎯 Функциональное тестирование**

#### Тестовая страница `/test` включает:

1. **📱 Информация о Telegram:**
   - Версия WebApp
   - Платформа (iOS/Android/Desktop)
   - Тема (светлая/темная)
   - Данные пользователя

2. **🔧 Тестирование функций:**
   - **Вибрация**: Проверка Haptic Feedback
   - **Уведомления**: Показ alert в Telegram
   - **API**: Проверка health endpoint
   - **Webhook**: Тест обработки сообщений
   - **Storage**: Проверка Cloud Storage
   - **Закрытие**: Закрытие приложения

3. **📊 Результаты тестов:**
   - Логирование всех тестов
   - Цветовая индикация результатов
   - Временные метки

### 6. **🚀 Тестирование в продакшене**

#### После деплоя в TimeWeb Cloud:

1. **Проверка доступности:**
```bash
curl https://lawerapp.timeweb.cloud/api/health
```

2. **Тестирование в Telegram:**
   - Откройте бота в Telegram
   - Запустите Mini App
   - Проверьте все функции

3. **Мониторинг:**
   - Проверьте логи в TimeWeb Cloud
   - Мониторьте метрики производительности
   - Отслеживайте ошибки

### 7. **🐛 Отладка проблем**

#### Частые проблемы и решения:

1. **Приложение не загружается:**
   - Проверьте, что сервер запущен
   - Убедитесь, что порт 3000 свободен
   - Проверьте логи в консоли

2. **Telegram WebApp не работает:**
   - Убедитесь, что открыто в Telegram
   - Проверьте, что бот активен
   - Проверьте webhook настройки

3. **API не отвечает:**
   - Проверьте переменные окружения
   - Убедитесь, что база данных доступна
   - Проверьте логи сервера

4. **Ошибки в консоли:**
   - Откройте DevTools в браузере
   - Проверьте Network tab
   - Изучите ошибки JavaScript

### 8. **📈 Метрики тестирования**

#### Ключевые показатели:
- **Время загрузки**: < 3 секунд
- **Время ответа API**: < 1 секунды
- **Доступность**: > 99%
- **Ошибки**: < 1%

#### Инструменты мониторинга:
- **Локально**: Browser DevTools
- **Продакшен**: TimeWeb Cloud мониторинг
- **Telegram**: Bot API статистика

### 9. **✅ Чек-лист тестирования**

#### Перед релизом проверьте:

- [ ] Приложение загружается в браузере
- [ ] Все страницы доступны
- [ ] API endpoints работают
- [ ] Telegram Bot отвечает
- [ ] Mini App запускается в Telegram
- [ ] Все функции работают
- [ ] Нет ошибок в консоли
- [ ] Производительность в норме
- [ ] Безопасность настроена
- [ ] Мониторинг активен

### 10. **🔗 Полезные ссылки**

- **Telegram Bot**: [@miniappadvokat_bot](https://t.me/miniappadvokat_bot)
- **Локальное тестирование**: http://localhost:3000/test
- **API Health**: http://localhost:3000/api/health
- **Документация Telegram WebApp**: https://core.telegram.org/bots/webapps
- **TimeWeb Cloud**: https://timeweb.com/cloud

---

**🎉 LawerApp готов к тестированию!**

Следуйте инструкциям выше для полного тестирования всех функций приложения.
