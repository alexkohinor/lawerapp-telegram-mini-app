'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { StickyBottomBar } from '@/components/ui/StickyBottomBar';
import { AppHeader } from '@/components/ui/AppHeader';
import Chip from '@/components/ui/Chip';
import Composer from '@/components/ui/Composer';

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
  const presets = ['Возврат товара', 'Расторгнуть договор', 'Жалоба в Роспотребнадзор'];
  const tgRef = useRef<unknown>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Инициализация Telegram WebApp и MainButton
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // @ts-expect-error Telegram injected by platform
    const tg = window?.Telegram?.WebApp;
    tgRef.current = tg;
    try { tg?.BackButton?.show?.(); } catch {}
  }, []);

  // Управление MainButton (отправка) и haptic feedback
  useEffect(() => {
    const tg = tgRef.current as { MainButton?: { setText: (text: string) => void; show: () => void; hide: () => void; onClick: (callback: () => void) => void; offClick: () => void }; HapticFeedback?: { impactOccurred: (type: string) => void } } | null;
    if (!tg || isLoading) {
      try { tg?.MainButton?.hide?.(); } catch {}
      return;
    }
    if (inputText.trim().length === 0) {
      try { tg?.MainButton?.hide?.(); } catch {}
      return;
    }
    try {
      tg.MainButton?.setText('Отправить');
      tg.MainButton?.show();
      tg.MainButton?.onClick(() => {
        try { tg?.HapticFeedback?.impactOccurred?.('light'); } catch {}
        handleSendMessage();
      });
    } catch {}
    return () => {
      try { tg?.MainButton?.offClick?.(); } catch {}
    };
  }, [inputText, isLoading]); // Removed handleSendMessage to avoid infinite loop

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;
    try { (tgRef.current as { HapticFeedback?: { impactOccurred: (type: string) => void } } | null)?.HapticFeedback?.impactOccurred?.('light'); } catch {}

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
  }, [inputText, isLoading]);

  return (
    <div className="container-narrow">
      <AppHeader title="AI Консультации" showBack onBack={() => history.back()} />
      <div className="section text-muted">Получите правовую консультацию с помощью искусственного интеллекта</div>

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
      <div className="section wrap-chips" style={{ padding: '0 16px' }}>
        {presets.map((p) => (
          <Chip key={p} onClick={() => setInputText(p)}>{p}</Chip>
        ))}
      </div>

      {/* Sticky composer */}
      <StickyBottomBar>
        <Composer
          value={inputText}
          onChange={setInputText}
          onSend={handleSendMessage}
          disabled={isLoading}
          placeholder="Опишите вашу ситуацию…"
        />
      </StickyBottomBar>
    </div>
  );
}
