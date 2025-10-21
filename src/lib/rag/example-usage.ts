/**
 * Пример использования RAG системы
 * Демонстрирует основные возможности для работы с правовой базой знаний
 */

import { RAGSystemFactory, RAGUtils, defaultRAGConfig } from './index';
import type { DocumentMetadata, ProcessingOptions } from './index';

/**
 * Пример инициализации и использования RAG системы
 */
export async function exampleRAGUsage() {
  try {
    // 1. Валидация конфигурации
    const configValidation = RAGUtils.validateConfig(defaultRAGConfig);
    if (!configValidation.isValid) {
      console.error('Ошибки конфигурации:', configValidation.errors);
      return;
    }

    // 2. Создание RAG системы
    const ragSystem = RAGSystemFactory.createRAGSystem(defaultRAGConfig);
    const { ragService, documentProcessor, vectorDbClient, objectStorageClient } = ragSystem;

    // 3. Инициализация системы
    await ragService.initialize();
    console.log('✅ RAG система инициализирована');

    // 4. Получение статистики
    const stats = await ragService.getStats();
    console.log('📊 Статистика системы:', stats);

    // 5. Пример обработки документа
    const documentId = RAGUtils.generateDocumentId('law');
    const mockDocument = createMockLegalDocument();
    
    const metadata: DocumentMetadata = {
      id: documentId,
      title: 'Гражданский кодекс РФ - Основные положения',
      originalName: 'gk-rf-osnovnye-polozheniya.pdf',
      legalArea: 'civil-law',
      documentType: 'law',
      source: 'Официальный сайт Госдумы',
      tags: ['гражданское право', 'кодекс', 'основы'],
      fileSize: 1024 * 1024, // 1MB
      mimeType: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      status: 'uploaded'
    };

    const processingOptions: ProcessingOptions = {
      chunkSize: 1000,
      chunkOverlap: 200,
      legalArea: 'civil-law',
      documentType: 'law',
      tags: ['кодекс', 'основы']
    };

    // Обработка документа
    const processingResult = await documentProcessor.processDocument(
      documentId,
      mockDocument,
      metadata,
      processingOptions
    );

    console.log('📄 Результат обработки документа:', processingResult);

    // 6. Пример поиска и генерации ответа
    const query = {
      question: 'Какие основные принципы гражданского права?',
      legalArea: 'civil-law' as const,
      maxResults: 5,
      threshold: 0.7
    };

    const ragResult = await ragService.query(query);
    console.log('🔍 Результат RAG запроса:', {
      answer: ragResult.answer.substring(0, 200) + '...',
      sourcesCount: ragResult.sources.length,
      confidence: ragResult.confidence,
      legalReferences: ragResult.legalReferences,
      suggestedActions: ragResult.suggestedActions
    });

    // 7. Пример поиска похожих документов
    const similarDocs = await ragService.searchSimilar(
      'права и обязанности граждан',
      'civil-law'
    );
    console.log('🔎 Похожие документы:', similarDocs.map((doc: Record<string, unknown>) => ({
      title: doc.title,
      relevance: doc.relevance,
      type: doc.type
    })));

    // 8. Статистика обработки
    const processingStats = await documentProcessor.getProcessingStats();
    console.log('📈 Статистика обработки:', processingStats);

    return {
      success: true,
      stats,
      processingResult,
      ragResult,
      similarDocs,
      processingStats
    };

  } catch (error) {
    console.error('❌ Ошибка в примере использования RAG:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    };
  }
}

/**
 * Создание мок-документа для демо
 */
function createMockLegalDocument(): Buffer {
  const mockText = `
ГРАЖДАНСКИЙ КОДЕКС РОССИЙСКОЙ ФЕДЕРАЦИИ

ЧАСТЬ ПЕРВАЯ

Раздел I. ОБЩИЕ ПОЛОЖЕНИЯ

Подраздел 1. ОСНОВНЫЕ ПОЛОЖЕНИЯ

Глава 1. ГРАЖДАНСКОЕ ЗАКОНОДАТЕЛЬСТВО

Статья 1. Основные начала гражданского законодательства

1. Гражданское законодательство основывается на признании равенства участников регулируемых им отношений, неприкосновенности собственности, свободы договора, недопустимости произвольного вмешательства кого-либо в частные дела, необходимости беспрепятственного осуществления гражданских прав, обеспечения восстановления нарушенных прав, их судебной защиты.

2. Граждане (физические лица) и юридические лица приобретают и осуществляют свои гражданские права своей волей и в своем интересе. Они свободны в установлении своих прав и обязанностей на основе договора и в определении любых не противоречащих законодательству условий договора.

3. При установлении, осуществлении и защите гражданских прав и при исполнении гражданских обязанностей участники гражданских правоотношений должны действовать добросовестно.

4. Никто не вправе извлекать преимущество из своего незаконного или недобросовестного поведения.

5. Товары, услуги и финансовые средства свободно перемещаются на всей территории Российской Федерации.

Статья 2. Отношения, регулируемые гражданским законодательством

1. Гражданское законодательство определяет правовое положение участников гражданского оборота, основания возникновения и порядок осуществления права собственности и других вещных прав, прав на результаты интеллектуальной деятельности и приравненные к ним средства индивидуализации (интеллектуальных прав), регулирует договорные и иные обязательства, а также другие имущественные и связанные с ними личные неимущественные отношения, основанные на равенстве, автономии воли и имущественной самостоятельности участников.

2. Участниками регулируемых гражданским законодательством отношений являются граждане, юридические лица, Российская Федерация, субъекты Российской Федерации и муниципальные образования.

3. Гражданское законодательство регулирует отношения между лицами, осуществляющими предпринимательскую деятельность, или с их участием, исходя из того, что предпринимательской является самостоятельная, осуществляемая на свой риск деятельность, направленная на систематическое получение прибыли от пользования имуществом, продажи товаров, выполнения работ или оказания услуг лицами, зарегистрированными в этом качестве в установленном законом порядке.

4. К имущественным отношениям, основанным на административном или ином властном подчинении одной стороны другой, в том числе к налоговым и другим финансовым и административным отношениям, гражданское законодательство не применяется, если иное не предусмотрено законодательством.

Статья 3. Гражданское законодательство и иные акты, содержащие нормы гражданского права

1. В соответствии с Конституцией Российской Федерации гражданское законодательство находится в ведении Российской Федерации.

2. Гражданское законодательство состоит из настоящего Кодекса и принятых в соответствии с ним иных федеральных законов (далее - законы), регулирующих отношения, указанные в пунктах 1 и 2 статьи 2 настоящего Кодекса.

3. Нормы гражданского права, содержащиеся в других законах, должны соответствовать настоящему Кодексу.

4. Гражданские правоотношения могут регулироваться также указами Президента Российской Федерации, которые не должны противоречить настоящему Кодексу и иным законам.

5. На основании и во исполнение настоящего Кодекса и иных законов, указов Президента Российской Федерации Правительство Российской Федерации вправе принимать содержащие нормы гражданского права постановления.

6. В случае противоречия указа Президента Российской Федерации или постановления Правительства Российской Федерации настоящему Кодексу или иному закону применяется настоящий Кодекс или соответствующий закон.

7. Акты федеральных органов исполнительной власти, содержащие нормы гражданского права, не должны противоречить настоящему Кодексу, иным законам, указам Президента Российской Федерации и постановлениям Правительства Российской Федерации.

8. Обычаи, противоречащие обязательным для участников соответствующего отношения положениям законодательства или договору, не применяются.

9. Международные договоры Российской Федерации применяются к отношениям, указанным в пунктах 1 и 2 статьи 2 настоящего Кодекса, непосредственно, кроме случаев, когда из международного договора следует, что для его применения требуется издание внутригосударственного акта.

10. Если международным договором Российской Федерации установлены иные правила, чем те, которые предусмотрены гражданским законодательством, применяются правила международного договора.
  `;

  return Buffer.from(mockText, 'utf-8');
}

/**
 * Пример массовой обработки документов
 */
export async function exampleBatchProcessing() {
  try {
    const ragSystem = RAGSystemFactory.createRAGSystem(defaultRAGConfig);
    const { documentProcessor } = ragSystem;

    // Создаем массив документов для обработки
    const documents = [
      {
        id: RAGUtils.generateDocumentId('law'),
        file: createMockLegalDocument(),
        metadata: {
          id: RAGUtils.generateDocumentId('law'),
          title: 'ГК РФ - Основные положения',
          originalName: 'gk-rf-osnovnye.pdf',
          legalArea: 'civil-law',
          documentType: 'law' as const,
          source: 'Официальный сайт',
          tags: ['гражданское право', 'кодекс'],
          fileSize: 1024 * 1024,
          mimeType: 'application/pdf',
          uploadedAt: new Date().toISOString(),
          status: 'uploaded' as const
        },
        options: {
          chunkSize: 1000,
          chunkOverlap: 200,
          legalArea: 'civil-law',
          documentType: 'law'
        }
      },
      {
        id: RAGUtils.generateDocumentId('precedent'),
        file: createMockLegalDocument(),
        metadata: {
          id: RAGUtils.generateDocumentId('precedent'),
          title: 'Постановление ВС РФ о защите прав потребителей',
          originalName: 'vs-rf-potreb.pdf',
          legalArea: 'consumer-rights',
          documentType: 'precedent' as const,
          source: 'Верховный Суд РФ',
          tags: ['потребитель', 'прецедент'],
          fileSize: 512 * 1024,
          mimeType: 'application/pdf',
          uploadedAt: new Date().toISOString(),
          status: 'uploaded' as const
        },
        options: {
          chunkSize: 800,
          chunkOverlap: 150,
          legalArea: 'consumer-rights',
          documentType: 'precedent'
        }
      }
    ];

    // Массовая обработка
    const results = await documentProcessor.processDocumentsBatch(documents);
    
    console.log('📦 Результаты массовой обработки:', results);
    
    return results;
  } catch (error) {
    console.error('❌ Ошибка массовой обработки:', error);
    throw error;
  }
}

/**
 * Пример работы с утилитами
 */
export function exampleUtils() {
  // Генерация ID
  const docId = RAGUtils.generateDocumentId('law');
  const chunkId = RAGUtils.generateChunkId(docId, 0);
  
  console.log('🆔 Сгенерированные ID:', { docId, chunkId });

  // Нормализация текста
  const text = '  Это   тестовый   текст!!!  ';
  const normalized = RAGUtils.normalizeText(text);
  console.log('📝 Нормализация текста:', { original: text, normalized });

  // Извлечение ключевых слов
  const keywords = RAGUtils.extractKeywords(
    'Гражданское право регулирует отношения между гражданами и юридическими лицами',
    5
  );
  console.log('🔑 Ключевые слова:', keywords);

  // Определение области права
  const legalArea = RAGUtils.detectLegalArea(
    'Потребитель имеет право на качественный товар'
  );
  console.log('⚖️ Область права:', legalArea);

  // Форматирование
  const fileSize = RAGUtils.formatFileSize(1024 * 1024 * 5); // 5MB
  const processingTime = RAGUtils.formatProcessingTime(125000); // 2m 5s
  console.log('📊 Форматирование:', { fileSize, processingTime });

  return {
    docId,
    chunkId,
    normalized,
    keywords,
    legalArea,
    fileSize,
    processingTime
  };
}

// Экспорт функций для использования
export default {
  exampleRAGUsage,
  exampleBatchProcessing,
  exampleUtils
};
