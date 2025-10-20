/**
 * Скрипт для запуска Telegram бота
 */

import { config } from 'dotenv';
import { startBot } from './telegram-bot';

// Загружаем переменные окружения
config({ path: '.env.local' });

// Запускаем бота
startBot().catch(console.error);

// Обработка сигналов для graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Получен сигнал SIGINT, останавливаем бота...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Получен сигнал SIGTERM, останавливаем бота...');
  process.exit(0);
});
