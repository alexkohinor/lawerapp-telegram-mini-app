/**
 * Embedding Client - клиент для работы с TimeWeb Cloud Embedding Service
 * Обеспечивает генерацию векторных представлений текстов
 */

import { RAGConfig } from './config';

export interface EmbeddingRequest {
  text: string;
  model?: string;
  dimensions?: number;
}

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
  dimensions: number;
  tokens: number;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

export interface BatchEmbeddingRequest {
  texts: string[];
  model?: string;
  dimensions?: number;
}

export interface BatchEmbeddingResponse {
  embeddings: number[][];
  model: string;
  dimensions: number;
  totalTokens: number;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

export class EmbeddingClient {
  private config: RAGConfig;
  private endpoint: string;
  private apiKey: string;
  private defaultModel: string;
  private defaultDimensions: number;

  constructor(config: RAGConfig) {
    this.config = config;
    this.endpoint = config.timeweb.embeddingServiceEndpoint;
    this.apiKey = config.timeweb.apiKey;
    this.defaultModel = config.embedding.model;
    this.defaultDimensions = config.embedding.dimensions;
  }

  /**
   * Генерация эмбеддинга для одного текста
   */
  async generateEmbedding(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    try {
      const response = await fetch(`${this.endpoint}/v1/embeddings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: request.text,
          model: request.model || this.defaultModel,
          dimensions: request.dimensions || this.defaultDimensions
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Ошибка генерации эмбеддинга: ${response.statusText} - ${errorData.error?.message || ''}`);
      }

      const data = await response.json();
      
      return {
        embedding: data.data[0].embedding,
        model: data.model,
        dimensions: data.data[0].embedding.length,
        tokens: data.usage.prompt_tokens,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          totalTokens: data.usage.total_tokens
        }
      };
    } catch (error) {
      console.error('Embedding Client Error:', error);
      throw new Error(`Ошибка генерации эмбеддинга: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Генерация эмбеддингов для массива текстов
   */
  async generateEmbeddings(request: BatchEmbeddingRequest): Promise<BatchEmbeddingResponse> {
    try {
      const response = await fetch(`${this.endpoint}/v1/embeddings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: request.texts,
          model: request.model || this.defaultModel,
          dimensions: request.dimensions || this.defaultDimensions
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Ошибка генерации эмбеддингов: ${response.statusText} - ${errorData.error?.message || ''}`);
      }

      const data = await response.json();
      
      return {
        embeddings: data.data.map((item: any) => item.embedding),
        model: data.model,
        dimensions: data.data[0].embedding.length,
        totalTokens: data.usage.total_tokens,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          totalTokens: data.usage.total_tokens
        }
      };
    } catch (error) {
      console.error('Embedding Client Batch Error:', error);
      throw new Error(`Ошибка генерации эмбеддингов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Генерация эмбеддингов с батчингом для больших объемов
   */
  async generateEmbeddingsBatched(
    texts: string[], 
    options: { model?: string; dimensions?: number; batchSize?: number } = {}
  ): Promise<number[][]> {
    const batchSize = options.batchSize || this.config.embedding.batchSize;
    const embeddings: number[][] = [];

    try {
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        
        const batchResponse = await this.generateEmbeddings({
          texts: batch,
          model: options.model,
          dimensions: options.dimensions
        });

        embeddings.push(...batchResponse.embeddings);

        // Небольшая задержка между батчами для избежания rate limiting
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return embeddings;
    } catch (error) {
      console.error('Embedding Client Batched Error:', error);
      throw new Error(`Ошибка батчевой генерации эмбеддингов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Предобработка текста перед генерацией эмбеддинга
   */
  preprocessText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Убираем лишние пробелы
      .replace(/[^\w\s\u0400-\u04FF.,!?;:()-]/g, '') // Оставляем только буквы, цифры, пробелы и знаки препинания
      .substring(0, this.config.embedding.maxTokens * 4); // Ограничиваем длину
  }

  /**
   * Валидация текста
   */
  validateText(text: string): { isValid: boolean; error?: string } {
    if (!text || text.trim().length === 0) {
      return { isValid: false, error: 'Текст не может быть пустым' };
    }

    if (text.length > this.config.embedding.maxTokens * 4) {
      return { 
        isValid: false, 
        error: `Текст слишком длинный. Максимум ${this.config.embedding.maxTokens * 4} символов` 
      };
    }

    return { isValid: true };
  }

  /**
   * Получение информации о модели
   */
  async getModelInfo(): Promise<{
    model: string;
    dimensions: number;
    maxTokens: number;
    supportedLanguages: string[];
  }> {
    try {
      const response = await fetch(`${this.endpoint}/v1/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка получения информации о модели: ${response.statusText}`);
      }

      const data = await response.json();
      const model = data.data.find((m: any) => m.id === this.defaultModel);
      
      if (!model) {
        throw new Error(`Модель ${this.defaultModel} не найдена`);
      }

      return {
        model: model.id,
        dimensions: this.defaultDimensions,
        maxTokens: model.context_length || this.config.embedding.maxTokens,
        supportedLanguages: model.supported_languages || ['ru', 'en']
      };
    } catch (error) {
      console.error('Embedding Model Info Error:', error);
      // Возвращаем дефолтную информацию в случае ошибки
      return {
        model: this.defaultModel,
        dimensions: this.defaultDimensions,
        maxTokens: this.config.embedding.maxTokens,
        supportedLanguages: ['ru', 'en']
      };
    }
  }

  /**
   * Вычисление косинусного сходства между двумя векторами
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Размерности векторов должны совпадать');
    }

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Поиск наиболее похожих эмбеддингов
   */
  findMostSimilar(
    queryEmbedding: number[], 
    candidateEmbeddings: number[][], 
    topK: number = 5
  ): Array<{ index: number; similarity: number }> {
    const similarities = candidateEmbeddings.map((embedding, index) => ({
      index,
      similarity: this.calculateSimilarity(queryEmbedding, embedding)
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }
}

export default EmbeddingClient;
