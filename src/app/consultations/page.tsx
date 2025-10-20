'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StickyBottomBar } from '@/components/ui/StickyBottomBar';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const presets = ['Возврат товара', 'Расторгнуть договор', 'Жалоба в Роспотребнадзор'];

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

  const handleAutoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="container-narrow">
      <div className="section">
        <h1 className="text-xl" style={{ fontWeight: 700, marginBottom: 8 }}>AI Консультации</h1>
        <div className="text-muted">Получите правовую консультацию с помощью искусственного интеллекта</div>
      </div>

      <Card>
        <div style={{ height: 480, overflowY: 'auto', padding: 12 }}>
            {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--telegram-hint)', marginTop: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>⚖️</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Добро пожаловать в AI консультации!</div>
              <div style={{ fontSize: 14 }}>Задайте ваш правовой вопрос, и я помогу вам разобраться.</div>
            </div>
            ) : (
            messages.map((message) => (
              <div key={message.id} style={{ display: 'flex', justifyContent: message.isUser ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                <div style={{
                  maxWidth: '80%',
                  borderRadius: 12,
                  padding: '8px 12px',
                  background: message.isUser ? 'var(--primary)' : 'var(--telegram-secondary)',
                  color: message.isUser ? '#fff' : 'var(--telegram-text)'
                }}>
                  <div style={{ fontSize: 14, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message.text}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, opacity: 0.7, fontSize: 12 }}>
                    <span>{message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                    {message.confidence && (<span>Уверенность: {Math.round(message.confidence * 100)}%</span>)}
                  </div>
                  {message.sources && message.sources.length > 0 && (
                    <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--telegram-border)' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Источники:</div>
                      <ul style={{ paddingLeft: 16, margin: 0 }}>
                        {message.sources.map((source, index) => (<li key={index} style={{ fontSize: 12 }}>{source}</li>))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))
            )}
            {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ background: 'var(--telegram-secondary)', borderRadius: 12, padding: 8 }}>
                <span style={{ fontSize: 14, color: 'var(--telegram-hint)' }}>AI печатает…</span>
              </div>
            </div>
            )}
            <div ref={messagesEndRef} />
        </div>
      </Card>

      {/* Preset chips */}
      <div className="section" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {presets.map((p) => (
          <button key={p} className="chip" onClick={() => setInputText(p)}>{p}</button>
        ))}
      </div>

      {/* Sticky composer */}
      <StickyBottomBar>
        <div style={{ display: 'flex', gap: 8 }}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => { setInputText(e.target.value); handleAutoGrow(); }}
            onKeyDown={handleKeyPress}
            placeholder="Опишите вашу ситуацию…"
            style={{
              flex: 1,
              resize: 'none',
              maxHeight: 160,
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid var(--telegram-border)'
            }}
          />
          <button
            className="btn-primary"
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            style={{ minWidth: 120 }}
          >
            {isLoading ? 'Отправка…' : 'Отправить'}
          </button>
        </div>
      </StickyBottomBar>
    </div>
  );
}
