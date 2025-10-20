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
  FileText, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Download,
  Calendar,
  Tag,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  content: string;
  type: string;
  metadata?: {
    template?: string;
    variables?: Record<string, string>;
    generatedAt?: string;
  };
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useUser();
  const { showAlert } = useTelegramUser();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadDocuments();
    }
  }, [isAuthenticated, user?.id]);

  const loadDocuments = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/documents?userId=${user.id}`);
      const result = await response.json();
      
      if (result.success) {
        setDocuments(result.data);
      } else {
        setError(result.error || 'Не удалось загрузить документы');
        showAlert(result.error || 'Не удалось загрузить документы');
      }
    } catch (err) {
      setError('Ошибка сети или сервера');
      showAlert('Ошибка сети или сервера');
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocuments = documents.filter((document) => {
    const matchesSearch = document.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         document.type.toLowerCase().includes(searchQuery.toLowerCase());
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

  const getDocumentTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'CLAIM': 'bg-red-100 text-red-800',
      'COMPLAINT': 'bg-orange-100 text-orange-800',
      'CONTRACT': 'bg-blue-100 text-blue-800',
      'AGREEMENT': 'bg-green-100 text-green-800',
      'POWER_OF_ATTORNEY': 'bg-purple-100 text-purple-800',
      'OTHER': 'bg-gray-100 text-gray-800'
    };
    
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  const getDocumentTypeLabel = (type: string) => {
    const labelMap: Record<string, string> = {
      'CLAIM': 'Претензия',
      'COMPLAINT': 'Жалоба',
      'CONTRACT': 'Договор',
      'AGREEMENT': 'Соглашение',
      'POWER_OF_ATTORNEY': 'Доверенность',
      'OTHER': 'Прочее'
    };
    
    return labelMap[type] || type;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Доступ ограничен</CardTitle>
            <CardDescription className="text-center">
              Необходима авторизация для просмотра документов
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
          <Button onClick={loadDocuments}>Повторить загрузку</Button>
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
          <h1 className="text-2xl font-bold text-gray-900">Документы</h1>
          <HapticFeedback impact="light">
            <Button 
              variant="gradient" 
              size="sm" 
              onClick={() => router.push('/documents/generate')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Создать документ
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
                placeholder="Поиск по документам..."
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

        {/* Documents List */}
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'Документы не найдены' : 'У вас пока нет документов'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? 'Попробуйте изменить поисковый запрос'
                  : 'Начните с создания вашего первого правового документа'
                }
              </p>
              {!searchQuery && (
                <HapticFeedback impact="light">
                  <Button 
                    variant="gradient" 
                    onClick={() => router.push('/documents/generate')}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Создать документ
                  </Button>
                </HapticFeedback>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((document) => (
              <Card 
                key={document.id} 
                className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => router.push(`/documents/${document.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {document.title}
                        </h3>
                        <Badge className={getDocumentTypeColor(document.type)}>
                          {getDocumentTypeLabel(document.type)}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {document.content.substring(0, 150)}...
                      </p>

                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{formatDate(document.createdAt)}</span>
                        </div>
                        {document.metadata?.template && (
                          <div className="flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            <span>Шаблон: {document.metadata.template}</span>
                          </div>
                        )}
                        {document.fileUrl && (
                          <div className="flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                            <span>Файл готов</span>
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
                            router.push(`/documents/${document.id}`);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </HapticFeedback>
                      
                      {document.fileUrl && (
                        <HapticFeedback impact="light">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(document.fileUrl, '_blank');
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </HapticFeedback>
                      )}
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
            <CardTitle>Популярные шаблоны</CardTitle>
            <CardDescription>
              Быстрый доступ к часто используемым документам
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { type: 'CLAIM', name: 'Претензия', color: 'bg-red-100 text-red-800' },
                { type: 'COMPLAINT', name: 'Жалоба', color: 'bg-orange-100 text-orange-800' },
                { type: 'CONTRACT', name: 'Договор', color: 'bg-blue-100 text-blue-800' },
                { type: 'AGREEMENT', name: 'Соглашение', color: 'bg-green-100 text-green-800' }
              ].map((template) => (
                <HapticFeedback key={template.type} impact="light">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push(`/documents/generate?type=${template.type}`)}
                  >
                    <Badge className={`mr-2 ${template.color}`}>
                      {template.name}
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