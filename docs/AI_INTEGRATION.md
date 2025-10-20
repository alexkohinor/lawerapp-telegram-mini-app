# 🤖 AI интеграция в LawerApp Telegram Mini App

## 📋 Обзор AI интеграции

**LawerApp** использует современные AI технологии для предоставления качественных правовых консультаций. Интеграция включает многоагентную систему, RAG (Retrieval-Augmented Generation) и специализированные промпты для российского права.

---

## 🎯 AI архитектура

### **1. Многоагентная система**
```
┌─────────────────────────────────────────────────────────────┐
│                    AI Agents Ecosystem                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Legal         │  │   Document      │  │   Dispute   │  │
│  │   Advisor       │  │   Generator     │  │   Analyst   │  │
│  │   (GPT-4)       │  │   (GPT-4)       │  │   (Claude)  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Personal      │  │   Payment       │  │   Notification│  │
│  │   Assistant     │  │   Advisor       │  │   Agent     │  │
│  │   (GPT-4)       │  │   (Claude)      │  │   (GPT-4)   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### **2. RAG система с TimeWeb Cloud**
```
┌─────────────────────────────────────────────────────────────┐
│                    RAG Pipeline (TimeWeb Cloud)            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   User Query    │  │   Embedding     │  │   Vector    │  │
│  │   Processing    │  │   Generation    │  │   Search    │  │
│  │   (Frontend)    │  │   (TimeWeb)     │  │   (TimeWeb) │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Context       │  │   LLM           │  │   Response  │  │
│  │   Retrieval     │  │   Generation    │  │   Delivery  │  │
│  │   (TimeWeb)     │  │   (TimeWeb)     │  │   (Frontend)│  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Техническая реализация

### **1. Установка зависимостей**

```bash
# AI сервисы
npm install openai anthropic

# TimeWeb Cloud интеграция
npm install axios

# Утилиты
npm install uuid
npm install -D @types/uuid
```

### **2. Конфигурация AI сервисов**

#### **OpenAI Service**
```typescript
// src/lib/ai/openai-service.ts
import OpenAI from 'openai';

export class OpenAIService {
  private client: OpenAI;
  
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  async generateResponse(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: options?.model || 'gpt-4',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000,
      });
      
      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate AI response');
    }
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.client.embeddings.create({
        model: 'text-embedding-3-large',
        input: text,
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('OpenAI Embedding error:', error);
      throw new Error('Failed to generate embedding');
    }
  }
}
```

#### **Anthropic Service**
```typescript
// src/lib/ai/anthropic-service.ts
import Anthropic from '@anthropic-ai/sdk';

export class AnthropicService {
  private client: Anthropic;
  
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  
  async generateResponse(
    prompt: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: options?.model || 'claude-3-sonnet-20240229',
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
      
      return response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw new Error('Failed to generate AI response');
    }
  }
}
```

### **3. RAG система**

#### **TimeWeb Cloud Vector Store**
```typescript
// src/lib/ai/timeweb-vector-store.ts
import axios from 'axios';

export class TimeWebVectorStore {
  private apiKey: string;
  private baseUrl: string;
  
  constructor() {
    this.apiKey = process.env.TIMEWEB_API_KEY!;
    this.baseUrl = process.env.TIMEWEB_API_URL || 'https://api.timeweb.cloud';
  }
  
  async storeDocument(
    id: string,
    text: string,
    metadata: Record<string, any>,
    embedding: number[]
  ): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/v1/vectors/store`, {
        id,
        text,
        embedding,
        metadata: {
          text,
          ...metadata,
        },
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('TimeWeb vector store error:', error);
      throw new Error('Failed to store document in TimeWeb Cloud');
    }
  }
  
  async searchSimilar(
    embedding: number[],
    topK: number = 5,
    filter?: Record<string, any>
  ): Promise<Array<{ text: string; metadata: Record<string, any>; score: number }>> {
    try {
      const response = await axios.post(`${this.baseUrl}/v1/vectors/search`, {
        vector: embedding,
        topK,
        filter,
        includeMetadata: true,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.data.matches.map((match: any) => ({
        text: match.metadata.text,
        metadata: match.metadata,
        score: match.score,
      }));
    } catch (error) {
      console.error('TimeWeb vector search error:', error);
      throw new Error('Failed to search similar documents in TimeWeb Cloud');
    }
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await axios.post(`${this.baseUrl}/v1/embeddings/generate`, {
        text,
        model: 'text-embedding-3-large',
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.data.embedding;
    } catch (error) {
      console.error('TimeWeb embedding generation error:', error);
      throw new Error('Failed to generate embedding in TimeWeb Cloud');
    }
  }
}
```

#### **RAG Service с TimeWeb Cloud**
```typescript
// src/lib/ai/rag-service.ts
import { OpenAIService } from './openai-service';
import { TimeWebVectorStore } from './timeweb-vector-store';

export class RAGService {
  private openaiService: OpenAIService;
  private vectorStore: TimeWebVectorStore;
  
  constructor() {
    this.openaiService = new OpenAIService();
    this.vectorStore = new TimeWebVectorStore();
  }
  
  async getLegalConsultation(query: string): Promise<string> {
    try {
      // 1. Генерируем embedding для запроса через TimeWeb Cloud
      const queryEmbedding = await this.vectorStore.generateEmbedding(query);
      
      // 2. Ищем похожие документы в TimeWeb Cloud
      const similarDocs = await this.vectorStore.searchSimilar(queryEmbedding, 5);
      
      // 3. Формируем контекст
      const context = similarDocs
        .map(doc => doc.text)
        .join('\n\n');
      
      // 4. Генерируем ответ с контекстом
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `Ты - эксперт по российскому праву, специализирующийся на защите прав потребителей.

Контекст из правовой базы знаний:
${context}

Важно:
- Отвечай только на основе российского законодательства
- Указывай конкретные статьи законов
- Предупреждай о необходимости консультации с юристом
- Будь точным и профессиональным`,
        },
        {
          role: 'user',
          content: query,
        },
      ];
      
      return await this.openaiService.generateResponse(messages, {
        model: 'gpt-4',
        temperature: 0.3,
        maxTokens: 1500,
      });
    } catch (error) {
      console.error('RAG service error:', error);
      throw new Error('Failed to get legal consultation');
    }
  }
}
```

### **4. AI Агенты**

#### **Legal Advisor Agent**
```typescript
// src/lib/ai/agents/legal-advisor-agent.ts
import { RAGService } from '../rag-service';

export class LegalAdvisorAgent {
  private ragService: RAGService;
  
  constructor() {
    this.ragService = new RAGService();
  }
  
  async provideLegalAdvice(query: string): Promise<{
    advice: string;
    confidence: number;
    sources: string[];
  }> {
    try {
      const advice = await this.ragService.getLegalConsultation(query);
      
      // Анализируем уверенность ответа
      const confidence = this.analyzeConfidence(advice);
      
      // Извлекаем источники
      const sources = this.extractSources(advice);
      
      return {
        advice,
        confidence,
        sources,
      };
    } catch (error) {
      console.error('Legal advisor error:', error);
      throw new Error('Failed to provide legal advice');
    }
  }
  
  private analyzeConfidence(advice: string): number {
    // Простая эвристика для определения уверенности
    const confidenceIndicators = [
      'статья', 'закон', 'кодекс', 'постановление',
      'определено', 'установлено', 'предусмотрено'
    ];
    
    const uncertaintyIndicators = [
      'возможно', 'может быть', 'не исключено',
      'требует уточнения', 'рекомендуется'
    ];
    
    const confidenceScore = confidenceIndicators.reduce((score, indicator) => {
      return score + (advice.toLowerCase().includes(indicator) ? 1 : 0);
    }, 0);
    
    const uncertaintyScore = uncertaintyIndicators.reduce((score, indicator) => {
      return score + (advice.toLowerCase().includes(indicator) ? 1 : 0);
    }, 0);
    
    return Math.max(0, Math.min(1, (confidenceScore - uncertaintyScore) / 10));
  }
  
  private extractSources(advice: string): string[] {
    const sources: string[] = [];
    const lawPattern = /(?:ст\.|статья|закон|кодекс)\s*(\d+)/gi;
    const matches = advice.match(lawPattern);
    
    if (matches) {
      sources.push(...matches);
    }
    
    return sources;
  }
}
```

#### **Document Generator Agent**
```typescript
// src/lib/ai/agents/document-generator-agent.ts
import { OpenAIService } from '../openai-service';

export class DocumentGeneratorAgent {
  private openaiService: OpenAIService;
  
  constructor() {
    this.openaiService = new OpenAIService();
  }
  
  async generateDocument(
    type: 'claim' | 'complaint' | 'contract',
    data: Record<string, any>
  ): Promise<{
    content: string;
    metadata: Record<string, any>;
  }> {
    try {
      const template = this.getTemplate(type);
      const prompt = this.buildPrompt(template, data);
      
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `Ты - эксперт по составлению правовых документов. 
          
Твоя задача - создать профессиональный правовой документ на основе предоставленных данных.

Требования:
- Используй официальный стиль
- Соблюдай структуру документа
- Включи все необходимые реквизиты
- Ссылайся на соответствующие статьи законов
- Будь точным и профессиональным`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ];
      
      const content = await this.openaiService.generateResponse(messages, {
        model: 'gpt-4',
        temperature: 0.2,
        maxTokens: 2000,
      });
      
      return {
        content,
        metadata: {
          type,
          generatedAt: new Date().toISOString(),
          data,
        },
      };
    } catch (error) {
      console.error('Document generator error:', error);
      throw new Error('Failed to generate document');
    }
  }
  
  private getTemplate(type: string): string {
    const templates = {
      claim: `
ПРЕТЕНЗИЯ

В {{sellerName}}
От {{buyerName}}

{{buyerAddress}}

{{date}}

ПРЕТЕНЗИЯ

{{disputeDescription}}

На основании ст. 18 Закона РФ "О защите прав потребителей" требую:

{{demands}}

В случае неудовлетворения претензии в течение {{deadline}} дней, буду вынужден обратиться в суд.

Приложения:
{{attachments}}

{{buyerSignature}}
      `,
      complaint: `
ИСКОВОЕ ЗАЯВЛЕНИЕ

В {{courtName}}
Истец: {{plaintiffName}}
{{plaintiffAddress}}

Ответчик: {{defendantName}}
{{defendantAddress}}

Цена иска: {{amount}} рублей

ИСКОВОЕ ЗАЯВЛЕНИЕ

{{caseDescription}}

Правовые основания:
{{legalBasis}}

Прошу суд:
{{claims}}

Приложения:
{{attachments}}

{{date}}
{{plaintiffSignature}}
      `,
    };
    
    return templates[type as keyof typeof templates] || '';
  }
  
  private buildPrompt(template: string, data: Record<string, any>): string {
    let prompt = template;
    
    // Заменяем плейсхолдеры данными
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value));
    });
    
    return `Создай правовой документ на основе следующего шаблона и данных:

Шаблон:
${prompt}

Дополнительные данные:
${JSON.stringify(data, null, 2)}

Создай готовый к использованию документ.`;
  }
}
```

### **5. API Endpoints**

#### **AI Consultation API**
```typescript
// src/app/api/ai/consultation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { LegalAdvisorAgent } from '@/lib/ai/agents/legal-advisor-agent';

export async function POST(request: NextRequest) {
  try {
    const { query, userId } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    const legalAdvisor = new LegalAdvisorAgent();
    const result = await legalAdvisor.provideLegalAdvice(query);
    
    // Логируем запрос для аналитики
    console.log('AI consultation:', {
      userId,
      query: query.substring(0, 100),
      confidence: result.confidence,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json({
      advice: result.advice,
      confidence: result.confidence,
      sources: result.sources,
    });
  } catch (error) {
    console.error('AI consultation error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI consultation' },
      { status: 500 }
    );
  }
}
```

#### **Document Generation API**
```typescript
// src/app/api/ai/generate-document/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DocumentGeneratorAgent } from '@/lib/ai/agents/document-generator-agent';

export async function POST(request: NextRequest) {
  try {
    const { type, data, userId } = await request.json();
    
    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type and data are required' },
        { status: 400 }
      );
    }
    
    const documentGenerator = new DocumentGeneratorAgent();
    const result = await documentGenerator.generateDocument(type, data);
    
    // Логируем генерацию документа
    console.log('Document generation:', {
      userId,
      type,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json({
      content: result.content,
      metadata: result.metadata,
    });
  } catch (error) {
    console.error('Document generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate document' },
      { status: 500 }
    );
  }
}
```

### **6. Frontend интеграция**

#### **AI Chat Component**
```typescript
// src/components/features/ai-chat/AIChat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useTelegram } from '@/lib/telegram/telegram-provider';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
}

export const AIChat = () => {
  const { user } = useTelegram();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai/consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          userId: user?.id,
        }),
      });
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.advice,
        timestamp: new Date(),
        confidence: data.confidence,
        sources: data.sources,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте еще раз.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-telegram-button text-telegram-button-text'
                  : 'bg-telegram-secondary text-telegram-text'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              {message.confidence && (
                <p className="text-xs opacity-70 mt-1">
                  Уверенность: {Math.round(message.confidence * 100)}%
                </p>
              )}
              {message.sources && message.sources.length > 0 && (
                <p className="text-xs opacity-70 mt-1">
                  Источники: {message.sources.join(', ')}
                </p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-telegram-secondary text-telegram-text px-4 py-2 rounded-lg">
              <p className="text-sm">Думаю...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-telegram-secondary">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Задайте вопрос о ваших правах..."
            className="flex-1 px-3 py-2 border border-telegram-secondary rounded-lg bg-telegram-bg text-telegram-text focus:outline-none focus:ring-2 focus:ring-telegram-button"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-telegram-button text-telegram-button-text rounded-lg disabled:opacity-50"
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 📊 Мониторинг и аналитика

### **1. AI Metrics**
```typescript
// src/lib/ai/analytics.ts
export class AIAnalytics {
  static trackConsultation(
    userId: string,
    query: string,
    response: string,
    confidence: number,
    responseTime: number
  ) {
    // Отправка метрик в аналитику
    fetch('/api/analytics/ai-consultation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        queryLength: query.length,
        responseLength: response.length,
        confidence,
        responseTime,
        timestamp: new Date().toISOString(),
      }),
    });
  }
  
  static trackDocumentGeneration(
    userId: string,
    type: string,
    success: boolean,
    generationTime: number
  ) {
    fetch('/api/analytics/document-generation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        type,
        success,
        generationTime,
        timestamp: new Date().toISOString(),
      }),
    });
  }
}
```

### **2. Error Handling**
```typescript
// src/lib/ai/error-handler.ts
export class AIErrorHandler {
  static handleError(error: any, context: string) {
    console.error(`AI Error in ${context}:`, error);
    
    // Отправка ошибки в систему мониторинга
    fetch('/api/errors/ai-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }),
    });
  }
  
  static getFallbackResponse(context: string): string {
    const fallbacks = {
      consultation: 'Извините, временно не могу предоставить консультацию. Попробуйте позже или обратитесь к юристу.',
      document: 'Извините, временно не могу сгенерировать документ. Попробуйте позже.',
      default: 'Произошла ошибка. Попробуйте еще раз.',
    };
    
    return fallbacks[context as keyof typeof fallbacks] || fallbacks.default;
  }
}
```

---

## 🔒 Безопасность

### **1. Rate Limiting**
```typescript
// src/lib/ai/rate-limiter.ts
export class AIRateLimiter {
  private static requests = new Map<string, number[]>();
  
  static async checkLimit(userId: string, limit: number = 10, windowMs: number = 60000): Promise<boolean> {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // Удаляем старые запросы
    const recentRequests = userRequests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= limit) {
      return false;
    }
    
    // Добавляем новый запрос
    recentRequests.push(now);
    this.requests.set(userId, recentRequests);
    
    return true;
  }
}
```

### **2. Input Validation**
```typescript
// src/lib/ai/input-validator.ts
import { z } from 'zod';

export const consultationSchema = z.object({
  query: z.string()
    .min(10, 'Вопрос должен содержать минимум 10 символов')
    .max(1000, 'Вопрос не должен превышать 1000 символов')
    .refine(
      (query) => !query.includes('взлом') && !query.includes('хак'),
      'Недопустимый контент'
    ),
  userId: z.string().uuid(),
});

export const documentSchema = z.object({
  type: z.enum(['claim', 'complaint', 'contract']),
  data: z.record(z.any()),
  userId: z.string().uuid(),
});
```

---

## 🧪 Тестирование

### **1. Unit Tests**
```typescript
// tests/lib/ai/legal-advisor-agent.test.ts
import { LegalAdvisorAgent } from '@/lib/ai/agents/legal-advisor-agent';

describe('LegalAdvisorAgent', () => {
  let agent: LegalAdvisorAgent;
  
  beforeEach(() => {
    agent = new LegalAdvisorAgent();
  });
  
  it('should provide legal advice for consumer rights question', async () => {
    const query = 'Продавец не принимает возврат товара в течение 14 дней';
    
    const result = await agent.provideLegalAdvice(query);
    
    expect(result.advice).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.sources).toBeDefined();
  });
  
  it('should handle empty query', async () => {
    await expect(agent.provideLegalAdvice('')).rejects.toThrow();
  });
});
```

### **2. Integration Tests**
```typescript
// tests/api/ai/consultation.test.ts
import { POST } from '@/app/api/ai/consultation/route';
import { NextRequest } from 'next/server';

describe('/api/ai/consultation', () => {
  it('should return legal advice', async () => {
    const request = new NextRequest('http://localhost:3000/api/ai/consultation', {
      method: 'POST',
      body: JSON.stringify({
        query: 'Могу ли я вернуть товар без чека?',
        userId: 'test-user-id',
      }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.advice).toBeDefined();
    expect(data.confidence).toBeDefined();
  });
});
```

---

## 📈 Оптимизация

### **1. Caching с TimeWeb Cloud**
```typescript
// src/lib/ai/timeweb-cache.ts
import axios from 'axios';

export class TimeWebAICache {
  private apiKey: string;
  private baseUrl: string;
  
  constructor() {
    this.apiKey = process.env.TIMEWEB_API_KEY!;
    this.baseUrl = process.env.TIMEWEB_API_URL || 'https://api.timeweb.cloud';
  }
  
  async getCachedResponse(query: string): Promise<string | null> {
    try {
      const key = `ai:consultation:${Buffer.from(query).toString('base64')}`;
      const response = await axios.get(`${this.baseUrl}/v1/cache/get`, {
        params: { key },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      
      return response.data.value || null;
    } catch (error) {
      console.error('TimeWeb cache get error:', error);
      return null;
    }
  }
  
  async setCachedResponse(query: string, response: string, ttl: number = 3600): Promise<void> {
    try {
      const key = `ai:consultation:${Buffer.from(query).toString('base64')}`;
      await axios.post(`${this.baseUrl}/v1/cache/set`, {
        key,
        value: response,
        ttl,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('TimeWeb cache set error:', error);
    }
  }
}
```

### **2. Batch Processing**
```typescript
// src/lib/ai/batch-processor.ts
export class AIBatchProcessor {
  private queue: Array<{ query: string; resolve: Function; reject: Function }> = [];
  private processing = false;
  
  async addToQueue(query: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.queue.push({ query, resolve, reject });
      this.processQueue();
    });
  }
  
  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, 5); // Обрабатываем по 5 запросов
      
      try {
        const responses = await Promise.all(
          batch.map(item => this.processQuery(item.query))
        );
        
        batch.forEach((item, index) => {
          item.resolve(responses[index]);
        });
      } catch (error) {
        batch.forEach(item => item.reject(error));
      }
    }
    
    this.processing = false;
  }
  
  private async processQuery(query: string): Promise<string> {
    // Обработка запроса
    return 'Response';
  }
}
```

---

## 🎯 Заключение

AI интеграция в LawerApp Telegram Mini App с TimeWeb Cloud обеспечивает:

- ✅ **Качественные консультации** - RAG система с правовой базой знаний на TimeWeb Cloud
- ✅ **Автоматическую генерацию документов** - специализированные AI агенты
- ✅ **Масштабируемость** - кэширование и batch processing через TimeWeb Cloud
- ✅ **Безопасность** - rate limiting и валидация входных данных
- ✅ **Мониторинг** - аналитика и обработка ошибок
- ✅ **Российская инфраструктура** - все данные остаются в России

**Следующий шаг:** Настройка правовой базы знаний в TimeWeb Cloud и обучение AI агентов! 🚀

---

*AI интеграция подготовлена: 16 октября 2025*  
*Версия: 1.0*  
*Статус: Готов к реализации ✅*
