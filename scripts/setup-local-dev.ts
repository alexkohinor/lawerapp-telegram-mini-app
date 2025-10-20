#!/usr/bin/env tsx

/**
 * Скрипт для автоматической настройки локальной среды разработки
 * Создает .env.local, настраивает базу данных и проверяет зависимости
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

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

function checkCommand(command: string): boolean {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkNodeVersion(): boolean {
  try {
    const version = execSync('node --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
    if (majorVersion >= 18) {
      log(`✅ Node.js версия: ${version}`, 'green');
      return true;
    } else {
      log(`❌ Node.js версия ${version} слишком старая. Требуется 18+`, 'red');
      return false;
    }
  } catch {
    log('❌ Node.js не установлен', 'red');
    return false;
  }
}

function checkPostgreSQL(): boolean {
  if (checkCommand('psql')) {
    log('✅ PostgreSQL установлен', 'green');
    return true;
  } else {
    log('❌ PostgreSQL не установлен', 'red');
    log('   Установите PostgreSQL:', 'yellow');
    log('   macOS: brew install postgresql', 'cyan');
    log('   Ubuntu: sudo apt install postgresql postgresql-contrib', 'cyan');
    return false;
  }
}

function createEnvLocal(): void {
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envLocalPath)) {
    log('⚠️  Файл .env.local уже существует', 'yellow');
    return;
  }

  const envExamplePath = path.join(process.cwd(), 'env.example');
  if (!fs.existsSync(envExamplePath)) {
    log('❌ Файл env.example не найден', 'red');
    return;
  }

  let envContent = fs.readFileSync(envExamplePath, 'utf8');
  
  // Обновляем настройки для локальной разработки
  envContent = envContent
    .replace('TELEGRAM_WEBAPP_URL=https://your-domain.com', 'TELEGRAM_WEBAPP_URL=http://localhost:3000')
    .replace('DATABASE_URL=postgresql://username:password@host:port/database', 'DATABASE_URL=postgresql://lawerapp_user:lawerapp_password@localhost:5432/lawerapp_dev')
    .replace('DIRECT_URL=postgresql://username:password@host:port/database', 'DIRECT_URL=postgresql://lawerapp_user:lawerapp_password@localhost:5432/lawerapp_dev')
    .replace('NEXT_PUBLIC_APP_URL=https://your-domain.com', 'NEXT_PUBLIC_APP_URL=http://localhost:3000')
    .replace('NODE_ENV=development', 'NODE_ENV=development')
    .replace('NEXT_PUBLIC_DEBUG=true', 'NEXT_PUBLIC_DEBUG=true');

  // Добавляем локальные настройки безопасности
  envContent += '\n# Local Development Security\n';
  envContent += 'NEXTAUTH_SECRET=local_nextauth_secret_key_for_development_only\n';
  envContent += 'NEXTAUTH_URL=http://localhost:3000\n';
  envContent += 'JWT_SECRET=local_jwt_secret_key_for_development_only\n';
  envContent += 'ENCRYPTION_KEY=local_encryption_key_32_chars_long\n';

  fs.writeFileSync(envLocalPath, envContent);
  log('✅ Создан файл .env.local с локальными настройками', 'green');
}

function setupDatabase(): void {
  log('🗄️  Настройка локальной базы данных...', 'blue');
  
  try {
    // Создаем базу данных и пользователя
    const commands = [
      'psql postgres -c "CREATE DATABASE lawerapp_dev;" 2>/dev/null || true',
      'psql postgres -c "CREATE USER lawerapp_user WITH PASSWORD \'lawerapp_password\';" 2>/dev/null || true',
      'psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE lawerapp_dev TO lawerapp_user;" 2>/dev/null || true',
    ];

    for (const command of commands) {
      try {
        execSync(command, { stdio: 'ignore' });
      } catch {
        // Игнорируем ошибки (база данных или пользователь уже существуют)
      }
    }

    log('✅ База данных lawerapp_dev настроена', 'green');
  } catch (error) {
    log('❌ Ошибка настройки базы данных:', 'red');
    log(`   ${error instanceof Error ? error.message : String(error)}`, 'red');
    log('   Убедитесь, что PostgreSQL запущен и доступен', 'yellow');
  }
}

function installDependencies(): void {
  log('📦 Установка зависимостей...', 'blue');
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    log('✅ Зависимости установлены', 'green');
  } catch (error) {
    log('❌ Ошибка установки зависимостей:', 'red');
    log(`   ${error instanceof Error ? error.message : String(error)}`, 'red');
  }
}

function generatePrismaClient(): void {
  log('🔧 Генерация Prisma клиента...', 'blue');
  
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    log('✅ Prisma клиент сгенерирован', 'green');
  } catch (error) {
    log('❌ Ошибка генерации Prisma клиента:', 'red');
    log(`   ${error instanceof Error ? error.message : String(error)}`, 'red');
  }
}

function testDatabaseConnection(): void {
  log('🔍 Тестирование подключения к базе данных...', 'blue');
  
  try {
    execSync('npm run db:test', { stdio: 'inherit' });
    log('✅ Подключение к базе данных работает', 'green');
  } catch (error) {
    log('❌ Ошибка подключения к базе данных:', 'red');
    log(`   ${error instanceof Error ? error.message : String(error)}`, 'red');
    log('   Проверьте настройки в .env.local', 'yellow');
  }
}

async function main() {
  log('🚀 Настройка локальной среды разработки LawerApp', 'bright');
  log('='.repeat(60), 'blue');

  // Проверяем системные требования
  log('📋 Проверка системных требований...', 'blue');
  
  const nodeOk = checkNodeVersion();
  const postgresOk = checkPostgreSQL();
  
  if (!nodeOk || !postgresOk) {
    log('❌ Системные требования не выполнены', 'red');
    process.exit(1);
  }

  log('✅ Все системные требования выполнены', 'green');
  log('');

  // Создаем .env.local
  log('📝 Создание конфигурации...', 'blue');
  createEnvLocal();
  log('');

  // Настраиваем базу данных
  setupDatabase();
  log('');

  // Устанавливаем зависимости
  installDependencies();
  log('');

  // Генерируем Prisma клиент
  generatePrismaClient();
  log('');

  // Тестируем подключение к базе данных
  testDatabaseConnection();
  log('');

  log('🎉 Настройка завершена!', 'green');
  log('');
  log('📚 Следующие шаги:', 'bright');
  log('1. Запустите приложение: npm run dev', 'cyan');
  log('2. Откройте http://localhost:3000', 'cyan');
  log('3. Запустите бота: npm run bot:polling', 'cyan');
  log('4. Прочитайте документацию: docs/LOCAL_DEVELOPMENT_SETUP.md', 'cyan');
  log('');
  log('🔧 Полезные команды:', 'bright');
  log('• npm run dev          - Запуск в режиме разработки', 'cyan');
  log('• npm run build        - Сборка для продакшена', 'cyan');
  log('• npm run db:test      - Тест подключения к БД', 'cyan');
  log('• npm run bot:polling  - Запуск Telegram бота', 'cyan');
  log('• npx prisma studio    - Просмотр базы данных', 'cyan');
}

main().catch((error) => {
  log('❌ Критическая ошибка:', 'red');
  log(`   ${error instanceof Error ? error.message : String(error)}`, 'red');
  process.exit(1);
});
