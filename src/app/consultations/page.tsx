'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
}

const generateMockAdvice = (query: string): string => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('возврат') || lowerQuery.includes('товар')) {
    return `Согласно ст. 25 Закона "О защите прав потребителей", вы имеете право на обмен товара надлежащего качества в течение 14 дней, не считая дня покупки. Товар должен быть в товарном виде, с сохранением потребительских свойств и документов. Если аналогичный товар отсутствует в продаже, вы можете потребовать возврата денежных средств.`;
  }
  
  if (lowerQuery.includes('договор') || lowerQuery.includes('соглашение')) {
    return `При заключении договора обратите внимание на существенные условия: предмет договора, цена, сроки исполнения. Согласно ст. 432 ГК РФ, договор считается заключенным, если между сторонами достигнуто соглашение по всем существенным условиям. Рекомендую внимательно изучить все пункты договора перед подписанием.`;
  }
  
  if (lowerQuery.includes('трудовой') || lowerQuery.includes('увольнение')) {
    return `Согласно Трудовому кодексу РФ, увольнение возможно только по основаниям, предусмотренным законом. При увольнении работодатель обязан выплатить все причитающиеся суммы: заработную плату, компенсацию за неиспользованный отпуск, выходное пособие (если применимо). Работник имеет право на получение трудовой книжки в день увольнения.`;
  }
  
  if (lowerQuery.includes('недвижимость') || lowerQuery.includes('квартира')) {
    return `При сделках с недвижимостью обязательно проверьте правоустанавливающие документы, наличие обременений, соответствие площади в документах фактической. Сделка должна быть зарегистрирована в Росреестре. Рекомендую провести юридическую экспертизу документов перед заключением сделки.`;
  }
  
  return `Для получения точной правовой консультации по вашему вопросу рекомендую обратиться к квалифицированному юристу. Предоставленная информация носит общий характер и не может заменить индивидуальную консультацию. Для детального анализа вашей ситуации необходимы дополнительные документы и обстоятельства дела.`;
};

export default function ConsultationsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Mock AI consultation response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data = {
        advice: generateMockAdvice(inputText),
        confidence: Math.random() * 0.3 + 0.7,
        sources: [
          'Гражданский кодекс РФ',
          'Федеральный закон "О защите прав потребителей"',
          'Постановления Верховного Суда РФ'
        ]
      };

      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        text: data.advice,
        isUser: false,
        timestamp: new Date(),
        confidence: data.confidence,
        sources: data.sources
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting consultation:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        text: 'Извините, произошла ошибка при получении консультации. Попробуйте еще раз.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            AI Консультации
          </h1>
          <p className="text-gray-600">
            Получите правовую консультацию с помощью искусственного интеллекта
          </p>
        </div>

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <div className="text-4xl mb-4">⚖️</div>
                <p className="text-lg font-medium">Добро пожаловать в AI консультации!</p>
                <p className="text-sm">Задайте ваш правовой вопрос, и я помогу вам разобраться.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                      <span>
                        {message.timestamp.toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {message.confidence && (
                        <span>
                          Уверенность: {Math.round(message.confidence * 100)}%
                        </span>
                      )}
                    </div>
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-300">
                        <p className="text-xs font-medium mb-1">Источники:</p>
                        <ul className="text-xs space-y-1">
                          {message.sources.map((source, index) => (
                            <li key={index}>• {source}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">AI думает...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Задайте ваш правовой вопрос..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                loading={isLoading}
              >
                Отправить
              </Button>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Нажмите Enter для отправки, Shift+Enter для новой строки
              </p>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Очистить чат
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Tips */}
        <Card className="mt-4">
          <h3 className="font-medium text-gray-900 mb-2">💡 Советы для лучших консультаций:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Опишите ситуацию максимально подробно</li>
            <li>• Укажите важные детали и обстоятельства</li>
            <li>• Задавайте конкретные вопросы</li>
            <li>• При необходимости приложите документы</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
