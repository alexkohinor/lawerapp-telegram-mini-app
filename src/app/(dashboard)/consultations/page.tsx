'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HapticFeedback } from '@/components/telegram/HapticFeedback';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Calendar,
  Tag,
  Sparkles
} from 'lucide-react';

interface Consultation {
  id: string;
  query: string;
  response: string;
  category?: string;
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  responseTimeMs?: number;
  costUsd?: number;
}

export default function ConsultationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useUser();
  const { showAlert } = useTelegramUser();
  
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadConsultations();
    }
  }, [isAuthenticated, user?.id]);

  const loadConsultations = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/consultations?userId=${user.id}`);
      const result = await response.json();
      
      if (result.success) {
        setConsultations(result.data);
      } else {
        setError(result.error || 'Не удалось загрузить консультации');
        showAlert(result.error || 'Не удалось загрузить консультации');
      }
    } catch (err) {
      setError('Ошибка сети или сервера');
      showAlert('Ошибка сети или сервера');
      console.error('Failed to load consultations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConsultations = consultations.filter((consultation) => {
    const matchesSearch = consultation.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         consultation.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-gray-100 text-gray-800';
    
    const colorMap: Record<string, string> = {
      'трудовое право': 'bg-blue-100 text-blue-800',
      'жилищное право': 'bg-green-100 text-green-800',
      'семейное право': 'bg-purple-100 text-purple-800',
      'гражданское право': 'bg-orange-100 text-orange-800',
      'защита прав потребителей': 'bg-red-100 text-red-800',
      'уголовное право': 'bg-gray-100 text-gray-800',
      'административное право': 'bg-yellow-100 text-yellow-800'
    };
    
    return colorMap[category.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Доступ ограничен</CardTitle>
            <CardDescription className="text-center">
              Необходима авторизация для просмотра консультаций
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex flex-col items-center justify-center py-12 p-4">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadConsultations}>Повторить загрузку</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="p-4 space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">AI Консультации</h1>
          <HapticFeedback impact="light">
            <Button 
              variant="gradient" 
              size="sm" 
              onClick={() => router.push('/consultations/new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Новая консультация
            </Button>
          </HapticFeedback>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Поиск по консультациям..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <HapticFeedback impact="light">
                <Button variant="secondary" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </HapticFeedback>
            </div>
          </CardContent>
        </Card>

        {/* Consultations List */}
        {filteredConsultations.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'Консультации не найдены' : 'У вас пока нет консультаций'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? 'Попробуйте изменить поисковый запрос'
                  : 'Начните с создания вашей первой AI консультации'
                }
              </p>
              {!searchQuery && (
                <HapticFeedback impact="light">
                  <Button 
                    variant="gradient" 
                    onClick={() => router.push('/consultations/new')}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Создать консультацию
                  </Button>
                </HapticFeedback>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredConsultations.map((consultation) => (
              <Card 
                key={consultation.id} 
                className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => router.push(`/consultations/${consultation.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {consultation.query}
                        </h3>
                        {consultation.category && (
                          <Badge className={getCategoryColor(consultation.category)}>
                            {consultation.category}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {consultation.response || 'Ответ генерируется...'}
                      </p>

                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{formatDate(consultation.createdAt)}</span>
                        </div>
                        {consultation.responseTimeMs && (
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{consultation.responseTimeMs}мс</span>
                          </div>
                        )}
                        {consultation.confidence && (
                          <div className="flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            <span>{Math.round(consultation.confidence * 100)}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <HapticFeedback impact="light">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/consultations/${consultation.id}`);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </HapticFeedback>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
            <CardDescription>
              Популярные категории для быстрого старта
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'Трудовое право', color: 'bg-blue-100 text-blue-800' },
                { name: 'Жилищное право', color: 'bg-green-100 text-green-800' },
                { name: 'Семейное право', color: 'bg-purple-100 text-purple-800' },
                { name: 'Защита прав потребителей', color: 'bg-red-100 text-red-800' }
              ].map((category) => (
                <HapticFeedback key={category.name} impact="light">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push(`/consultations/new?category=${encodeURIComponent(category.name)}`)}
                  >
                    <Badge className={`mr-2 ${category.color}`}>
                      {category.name}
                    </Badge>
                  </Button>
                </HapticFeedback>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
