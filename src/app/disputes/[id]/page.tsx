'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Timeline } from '@/components/ui/Timeline';
import { Modal } from '@/components/ui/Modal';
import { Dispute } from '@/types/dispute';
import { DISPUTE_TYPES } from '@/types/dispute';

export default function DisputeDetailPage() {
  const params = useParams();
  const disputeId = params.id as string;
  
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');

  const fetchDispute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/disputes/${disputeId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Спор не найден');
        }
        throw new Error('Ошибка загрузки спора');
      }

      const data: Dispute = await response.json();
      setDispute(data);
    } catch (err) {
      console.error('Error fetching dispute:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [disputeId]);

  const updateDisputeStatus = async (status: string) => {
    try {
      const response = await fetch(`/api/disputes/${disputeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Ошибка обновления статуса');
      }

      const updatedDispute = await response.json();
      setDispute(updatedDispute);
      setShowStatusModal(false);
      setNewStatus('');
    } catch (err) {
      console.error('Error updating dispute status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    if (disputeId) {
      fetchDispute();
    }
  }, [disputeId, fetchDispute]);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number | null) => {
    if (!amount) return 'Не указана';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(amount);
  };

  const statusOptions = [
    { value: 'ACTIVE', label: 'Активный' },
    { value: 'PENDING', label: 'В ожидании' },
    { value: 'RESOLVED', label: 'Решен' },
    { value: 'CLOSED', label: 'Закрыт' },
  ];

  if (loading) {
    return (
      <div className="container-narrow">
        <AppHeader title="Загрузка..." showBack onBack={() => history.back()} />
        <div className="section">
          <Card>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted">Загрузка спора...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="container-narrow">
        <AppHeader title="Ошибка" showBack onBack={() => history.back()} />
        <div className="section">
          <Card>
            <div className="text-center py-8">
              <div className="text-red-500 text-lg mb-4">⚠️</div>
              <p className="text-red-600 mb-4">Ошибка загрузки спора</p>
              <p className="text-muted text-sm mb-4">{error}</p>
              <Button onClick={fetchDispute}>Попробовать снова</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container-narrow">
      <AppHeader title="Детали спора" showBack onBack={() => history.back()} />
      
      {/* Header with status and priority */}
      <div className="section">
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                {dispute.title}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <StatusBadge status={dispute.status} />
                <PriorityBadge priority={dispute.priority} />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setNewStatus(dispute.status);
                setShowStatusModal(true);
              }}
            >
              Изменить статус
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted">Тип спора:</span>
              <span className="ml-2 font-medium">{DISPUTE_TYPES[dispute.type]}</span>
            </div>
            <div>
              <span className="text-muted">Сумма:</span>
              <span className="ml-2 font-medium">{formatAmount(dispute.amount)}</span>
            </div>
            <div>
              <span className="text-muted">Создан:</span>
              <span className="ml-2 font-medium">{formatDate(dispute.createdAt)}</span>
            </div>
            <div>
              <span className="text-muted">Обновлен:</span>
              <span className="ml-2 font-medium">{formatDate(dispute.updatedAt)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Description */}
      <div className="section">
        <Card>
          <h2 className="text-lg font-semibold mb-3">Описание</h2>
          <p className="text-muted">
            {dispute.description || 'Описание не указано'}
          </p>
        </Card>
      </div>

      {/* Documents */}
      <div className="section">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Документы</h2>
            <Button variant="outline">
              Добавить документ
            </Button>
          </div>
          
          {dispute.documents.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📄</div>
              <p className="text-muted">Документы не добавлены</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dispute.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📄</div>
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-sm text-muted">
                        {doc.documentType} • {formatDate(doc.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Скачать
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Timeline */}
      <div className="section">
        <Card>
          <h2 className="text-lg font-semibold mb-4">История событий</h2>
          <Timeline events={dispute.timeline} />
        </Card>
      </div>

      {/* Actions */}
      <div className="section">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              // TODO: Navigate to edit dispute page
              console.log('Edit dispute');
            }}
          >
            Редактировать
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // TODO: Add comment functionality
              console.log('Add comment');
            }}
          >
            Добавить комментарий
          </Button>
          {dispute.status !== 'CLOSED' && (
            <Button
              variant="danger"
              onClick={() => updateDisputeStatus('CLOSED')}
            >
              Закрыть спор
            </Button>
          )}
        </div>
      </div>

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setNewStatus('');
        }}
        title="Изменить статус спора"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Новый статус</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowStatusModal(false);
                setNewStatus('');
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={() => updateDisputeStatus(newStatus)}
              disabled={newStatus === dispute.status}
            >
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
