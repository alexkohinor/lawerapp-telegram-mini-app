/**
 * Конфигурация RAG системы для работы с внешними сервисами
 * TimeWeb Cloud, S3, Vector Database
 */

export interface RAGConfig {
  // TimeWeb Cloud настройки
  timeweb: {
    apiKey: string;
    vectorDbEndpoint: string;
    objectStorageEndpoint: string;
    embeddingServiceEndpoint: string;
  };
  
  // S3/Object Storage настройки
  objectStorage: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint: string;
  };
  
  // Vector Database настройки
  vectorDb: {
    endpoint: string;
    apiKey: string;
    collectionName: string;
    dimensions: number;
  };
  
  // Embedding Service настройки
  embedding: {
    model: string;
    dimensions: number;
    maxTokens: number;
    batchSize: number;
  };
  
  // Document Processing настройки
  documentProcessing: {
    chunkSize: number;
    chunkOverlap: number;
    maxFileSize: number;
    supportedFormats: string[];
  };
}

export const defaultRAGConfig: RAGConfig = {
  timeweb: {
    apiKey: process.env.TIMEWEB_API_KEY || '',
    vectorDbEndpoint: process.env.TIMEWEB_VECTOR_DB_ENDPOINT || 'https://vector-db.timeweb.cloud',
    objectStorageEndpoint: process.env.TIMEWEB_OBJECT_STORAGE_ENDPOINT || 'https://s3.timeweb.cloud',
    embeddingServiceEndpoint: process.env.TIMEWEB_EMBEDDING_ENDPOINT || 'https://embedding.timeweb.cloud'
  },
  
  objectStorage: {
    bucket: process.env.S3_BUCKET_NAME || 'lawerapp-documents',
    region: process.env.S3_REGION || 'ru-1',
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
    endpoint: process.env.S3_ENDPOINT || 'https://s3.timeweb.cloud'
  },
  
  vectorDb: {
    endpoint: process.env.VECTOR_DB_ENDPOINT || 'https://vector-db.timeweb.cloud',
    apiKey: process.env.VECTOR_DB_API_KEY || '',
    collectionName: process.env.VECTOR_DB_COLLECTION || 'legal-documents',
    dimensions: 1536
  },
  
  embedding: {
    model: 'text-embedding-3-small',
    dimensions: 1536,
    maxTokens: 8191,
    batchSize: 100
  },
  
  documentProcessing: {
    chunkSize: 1000, // Размер чанка в символах
    chunkOverlap: 200, // Перекрытие между чанками
    maxFileSize: 50 * 1024 * 1024, // 50MB максимум
    supportedFormats: ['pdf', 'docx', 'doc', 'txt', 'rtf']
  }
};

export default defaultRAGConfig;
