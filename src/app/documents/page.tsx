'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HapticFeedback } from '@/components/telegram/HapticFeedback';
import { BackButton } from '@/components/telegram/BackButton';
import { useTelegramUser } from '@/hooks/useTelegramUser';

interface Document {
  id: string;
  name: string;
  type: string;
  icon: string;
  category: string;
  status: 'draft' | 'generated' | 'signed' | 'archived';
  createdAt: string;
  updatedAt: string;
  size?: string;
}

const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    name: 'Трудовой договор - Иванов И.И.',
    type: 'Трудовой договор',
    icon: '👷',
    category: 'Трудовое право',
    status: 'generated',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:45:00Z',
    size: '2.3 KB',
  },
  {
    id: '2',
    name: 'Договор аренды квартиры',
    type: 'Договор аренды',
    icon: '🏠',
    category: 'Гражданское право',
    status: 'signed',
    createdAt: '2024-01-14T15:20:00Z',
    updatedAt: '2024-01-14T16:30:00Z',
    size: '3.1 KB',
  },
  {
    id: '3',
    name: 'Претензия к застройщику',
    type: 'Досудебная претензия',
    icon: '📋',
    category: 'Гражданское право',
    status: 'draft',
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z',
    size: '1.8 KB',
  },
  {
    id: '4',
    name: 'Доверенность на представление интересов',
    type: 'Доверенность',
    icon: '📜',
    category: 'Гражданское право',
    status: 'archived',
    createdAt: '2024-01-10T14:00:00Z',
    updatedAt: '2024-01-12T11:20:00Z',
    size: '2.7 KB',
  },
];

export default function DocumentsPage() {
  const router = useRouter();
  const { hapticFeedback } = useTelegramUser();
  const [documents] = useState<Document[]>(MOCK_DOCUMENTS);
  const [filter, setFilter] = useState<'all' | 'draft' | 'generated' | 'signed' | 'archived'>('all');

  const filteredDocuments = documents.filter(document => 
    filter === 'all' || document.status === filter
  );

  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'generated':
        return <Badge variant="success">Сгенерирован</Badge>;
      case 'signed':
        return <Badge variant="info">Подписан</Badge>;
      case 'draft':
        return <Badge variant="warning">Черновик</Badge>;
      case 'archived':
        return <Badge variant="secondary">Архив</Badge>;
      default:
        return <Badge variant="secondary">Неизвестно</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDocumentClick = (document: Document) => {
    hapticFeedback('light');
    router.push(`/documents/${document.id}`);
  };

  const handleNewDocument = () => {
    hapticFeedback('medium');
    router.push('/documents/generate');
  };

  const getStatusCount = (status: Document['status']) => {
    return documents.filter(doc => doc.status === status).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <BackButton />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📄 Мои документы
            </h1>
            <p className="text-gray-600">
              Управляйте вашими правовыми документами
            </p>
          </div>
          <HapticFeedback type="medium">
            <Button
              variant="default"
              onClick={handleNewDocument}
              className="px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Создать документ
            </Button>
          </HapticFeedback>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {documents.length}
              </div>
              <div className="text-sm text-gray-600">Всего</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {getStatusCount('draft')}
              </div>
              <div className="text-sm text-gray-600">Черновики</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {getStatusCount('generated')}
              </div>
              <div className="text-sm text-gray-600">Готовы</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {getStatusCount('signed')}
              </div>
              <div className="text-sm text-gray-600">Подписаны</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Все', count: documents.length },
                { key: 'draft', label: 'Черновики', count: getStatusCount('draft') },
                { key: 'generated', label: 'Готовы', count: getStatusCount('generated') },
                { key: 'signed', label: 'Подписаны', count: getStatusCount('signed') },
                { key: 'archived', label: 'Архив', count: getStatusCount('archived') },
              ].map(({ key, label, count }) => (
                <HapticFeedback key={key} type="light">
                  <Button
                    variant={filter === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(key as typeof filter)}
                    className="relative"
                  >
                    {label}
                    {count > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="ml-2 px-1.5 py-0.5 text-xs"
                      >
                        {count}
                      </Badge>
                    )}
                  </Button>
                </HapticFeedback>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <div className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Нет документов
                </h3>
                <p className="text-gray-600 mb-4">
                  {filter === 'all' 
                    ? 'У вас пока нет документов. Создайте первый!'
                    : 'Нет документов с выбранным статусом'
                  }
                </p>
                {filter === 'all' && (
                  <HapticFeedback type="medium">
                    <Button
                      variant="default"
                      onClick={handleNewDocument}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Создать документ
                    </Button>
                  </HapticFeedback>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredDocuments.map((document) => (
              <HapticFeedback key={document.id} type="light">
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={() => handleDocumentClick(document)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{document.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {document.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {document.type} • {formatDate(document.createdAt)}
                          </p>
                          {document.size && (
                            <p className="text-xs text-gray-400">
                              Размер: {document.size}
                            </p>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(document.status)}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="info" className="text-xs">
                        {document.category}
                      </Badge>
                      
                      <div className="flex space-x-2">
                        {document.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/documents/generate?template=${document.type}`);
                            }}
                          >
                            Продолжить
                          </Button>
                        )}
                        
                        {document.status === 'generated' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Логика скачивания
                            }}
                          >
                            Скачать
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </HapticFeedback>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">🚀 Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <HapticFeedback type="light">
                <Button
                  variant="outline"
                  onClick={() => router.push('/documents/generate')}
                  className="h-auto p-4 text-left justify-start"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📄</span>
                    <div>
                      <div className="font-semibold">Создать документ</div>
                      <div className="text-xs text-gray-500">Новый документ</div>
                    </div>
                  </div>
                </Button>
              </HapticFeedback>
              
              <HapticFeedback type="light">
                <Button
                  variant="outline"
                  onClick={() => setFilter('draft')}
                  className="h-auto p-4 text-left justify-start"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📝</span>
                    <div>
                      <div className="font-semibold">Черновики</div>
                      <div className="text-xs text-gray-500">{getStatusCount('draft')} документов</div>
                    </div>
                  </div>
                </Button>
              </HapticFeedback>
              
              <HapticFeedback type="light">
                <Button
                  variant="outline"
                  onClick={() => setFilter('archived')}
                  className="h-auto p-4 text-left justify-start"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📦</span>
                    <div>
                      <div className="font-semibold">Архив</div>
                      <div className="text-xs text-gray-500">{getStatusCount('archived')} документов</div>
                    </div>
                  </div>
                </Button>
              </HapticFeedback>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}