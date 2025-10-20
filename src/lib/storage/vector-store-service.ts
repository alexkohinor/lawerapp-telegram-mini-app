import { DataEncryption } from './data-encryption';
import { Pool } from 'pg';

/**
 * Сервис для работы с векторным хранилищем
 * Реализация через TimeWeb Cloud PostgreSQL + pgvector
 * Основано на VECTOR_STORAGE_REALITY.md
 */

interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    title: string;
    legalArea: string;
    jurisdiction: string;
    authority: string;
    documentType: string;
    lastUpdated: Date;
    url?: string;
    tags: string[];
  };
}

interface SearchResult {
  id: string;
  content: string;
  similarity: number;
  metadata: any;
}

interface VectorStoreStats {
  totalDocuments: number;
  totalChunks: number;
  legalAreas: Record<string, number>;
  lastUpdated: Date;
  storageSize: string;
}

export class VectorStoreService {
  private db: Pool;

  constructor() {
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required');
    }
  }

  /**
   * Инициализация векторной базы данных
   */
  async initializeDatabase(): Promise<void> {
    try {
      // Создаем расширение pgvector
      await this.db.query('CREATE EXTENSION IF NOT EXISTS vector');

      // Создаем таблицу для векторных документов
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS legal_documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          embedding vector(1536),
          legal_area VARCHAR(50) NOT NULL,
          jurisdiction VARCHAR(20) DEFAULT 'russia',
          authority VARCHAR(200),
          document_type VARCHAR(50),
          url TEXT,
          tags TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Создаем индекс для векторного поиска
      await this.db.query(`
        CREATE INDEX IF NOT EXISTS legal_documents_embedding_idx 
        ON legal_documents USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100)
      `);

      // Создаем функцию поиска похожих документов
      await this.db.query(`
        CREATE OR REPLACE FUNCTION search_similar_documents(
          query_embedding vector(1536),
          match_threshold float DEFAULT 0.7,
          match_count int DEFAULT 10,
          filter_area text DEFAULT NULL
        )
        RETURNS TABLE (
          id UUID,
          title TEXT,
          content TEXT,
          similarity FLOAT,
          legal_area VARCHAR(50)
        )
        LANGUAGE SQL
        AS $$
          SELECT 
            legal_documents.id,
            legal_documents.title,
            legal_documents.content,
            1 - (legal_documents.embedding <=> query_embedding) AS similarity,
            legal_documents.legal_area
          FROM legal_documents
          WHERE 
            (filter_area IS NULL OR legal_documents.legal_area = filter_area)
            AND 1 - (legal_documents.embedding <=> query_embedding) > match_threshold
          ORDER BY legal_documents.embedding <=> query_embedding
          LIMIT match_count;
        $$
      `);

      console.log('Vector database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw new Error('Failed to initialize vector database');
    }
  }

  /**
   * Добавление документа в векторную базу
   */
  async addDocument(document: VectorDocument): Promise<void> {
    try {
      // Проверяем, что документ не содержит персональных данных
      this.validateDocument(document);

      await this.db.query(`
        INSERT INTO legal_documents (
          id, title, content, embedding, legal_area,
          jurisdiction, authority, document_type, url, tags
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          content = EXCLUDED.content,
          embedding = EXCLUDED.embedding,
          legal_area = EXCLUDED.legal_area,
          jurisdiction = EXCLUDED.jurisdiction,
          authority = EXCLUDED.authority,
          document_type = EXCLUDED.document_type,
          url = EXCLUDED.url,
          tags = EXCLUDED.tags,
          updated_at = NOW()
      `, [
        document.id,
        document.title,
        document.content,
        `[${document.embedding.join(',')}]`, // pgvector формат
        document.metadata.legalArea,
        document.metadata.jurisdiction,
        document.metadata.authority,
        document.metadata.documentType,
        document.metadata.url,
        document.metadata.tags
      ]);

      console.log(`Document ${document.id} added to vector store`);
    } catch (error) {
      console.error('Error adding document to vector store:', error);
      throw new Error('Failed to add document to vector store');
    }
  }

  /**
   * Поиск похожих документов
   */
  async searchSimilar(
    queryEmbedding: number[],
    options: {
      limit?: number;
      threshold?: number;
      filters?: Record<string, any>;
    } = {}
  ): Promise<SearchResult[]> {
    try {
      const { limit = 10, threshold = 0.7, filters = {} } = options;
      const legalArea = filters?.legalArea || null;

      const results = await this.db.query(`
        SELECT * FROM search_similar_documents(
          $1::vector,
          $2::float,
          $3::int,
          $4::text
        )
      `, [
        `[${queryEmbedding.join(',')}]`,
        threshold,
        limit,
        legalArea
      ]);

      return results.rows.map(row => ({
        id: row.id,
        content: row.content,
        similarity: row.similarity,
        metadata: {
          title: row.title,
          legalArea: row.legal_area,
          jurisdiction: 'russia',
          authority: 'unknown',
          documentType: 'law',
          lastUpdated: new Date(),
          url: undefined,
          tags: [],
        },
      }));
    } catch (error) {
      console.error('Error searching vector store:', error);
      throw new Error('Failed to search vector store');
    }
  }

  /**
   * Обновление документа в векторной базе
   */
  async updateDocument(documentId: string, updates: Partial<VectorDocument>): Promise<void> {
    try {
      const response = await axios.put(
        `${this.baseUrl}/vector-store/collections/${this.collectionName}/documents/${documentId}`,
        {
          vector: updates.embedding,
          metadata: updates.metadata ? {
            content: updates.content,
            title: updates.metadata.title,
            legal_area: updates.metadata.legalArea,
            jurisdiction: updates.metadata.jurisdiction,
            authority: updates.metadata.authority,
            document_type: updates.metadata.documentType,
            last_updated: updates.metadata.lastUpdated.toISOString(),
            url: updates.metadata.url,
            tags: updates.metadata.tags,
          } : undefined,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'X-Project-ID': this.projectId,
          },
        }
      );

      if (response.status !== 200) {
        throw new Error('Failed to update document in vector store');
      }

      console.log(`Document ${documentId} updated in vector store`);
    } catch (error) {
      console.error('Error updating document in vector store:', error);
      throw new Error('Failed to update document in vector store');
    }
  }

  /**
   * Удаление документа из векторной базы
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/vector-store/collections/${this.collectionName}/documents/${documentId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Project-ID': this.projectId,
          },
        }
      );

      if (response.status !== 204) {
        throw new Error('Failed to delete document from vector store');
      }

      console.log(`Document ${documentId} deleted from vector store`);
    } catch (error) {
      console.error('Error deleting document from vector store:', error);
      throw new Error('Failed to delete document from vector store');
    }
  }

  /**
   * Получение статистики векторной базы
   */
  async getStats(): Promise<VectorStoreStats> {
    try {
      const result = await this.db.query(`
        SELECT 
          COUNT(*) as total_documents,
          COUNT(DISTINCT legal_area) as legal_areas_count,
          MAX(created_at) as last_updated
        FROM legal_documents
      `);

      const areaStats = await this.db.query(`
        SELECT legal_area, COUNT(*) as count
        FROM legal_documents
        GROUP BY legal_area
      `);

      const legalAreas: Record<string, number> = {};
      areaStats.rows.forEach(row => {
        legalAreas[row.legal_area] = parseInt(row.count);
      });

      return {
        totalDocuments: parseInt(result.rows[0].total_documents),
        totalChunks: parseInt(result.rows[0].total_documents), // В MVP один документ = один чанк
        legalAreas,
        lastUpdated: new Date(result.rows[0].last_updated),
        storageSize: 'Calculated by PostgreSQL',
      };
    } catch (error) {
      console.error('Error getting vector store stats:', error);
      return {
        totalDocuments: 0,
        totalChunks: 0,
        legalAreas: {},
        lastUpdated: new Date(),
        storageSize: '0 MB',
      };
    }
  }

  /**
   * Массовое добавление документов
   */
  async addDocuments(documents: VectorDocument[]): Promise<void> {
    try {
      // Проверяем все документы на отсутствие персональных данных
      documents.forEach(doc => this.validateDocument(doc));

      const batchSize = 100; // Размер батча для массовой загрузки
      
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        
        const response = await axios.post(
          `${this.baseUrl}/vector-store/collections/${this.collectionName}/documents/batch`,
          {
            documents: batch.map(doc => ({
              id: doc.id,
              vector: doc.embedding,
              metadata: {
                content: doc.content,
                title: doc.metadata.title,
                legal_area: doc.metadata.legalArea,
                jurisdiction: doc.metadata.jurisdiction,
                authority: doc.metadata.authority,
                document_type: doc.metadata.documentType,
                last_updated: doc.metadata.lastUpdated.toISOString(),
                url: doc.metadata.url,
                tags: doc.metadata.tags,
              },
            })),
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
              'X-Project-ID': this.projectId,
            },
          }
        );

        if (response.status !== 201) {
          throw new Error(`Failed to add batch ${i / batchSize + 1}`);
        }

        console.log(`Batch ${i / batchSize + 1} added to vector store`);
      }
    } catch (error) {
      console.error('Error adding documents to vector store:', error);
      throw new Error('Failed to add documents to vector store');
    }
  }

  /**
   * Проверка здоровья векторной базы
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/vector-store/health`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Project-ID': this.projectId,
          },
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('Vector store health check failed:', error);
      return false;
    }
  }

  /**
   * Валидация документа на отсутствие персональных данных
   */
  private validateDocument(document: VectorDocument): void {
    const content = document.content.toLowerCase();
    const title = document.metadata.title.toLowerCase();
    
    // Проверяем на наличие персональных данных
    const personalDataPatterns = [
      /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/, // Номер карты
      /\b\d{3}-\d{3}-\d{2}-\d{2}\b/, // СНИЛС
      /\b\d{4}\s\d{6}\b/, // Паспорт
      /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/, // Email
      /\b\+?[1-9]\d{1,14}\b/, // Телефон
    ];

    for (const pattern of personalDataPatterns) {
      if (pattern.test(content) || pattern.test(title)) {
        throw new Error('Document contains personal data and cannot be stored in vector database');
      }
    }

    // Проверяем на наличие имен и фамилий (базовая проверка)
    const namePatterns = [
      /\b[А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+\b/, // Русские имена
      /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/, // Английские имена
    ];

    for (const pattern of namePatterns) {
      if (pattern.test(content) || pattern.test(title)) {
        console.warn('Document may contain names, please review:', document.id);
      }
    }
  }

  /**
   * Создание индекса для быстрого поиска
   */
  async createIndex(): Promise<void> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/vector-store/collections/${this.collectionName}/index`,
        {
          type: 'hnsw', // Hierarchical Navigable Small World
          parameters: {
            m: 16, // Количество связей
            ef_construction: 200, // Параметр построения
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'X-Project-ID': this.projectId,
          },
        }
      );

      if (response.status !== 201) {
        throw new Error('Failed to create index');
      }

      console.log('Vector store index created successfully');
    } catch (error) {
      console.error('Error creating index:', error);
      throw new Error('Failed to create vector store index');
    }
  }

  /**
   * Получение информации о коллекции
   */
  async getCollectionInfo(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/vector-store/collections/${this.collectionName}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Project-ID': this.projectId,
          },
        }
      );

      if (response.status !== 200) {
        throw new Error('Failed to get collection info');
      }

      return response.data;
    } catch (error) {
      console.error('Error getting collection info:', error);
      throw new Error('Failed to get collection info');
    }
  }
}

// Экспорт синглтона
export const vectorStoreService = new VectorStoreService();
