/**
 * Vector Database Client - клиент для работы с TimeWeb Cloud Vector Database
 * Обеспечивает хранение и поиск векторных представлений документов
 */

import { RAGConfig } from './config';

export interface VectorDocument {
  id: string;
  vector: number[];
  metadata: {
    documentId: string;
    chunkIndex: number;
    content: string;
    title: string;
    legalArea: string;
    documentType: 'law' | 'precedent' | 'template' | 'guideline';
    source: string;
    url?: string;
    tags: string[];
    createdAt: string;
  };
}

export interface VectorSearchOptions {
  vector: number[];
  legalArea?: string;
  documentType?: string;
  maxResults?: number;
  threshold?: number;
  includeMetadata?: boolean;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata: VectorDocument['metadata'];
}

export class VectorDBClient {
  private config: RAGConfig;
  private baseUrl: string;
  private apiKey: string;

  constructor(config: RAGConfig) {
    this.config = config;
    this.baseUrl = config.vectorDb.endpoint;
    this.apiKey = config.vectorDb.apiKey;
  }

  /**
   * Инициализация коллекции в векторной БД
   */
  async initializeCollection(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/collections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: this.config.vectorDb.collectionName,
          dimensions: this.config.vectorDb.dimensions,
          metric: 'cosine'
        })
      });

      if (!response.ok && response.status !== 409) { // 409 = коллекция уже существует
        throw new Error(`Ошибка создания коллекции: ${response.statusText}`);
      }

      console.log('Коллекция векторной БД инициализирована');
    } catch (error) {
      console.error('Vector DB Initialization Error:', error);
      throw new Error(`Ошибка инициализации векторной БД: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Добавление документа в векторную БД
   */
  async addDocument(document: VectorDocument): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/collections/${this.config.vectorDb.collectionName}/points`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          points: [{
            id: document.id,
            vector: document.vector,
            payload: document.metadata
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Ошибка добавления документа: ${response.statusText}`);
      }

      console.log(`Документ ${document.id} добавлен в векторную БД`);
    } catch (error) {
      console.error('Vector DB Add Document Error:', error);
      throw new Error(`Ошибка добавления документа в векторную БД: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Массовое добавление документов
   */
  async addDocuments(documents: VectorDocument[]): Promise<void> {
    try {
      const batchSize = 100; // Размер батча для оптимизации
      
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        
        const response = await fetch(`${this.baseUrl}/collections/${this.config.vectorDb.collectionName}/points`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            points: batch.map(doc => ({
              id: doc.id,
              vector: doc.vector,
              payload: doc.metadata
            }))
          })
        });

        if (!response.ok) {
          throw new Error(`Ошибка добавления батча документов: ${response.statusText}`);
        }

        console.log(`Добавлен батч документов: ${i + 1}-${Math.min(i + batchSize, documents.length)}`);
      }
    } catch (error) {
      console.error('Vector DB Add Documents Error:', error);
      throw new Error(`Ошибка массового добавления документов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Поиск похожих документов
   */
  async search(options: VectorSearchOptions): Promise<VectorSearchResult[]> {
    try {
      const {
        vector,
        legalArea,
        documentType,
        maxResults = 10,
        threshold = 0.7,
        includeMetadata = true
      } = options;

      // Строим фильтр
      const filter: Record<string, unknown> = {};
      if (legalArea) {
        filter.legalArea = legalArea;
      }
      if (documentType) {
        filter.documentType = documentType;
      }

      const response = await fetch(`${this.baseUrl}/collections/${this.config.vectorDb.collectionName}/points/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vector,
          limit: maxResults,
          score_threshold: threshold,
          with_payload: includeMetadata,
          filter: Object.keys(filter).length > 0 ? filter : undefined
        })
      });

      if (!response.ok) {
        throw new Error(`Ошибка поиска: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.result.map((item: any) => ({
        id: item.id,
        score: item.score,
        metadata: item.payload
      }));

    } catch (error) {
      console.error('Vector DB Search Error:', error);
      throw new Error(`Ошибка поиска в векторной БД: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Обновление документа
   */
  async updateDocument(id: string, vector: number[], metadata: Partial<VectorDocument['metadata']>): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/collections/${this.config.vectorDb.collectionName}/points`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          points: [{
            id,
            vector,
            payload: metadata
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Ошибка обновления документа: ${response.statusText}`);
      }

      console.log(`Документ ${id} обновлен в векторной БД`);
    } catch (error) {
      console.error('Vector DB Update Error:', error);
      throw new Error(`Ошибка обновления документа в векторной БД: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Удаление документа
   */
  async deleteDocument(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/collections/${this.config.vectorDb.collectionName}/points`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          points: [id]
        })
      });

      if (!response.ok) {
        throw new Error(`Ошибка удаления документа: ${response.statusText}`);
      }

      console.log(`Документ ${id} удален из векторной БД`);
    } catch (error) {
      console.error('Vector DB Delete Error:', error);
      throw new Error(`Ошибка удаления документа из векторной БД: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение статистики коллекции
   */
  async getCollectionInfo(): Promise<{
    pointsCount: number;
    vectorsCount: number;
    indexedVectorsCount: number;
    payloadSchema: Record<string, unknown>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/collections/${this.config.vectorDb.collectionName}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка получения информации о коллекции: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        pointsCount: data.points_count || 0,
        vectorsCount: data.vectors_count || 0,
        indexedVectorsCount: data.indexed_vectors_count || 0,
        payloadSchema: data.payload_schema || {}
      };
    } catch (error) {
      console.error('Vector DB Collection Info Error:', error);
      throw new Error(`Ошибка получения информации о коллекции: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Очистка коллекции (для тестирования)
   */
  async clearCollection(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/collections/${this.config.vectorDb.collectionName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка очистки коллекции: ${response.statusText}`);
      }

      console.log('Коллекция векторной БД очищена');
    } catch (error) {
      console.error('Vector DB Clear Error:', error);
      throw new Error(`Ошибка очистки коллекции: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }
}

export default VectorDBClient;
