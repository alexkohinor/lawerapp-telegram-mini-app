'use client';

import { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Lightbulb,
  ExternalLink,
  Settings
} from 'lucide-react';
import { Message, LegalContext, AISuggestion } from '@/types';
import { useAIConsultation, useAIStats } from '@/hooks/useAIConsultation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Страница AI чата для правовых консультаций
 * Основано на FEATURE_SPECIFICATION.md и AI_INTEGRATION.md
 */

interface ChatMessage extends Message {
  suggestions?: AISuggestion[];
  sources?: any[];
  confidence?: number;
  agent?: string;
  reasoning?: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    content: 'Привет! Я ваш AI-помощник по правовым вопросам. Я использую многоагентную систему и RAG для предоставления точных консультаций по российскому праву. Чем могу помочь?',
    role: 'assistant',
    timestamp: new Date(),
    confidence: 1.0,
    agent: 'multi-agent-system',
  },
];

const quickActions = [
  {
    label: 'Возврат товара',
    query: 'Как вернуть товар в магазин?',
    context: { area: 'consumer_protection' as const, jurisdiction: 'russia' as const, urgency: 'medium' as const },
  },
  {
    label: 'Трудовое право',
    query: 'Права работника при увольнении',
    context: { area: 'labor' as const, jurisdiction: 'russia' as const, urgency: 'high' as const },
  },
  {
    label: 'Составить претензию',
    query: 'Как составить претензию по ЗЗПП?',
    context: { area: 'consumer_protection' as const, jurisdiction: 'russia' as const, urgency: 'medium' as const },
  },
  {
    label: 'Договорные споры',
    query: 'Нарушение договора поставки',
    context: { area: 'civil' as const, jurisdiction: 'russia' as const, urgency: 'medium' as const },
  },
];

export default function AIChatPage() {
  const { user } = useAuth();
  const { getConsultation, isLoading, error, consultation } = useAIConsultation();
  const { fetchStats, stats } = useAIStats();
  
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [selectedContext, setSelectedContext] = useState<LegalContext>({
    area: 'civil',
    jurisdiction: 'russia',
    urgency: 'medium',
  });
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Загружаем статистику при монтировании
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Обработка ответа от AI
  useEffect(() => {
    if (consultation) {
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        content: consultation.response,
        role: 'assistant',
        timestamp: new Date(),
        suggestions: consultation.suggestions,
        sources: consultation.sources,
        confidence: consultation.confidence,
        agent: consultation.agent,
        reasoning: consultation.reasoning,
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }
  }, [consultation]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputValue;
    setInputValue('');

    try {
      await getConsultation(query, selectedContext, {
        useRAG: true,
        useMultiAgent: true,
      });
    } catch (error) {
      console.error('Error getting consultation:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Извините, произошла ошибка при получении консультации. Попробуйте еще раз.',
        role: 'assistant',
        timestamp: new Date(),
        confidence: 0,
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    setInputValue(action.query);
    setSelectedContext(action.context);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: AISuggestion) => {
    // Обработка клика по предложению
    console.log('Suggestion clicked:', suggestion);
    // Здесь можно добавить логику для выполнения действия
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">AI Консультация</h1>
                  <p className="text-sm text-gray-600">
                    {stats?.agents.overall ? 'Система активна' : 'Система недоступна'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {stats && (
                  <div className="text-xs text-gray-500">
                    Консультаций: {stats.user.consultationCount}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-blue-50 border-b border-blue-200 p-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Настройки консультации</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-blue-800 mb-1">
                    Правовая область
                  </label>
                  <select
                    value={selectedContext.area}
                    onChange={(e) => setSelectedContext(prev => ({ ...prev, area: e.target.value as any }))}
                    className="w-full text-xs border border-blue-300 rounded px-2 py-1"
                  >
                    <option value="civil">Гражданское право</option>
                    <option value="criminal">Уголовное право</option>
                    <option value="administrative">Административное право</option>
                    <option value="labor">Трудовое право</option>
                    <option value="family">Семейное право</option>
                    <option value="tax">Налоговое право</option>
                    <option value="corporate">Корпоративное право</option>
                    <option value="consumer_protection">Защита прав потребителей</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-800 mb-1">
                    Срочность
                  </label>
                  <select
                    value={selectedContext.urgency}
                    onChange={(e) => setSelectedContext(prev => ({ ...prev, urgency: e.target.value as any }))}
                    className="w-full text-xs border border-blue-300 rounded px-2 py-1"
                  >
                    <option value="low">Низкая</option>
                    <option value="medium">Средняя</option>
                    <option value="high">Высокая</option>
                    <option value="urgent">Срочная</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-800 mb-1">
                    Юрисдикция
                  </label>
                  <select
                    value={selectedContext.jurisdiction}
                    onChange={(e) => setSelectedContext(prev => ({ ...prev, jurisdiction: e.target.value as any }))}
                    className="w-full text-xs border border-blue-300 rounded px-2 py-1"
                  >
                    <option value="russia">Россия</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              <div
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] flex items-start space-x-2 ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-primary-500'
                        : 'bg-blue-500'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary-500 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Message Metadata */}
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {message.timestamp.toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      
                      {message.role === 'assistant' && (
                        <>
                          {message.confidence && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-gray-500">
                                {Math.round(message.confidence * 100)}%
                              </span>
                            </div>
                          )}
                          {message.agent && (
                            <span className="text-xs text-blue-500 bg-blue-100 px-1 rounded">
                              {message.agent}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* AI Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center space-x-1">
                          <Lightbulb className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs font-medium text-gray-700">Предложения:</span>
                        </div>
                        <div className="space-y-1">
                          {message.suggestions.map((suggestion) => (
                            <button
                              key={suggestion.id}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left text-xs bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded px-2 py-1 transition-colors"
                            >
                              <div className="font-medium text-yellow-800">{suggestion.title}</div>
                              <div className="text-yellow-600">{suggestion.description}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center space-x-1">
                          <FileText className="w-3 h-3 text-blue-500" />
                          <span className="text-xs font-medium text-gray-700">Источники:</span>
                        </div>
                        <div className="space-y-1">
                          {message.sources.slice(0, 3).map((source, index) => (
                            <div key={index} className="text-xs bg-blue-50 border border-blue-200 rounded px-2 py-1">
                              <div className="font-medium text-blue-800">{source.title}</div>
                              <div className="text-blue-600 line-clamp-2">{source.excerpt}</div>
                              {source.url && (
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                                >
                                  <span>Открыть</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-1">
                    <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                    <span className="text-sm text-gray-600">AI анализирует ваш вопрос...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-red-600">{error}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-2">
          <div className="flex space-x-2 overflow-x-auto">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action)}
                disabled={isLoading}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Задайте ваш правовой вопрос..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              AI консультации предоставляются в ознакомительных целях
            </p>
            {stats && (
              <p className="text-xs text-gray-500">
                База знаний: {stats.knowledgeBase.totalDocuments} документов
              </p>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}