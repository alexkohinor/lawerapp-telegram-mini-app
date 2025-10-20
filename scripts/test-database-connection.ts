/**
 * Скрипт для проверки подключения к базе данных PostgreSQL
 */

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Загружаем переменные окружения
config({ path: '.env.local' });

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    console.log('🔍 Проверка подключения к PostgreSQL...');
    console.log('📡 DATABASE_URL:', process.env.DATABASE_URL?.replace(/\/\/.*@/, '//***:***@'));

    // 1. Проверяем подключение
    console.log('\n1️⃣ Тестирование подключения...');
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно!');

    // 2. Проверяем версию PostgreSQL
    console.log('\n2️⃣ Проверка версии PostgreSQL...');
    const version = await prisma.$queryRaw`SELECT version()`;
    console.log('📊 Версия PostgreSQL:', version);

    // 3. Проверяем существующие таблицы
    console.log('\n3️⃣ Проверка существующих таблиц...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'lawerapp_%'
      ORDER BY table_name
    `;
    console.log('📋 Таблицы LawerApp:', tables);

    // 4. Проверяем права доступа
    console.log('\n4️⃣ Проверка прав доступа...');
    const permissions = await prisma.$queryRaw`
      SELECT 
        table_name,
        privilege_type
      FROM information_schema.table_privileges 
      WHERE grantee = current_user
      AND table_schema = 'public'
      AND table_name LIKE 'lawerapp_%'
      ORDER BY table_name, privilege_type
    `;
    console.log('🔐 Права доступа:', permissions);

    // 5. Тестируем создание простой таблицы
    console.log('\n5️⃣ Тестирование создания таблицы...');
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS lawerapp_test_connection (
          id SERIAL PRIMARY KEY,
          test_message TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;
      console.log('✅ Создание таблицы успешно');

      // Вставляем тестовую запись
      await prisma.$executeRaw`
        INSERT INTO lawerapp_test_connection (test_message) 
        VALUES ('Тест подключения LawerApp - ' || NOW())
      `;
      console.log('✅ Вставка данных успешна');

      // Читаем данные
      const testData = await prisma.$queryRaw`
        SELECT * FROM lawerapp_test_connection 
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      console.log('📖 Тестовые данные:', testData);

      // Удаляем тестовую таблицу
      await prisma.$executeRaw`DROP TABLE IF EXISTS lawerapp_test_connection`;
      console.log('✅ Очистка тестовой таблицы успешна');

    } catch (error) {
      console.error('❌ Ошибка тестирования таблицы:', error instanceof Error ? error.message : String(error));
    }

    // 6. Проверяем производительность
    console.log('\n6️⃣ Тестирование производительности...');
    const startTime = Date.now();
    
    // Выполняем простой запрос 10 раз
    for (let i = 0; i < 10; i++) {
      await prisma.$queryRaw`SELECT 1 as test`;
    }
    
    const endTime = Date.now();
    const avgTime = (endTime - startTime) / 10;
    console.log(`⚡ Среднее время запроса: ${avgTime.toFixed(2)}ms`);

    // 7. Проверяем размер базы данных
    console.log('\n7️⃣ Информация о базе данных...');
    const dbInfo = await prisma.$queryRaw`
      SELECT 
        pg_database.datname as database_name,
        pg_size_pretty(pg_database_size(pg_database.datname)) as database_size
      FROM pg_database 
      WHERE datname = current_database()
    `;
    console.log('💾 Информация о БД:', dbInfo);

    console.log('\n🎉 Все тесты подключения к базе данных прошли успешно!');
    console.log('✅ База данных готова для работы LawerApp');

  } catch (error) {
    console.error('\n❌ Ошибка подключения к базе данных:');
    console.error('🔍 Детали ошибки:', error instanceof Error ? error.message : String(error));
    
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('📋 Код ошибки:', (error as { code: string }).code);
    }
    
    if (error && typeof error === 'object' && 'meta' in error) {
      console.error('📊 Метаданные:', (error as { meta: unknown }).meta);
    }

    // Предложения по устранению
    console.log('\n💡 Возможные решения:');
    console.log('1. Проверьте правильность DATABASE_URL в .env.local');
    console.log('2. Убедитесь, что PostgreSQL сервер запущен');
    console.log('3. Проверьте права доступа пользователя к базе данных');
    console.log('4. Убедитесь, что база данных существует');
    console.log('5. Проверьте сетевые настройки и файрвол');

    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем тест
if (require.main === module) {
  testDatabaseConnection()
    .then(() => {
      console.log('\n✅ Тест подключения завершен успешно');
      process.exit(0);
    })
    .catch(() => {
      console.error('\n❌ Тест подключения завершен с ошибкой');
      process.exit(1);
    });
}

export { testDatabaseConnection };
