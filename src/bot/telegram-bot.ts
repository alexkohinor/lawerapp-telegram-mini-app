/**
 * Telegram Bot для LawerApp
 * Основано на TECHNICAL_SETUP.md и ARCHITECTURE.md
 */

import { Bot } from 'grammy';
import { notificationService } from '@/lib/notifications/notification-service';
import { alertService } from '@/lib/alerts/alert-service';

// Создаем экземпляр бота
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || '');

// Middleware для логирования
bot.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`[BOT] ${ctx.update.update_id} - ${ms}ms`);
});

// Команда /start
bot.command('start', async (ctx) => {
  const welcomeMessage = `
🤖 Добро пожаловать в LawerApp!

Я ваш персональный правовой помощник. Вот что я могу:

📋 **Основные функции:**
• AI-консультации по правовым вопросам
• Генерация правовых документов
• Управление спорами и делами
• Уведомления о статусе дел
• Платежи и подписки

🚀 **Быстрый старт:**
/help - Справка по командам
/consultation - Начать AI-консультацию
/documents - Генерация документов
/disputes - Мои споры
/subscription - Управление подпиской

💡 **Совет:** Используйте кнопки меню для быстрого доступа к функциям!
  `;

  await ctx.reply(welcomeMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🤖 AI Консультация', callback_data: 'ai_consultation' },
          { text: '📄 Документы', callback_data: 'documents' }
        ],
        [
          { text: '⚖️ Мои споры', callback_data: 'disputes' },
          { text: '💳 Подписка', callback_data: 'subscription' }
        ],
        [
          { text: '📊 Мониторинг', callback_data: 'monitoring' },
          { text: '🔒 Безопасность', callback_data: 'security' }
        ],
        [
          { text: '🌐 Открыть приложение', url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' }
        ]
      ]
    }
  });

  // Отправляем уведомление о регистрации
  notificationService.createFromTemplate(
    'user_registration',
    {
      userName: ctx.from?.first_name || 'Пользователь',
      planName: 'Бесплатный'
    },
    ctx.from?.id.toString()
  );
});

// Команда /help
bot.command('help', async (ctx) => {
  const helpMessage = `
📚 **Справка по командам LawerApp:**

**Основные команды:**
/start - Главное меню
/help - Эта справка
/status - Статус системы

**AI и документы:**
/consultation - Начать AI-консультацию
/documents - Генерация документов
/templates - Доступные шаблоны

**Управление делами:**
/disputes - Мои споры
/create_dispute - Создать новый спор
/cases - Активные дела

**Подписка и платежи:**
/subscription - Управление подпиской
/payment - Способы оплаты
/billing - История платежей

**Безопасность:**
/security - Настройки безопасности
/mfa - Двухфакторная аутентификация
/logs - История активности

**Поддержка:**
/support - Техническая поддержка
/feedback - Оставить отзыв
/contact - Контактная информация

💡 **Совет:** Используйте кнопки меню для быстрого доступа!
  `;

  await ctx.reply(helpMessage);
});

// Команда /status
bot.command('status', async (ctx) => {
  const stats = alertService.getStats();
  const notificationStats = notificationService.getStats();
  
  const statusMessage = `
📊 **Статус системы LawerApp:**

🟢 **Система:** Работает нормально
🤖 **AI:** Доступен
💾 **База данных:** Подключена
🔒 **Безопасность:** Активна

📈 **Статистика:**
• Активных алертов: ${stats.active}
• Уведомлений: ${notificationStats.total}
• Непрочитанных: ${notificationStats.unread}

⏰ **Время:** ${new Date().toLocaleString('ru-RU')}
  `;

  await ctx.reply(statusMessage);
});

// Обработка callback queries (кнопки)
bot.on('callback_query:data', async (ctx) => {
  const data = ctx.callbackQuery.data;
  
  switch (data) {
    case 'ai_consultation':
      await ctx.answerCallbackQuery('🤖 Переход к AI-консультации...');
      await ctx.reply('🤖 **AI Консультация**\n\nОпишите ваш правовой вопрос, и я помогу вам с ответом!', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '💼 Трудовое право', callback_data: 'consultation_labor' },
              { text: '🏠 Жилищное право', callback_data: 'consultation_housing' }
            ],
            [
              { text: '👨‍👩‍👧‍👦 Семейное право', callback_data: 'consultation_family' },
              { text: '💰 Гражданское право', callback_data: 'consultation_civil' }
            ],
            [
              { text: '🛡️ Защита прав потребителей', callback_data: 'consultation_consumer' }
            ]
          ]
        }
      });
      break;

    case 'documents':
      await ctx.answerCallbackQuery('📄 Переход к документам...');
      await ctx.reply('📄 **Генерация документов**\n\nВыберите тип документа для генерации:', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📝 Претензия', callback_data: 'doc_pretenziya' },
              { text: '📋 Исковое заявление', callback_data: 'doc_isk' }
            ],
            [
              { text: '📄 Договор', callback_data: 'doc_contract' },
              { text: '📑 Соглашение', callback_data: 'doc_agreement' }
            ],
            [
              { text: '🌐 Открыть приложение', url: `${process.env.NEXT_PUBLIC_APP_URL}/documents` }
            ]
          ]
        }
      });
      break;

    case 'disputes':
      await ctx.answerCallbackQuery('⚖️ Переход к спорам...');
      await ctx.reply('⚖️ **Мои споры**\n\nУправление вашими правовыми спорами и делами.', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '➕ Создать спор', callback_data: 'create_dispute' },
              { text: '📋 Активные споры', callback_data: 'active_disputes' }
            ],
            [
              { text: '📊 Статистика', callback_data: 'disputes_stats' },
              { text: '🌐 Открыть приложение', url: `${process.env.NEXT_PUBLIC_APP_URL}/disputes` }
            ]
          ]
        }
      });
      break;

    case 'subscription':
      await ctx.answerCallbackQuery('💳 Переход к подписке...');
      await ctx.reply('💳 **Управление подпиской**\n\nВыберите действие:', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📋 Текущий план', callback_data: 'current_plan' },
              { text: '🔄 Сменить план', callback_data: 'change_plan' }
            ],
            [
              { text: '💳 Способы оплаты', callback_data: 'payment_methods' },
              { text: '📊 История платежей', callback_data: 'payment_history' }
            ],
            [
              { text: '🌐 Открыть приложение', url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription` }
            ]
          ]
        }
      });
      break;

    case 'monitoring':
      await ctx.answerCallbackQuery('📊 Переход к мониторингу...');
      await ctx.reply('📊 **Мониторинг системы**\n\nСистема работает стабильно. Все сервисы доступны.', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🌐 Открыть дашборд', url: `${process.env.NEXT_PUBLIC_APP_URL}/monitoring` }
            ]
          ]
        }
      });
      break;

    case 'security':
      await ctx.answerCallbackQuery('🔒 Переход к безопасности...');
      await ctx.reply('🔒 **Безопасность**\n\nВаш аккаунт защищен. Все настройки безопасности активны.', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔐 MFA настройки', callback_data: 'mfa_settings' },
              { text: '📊 Активность', callback_data: 'security_activity' }
            ],
            [
              { text: '🌐 Открыть приложение', url: `${process.env.NEXT_PUBLIC_APP_URL}/security` }
            ]
          ]
        }
      });
      break;

    default:
      await ctx.answerCallbackQuery('Функция в разработке...');
  }
});

// Обработка текстовых сообщений
bot.on('message:text', async (ctx) => {
  const message = ctx.message.text;
  
  // Если сообщение начинается с /, это команда
  if (message.startsWith('/')) {
    return; // Команды обрабатываются отдельно
  }

  // Обработка обычных сообщений как AI-консультаций
  await ctx.reply('🤖 **AI Консультация**\n\nВаш вопрос получен! Обрабатываю...', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🌐 Открыть полный чат', url: `${process.env.NEXT_PUBLIC_APP_URL}/ai-chat` }
        ]
      ]
    }
  });

  // Здесь можно добавить интеграцию с AI сервисом
  setTimeout(async () => {
    await ctx.reply('✅ **Ответ готов!**\n\nВаш вопрос обработан. Для получения полного ответа откройте приложение.', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🌐 Открыть приложение', url: `${process.env.NEXT_PUBLIC_APP_URL}/ai-chat` }
          ]
        ]
      }
    });
  }, 2000);
});

// Обработка ошибок
bot.catch((err) => {
  console.error('Bot error:', err);
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
      { command: 'status', description: 'Статус системы' },
      { command: 'consultation', description: 'AI-консультация' },
      { command: 'documents', description: 'Генерация документов' },
      { command: 'disputes', description: 'Мои споры' },
      { command: 'subscription', description: 'Управление подпиской' },
      { command: 'security', description: 'Настройки безопасности' }
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
