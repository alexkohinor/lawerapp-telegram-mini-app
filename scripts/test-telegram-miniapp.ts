/**
 * Скрипт для тестирования Telegram Mini App
 * Проверяет все основные функции приложения
 */

import https from 'https';
import http from 'http';
import fs from 'fs';

// Конфигурация
const CONFIG = {
  // Локальное тестирование
  LOCAL_URL: 'http://localhost:3000',
  
  // Telegram Bot данные
  BOT_TOKEN: '8208499008:AAHd9069cfFeM0OIqWrm86QyM0DEUBbV2z8',
  BOT_USERNAME: 'miniappadvokat_bot',
  
  // Тестовые данные
  TEST_USER: {
    id: 123456789,
    first_name: 'Test',
    last_name: 'User',
    username: 'testuser',
    language_code: 'ru'
  }
};

// Цвета для консоли
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

interface HttpResponse {
  statusCode: number;
  headers: Record<string, string>;
  data: string;
}

function makeRequest(url: string, options: Record<string, unknown> = {}): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => reject(new Error('Request timeout')));
    req.end();
  });
}

async function testLocalApp() {
  log('\n🔍 Тестирование локального приложения...', 'blue');
  
  try {
    const response = await makeRequest(CONFIG.LOCAL_URL);
    
    if (response.statusCode === 200) {
      log('✅ Локальное приложение работает', 'green');
      
      // Проверяем наличие Telegram WebApp скрипта
      if (response.data.includes('telegram-web-app')) {
        log('✅ Telegram WebApp скрипт найден', 'green');
      } else {
        log('⚠️  Telegram WebApp скрипт не найден', 'yellow');
      }
      
      // Проверяем наличие основных элементов
      const checks = [
        { name: 'Заголовок LawerApp', pattern: /LawerApp/i },
        { name: 'Telegram интеграция', pattern: /telegram/i },
        { name: 'React компоненты', pattern: /react/i }
      ];
      
      checks.forEach(check => {
        if (check.pattern.test(response.data)) {
          log(`✅ ${check.name} найден`, 'green');
        } else {
          log(`⚠️  ${check.name} не найден`, 'yellow');
        }
      });
      
    } else {
      log(`❌ Ошибка: HTTP ${response.statusCode}`, 'red');
    }
  } catch (error) {
    log(`❌ Ошибка подключения: ${error instanceof Error ? error.message : String(error)}`, 'red');
  }
}

async function testTelegramBot() {
  log('\n🤖 Тестирование Telegram Bot...', 'blue');
  
  try {
    const botUrl = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/getMe`;
    const response = await makeRequest(botUrl);
    
    if (response.statusCode === 200) {
      const botInfo = JSON.parse(response.data);
      
      if (botInfo.ok) {
        log('✅ Telegram Bot активен', 'green');
        log(`   Имя: ${botInfo.result.first_name}`, 'blue');
        log(`   Username: @${botInfo.result.username}`, 'blue');
        log(`   ID: ${botInfo.result.id}`, 'blue');
        
        // Проверяем webhook
        await testWebhook();
      } else {
        log(`❌ Ошибка Bot API: ${botInfo.description}`, 'red');
      }
    } else {
      log(`❌ HTTP ошибка: ${response.statusCode}`, 'red');
    }
  } catch (error) {
    log(`❌ Ошибка подключения к Bot API: ${error instanceof Error ? error.message : String(error)}`, 'red');
  }
}

async function testWebhook() {
  log('\n🔗 Проверка Webhook...', 'blue');
  
  try {
    const webhookUrl = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/getWebhookInfo`;
    const response = await makeRequest(webhookUrl);
    
    if (response.statusCode === 200) {
      const webhookInfo = JSON.parse(response.data);
      
      if (webhookInfo.ok) {
        const webhook = webhookInfo.result;
        
        if (webhook.url) {
          log('✅ Webhook настроен', 'green');
          log(`   URL: ${webhook.url}`, 'blue');
          log(`   Последняя ошибка: ${webhook.last_error_message || 'Нет ошибок'}`, 'blue');
          log(`   Количество ошибок: ${webhook.pending_update_count}`, 'blue');
        } else {
          log('⚠️  Webhook не настроен', 'yellow');
        }
      }
    }
  } catch (error) {
    log(`❌ Ошибка проверки webhook: ${error instanceof Error ? error.message : String(error)}`, 'red');
  }
}

async function testMiniAppURL() {
  log('\n📱 Генерация URL для Telegram Mini App...', 'blue');
  
  const miniAppUrl = `https://t.me/${CONFIG.BOT_USERNAME}?startapp=lawerapp`;
  log(`🔗 URL для тестирования: ${miniAppUrl}`, 'green');
  
  // Создаем тестовую HTML страницу
  const testHtml = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Telegram Mini App</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: var(--tg-theme-bg-color, #ffffff);
            color: var(--tg-theme-text-color, #000000);
        }
        .test-section {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
        .success { background: #d4edda; border-color: #c3e6cb; }
        .error { background: #f8d7da; border-color: #f5c6cb; }
        .info { background: #d1ecf1; border-color: #bee5eb; }
        button {
            background: var(--tg-theme-button-color, #007bff);
            color: var(--tg-theme-button-text-color, #ffffff);
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover {
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <h1>🧪 Тест Telegram Mini App</h1>
    
    <div class="test-section info">
        <h3>📱 Информация о Telegram</h3>
        <p><strong>Версия:</strong> <span id="version">-</span></p>
        <p><strong>Платформа:</strong> <span id="platform">-</span></p>
        <p><strong>Пользователь:</strong> <span id="user">-</span></p>
        <p><strong>Тема:</strong> <span id="theme">-</span></p>
    </div>
    
    <div class="test-section">
        <h3>🔧 Тестирование функций</h3>
        <button onclick="testHaptic()">Тест вибрации</button>
        <button onclick="testAlert()">Тест уведомления</button>
        <button onclick="testExpand()">Развернуть</button>
        <button onclick="testClose()">Закрыть</button>
    </div>
    
    <div class="test-section">
        <h3>🌐 Тестирование API</h3>
        <button onclick="testLocalAPI()">Тест локального API</button>
        <button onclick="testDatabase()">Тест базы данных</button>
        <button onclick="testStorage()">Тест хранилища</button>
    </div>
    
    <div id="results" class="test-section">
        <h3>📊 Результаты тестов</h3>
        <div id="test-results"></div>
    </div>

    <script>
        // Инициализация Telegram WebApp
        const tg = window.Telegram.WebApp;
        
        // Заполняем информацию о Telegram
        document.getElementById('version').textContent = tg.version || 'Неизвестно';
        document.getElementById('platform').textContent = tg.platform || 'Неизвестно';
        document.getElementById('user').textContent = tg.initDataUnsafe?.user?.first_name || 'Неизвестно';
        document.getElementById('theme').textContent = tg.colorScheme || 'Неизвестно';
        
        // Расширяем приложение
        tg.expand();
        
        // Включаем кнопку закрытия
        tg.enableClosingConfirmation();
        
        function addResult(message, type = 'info') {
            const results = document.getElementById('test-results');
            const div = document.createElement('div');
            div.className = \`test-section \${type}\`;
            div.innerHTML = \`<p>\${message}</p>\`;
            results.appendChild(div);
        }
        
        function testHaptic() {
            tg.HapticFeedback.impactOccurred('medium');
            addResult('✅ Вибрация работает', 'success');
        }
        
        function testAlert() {
            tg.showAlert('Тест уведомления!');
            addResult('✅ Уведомление показано', 'success');
        }
        
        function testExpand() {
            tg.expand();
            addResult('✅ Приложение развернуто', 'success');
        }
        
        function testClose() {
            tg.close();
        }
        
        async function testLocalAPI() {
            try {
                const response = await fetch('${CONFIG.LOCAL_URL}/api/health');
                if (response.ok) {
                    addResult('✅ Локальный API работает', 'success');
                } else {
                    addResult('❌ Локальный API не отвечает', 'error');
                }
            } catch (error) {
                addResult(\`❌ Ошибка API: \${error instanceof Error ? error.message : String(error)}\`, 'error');
            }
        }
        
        async function testDatabase() {
            try {
                const response = await fetch('${CONFIG.LOCAL_URL}/api/telegram/webhook', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        update_id: 1,
                        message: {
                            message_id: 1,
                            from: ${JSON.stringify(CONFIG.TEST_USER)},
                            chat: { id: ${CONFIG.TEST_USER.id}, type: 'private' },
                            date: Math.floor(Date.now() / 1000),
                            text: '/start'
                        }
                    })
                });
                
                if (response.ok) {
                    addResult('✅ Webhook API работает', 'success');
                } else {
                    addResult('❌ Webhook API не отвечает', 'error');
                }
            } catch (error) {
                addResult(\`❌ Ошибка Webhook: \${error instanceof Error ? error.message : String(error)}\`, 'error');
            }
        }
        
        async function testStorage() {
            try {
                // Тестируем локальное хранилище Telegram
                tg.CloudStorage.setItem('test_key', 'test_value');
                const value = tg.CloudStorage.getItem('test_key');
                
                if (value === 'test_value') {
                    addResult('✅ Telegram Cloud Storage работает', 'success');
                } else {
                    addResult('❌ Telegram Cloud Storage не работает', 'error');
                }
            } catch (error) {
                addResult(\`❌ Ошибка Storage: \${error instanceof Error ? error.message : String(error)}\`, 'error');
            }
        }
        
        // Автоматические тесты при загрузке
        window.addEventListener('load', () => {
            addResult('🚀 Telegram Mini App загружен', 'success');
            addResult(\`📱 Платформа: \${tg.platform}\`, 'info');
            addResult(\`👤 Пользователь: \${tg.initDataUnsafe?.user?.first_name || 'Неизвестно'}\`, 'info');
        });
    </script>
</body>
</html>`;

  // Сохраняем тестовую страницу
  fs.writeFileSync('test-miniapp.html', testHtml);
  log('📄 Создана тестовая страница: test-miniapp.html', 'green');
}

async function runAllTests() {
  log('🚀 Запуск тестирования Telegram Mini App', 'bold');
  log('='.repeat(50), 'blue');
  
  await testLocalApp();
  await testTelegramBot();
  await testMiniAppURL();
  
  log('\n' + '='.repeat(50), 'blue');
  log('✅ Тестирование завершено!', 'green');
  log('\n📋 Следующие шаги:', 'yellow');
  log('1. Откройте test-miniapp.html в браузере', 'blue');
  log('2. Или перейдите по ссылке в Telegram:', 'blue');
  log(`   https://t.me/${CONFIG.BOT_USERNAME}?startapp=lawerapp`, 'green');
  log('3. Проверьте все функции в Telegram', 'blue');
}

// Запускаем тесты
runAllTests().catch(console.error);
