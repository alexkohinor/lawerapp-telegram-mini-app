#!/usr/bin/env tsx

import https from 'https';
import http from 'http';

// Цвета для консоли
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

interface TelegramResponse {
  ok: boolean;
  result?: any;
  description?: string;
}

function makeRequest(url: string, options: any = {}): Promise<TelegramResponse> {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(new Error(`Invalid JSON response: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => reject(new Error('Request timeout')));
    req.end();
  });
}

async function getBotInfo(): Promise<void> {
  log('🤖 Получение информации о боте...', 'blue');
  
  try {
    const response = await makeRequest(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`
    );
    
    if (response.ok) {
      const bot = response.result;
      log(`✅ Бот найден: @${bot.username} (${bot.first_name})`, 'green');
      log(`   ID: ${bot.id}`, 'cyan');
      log(`   Может присоединяться к группам: ${bot.can_join_groups ? 'Да' : 'Нет'}`, 'cyan');
      log(`   Поддерживает inline запросы: ${bot.supports_inline_queries ? 'Да' : 'Нет'}`, 'cyan');
      log(`   Имеет главное Web App: ${bot.has_main_web_app ? 'Да' : 'Нет'}`, 'cyan');
    } else {
      log(`❌ Ошибка получения информации о боте: ${response.description}`, 'red');
    }
  } catch (error) {
    log(`❌ Ошибка подключения к Telegram API: ${error instanceof Error ? error.message : String(error)}`, 'red');
  }
}

async function setBotCommands(): Promise<void> {
  log('📋 Настройка команд бота...', 'blue');
  
  const commands = [
    { command: "start", description: "🚀 Запустить LawerApp - получить правовую помощь" },
    { command: "help", description: "❓ Помощь по использованию бота" },
    { command: "info", description: "ℹ️ Информация о LawerApp" },
    { command: "consultation", description: "⚖️ Получить правовую консультацию" },
    { command: "dispute", description: "📋 Создать правовой спор" },
    { command: "documents", description: "📄 Управление документами" }
  ];
  
  try {
    const response = await makeRequest(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setMyCommands`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (response.ok) {
      log(`✅ Команды бота настроены (${commands.length} команд)`, 'green');
      commands.forEach(cmd => {
        log(`   /${cmd.command} - ${cmd.description}`, 'cyan');
      });
    } else {
      log(`❌ Ошибка настройки команд: ${response.description}`, 'red');
    }
  } catch (error) {
    log(`❌ Ошибка настройки команд: ${error instanceof Error ? error.message : String(error)}`, 'red');
  }
}

async function setWebAppUrl(): Promise<void> {
  const webAppUrl = process.env.TELEGRAM_WEBAPP_URL;
  
  if (!webAppUrl) {
    log('⚠️ TELEGRAM_WEBAPP_URL не установлен. Пропускаем настройку Web App URL.', 'yellow');
    log('   Установите переменную: TELEGRAM_WEBAPP_URL=https://your-app.twc1.net', 'cyan');
    return;
  }
  
  log(`🌐 Настройка Web App URL: ${webAppUrl}`, 'blue');
  
  try {
    const response = await makeRequest(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebApp`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (response.ok) {
      log(`✅ Web App URL настроен: ${webAppUrl}`, 'green');
    } else {
      log(`❌ Ошибка настройки Web App URL: ${response.description}`, 'red');
    }
  } catch (error) {
    log(`❌ Ошибка настройки Web App URL: ${error instanceof Error ? error.message : String(error)}`, 'red');
  }
}

async function getWebAppInfo(): Promise<void> {
  log('🔍 Получение информации о Web App...', 'blue');
  
  try {
    const response = await makeRequest(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getWebApp`
    );
    
    if (response.ok) {
      const webApp = response.result;
      if (webApp && webApp.url) {
        log(`✅ Web App настроен: ${webApp.url}`, 'green');
      } else {
        log(`⚠️ Web App не настроен`, 'yellow');
      }
    } else {
      log(`❌ Ошибка получения информации о Web App: ${response.description}`, 'red');
    }
  } catch (error) {
    log(`❌ Ошибка получения информации о Web App: ${error instanceof Error ? error.message : String(error)}`, 'red');
  }
}

async function testWebAppUrl(): Promise<void> {
  const webAppUrl = process.env.TELEGRAM_WEBAPP_URL;
  
  if (!webAppUrl) {
    log('⚠️ TELEGRAM_WEBAPP_URL не установлен. Пропускаем тест доступности.', 'yellow');
    return;
  }
  
  log(`🧪 Тестирование доступности Web App: ${webAppUrl}`, 'blue');
  
  try {
    const response = await makeRequest(webAppUrl);
    log(`✅ Web App доступен (статус: ${response.ok ? 'OK' : 'Error'})`, 'green');
  } catch (error) {
    log(`❌ Web App недоступен: ${error instanceof Error ? error.message : String(error)}`, 'red');
    log('   Убедитесь, что приложение развернуто и доступно по HTTPS', 'yellow');
  }
}

async function setupMiniAppProduction(): Promise<void> {
  log('🚀 Настройка LawerApp Telegram Mini App для продакшена', 'bright');
  log('='.repeat(60), 'bright');
  
  // Проверка переменных окружения
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    log('❌ TELEGRAM_BOT_TOKEN не установлен', 'red');
    log('   Установите переменную: TELEGRAM_BOT_TOKEN=your_bot_token', 'cyan');
    process.exit(1);
  }
  
  log(`🔑 Используется токен: ${process.env.TELEGRAM_BOT_TOKEN.substring(0, 10)}...`, 'cyan');
  
  if (process.env.TELEGRAM_WEBAPP_URL) {
    log(`🌐 Web App URL: ${process.env.TELEGRAM_WEBAPP_URL}`, 'cyan');
  } else {
    log('⚠️ TELEGRAM_WEBAPP_URL не установлен', 'yellow');
  }
  
  log('');
  
  // Выполнение настройки
  await getBotInfo();
  log('');
  
  await setBotCommands();
  log('');
  
  await setWebAppUrl();
  log('');
  
  await getWebAppInfo();
  log('');
  
  await testWebAppUrl();
  log('');
  
  log('🎉 Настройка Mini App завершена!', 'green');
  log('');
  log('📚 Следующие шаги:', 'bright');
  log('1. Откройте бота @miniappadvokat_bot в Telegram', 'cyan');
  log('2. Отправьте команду /start', 'cyan');
  log('3. Нажмите кнопку Mini App (если настроена)', 'cyan');
  log('4. Протестируйте все функции приложения', 'cyan');
  log('');
  log('🔧 Полезные команды:', 'bright');
  log('• npm run dev         - Запуск в режиме разработки', 'cyan');
  log('• npm run bot:polling - Запуск бота в polling режиме', 'cyan');
  log('• npm run build       - Сборка для продакшена', 'cyan');
}

// Запуск скрипта
setupMiniAppProduction().catch(error => {
  log(`❌ Ошибка выполнения скрипта: ${error instanceof Error ? error.message : String(error)}`, 'red');
  process.exit(1);
});
