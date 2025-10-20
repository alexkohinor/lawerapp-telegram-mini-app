# 🧠 RAG System - Retrieval-Augmented Generation для правовой базы знаний

## 📋 Обзор

RAG система для LawerApp Telegram Mini App обеспечивает семантический поиск по правовой базе знаний и генерацию юридически точных ответов с использованием внешних сервисов TimeWeb Cloud.

## 🏗️ Архитектура

### Компоненты системы

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   RAG Service   │    │ Vector Database │    │ Object Storage  │
│   (Orchestrator)│◄──►│  (TimeWeb Cloud)│    │   (S3/TimeWeb)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Embedding Client│    │Document Processor│    │  Knowledge Base │
│  (TimeWeb Cloud)│    │   (Chunking)    │    │  (Laws, Cases)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Поток данных

1. **Загрузка документов** → Object Storage (S3/TimeWeb)
2. **Обработка документов** → Извлечение текста, чанкинг
3. **Генерация эмбеддингов** → TimeWeb Cloud Embedding Service
4. **Сохранение векторов** → TimeWeb Cloud Vector Database
5. **Семантический поиск** → Поиск по векторной БД
6. **Генерация ответов** → LLM с контекстом из найденных документов

## 🚀 Быстрый старт

### 1. Установка и настройка

```typescript
import { RAGSystemFactory, defaultRAGConfig } from '@/lib/rag';

// Создание RAG системы
const ragSystem = RAGSystemFactory.createRAGSystem(defaultRAGConfig);
const { ragService, documentProcessor } = ragSystem;

// Инициализация
await ragService.initialize();
```

### 2. Обработка документа

```typescript
import { RAGUtils } from '@/lib/rag';

const documentId = RAGUtils.generateDocumentId('law');
const metadata = {
  id: documentId,
  title: 'Гражданский кодекс РФ',
  legalArea: 'civil-law',
  documentType: 'law',
  // ... другие поля
};

const result = await documentProcessor.processDocument(
  documentId,
  fileBuffer,
  metadata,
  { chunkSize: 1000, chunkOverlap: 200 }
);
```

### 3. Поиск и генерация ответа

```typescript
const query = {
  question: 'Какие основные принципы гражданского права?',
  legalArea: 'civil-law',
  maxResults: 5,
  threshold: 0.7
};

const result = await ragService.query(query);
console.log(result.answer);
console.log(result.sources);
console.log(result.legalReferences);
```

## 📚 API Reference

### RAGService

Основной сервис для работы с RAG системой.

#### Методы

- `query(query: RAGQuery): Promise<RAGResult>` - Поиск и генерация ответа
- `searchSimilar(query: string, legalArea?: LegalArea): Promise<LegalSource[]>` - Поиск похожих документов
- `initialize(): Promise<void>` - Инициализация системы
- `getStats(): Promise<Stats>` - Получение статистики

### DocumentProcessor

Обработка больших правовых документов.

#### Методы

- `processDocument(id, file, metadata, options): Promise<ProcessingResult>` - Обработка одного документа
- `processDocumentsBatch(documents): Promise<ProcessingResult[]>` - Массовая обработка
- `getProcessingStats(): Promise<ProcessingStats>` - Статистика обработки

### VectorDBClient

Клиент для работы с векторной базой данных.

#### Методы

- `addDocument(document): Promise<void>` - Добавление документа
- `search(options): Promise<SearchResult[]>` - Поиск по векторам
- `updateDocument(id, vector, metadata): Promise<void>` - Обновление документа
- `deleteDocument(id): Promise<void>` - Удаление документа

### ObjectStorageClient

Клиент для работы с объектным хранилищем.

#### Методы

- `uploadDocument(key, file, metadata): Promise<string>` - Загрузка документа
- `downloadDocument(key): Promise<Buffer>` - Скачивание документа
- `getDocumentMetadata(key): Promise<DocumentMetadata>` - Получение метаданных
- `listDocuments(options): Promise<ListResult>` - Список документов

### EmbeddingClient

Клиент для генерации эмбеддингов.

#### Методы

- `generateEmbedding(request): Promise<EmbeddingResponse>` - Генерация одного эмбеддинга
- `generateEmbeddings(request): Promise<BatchEmbeddingResponse>` - Генерация множественных эмбеддингов
- `generateEmbeddingsBatched(texts, options): Promise<number[][]>` - Батчевая генерация

## ⚙️ Конфигурация

### Переменные окружения

```env
# TimeWeb Cloud
TIMEWEB_API_KEY=your_api_key
TIMEWEB_VECTOR_DB_ENDPOINT=https://vector-db.timeweb.cloud
TIMEWEB_OBJECT_STORAGE_ENDPOINT=https://s3.timeweb.cloud
TIMEWEB_EMBEDDING_ENDPOINT=https://embedding.timeweb.cloud

# S3/Object Storage
S3_BUCKET_NAME=lawerapp-documents
S3_REGION=ru-1
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_ENDPOINT=https://s3.timeweb.cloud

# Vector Database
VECTOR_DB_ENDPOINT=https://vector-db.timeweb.cloud
VECTOR_DB_API_KEY=your_vector_db_key
VECTOR_DB_COLLECTION=legal-documents
```

### Настройки обработки документов

```typescript
const config = {
  documentProcessing: {
    chunkSize: 1000,        // Размер чанка в символах
    chunkOverlap: 200,      // Перекрытие между чанками
    maxFileSize: 50 * 1024 * 1024, // 50MB максимум
    supportedFormats: ['pdf', 'docx', 'doc', 'txt', 'rtf']
  },
  embedding: {
    model: 'text-embedding-3-small',
    dimensions: 1536,
    maxTokens: 8191,
    batchSize: 100
  }
};
```

## 📊 Области права

Система поддерживает следующие области права:

- `consumer-rights` - Защита прав потребителей
- `labor-law` - Трудовое право
- `civil-law` - Гражданское право
- `criminal-law` - Уголовное право
- `family-law` - Семейное право
- `tax-law` - Налоговое право
- `general` - Общие вопросы

## 🔧 Утилиты

### RAGUtils

- `validateConfig(config): ValidationResult` - Валидация конфигурации
- `generateDocumentId(prefix): string` - Генерация уникального ID
- `normalizeText(text): string` - Нормализация текста
- `extractKeywords(text, maxKeywords): string[]` - Извлечение ключевых слов
- `detectLegalArea(text): LegalArea` - Определение области права
- `formatFileSize(bytes): string` - Форматирование размера файла
- `formatProcessingTime(milliseconds): string` - Форматирование времени

## 📈 Мониторинг и статистика

### Получение статистики

```typescript
const stats = await ragService.getStats();
console.log('Vector DB:', stats.vectorDb);
console.log('Object Storage:', stats.objectStorage);
console.log('Embedding:', stats.embedding);

const processingStats = await documentProcessor.getProcessingStats();
console.log('Обработано документов:', processingStats.processedDocuments);
console.log('Всего чанков:', processingStats.totalChunks);
```

### Метрики качества

- **Точность ответов** - >90% юридически корректных ответов
- **Время поиска** - <2 секунд для RAG запросов
- **Релевантность** - >85% релевантных результатов поиска
- **Покрытие базы знаний** - >95% основных правовых областей

## 🚨 Обработка ошибок

```typescript
try {
  const result = await ragService.query(query);
  // Обработка успешного результата
} catch (error) {
  if (error.message.includes('Vector DB')) {
    // Ошибка векторной БД
  } else if (error.message.includes('Embedding')) {
    // Ошибка генерации эмбеддингов
  } else {
    // Общая ошибка
  }
}
```

## 🔄 Примеры использования

### Полный пример

```typescript
import { RAGSystemFactory, RAGUtils } from '@/lib/rag';

async function fullExample() {
  // 1. Создание системы
  const ragSystem = RAGSystemFactory.createRAGSystem(defaultRAGConfig);
  const { ragService, documentProcessor } = ragSystem;

  // 2. Инициализация
  await ragService.initialize();

  // 3. Обработка документа
  const docId = RAGUtils.generateDocumentId('law');
  const result = await documentProcessor.processDocument(
    docId,
    fileBuffer,
    metadata,
    { legalArea: 'civil-law' }
  );

  // 4. Поиск
  const query = {
    question: 'Права потребителя при покупке товара',
    legalArea: 'consumer-rights'
  };
  
  const answer = await ragService.query(query);
  console.log(answer.answer);
}
```

## 🎯 Roadmap

### Phase 8.1 ✅ - Базовая RAG инфраструктура
- [x] RAG Service
- [x] Vector Store (TimeWeb Cloud)
- [x] Embedding Service
- [x] Search Engine

### Phase 8.2 🔄 - База знаний
- [ ] Законы РФ (ГК, ЗоЗПП, ТК, УК, СК)
- [ ] Судебные прецеденты
- [ ] Типовые решения
- [ ] Шаблоны документов

### Phase 8.3 🔄 - AI агенты
- [ ] ConsumerRightsAgent
- [ ] LaborLawAgent
- [ ] CivilLawAgent
- [ ] CriminalLawAgent
- [ ] FamilyLawAgent
- [ ] TaxLawAgent

## 📞 Поддержка

При возникновении проблем:

1. Проверьте конфигурацию: `RAGUtils.validateConfig(config)`
2. Проверьте статистику: `ragService.getStats()`
3. Проверьте логи в консоли
4. Убедитесь в доступности внешних сервисов TimeWeb Cloud

---

**Версия:** 1.0.0  
**Последнее обновление:** 2024-12-19  
**Статус:** Phase 8.1 - Базовая RAG инфраструктура ✅
