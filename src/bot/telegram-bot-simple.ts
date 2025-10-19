/**
 * Упрощенный Telegram Bot для LawerApp
 * Без сложных зависимостей для локального тестирования
 */

import { Bot } from 'grammy';

// Создаем экземпляр бота с предустановленной информацией
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || '8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8', {
  botInfo: {
    id: 8208499008,
    is_bot: true,
    first_name: 'МиниАпп для юрконсультаций',
    username: 'miniappadvokat_bot',
    can_join_groups: true,
    can_read_all_group_messages: false,
    supports_inline_queries: false,
    can_connect_to_business: false,
    has_main_web_app: false
  }
});

// Middleware для логирования
bot.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`[BOT] ${ctx.update.update_id} - ${ms}ms`);
});

// Команда /start
bot.command('start', async (ctx) => {
  console.log('📱 Получена команда /start от пользователя:', ctx.from?.first_name);
  
  const welcomeMessage = `
🏛️ Добро пожаловать в LawerApp!

Я - ваш персональный помощник для правовых консультаций с использованием искусственного интеллекта.

🤖 Что я умею:
• Давать правовые консультации
• Помогать с документами
• Отвечать на юридические вопросы
• Предоставлять информацию о законах

📱 Для использования Mini App нажмите кнопку ниже:

🔗 Ссылка на Mini App: https://t.me/miniappadvokat_bot?startapp=lawerapp

💡 Или используйте команды:
/help - помощь
/info - информация о боте
`;

  // Создаем inline клавиатуру с кнопками Mini App
  const keyboard = {
    inline_keyboard: [
      [
        {
          text: '🚀 Запустить LawerApp',
          web_app: { url: 'http://localhost:3000' }
        }
      ],
      [
        {
          text: '🌐 Открыть в браузере',
          url: 'http://localhost:3000'
        }
      ],
      [
        {
          text: '🧪 Тестовая страница',
          url: 'http://localhost:3000/test'
        }
      ]
    ]
  };

  await ctx.reply(welcomeMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
});

// Команда /help
bot.command('help', async (ctx) => {
  const helpMessage = `
📚 Справка по LawerApp

🔧 Доступные команды:
/start - запуск бота и Mini App
/help - эта справка
/info - информация о боте

📱 Mini App функции:
• Правовые консультации с AI
• Генерация документов
• Управление спорами
• Платежная система

🌐 Локальное тестирование:
• http://localhost:3000 - основное приложение
• http://localhost:3000/test - тестовая страница
• http://localhost:3000/api/health - проверка API

💡 Для полного тестирования откройте Mini App в Telegram
`;

  await ctx.reply(helpMessage, { parse_mode: 'HTML' });
});

// Команда /info
bot.command('info', async (ctx) => {
  const infoMessage = `
ℹ️ Информация о LawerApp

🤖 Бот: @miniappadvokat_bot
📱 Mini App: LawerApp Telegram Mini App
🔧 Версия: 1.0.0
🌐 Статус: Локальное тестирование

📊 Функции:
✅ Telegram Bot API
✅ Mini App интеграция
✅ AI консультации
✅ База данных PostgreSQL
✅ S3 хранилище
✅ Российские платежи

🔗 Ссылки:
• Mini App: https://t.me/miniappadvokat_bot?startapp=lawerapp
• Локальное приложение: http://localhost:3000
• GitHub: https://github.com/alexkohinor/lawerapp-telegram-mini-app
`;

  await ctx.reply(infoMessage, { parse_mode: 'HTML' });
});

// Обработчик всех остальных сообщений
bot.on('message', async (ctx) => {
  const message = ctx.message;
  
  if (message.text && !message.text.startsWith('/')) {
    console.log('💬 Получено сообщение:', message.text);
    
    const response = `
🤖 Спасибо за сообщение!

Для использования LawerApp:
1. Нажмите /start для запуска
2. Используйте Mini App для полного функционала
3. Или откройте http://localhost:3000 в браузере

💡 Mini App предоставляет полный доступ ко всем функциям приложения.
`;

    await ctx.reply(response);
  }
});

// Обработчик ошибок
bot.catch((err) => {
  console.error('❌ Ошибка бота:', err);
});

// Экспорт для использования в API routes
export { bot };

// Функция для запуска бота
export async function startBot() {
  try {
    await bot.start();
    console.log('🤖 Telegram Bot запущен успешно!');
    
    // Устанавливаем команды бота
    await bot.api.setMyCommands([
      { command: 'start', description: 'Главное меню' },
      { command: 'help', description: 'Справка по командам' },
      { command: 'info', description: 'Информация о боте' }
    ]);
    
    console.log('✅ Команды бота установлены');
  } catch (error) {
    console.error('❌ Ошибка запуска бота:', error);
  }
}

// Функция для остановки бота
export async function stopBot() {
  try {
    await bot.stop();
    console.log('🛑 Telegram Bot остановлен');
  } catch (error) {
    console.error('❌ Ошибка остановки бота:', error);
  }
}
