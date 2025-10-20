# 🗄️ Архитектура хранения данных LawerApp

## 📋 Обзор

Данный документ описывает архитектуру хранения данных в LawerApp Telegram Mini App, включая векторную базу данных, диалоги с AI и персональные данные клиентов с соблюдением требований 152-ФЗ.

## 🏗️ Общая архитектура

```
┌─────────────────────────────────────────────────────────────────┐
│                    LawerApp Data Architecture                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   Telegram      │    │   Next.js App   │    │   TimeWeb    │ │
│  │   Mini App      │◄──►│   (Frontend)    │◄──►│   Cloud      │ │
│  │   (Client)      │    │                 │    │   Services   │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│           │                       │                       │      │
│           │                       │                       │      │
│           ▼                       ▼                       ▼      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   Local Storage │    │   API Routes    │    │   PostgreSQL │ │
│  │   (Session)     │    │   (Backend)     │    │   Database   │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│                                 │                       │      │
│                                 │                       │      │
│                                 ▼                       ▼      │
│                          ┌─────────────────┐    ┌──────────────┐ │
│                          │   Redis Cache   │    │ Vector Store │ │
│                          │   (Sessions)    │    │ (Knowledge)  │ │
│                          └─────────────────┘    └──────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🗃️ Компоненты хранения данных

### 1. **TimeWeb Cloud PostgreSQL** - Основная база данных

**Назначение**: Хранение всех персональных данных, диалогов, споров и метаданных

**Структура данных**:

```sql
-- Пользователи (шифрованные данные)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    first_name_encrypted BYTEA NOT NULL,
    last_name_encrypted BYTEA,
    username_encrypted BYTEA,
    email_encrypted BYTEA,
    phone_encrypted BYTEA,
    subscription_status VARCHAR(50) DEFAULT 'free',
    consultation_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    data_retention_until TIMESTAMP WITH TIME ZONE
);

-- Диалоги с AI (шифрованные)
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    query_encrypted BYTEA NOT NULL,
    response_encrypted BYTEA NOT NULL,
    context JSONB,
    confidence DECIMAL(3,2),
    agent_used VARCHAR(100),
    tokens_used INTEGER,
    cost DECIMAL(10,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '2 years')
);

-- Споры (шифрованные)
CREATE TABLE disputes (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title_encrypted BYTEA NOT NULL,
    description_encrypted BYTEA NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    priority VARCHAR(20) DEFAULT 'medium',
    amount DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'RUB',
    deadline TIMESTAMP WITH TIME ZONE,
    tags JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Документы (шифрованные)
CREATE TABLE documents (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE,
    title_encrypted BYTEA NOT NULL,
    content_encrypted BYTEA NOT NULL,
    type VARCHAR(50) NOT NULL,
    generated_by_ai BOOLEAN DEFAULT FALSE,
    ai_model VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Аудит доступа к данным
CREATE TABLE data_access_audit (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Безопасность**:
- Шифрование на уровне базы данных (TDE)
- Шифрование чувствительных полей (AES-256)
- Автоматическое удаление по истечении срока хранения
- Аудит всех операций с данными

### 2. **TimeWeb Cloud Vector Store** - Векторная база знаний

**Назначение**: Хранение эмбеддингов правовых документов для RAG системы

**Структура данных**:

```json
{
  "vector_store": {
    "name": "legal_knowledge_base",
    "dimensions": 1536,
    "metric": "cosine",
    "collections": {
      "civil_law": {
        "documents": 500,
        "chunks": 5000,
        "last_updated": "2024-10-16T10:00:00Z"
      },
      "consumer_protection": {
        "documents": 200,
        "chunks": 2000,
        "last_updated": "2024-10-16T10:00:00Z"
      },
      "labor_law": {
        "documents": 300,
        "chunks": 3000,
        "last_updated": "2024-10-16T10:00:00Z"
      }
    }
  }
}
```

**Содержимое**:
- Эмбеддинги правовых документов (анонимные)
- Метаданные документов (тип, область права, дата обновления)
- Индексы для быстрого поиска
- Без персональных данных пользователей

**Обновление**:
- Еженедельное обновление из официальных источников
- Автоматическая индексация новых документов
- Версионирование изменений

### 3. **TimeWeb Cloud Redis** - Кэширование и сессии

**Назначение**: Временное хранение сессий, кэш AI ответов, очереди задач

**Структура данных**:

```redis
# Сессии пользователей (TTL: 24 часа)
session:{session_id} -> {
  "user_id": "uuid",
  "telegram_data": "encrypted_data",
  "last_activity": "timestamp",
  "expires_at": "timestamp"
}

# Кэш AI ответов (TTL: 1 час)
ai_cache:{query_hash} -> {
  "response": "encrypted_response",
  "confidence": 0.95,
  "sources": ["source1", "source2"],
  "created_at": "timestamp"
}

# Очереди задач
ai_queue -> [
  "consultation_request_1",
  "document_generation_2",
  "analysis_request_3"
]

# Статистика (TTL: 1 день)
stats:daily:{date} -> {
  "consultations": 150,
  "documents_generated": 25,
  "active_users": 45
}
```

**Безопасность**:
- Шифрование данных в покое
- Автоматическое удаление по TTL
- Без персональных данных в кэше
- Мониторинг использования памяти

## 🔐 Меры безопасности

### 1. **Шифрование данных**

```typescript
// Пример шифрования персональных данных
import crypto from 'crypto';

class DataEncryption {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY = process.env.ENCRYPTION_KEY;

  static encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.ALGORITHM, this.KEY);
    cipher.setAAD(Buffer.from('lawerapp'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  static decrypt(encryptedData: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipher(this.ALGORITHM, this.KEY);
    decipher.setAAD(Buffer.from('lawerapp'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### 2. **Соответствие 152-ФЗ**

```typescript
// Управление согласиями на обработку ПД
interface ConsentManagement {
  // Получение согласия
  requestConsent(userId: string, dataTypes: string[]): Promise<ConsentRecord>;
  
  // Проверка согласия
  checkConsent(userId: string, dataType: string): Promise<boolean>;
  
  // Отзыв согласия
  revokeConsent(userId: string, dataType: string): Promise<void>;
  
  // Удаление данных
  deleteUserData(userId: string): Promise<void>;
  
  // Экспорт данных
  exportUserData(userId: string): Promise<UserDataExport>;
}

// Аудит доступа к данным
class DataAccessAudit {
  static async logAccess(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    metadata: Record<string, any>
  ): Promise<void> {
    await db.dataAccessAudit.create({
      data: {
        userId,
        action,
        resourceType,
        resourceId,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        timestamp: new Date(),
      },
    });
  }
}
```

### 3. **Zero Trust Architecture**

```typescript
// Многофакторная аутентификация
class AuthenticationService {
  static async verifyUser(telegramData: TelegramInitData): Promise<User> {
    // 1. Проверка подписи Telegram
    const isValidTelegram = await this.verifyTelegramSignature(telegramData);
    if (!isValidTelegram) throw new Error('Invalid Telegram data');
    
    // 2. Проверка временных меток
    const isNotExpired = this.checkTimestamp(telegramData.auth_date);
    if (!isNotExpired) throw new Error('Expired authentication');
    
    // 3. Проверка IP адреса
    const isAllowedIP = await this.checkIPWhitelist(telegramData.ip);
    if (!isAllowedIP) throw new Error('IP not allowed');
    
    // 4. Создание сессии
    const session = await this.createSecureSession(telegramData.user);
    
    return session;
  }
}

// Минимальные привилегии доступа
class AccessControl {
  static async checkPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    const user = await this.getUser(userId);
    const permissions = await this.getUserPermissions(user.id);
    
    return permissions.some(p => 
      p.resource === resource && 
      p.actions.includes(action) &&
      p.isActive
    );
  }
}
```

## 📊 Мониторинг и логирование

### 1. **Метрики производительности**

```typescript
// Мониторинг базы данных
class DatabaseMonitoring {
  static async getMetrics(): Promise<DatabaseMetrics> {
    return {
      connectionPool: await this.getConnectionPoolStats(),
      queryPerformance: await this.getSlowQueries(),
      storageUsage: await this.getStorageUsage(),
      backupStatus: await this.getBackupStatus(),
    };
  }
}

// Мониторинг AI сервисов
class AIMonitoring {
  static async getMetrics(): Promise<AIMetrics> {
    return {
      responseTime: await this.getAverageResponseTime(),
      tokenUsage: await this.getTokenUsage(),
      errorRate: await this.getErrorRate(),
      costPerRequest: await this.getCostMetrics(),
    };
  }
}
```

### 2. **Алерты безопасности**

```typescript
// Система алертов
class SecurityAlerts {
  static async checkAnomalies(): Promise<void> {
    // Проверка подозрительной активности
    const suspiciousActivity = await this.detectSuspiciousActivity();
    if (suspiciousActivity.length > 0) {
      await this.sendSecurityAlert(suspiciousActivity);
    }
    
    // Проверка превышения лимитов
    const rateLimitViolations = await this.checkRateLimits();
    if (rateLimitViolations.length > 0) {
      await this.sendRateLimitAlert(rateLimitViolations);
    }
  }
}
```

## 🔄 Резервное копирование

### 1. **Стратегия бэкапов**

```yaml
# Конфигурация резервного копирования
backup_strategy:
  postgresql:
    frequency: "daily"
    retention: "30 days"
    encryption: "AES-256"
    compression: "gzip"
    location: "TimeWeb Cloud Storage"
    
  vector_store:
    frequency: "weekly"
    retention: "12 weeks"
    incremental: true
    location: "TimeWeb Cloud Storage"
    
  redis:
    frequency: "hourly"
    retention: "7 days"
    snapshot: true
    location: "TimeWeb Cloud Storage"
```

### 2. **Тестирование восстановления**

```typescript
// Автоматическое тестирование восстановления
class BackupTesting {
  static async testRestore(): Promise<void> {
    // 1. Создание тестовой среды
    const testEnvironment = await this.createTestEnvironment();
    
    // 2. Восстановление из бэкапа
    await this.restoreFromBackup(testEnvironment);
    
    // 3. Проверка целостности данных
    const integrityCheck = await this.verifyDataIntegrity(testEnvironment);
    
    // 4. Очистка тестовой среды
    await this.cleanupTestEnvironment(testEnvironment);
    
    if (!integrityCheck.isValid) {
      throw new Error('Backup restore test failed');
    }
  }
}
```

## 📈 Масштабирование

### 1. **Горизонтальное масштабирование**

```typescript
// Шардирование данных
class DataSharding {
  static getShard(userId: string): string {
    const hash = crypto.createHash('md5').update(userId).digest('hex');
    const shardNumber = parseInt(hash.substring(0, 8), 16) % 4;
    return `shard_${shardNumber}`;
  }
  
  static async getConnection(userId: string): Promise<DatabaseConnection> {
    const shard = this.getShard(userId);
    return await this.getShardConnection(shard);
  }
}
```

### 2. **Кэширование**

```typescript
// Многоуровневое кэширование
class CacheStrategy {
  static async get(key: string): Promise<any> {
    // L1: In-memory cache
    let value = await this.l1Cache.get(key);
    if (value) return value;
    
    // L2: Redis cache
    value = await this.l2Cache.get(key);
    if (value) {
      await this.l1Cache.set(key, value, 300); // 5 minutes
      return value;
    }
    
    // L3: Database
    value = await this.database.get(key);
    if (value) {
      await this.l2Cache.set(key, value, 3600); // 1 hour
      await this.l1Cache.set(key, value, 300); // 5 minutes
    }
    
    return value;
  }
}
```

## 🎯 Заключение

Архитектура хранения данных LawerApp обеспечивает:

- ✅ **Безопасность**: Шифрование, аудит, соответствие 152-ФЗ
- ✅ **Производительность**: Кэширование, индексирование, оптимизация
- ✅ **Масштабируемость**: Шардирование, горизонтальное масштабирование
- ✅ **Надежность**: Резервное копирование, мониторинг, алерты
- ✅ **Соответствие**: 152-ФЗ, GDPR, отраслевые стандарты

Все данные хранятся в TimeWeb Cloud с применением современных технологий безопасности и соответствием российскому законодательству.
