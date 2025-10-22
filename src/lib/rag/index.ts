/**
 * RAG System - главный экспорт для системы Retrieval-Augmented Generation
 * Объединяет все компоненты для работы с правовой базой знаний
 */

// Основные сервисы
export { RAGService } from './rag-service';
export { VectorDBClient } from './vector-db-client';
export { ObjectStorageClient } from './object-storage-client';
export { EmbeddingClient } from './embedding-client';
export { DocumentProcessor } from './document-processor';

// Конфигурация
export { defaultRAGConfig, type RAGConfig } from './config';

// Типы
export type {
  RAGQuery,
  RAGResult,
  LegalSource,
  LegalArea
} from './rag-service';

export type {
  VectorDocument,
  VectorSearchOptions,
  VectorSearchResult
} from './vector-db-client';

export type {
  DocumentMetadata,
  UploadOptions,
  ListOptions,
  ListResult
} from './object-storage-client';

export type {
  EmbeddingRequest,
  EmbeddingResponse,
  BatchEmbeddingRequest,
  BatchEmbeddingResponse
} from './embedding-client';

export type {
  ProcessingOptions,
  ProcessingResult,
  DocumentChunk
} from './document-processor';

/**
 * Фабрика для создания RAG системы
 */
export class RAGSystemFactory {
  /**
   * Создание полной RAG системы
   */
  static createRAGSystem(config: import('./config').RAGConfig) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { VectorDBClient } = require('./vector-db-client');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ObjectStorageClient } = require('./object-storage-client');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { EmbeddingClient } = require('./embedding-client');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DocumentProcessor } = require('./document-processor');
    
    const vectorDbClient = new VectorDBClient(config);
    const objectStorageClient = new ObjectStorageClient(config);
    const embeddingClient = new EmbeddingClient(config);
    const documentProcessor = new DocumentProcessor(
      vectorDbClient,
      objectStorageClient,
      embeddingClient,
      config
    );
    const ragService = new RAGService(config);

    return {
      ragService,
      vectorDbClient,
      objectStorageClient,
      embeddingClient,
      documentProcessor
    };
  }

  /**
   * Создание RAG системы с дефолтной конфигурацией
   */
  static createDefaultRAGSystem() {
    return this.createRAGSystem(defaultRAGConfig);
  }
}

/**
 * Утилиты для работы с RAG системой
 */
export class RAGUtils {
  /**
   * Валидация конфигурации
   */
  static validateConfig(config: RAGConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.timeweb.apiKey) {
      errors.push('TimeWeb API ключ не указан');
    }

    if (!config.objectStorage.bucket) {
      errors.push('S3 bucket не указан');
    }

    if (!config.objectStorage.accessKeyId) {
      errors.push('S3 Access Key ID не указан');
    }

    if (!config.objectStorage.secretAccessKey) {
      errors.push('S3 Secret Access Key не указан');
    }

    if (config.embedding.dimensions <= 0) {
      errors.push('Размерность эмбеддингов должна быть больше 0');
    }

    if (config.documentProcessing.chunkSize <= 0) {
      errors.push('Размер чанка должен быть больше 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Генерация уникального ID для документа
   */
  static generateDocumentId(prefix: string = 'doc'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Генерация уникального ID для чанка
   */
  static generateChunkId(documentId: string, chunkIndex: number): string {
    return `${documentId}_chunk_${chunkIndex}`;
  }

  /**
   * Нормализация текста для обработки
   */
  static normalizeText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\u0400-\u04FF.,!?;:()-]/g, '')
      .toLowerCase();
  }

  /**
   * Извлечение ключевых слов из текста
   */
  static extractKeywords(text: string, maxKeywords: number = 10): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s\u0400-\u04FF]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }

  /**
   * Определение области права по тексту
   */
  static detectLegalArea(text: string): LegalArea {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('потребитель') || lowerText.includes('товар') || lowerText.includes('услуга')) {
      return 'consumer-rights';
    }

    if (lowerText.includes('труд') || lowerText.includes('работник') || lowerText.includes('зарплата')) {
      return 'labor-law';
    }

    if (lowerText.includes('семья') || lowerText.includes('брак') || lowerText.includes('развод')) {
      return 'family-law';
    }

    if (lowerText.includes('налог') || lowerText.includes('доход') || lowerText.includes('финанс')) {
      return 'tax-law';
    }

    if (lowerText.includes('преступление') || lowerText.includes('уголовн') || lowerText.includes('наказание')) {
      return 'criminal-law';
    }

    if (lowerText.includes('договор') || lowerText.includes('сделка') || lowerText.includes('имущество')) {
      return 'civil-law';
    }

    return 'general';
  }

  /**
   * Форматирование размера файла
   */
  static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Форматирование времени обработки
   */
  static formatProcessingTime(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    }
    if (milliseconds < 60000) {
      return `${Math.round(milliseconds / 1000)}s`;
    }
    return `${Math.round(milliseconds / 60000)}m ${Math.round((milliseconds % 60000) / 1000)}s`;
  }
}

// Экспорт по умолчанию
export default {
  RAGService,
  VectorDBClient,
  ObjectStorageClient,
  EmbeddingClient,
  DocumentProcessor,
  RAGSystemFactory,
  RAGUtils,
  defaultRAGConfig
};
