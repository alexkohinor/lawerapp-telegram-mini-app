# 📋 Спецификация функций LawerApp Telegram Mini App

## 🎯 Обзор функций

**LawerApp** - это комплексная правовая платформа, интегрированная с Telegram, которая предоставляет AI-консультации, генерацию документов и управление спорами. Данная спецификация описывает все функции с детальными пользовательскими сценариями.

---

## 🏗️ Архитектура функций

```
┌─────────────────────────────────────────────────────────────┐
│                    LawerApp Functions                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   AI Legal      │  │   Document      │  │   Dispute   │  │
│  │   Assistant     │  │   Generator     │  │   Manager   │  │
│  │                 │  │                 │  │             │  │
│  │ • Chat Interface│  │ • Templates     │  │ • Case      │  │
│  │ • RAG System    │  │ • AI Generation │  │   Tracking  │  │
│  │ • Multi-Agent   │  │ • Customization │  │ • Document  │  │
│  │ • Context Aware │  │ • Validation    │  │   Management│  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Payment       │  │   User          │  │   Analytics │  │
│  │   System        │  │   Management    │  │   & Reports │  │
│  │                 │  │                 │  │             │  │
│  │ • Telegram Stars│  │ • Profile       │  │ • Usage     │  │
│  │ • Russian       │  │ • Preferences   │  │   Analytics │  │
│  │   Payments      │  │ • History       │  │ • Legal     │  │
│  │ • Subscriptions │  │ • Notifications │  │   Reports   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 1. AI Legal Assistant

### **1.1 Чат-интерфейс с AI**

#### **Функциональность:**
- Интерактивный чат с AI-юристом
- Поддержка контекста разговора
- Многоагентная система специализированных AI
- Интеграция с RAG системой для поиска по правовой базе

#### **User Stories:**

**US-001: Консультация по потребительским правам**
```
Как потребитель, я хочу получить консультацию по возврату товара,
чтобы знать свои права и порядок действий.

Критерии приемки:
- AI понимает контекст проблемы
- Предоставляет ссылки на статьи ЗЗПП
- Дает пошаговый алгоритм действий
- Предлагает шаблоны документов
```

**US-002: Консультация по трудовому праву**
```
Как работник, я хочу получить консультацию по увольнению,
чтобы защитить свои права.

Критерии приемки:
- AI анализирует ситуацию увольнения
- Ссылается на ТК РФ
- Предлагает варианты защиты
- Генерирует необходимые документы
```

#### **Техническая реализация:**
```typescript
// src/components/features/ai/ChatInterface.tsx
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  context?: LegalContext;
  sources?: LegalSource[];
  suggestions?: ChatSuggestion[];
}

interface LegalContext {
  area: LegalArea; // 'consumer', 'labor', 'civil', 'criminal'
  jurisdiction: 'russia';
  urgency: 'low' | 'medium' | 'high';
  complexity: 'simple' | 'medium' | 'complex';
}

interface ChatSuggestion {
  text: string;
  action: 'generate_document' | 'schedule_consultation' | 'search_precedent';
  metadata?: any;
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<LegalContext | null>(null);

  const sendMessage = async (content: string) => {
    setIsLoading(true);
    
    try {
      const response = await aiService.getLegalConsultation({
        message: content,
        context,
        conversationHistory: messages.slice(-10) // Последние 10 сообщений
      });
      
      const newMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        context: response.context,
        sources: response.sources,
        suggestions: response.suggestions
      };
      
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      // Обработка ошибок
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      <ChatHeader context={context} />
      <ChatMessages messages={messages} />
      <ChatInput onSend={sendMessage} disabled={isLoading} />
      <ChatSuggestions suggestions={messages[messages.length - 1]?.suggestions} />
    </div>
  );
};
```

### **1.2 RAG система (Retrieval-Augmented Generation)**

#### **Функциональность:**
- Поиск по обширной правовой базе знаний
- Семантический поиск с использованием векторных эмбеддингов
- Контекстно-зависимые ответы на основе найденных документов
- Обновление базы знаний в реальном времени

#### **User Stories:**

**US-003: Поиск прецедентов**
```
Как юрист, я хочу найти похожие судебные дела,
чтобы использовать их в качестве прецедентов.

Критерии приемки:
- Система находит релевантные дела по ключевым словам
- Предоставляет краткое изложение дела
- Ссылается на судебные решения
- Показывает релевантность (score)
```

#### **Техническая реализация:**
```typescript
// src/lib/ai/rag-service.ts
export class RAGService {
  private vectorStore: TimeWebVectorStore;
  private embeddingService: EmbeddingService;
  private llmService: LLMService;

  async searchLegalKnowledge(query: string, context: LegalContext): Promise<SearchResult[]> {
    // 1. Генерируем эмбеддинг запроса
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);
    
    // 2. Ищем похожие документы в векторной базе
    const similarDocs = await this.vectorStore.searchSimilar(queryEmbedding, {
      limit: 10,
      threshold: 0.7,
      filters: {
        legalArea: context.area,
        jurisdiction: context.jurisdiction
      }
    });
    
    // 3. Ранжируем результаты по релевантности
    const rankedResults = await this.rankResults(query, similarDocs);
    
    return rankedResults;
  }

  async generateContextualResponse(
    query: string, 
    searchResults: SearchResult[]
  ): Promise<ContextualResponse> {
    // Формируем контекст из найденных документов
    const context = searchResults
      .map(result => result.content)
      .join('\n\n');
    
    // Генерируем ответ с использованием контекста
    const response = await this.llmService.generateResponse({
      query,
      context,
      instructions: 'Отвечай на основе предоставленного правового контекста'
    });
    
    return {
      answer: response.content,
      sources: searchResults.map(r => r.source),
      confidence: response.confidence
    };
  }
}
```

### **1.3 Многоагентная система**

#### **Функциональность:**
- Специализированные AI агенты для разных областей права
- Автоматическое перенаправление к нужному агенту
- Коллаборация между агентами для сложных вопросов
- Обучение агентов на специализированных данных

#### **User Stories:**

**US-004: Специализированная консультация**
```
Как пользователь, я хочу получить консультацию от специалиста
по конкретной области права, чтобы получить более точный ответ.

Критерии приемки:
- Система определяет область права
- Перенаправляет к специализированному агенту
- Агент предоставляет детальную консультацию
- При необходимости привлекает других агентов
```

#### **Техническая реализация:**
```typescript
// src/lib/ai/agent-system.ts
export class MultiAgentSystem {
  private agents: Map<LegalArea, LegalAgent> = new Map();
  private orchestrator: AgentOrchestrator;

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents(): void {
    this.agents.set('consumer', new ConsumerRightsAgent());
    this.agents.set('labor', new LaborLawAgent());
    this.agents.set('civil', new CivilLawAgent());
    this.agents.set('criminal', new CriminalLawAgent());
    this.agents.set('family', new FamilyLawAgent());
    this.agents.set('tax', new TaxLawAgent());
  }

  async processQuery(query: string, context: LegalContext): Promise<AgentResponse> {
    // 1. Определяем область права
    const legalArea = await this.classifyLegalArea(query);
    
    // 2. Выбираем подходящего агента
    const agent = this.agents.get(legalArea);
    
    if (!agent) {
      return await this.handleUnknownArea(query);
    }
    
    // 3. Обрабатываем запрос через агента
    const response = await agent.processQuery(query, context);
    
    // 4. Проверяем, нужна ли коллаборация
    if (response.requiresCollaboration) {
      return await this.orchestrateCollaboration(query, response);
    }
    
    return response;
  }

  private async orchestrateCollaboration(
    query: string, 
    initialResponse: AgentResponse
  ): Promise<AgentResponse> {
    const collaboratingAgents = await this.orchestrator.identifyCollaborators(
      query, 
      initialResponse
    );
    
    const collaborativeResponse = await this.orchestrator.coordinateAgents(
      query,
      collaboratingAgents
    );
    
    return collaborativeResponse;
  }
}

// Специализированный агент для потребительских прав
export class ConsumerRightsAgent extends LegalAgent {
  protected legalArea: LegalArea = 'consumer';
  protected knowledgeBase: string[] = [
    'ЗЗПП (Закон о защите прав потребителей)',
    'ГК РФ (Гражданский кодекс)',
    'Судебная практика по потребительским спорам'
  ];

  async processQuery(query: string, context: LegalContext): Promise<AgentResponse> {
    // Специализированная обработка для потребительских прав
    const analysis = await this.analyzeConsumerIssue(query);
    
    if (analysis.involvesMultipleAreas) {
      return {
        answer: analysis.answer,
        requiresCollaboration: true,
        suggestedCollaborators: ['civil', 'administrative'],
        confidence: analysis.confidence
      };
    }
    
    return {
      answer: analysis.answer,
      requiresCollaboration: false,
      confidence: analysis.confidence
    };
  }
}
```

---

## 📄 2. Document Generator

### **2.1 Генерация правовых документов**

#### **Функциональность:**
- Автоматическая генерация документов на основе шаблонов
- AI-адаптация документов под конкретную ситуацию
- Валидация документов на соответствие законодательству
- Экспорт в различные форматы (PDF, DOCX, TXT)

#### **User Stories:**

**US-005: Генерация претензии**
```
Как потребитель, я хочу сгенерировать претензию к продавцу,
чтобы формально заявить о своих требованиях.

Критерии приемки:
- Система собирает необходимую информацию
- Генерирует претензию по шаблону
- Адаптирует под конкретную ситуацию
- Предоставляет для скачивания в PDF
```

**US-006: Генерация трудового договора**
```
Как работодатель, я хочу сгенерировать трудовой договор,
чтобы соблюсти все требования ТК РФ.

Критерии приемки:
- Система собирает данные о работнике и должности
- Генерирует договор с учетом ТК РФ
- Включает все обязательные пункты
- Предоставляет возможность редактирования
```

#### **Техническая реализация:**
```typescript
// src/lib/documents/document-generator.ts
export class DocumentGenerator {
  private templateEngine: TemplateEngine;
  private aiService: AIService;
  private validator: DocumentValidator;

  async generateDocument(
    templateId: string, 
    data: DocumentData, 
    options: GenerationOptions
  ): Promise<GeneratedDocument> {
    // 1. Загружаем шаблон
    const template = await this.templateEngine.loadTemplate(templateId);
    
    // 2. Валидируем входные данные
    await this.validator.validateData(template, data);
    
    // 3. Генерируем контент с помощью AI
    const content = await this.aiService.generateDocumentContent({
      template,
      data,
      options
    });
    
    // 4. Создаем документ
    const document = await this.templateEngine.renderDocument(template, content);
    
    // 5. Валидируем результат
    await this.validator.validateDocument(document);
    
    return {
      id: generateId(),
      content: document,
      metadata: {
        templateId,
        generatedAt: new Date(),
        version: template.version
      }
    };
  }

  async generatePretenziya(data: PretenziyaData): Promise<GeneratedDocument> {
    return await this.generateDocument('pretenziya', data, {
      includeLegalReferences: true,
      format: 'formal',
      language: 'ru'
    });
  }

  async generateLaborContract(data: LaborContractData): Promise<GeneratedDocument> {
    return await this.generateDocument('labor_contract', data, {
      includeLegalReferences: true,
      format: 'legal',
      language: 'ru',
      complianceCheck: true
    });
  }
}

// Шаблон претензии
export const PRETENZIYA_TEMPLATE = {
  id: 'pretenziya',
  name: 'Претензия к продавцу',
  version: '1.0',
  sections: [
    {
      id: 'header',
      type: 'static',
      content: 'ПРЕТЕНЗИЯ'
    },
    {
      id: 'recipient',
      type: 'dynamic',
      field: 'seller_info',
      template: 'Продавцу: {{company_name}}\nАдрес: {{address}}'
    },
    {
      id: 'sender',
      type: 'dynamic',
      field: 'buyer_info',
      template: 'От: {{full_name}}\nАдрес: {{address}}\nТелефон: {{phone}}'
    },
    {
      id: 'main_content',
      type: 'ai_generated',
      prompt: 'Сгенерируй основную часть претензии на основе следующих данных: {{issue_description}}'
    },
    {
      id: 'requirements',
      type: 'dynamic',
      field: 'requirements',
      template: 'Требую: {{requirements}}'
    },
    {
      id: 'legal_basis',
      type: 'static',
      content: 'Правовые основания: ЗЗПП РФ, ГК РФ'
    }
  ]
};
```

### **2.2 Кастомизация документов**

#### **Функциональность:**
- Интерактивный редактор документов
- Предложения по улучшению от AI
- Проверка на соответствие законодательству
- Сохранение пользовательских шаблонов

#### **User Stories:**

**US-007: Редактирование документа**
```
Как пользователь, я хочу отредактировать сгенерированный документ,
чтобы адаптировать его под свои нужды.

Критерии приемки:
- Предоставляется удобный редактор
- AI предлагает улучшения
- Проверяется соответствие законодательству
- Сохраняются изменения
```

#### **Техническая реализация:**
```typescript
// src/components/features/documents/DocumentEditor.tsx
export const DocumentEditor: React.FC<DocumentEditorProps> = ({ document, onSave }) => {
  const [content, setContent] = useState(document.content);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const handleContentChange = useCallback(async (newContent: string) => {
    setContent(newContent);
    
    // Получаем предложения от AI
    const aiSuggestions = await aiService.getDocumentSuggestions(newContent);
    setSuggestions(aiSuggestions);
  }, []);

  const validateDocument = async () => {
    setIsValidating(true);
    
    try {
      const validation = await documentValidator.validate(content);
      
      if (!validation.isValid) {
        // Показываем ошибки
        showValidationErrors(validation.errors);
      }
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="document-editor">
      <EditorToolbar 
        onSave={() => onSave(content)}
        onValidate={validateDocument}
        isValidating={isValidating}
      />
      
      <DocumentContent 
        content={content}
        onChange={handleContentChange}
        suggestions={suggestions}
      />
      
      <AISuggestions 
        suggestions={suggestions}
        onApply={(suggestion) => applySuggestion(suggestion)}
      />
    </div>
  );
};
```

---

## ⚖️ 3. Dispute Manager

### **3.1 Создание и управление спорами**

#### **Функциональность:**
- Создание новых споров с детальным описанием
- Отслеживание статуса спора в реальном времени
- Управление документами по спору
- Уведомления о важных событиях

#### **User Stories:**

**US-008: Создание спора**
```
Как пользователь, я хочу создать новый спор,
чтобы начать процесс решения правовой проблемы.

Критерии приемки:
- Система собирает всю необходимую информацию
- Присваивает уникальный номер спора
- Создает план действий
- Настраивает уведомления
```

**US-009: Отслеживание статуса**
```
Как пользователь, я хочу отслеживать статус своего спора,
чтобы быть в курсе прогресса.

Критерии приемки:
- Показывается текущий статус
- Отображается история изменений
- Предоставляются следующие шаги
- Настраиваются уведомления
```

#### **Техническая реализация:**
```typescript
// src/lib/disputes/dispute-manager.ts
export class DisputeManager {
  private disputeRepository: DisputeRepository;
  private notificationService: NotificationService;
  private documentService: DocumentService;

  async createDispute(data: CreateDisputeData): Promise<Dispute> {
    // 1. Валидируем данные
    await this.validateDisputeData(data);
    
    // 2. Создаем спор
    const dispute = await this.disputeRepository.create({
      id: generateId(),
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: 'created',
      createdAt: new Date(),
      userId: data.userId
    });
    
    // 3. Создаем план действий
    const actionPlan = await this.createActionPlan(dispute);
    dispute.actionPlan = actionPlan;
    
    // 4. Настраиваем уведомления
    await this.setupNotifications(dispute);
    
    // 5. Генерируем начальные документы
    await this.generateInitialDocuments(dispute);
    
    return dispute;
  }

  async updateDisputeStatus(
    disputeId: string, 
    status: DisputeStatus, 
    comment?: string
  ): Promise<void> {
    const dispute = await this.disputeRepository.findById(disputeId);
    
    if (!dispute) {
      throw new Error('Dispute not found');
    }
    
    // Обновляем статус
    dispute.status = status;
    dispute.updatedAt = new Date();
    
    // Добавляем комментарий
    if (comment) {
      dispute.comments.push({
        id: generateId(),
        text: comment,
        author: 'system',
        timestamp: new Date()
      });
    }
    
    // Сохраняем изменения
    await this.disputeRepository.update(dispute);
    
    // Отправляем уведомления
    await this.notificationService.notifyStatusChange(dispute, status);
    
    // Обновляем план действий
    await this.updateActionPlan(dispute);
  }

  private async createActionPlan(dispute: Dispute): Promise<ActionPlan> {
    const actions = await aiService.generateActionPlan({
      disputeType: dispute.category,
      description: dispute.description,
      priority: dispute.priority
    });
    
    return {
      id: generateId(),
      disputeId: dispute.id,
      actions: actions.map(action => ({
        ...action,
        id: generateId(),
        status: 'pending',
        dueDate: this.calculateDueDate(action.type, dispute.priority)
      })),
      createdAt: new Date()
    };
  }
}

// Компонент управления спорами
export const DisputeManager: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  return (
    <div className="dispute-manager">
      <DisputeList 
        disputes={disputes}
        onSelect={setSelectedDispute}
        onCreateNew={() => setShowCreateModal(true)}
      />
      
      {selectedDispute && (
        <DisputeDetails 
          dispute={selectedDispute}
          onUpdate={handleDisputeUpdate}
        />
      )}
      
      <CreateDisputeModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateDispute}
      />
    </div>
  );
};
```

### **3.2 Управление документами по спору**

#### **Функциональность:**
- Загрузка и организация документов
- Автоматическая категоризация документов
- Поиск по документам
- Версионирование документов

#### **User Stories:**

**US-010: Загрузка документов**
```
Как пользователь, я хочу загрузить документы по спору,
чтобы сохранить все доказательства.

Критерии приемки:
- Поддерживаются различные форматы файлов
- Документы автоматически категоризируются
- Предоставляется поиск по документам
- Обеспечивается безопасное хранение
```

#### **Техническая реализация:**
```typescript
// src/lib/documents/dispute-document-manager.ts
export class DisputeDocumentManager {
  private fileStorage: FileStorage;
  private aiService: AIService;
  private documentRepository: DocumentRepository;

  async uploadDocument(
    disputeId: string, 
    file: File, 
    metadata: DocumentMetadata
  ): Promise<DisputeDocument> {
    // 1. Валидируем файл
    await this.validateFile(file);
    
    // 2. Загружаем файл
    const uploadResult = await this.fileStorage.upload(file, {
      disputeId,
      category: metadata.category
    });
    
    // 3. Анализируем содержимое с помощью AI
    const analysis = await this.aiService.analyzeDocument({
      content: uploadResult.content,
      type: file.type,
      disputeId
    });
    
    // 4. Создаем запись в базе данных
    const document = await this.documentRepository.create({
      id: generateId(),
      disputeId,
      filename: file.name,
      fileUrl: uploadResult.url,
      category: analysis.category,
      tags: analysis.tags,
      summary: analysis.summary,
      uploadedAt: new Date()
    });
    
    return document;
  }

  async searchDocuments(
    disputeId: string, 
    query: string
  ): Promise<DisputeDocument[]> {
    // Семантический поиск по документам
    const results = await this.aiService.searchDocuments({
      disputeId,
      query,
      limit: 20
    });
    
    return results;
  }

  private async validateFile(file: File): Promise<void> {
    // Проверяем размер файла
    if (file.size > 10 * 1024 * 1024) { // 10MB
      throw new Error('File too large');
    }
    
    // Проверяем тип файла
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Unsupported file type');
    }
    
    // Проверяем на вирусы
    const isClean = await this.scanFile(file);
    if (!isClean) {
      throw new Error('File contains malware');
    }
  }
}
```

---

## 💳 4. Payment System

### **4.1 Российские способы оплаты**

#### **Функциональность:**
- Telegram Stars (основной способ)
- Банковские карты через ЮKassa
- СБП (Система быстрых платежей)
- ЮMoney, QIWI
- Банковские переводы

#### **User Stories:**

**US-011: Оплата через Telegram Stars**
```
Как пользователь, я хочу оплатить услугу через Telegram Stars,
чтобы использовать встроенную валюту Telegram.

Критерии приемки:
- Интеграция с Telegram Stars API
- Мгновенная обработка платежа
- Автоматическое обновление баланса
- Генерация чека
```

**US-012: Оплата банковской картой**
```
Как пользователь, я хочу оплатить услугу банковской картой,
чтобы использовать привычный способ оплаты.

Критерии приемки:
- Интеграция с ЮKassa
- Поддержка Visa, MasterCard, МИР
- Безопасная обработка данных
- 3D Secure аутентификация
```

#### **Техническая реализация:**
```typescript
// src/lib/payments/payment-manager.ts
export class PaymentManager {
  private telegramStarsService: TelegramStarsService;
  private yooKassaService: YooKassaService;
  private sbpService: SBPService;
  private yooMoneyService: YooMoneyService;
  private qiwiService: QIWIService;

  async processPayment(
    paymentData: PaymentData
  ): Promise<PaymentResult> {
    switch (paymentData.method) {
      case 'telegram_stars':
        return await this.processTelegramStarsPayment(paymentData);
      case 'yookassa':
        return await this.processYooKassaPayment(paymentData);
      case 'sbp':
        return await this.processSBPPayment(paymentData);
      case 'yoomoney':
        return await this.processYooMoneyPayment(paymentData);
      case 'qiwi':
        return await this.processQIWIPayment(paymentData);
      default:
        throw new Error('Unsupported payment method');
    }
  }

  private async processTelegramStarsPayment(
    paymentData: PaymentData
  ): Promise<PaymentResult> {
    try {
      // Создаем инвойс в Telegram
      const invoice = await this.telegramStarsService.createInvoice({
        title: paymentData.description,
        description: paymentData.description,
        payload: paymentData.orderId,
        provider_token: process.env.TELEGRAM_STARS_PROVIDER_TOKEN,
        currency: 'XTR', // Telegram Stars
        prices: [{
          label: paymentData.description,
          amount: paymentData.amount
        }]
      });

      // Отправляем инвойс пользователю
      await this.telegramStarsService.sendInvoice(
        paymentData.userId, 
        invoice
      );

      return {
        success: true,
        paymentId: invoice.id,
        status: 'pending',
        redirectUrl: null
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 'failed'
      };
    }
  }

  private async processYooKassaPayment(
    paymentData: PaymentData
  ): Promise<PaymentResult> {
    try {
      // Создаем платеж в ЮKassa
      const payment = await this.yooKassaService.createPayment({
        amount: {
          value: paymentData.amount.toFixed(2),
          currency: 'RUB'
        },
        confirmation: {
          type: 'redirect',
          return_url: `${process.env.APP_URL}/payment/success`
        },
        description: paymentData.description,
        metadata: {
          orderId: paymentData.orderId,
          userId: paymentData.userId
        }
      });

      return {
        success: true,
        paymentId: payment.id,
        status: 'pending',
        redirectUrl: payment.confirmation.confirmation_url
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 'failed'
      };
    }
  }
}

// Компонент выбора способа оплаты
export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onSelect,
  selectedMethod
}) => {
  const paymentMethods = [
    {
      id: 'telegram_stars',
      name: 'Telegram Stars',
      description: 'Встроенная валюта Telegram',
      icon: '⭐',
      available: true
    },
    {
      id: 'yookassa',
      name: 'Банковская карта',
      description: 'Visa, MasterCard, МИР',
      icon: '💳',
      available: true
    },
    {
      id: 'sbp',
      name: 'СБП',
      description: 'Система быстрых платежей',
      icon: '🏦',
      available: true
    },
    {
      id: 'yoomoney',
      name: 'ЮMoney',
      description: 'Яндекс.Деньги',
      icon: '💰',
      available: true
    },
    {
      id: 'qiwi',
      name: 'QIWI',
      description: 'Популярный в России',
      icon: '📱',
      available: true
    }
  ];

  return (
    <div className="payment-method-selector">
      <h3>Выберите способ оплаты</h3>
      <div className="payment-methods">
        {paymentMethods.map(method => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            isSelected={selectedMethod === method.id}
            onSelect={() => onSelect(method.id)}
          />
        ))}
      </div>
    </div>
  );
};
```

### **4.2 Система подписок**

#### **Функциональность:**
- Гибкие тарифные планы
- Автоматическое продление подписок
- Управление подписками
- Аналитика использования

#### **User Stories:**

**US-013: Подписка на премиум**
```
Как пользователь, я хочу оформить подписку на премиум,
чтобы получить доступ к расширенным функциям.

Критерии приемки:
- Доступны различные тарифные планы
- Автоматическое продление
- Уведомления о продлении
- Возможность отмены подписки
```

#### **Техническая реализация:**
```typescript
// src/lib/subscriptions/subscription-manager.ts
export class SubscriptionManager {
  private subscriptionRepository: SubscriptionRepository;
  private paymentManager: PaymentManager;
  private notificationService: NotificationService;

  async createSubscription(
    userId: string, 
    planId: string, 
    paymentMethod: PaymentMethod
  ): Promise<Subscription> {
    const plan = await this.getPlan(planId);
    
    // Создаем подписку
    const subscription = await this.subscriptionRepository.create({
      id: generateId(),
      userId,
      planId,
      status: 'active',
      startDate: new Date(),
      endDate: this.calculateEndDate(plan.billingCycle),
      autoRenew: true,
      paymentMethod
    });

    // Обрабатываем первый платеж
    const paymentResult = await this.paymentManager.processPayment({
      userId,
      amount: plan.price,
      method: paymentMethod,
      description: `Подписка ${plan.name}`,
      orderId: subscription.id
    });

    if (!paymentResult.success) {
      subscription.status = 'failed';
      await this.subscriptionRepository.update(subscription);
      throw new Error('Payment failed');
    }

    // Настраиваем автоматическое продление
    await this.setupAutoRenewal(subscription);

    return subscription;
  }

  async checkSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    const subscription = await this.subscriptionRepository.findActiveByUserId(userId);
    
    if (!subscription) {
      return { hasActiveSubscription: false };
    }

    const now = new Date();
    const isExpired = subscription.endDate < now;
    
    if (isExpired && subscription.autoRenew) {
      // Пытаемся продлить подписку
      await this.renewSubscription(subscription);
    }

    return {
      hasActiveSubscription: !isExpired,
      subscription,
      features: this.getAvailableFeatures(subscription.planId)
    };
  }

  private async renewSubscription(subscription: Subscription): Promise<void> {
    try {
      const plan = await this.getPlan(subscription.planId);
      
      const paymentResult = await this.paymentManager.processPayment({
        userId: subscription.userId,
        amount: plan.price,
        method: subscription.paymentMethod,
        description: `Продление подписки ${plan.name}`,
        orderId: subscription.id
      });

      if (paymentResult.success) {
        subscription.endDate = this.calculateEndDate(plan.billingCycle);
        await this.subscriptionRepository.update(subscription);
        
        await this.notificationService.sendRenewalSuccess(subscription);
      } else {
        subscription.status = 'expired';
        await this.subscriptionRepository.update(subscription);
        
        await this.notificationService.sendRenewalFailed(subscription);
      }
    } catch (error) {
      subscription.status = 'expired';
      await this.subscriptionRepository.update(subscription);
    }
  }
}
```

---

## 👤 5. User Management

### **5.1 Управление профилем**

#### **Функциональность:**
- Создание и редактирование профиля
- Настройки уведомлений
- История активности
- Управление подписками

#### **User Stories:**

**US-014: Редактирование профиля**
```
Как пользователь, я хочу редактировать свой профиль,
чтобы обновить личную информацию.

Критерии приемки:
- Возможность изменения основных данных
- Валидация введенной информации
- Сохранение изменений
- Уведомление об успешном обновлении
```

#### **Техническая реализация:**
```typescript
// src/components/features/user/UserProfile.tsx
export const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({});

  const handleSave = async () => {
    try {
      const updatedUser = await userService.updateProfile(user.id, formData);
      setUser(updatedUser);
      setIsEditing(false);
      showSuccessMessage('Профиль успешно обновлен');
    } catch (error) {
      showErrorMessage('Ошибка при обновлении профиля');
    }
  };

  return (
    <div className="user-profile">
      <ProfileHeader user={user} />
      
      {isEditing ? (
        <ProfileEditForm 
          user={user}
          formData={formData}
          onChange={setFormData}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <ProfileView 
          user={user}
          onEdit={() => setIsEditing(true)}
        />
      )}
      
      <ProfileSettings user={user} />
      <ActivityHistory userId={user?.id} />
    </div>
  );
};
```

### **5.2 Настройки уведомлений**

#### **Функциональность:**
- Настройка типов уведомлений
- Выбор каналов уведомлений
- Расписание уведомлений
- Управление подписками на уведомления

#### **User Stories:**

**US-015: Настройка уведомлений**
```
Как пользователь, я хочу настроить уведомления,
чтобы получать только важную информацию.

Критерии приемки:
- Возможность выбора типов уведомлений
- Настройка каналов (Telegram, email)
- Установка времени уведомлений
- Предварительный просмотр уведомлений
```

#### **Техническая реализация:**
```typescript
// src/lib/notifications/notification-manager.ts
export class NotificationManager {
  private notificationRepository: NotificationRepository;
  private telegramService: TelegramService;
  private emailService: EmailService;

  async updateNotificationSettings(
    userId: string, 
    settings: NotificationSettings
  ): Promise<void> {
    await this.notificationRepository.updateSettings(userId, settings);
  }

  async sendNotification(
    userId: string, 
    notification: Notification
  ): Promise<void> {
    const settings = await this.notificationRepository.getSettings(userId);
    
    if (!settings.enabled) {
      return;
    }

    // Проверяем, нужно ли отправлять уведомление
    if (!this.shouldSendNotification(notification, settings)) {
      return;
    }

    // Отправляем через выбранные каналы
    const promises = [];

    if (settings.channels.telegram && notification.type !== 'email_only') {
      promises.push(this.telegramService.sendMessage(userId, notification));
    }

    if (settings.channels.email && notification.type !== 'telegram_only') {
      promises.push(this.emailService.sendEmail(userId, notification));
    }

    await Promise.all(promises);
  }

  private shouldSendNotification(
    notification: Notification, 
    settings: NotificationSettings
  ): boolean {
    // Проверяем тип уведомления
    if (!settings.types[notification.type]) {
      return false;
    }

    // Проверяем время (не отправляем ночью, если настроено)
    if (settings.quietHours.enabled) {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour >= settings.quietHours.start && hour <= settings.quietHours.end) {
        return notification.priority === 'high';
      }
    }

    return true;
  }
}
```

---

## 📊 6. Analytics & Reports

### **6.1 Аналитика использования**

#### **Функциональность:**
- Отслеживание активности пользователей
- Анализ популярных функций
- Метрики производительности
- Отчеты по использованию

#### **User Stories:**

**US-016: Просмотр аналитики**
```
Как администратор, я хочу просматривать аналитику использования,
чтобы понимать, как пользователи взаимодействуют с приложением.

Критерии приемки:
- Отображаются ключевые метрики
- Предоставляются графики и диаграммы
- Возможность фильтрации по периодам
- Экспорт данных в различных форматах
```

#### **Техническая реализация:**
```typescript
// src/lib/analytics/analytics-service.ts
export class AnalyticsService {
  private analyticsRepository: AnalyticsRepository;
  private eventTracker: EventTracker;

  async trackEvent(
    userId: string, 
    event: AnalyticsEvent
  ): Promise<void> {
    const analyticsEvent = {
      id: generateId(),
      userId,
      eventType: event.type,
      eventData: event.data,
      timestamp: new Date(),
      sessionId: event.sessionId,
      userAgent: event.userAgent,
      ip: event.ip
    };

    await this.analyticsRepository.create(analyticsEvent);
  }

  async getUsageAnalytics(
    period: AnalyticsPeriod
  ): Promise<UsageAnalytics> {
    const events = await this.analyticsRepository.getEventsByPeriod(period);
    
    return {
      totalUsers: await this.getTotalUsers(period),
      activeUsers: await this.getActiveUsers(period),
      newUsers: await this.getNewUsers(period),
      retention: await this.getRetentionRate(period),
      popularFeatures: await this.getPopularFeatures(events),
      userJourney: await this.getUserJourney(events),
      conversionFunnel: await this.getConversionFunnel(events)
    };
  }

  async getLegalAnalytics(
    period: AnalyticsPeriod
  ): Promise<LegalAnalytics> {
    return {
      totalConsultations: await this.getTotalConsultations(period),
      popularLegalAreas: await this.getPopularLegalAreas(period),
      averageConsultationTime: await this.getAverageConsultationTime(period),
      documentGenerationStats: await this.getDocumentGenerationStats(period),
      disputeResolutionStats: await this.getDisputeResolutionStats(period)
    };
  }
}

// Компонент аналитики
export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null);
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    const data = await analyticsService.getUsageAnalytics(period);
    setAnalytics(data);
  };

  return (
    <div className="analytics-dashboard">
      <AnalyticsHeader period={period} onPeriodChange={setPeriod} />
      
      <div className="analytics-grid">
        <MetricCard 
          title="Активные пользователи"
          value={analytics?.activeUsers}
          change={analytics?.activeUsersChange}
        />
        
        <MetricCard 
          title="Новые пользователи"
          value={analytics?.newUsers}
          change={analytics?.newUsersChange}
        />
        
        <MetricCard 
          title="Консультации"
          value={analytics?.totalConsultations}
          change={analytics?.consultationsChange}
        />
        
        <MetricCard 
          title="Документы"
          value={analytics?.documentsGenerated}
          change={analytics?.documentsChange}
        />
      </div>
      
      <AnalyticsCharts data={analytics} />
      <PopularFeatures data={analytics?.popularFeatures} />
    </div>
  );
};
```

### **6.2 Правовые отчеты**

#### **Функциональность:**
- Отчеты по консультациям
- Статистика по спорам
- Анализ популярных правовых вопросов
- Отчеты по эффективности AI

#### **User Stories:**

**US-017: Генерация правового отчета**
```
Как администратор, я хочу сгенерировать правовой отчет,
чтобы анализировать эффективность AI-консультаций.

Критерии приемки:
- Отображается статистика по консультациям
- Анализируется точность ответов AI
- Показываются популярные правовые области
- Предоставляются рекомендации по улучшению
```

#### **Техническая реализация:**
```typescript
// src/lib/reports/legal-report-generator.ts
export class LegalReportGenerator {
  private analyticsService: AnalyticsService;
  private aiService: AIService;

  async generateLegalReport(
    period: AnalyticsPeriod
  ): Promise<LegalReport> {
    const analytics = await this.analyticsService.getLegalAnalytics(period);
    
    return {
      period,
      generatedAt: new Date(),
      summary: await this.generateSummary(analytics),
      consultations: await this.generateConsultationReport(analytics),
      documents: await this.generateDocumentReport(analytics),
      disputes: await this.generateDisputeReport(analytics),
      aiPerformance: await this.generateAIPerformanceReport(analytics),
      recommendations: await this.generateRecommendations(analytics)
    };
  }

  private async generateSummary(analytics: LegalAnalytics): Promise<ReportSummary> {
    return {
      totalConsultations: analytics.totalConsultations,
      totalDocuments: analytics.documentGenerationStats.total,
      totalDisputes: analytics.disputeResolutionStats.total,
      averageResponseTime: analytics.averageConsultationTime,
      userSatisfaction: await this.calculateUserSatisfaction(analytics),
      topLegalAreas: analytics.popularLegalAreas.slice(0, 5)
    };
  }

  private async generateRecommendations(
    analytics: LegalAnalytics
  ): Promise<ReportRecommendation[]> {
    const recommendations = [];

    // Анализируем популярные области права
    if (analytics.popularLegalAreas[0]?.percentage > 40) {
      recommendations.push({
        type: 'content_expansion',
        priority: 'high',
        title: 'Расширить контент по популярной области',
        description: `Область "${analytics.popularLegalAreas[0].name}" составляет ${analytics.popularLegalAreas[0].percentage}% всех запросов`,
        action: `Добавить больше шаблонов и примеров по ${analytics.popularLegalAreas[0].name}`
      });
    }

    // Анализируем время ответа
    if (analytics.averageConsultationTime > 30000) { // 30 секунд
      recommendations.push({
        type: 'performance_optimization',
        priority: 'medium',
        title: 'Оптимизировать время ответа AI',
        description: `Среднее время ответа составляет ${analytics.averageConsultationTime}мс`,
        action: 'Рассмотреть оптимизацию RAG системы или кэширование'
      });
    }

    return recommendations;
  }
}
```

---

## 🎯 Заключение

Данная спецификация функций покрывает все основные возможности LawerApp:

### **✅ Реализованные функции:**
- **AI Legal Assistant** - чат-интерфейс, RAG система, многоагентная система
- **Document Generator** - генерация документов, кастомизация, валидация
- **Dispute Manager** - создание споров, отслеживание, управление документами
- **Payment System** - российские способы оплаты, подписки
- **User Management** - профили, настройки, уведомления
- **Analytics & Reports** - аналитика, правовые отчеты

### **🚀 Готовность к разработке:**
- **User Stories** - детальные сценарии использования
- **Техническая реализация** - примеры кода и архитектуры
- **Критерии приемки** - четкие требования к функциям
- **Интеграции** - Telegram, TimeWeb Cloud, платежные системы

**Следующий шаг**: Начало разработки с приоритетом на AI Legal Assistant! 🤖⚖️

---

*Спецификация функций подготовлена: 16 октября 2025*  
*Версия: 1.0*  
*Статус: Готово к разработке ✅*
