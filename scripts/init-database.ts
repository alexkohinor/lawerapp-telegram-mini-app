/**
 * Скрипт для инициализации базы данных LawerApp
 * Использует PostgreSQL из advokat-fomin.ru
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function initDatabase() {
  try {
    console.log('🚀 Инициализация базы данных LawerApp...');

    // 1. Проверяем подключение к базе данных
    console.log('📡 Проверка подключения к PostgreSQL...');
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно');

    // 2. Выполняем миграции (создание таблиц)
    console.log('📋 Создание таблиц...');
    const schemaPath = path.join(__dirname, '../src/lib/database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Разбиваем SQL на отдельные команды
    const commands = schema
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    for (const command of commands) {
      if (command.trim()) {
        try {
          await prisma.$executeRawUnsafe(command);
          console.log(`✅ Выполнена команда: ${command.substring(0, 50)}...`);
        } catch (error) {
          // Игнорируем ошибки "уже существует"
          if (error instanceof Error && !error.message.includes('already exists')) {
            console.warn(`⚠️ Предупреждение: ${error.message}`);
          }
        }
      }
    }

    // 3. Создаем индексы
    console.log('🔍 Создание индексов...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_lawerapp_users_telegram_id ON lawerapp_users(telegram_id);
      CREATE INDEX IF NOT EXISTS idx_lawerapp_consultations_user_id ON lawerapp_consultations(user_id);
      CREATE INDEX IF NOT EXISTS idx_lawerapp_consultations_status ON lawerapp_consultations(status);
      CREATE INDEX IF NOT EXISTS idx_lawerapp_disputes_user_id ON lawerapp_disputes(user_id);
      CREATE INDEX IF NOT EXISTS idx_lawerapp_disputes_status ON lawerapp_disputes(status);
      CREATE INDEX IF NOT EXISTS idx_lawerapp_documents_user_id ON lawerapp_documents(user_id);
      CREATE INDEX IF NOT EXISTS idx_lawerapp_payments_user_id ON lawerapp_payments(user_id);
      CREATE INDEX IF NOT EXISTS idx_lawerapp_payments_status ON lawerapp_payments(status);
      CREATE INDEX IF NOT EXISTS idx_lawerapp_notifications_user_id ON lawerapp_notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_lawerapp_notifications_is_read ON lawerapp_notifications(is_read);
      CREATE INDEX IF NOT EXISTS idx_lawerapp_sessions_user_id ON lawerapp_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_lawerapp_sessions_expires_at ON lawerapp_sessions(expires_at);
    `);

    // 4. Создаем тестового пользователя
    console.log('👤 Создание тестового пользователя...');
    const testUser = await prisma.user.upsert({
      where: { telegramId: 123456789 },
      update: {},
      create: {
        telegramId: 123456789,
        telegramUsername: 'test_user',
        firstName: 'Тестовый',
        lastName: 'Пользователь',
        subscriptionPlan: 'premium',
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
      },
    });
    console.log(`✅ Создан тестовый пользователь: ${testUser.firstName} ${testUser.lastName}`);

    // 5. Создаем тестовую консультацию
    console.log('💬 Создание тестовой консультации...');
    const testConsultation = await prisma.consultation.create({
      data: {
        userId: testUser.id,
        question: 'Как оформить трудовой договор?',
        answer: 'Для оформления трудового договора необходимо...',
        legalArea: 'labor',
        status: 'completed',
        tokensUsed: 150,
        completedAt: new Date(),
      },
    });
    console.log(`✅ Создана тестовая консультация: ${testConsultation.id}`);

    // 6. Создаем тестовый спор
    console.log('⚖️ Создание тестового спора...');
    const testDispute = await prisma.dispute.create({
      data: {
        userId: testUser.id,
        title: 'Спор с работодателем о зарплате',
        description: 'Работодатель не выплачивает премию согласно договору',
        legalArea: 'labor',
        status: 'active',
        priority: 'high',
        estimatedValue: 50000,
      },
    });
    console.log(`✅ Создан тестовый спор: ${testDispute.title}`);

    // 7. Проверяем статистику
    console.log('📊 Статистика базы данных:');
    const userCount = await prisma.user.count();
    const consultationCount = await prisma.consultation.count();
    const disputeCount = await prisma.dispute.count();
    const documentCount = await prisma.document.count();
    const paymentCount = await prisma.payment.count();

    console.log(`👥 Пользователи: ${userCount}`);
    console.log(`💬 Консультации: ${consultationCount}`);
    console.log(`⚖️ Споры: ${disputeCount}`);
    console.log(`📄 Документы: ${documentCount}`);
    console.log(`💳 Платежи: ${paymentCount}`);

    console.log('🎉 Инициализация базы данных завершена успешно!');

  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем инициализацию
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('✅ Скрипт завершен успешно');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Ошибка выполнения скрипта:', error);
      process.exit(1);
    });
}

export { initDatabase };
