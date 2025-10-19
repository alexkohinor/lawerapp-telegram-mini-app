/**
 * Скрипт для настройки Telegram Webhook
 */

import { Bot } from 'grammy';

async function setupWebhook() {
  const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || '');
  
  try {
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`;
    
    console.log('🔗 Настройка webhook...');
    console.log(`URL: ${webhookUrl}`);
    
    // Устанавливаем webhook
    await bot.api.setWebhook(webhookUrl, {
      secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
      allowed_updates: ['message', 'callback_query'],
      drop_pending_updates: true
    });
    
    console.log('✅ Webhook установлен успешно!');
    
    // Получаем информацию о webhook
    const webhookInfo = await bot.api.getWebhookInfo();
    console.log('📊 Информация о webhook:');
    console.log(`URL: ${webhookInfo.url}`);
    console.log(`Pending updates: ${webhookInfo.pending_update_count}`);
    console.log(`Last error: ${webhookInfo.last_error_message || 'Нет ошибок'}`);
    
  } catch (error) {
    console.error('❌ Ошибка настройки webhook:', error);
  }
}

// Запускаем настройку
setupWebhook();
