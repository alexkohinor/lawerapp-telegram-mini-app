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
- [x] **Prisma Client Setup** - настройка и инициализация Prisma клиента
- [x] **Database Connection** - подключение к PostgreSQL/TimeWeb Cloud
- [x] **Schema Migration** - миграция существующей схемы
- [x] **Type Generation** - генерация TypeScript типов
- [x] **API Integration** - интеграция Prisma с API роутами
- [x] **Error Handling** - обработка ошибок базы данных
- [x] **Connection Pooling** - настройка пула соединений
- [x] **Query Optimization** - оптимизация запросов

#### 7.4 User Management & Authentication ✅
- [x] **Telegram Auth Integration** - аутентификация через Telegram
- [x] **User Profile Management** - управление профилями пользователей
- [x] **Session Management** - управление сессиями
- [x] **Subscription Tracking** - отслеживание подписок
- [x] **Usage Limits** - контроль лимитов использования

#### 7.5 Data Persistence Layer ✅
- [x] **Consultation Storage** - сохранение консультаций в БД
- [x] **Document Metadata** - метаданные документов
- [x] **Dispute Management** - управление спорами
- [x] **Payment Tracking** - отслеживание платежей
- [x] **Notification System** - система уведомлений
- [x] **Analytics Data** - аналитические данные

#### 7.6 Telegram Mini App - Статический интерфейс ✅
- [x] **Статический HTML** - полнофункциональный интерфейс без Next.js
- [x] **Telegram WebApp SDK** - полная интеграция с Telegram
- [x] **Адаптивный дизайн** - поддержка тем Telegram (светлая/темная)
- [x] **Загрузка файлов** - поддержка PDF, DOC, DOCX, изображений
- [x] **Камера** - фотографирование документов
- [x] **UI компоненты** - карточки функций, кнопки, анимации
- [x] **Обработка ошибок** - уведомления и fallback
- [x] **Производительность** - быстрая загрузка без фреймворков

#### 7.7 Платежи - Расширенная интеграция
- [ ] **Segmented control** - выбор способа оплаты
- [ ] **Sticky CTA** - фиксированная кнопка оплаты
- [ ] **История платежей** - список транзакций
- [ ] **Уведомления** - статус платежей в реальном времени

#### 7.8 Telegram интеграция
- [ ] **WebApp.MainButton** - для ключевых действий
- [ ] **WebApp.BackButton** - улучшенное управление
- [ ] **Haptic patterns** - различные типы вибрации
- [ ] **Theme switching** - динамическое переключение тем

### Phase 8 — RAG система и база знаний ✅

#### 8.1 Базовая RAG инфраструктура ✅
- [x] **RAG Service** - основной сервис для поиска по базе знаний
- [x] **Vector Store** - векторное хранилище для TimeWeb Cloud
- [x] **Embedding Service** - генерация эмбеддингов для текстов
- [x] **Search Engine** - семантический поиск по правовой базе

#### 8.1.1 Prisma интеграция с RAG системой ✅
- [x] **Prisma Client Setup** - настройка и инициализация Prisma клиента
- [x] **Database Schema Update** - обновление схемы для RAG метаданных
- [x] **RAG-User Integration** - связывание RAG результатов с пользователями
- [x] **Consultation Tracking** - отслеживание RAG консультаций в БД
- [x] **Document Metadata Storage** - сохранение метаданных обработанных документов
- [x] **AI Monitoring Integration** - мониторинг токенов, стоимости и производительности

#### 8.2 База знаний ✅
- [x] **Законы РФ** - ГК, ЗоЗПП, ТК, УК, СК и другие кодексы (8 основных)
- [x] **Судебные прецеденты** - решения ВС РФ, постановления Пленума
- [x] **Типовые решения** - стандартные правовые ситуации
- [x] **Шаблоны документов** - претензии, иски, договоры, жалобы
- [x] **LegalKnowledgeService** - сервис для работы с базой знаний
- [x] **LegalDocumentsLoader** - загрузчик правовых документов
- [x] **API Routes** - /upload, /search, /templates
- [x] **Интеграция с TimeWeb Cloud** - S3 + векторная БД

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

### Phase 9 — Защита от налоговых взысканий (новая фаза) 🆕

#### 9.1 MVP - Базовый функционал (2-3 месяца)
- [ ] **Налоговые споры** - модель данных и API для налоговых споров
- [ ] **Step Wizard** - пошаговое создание спора (5 шагов)
- [ ] **Генерация документов** - 3 типа: возражение, жалоба, уведомление
- [ ] **AI-анализ требований** - базовый анализ корректности начислений
- [ ] **Экспорт документов** - PDF/DOCX с правовым обоснованием
- [ ] **Калькулятор транспортного налога** - проверка расчетов
- [ ] **База налоговых ставок** - по регионам РФ

#### 9.2 Расширенный функционал (3-4 месяца)
- [ ] **Мониторинг уведомлений** - интеграция с ЛК налогоплательщика
- [ ] **Отслеживание дедлайнов** - календарь и напоминания
- [ ] **Таймлайн спора** - хронология обжалования
- [ ] **Калькуляторы всех налогов** - имущественный, земельный, НДФЛ, НПД
- [ ] **Расчет пеней** - автоматический расчет по ст. 75 НК РФ
- [ ] **База знаний НК РФ** - все статьи с комментариями
- [ ] **Поиск прецедентов** - аналогичные выигранные дела

#### 9.3 Автоматизация (4-5 месяцев)
- [ ] **Интеграция с ФНС API** - автоматическое получение уведомлений
- [ ] **Электронная подпись** - через Госуслуги
- [ ] **Автоматическая отправка** - документов в налоговую
- [ ] **Отслеживание статусов** - в реальном времени
- [ ] **AI-консультант** - чат-бот для правовых вопросов
- [ ] **Сообщество** - форум для обмена опытом

#### 9.4 Монетизация и масштабирование (6+ месяцев)
- [ ] **Freemium модель** - FREE, BASIC (299₽), PREMIUM (999₽)
- [ ] **Разовые услуги** - генерация документа (199₽), консультации (499₽)
- [ ] **Консультации экспертов** - интеграция с юристами
- [ ] **Страхование налоговых рисков** - партнерство со страховыми
- [ ] **B2B версия** - для бухгалтеров и налоговых консультантов
- [ ] **Интеграция с судами** - автоматическая подача исков

### Phase 10 — Продвинутые AI функции

#### 10.1 Многоагентная система
- [ ] **Agent Orchestrator** - координация между агентами
- [ ] **Collaborative Reasoning** - совместное решение сложных вопросов
- [ ] **Context Sharing** - обмен контекстом между агентами
- [ ] **Quality Assurance** - проверка качества ответов

#### 10.2 Специализированные AI агенты
- [ ] **ConsumerRightsAgent** - защита прав потребителей
- [ ] **LaborLawAgent** - трудовое право и споры
- [ ] **TaxDisputeAgent** - налоговые споры (новый агент)
- [ ] **CivilLawAgent** - гражданское право и сделки
- [ ] **FamilyLawAgent** - семейное право и разводы

#### 10.3 Машинное обучение
- [ ] **Precedent Learning** - обучение на судебных прецедентах
- [ ] **Pattern Recognition** - выявление паттернов в правовых ситуациях
- [ ] **Outcome Prediction** - прогнозирование исхода дел
- [ ] **Continuous Learning** - непрерывное улучшение модели

#### 10.4 Персонализация
- [ ] **User Profiles** - профили пользователей с предпочтениями
- [ ] **Learning History** - история обучения и консультаций
- [ ] **Custom Templates** - персонализированные шаблоны
- [ ] **Adaptive Responses** - адаптация ответов под пользователя

### Phase 11 — Интеграции и расширения

#### 11.1 Внешние сервисы
- [ ] **Судебные базы** - интеграция с ГАС "Правосудие"
- [ ] **Нотариальные базы** - доступ к реестрам нотариусов
- [ ] **Госуслуги** - интеграция с порталом госуслуг
- [ ] **Банковские API** - проверка платежей и статусов

#### 11.2 Мобильные функции
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

### 🔥 Приоритет 1 (КРИТИЧЕСКИЙ) - Phase 9.1 MVP Налоговые споры
**Срок:** 2-3 месяца | **Дедлайн:** до 1 ноября 2025
1. **Prisma Schema Extension** - модели TaxDispute, TaxDisputeDocument, TaxDisputeTimeline
2. **API Routes** - /api/tax/disputes, /api/tax/documents/generate, /api/tax/calculator
3. **Step Wizard UI** - 5-шаговый мастер создания налогового спора
4. **AI Tax Analyzer** - анализ налоговых требований и расчетов
5. **Document Generator** - генерация 3 типов документов (возражение, жалоба, уведомление)
6. **PDF/DOCX Export** - экспорт документов с правовым обоснованием
7. **Transport Tax Calculator** - калькулятор транспортного налога по регионам
8. **Tax Rates Database** - база ставок налогов по регионам РФ

### ⚡ Приоритет 2 (ВЫСОКИЙ) - Phase 8.3 и Phase 7.7
**Срок:** 1-2 месяца параллельно с Phase 9.1
9. **TaxDisputeAgent** - AI-агент для налоговых споров
10. **ConsumerRightsAgent** - AI-агент для защиты прав потребителей
11. **Платежи** - segmented control и sticky CTA для монетизации
12. **База знаний НК РФ** - загрузка статей Налогового кодекса РФ

### 📊 Приоритет 3 (ВАЖНЫЙ) - Phase 9.2 Расширенный функционал
**Срок:** 3-4 месяца после MVP
13. **Мониторинг уведомлений** - интеграция с ЛК налогоплательщика
14. **Календарь дедлайнов** - отслеживание сроков обжалования
15. **Таймлайн спора** - визуализация хронологии
16. **Калькуляторы всех налогов** - имущественный, земельный, НДФЛ, НПД, пени
17. **Поиск прецедентов** - RAG-поиск аналогичных выигранных дел
18. **Статистика успешности** - аналитика эффективности оспариваний

### 🔄 Приоритет 4 (СРЕДНИЙ) - Phase 7.8 и Phase 9.3
**Срок:** 4-5 месяцев
19. **Telegram интеграция** - MainButton, BackButton, улучшенные haptics
20. **Интеграция с ФНС API** - автоматическое получение уведомлений
21. **Электронная подпись** - интеграция с Госуслугами
22. **Автоматическая отправка** - документов в налоговую
23. **AI Tax Consultant** - чат-бот для консультаций по налогам

### 📋 Приоритет 5 (НИЗКИЙ) - Phase 9.4 и Phase 10
**Срок:** 6+ месяцев
24. **Freemium модель** - FREE, BASIC, PREMIUM тарифы
25. **Консультации экспертов** - интеграция с реальными юристами
26. **B2B версия** - для бухгалтеров и налоговых консультантов
27. **Многоагентная система** - координация между AI агентами
28. **Машинное обучение** - обучение на прецедентах и паттернах

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

### Налоговые споры (Phase 9) - Целевые метрики MVP
- **Пользователи** - 100+ за первый месяц
- **Сгенерированные документы** - 50+ за месяц
- **Успешность оспариваний** - 30%+ (обратная связь пользователей)
- **Средняя оценка** - 4.0+ звезд
- **Время генерации документа** - <30 секунд
- **Точность AI-анализа** - >80% для MVP
- **Конверсия в платящих** - >10% через 3 месяца
- **Retention Rate** - >40% через неделю

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

**Последнее обновление:** 2024-10-22
**Версия:** 4.0.0
**Статус:** Phase 8.1-8.2 ✅ | Phase 9 - Защита от налоговых взысканий 🆕 (В планировании)

## 🎉 Последние обновления

### 22 октября 2024 - Version 4.0.0
- ✅ **Phase 8.2 завершена** - База знаний полностью реализована
  - LegalKnowledgeService - сервис управления правовыми документами
  - LegalDocumentsLoader - загрузка и обработка документов
  - API Routes: /upload, /search, /templates
  - Интеграция с TimeWeb Cloud (S3 + векторная БД)
  - Загружено 8 основных законов РФ и шаблонов документов

- 🆕 **Phase 9 добавлена** - Защита от налоговых взысканий
  - Концепция разработана в ответ на изменение законодательства (1 ноября 2025)
  - MVP план: генерация документов для оспаривания налоговых требований
  - AI-анализ налоговых начислений
  - Калькуляторы налогов и пеней
  - Roadmap на 4 подфазы (MVP, Расширение, Автоматизация, Монетизация)
  
- 📚 **Документация**:
  - TAX_DISPUTE_AUTOMATION_CONCEPT.md - полная концепция (40+ страниц)
  - TAX_DISPUTE_MVP_PLAN.md - детальный план реализации (30+ страниц)
  - Обновлена дорожная карта с новыми приоритетами

- 🎯 **Приоритеты пересмотрены**:
  - Phase 9.1 (MVP налоговых споров) - КРИТИЧЕСКИЙ приоритет
  - Дедлайн: до 1 ноября 2025 года
  - Потенциал: защита миллионов налогоплательщиков
  - Монетизация: 1.5M₽/мес через год

### 21 октября 2024 - Version 3.0.0
- ✅ **Phase 7.6 завершена** - Telegram Mini App готов к использованию
  - Статический HTML интерфейс полностью функционален
  - Интеграция с Telegram WebApp SDK
  - Поддержка загрузки файлов и камеры
  - Адаптивный дизайн с темами Telegram
