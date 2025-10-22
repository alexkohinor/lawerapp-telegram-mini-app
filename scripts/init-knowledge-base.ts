/**
 * Скрипт для инициализации базы знаний правовых документов
 * Загружает законы РФ, прецеденты и шаблоны в TimeWeb Cloud
 */

import { LegalKnowledgeService } from '../src/lib/knowledge-base/legal-knowledge-service';
import { LegalDocumentsLoader } from '../src/lib/knowledge-base/legal-documents-loader';
import { defaultRAGConfig } from '../src/lib/rag/config';

async function initializeKnowledgeBase() {
  console.log('🚀 Инициализация базы знаний правовых документов...');
  
  try {
    // Инициализация сервисов
    const knowledgeService = new LegalKnowledgeService(defaultRAGConfig);
    const documentsLoader = new LegalDocumentsLoader();

    console.log('📋 Создание коллекции в векторной БД...');
    await knowledgeService.createVectorCollection();
    console.log('✅ Коллекция создана');

    console.log('📚 Загрузка законов РФ...');
    const laws = await documentsLoader.loadRussianLaws();
    console.log(`✅ Загружено ${laws.length} законов`);

    console.log('⚖️ Загрузка судебных прецедентов...');
    const precedents = await documentsLoader.loadLegalPrecedents();
    console.log(`✅ Загружено ${precedents.length} прецедентов`);

    console.log('📄 Загрузка шаблонов документов...');
    const templates = await documentsLoader.loadDocumentTemplates();
    console.log(`✅ Загружено ${templates.length} шаблонов`);

    console.log('💾 Загрузка документов в базу знаний...');
    await knowledgeService.uploadLegalDocuments([...laws, ...precedents, ...templates]);
    console.log('✅ Документы загружены в базу знаний');

    console.log('📊 Получение статистики...');
    const stats = await knowledgeService.getKnowledgeBaseStats();
    console.log('📈 Статистика базы знаний:');
    console.log(`   - Всего документов: ${stats.totalDocuments}`);
    console.log(`   - Всего шаблонов: ${stats.totalTemplates}`);
    console.log(`   - Документы по типам:`, stats.documentsByType);
    console.log(`   - Документы по категориям:`, stats.documentsByCategory);
    console.log(`   - Последнее обновление: ${stats.lastUpdated}`);

    console.log('🎉 База знаний успешно инициализирована!');

  } catch (error) {
    console.error('❌ Ошибка инициализации базы знаний:', error);
    process.exit(1);
  }
}

// Запуск скрипта
if (require.main === module) {
  initializeKnowledgeBase();
}

export default initializeKnowledgeBase;
