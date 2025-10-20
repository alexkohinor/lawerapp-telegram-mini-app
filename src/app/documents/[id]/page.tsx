'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  content: string;
  size: string;
  fields: Record<string, any>;
}

const MOCK_DOCUMENT: Document = {
  id: '1',
  name: 'Трудовой договор - Иванов И.И.',
  type: 'Трудовой договор',
  icon: '👷',
  category: 'Трудовое право',
  status: 'generated',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:45:00Z',
  size: '2.3 KB',
  fields: {
    employer_name: 'ООО "Рога и копыта"',
    employee_name: 'Иванов Иван Иванович',
    position: 'Менеджер по продажам',
    salary: 50000,
    start_date: '2024-02-01',
    work_schedule: 'Полный день',
  },
  content: `ТРУДОВОЙ ДОГОВОР

Работодатель: ООО "Рога и копыта"
Работник: Иванов Иван Иванович

1. ПРЕДМЕТ ДОГОВОРА
Работодатель обязуется предоставить Работнику работу по должности "Менеджер по продажам", а Работник обязуется лично выполнять трудовую функцию в соответствии с условиями настоящего договора.

2. ТРУДОВАЯ ФУНКЦИЯ
Работник принимается на работу по должности "Менеджер по продажам" с окладом 50 000 (пятьдесят тысяч) рублей в месяц.

3. РЕЖИМ РАБОТЫ
Режим работы: Полный день (40 часов в неделю).

4. СРОК ДЕЙСТВИЯ ДОГОВОРА
Настоящий договор заключен на неопределенный срок с 01.02.2024.

5. ПРАВА И ОБЯЗАННОСТИ СТОРОН
Работник имеет право на:
- Предоставление работы, обусловленной трудовым договором;
- Рабочее место, соответствующее условиям, предусмотренным государственными стандартами;
- Своевременную и в полном размере выплату заработной платы.

Работодатель обязуется:
- Предоставить Работнику работу, обусловленную трудовым договором;
- Обеспечить безопасность и условия труда, соответствующие государственным нормативным требованиям;
- Своевременно и в полном размере выплачивать Работнику заработную плату.

6. ЗАРАБОТНАЯ ПЛАТА
Размер заработной платы составляет 50 000 (пятьдесят тысяч) рублей в месяц.

7. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ
Настоящий договор вступает в силу с момента подписания его сторонами.

Дата составления: 15.01.2024

Подписи сторон:
Работодатель: _________________ (ООО "Рога и копыта")
Работник: _________________ (Иванов И.И.)`,
};

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { hapticFeedback, showAlert } = useTelegramUser();
  const [document] = useState<Document>(MOCK_DOCUMENT);
  const [isDownloading, setIsDownloading] = useState(false);

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
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    hapticFeedback('medium');

    try {
      // Имитация скачивания
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const blob = new Blob([document.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.name}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showAlert('Документ успешно скачан!');
    } catch (error) {
      showAlert('Произошла ошибка при скачивании документа');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEdit = () => {
    hapticFeedback('light');
    router.push(`/documents/generate?edit=${document.id}`);
  };

  const handleBackToDocuments = () => {
    hapticFeedback('light');
    router.push('/documents');
  };

  const handleShare = () => {
    hapticFeedback('light');
    if (navigator.share) {
      navigator.share({
        title: document.name,
        text: `Документ: ${document.name}`,
        url: window.location.href,
      });
    } else {
      // Fallback для браузеров без поддержки Web Share API
      navigator.clipboard.writeText(window.location.href);
      showAlert('Ссылка скопирована в буфер обмена');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <BackButton onClick={handleBackToDocuments} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📄 {document.name}
            </h1>
            <p className="text-gray-600">
              {formatDate(document.createdAt)}
            </p>
          </div>
          {getStatusBadge(document.status)}
        </div>

        {/* Document Info */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{document.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {document.type}
                </h3>
                <p className="text-sm text-gray-600">
                  {document.category} • Размер: {document.size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Fields */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Заполненные поля</CardTitle>
            <CardDescription>
              Данные, использованные для генерации документа
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(document.fields).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="text-gray-900">
                    {typeof value === 'boolean' ? (value ? 'Да' : 'Нет') : String(value)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Document Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Содержание документа</CardTitle>
            <CardDescription>
              Полный текст сгенерированного документа
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                {document.content}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <HapticFeedback type="medium">
            <Button
              variant="default"
              onClick={handleDownload}
              loading={isDownloading}
              disabled={isDownloading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isDownloading ? 'Скачиваем...' : '📥 Скачать'}
            </Button>
          </HapticFeedback>
          
          <HapticFeedback type="light">
            <Button
              variant="outline"
              onClick={handleEdit}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              ✏️ Редактировать
            </Button>
          </HapticFeedback>
          
          <HapticFeedback type="light">
            <Button
              variant="outline"
              onClick={handleShare}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              🔗 Поделиться
            </Button>
          </HapticFeedback>
        </div>

        {/* Document History */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>История изменений</CardTitle>
            <CardDescription>
              Хронология работы с документом
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">
                    Документ сгенерирован
                  </p>
                  <p className="text-xs text-green-700">
                    {formatDate(document.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    Документ обновлен
                  </p>
                  <p className="text-xs text-blue-700">
                    {formatDate(document.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Notice */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <span className="text-yellow-500 text-xl">⚠️</span>
              <div className="text-sm text-gray-600">
                <p className="font-semibold mb-1">Важная информация:</p>
                <p>
                  Данный документ сгенерирован автоматически и носит информационный характер. 
                  Для использования в правовых целях рекомендуется консультация с квалифицированным юристом 
                  и проверка соответствия действующему законодательству.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}