'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  FileText, 
  Download, 
  Share, 
  Print, 
  Eye, 
  EyeOff,
  Calendar,
  User,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react';

/**
 * Просмотрщик документов
 * Основано на UI_COMPONENTS.md и FEATURE_SPECIFICATION.md
 */

interface DocumentViewerProps {
  document: {
    id: string;
    title: string;
    content: string;
    metadata: {
      templateId: string;
      generatedAt: Date;
      version: string;
      templateUsed?: string;
      agentUsed?: string;
      confidence?: number;
    };
    type?: string;
    status?: 'draft' | 'final' | 'archived';
    tags?: string[];
    author?: string;
  };
  onDownload?: (document: any) => void;
  onShare?: (document: any) => void;
  onPrint?: (document: any) => void;
  onEdit?: (document: any) => void;
  showMetadata?: boolean;
  showActions?: boolean;
  readOnly?: boolean;
}

export function DocumentViewer({
  document,
  onDownload,
  onShare,
  onPrint,
  onEdit,
  showMetadata = true,
  showActions = true,
  readOnly = false,
}: DocumentViewerProps) {
  const [showFullContent, setShowFullContent] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleDownload = () => {
    if (onDownload) {
      onDownload(document);
    } else {
      // Дефолтная логика скачивания
      const blob = new Blob([document.content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.title || 'document'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint(document);
    } else {
      // Дефолтная логика печати
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${document.title}</title>
            <style>
              body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 20px; }
              .document-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
              .document-content { margin: 30px 0; }
              .document-footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 0.9em; color: #666; }
              h1 { color: #333; margin-bottom: 10px; }
              h2 { color: #555; margin-top: 30px; }
              p { margin-bottom: 15px; text-align: justify; }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${document.content}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(document);
    } else if (navigator.share) {
      navigator.share({
        title: document.title,
        text: 'Правовой документ из LawerApp',
        url: window.location.href,
      });
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'final': return 'text-green-600 bg-green-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'draft': return Clock;
      case 'final': return CheckCircle;
      case 'archived': return FileText;
      default: return FileText;
    }
  };

  const StatusIcon = getStatusIcon(document.status);

  return (
    <div className="space-y-6">
      {/* Заголовок документа */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>{document.title || 'Документ'}</span>
                {document.status && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(document.status)}`}>
                    <StatusIcon className="w-3 h-3" />
                    <span>{document.status}</span>
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                ID: {document.id} • Версия: {document.metadata.version}
              </CardDescription>
            </div>
            
            {showActions && (
              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowFullContent(!showFullContent)}
                  variant="outline"
                  size="sm"
                >
                  {showFullContent ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-1" />
                      Свернуть
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      Развернуть
                    </>
                  )}
                </Button>
                
                {!readOnly && onEdit && (
                  <Button
                    onClick={() => onEdit(document)}
                    variant="outline"
                    size="sm"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Редактировать
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Метаданные документа */}
      {showMetadata && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Информация о документе</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Дата создания</span>
                </div>
                <p className="font-medium">
                  {new Date(document.metadata.generatedAt).toLocaleString('ru-RU')}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>Шаблон</span>
                </div>
                <p className="font-medium">
                  {document.metadata.templateUsed || document.metadata.templateId}
                </p>
              </div>

              {document.metadata.confidence && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Уверенность AI</span>
                  </div>
                  <p className="font-medium">
                    {Math.round(document.metadata.confidence * 100)}%
                  </p>
                </div>
              )}

              {document.author && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Автор</span>
                  </div>
                  <p className="font-medium">{document.author}</p>
                </div>
              )}

              {document.type && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Tag className="w-4 h-4" />
                    <span>Тип</span>
                  </div>
                  <p className="font-medium">{document.type}</p>
                </div>
              )}

              {document.metadata.agentUsed && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Settings className="w-4 h-4" />
                    <span>AI Агент</span>
                  </div>
                  <p className="font-medium text-xs">{document.metadata.agentUsed}</p>
                </div>
              )}
            </div>

            {/* Теги */}
            {document.tags && document.tags.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <Tag className="w-4 h-4" />
                  <span>Теги</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Содержимое документа */}
      <Card>
        <CardHeader>
          <CardTitle>Содержимое документа</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50">
            <div 
              className={`prose max-w-none ${!showFullContent ? 'max-h-96 overflow-hidden' : ''}`}
              dangerouslySetInnerHTML={{ __html: document.content }}
            />
            
            {!showFullContent && (
              <div className="mt-4 text-center">
                <Button
                  onClick={() => setShowFullContent(true)}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Показать полностью
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Предупреждение о AI */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Важная информация</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Данный документ сгенерирован с помощью AI и предназначен для ознакомительных целей. 
                Рекомендуется консультация с квалифицированным юристом перед использованием.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Действия с документом */}
      {showActions && (
        <Card>
          <CardHeader>
            <CardTitle>Действия с документом</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Скачать</span>
              </Button>

              <Button
                onClick={handlePrint}
                variant="outline"
                className="flex items-center space-x-2"
                disabled={isPrinting}
              >
                <Print className="w-4 h-4" />
                <span>{isPrinting ? 'Печать...' : 'Печать'}</span>
              </Button>

              <Button
                onClick={handleShare}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Share className="w-4 h-4" />
                <span>Поделиться</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
