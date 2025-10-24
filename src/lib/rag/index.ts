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

// Локальный импорт для использования в фабричных методах
import { RAGService } from './rag-service';
import { defaultRAGConfig } from './config';

/**
 * Фабрика для создания RAG системы
 */
export class RAGSystemFactory {
  /**
   * Создание RAG системы с кастомной конфигурацией
   */
  static createRAGSystem(config: any) {
    return new RAGService(config);
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
export const RAGUtils = {
  /**
   * Создание RAG системы с дефолтными настройками
   */
  createDefault: () => RAGSystemFactory.createDefaultRAGSystem(),
  
  /**
   * Создание RAG системы с кастомными настройками
   */
  createCustom: (config: RAGConfig) => RAGSystemFactory.createRAGSystem(config),
  
  /**
   * Получение дефолтной конфигурации
   */
  getDefaultConfig: () => defaultRAGConfig
};

/**
 * Экспорт по умолчанию - фабрика RAG системы
 */
export default {
  RAGSystemFactory,
  RAGUtils,
  defaultRAGConfig
};