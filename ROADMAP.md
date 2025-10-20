# 🚀 Дорожная карта разработки LawerApp Telegram Mini App

## ✅ Выполнено (Phases 0-4)

### Phase 0 — Базовая настройка ✅
- [x] **Cache-busting** - добавлены meta-теги для предотвращения кэширования в Telegram
- [x] **Design tokens** - определены CSS переменные и утилиты в `globals.css`
- [x] **Safe-area padding** - добавлена поддержка `env(safe-area-inset-*)`

### Phase 1 — Исправление переполнения ✅
- [x] **Чипы в консультациях** - добавлен `flex-wrap` и `text-overflow: ellipsis`
- [x] **Sticky composer** - центрирован, ограничен по ширине, auto-grow textarea
- [x] **StickyBottomBar** - центрирован с `container-narrow`
- [x] **Text handling** - `word-break: break-word` для всех текстовых блоков

### Phase 2 — Навигация ✅
- [x] **AppHeader** - Back, Home, Contacts кнопки с адаптивными размерами
- [x] **Заголовки** - `text-overflow: ellipsis` для длинных названий
- [x] **Контраст** - поддержка темной/светлой темы Telegram

### Phase 3 — Доступность ✅
- [x] **Hit targets** - минимум 44×44px для всех интерактивных элементов
- [x] **Focus states** - видимые состояния фокуса для кнопок/ссылок
- [x] **Aria labels** - добавлены для иконок и кнопок

### Phase 4 — Интеграция с Telegram ✅
- [x] **ThemeBridge** - маппинг `themeParams` в CSS переменные
- [x] **MainButton** - интеграция с Telegram WebApp MainButton
- [x] **BackButton** - управление Telegram BackButton
- [x] **Haptic feedback** - тактильная обратная связь на действия

### Phase 5 — Компоненты ✅
- [x] **Chip/Composer** - вынесены в отдельные переиспользуемые компоненты
- [x] **Удаление inline стилей** - переход на CSS классы и токены
- [x] **StickyBottomBar** - оптимизирован для центрирования

### Phase 6 — QA и производительность ✅
- [x] **Мобильная адаптивность** - медиазапросы для экранов <480px
- [x] **Overflow control** - предотвращение горизонтального скролла
- [x] **Performance** - GPU-ускорение, оптимизация рендеринга
- [x] **Cache optimization** - стабильные сборки без агрессивного cache-busting

## 🔄 В процессе разработки

### Phase 7 — Расширенная функциональность

#### 7.1 Документы - Stepper Flow ✅
- [x] **Многошаговый процесс** создания документов
- [x] **Preview modal** для предварительного просмотра
- [x] **Шаблоны документов** - претензии, договоры, жалобы
- [x] **Валидация форм** - проверка обязательных полей

#### 7.2 Споры - Управление делами ✅
- [x] **Табы/фильтры** - по статусу, приоритету, дате
- [x] **Бейджи статусов** - цветовая индикация состояния
- [x] **Timeline** - хронология событий по делу
- [x] **Документооборот** - загрузка/просмотр файлов

#### 7.3 Prisma Database Integration ✅
- [ ] **Prisma Client Setup** - настройка и инициализация Prisma клиента
- [ ] **Database Connection** - подключение к PostgreSQL/TimeWeb Cloud
- [ ] **Schema Migration** - миграция существующей схемы
- [ ] **Type Generation** - генерация TypeScript типов
- [ ] **API Integration** - интеграция Prisma с API роутами
- [ ] **Error Handling** - обработка ошибок базы данных
- [ ] **Connection Pooling** - настройка пула соединений
- [ ] **Query Optimization** - оптимизация запросов

#### 7.4 User Management & Authentication ✅
- [x] **Telegram Auth Integration** - аутентификация через Telegram
- [x] **User Profile Management** - управление профилями пользователей
- [x] **Session Management** - управление сессиями
- [x] **Subscription Tracking** - отслеживание подписок
- [x] **Usage Limits** - контроль лимитов использования

#### 7.5 Data Persistence Layer (текущая фаза)
- [ ] **Consultation Storage** - сохранение консультаций в БД
- [ ] **Document Metadata** - метаданные документов
- [ ] **Dispute Management** - управление спорами
- [ ] **Payment Tracking** - отслеживание платежей
- [ ] **Notification System** - система уведомлений
- [ ] **Analytics Data** - аналитические данные

#### 7.6 Платежи - Расширенная интеграция
- [ ] **Segmented control** - выбор способа оплаты
- [ ] **Sticky CTA** - фиксированная кнопка оплаты
- [ ] **История платежей** - список транзакций
- [ ] **Уведомления** - статус платежей в реальном времени

#### 7.7 Telegram интеграция
- [ ] **WebApp.MainButton** - для ключевых действий
- [ ] **WebApp.BackButton** - улучшенное управление
- [ ] **Haptic patterns** - различные типы вибрации
- [ ] **Theme switching** - динамическое переключение тем

### Phase 8 — RAG система и база знаний (новая фаза)

#### 8.1 Базовая RAG инфраструктура ✅
- [x] **RAG Service** - основной сервис для поиска по базе знаний
- [x] **Vector Store** - векторное хранилище для TimeWeb Cloud
- [x] **Embedding Service** - генерация эмбеддингов для текстов
- [x] **Search Engine** - семантический поиск по правовой базе

#### 8.1.1 Prisma интеграция с RAG системой
- [ ] **Prisma Client Setup** - настройка и инициализация Prisma клиента
- [ ] **Database Schema Update** - обновление схемы для RAG метаданных
- [ ] **RAG-User Integration** - связывание RAG результатов с пользователями
- [ ] **Consultation Tracking** - отслеживание RAG консультаций в БД
- [ ] **Document Metadata Storage** - сохранение метаданных обработанных документов
- [ ] **AI Monitoring Integration** - мониторинг токенов, стоимости и производительности

#### 8.2 База знаний
- [ ] **Законы РФ** - ГК, ЗоЗПП, ТК, УК, СК и другие кодексы
- [ ] **Судебные прецеденты** - решения ВС РФ, арбитражных судов
- [ ] **Типовые решения** - стандартные правовые ситуации
- [ ] **Шаблоны документов** - претензии, иски, договоры, жалобы

#### 8.3 AI агенты
- [ ] **ConsumerRightsAgent** - специализация по защите прав потребителей
- [ ] **LaborLawAgent** - трудовое право и споры
- [ ] **CivilLawAgent** - гражданское право и сделки
- [ ] **CriminalLawAgent** - уголовное право (базовые консультации)
- [ ] **FamilyLawAgent** - семейное право и разводы
- [ ] **TaxLawAgent** - налоговое право и споры

#### 8.4 Генерация документов
- [ ] **Template Engine** - система шаблонов с переменными
- [ ] **Document Validator** - проверка юридической корректности
- [ ] **Legal References** - автоматическое добавление ссылок на законы
- [ ] **Format Export** - экспорт в DOCX, PDF, RTF

#### 8.5 Интеграция с TimeWeb Cloud
- [ ] **Vector Database** - настройка векторной БД в TimeWeb
- [ ] **API Integration** - интеграция с TimeWeb AI сервисами
- [ ] **Scalability** - масштабирование для больших объемов данных
- [ ] **Performance** - оптимизация скорости поиска

### Phase 9 — Продвинутые AI функции

#### 9.1 Многоагентная система
- [ ] **Agent Orchestrator** - координация между агентами
- [ ] **Collaborative Reasoning** - совместное решение сложных вопросов
- [ ] **Context Sharing** - обмен контекстом между агентами
- [ ] **Quality Assurance** - проверка качества ответов

#### 9.2 Машинное обучение
- [ ] **Precedent Learning** - обучение на судебных прецедентах
- [ ] **Pattern Recognition** - выявление паттернов в правовых ситуациях
- [ ] **Outcome Prediction** - прогнозирование исхода дел
- [ ] **Continuous Learning** - непрерывное улучшение модели

#### 9.3 Персонализация
- [ ] **User Profiles** - профили пользователей с предпочтениями
- [ ] **Learning History** - история обучения и консультаций
- [ ] **Custom Templates** - персонализированные шаблоны
- [ ] **Adaptive Responses** - адаптация ответов под пользователя

### Phase 10 — Интеграции и расширения

#### 10.1 Внешние сервисы
- [ ] **Судебные базы** - интеграция с ГАС "Правосудие"
- [ ] **Нотариальные базы** - доступ к реестрам нотариусов
- [ ] **Госуслуги** - интеграция с порталом госуслуг
- [ ] **Банковские API** - проверка платежей и статусов

#### 10.2 Мобильные функции
- [ ] **Push Notifications** - уведомления о статусе дел
- [ ] **Offline Mode** - работа без интернета
- [ ] **Voice Input** - голосовой ввод вопросов
- [ ] **Document Scanning** - сканирование документов камерой

#### 10.3 Аналитика и мониторинг
- [ ] **Usage Analytics** - аналитика использования
- [ ] **Performance Monitoring** - мониторинг производительности
- [ ] **Error Tracking** - отслеживание ошибок
- [ ] **A/B Testing** - тестирование новых функций

## 📋 Следующие задачи

### Приоритет 1 (Критический) - Phase 7.3
1. **Prisma Client Setup** - настройка и инициализация Prisma клиента
2. **Database Connection** - подключение к PostgreSQL/TimeWeb Cloud
3. **Schema Migration** - миграция существующей схемы
4. **API Integration** - интеграция Prisma с API роутами

### Приоритет 2 (Важный) - Phase 7.5
5. **Consultation Storage** - сохранение консультаций в БД
6. **Document Metadata** - метаданные документов
7. **Dispute Management** - управление спорами
8. **Payment Tracking** - отслеживание платежей

### Приоритет 3 (Важный) - Phase 8.1.1
9. **RAG-User Integration** - связывание RAG результатов с пользователями
10. **Consultation Tracking** - отслеживание RAG консультаций в БД
11. **Document Metadata Storage** - сохранение метаданных обработанных документов
12. **AI Monitoring Integration** - мониторинг токенов, стоимости и производительности

### Приоритет 4 (Желательный) - Phase 8.2-8.3
13. **База знаний** - наполнить базу законами РФ и прецедентами
14. **AI агенты** - реализовать специализированных агентов по областям права
15. **Template Engine** - система шаблонов с переменными

### Phase 7 (Завершение текущей фазы)
16. **Платежи** - segmented control и sticky CTA
17. **Telegram интеграция** - MainButton, улучшенные haptics
18. **Уведомления** - статус операций в реальном времени

## 🎯 Технические требования

### Архитектура
- **Next.js 15** - App Router, Server Components
- **TypeScript** - строгая типизация без `any`
- **Tailwind CSS** - utility-first стилизация
- **Telegram WebApp SDK** - интеграция с платформой

### AI и RAG система
- **OpenAI GPT-4** - основная языковая модель
- **Claude 3.5 Sonnet** - специализированные задачи
- **TimeWeb Cloud** - векторная база данных и эмбеддинги
- **Vector Search** - семантический поиск по базе знаний
- **Multi-Agent System** - координация AI агентов

### База данных
- **PostgreSQL** - основная реляционная БД (TimeWeb Cloud)
- **Prisma ORM** - типобезопасный доступ к БД
- **Connection Pooling** - пул соединений для производительности
- **Database Migrations** - версионирование схемы БД

### База знаний
- **Vector Database** - хранение эмбеддингов (TimeWeb)
- **Object Storage** - хранение правовых документов (S3/TimeWeb)
- **Search Index** - индексация для быстрого поиска
- **Document Processing** - обработка и чанкинг документов

### Производительность
- **Lighthouse Score** - >90 для мобильных устройств
- **First Contentful Paint** - <2 секунд
- **Cumulative Layout Shift** - <0.1
- **Bundle Size** - <500KB gzipped

### Доступность
- **WCAG 2.1 AA** - соответствие стандартам
- **Touch targets** - минимум 44×44px
- **Screen readers** - поддержка ассистивных технологий
- **Keyboard navigation** - полная навигация с клавиатуры

## 📊 Метрики успеха

### Пользовательский опыт
- **Время загрузки** - <3 секунд на 3G
- **Успешность операций** - >95% для критических действий
- **Отзывчивость** - <100ms для интерактивных элементов
- **Совместимость** - работа на iOS/Android Telegram

### AI и RAG качество
- **Точность ответов** - >90% юридически корректных ответов
- **Время поиска** - <2 секунд для RAG запросов
- **Релевантность** - >85% релевантных результатов поиска
- **Покрытие базы знаний** - >95% основных правовых областей

### Техническое качество
- **TypeScript coverage** - 100% без `any` типов
- **ESLint errors** - 0 критических ошибок
- **Build success** - стабильные сборки без ошибок
- **Code coverage** - >80% для критических компонентов
- **AI Response Time** - <5 секунд для генерации документов
- **Vector Search Accuracy** - >90% точность семантического поиска

### База данных
- **Query Performance** - <100ms для простых запросов
- **Connection Pool** - 95%+ доступность соединений
- **Migration Success** - 100% успешных миграций
- **Data Integrity** - 0 потерь данных
- **Backup Frequency** - ежедневные бэкапы
- **Prisma Type Safety** - 100% типобезопасность

---

## 🔧 Детальный план интеграции Prisma

### Phase 7.3 - Prisma Database Integration

#### Шаг 1: Настройка Prisma Client
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
  errorFormat: 'pretty',
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

#### Шаг 2: Обновление схемы для RAG
```prisma
model RAGConsultation {
  id              String    @id @default(uuid())
  userId          String    @map("user_id")
  question        String
  answer          String?
  legalArea       String?   @map("legal_area")
  sources         Json?     // RAG источники
  confidence      Float?    // Уверенность ответа
  tokensUsed      Int       @default(0) @map("tokens_used")
  costUsd         Float?    @map("cost_usd")
  responseTimeMs  Int?      @map("response_time_ms")
  status          String    @default("pending")
  createdAt       DateTime  @default(now()) @map("created_at")
  completedAt     DateTime? @map("completed_at")
  
  user            User      @relation(fields: [userId], references: [id])
  aiMonitoring    AiMonitoring[]
  
  @@map("rag_consultations")
}

model ProcessedDocument {
  id              String    @id @default(uuid())
  userId          String    @map("user_id")
  originalName    String    @map("original_name")
  s3Key           String    @map("s3_key")
  fileSize        Int       @map("file_size")
  mimeType        String    @map("mime_type")
  chunksCount     Int       @map("chunks_count")
  legalArea       String?   @map("legal_area")
  documentType    String?   @map("document_type")
  processingStatus String   @default("pending") @map("processing_status")
  vectorDbIds     String[]  @map("vector_db_ids")
  createdAt       DateTime  @default(now()) @map("created_at")
  processedAt     DateTime? @map("processed_at")
  
  user            User      @relation(fields: [userId], references: [id])
  
  @@map("processed_documents")
}
```

#### Шаг 3: Интеграция с RAG системой
```typescript
// src/lib/rag/prisma-integration.ts
export class RAGPrismaIntegration {
  async saveConsultation(
    userId: string,
    ragResult: RAGResult,
    metadata: RAGMetadata
  ): Promise<string> {
    return await prisma.ragConsultation.create({
      data: {
        userId,
        question: ragResult.question,
        answer: ragResult.answer,
        legalArea: ragResult.legalArea,
        sources: ragResult.sources,
        confidence: ragResult.confidence,
        tokensUsed: metadata.tokensUsed,
        costUsd: metadata.costUsd,
        responseTimeMs: metadata.responseTimeMs,
        status: 'completed'
      }
    }).then(result => result.id);
  }
}
```

#### Шаг 4: API роуты с Prisma
```typescript
// src/app/api/consultations/route.ts
export async function POST(request: Request) {
  const { question, legalArea } = await request.json();
  
  // RAG запрос
  const ragResult = await ragService.query({ question, legalArea });
  
  // Сохранение в БД
  const consultation = await prisma.consultation.create({
    data: {
      userId: user.id,
      question,
      answer: ragResult.answer,
      legalArea,
      status: 'completed'
    }
  });
  
  return Response.json(consultation);
}
```

### Phase 7.4 - User Management & Authentication

#### Telegram Auth с Prisma
```typescript
// src/lib/auth/telegram-auth.ts
export async function authenticateTelegramUser(telegramData: TelegramData) {
  const user = await prisma.user.upsert({
    where: { telegramId: telegramData.id },
    update: {
      telegramUsername: telegramData.username,
      firstName: telegramData.first_name,
      lastName: telegramData.last_name,
      lastLoginAt: new Date()
    },
    create: {
      telegramId: telegramData.id,
      telegramUsername: telegramData.username,
      firstName: telegramData.first_name,
      lastName: telegramData.last_name,
      subscriptionPlan: 'free',
      isActive: true
    }
  });
  
  return user;
}
```

### Phase 7.5 - Data Persistence Layer

#### Сохранение RAG результатов
```typescript
// src/lib/rag/rag-persistence.ts
export class RAGPersistence {
  async saveRAGResult(
    userId: string,
    ragResult: RAGResult,
    documentId?: string
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Сохраняем консультацию
      const consultation = await tx.consultation.create({
        data: {
          userId,
          question: ragResult.question,
          answer: ragResult.answer,
          legalArea: ragResult.legalArea,
          status: 'completed'
        }
      });
      
      // Сохраняем мониторинг AI
      await tx.aiMonitoring.create({
        data: {
          consultationId: consultation.id,
          model: 'gpt-4',
          tokensInput: ragResult.inputTokens,
          tokensOutput: ragResult.outputTokens,
          responseTimeMs: ragResult.responseTime,
          costUsd: ragResult.cost
        }
      });
      
      // Обновляем счетчик использованных документов
      await tx.user.update({
        where: { id: userId },
        data: {
          documentsUsed: { increment: 1 }
        }
      });
    });
  }
}
```

---

**Последнее обновление:** 2024-12-19
**Версия:** 2.2.0
**Статус:** Phase 7.5 - Data Persistence Layer
