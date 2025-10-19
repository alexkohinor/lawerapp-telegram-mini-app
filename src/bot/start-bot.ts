/**
 * Скрипт для запуска Telegram бота
 */

import { startBot } from './telegram-bot';

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
