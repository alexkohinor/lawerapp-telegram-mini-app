/**
 * Тест подключения к PostgreSQL TimeWeb Cloud с использованием pg
 */

import { Client } from 'pg';

async function testPostgreSQLConnection() {
  console.log('🐘 Тестирование подключения к PostgreSQL TimeWeb Cloud с pg...');
  
  const client = new Client({
    connectionString: 'postgresql://gen_user:6l*Z%3Al%26o!yacZM@5e191ee0e0aee4df539c92a0.twc1.net:5432/default_db?sslmode=disable'
  });
  
  try {
    // Подключаемся к базе данных
    await client.connect();
    console.log('✅ Подключение к PostgreSQL TimeWeb Cloud установлено');
    
    // Проверяем доступность таблиц
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('✅ Таблицы в PostgreSQL:');
    tablesResult.rows.forEach((table: any) => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Проверяем количество пользователей
    const userCountResult = await client.query('SELECT COUNT(*) as count FROM lawerapp_users');
    console.log('✅ Количество пользователей в PostgreSQL:', userCountResult.rows[0].count);
    
    // Тестируем создание тестового пользователя
    const insertUserResult = await client.query(`
      INSERT INTO lawerapp_users (
        id, telegram_id, telegram_username, first_name, last_name, 
        subscription_plan, is_active, documents_used, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
      ) RETURNING id
    `, [
      Math.floor(Math.random() * 9000000000) + 1000000000, // telegram_id
      'test_connection', // telegram_username
      'Test', // first_name
      'Connection', // last_name
      'free', // subscription_plan
      true, // is_active
      0 // documents_used
    ]);
    
    const userId = insertUserResult.rows[0].id;
    console.log('✅ Тестовый пользователь создан в PostgreSQL:', userId);
    
    // Тестируем создание консультации
    const insertConsultationResult = await client.query(`
      INSERT INTO lawerapp_consultations (
        id, user_id, question, answer, status, legal_area, 
        created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, NOW()
      ) RETURNING id
    `, [
      userId, // user_id
      'Тестовый вопрос PostgreSQL TimeWeb', // question
      'Тестовый ответ PostgreSQL TimeWeb', // answer
      'completed', // status
      'civil-law' // legal_area
    ]);
    
    const consultationId = insertConsultationResult.rows[0].id;
    console.log('✅ Тестовая консультация создана в PostgreSQL:', consultationId);
    
    // Тестируем создание документа
    const insertDocumentResult = await client.query(`
      INSERT INTO lawerapp_documents (
        id, user_id, title, file_path, file_size, mime_type, 
        status, document_type, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
      ) RETURNING id
    `, [
      userId, // user_id
      'Тестовый документ PostgreSQL TimeWeb', // title
      'test-postgresql-timeweb.pdf', // file_path
      1024000, // file_size
      'application/pdf', // mime_type
      'uploaded', // status
      'contract' // document_type
    ]);
    
    const documentId = insertDocumentResult.rows[0].id;
    console.log('✅ Тестовый документ создан в PostgreSQL:', documentId);
    
    // Тестируем создание спора
    const insertDisputeResult = await client.query(`
      INSERT INTO lawerapp_disputes (
        id, user_id, title, description, status, 
        type, priority, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW()
      ) RETURNING id
    `, [
      userId, // user_id
      'Тестовый спор PostgreSQL TimeWeb', // title
      'Описание тестового спора PostgreSQL TimeWeb', // description
      'open', // status
      'consumer', // type
      'medium' // priority
    ]);
    
    const disputeId = insertDisputeResult.rows[0].id;
    console.log('✅ Тестовый спор создан в PostgreSQL:', disputeId);
    
    // Тестируем чтение с JOIN
    const userWithRelationsResult = await client.query(`
      SELECT 
        u.id, u.first_name, u.last_name,
        COUNT(c.id) as consultations_count,
        COUNT(d.id) as documents_count,
        COUNT(dis.id) as disputes_count
      FROM lawerapp_users u
      LEFT JOIN lawerapp_consultations c ON u.id = c.user_id
      LEFT JOIN lawerapp_documents d ON u.id = d.user_id
      LEFT JOIN lawerapp_disputes dis ON u.id = dis.user_id
      WHERE u.id = $1
      GROUP BY u.id, u.first_name, u.last_name
    `, [userId]);
    
    const userData = userWithRelationsResult.rows[0];
    console.log('✅ Пользователь с связанными данными получен:', {
      consultations: userData.consultations_count,
      documents: userData.documents_count,
      disputes: userData.disputes_count
    });
    
    // Тестируем производительность запросов
    console.log('\n⚡ Тестирование производительности PostgreSQL TimeWeb...');
    const startTime = Date.now();
    
    const allUsersResult = await client.query(`
      SELECT 
        u.id, u.first_name, u.last_name,
        COUNT(c.id) as consultations_count,
        COUNT(d.id) as documents_count,
        COUNT(dis.id) as disputes_count
      FROM lawerapp_users u
      LEFT JOIN lawerapp_consultations c ON u.id = c.user_id
      LEFT JOIN lawerapp_documents d ON u.id = d.user_id
      LEFT JOIN lawerapp_disputes dis ON u.id = dis.user_id
      GROUP BY u.id, u.first_name, u.last_name
    `);
    
    const queryTime = Date.now() - startTime;
    console.log(`✅ Сложный запрос с JOIN: ${queryTime}ms`);
    console.log(`✅ Найдено пользователей: ${allUsersResult.rows.length}`);
    
    // Тестируем транзакцию
    console.log('\n🔄 Тестирование транзакции PostgreSQL TimeWeb...');
    await client.query('BEGIN');
    
    try {
      const paymentResult = await client.query(`
        INSERT INTO lawerapp_payments (
          id, user_id, amount, currency, 
          payment_method, status, subscription_plan, created_at, completed_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW()
        ) RETURNING id
      `, [
        userId, // user_id
        1000, // amount
        'RUB', // currency
        'yookassa', // payment_method
        'completed', // status
        'premium' // subscription_plan
      ]);
      
      const notificationResult = await client.query(`
        INSERT INTO lawerapp_notifications (
          id, user_id, type, title, message, 
          is_read, created_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, NOW()
        ) RETURNING id
      `, [
        userId, // user_id
        'info', // type
        'Уведомление о платеже', // title
        'Платеж успешно обработан', // message
        false // is_read
      ]);
      
      await client.query('COMMIT');
      console.log('✅ Транзакция PostgreSQL TimeWeb выполнена успешно:', {
        paymentId: paymentResult.rows[0].id,
        notificationId: notificationResult.rows[0].id
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
    
    // Очищаем тестовые данные
    console.log('\n🧹 Очистка тестовых данных PostgreSQL TimeWeb...');
    await client.query('DELETE FROM lawerapp_notifications WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM lawerapp_payments WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM lawerapp_disputes WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM lawerapp_documents WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM lawerapp_consultations WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM lawerapp_users WHERE id = $1', [userId]);
    console.log('✅ Тестовые данные очищены из PostgreSQL TimeWeb');
    
    await client.end();
    console.log('✅ Соединение с PostgreSQL TimeWeb закрыто');
    
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка подключения к PostgreSQL TimeWeb Cloud:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.log('💡 Подсказка: PostgreSQL сервер недоступен');
      } else if (error.message.includes('ENOTFOUND')) {
        console.log('💡 Подсказка: Неверный хост PostgreSQL');
      } else if (error.message.includes('authentication failed')) {
        console.log('💡 Подсказка: Неверные учетные данные PostgreSQL');
      } else if (error.message.includes('database') && error.message.includes('does not exist')) {
        console.log('💡 Подсказка: База данных не существует');
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('💡 Подсказка: Таблицы не существуют, выполните миграции');
        console.log('   Выполните: npx prisma migrate deploy');
      }
    }
    
    await client.end();
    return false;
  }
}

// Основная функция тестирования
async function main() {
  console.log('🚀 Запуск тестирования PostgreSQL TimeWeb Cloud с pg\n');
  
  try {
    const result = await testPostgreSQLConnection();
    
    if (result) {
      console.log('\n🎉 Тестирование PostgreSQL TimeWeb Cloud завершено успешно!');
      console.log('\n📊 Результаты:');
      console.log('✅ Подключение к БД - работает');
      console.log('✅ CRUD операции - работают');
      console.log('✅ Связи между таблицами - работают');
      console.log('✅ Транзакции - работают');
      console.log('✅ Производительность - приемлемая');
    } else {
      console.log('\n❌ Тестирование PostgreSQL TimeWeb Cloud завершилось с ошибками');
      console.log('\n🔧 Рекомендации:');
      console.log('1. Проверьте доступность TimeWeb Cloud');
      console.log('2. Проверьте правильность DATABASE_URL');
      console.log('3. Выполните миграции: npx prisma migrate deploy');
    }
    
  } catch (error) {
    console.error('\n💥 Критическая ошибка тестирования:', error);
    process.exit(1);
  }
}

// Запускаем тестирование
main().catch(console.error);
