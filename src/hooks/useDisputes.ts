'use client';

import { useState, useCallback } from 'react';
import { CreateDisputeRequest, UpdateDisputeRequest, SearchDisputesRequest } from '@/lib/validations/dispute';
import { Dispute } from '@/types';

/**
 * Хук для управления спорами
 * Основано на FEATURE_SPECIFICATION.md
 */

interface UseDisputesReturn {
  disputes: Dispute[];
  isLoading: boolean;
  error: string | null;
  createDispute: (data: CreateDisputeRequest) => Promise<Dispute>;
  updateDispute: (id: string, data: UpdateDisputeRequest) => Promise<Dispute>;
  deleteDispute: (id: string) => Promise<void>;
  fetchDisputes: (searchParams?: Partial<SearchDisputesRequest>) => Promise<Dispute[]>;
  fetchDispute: (id: string) => Promise<Dispute>;
  clearError: () => void;
}

export function useDisputes(): UseDisputesReturn {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createDispute = useCallback(async (data: CreateDisputeRequest): Promise<Dispute> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/disputes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Ошибка создания спора');
      }

      const newDispute = result.data;
      setDisputes(prev => [newDispute, ...prev]);
      
      return newDispute;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка создания спора';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDispute = useCallback(async (id: string, data: UpdateDisputeRequest): Promise<Dispute> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/disputes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Ошибка обновления спора');
      }

      const updatedDispute = result.data;
      setDisputes(prev => prev.map(dispute => 
        dispute.id === id ? updatedDispute : dispute
      ));
      
      return updatedDispute;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления спора';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDispute = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/disputes/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Ошибка удаления спора');
      }

      setDisputes(prev => prev.filter(dispute => dispute.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления спора';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDisputes = useCallback(async (searchParams?: Partial<SearchDisputesRequest>): Promise<Dispute[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (searchParams) {
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else if (value instanceof Date) {
              params.append(key, value.toISOString());
            } else {
              params.append(key, String(value));
            }
          }
        });
      }

      const response = await fetch(`/api/disputes?${params.toString()}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Ошибка загрузки споров');
      }

      const fetchedDisputes = result.data;
      setDisputes(fetchedDisputes);
      
      return fetchedDisputes;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки споров';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDispute = useCallback(async (id: string): Promise<Dispute> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/disputes/${id}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Ошибка загрузки спора');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки спора';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    disputes,
    isLoading,
    error,
    createDispute,
    updateDispute,
    deleteDispute,
    fetchDisputes,
    fetchDispute,
    clearError,
  };
}
