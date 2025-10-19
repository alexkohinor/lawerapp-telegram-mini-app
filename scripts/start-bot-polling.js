/**
 * Запуск Telegram бота в polling режиме для локального тестирования
 */

const { Bot } = require('grammy');

// Конфигурация
const BOT_TOKEN = '8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8';
const BOT_USERNAME = 'miniappadvokat_bot';

// Создаем бота
const bot = new Bot(BOT_TOKEN);

// Обработчик команды /start
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

🔗 Ссылка на Mini App: https://t.me/${BOT_USERNAME}?startapp=lawerapp

💡 Или используйте команды:
/help - помощь
/info - информация о боте
`;

  // Для локального тестирования убираем все кнопки (Telegram требует HTTPS)
  await ctx.reply(welcomeMessage, {
    parse_mode: 'HTML'
  });
});

// Обработчик команды /help
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

// Обработчик команды /info
bot.command('info', async (ctx) => {
  const infoMessage = `
ℹ️ Информация о LawerApp

🤖 Бот: @${BOT_USERNAME}
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
• Mini App: https://t.me/${BOT_USERNAME}?startapp=lawerapp
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

// Запуск бота
async function startBot() {
  try {
    console.log('🚀 Запуск Telegram бота в polling режиме...');
    console.log('🤖 Бот:', BOT_USERNAME);
    console.log('📱 Mini App URL: http://localhost:3000');
    console.log('🔗 Telegram URL: https://t.me/' + BOT_USERNAME + '?startapp=lawerapp');
    console.log('⏳ Ожидание сообщений...');
    
    await bot.start();
  } catch (error) {
    console.error('❌ Ошибка запуска бота:', error);
    process.exit(1);
  }
}

// Обработка сигналов завершения
process.on('SIGINT', async () => {
  console.log('\n🛑 Остановка бота...');
  await bot.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Остановка бота...');
  await bot.stop();
  process.exit(0);
});

// Запускаем бота
startBot();
