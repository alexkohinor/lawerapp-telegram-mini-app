import { timeWebAI } from './timeweb-ai';
import { LegalContext, LegalSource } from '@/types';

/**
 * RAG (Retrieval-Augmented Generation) сервис
 * Основано на AI_INTEGRATION.md и FEATURE_SPECIFICATION.md
 */

interface SearchResult {
  id: string;
  title: string;
  content: string;
  relevance: number;
  source: LegalSource;
  metadata: {
    legalArea: string;
    jurisdiction: string;
    lastUpdated: Date;
    authority: string;
  };
}

interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  embedding: number[];
  metadata: {
    title: string;
    section: string;
    legalArea: string;
    jurisdiction: string;
    authority: string;
    lastUpdated: Date;
  };
}

export class RAGService {
  private vectorStore: TimeWebVectorStore;
  private aiService: typeof timeWebAI;

  constructor() {
    this.vectorStore = new TimeWebVectorStore();
    this.aiService = timeWebAI;
  }

  /**
   * Поиск релевантных правовых документов
   */
  async searchLegalKnowledge(
    query: string,
    context: LegalContext,
    options: {
      limit?: number;
      threshold?: number;
      includeMetadata?: boolean;
    } = {}
  ): Promise<SearchResult[]> {
    try {
      // Генерируем эмбеддинг для запроса
      const queryEmbedding = await this.aiService.generateEmbedding(query);

      // Ищем похожие документы в векторной базе
      const searchResults = await this.vectorStore.searchSimilar(
        queryEmbedding,
        {
          limit: options.limit || 10,
          threshold: options.threshold || 0.7,
          filters: {
            legalArea: context.area,
            jurisdiction: 'russia',
            ...(context.disputeType && { disputeType: context.disputeType }),
          },
        }
      );

      // Преобразуем результаты в нужный формат
      const results: SearchResult[] = searchResults.map(result => ({
        id: result.id,
        title: result.metadata.title,
        content: result.content,
        relevance: result.similarity,
        source: {
          id: result.metadata.documentId,
          title: result.metadata.title,
          type: 'law',
          url: result.metadata.url,
          relevance: result.similarity,
          excerpt: result.content.substring(0, 200) + '...',
        },
        metadata: {
          legalArea: result.metadata.legalArea,
          jurisdiction: result.metadata.jurisdiction,
          lastUpdated: result.metadata.lastUpdated,
          authority: result.metadata.authority,
        },
      }));

      return results;
    } catch (error) {
      console.error('RAG search error:', error);
      throw new Error('Ошибка поиска в правовой базе знаний');
    }
  }

  /**
   * Генерация контекстуального ответа с использованием RAG
   */
  async generateContextualResponse(
    query: string,
    context: LegalContext
  ): Promise<{
    response: string;
    sources: LegalSource[];
    confidence: number;
  }> {
    try {
      // Ищем релевантные документы
      const searchResults = await this.searchLegalKnowledge(query, context, {
        limit: 5,
        threshold: 0.6,
      });

      // Формируем контекст для AI
      const legalContext = searchResults
        .map(result => `[${result.metadata.authority}] ${result.title}: ${result.content}`)
        .join('\n\n');

      // Генерируем ответ с использованием найденного контекста
      const consultation = await this.aiService.getLegalConsultation(
        `${query}\n\nКонтекст из правовой базы:\n${legalContext}`,
        context
      );

      return {
        response: consultation.response,
        sources: consultation.sources,
        confidence: consultation.confidence,
      };
    } catch (error) {
      console.error('RAG contextual response error:', error);
      throw new Error('Ошибка генерации контекстуального ответа');
    }
  }

  /**
   * Добавление документа в базу знаний
   */
  async addDocumentToKnowledgeBase(
    document: {
      id: string;
      title: string;
      content: string;
      legalArea: string;
      authority: string;
      url?: string;
    }
  ): Promise<void> {
    try {
      // Разбиваем документ на чанки
      const chunks = this.chunkDocument(document);

      // Генерируем эмбеддинги для каждого чанка
      for (const chunk of chunks) {
        const embedding = await this.aiService.generateEmbedding(chunk.content);
        
        await this.vectorStore.storeDocument({
          id: chunk.id,
          content: chunk.content,
          embedding,
          metadata: {
            documentId: document.id,
            title: document.title,
            section: chunk.section,
            legalArea: document.legalArea,
            jurisdiction: 'russia',
            authority: document.authority,
            url: document.url,
            lastUpdated: new Date(),
          },
        });
      }
    } catch (error) {
      console.error('RAG add document error:', error);
      throw new Error('Ошибка добавления документа в базу знаний');
    }
  }

  /**
   * Обновление документа в базе знаний
   */
  async updateDocumentInKnowledgeBase(
    documentId: string,
    updates: {
      title?: string;
      content?: string;
      legalArea?: string;
      authority?: string;
    }
  ): Promise<void> {
    try {
      // Удаляем старые чанки
      await this.vectorStore.deleteDocument(documentId);

      // Добавляем обновленный документ
      if (updates.content) {
        await this.addDocumentToKnowledgeBase({
          id: documentId,
          title: updates.title || 'Обновленный документ',
          content: updates.content,
          legalArea: updates.legalArea || 'civil',
          authority: updates.authority || 'unknown',
        });
      }
    } catch (error) {
      console.error('RAG update document error:', error);
      throw new Error('Ошибка обновления документа в базе знаний');
    }
  }

  /**
   * Получение статистики базы знаний
   */
  async getKnowledgeBaseStats(): Promise<{
    totalDocuments: number;
    totalChunks: number;
    legalAreas: Record<string, number>;
    lastUpdated: Date;
  }> {
    try {
      return await this.vectorStore.getStats();
    } catch (error) {
      console.error('RAG stats error:', error);
      return {
        totalDocuments: 0,
        totalChunks: 0,
        legalAreas: {},
        lastUpdated: new Date(),
      };
    }
  }

  /**
   * Разбивка документа на чанки
   */
  private chunkDocument(document: {
    id: string;
    title: string;
    content: string;
  }): Array<{
    id: string;
    content: string;
    section: string;
  }> {
    const chunks: Array<{
      id: string;
      content: string;
      section: string;
    }> = [];

    // Разбиваем по параграфам
    const paragraphs = document.content.split('\n\n');
    let sectionIndex = 0;

    for (const paragraph of paragraphs) {
      if (paragraph.trim().length < 50) continue; // Пропускаем короткие параграфы

      chunks.push({
        id: `${document.id}_chunk_${sectionIndex}`,
        content: paragraph.trim(),
        section: `Раздел ${sectionIndex + 1}`,
      });

      sectionIndex++;
    }

    return chunks;
  }
}

/**
 * Векторная база данных TimeWeb Cloud
 */
class TimeWebVectorStore {
  private apiKey: string;
  private baseUrl: string;
  private projectId: string;

  constructor() {
    this.apiKey = process.env.TIMEWEB_API_KEY || '';
    this.baseUrl = process.env.TIMEWEB_API_URL || 'https://api.timeweb.com';
    this.projectId = process.env.TIMEWEB_PROJECT_ID || '';
  }

  async storeDocument(document: DocumentChunk): Promise<void> {
    // В реальном приложении здесь будет API вызов к TimeWeb Cloud Vector Store
    console.log('Storing document:', document.id);
  }

  async searchSimilar(
    embedding: number[],
    options: {
      limit: number;
      threshold: number;
      filters?: Record<string, any>;
    }
  ): Promise<Array<{
    id: string;
    content: string;
    similarity: number;
    metadata: any;
  }>> {
    // В реальном приложении здесь будет API вызов к TimeWeb Cloud Vector Store
    // Пока возвращаем моковые данные
    return [
      {
        id: '1',
        content: 'Статья 18 Закона РФ "О защите прав потребителей" предоставляет потребителю право на возврат товара...',
        similarity: 0.95,
        metadata: {
          documentId: 'zzpp_art18',
          title: 'Закон о защите прав потребителей, статья 18',
          legalArea: 'consumer_protection',
          jurisdiction: 'russia',
          authority: 'Государственная Дума РФ',
          url: 'https://www.consultant.ru/document/cons_doc_LAW_305/',
          lastUpdated: new Date('2024-01-01'),
        },
      },
    ];
  }

  async deleteDocument(documentId: string): Promise<void> {
    // В реальном приложении здесь будет API вызов к TimeWeb Cloud Vector Store
    console.log('Deleting document:', documentId);
  }

  async getStats(): Promise<{
    totalDocuments: number;
    totalChunks: number;
    legalAreas: Record<string, number>;
    lastUpdated: Date;
  }> {
    // В реальном приложении здесь будет API вызов к TimeWeb Cloud Vector Store
    return {
      totalDocuments: 150,
      totalChunks: 2500,
      legalAreas: {
        civil: 50,
        criminal: 30,
        administrative: 25,
        labor: 20,
        family: 15,
        tax: 10,
      },
      lastUpdated: new Date(),
    };
  }
}

// Экспорт синглтона
export const ragService = new RAGService();
