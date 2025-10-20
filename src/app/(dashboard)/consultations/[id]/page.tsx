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
  ArrowLeft, 
  Copy, 
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Tag,
  Calendar,
  Sparkles,
  RefreshCw,
  Share2,
  BookOpen,
  Scale
} from 'lucide-react';

interface Consultation {
  id: string;
  query: string;
  response: string;
  category?: string;
  confidence?: number;
  sources?: string[];
  createdAt: string;
  updatedAt: string;
  responseTimeMs?: number;
  costUsd?: number;
}

export default function ConsultationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isAuthenticated } = useUser();
  const { showAlert } = useTelegramUser();
  const { id } = params;
  
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadConsultation();
    }
  }, [isAuthenticated, user?.id, id]);

  const loadConsultation = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/ai/consultation/${id}?userId=${user.id}`);
      const result = await response.json();
      
      if (result.success) {
        setConsultation(result.data);
      } else {
        setError(result.error || 'Не удалось загрузить консультацию');
        showAlert(result.error || 'Не удалось загрузить консультацию');
      }
    } catch (err) {
      setError('Ошибка сети или сервера');
      showAlert('Ошибка сети или сервера');
      console.error('Failed to load consultation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!consultation || !user?.id) return;

    setIsRegenerating(true);
    try {
      const response = await fetch('/api/ai/consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          query: consultation.query,
          category: consultation.category,
          regenerate: true
        }),
      });

      const result = await response.json();

      if (result.success) {
        setConsultation(result.data);
        showAlert('Ответ обновлен!');
      } else {
        showAlert(result.error || 'Ошибка при обновлении ответа');
      }
    } catch (error) {
      console.error('Error regenerating consultation:', error);
      showAlert('Ошибка сети при обновлении ответа');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyResponse = () => {
    if (consultation?.response) {
      navigator.clipboard.writeText(consultation.response);
      showAlert('Ответ скопирован в буфер обмена');
    }
  };

  const handleExportResponse = () => {
    if (!consultation) return;
    
    const content = `AI Консультация - ${consultation.category || 'Общее право'}

Вопрос:
${consultation.query}

Ответ:
${consultation.response}

Дата: ${new Date(consultation.createdAt).toLocaleString('ru-RU')}
Время ответа: ${consultation.responseTimeMs ? `${consultation.responseTimeMs}мс` : 'Не указано'}
Уверенность: ${consultation.confidence ? `${Math.round(consultation.confidence * 100)}%` : 'Не указано'}

---
Сгенерировано в LawerApp`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `consultation-${consultation.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showAlert('Консультация экспортирована');
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
              Необходима авторизация для просмотра консультации
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
          <Button onClick={loadConsultation}>Повторить загрузку</Button>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex flex-col items-center justify-center py-12 p-4">
          <p className="text-gray-600 mb-4">Консультация не найдена.</p>
          <Button onClick={() => router.push('/consultations')}>К списку консультаций</Button>
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
              AI Консультация
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <HapticFeedback impact="light">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex items-center space-x-1"
              >
                <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                <span>Обновить</span>
              </Button>
            </HapticFeedback>
          </div>
        </div>

        {/* Consultation Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Консультация #{consultation.id.slice(-8)}</CardTitle>
                  <CardDescription>
                    {formatDate(consultation.createdAt)}
                  </CardDescription>
                </div>
              </div>
              
              {consultation.category && (
                <Badge className={getCategoryColor(consultation.category)}>
                  {consultation.category}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  {consultation.responseTimeMs 
                    ? `Ответ за ${consultation.responseTimeMs}мс`
                    : 'Время ответа не указано'
                  }
                </span>
              </div>
              {consultation.confidence && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Tag className="w-4 h-4" />
                  <span>Уверенность: {Math.round(consultation.confidence * 100)}%</span>
                </div>
              )}
              {consultation.costUsd && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Scale className="w-4 h-4" />
                  <span>Стоимость: ${consultation.costUsd.toFixed(4)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span>Ваш вопрос</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-wrap">{consultation.query}</p>
            </div>
          </CardContent>
        </Card>

        {/* AI Response */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                <span>Ответ AI</span>
              </CardTitle>
              
              <div className="flex items-center space-x-2">
                <HapticFeedback impact="light">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyResponse}
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
                    onClick={handleExportResponse}
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
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {consultation.response || 'Ответ генерируется...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sources */}
        {consultation.sources && consultation.sources.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span>Источники законодательства</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {consultation.sources.map((source, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-purple-50 rounded-lg">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm text-purple-900">{source}</p>
                  </div>
                ))}
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
                  onClick={() => router.push('/consultations/new')}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Новая консультация
                </Button>
              </HapticFeedback>
              
              <HapticFeedback impact="light">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/consultations')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Все консультации
                </Button>
              </HapticFeedback>
              
              <HapticFeedback impact="light">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleCopyResponse}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Копировать ответ
                </Button>
              </HapticFeedback>
              
              <HapticFeedback impact="light">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleExportResponse}
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
