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
  ArrowLeft, 
  Download, 
  Copy,
  Edit,
  Trash2,
  Calendar,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
  Scale,
  BookOpen,
  Shield,
  ShoppingCart,
  Home,
  Heart
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

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isAuthenticated } = useUser();
  const { showAlert } = useTelegramUser();
  const { id } = params;
  
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadDocument();
    }
  }, [isAuthenticated, user?.id, id]);

  const loadDocument = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/documents/${id}?userId=${user.id}`);
      const result = await response.json();
      
      if (result.success) {
        setDocument(result.data);
      } else {
        setError(result.error || 'Не удалось загрузить документ');
        showAlert(result.error || 'Не удалось загрузить документ');
      }
    } catch (err) {
      setError('Ошибка сети или сервера');
      showAlert('Ошибка сети или сервера');
      console.error('Failed to load document:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!document) return;

    const confirmed = await showAlert('Вы уверены, что хотите удалить этот документ?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        showAlert('Документ удален');
        router.push('/documents');
      } else {
        showAlert(result.error || 'Ошибка при удалении документа');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      showAlert('Ошибка сети при удалении документа');
    }
  };

  const handleCopyContent = () => {
    if (document?.content) {
      navigator.clipboard.writeText(document.content);
      showAlert('Содержимое документа скопировано в буфер обмена');
    }
  };

  const handleExportDocument = () => {
    if (!document) return;
    
    const content = `${document.title}

${document.content}

---
Дата создания: ${new Date(document.createdAt).toLocaleString('ru-RU')}
Тип документа: ${getDocumentTypeLabel(document.type)}
${document.metadata?.template ? `Шаблон: ${document.metadata.template}` : ''}

---
Сгенерировано в LawerApp`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${document.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showAlert('Документ экспортирован');
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

  const getDocumentTypeIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'CLAIM': <AlertCircle className="w-5 h-5" />,
      'COMPLAINT': <Shield className="w-5 h-5" />,
      'CONTRACT': <Scale className="w-5 h-5" />,
      'AGREEMENT': <CheckCircle className="w-5 h-5" />,
      'POWER_OF_ATTORNEY': <BookOpen className="w-5 h-5" />,
      'OTHER': <FileText className="w-5 h-5" />
    };
    
    return iconMap[type] || <FileText className="w-5 h-5" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Доступ ограничен</CardTitle>
            <CardDescription className="text-center">
              Необходима авторизация для просмотра документа
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
          <Button onClick={loadDocument}>Повторить загрузку</Button>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex flex-col items-center justify-center py-12 p-4">
          <p className="text-gray-600 mb-4">Документ не найден.</p>
          <Button onClick={() => router.push('/documents')}>К списку документов</Button>
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
          <div className="flex items-center space-x-4">
            <HapticFeedback impact="light">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Назад</span>
              </Button>
            </HapticFeedback>
            <h1 className="text-2xl font-bold text-gray-900">
              {document.title}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <HapticFeedback impact="light">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                <span>Удалить</span>
              </Button>
            </HapticFeedback>
          </div>
        </div>

        {/* Document Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getDocumentTypeColor(document.type)}`}>
                  {getDocumentTypeIcon(document.type)}
                </div>
                <div>
                  <CardTitle className="text-lg">{document.title}</CardTitle>
                  <CardDescription>
                    {formatDate(document.createdAt)}
                  </CardDescription>
                </div>
              </div>
              
              <Badge className={getDocumentTypeColor(document.type)}>
                {getDocumentTypeLabel(document.type)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Создан: {formatDate(document.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Обновлен: {formatDate(document.updatedAt)}</span>
              </div>
              {document.metadata?.template && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Tag className="w-4 h-4" />
                  <span>Шаблон: {document.metadata.template}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Document Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <span>Содержимое документа</span>
              </CardTitle>
              
              <div className="flex items-center space-x-2">
                <HapticFeedback impact="light">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyContent}
                    className="flex items-center space-x-1"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Копировать</span>
                  </Button>
                </HapticFeedback>
                
                <HapticFeedback impact="light">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportDocument}
                    className="flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>Экспорт</span>
                  </Button>
                </HapticFeedback>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono leading-relaxed">
                {document.content}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        {document.metadata && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="w-6 h-6 text-purple-600" />
                <span>Информация о документе</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {document.metadata.template && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Шаблон</span>
                    <span className="text-sm text-gray-900">{document.metadata.template}</span>
                  </div>
                )}
                {document.metadata.generatedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Дата генерации</span>
                    <span className="text-sm text-gray-900">
                      {new Date(document.metadata.generatedAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                )}
                {document.metadata.variables && Object.keys(document.metadata.variables).length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600 mb-2 block">Использованные данные</span>
                    <div className="bg-gray-50 rounded-lg p-3">
                      {Object.entries(document.metadata.variables).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">{key.replace(/_/g, ' ')}:</span>
                          <span className="text-gray-900 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <HapticFeedback impact="light">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/documents/generate')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Создать новый документ
                </Button>
              </HapticFeedback>
              
              <HapticFeedback impact="light">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/documents')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Все документы
                </Button>
              </HapticFeedback>
              
              <HapticFeedback impact="light">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleCopyContent}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Копировать содержимое
                </Button>
              </HapticFeedback>
              
              <HapticFeedback impact="light">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleExportDocument}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Экспорт в файл
                </Button>
              </HapticFeedback>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
