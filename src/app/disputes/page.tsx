'use client';

import React, { useState, useEffect } from 'react';
import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Dispute, DisputeFilters } from '@/types/dispute';
import { DISPUTE_TYPES } from '@/types/dispute';

interface DisputesResponse {
  data: Dispute[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const tabs = [
  { id: 'all', label: 'Все', count: 0 },
  { id: 'ACTIVE', label: 'Активные', count: 0 },
  { id: 'PENDING', label: 'В ожидании', count: 0 },
  { id: 'RESOLVED', label: 'Решенные', count: 0 },
  { id: 'CLOSED', label: 'Закрытые', count: 0 },
];

export default function DisputesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<DisputesResponse['pagination'] | null>(null);

  const fetchDisputes = async (filters: DisputeFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/disputes?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch disputes');
      }

      const data: DisputesResponse = await response.json();
      setDisputes(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching disputes:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filters: DisputeFilters = {
      status: activeTab === 'all' ? undefined : activeTab as 'ACTIVE' | 'PENDING' | 'RESOLVED' | 'CLOSED',
      page: 1,
      limit: 20,
    };
    fetchDisputes(filters);
  }, [activeTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleCreateDispute = () => {
    // TODO: Navigate to create dispute page
    console.log('Create new dispute');
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number | null) => {
    if (!amount) return 'Не указана';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container-narrow">
        <AppHeader title="Управление спорами" showBack onBack={() => history.back()} />
        <div className="section">
          <div className="card">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted">Загрузка споров...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-narrow">
        <AppHeader title="Управление спорами" showBack onBack={() => history.back()} />
        <div className="section">
          <div className="card">
            <div className="text-center py-8">
              <div className="text-red-500 text-lg mb-4">⚠️</div>
              <p className="text-red-600 mb-4">Ошибка загрузки споров</p>
              <p className="text-muted text-sm mb-4">{error}</p>
              <Button onClick={() => fetchDisputes()}>Попробовать снова</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-narrow">
      <AppHeader title="Управление спорами" showBack onBack={() => history.back()} />
      
      <div className="section">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Мои споры</h2>
          <Button onClick={handleCreateDispute}>
            Создать спор
          </Button>
        </div>

        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={handleTabChange}
          className="mb-6"
        />
      </div>

      <div className="section">
        {disputes.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'all' ? 'Споры не найдены' : 'Споры не найдены в этой категории'}
              </h3>
              <p className="text-muted mb-6">
                {activeTab === 'all' 
                  ? 'Создайте ваш первый спор для начала работы'
                  : 'Попробуйте выбрать другую категорию или создать новый спор'
                }
              </p>
              <Button onClick={handleCreateDispute}>
                Создать спор
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <Card key={dispute.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {dispute.title}
                      </h3>
                      <StatusBadge status={dispute.status} />
                      <PriorityBadge priority={dispute.priority} />
                    </div>
                    
                    <p className="text-muted text-sm mb-3 line-clamp-2">
                      {dispute.description || 'Описание не указано'}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted">
                      <span>Тип: {DISPUTE_TYPES[dispute.type]}</span>
                      {dispute.amount && (
                        <span>Сумма: {formatAmount(dispute.amount)}</span>
                      )}
                      <span>Создан: {formatDate(dispute.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="text-sm text-muted">
                      {dispute.documents.length} документов
                    </div>
                    <div className="text-xs text-muted">
                      {dispute.timeline.length} событий
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="section">
          <div className="flex justify-center items-center gap-4">
            <Button
              variant="outline"
              disabled={!pagination.hasPrevPage}
              onClick={() => {
                const filters: DisputeFilters = {
                  status: activeTab === 'all' ? undefined : activeTab as 'ACTIVE' | 'PENDING' | 'RESOLVED' | 'CLOSED',
                  page: pagination.page - 1,
                };
                fetchDisputes(filters);
              }}
            >
              Назад
            </Button>
            
            <span className="text-sm text-muted">
              Страница {pagination.page} из {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              disabled={!pagination.hasNextPage}
              onClick={() => {
                const filters: DisputeFilters = {
                  status: activeTab === 'all' ? undefined : activeTab as 'ACTIVE' | 'PENDING' | 'RESOLVED' | 'CLOSED',
                  page: pagination.page + 1,
                };
                fetchDisputes(filters);
              }}
            >
              Вперед
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
