/**
 * Скрипт для тестирования базы знаний правовых документов
 */

import { LegalKnowledgeService } from '../src/lib/knowledge-base/legal-knowledge-service';
import { defaultRAGConfig } from '../src/lib/rag/config';

async function testKnowledgeBase() {
  console.log('🧪 Тестирование базы знаний правовых документов...');
  
  try {
    // Инициализация сервиса
    const knowledgeService = new LegalKnowledgeService(defaultRAGConfig);

    console.log('📊 Получение статистики базы знаний...');
    const stats = await knowledgeService.getKnowledgeBaseStats();
    console.log('📈 Статистика:');
    console.log(`   - Всего документов: ${stats.totalDocuments}`);
    console.log(`   - Всего шаблонов: ${stats.totalTemplates}`);
    console.log(`   - Документы по типам:`, stats.documentsByType);
    console.log(`   - Документы по категориям:`, stats.documentsByCategory);

    // Тестовые запросы
    const testQueries = [
      {
        query: 'защита прав потребителей',
        filters: { type: 'law' },
        description: 'Поиск законов о защите прав потребителей'
      },
      {
        query: 'трудовой договор',
        filters: { type: 'template' },
        description: 'Поиск шаблонов трудовых договоров'
      },
      {
        query: 'алименты',
        filters: { category: 'семейное право' },
        description: 'Поиск документов по семейному праву об алиментах'
      },
      {
        query: 'возврат товара',
        filters: { tags: ['потребители', 'возврат товара'] },
        description: 'Поиск документов о возврате товара'
      }
    ];

    console.log('\n🔍 Тестирование поиска...');
    
    for (const testQuery of testQueries) {
      console.log(`\n📝 ${testQuery.description}`);
      console.log(`   Запрос: "${testQuery.query}"`);
      console.log(`   Фильтры:`, testQuery.filters);
      
      try {
        const results = await knowledgeService.searchLegalDocuments(
          testQuery.query,
          testQuery.filters
        );
        
        console.log(`   ✅ Найдено результатов: ${results.length}`);
        
        if (results.length > 0) {
          console.log('   📋 Топ-3 результата:');
          results.slice(0, 3).forEach((result, index) => {
            console.log(`      ${index + 1}. ${result.title} (релевантность: ${result.relevance.toFixed(3)})`);
            console.log(`         Тип: ${result.type}`);
            console.log(`         Содержимое: ${result.content.substring(0, 100)}...`);
          });
        }
      } catch (error) {
        console.log(`   ❌ Ошибка поиска: ${error}`);
      }
    }

    console.log('\n📄 Тестирование получения шаблонов...');
    
    try {
      const templates = await knowledgeService.getDocumentTemplates();
      console.log(`✅ Найдено шаблонов: ${templates.length}`);
      
      if (templates.length > 0) {
        console.log('📋 Доступные шаблоны:');
        templates.forEach((template, index) => {
          console.log(`   ${index + 1}. ${template.name} (${template.type})`);
          console.log(`      Категория: ${template.category}`);
          console.log(`      Переменные: ${template.variables.length}`);
        });
      }
    } catch (error) {
      console.log(`❌ Ошибка получения шаблонов: ${error}`);
    }

    console.log('\n🎉 Тестирование базы знаний завершено!');

  } catch (error) {
    console.error('❌ Ошибка тестирования базы знаний:', error);
    process.exit(1);
  }
}

// Запуск скрипта
if (require.main === module) {
  testKnowledgeBase();
}

export default testKnowledgeBase;
