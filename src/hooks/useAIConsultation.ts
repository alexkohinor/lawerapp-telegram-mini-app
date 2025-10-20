'use client';

import { useState, useCallback } from 'react';
import { LegalContext, AISuggestion } from '@/types';

/**
 * Хук для работы с AI консультациями
 * Основано на FEATURE_SPECIFICATION.md
 */

interface ConsultationResponse {
  response: string;
  confidence: number;
  suggestions: AISuggestion[];
  sources: any[];
  reasoning: string;
  agent: string;
  timestamp: string;
}

interface UseAIConsultationReturn {
  isLoading: boolean;
  error: string | null;
  consultation: ConsultationResponse | null;
  getConsultation: (query: string, context: LegalContext, options?: {
    useRAG?: boolean;
    useMultiAgent?: boolean;
  }) => Promise<ConsultationResponse>;
  clearError: () => void;
  clearConsultation: () => void;
}

export function useAIConsultation(): UseAIConsultationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consultation, setConsultation] = useState<ConsultationResponse | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearConsultation = useCallback(() => {
    setConsultation(null);
  }, []);

  const getConsultation = useCallback(async (
    query: string,
    context: LegalContext,
    options: {
      useRAG?: boolean;
      useMultiAgent?: boolean;
    } = {}
  ): Promise<ConsultationResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          context,
          useRAG: options.useRAG ?? true,
          useMultiAgent: options.useMultiAgent ?? true,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Ошибка получения консультации');
      }

      const consultationData = result.data;
      setConsultation(consultationData);
      
      return consultationData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка получения консультации';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    consultation,
    getConsultation,
    clearError,
    clearConsultation,
  };
}

/**
 * Хук для получения статистики AI сервисов
 */
interface AIStats {
  usage: {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    requestsToday: number;
  };
  knowledgeBase: {
    totalDocuments: number;
    totalChunks: number;
    legalAreas: Record<string, number>;
    lastUpdated: Date;
  };
  agents: {
    overall: boolean;
    agents: Record<string, boolean>;
  };
  user: {
    consultationCount: number;
    subscriptionStatus: string;
  };
}

interface UseAIStatsReturn {
  stats: AIStats | null;
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<AIStats>;
  clearError: () => void;
}

export function useAIStats(): UseAIStatsReturn {
  const [stats, setStats] = useState<AIStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchStats = useCallback(async (): Promise<AIStats> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/consultation');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Ошибка получения статистики');
      }

      const statsData = result.data;
      setStats(statsData);
      
      return statsData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка получения статистики';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
    clearError,
  };
}
