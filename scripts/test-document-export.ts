import { exportDocument } from '../src/lib/tax/document-export-service';
import consola from 'consola';

/**
 * Тестовый скрипт для проверки экспорта документов в PDF и DOCX
 */

const testDocument = {
  documentId: 'test-' + Date.now(),
  title: 'Заявление о перерасчете транспортного налога за 2024 год',
  content: `В Инспекцию Федеральной налоговой службы
№ 1 по г. Москве
от Иванова Ивана Ивановича
ИНН 123456789012
адрес: г. Москва, ул. Ленина, д. 1, кв. 1
телефон: +7 (999) 123-45-67

ЗАЯВЛЕНИЕ
о перерасчете транспортного налога

На основании ст. 52, 78, 81 Налогового кодекса РФ прошу произвести перерасчет транспортного налога за 2024 год в связи с неправильным исчислением налога.

ОБСТОЯТЕЛЬСТВА ДЕЛА:

1. Налоговая инспекция неправильно применила налоговую ставку для моего региона
2. Не учтен период владения транспортным средством
3. Мощность двигателя указана некорректно

Считаю, что начисленная сумма налога 15000 руб. не соответствует действующим ставкам и параметрам транспортного средства.

ПРАВОВОЕ ОБОСНОВАНИЕ:

Согласно ст. 52 НК РФ, налогоплательщик самостоятельно исчисляет сумму налога, подлежащую уплате за налоговый период, исходя из налоговой базы, налоговой ставки и налоговых льгот.

В соответствии со ст. 358 НК РФ, объектом налогообложения признаются автомобили, мотоциклы, мотороллы, автобусы и другие самоходные машины и механизмы на пневматическом и гусеничном ходу, зарегистрированные в установленном порядке.

Статья 361 НК РФ устанавливает налоговые ставки в зависимости от мощности двигателя.

РАСЧЕТ ПРАВИЛЬНОЙ СУММЫ НАЛОГА:

┌─────────────────────────────────────────────────────────┐
│ Мощность двигателя:                    150 л.с.         │
│ Ставка налога:                         35 руб./л.с.     │
│ Коэффициент владения:                  1.0              │
│ Повышающий коэффициент:                1.0              │
│ Льгота:                                Нет              │
│                                                         │
│ Правильная сумма налога:               5250 руб.       │
│ Начислено налоговой:                   15000 руб.      │
│ Переплата:                             9750 руб.       │
└─────────────────────────────────────────────────────────┘

ТРЕБОВАНИЯ:

Прошу:
1. Произвести перерасчет транспортного налога за 2024 год.
2. Вернуть переплату в размере 9750 рублей.

Приложения:
1. Копия свидетельства о регистрации транспортного средства
2. Расчет налога
3. Справка о ставках транспортного налога в регионе

Дата: ${new Date().toLocaleDateString('ru-RU')}
Подпись: _______________ (Иванов И.И.)`,
  metadata: {
    taxpayerName: 'Иванов Иван Иванович',
    taxType: 'Транспортный налог',
    period: '2024',
    generatedAt: new Date(),
  },
};

async function testExport() {
  consola.start('Тестирование экспорта документов...');
  
  try {
    // Проверка переменных окружения
    if (!process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY) {
      consola.warn('⚠️  S3 credentials not configured. Skipping S3 upload test.');
      consola.info('Set S3_ACCESS_KEY and S3_SECRET_KEY in .env file to test S3 upload.');
    }
    
    // Тест 1: Экспорт в PDF
    consola.info('\n📄 Тестирование экспорта в PDF...');
    const pdfResult = await exportDocument({
      ...testDocument,
      format: 'pdf',
    });
    
    if (pdfResult.success) {
      consola.success('✅ PDF экспорт успешен!');
      consola.info(`   - S3 Key: ${pdfResult.s3Key}`);
      consola.info(`   - File Size: ${(pdfResult.fileSize! / 1024).toFixed(2)} KB`);
      consola.info(`   - S3 URL: ${pdfResult.s3Url}`);
    } else {
      consola.error('❌ PDF экспорт failed:', pdfResult.error);
    }
    
    // Тест 2: Экспорт в DOCX
    consola.info('\n📝 Тестирование экспорта в DOCX...');
    const docxResult = await exportDocument({
      ...testDocument,
      documentId: testDocument.documentId + '-docx',
      format: 'docx',
    });
    
    if (docxResult.success) {
      consola.success('✅ DOCX экспорт успешен!');
      consola.info(`   - S3 Key: ${docxResult.s3Key}`);
      consola.info(`   - File Size: ${(docxResult.fileSize! / 1024).toFixed(2)} KB`);
      consola.info(`   - S3 URL: ${docxResult.s3Url}`);
    } else {
      consola.error('❌ DOCX экспорт failed:', docxResult.error);
    }
    
    consola.success('\n🎉 Тестирование завершено!');
    consola.info('\n💡 Следующие шаги:');
    consola.info('1. Проверьте файлы в S3: ' + S3_BUCKET);
    consola.info('2. Используйте API /api/tax/documents/[id]/export для экспорта');
    consola.info('3. Используйте API /api/tax/documents/[id]/download для скачивания');
    
  } catch (error) {
    consola.error('❌ Ошибка тестирования:', error);
    process.exit(1);
  }
}

// Запуск теста
testExport();

const S3_BUCKET = process.env.S3_BUCKET_NAME || 'lawerapp-documents';

