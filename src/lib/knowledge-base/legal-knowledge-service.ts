/**
 * Сервис для работы с базой знаний правовых документов
 * Интеграция с TimeWeb Cloud S3 и векторной базой данных
 */

import { RAGConfig } from '../rag/config';
import { LegalSource } from '../rag/rag-service';

export interface LegalDocument {
  id: string;
  title: string;
  type: 'law' | 'regulation' | 'precedent' | 'template';
  category: LegalCategory;
  content: string;
  url?: string;
  effectiveDate?: Date;
  lastUpdated?: Date;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface LegalCategory {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  children?: LegalCategory[];
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'claim' | 'lawsuit' | 'contract' | 'complaint' | 'petition';
  category: string;
  template: string;
  variables: TemplateVariable[];
  description: string;
  examples: string[];
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'date' | 'number' | 'select';
  required: boolean;
  description: string;
  options?: string[];
  defaultValue?: string;
}

export class LegalKnowledgeService {
  private config: RAGConfig;
  private s3Client: unknown;
  private vectorDbClient: unknown;

  constructor(config: RAGConfig) {
    this.config = config;
    this.initializeClients();
  }

  private async initializeClients() {
    // Инициализация S3 клиента для TimeWeb Cloud
    const { S3Client } = await import('@aws-sdk/client-s3');
    this.s3Client = new S3Client({
      endpoint: this.config.objectStorage.endpoint,
      region: this.config.objectStorage.region,
      credentials: {
        accessKeyId: this.config.objectStorage.accessKeyId,
        secretAccessKey: this.config.objectStorage.secretAccessKey,
      },
      forcePathStyle: true,
    });

    // Инициализация векторной БД клиента
    this.vectorDbClient = await this.createVectorDbClient();
  }

  private async createVectorDbClient() {
    // Создание клиента для векторной БД TimeWeb Cloud
    return {
      endpoint: this.config.vectorDb.endpoint,
      apiKey: this.config.vectorDb.apiKey,
      collectionName: this.config.vectorDb.collectionName,
    };
  }

  /**
   * Загрузка правовых документов в базу знаний
   */
  async uploadLegalDocuments(documents: LegalDocument[]): Promise<void> {
    try {
      for (const doc of documents) {
        // Сохранение документа в S3
        await this.saveDocumentToS3(doc);
        
        // Создание эмбеддингов и сохранение в векторную БД
        await this.indexDocument(doc);
      }
    } catch (error) {
      console.error('Ошибка загрузки правовых документов:', error);
      throw error;
    }
  }

  /**
   * Сохранение документа в S3 хранилище TimeWeb Cloud
   */
  private async saveDocumentToS3(document: LegalDocument): Promise<void> {
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    
    const key = `legal-documents/${document.type}/${document.id}.json`;
    const content = JSON.stringify(document, null, 2);
    
    const command = new PutObjectCommand({
      Bucket: this.config.objectStorage.bucket,
      Key: key,
      Body: content,
      ContentType: 'application/json',
      Metadata: {
        'document-id': document.id,
        'document-type': document.type,
        'category': document.category.id,
        'title': document.title,
      },
    });

    await (this.s3Client as { send: (command: unknown) => Promise<unknown> }).send(command);
  }

  /**
   * Индексация документа в векторной базе данных
   */
  private async indexDocument(document: LegalDocument): Promise<void> {
    try {
      // Создание эмбеддингов для документа
      const embeddings = await this.createEmbeddings(document.content);
      
      // Сохранение в векторную БД
      await this.saveToVectorDb({
        id: document.id,
        vector: embeddings,
        metadata: {
          title: document.title,
          type: document.type,
          category: document.category.name,
          content: document.content,
          tags: document.tags,
          url: document.url,
          effectiveDate: document.effectiveDate?.toISOString(),
          lastUpdated: document.lastUpdated?.toISOString(),
        },
      });
    } catch (error) {
      console.error('Ошибка индексации документа:', error);
      throw error;
    }
  }

  /**
   * Создание эмбеддингов для текста
   */
  private async createEmbeddings(text: string): Promise<number[]> {
    try {
      const response = await fetch(this.config.timeweb.embeddingServiceEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.timeweb.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.embedding.model,
          input: text,
          dimensions: this.config.embedding.dimensions,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка создания эмбеддингов: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Ошибка создания эмбеддингов:', error);
      throw error;
    }
  }

  /**
   * Сохранение в векторную базу данных
   */
  private async saveToVectorDb(document: {
    id: string;
    vector: number[];
    metadata: Record<string, unknown>;
  }): Promise<void> {
    try {
      const response = await fetch(`${this.config.vectorDb.endpoint}/collections/${this.config.vectorDb.collectionName}/points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.vectorDb.apiKey}`,
        },
        body: JSON.stringify({
          points: [{
            id: document.id,
            vector: document.vector,
            payload: document.metadata,
          }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка сохранения в векторную БД: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Ошибка сохранения в векторную БД:', error);
      throw error;
    }
  }

  /**
   * Поиск релевантных правовых документов
   */
  async searchLegalDocuments(query: string, filters?: {
    type?: string;
    category?: string;
    tags?: string[];
  }): Promise<LegalSource[]> {
    try {
      // Создание эмбеддинга для запроса
      const queryEmbedding = await this.createEmbeddings(query);
      
      // Поиск в векторной БД
      const searchResults = await this.searchVectorDb(queryEmbedding, filters);
      
      // Преобразование результатов в LegalSource
      return searchResults.map(result => ({
        id: result.id,
        title: result.payload.title as string,
        content: result.payload.content as string,
        type: result.payload.type as 'law' | 'precedent' | 'template' | 'guideline',
        relevance: result.score,
        url: result.payload.url as string,
      }));
    } catch (error) {
      console.error('Ошибка поиска правовых документов:', error);
      throw error;
    }
  }

  /**
   * Поиск в векторной базе данных
   */
  private async searchVectorDb(
    queryVector: number[],
    filters?: {
      type?: string;
      category?: string;
      tags?: string[];
    }
  ): Promise<Array<{
    id: string;
    score: number;
    payload: Record<string, unknown>;
  }>> {
    try {
      const searchPayload: Record<string, unknown> = {
        vector: queryVector,
        limit: 10,
        with_payload: true,
        with_vector: false,
      };

      // Добавление фильтров
      if (filters) {
        const must: Record<string, unknown>[] = [];
        
        if (filters.type) {
          must.push({
            key: 'type',
            match: { value: filters.type },
          });
        }
        
        if (filters.category) {
          must.push({
            key: 'category',
            match: { value: filters.category },
          });
        }
        
        if (filters.tags && filters.tags.length > 0) {
          must.push({
            key: 'tags',
            match: { any: filters.tags },
          });
        }

        if (must.length > 0) {
          searchPayload.filter = { must };
        }
      }

      const response = await fetch(`${this.config.vectorDb.endpoint}/collections/${this.config.vectorDb.collectionName}/points/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.vectorDb.apiKey}`,
        },
        body: JSON.stringify(searchPayload),
      });

      if (!response.ok) {
        throw new Error(`Ошибка поиска в векторной БД: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Ошибка поиска в векторной БД:', error);
      throw error;
    }
  }

  /**
   * Получение шаблонов документов
   */
  async getDocumentTemplates(category?: string): Promise<DocumentTemplate[]> {
    try {
      const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
      
      const command = new ListObjectsV2Command({
        Bucket: this.config.objectStorage.bucket,
        Prefix: 'document-templates/',
      });

      const response = await (this.s3Client as { send: (command: unknown) => Promise<{ Contents?: unknown[] }> }).send(command);
      
      if (!response.Contents) {
        return [];
      }

      const templates: DocumentTemplate[] = [];
      
      for (const obj of response.Contents) {
        const typedObj = obj as { Key?: string };
        if (typedObj.Key?.endsWith('.json')) {
          const template = await this.getDocumentTemplate(typedObj.Key);
          if (template && (!category || template.category === category)) {
            templates.push(template);
          }
        }
      }

      return templates;
    } catch (error) {
      console.error('Ошибка получения шаблонов документов:', error);
      throw error;
    }
  }

  /**
   * Получение конкретного шаблона документа
   */
  private async getDocumentTemplate(key: string): Promise<DocumentTemplate | null> {
    try {
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
      
      const command = new GetObjectCommand({
        Bucket: this.config.objectStorage.bucket,
        Key: key,
      });

      const response = await (this.s3Client as { send: (command: unknown) => Promise<{ Body?: { transformToString: () => Promise<string> } }> }).send(command);
      const content = await response.Body?.transformToString();
      
      if (!content) {
        return null;
      }

      return JSON.parse(content) as DocumentTemplate;
    } catch (error) {
      console.error('Ошибка получения шаблона документа:', error);
      return null;
    }
  }

  /**
   * Создание коллекции в векторной БД
   */
  async createVectorCollection(): Promise<void> {
    try {
      const response = await fetch(`${this.config.vectorDb.endpoint}/collections`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.vectorDb.apiKey}`,
        },
        body: JSON.stringify({
          name: this.config.vectorDb.collectionName,
          vectors: {
            size: this.config.vectorDb.dimensions,
            distance: 'Cosine',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка создания коллекции: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Ошибка создания коллекции:', error);
      throw error;
    }
  }

  /**
   * Сохранение шаблона документа в S3
   */
  async saveDocumentTemplate(template: DocumentTemplate): Promise<void> {
    try {
      const { PutObjectCommand } = await import('@aws-sdk/client-s3');
      
      const key = `document-templates/${template.type}/${template.id}.json`;
      const content = JSON.stringify(template, null, 2);
      
      const command = new PutObjectCommand({
        Bucket: this.config.objectStorage.bucket,
        Key: key,
        Body: content,
        ContentType: 'application/json',
        Metadata: {
          'template-id': template.id,
          'template-type': template.type,
          'category': template.category,
          'name': template.name,
        },
      });

      await (this.s3Client as { send: (command: unknown) => Promise<unknown> }).send(command);
    } catch (error) {
      console.error('Ошибка сохранения шаблона документа:', error);
      throw error;
    }
  }

  /**
   * Получение статистики базы знаний
   */
  async getKnowledgeBaseStats(): Promise<{
    totalDocuments: number;
    documentsByType: Record<string, number>;
    documentsByCategory: Record<string, number>;
    totalTemplates: number;
    lastUpdated: Date;
  }> {
    try {
      // Получение статистики из векторной БД
      const vectorStats = await this.getVectorDbStats();
      
      // Получение статистики шаблонов из S3
      const templateStats = await this.getTemplateStats();
      
      return {
        totalDocuments: vectorStats.totalPoints,
        documentsByType: vectorStats.byType,
        documentsByCategory: vectorStats.byCategory,
        totalTemplates: templateStats.totalTemplates,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Ошибка получения статистики базы знаний:', error);
      throw error;
    }
  }

  private async getVectorDbStats(): Promise<{
    totalPoints: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
  }> {
    try {
      const response = await fetch(`${this.config.vectorDb.endpoint}/collections/${this.config.vectorDb.collectionName}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.vectorDb.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка получения статистики векторной БД: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        totalPoints: data.points_count || 0,
        byType: {},
        byCategory: {},
      };
    } catch (error) {
      console.error('Ошибка получения статистики векторной БД:', error);
      return {
        totalPoints: 0,
        byType: {},
        byCategory: {},
      };
    }
  }

  private async getTemplateStats(): Promise<{
    totalTemplates: number;
  }> {
    try {
      const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
      
      const command = new ListObjectsV2Command({
        Bucket: this.config.objectStorage.bucket,
        Prefix: 'document-templates/',
      });

      const response = await (this.s3Client as { send: (command: unknown) => Promise<{ Contents?: unknown[] }> }).send(command);
      return {
        totalTemplates: response.Contents?.length || 0,
      };
    } catch (error) {
      console.error('Ошибка получения статистики шаблонов:', error);
      return {
        totalTemplates: 0,
      };
    }
  }
}

export default LegalKnowledgeService;
