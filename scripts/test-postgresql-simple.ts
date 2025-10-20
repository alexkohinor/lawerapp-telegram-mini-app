/**
 * Простой тест подключения к PostgreSQL
 */

import { PrismaClient } from '@prisma/client';

async function testPostgreSQLConnection() {
  console.log('🐘 Тестирование подключения к PostgreSQL...');
  
  try {
    // Используем основную схему PostgreSQL
    const prisma = new PrismaClient();
    
    // Тестируем подключение
    await prisma.$connect();
    console.log('✅ Подключение к PostgreSQL установлено');
    
    // Проверяем доступность таблиц
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    console.log('✅ Таблицы в PostgreSQL:');
    (tables as any[]).forEach((table: any) => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Тестируем простой запрос
    const userCount = await prisma.user.count();
    console.log('✅ Количество пользователей в PostgreSQL:', userCount);
    
    // Тестируем создание тестового пользователя
    const testUser = await prisma.user.create({
      data: {
        telegramId: BigInt('9999999999'),
        telegramUsername: 'test_connection',
        firstName: 'Test',
        lastName: 'Connection',
        subscriptionPlan: 'free',
        isActive: true,
        documentsUsed: 0
      }
    });
    console.log('✅ Тестовый пользователь создан в PostgreSQL:', testUser.id);
    
    // Тестируем создание консультации
    const consultation = await prisma.consultation.create({
      data: {
        userId: testUser.id,
        question: 'Тестовый вопрос PostgreSQL',
        answer: 'Тестовый ответ PostgreSQL',
        status: 'completed',
        legalArea: 'civil-law',
        priority: 'medium',
        source: 'manual'
      }
    });
    console.log('✅ Тестовая консультация создана в PostgreSQL:', consultation.id);
    
    // Тестируем чтение с включением связанных данных
    const userWithRelations = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: {
        consultations: true
      }
    });
    console.log('✅ Пользователь с связанными данными получен:', {
      consultations: userWithRelations?.consultations.length
    });
    
    // Очищаем тестовые данные
    await prisma.consultation.delete({ where: { id: consultation.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✅ Тестовые данные очищены из PostgreSQL');
    
    await prisma.$disconnect();
    console.log('✅ Соединение с PostgreSQL закрыто');
    
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка подключения к PostgreSQL:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.log('💡 Подсказка: PostgreSQL сервер не запущен или недоступен');
        console.log('   Запустите PostgreSQL: brew services start postgresql');
      } else if (error.message.includes('ENOTFOUND')) {
        console.log('💡 Подсказка: Неверный хост PostgreSQL');
      } else if (error.message.includes('authentication failed')) {
        console.log('💡 Подсказка: Неверные учетные данные PostgreSQL');
      } else if (error.message.includes('database') && error.message.includes('does not exist')) {
        console.log('💡 Подсказка: База данных не существует');
        console.log('   Создайте БД: createdb lawerapp');
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('💡 Подсказка: Таблицы не существуют, выполните миграции');
        console.log('   Выполните: npx prisma migrate deploy');
      }
    }
    
    return false;
  }
}

// Основная функция тестирования
async function main() {
  console.log('🚀 Запуск простого тестирования PostgreSQL\n');
  
  try {
    const result = await testPostgreSQLConnection();
    
    if (result) {
      console.log('\n🎉 Тестирование PostgreSQL завершено успешно!');
      console.log('\n📊 Результаты:');
      console.log('✅ Подключение к БД - работает');
      console.log('✅ CRUD операции - работают');
      console.log('✅ Связи между таблицами - работают');
    } else {
      console.log('\n❌ Тестирование PostgreSQL завершилось с ошибками');
      console.log('\n🔧 Рекомендации:');
      console.log('1. Убедитесь, что PostgreSQL сервер запущен');
      console.log('2. Проверьте правильность DATABASE_URL в .env.local');
      console.log('3. Создайте базу данных: createdb lawerapp');
      console.log('4. Выполните миграции: npx prisma migrate deploy');
    }
    
  } catch (error) {
    console.error('\n💥 Критическая ошибка тестирования:', error);
    process.exit(1);
  }
}

// Запускаем тестирование
main().catch(console.error);
