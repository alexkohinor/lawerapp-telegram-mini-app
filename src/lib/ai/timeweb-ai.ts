import axios from 'axios';
import { AIConsultation, LegalContext, LegalSource } from '@/types';

/**
 * Сервис для работы с TimeWeb Cloud AI
 * Основано на AI_INTEGRATION.md и FEATURE_SPECIFICATION.md
 */

interface TimeWebAIResponse {
  success: boolean;
  data: {
    response: string;
    confidence: number;
    sources: LegalSource[];
    tokensUsed: number;
    cost: number;
    model: string;
  };
  error?: string;
}

interface TimeWebEmbeddingResponse {
  success: boolean;
  data: {
    embedding: number[];
    model: string;
  };
  error?: string;
}

export class TimeWebAIService {
  private apiKey: string;
  private baseUrl: string;
  private projectId: string;

  constructor() {
    this.apiKey = process.env.TIMEWEB_API_KEY || '';
    this.baseUrl = process.env.TIMEWEB_API_URL || 'https://api.timeweb.com';
    this.projectId = process.env.TIMEWEB_PROJECT_ID || '';

    if (!this.apiKey) {
      throw new Error('TIMEWEB_API_KEY is required');
    }
  }

  /**
   * Получение правовой консультации
   */
  async getLegalConsultation(
    query: string, 
    context: LegalContext
  ): Promise<AIConsultation> {
    try {
      const response = await axios.post<TimeWebAIResponse>(
        `${this.baseUrl}/ai/legal-consultation`,
        {
          query,
          context,
          model: 'gpt-4o',
          temperature: 0.7,
          maxTokens: 2000,
          includeSources: true,
          jurisdiction: 'russia',
          language: 'ru',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'X-Project-ID': this.projectId,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'AI service error');
      }

      const { data } = response.data;

      return {
        id: this.generateId(),
        userId: context.userProfile?.userId || 'anonymous',
        query,
        context,
        response: data.response,
        confidence: data.confidence,
        sources: data.sources,
        model: data.model,
        tokensUsed: data.tokensUsed,
        cost: data.cost,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('TimeWeb AI consultation error:', error);
      throw new Error('Ошибка получения AI консультации');
    }
  }

  /**
   * Генерация эмбеддингов для текста
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await axios.post<TimeWebEmbeddingResponse>(
        `${this.baseUrl}/ai/embeddings`,
        {
          text,
          model: 'text-embedding-3-large',
          dimensions: 1536,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'X-Project-ID': this.projectId,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Embedding generation error');
      }

      return response.data.data.embedding;
    } catch (error) {
      console.error('TimeWeb embedding error:', error);
      throw new Error('Ошибка генерации эмбеддингов');
    }
  }

  /**
   * Классификация правовой области
   */
  async classifyLegalArea(query: string): Promise<string> {
    try {
      const response = await axios.post<TimeWebAIResponse>(
        `${this.baseUrl}/ai/classify-legal-area`,
        {
          query,
          model: 'gpt-4o-mini',
          temperature: 0.3,
          maxTokens: 100,
          categories: [
            'civil',
            'criminal', 
            'administrative',
            'labor',
            'family',
            'tax',
            'corporate',
            'consumer_protection',
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'X-Project-ID': this.projectId,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Classification error');
      }

      return response.data.data.response.toLowerCase();
    } catch (error) {
      console.error('TimeWeb classification error:', error);
      return 'civil'; // fallback
    }
  }

  /**
   * Анализ сложности правового вопроса
   */
  async analyzeComplexity(query: string): Promise<{
    complexity: 'simple' | 'medium' | 'complex';
    estimatedTime: number; // в минутах
    requiresExpert: boolean;
  }> {
    try {
      const response = await axios.post<TimeWebAIResponse>(
        `${this.baseUrl}/ai/analyze-complexity`,
        {
          query,
          model: 'gpt-4o-mini',
          temperature: 0.3,
          maxTokens: 200,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'X-Project-ID': this.projectId,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Complexity analysis error');
      }

      // Парсим ответ AI
      const analysis = JSON.parse(response.data.data.response);
      
      return {
        complexity: analysis.complexity || 'medium',
        estimatedTime: analysis.estimatedTime || 15,
        requiresExpert: analysis.requiresExpert || false,
      };
    } catch (error) {
      console.error('TimeWeb complexity analysis error:', error);
      return {
        complexity: 'medium',
        estimatedTime: 15,
        requiresExpert: false,
      };
    }
  }

  /**
   * Генерация предложений действий
   */
  async generateActionSuggestions(
    query: string,
    context: LegalContext
  ): Promise<Array<{
    action: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    estimatedCost?: number;
  }>> {
    try {
      const response = await axios.post<TimeWebAIResponse>(
        `${this.baseUrl}/ai/action-suggestions`,
        {
          query,
          context,
          model: 'gpt-4o',
          temperature: 0.5,
          maxTokens: 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'X-Project-ID': this.projectId,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Action suggestions error');
      }

      // Парсим ответ AI
      const suggestions = JSON.parse(response.data.data.response);
      
      return suggestions || [];
    } catch (error) {
      console.error('TimeWeb action suggestions error:', error);
      return [];
    }
  }

  /**
   * Проверка здоровья сервиса
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/ai/health`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Project-ID': this.projectId,
          },
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('TimeWeb AI health check failed:', error);
      return false;
    }
  }

  /**
   * Получение статистики использования
   */
  async getUsageStats(): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    requestsToday: number;
  }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/ai/usage-stats`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Project-ID': this.projectId,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('TimeWeb usage stats error:', error);
      return {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        requestsToday: 0,
      };
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

// Экспорт синглтона
export const timeWebAI = new TimeWebAIService();
