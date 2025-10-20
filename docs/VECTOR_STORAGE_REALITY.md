# 🗄️ Реальная архитектура векторного хранения в TimeWeb Cloud

## 📋 Обзор

TimeWeb Cloud **НЕ предоставляет** специализированный Vector Store сервис. Вместо этого мы используем комбинацию доступных сервисов TimeWeb Cloud для реализации векторного хранения.

## 🏗️ Реальные варианты реализации

### **Вариант 1: PostgreSQL + pgvector (Рекомендуемый)**

**Использование**: TimeWeb Cloud PostgreSQL + расширение pgvector

```sql
-- Установка расширения pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Таблица для хранения векторных документов
CREATE TABLE legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536), -- Размерность OpenAI embeddings
    legal_area VARCHAR(50) NOT NULL,
    jurisdiction VARCHAR(20) DEFAULT 'russia',
    authority VARCHAR(200),
    document_type VARCHAR(50),
    url TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекс для быстрого поиска по векторам
CREATE INDEX ON legal_documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Функция поиска похожих документов
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
$$;
```

**Преимущества**:
- ✅ Интеграция с основной базой данных
- ✅ ACID транзакции
- ✅ Надежность и отказоустойчивость
- ✅ Встроенное резервное копирование
- ✅ Масштабируемость

**Недостатки**:
- ❌ Ограниченная производительность для больших объемов
- ❌ Сложность настройки индексов

### **Вариант 2: TimeWeb Cloud S3 + Elasticsearch**

**Использование**: S3 для хранения + Elasticsearch для поиска

```typescript
// Структура данных в S3
interface VectorDocument {
  id: string;
  title: string;
  content: string;
  embedding: number[];
  metadata: {
    legalArea: string;
    jurisdiction: string;
    authority: string;
    documentType: string;
    lastUpdated: string;
    url?: string;
    tags: string[];
  };
}

// Elasticsearch mapping для векторного поиска
const elasticsearchMapping = {
  mappings: {
    properties: {
      title: { type: 'text' },
      content: { type: 'text' },
      embedding: {
        type: 'dense_vector',
        dims: 1536,
        index: true,
        similarity: 'cosine'
      },
      legal_area: { type: 'keyword' },
      jurisdiction: { type: 'keyword' },
      authority: { type: 'keyword' },
      document_type: { type: 'keyword' },
      tags: { type: 'keyword' },
      created_at: { type: 'date' },
      updated_at: { type: 'date' }
    }
  }
};
```

**Преимущества**:
- ✅ Высокая производительность поиска
- ✅ Гибкие запросы
- ✅ Масштабируемость
- ✅ Полнотекстовый поиск + векторный поиск

**Недостатки**:
- ❌ Дополнительная сложность архитектуры
- ❌ Необходимость синхронизации данных
- ❌ Дополнительные затраты

### **Вариант 3: TimeWeb Cloud S3 + Redis + PostgreSQL**

**Использование**: Гибридный подход

```typescript
class HybridVectorStorage {
  // S3 для долгосрочного хранения
  async storeInS3(document: VectorDocument): Promise<void> {
    const s3Key = `legal-docs/${document.legalArea}/${document.id}.json`;
    await this.s3Client.putObject({
      Bucket: 'lawerapp-vectors',
      Key: s3Key,
      Body: JSON.stringify(document),
      ContentType: 'application/json'
    });
  }

  // Redis для кэширования популярных векторов
  async cacheInRedis(document: VectorDocument): Promise<void> {
    const cacheKey = `vector:${document.id}`;
    await this.redisClient.setex(
      cacheKey,
      3600, // 1 час
      JSON.stringify(document.embedding)
    );
  }

  // PostgreSQL для метаданных и быстрого поиска
  async storeMetadata(document: VectorDocument): Promise<void> {
    await this.db.query(`
      INSERT INTO legal_documents_metadata (
        id, title, legal_area, authority, 
        document_type, s3_key, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      document.id,
      document.title,
      document.metadata.legalArea,
      document.metadata.authority,
      document.metadata.documentType,
      `legal-docs/${document.legalArea}/${document.id}.json`,
      new Date()
    ]);
  }
}
```

## 🎯 **Рекомендуемая архитектура**

### **Для MVP: PostgreSQL + pgvector**

```typescript
// Обновленный сервис векторного хранения
export class RealVectorStoreService {
  private db: DatabaseConnection;

  constructor() {
    this.db = new DatabaseConnection(process.env.DATABASE_URL);
  }

  /**
   * Добавление документа в векторную базу
   */
  async addDocument(document: VectorDocument): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO legal_documents (
          id, title, content, embedding, legal_area,
          jurisdiction, authority, document_type, url, tags
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
      console.error('Error adding document:', error);
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
      legalArea?: string;
    } = {}
  ): Promise<SearchResult[]> {
    const { limit = 10, threshold = 0.7, legalArea } = options;

    try {
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
        }
      }));
    } catch (error) {
      console.error('Error searching documents:', error);
      throw new Error('Failed to search vector store');
    }
  }

  /**
   * Получение статистики
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
      console.error('Error getting stats:', error);
      return {
        totalDocuments: 0,
        totalChunks: 0,
        legalAreas: {},
        lastUpdated: new Date(),
        storageSize: '0 MB',
      };
    }
  }
}
```

## 🔧 **Конфигурация TimeWeb Cloud**

### **PostgreSQL настройки**

```sql
-- Включение расширения pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Настройка для векторного поиска
ALTER SYSTEM SET shared_preload_libraries = 'vector';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Перезапуск для применения настроек
SELECT pg_reload_conf();
```

### **S3 настройки (для резервных копий)**

```typescript
// Конфигурация S3 для TimeWeb Cloud
const s3Config = {
  endpoint: 'https://s3.timeweb.com',
  region: 'ru-1',
  credentials: {
    accessKeyId: process.env.TIMEWEB_S3_ACCESS_KEY,
    secretAccessKey: process.env.TIMEWEB_S3_SECRET_KEY,
  },
  s3ForcePathStyle: true,
};
```

## 📊 **Сравнение вариантов**

| Критерий | PostgreSQL + pgvector | S3 + Elasticsearch | S3 + Redis + PostgreSQL |
|----------|----------------------|-------------------|------------------------|
| **Сложность** | Низкая | Высокая | Средняя |
| **Производительность** | Средняя | Высокая | Средняя |
| **Стоимость** | Низкая | Высокая | Средняя |
| **Надежность** | Высокая | Средняя | Высокая |
| **Масштабируемость** | Средняя | Высокая | Средняя |
| **Время разработки** | Быстро | Медленно | Средне |

## 🎯 **Рекомендация**

**Для MVP и начального этапа**: **PostgreSQL + pgvector**

**Причины**:
1. ✅ Простота реализации
2. ✅ Интеграция с основной базой данных
3. ✅ Низкие затраты
4. ✅ Быстрая разработка
5. ✅ Достаточная производительность для начального этапа

**Миграция в будущем**: При росте данных можно мигрировать на S3 + Elasticsearch для лучшей производительности.

## 🔄 **План миграции**

1. **Этап 1**: PostgreSQL + pgvector (MVP)
2. **Этап 2**: Добавление S3 для резервных копий
3. **Этап 3**: Миграция на S3 + Elasticsearch при необходимости
4. **Этап 4**: Оптимизация и масштабирование

Этот подход позволяет начать с простого решения и масштабироваться по мере роста потребностей.
