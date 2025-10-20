/**
 * Document Processor - обработка больших правовых документов
 * Извлекает текст, разбивает на чанки, генерирует эмбеддинги
 */

import { VectorDBClient, VectorDocument } from './vector-db-client';
import { ObjectStorageClient, DocumentMetadata } from './object-storage-client';
import { EmbeddingClient } from './embedding-client';
import { RAGConfig } from './config';

export interface ProcessingOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  legalArea?: string;
  documentType?: 'law' | 'precedent' | 'template' | 'guideline';
  tags?: string[];
}

export interface ProcessingResult {
  documentId: string;
  chunksCount: number;
  processingTime: number;
  status: 'success' | 'error';
  error?: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  startPosition: number;
  endPosition: number;
  metadata: {
    title: string;
    legalArea: string;
    documentType: string;
    source: string;
    tags: string[];
  };
}

export class DocumentProcessor {
  private vectorDbClient: VectorDBClient;
  private objectStorageClient: ObjectStorageClient;
  private embeddingClient: EmbeddingClient;
  private config: RAGConfig;

  constructor(
    vectorDbClient: VectorDBClient,
    objectStorageClient: ObjectStorageClient,
    embeddingClient: EmbeddingClient,
    config: RAGConfig
  ) {
    this.vectorDbClient = vectorDbClient;
    this.objectStorageClient = objectStorageClient;
    this.embeddingClient = embeddingClient;
    this.config = config;
  }

  /**
   * Обработка документа: извлечение текста, чанкинг, генерация эмбеддингов
   */
  async processDocument(
    documentId: string,
    file: File | Buffer,
    metadata: DocumentMetadata,
    options: ProcessingOptions = {}
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    
    try {
      // 1. Загружаем документ в Object Storage
      const documentKey = `documents/${documentId}`;
      await this.objectStorageClient.uploadDocument(documentKey, file, metadata);

      // 2. Извлекаем текст из документа
      const text = await this.extractText(file, metadata.mimeType);
      
      // 3. Разбиваем текст на чанки
      const chunks = this.createChunks(text, documentId, metadata, options);
      
      // 4. Генерируем эмбеддинги для всех чанков
      const embeddings = await this.embeddingClient.generateEmbeddingsBatched(
        chunks.map(chunk => chunk.content)
      );

      // 5. Создаем векторные документы
      const vectorDocuments: VectorDocument[] = chunks.map((chunk, index) => ({
        id: chunk.id,
        vector: embeddings[index],
        metadata: {
          documentId: chunk.documentId,
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          title: chunk.metadata.title,
          legalArea: chunk.metadata.legalArea,
          documentType: chunk.metadata.documentType,
          source: chunk.metadata.source,
          url: metadata.url,
          tags: chunk.metadata.tags,
          createdAt: new Date().toISOString()
        }
      }));

      // 6. Сохраняем в векторную БД
      await this.vectorDbClient.addDocuments(vectorDocuments);

      // 7. Обновляем метаданные документа
      await this.objectStorageClient.updateDocumentMetadata(documentKey, {
        status: 'processed',
        processedAt: new Date().toISOString(),
        chunksCount: chunks.length
      });

      const processingTime = Date.now() - startTime;

      return {
        documentId,
        chunksCount: chunks.length,
        processingTime,
        status: 'success'
      };

    } catch (error) {
      console.error('Document Processing Error:', error);
      
      // Обновляем статус на ошибку
      try {
        await this.objectStorageClient.updateDocumentMetadata(
          `documents/${documentId}`,
          { status: 'error' }
        );
      } catch (updateError) {
        console.error('Error updating document status:', updateError);
      }

      return {
        documentId,
        chunksCount: 0,
        processingTime: Date.now() - startTime,
        status: 'error',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Извлечение текста из файла
   */
  private async extractText(file: File | Buffer, mimeType: string): Promise<string> {
    // В реальном приложении здесь была бы интеграция с библиотеками для извлечения текста
    // Например: pdf-parse для PDF, mammoth для DOCX, и т.д.
    
    if (mimeType === 'text/plain') {
      return file instanceof File ? await file.text() : file.toString();
    }
    
    if (mimeType === 'application/pdf') {
      // Для демо возвращаем мок-текст
      return this.generateMockLegalText();
    }
    
    if (mimeType.includes('word') || mimeType.includes('document')) {
      // Для демо возвращаем мок-текст
      return this.generateMockLegalText();
    }

    throw new Error(`Неподдерживаемый тип файла: ${mimeType}`);
  }

  /**
   * Разбивка текста на чанки
   */
  private createChunks(
    text: string,
    documentId: string,
    metadata: DocumentMetadata,
    options: ProcessingOptions
  ): DocumentChunk[] {
    const chunkSize = options.chunkSize || this.config.documentProcessing.chunkSize;
    const chunkOverlap = options.chunkOverlap || this.config.documentProcessing.chunkOverlap;
    
    const chunks: DocumentChunk[] = [];
    let startPosition = 0;
    let chunkIndex = 0;

    while (startPosition < text.length) {
      const endPosition = Math.min(startPosition + chunkSize, text.length);
      let chunkText = text.substring(startPosition, endPosition);

      // Пытаемся найти границу предложения для лучшего разбиения
      if (endPosition < text.length) {
        const lastSentenceEnd = chunkText.lastIndexOf('.');
        const lastParagraphEnd = chunkText.lastIndexOf('\n\n');
        
        if (lastSentenceEnd > chunkSize * 0.7) {
          chunkText = chunkText.substring(0, lastSentenceEnd + 1);
          endPosition = startPosition + lastSentenceEnd + 1;
        } else if (lastParagraphEnd > chunkSize * 0.7) {
          chunkText = chunkText.substring(0, lastParagraphEnd);
          endPosition = startPosition + lastParagraphEnd;
        }
      }

      const chunk: DocumentChunk = {
        id: `${documentId}_chunk_${chunkIndex}`,
        documentId,
        chunkIndex,
        content: chunkText.trim(),
        startPosition,
        endPosition,
        metadata: {
          title: metadata.title,
          legalArea: options.legalArea || metadata.legalArea,
          documentType: options.documentType || metadata.documentType,
          source: metadata.source,
          tags: [...metadata.tags, ...(options.tags || [])]
        }
      };

      chunks.push(chunk);
      
      // Перекрытие для сохранения контекста
      startPosition = endPosition - chunkOverlap;
      chunkIndex++;
    }

    return chunks;
  }

  /**
   * Генерация мок-текста для демо
   */
  private generateMockLegalText(): string {
    return `
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
    `.trim();
  }

  /**
   * Массовая обработка документов
   */
  async processDocumentsBatch(
    documents: Array<{
      id: string;
      file: File | Buffer;
      metadata: DocumentMetadata;
      options?: ProcessingOptions;
    }>
  ): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];

    // Обрабатываем документы последовательно для избежания перегрузки
    for (const doc of documents) {
      try {
        const result = await this.processDocument(doc.id, doc.file, doc.metadata, doc.options);
        results.push(result);
        
        // Небольшая задержка между документами
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({
          documentId: doc.id,
          chunksCount: 0,
          processingTime: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Неизвестная ошибка'
        });
      }
    }

    return results;
  }

  /**
   * Получение статистики обработки
   */
  async getProcessingStats(): Promise<{
    totalDocuments: number;
    processedDocuments: number;
    errorDocuments: number;
    totalChunks: number;
  }> {
    try {
      const objectStorageStats = await this.objectStorageClient.listDocuments();
      const vectorDbStats = await this.vectorDbClient.getCollectionInfo();

      let processedCount = 0;
      let errorCount = 0;

      // Подсчитываем статусы документов
      for (const obj of objectStorageStats.objects) {
        const metadata = await this.objectStorageClient.getDocumentMetadata(obj.key);
        if (metadata) {
          if (metadata.status === 'processed') {
            processedCount++;
          } else if (metadata.status === 'error') {
            errorCount++;
          }
        }
      }

      return {
        totalDocuments: objectStorageStats.objects.length,
        processedDocuments: processedCount,
        errorDocuments: errorCount,
        totalChunks: vectorDbStats.pointsCount
      };
    } catch (error) {
      console.error('Processing Stats Error:', error);
      throw new Error(`Ошибка получения статистики обработки: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }
}

export default DocumentProcessor;
