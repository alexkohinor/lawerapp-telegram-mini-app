'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Scale, 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * Страница управления спорами
 * Основано на FEATURE_SPECIFICATION.md
 */

interface Dispute {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'consumer_protection' | 'labor' | 'contract' | 'property';
  createdAt: Date;
  updatedAt: Date;
}

const mockDisputes: Dispute[] = [
  {
    id: '1',
    title: 'Возврат товара в интернет-магазине',
    description: 'Магазин отказывается принять товар обратно',
    status: 'active',
    priority: 'high',
    type: 'consumer_protection',
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-10-16'),
  },
  {
    id: '2',
    title: 'Невыплата заработной платы',
    description: 'Работодатель задерживает зарплату на 2 месяца',
    status: 'in_progress',
    priority: 'urgent',
    type: 'labor',
    createdAt: new Date('2024-10-10'),
    updatedAt: new Date('2024-10-16'),
  },
  {
    id: '3',
    title: 'Нарушение договора аренды',
    description: 'Арендодатель нарушает условия договора',
    status: 'draft',
    priority: 'medium',
    type: 'contract',
    createdAt: new Date('2024-10-12'),
    updatedAt: new Date('2024-10-12'),
  },
];

const statusConfig = {
  draft: { label: 'Черновик', color: 'bg-gray-100 text-gray-800', icon: FileText },
  active: { label: 'Активный', color: 'bg-blue-100 text-blue-800', icon: Clock },
  in_progress: { label: 'В работе', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  resolved: { label: 'Решен', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  closed: { label: 'Закрыт', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
};

const priorityConfig = {
  low: { label: 'Низкий', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Средний', color: 'bg-blue-100 text-blue-800' },
  high: { label: 'Высокий', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Срочный', color: 'bg-red-100 text-red-800' },
};

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Загрузка споров при монтировании компонента
  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const response = await fetch('/api/disputes');
        const result = await response.json();

        if (result.success) {
          setDisputes(result.data);
        } else {
          console.error('Error fetching disputes:', result.error);
        }
      } catch (error) {
        console.error('Error fetching disputes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDisputes();
  }, []);

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = dispute.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispute.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Мои споры</h1>
                  <p className="text-sm text-gray-600">Управление правовыми делами</p>
                </div>
              </div>
              <Button size="sm" onClick={() => window.location.href = '/disputes/create'}>
                <Plus className="w-4 h-4 mr-2" />
                Создать спор
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Поиск споров..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">Все статусы</option>
                    <option value="draft">Черновик</option>
                    <option value="active">Активный</option>
                    <option value="in_progress">В работе</option>
                    <option value="resolved">Решен</option>
                    <option value="closed">Закрыт</option>
                  </select>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Фильтры
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disputes List */}
          <div className="space-y-4">
            {filteredDisputes.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Scale className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Споры не найдены
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery || statusFilter !== 'all' 
                      ? 'Попробуйте изменить фильтры поиска'
                      : 'Создайте ваш первый спор для начала работы'
                    }
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Создать спор
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredDisputes.map((dispute) => {
                const StatusIcon = statusConfig[dispute.status].icon;
                return (
                  <Card key={dispute.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">{dispute.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[dispute.status].color}`}>
                              <StatusIcon className="w-3 h-3 inline mr-1" />
                              {statusConfig[dispute.status].label}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[dispute.priority].color}`}>
                              {priorityConfig[dispute.priority].label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{dispute.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Создан: {dispute.createdAt.toLocaleDateString('ru-RU')}</span>
                            <span>Обновлен: {dispute.updatedAt.toLocaleDateString('ru-RU')}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `/disputes/${dispute.id}`}
                          >
                            Открыть
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{disputes.length}</div>
                <div className="text-sm text-gray-600">Всего споров</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {disputes.filter(d => d.status === 'resolved').length}
                </div>
                <div className="text-sm text-gray-600">Решено</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {disputes.filter(d => d.status === 'in_progress').length}
                </div>
                <div className="text-sm text-gray-600">В работе</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {disputes.filter(d => d.priority === 'urgent').length}
                </div>
                <div className="text-sm text-gray-600">Срочных</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
