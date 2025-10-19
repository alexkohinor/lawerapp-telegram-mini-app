#!/usr/bin/env tsx

/**
 * Скрипт для настройки Telegram Web App URL
 * Устанавливает URL Mini App в Telegram боте
 */

import https from 'https';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

interface TelegramResponse {
  ok: boolean;
  result?: any;
  description?: string;
}

function makeTelegramRequest(method: string, data: any): Promise<TelegramResponse> {
  return new Promise((resolve, reject) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      reject(new Error('TELEGRAM_BOT_TOKEN не найден в переменных окружения'));
      return;
    }

    const postData = JSON.stringify(data);
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${botToken}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          reject(new Error(`Ошибка парсинга ответа: ${error instanceof Error ? error.message : String(error)}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function getBotInfo(): Promise<void> {
  try {
    log('🤖 Получение информации о боте...', 'blue');
    const response = await makeTelegramRequest('getMe', {});
    
    if (response.ok) {
      const bot = response.result;
      log(`✅ Бот найден: @${bot.username} (${bot.first_name})`, 'green');
      log(`   ID: ${bot.id}`, 'cyan');
      log(`   Может присоединяться к группам: ${bot.can_join_groups ? 'Да' : 'Нет'}`, 'cyan');
      log(`   Может читать сообщения: ${bot.can_read_all_group_messages ? 'Да' : 'Нет'}`, 'cyan');
    } else {
      log(`❌ Ошибка получения информации о боте: ${response.description}`, 'red');
    }
  } catch (error) {
    log(`❌ Ошибка запроса к Telegram API: ${error instanceof Error ? error.message : String(error)}`, 'red');
  }
}

async function setWebAppUrl(webAppUrl: string): Promise<void> {
  try {
    log(`🌐 Установка Web App URL: ${webAppUrl}`, 'blue');
    
    const response = await makeTelegramRequest('setWebhook', {
      url: `${webAppUrl}/api/telegram/webhook`,
      allowed_updates: ['message', 'callback_query'],
    });
    
    if (response.ok) {
      log('✅ Webhook успешно установлен', 'green');
      log(`   URL: ${webAppUrl}/api/telegram/webhook`, 'cyan');
    } else {
      log(`❌ Ошибка установки webhook: ${response.description}`, 'red');
    }
  } catch (error) {
    log(`❌ Ошибка установки webhook: ${error instanceof Error ? error.message : String(error)}`, 'red');
  }
}

async function setBotCommands(): Promise<void> {
  try {
    log('📝 Установка команд бота...', 'blue');
    
    const commands = [
      {
        command: 'start',
        description: '🚀 Запустить LawerApp - получить правовую помощь'
      },
      {
        command: 'help',
        description: '❓ Помощь по использованию бота'
      },
      {
        command: 'info',
        description: 'ℹ️ Информация о LawerApp'
      },
      {
        command: 'consultation',
        description: '⚖️ Получить правовую консультацию'
      },
      {
        command: 'dispute',
        description: '📋 Создать правовой спор'
      },
      {
        command: 'documents',
        description: '📄 Управление документами'
      }
    ];
    
    const response = await makeTelegramRequest('setMyCommands', { commands });
    
    if (response.ok) {
      log('✅ Команды бота успешно установлены', 'green');
      commands.forEach(cmd => {
        log(`   /${cmd.command} - ${cmd.description}`, 'cyan');
      });
    } else {
      log(`❌ Ошибка установки команд: ${response.description}`, 'red');
    }
  } catch (error) {
    log(`❌ Ошибка установки команд: ${error instanceof Error ? error.message : String(error)}`, 'red');
  }
}

async function getWebhookInfo(): Promise<void> {
  try {
    log('🔍 Проверка текущего webhook...', 'blue');
    
    const response = await makeTelegramRequest('getWebhookInfo', {});
    
    if (response.ok) {
      const webhookInfo = response.result;
      if (webhookInfo.url) {
        log(`✅ Webhook установлен: ${webhookInfo.url}`, 'green');
        log(`   Последняя ошибка: ${webhookInfo.last_error_message || 'Нет'}`, 'cyan');
        log(`   Количество ошибок: ${webhookInfo.pending_update_count}`, 'cyan');
      } else {
        log('⚠️ Webhook не установлен', 'yellow');
      }
    } else {
      log(`❌ Ошибка получения информации о webhook: ${response.description}`, 'red');
    }
  } catch (error) {
    log(`❌ Ошибка получения информации о webhook: ${error instanceof Error ? error.message : String(error)}`, 'red');
  }
}

async function main() {
  log('🚀 Настройка Telegram Web App', 'bright');
  log('='.repeat(50), 'blue');

  // Проверяем переменные окружения
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const webAppUrl = process.env.TELEGRAM_WEBAPP_URL || process.env.NEXT_PUBLIC_APP_URL;

  if (!botToken) {
    log('❌ TELEGRAM_BOT_TOKEN не найден в переменных окружения', 'red');
    log('   Добавьте TELEGRAM_BOT_TOKEN в .env.local', 'yellow');
    process.exit(1);
  }

  if (!webAppUrl) {
    log('❌ TELEGRAM_WEBAPP_URL не найден в переменных окружения', 'red');
    log('   Добавьте TELEGRAM_WEBAPP_URL в .env.local', 'yellow');
    process.exit(1);
  }

  log(`🤖 Bot Token: ${botToken.substring(0, 10)}...`, 'cyan');
  log(`🌐 Web App URL: ${webAppUrl}`, 'cyan');
  log('');

  // Получаем информацию о боте
  await getBotInfo();
  log('');

  // Устанавливаем команды бота
  await setBotCommands();
  log('');

  // Устанавливаем webhook
  await setWebAppUrl(webAppUrl);
  log('');

  // Проверяем webhook
  await getWebhookInfo();
  log('');

  log('🎉 Настройка Telegram Web App завершена!', 'green');
  log('');
  log('📚 Следующие шаги:', 'bright');
  log('1. Убедитесь, что приложение развернуто и доступно по URL', 'cyan');
  log('2. Протестируйте бота, отправив команду /start', 'cyan');
  log('3. Проверьте работу Mini App через кнопку в боте', 'cyan');
  log('');
  log('🔧 Полезные команды:', 'bright');
  log('• npm run bot:polling  - Запуск бота в polling режиме', 'cyan');
  log('• npm run dev         - Запуск приложения в режиме разработки', 'cyan');
  log('• npm run build       - Сборка для продакшена', 'cyan');
}

main().catch((error) => {
  log('❌ Критическая ошибка:', 'red');
  log(`   ${error instanceof Error ? error.message : String(error)}`, 'red');
  process.exit(1);
});
