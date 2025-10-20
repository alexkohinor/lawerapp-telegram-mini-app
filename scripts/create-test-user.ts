#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('👤 Создание тестового пользователя для API...');

    const testUser = await prisma.user.create({
      data: {
        telegramId: BigInt(999999999),
        telegramUsername: 'api_test_user',
        firstName: 'API',
        lastName: 'Test',
        phone: '+79999999999',
        email: 'api@test.com',
      },
    });

    console.log(`✅ Тестовый пользователь создан: ${testUser.firstName} ${testUser.lastName}`);
    console.log(`   ID: ${testUser.id}`);
    console.log(`   Telegram ID: ${testUser.telegramId}`);
    console.log(`   Username: @${testUser.telegramUsername}`);

  } catch (error) {
    console.error('❌ Ошибка при создании пользователя:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
