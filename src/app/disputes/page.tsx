'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

interface Dispute {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  amount: number;
  currency: string;
  parties: string[];
  documents: unknown[];
  timeline: unknown[];
  createdAt: string;
  updatedAt: string;
}

interface DisputeForm {
  title: string;
  description: string;
  type: string;
  priority: string;
  amount: string;
  parties: string;
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [form, setForm] = useState<DisputeForm>({
    title: '',
    description: '',
    type: 'OTHER',
    priority: 'MEDIUM',
    amount: '',
    parties: ''
  });

  const disputeTypes = [
    { id: 'CONSUMER_RIGHTS', name: 'Права потребителей', description: 'Споры по качеству товаров и услуг' },
    { id: 'CONTRACT_DISPUTE', name: 'Договорные споры', description: 'Споры по исполнению договоров' },
    { id: 'SERVICE_QUALITY', name: 'Качество услуг', description: 'Споры по качеству оказанных услуг' },
    { id: 'DELIVERY_ISSUE', name: 'Проблемы с доставкой', description: 'Споры по доставке товаров' },
    { id: 'OTHER', name: 'Другие споры', description: 'Иные правовые споры' }
  ];

  const priorityLevels = [
    { id: 'LOW', name: 'Низкий', color: 'bg-green-100 text-green-800' },
    { id: 'MEDIUM', name: 'Средний', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'HIGH', name: 'Высокий', color: 'bg-red-100 text-red-800' }
  ];

  const statusColors = {
    'ACTIVE': 'bg-blue-100 text-blue-800',
    'RESOLVED': 'bg-green-100 text-green-800',
    'CLOSED': 'bg-gray-100 text-gray-800',
    'ESCALATED': 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    try {
      // Mock disputes data
      const mockDisputes: Dispute[] = [
        {
          id: 'dispute_1',
          title: 'Возврат некачественного товара',
          description: 'Купленный товар оказался некачественным',
          type: 'CONSUMER_RIGHTS',
          status: 'ACTIVE',
          priority: 'HIGH',
          amount: 5000,
          currency: 'RUB',
          parties: ['ООО "Магазин"', 'Иванов И.И.'],
          documents: [],
          timeline: [{
            id: 'event_1',
            type: 'CREATED',
            description: 'Спор создан',
            timestamp: new Date().toISOString(),
            userId: 'telegram_user'
          }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setDisputes(mockDisputes);
    } catch (error) {
      console.error('Error loading disputes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDispute = async () => {
    if (!form.title.trim()) {
      alert('Пожалуйста, введите название спора');
      return;
    }

    try {
      // Mock dispute creation
      const newDispute: Dispute = {
        id: `dispute_${Date.now()}`,
        title: form.title,
        description: form.description,
        type: form.type,
        status: 'ACTIVE',
        priority: form.priority,
        amount: form.amount ? parseFloat(form.amount) : 0,
        currency: 'RUB',
        parties: form.parties.split(',').map(p => p.trim()).filter(p => p),
        documents: [],
        timeline: [{
          id: `event_${Date.now()}`,
          type: 'CREATED',
          description: 'Спор создан',
          timestamp: new Date().toISOString(),
          userId: 'telegram_user'
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setDisputes(prev => [newDispute, ...prev]);
      setShowCreateModal(false);
      setForm({
        title: '',
        description: '',
        type: 'OTHER',
        priority: 'MEDIUM',
        amount: '',
        parties: ''
      });
    } catch (error) {
      console.error('Error creating dispute:', error);
      alert('Ошибка при создании спора. Попробуйте еще раз.');
    }
  };

  const handleUpdateDisputeStatus = async (disputeId: string, newStatus: string) => {
    try {
      // Mock dispute update
      setDisputes(prev => prev.map(dispute => 
        dispute.id === disputeId 
          ? { 
              ...dispute, 
              status: newStatus,
              updatedAt: new Date().toISOString(),
              timeline: [
                ...dispute.timeline,
                {
                  id: `event_${Date.now()}`,
                  type: 'UPDATED',
                  description: `Статус изменен на ${newStatus}`,
                  timestamp: new Date().toISOString(),
                  userId: 'telegram_user'
                }
              ]
            }
          : dispute
      ));
    } catch (error) {
      console.error('Error updating dispute:', error);
    }
  };

  const getDisputeTypeName = (type: string) => {
    return disputeTypes.find(t => t.id === type)?.name || type;
  };

  const getPriorityName = (priority: string) => {
    return priorityLevels.find(p => p.id === priority)?.name || priority;
  };

  const getPriorityColor = (priority: string) => {
    return priorityLevels.find(p => p.id === priority)?.color || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка споров...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Управление спорами
            </h1>
            <p className="text-gray-600">
              Отслеживайте и управляйте вашими правовыми спорами
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            Создать спор
          </Button>
        </div>

        {/* Disputes List */}
        {disputes.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-4xl mb-4">⚖️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Споры не найдены
            </h3>
            <p className="text-gray-600 mb-4">
              Создайте ваш первый спор для начала работы
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              Создать спор
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {disputes.map((dispute) => (
              <Card key={dispute.id} hover className="cursor-pointer" onClick={() => setSelectedDispute(dispute)}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {dispute.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${statusColors[dispute.status as keyof typeof statusColors]}`}>
                    {dispute.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {dispute.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Тип:</span>
                    <span>{getDisputeTypeName(dispute.type)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Приоритет:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(dispute.priority)}`}>
                      {getPriorityName(dispute.priority)}
                    </span>
                  </div>
                  
                  {dispute.amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Сумма:</span>
                      <span className="font-medium">{dispute.amount} {dispute.currency}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Создан:</span>
                    <span>{new Date(dispute.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Dispute Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Создать новый спор"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Название спора"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Краткое описание спора"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Подробное описание ситуации"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип спора
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {disputeTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Приоритет
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priorityLevels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <Input
              label="Сумма спора (руб.)"
              type="number"
              value={form.amount}
              onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0"
            />
            
            <Input
              label="Участники спора (через запятую)"
              value={form.parties}
              onChange={(e) => setForm(prev => ({ ...prev, parties: e.target.value }))}
              placeholder="ООО 'Компания', ИП Иванов И.И."
            />
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Отмена
              </Button>
              <Button onClick={handleCreateDispute}>
                Создать спор
              </Button>
            </div>
          </div>
        </Modal>

        {/* Dispute Details Modal */}
        <Modal
          isOpen={!!selectedDispute}
          onClose={() => setSelectedDispute(null)}
          title={selectedDispute?.title}
          size="xl"
        >
          {selectedDispute && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Статус</h4>
                  <span className={`px-3 py-1 text-sm rounded-full ${statusColors[selectedDispute.status as keyof typeof statusColors]}`}>
                    {selectedDispute.status}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Приоритет</h4>
                  <span className={`px-3 py-1 text-sm rounded-full ${getPriorityColor(selectedDispute.priority)}`}>
                    {getPriorityName(selectedDispute.priority)}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Описание</h4>
                <p className="text-gray-600">{selectedDispute.description}</p>
              </div>
              
              {selectedDispute.parties.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Участники</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {selectedDispute.parties.map((party, index) => (
                      <li key={index}>{party}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Timeline */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">История</h4>
                <div className="space-y-2">
                  {selectedDispute.timeline.map((event, index) => {
                    const timelineEvent = event as { description: string; timestamp: string };
                    return (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{timelineEvent.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(timelineEvent.timestamp).toLocaleString('ru-RU')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  {selectedDispute.status === 'ACTIVE' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateDisputeStatus(selectedDispute.id, 'RESOLVED')}
                      >
                        Отметить решенным
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateDisputeStatus(selectedDispute.id, 'ESCALATED')}
                      >
                        Эскалировать
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedDispute(null)}
                >
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
