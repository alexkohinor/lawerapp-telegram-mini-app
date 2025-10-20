/**
 * RAG Service - основной сервис для поиска по правовой базе знаний
 * Реализует Retrieval-Augmented Generation для юридических консультаций
 * Работает с внешними сервисами: TimeWeb Cloud Vector DB, Object Storage, Embedding Service
 */

import { VectorDBClient } from './vector-db-client';
import { ObjectStorageClient } from './object-storage-client';
import { EmbeddingClient } from './embedding-client';
import { RAGConfig } from './config';

export interface RAGQuery {
  question: string;
  context?: string;
  legalArea?: LegalArea;
  maxResults?: number;
  threshold?: number;
}

export interface RAGResult {
  answer: string;
  sources: LegalSource[];
  confidence: number;
  legalReferences: string[];
  suggestedActions: string[];
}

export interface LegalSource {
  id: string;
  title: string;
  content: string;
  type: 'law' | 'precedent' | 'template' | 'guideline';
  relevance: number;
  url?: string;
}

export type LegalArea = 
  | 'consumer-rights'
  | 'labor-law'
  | 'civil-law'
  | 'criminal-law'
  | 'family-law'
  | 'tax-law'
  | 'general';

export class RAGService {
  private vectorDbClient: VectorDBClient;
  private objectStorageClient: ObjectStorageClient;
  private embeddingClient: EmbeddingClient;
  private config: RAGConfig;

  constructor(config: RAGConfig) {
    this.config = config;
    this.vectorDbClient = new VectorDBClient(config);
    this.objectStorageClient = new ObjectStorageClient(config);
    this.embeddingClient = new EmbeddingClient(config);
  }

  /**
   * Основной метод поиска и генерации ответа
   */
  async query(query: RAGQuery): Promise<RAGResult> {
    try {
      // 1. Генерируем эмбеддинг для запроса
      const queryEmbedding = await this.embeddingClient.generateEmbedding({
        text: query.question
      });
      
      // 2. Ищем релевантные документы в векторной БД
      const searchResults = await this.vectorDbClient.search({
        vector: queryEmbedding.embedding,
        legalArea: query.legalArea,
        maxResults: query.maxResults || 5,
        threshold: query.threshold || 0.7,
        includeMetadata: true
      });

      // 3. Преобразуем результаты в формат LegalSource
      const relevantSources: LegalSource[] = searchResults.map(result => ({
        id: result.id,
        title: result.metadata.title,
        content: result.metadata.content,
        type: result.metadata.documentType,
        relevance: result.score,
        url: result.metadata.url
      }));

      // 4. Генерируем контекст для LLM
      const context = this.buildContext(relevantSources, query.context);

      // 5. Генерируем ответ с помощью LLM
      const answer = await this.generateAnswer(query.question, context, query.legalArea);

      // 6. Извлекаем правовые ссылки и предлагаемые действия
      const legalReferences = this.extractLegalReferences(answer, relevantSources);
      const suggestedActions = this.generateSuggestedActions(answer, relevantSources);

      return {
        answer,
        sources: relevantSources,
        confidence: this.calculateConfidence(relevantSources),
        legalReferences,
        suggestedActions
      };

    } catch (error) {
      console.error('RAG Service Error:', error);
      throw new Error(`Ошибка при обработке запроса: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Поиск похожих документов без генерации ответа
   */
  async searchSimilar(query: string, legalArea?: LegalArea): Promise<LegalSource[]> {
    const queryEmbedding = await this.embeddingClient.generateEmbedding({
      text: query
    });
    
    const searchResults = await this.vectorDbClient.search({
      vector: queryEmbedding.embedding,
      legalArea,
      maxResults: 10,
      threshold: 0.6,
      includeMetadata: true
    });
    
    return searchResults.map(result => ({
      id: result.id,
      title: result.metadata.title,
      content: result.metadata.content,
      type: result.metadata.documentType,
      relevance: result.score,
      url: result.metadata.url
    }));
  }

  /**
   * Инициализация RAG системы
   */
  async initialize(): Promise<void> {
    try {
      await this.vectorDbClient.initializeCollection();
      console.log('RAG система инициализирована');
    } catch (error) {
      console.error('RAG Initialization Error:', error);
      throw new Error(`Ошибка инициализации RAG системы: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение статистики системы
   */
  async getStats(): Promise<{
    vectorDb: any;
    objectStorage: any;
    embedding: any;
  }> {
    try {
      const [vectorDbStats, objectStorageStats, embeddingInfo] = await Promise.all([
        this.vectorDbClient.getCollectionInfo(),
        this.objectStorageClient.listDocuments(),
        this.embeddingClient.getModelInfo()
      ]);

      return {
        vectorDb: vectorDbStats,
        objectStorage: {
          totalDocuments: objectStorageStats.objects.length
        },
        embedding: embeddingInfo
      };
    } catch (error) {
      console.error('RAG Stats Error:', error);
      throw new Error(`Ошибка получения статистики: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Построение контекста для LLM
   */
  private buildContext(sources: LegalSource[], additionalContext?: string): string {
    let context = 'Релевантные правовые источники:\n\n';
    
    sources.forEach((source, index) => {
      context += `${index + 1}. ${source.title} (${source.type})\n`;
      context += `${source.content}\n\n`;
    });

    if (additionalContext) {
      context += `Дополнительный контекст:\n${additionalContext}\n\n`;
    }

    return context;
  }

  /**
   * Генерация ответа с помощью LLM
   */
  private async generateAnswer(question: string, context: string, legalArea?: LegalArea): Promise<string> {
    const prompt = this.buildPrompt(question, context, legalArea);
    
    // В реальном приложении здесь был бы вызов к OpenAI API
    // Для демо возвращаем структурированный ответ
    return this.generateMockAnswer(question, context, legalArea);
  }

  /**
   * Построение промпта для LLM
   */
  private buildPrompt(question: string, context: string, legalArea?: LegalArea): string {
    const areaInstructions = this.getLegalAreaInstructions(legalArea);
    
    return `Вы - опытный юрист-консультант. Ответьте на вопрос пользователя, используя предоставленные правовые источники.

${areaInstructions}

Вопрос: ${question}

${context}

Инструкции:
1. Дайте четкий и понятный ответ
2. Ссылайтесь на конкретные статьи законов
3. Предложите практические шаги
4. Укажите возможные риски
5. Если информации недостаточно, честно об этом скажите

Ответ:`;
  }

  /**
   * Инструкции для конкретных областей права
   */
  private getLegalAreaInstructions(legalArea?: LegalArea): string {
    const instructions = {
      'consumer-rights': 'Специализируйтесь на защите прав потребителей. Ссылайтесь на ЗоЗПП, ГК РФ.',
      'labor-law': 'Специализируйтесь на трудовом праве. Ссылайтесь на ТК РФ, постановления правительства.',
      'civil-law': 'Специализируйтесь на гражданском праве. Ссылайтесь на ГК РФ, судебную практику.',
      'criminal-law': 'Специализируйтесь на уголовном праве. Ссылайтесь на УК РФ, УПК РФ.',
      'family-law': 'Специализируйтесь на семейном праве. Ссылайтесь на СК РФ, судебную практику.',
      'tax-law': 'Специализируйтесь на налоговом праве. Ссылайтесь на НК РФ, разъяснения ФНС.',
      'general': 'Используйте общие принципы права и актуальное законодательство РФ.'
    };

    return instructions[legalArea || 'general'];
  }

  /**
   * Генерация мок-ответа для демо
   */
  private generateMockAnswer(question: string, context: string, legalArea?: LegalArea): string {
    const baseAnswer = `На основе анализа предоставленных правовых источников, могу дать следующий ответ:

${question.includes('претензия') ? 
  'Для составления претензии рекомендую обратиться к ст. 18 Закона "О защите прав потребителей".' :
  'Согласно действующему законодательству РФ, в вашей ситуации применимы следующие нормы:'
}

**Правовые основания:**
- Гражданский кодекс РФ
- Закон "О защите прав потребителей"
- Судебная практика по аналогичным делам

**Рекомендуемые действия:**
1. Соберите все необходимые документы
2. Обратитесь с письменной претензией
3. При необходимости обратитесь в суд

**Сроки:**
- Претензия: 10 дней на рассмотрение
- Судебное разбирательство: до 2 месяцев

⚠️ **Важно:** Данная информация носит общий характер. Для конкретной ситуации рекомендую обратиться к юристу.`;

    return baseAnswer;
  }

  /**
   * Извлечение правовых ссылок из ответа
   */
  private extractLegalReferences(answer: string, sources: LegalSource[]): string[] {
    const references: string[] = [];
    
    // Простое извлечение упоминаний статей
    const articleMatches = answer.match(/ст\.\s*\d+/g);
    if (articleMatches) {
      references.push(...articleMatches);
    }

    // Добавляем ссылки из источников
    sources.forEach(source => {
      if (source.type === 'law' && source.title) {
        references.push(source.title);
      }
    });

    return [...new Set(references)]; // Убираем дубликаты
  }

  /**
   * Генерация предлагаемых действий
   */
  private generateSuggestedActions(answer: string, sources: LegalSource[]): string[] {
    const actions = [
      'Собрать все документы по делу',
      'Составить письменную претензию',
      'Обратиться к юристу за консультацией'
    ];

    if (answer.includes('суд')) {
      actions.push('Подготовить исковое заявление');
      actions.push('Обратиться в суд');
    }

    if (answer.includes('претензия')) {
      actions.push('Направить претензию заказным письмом');
      actions.push('Дождаться ответа в течение 10 дней');
    }

    return actions;
  }

  /**
   * Расчет уверенности в ответе
   */
  private calculateConfidence(sources: LegalSource[]): number {
    if (sources.length === 0) return 0.1;
    
    const avgRelevance = sources.reduce((sum, source) => sum + source.relevance, 0) / sources.length;
    const sourceCount = Math.min(sources.length / 5, 1); // Нормализуем количество источников
    
    return Math.min(avgRelevance * sourceCount, 0.95);
  }
}

export default RAGService;
