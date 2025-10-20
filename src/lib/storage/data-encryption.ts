import crypto from 'crypto';

/**
 * Сервис шифрования персональных данных
 * Основано на DATA_STORAGE_ARCHITECTURE.md и SECURITY_GUIDELINES.md
 */

export class DataEncryption {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly TAG_LENGTH = 16;

  /**
   * Получение ключа шифрования
   */
  private static getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    
    // Создаем ключ из строки
    return crypto.scryptSync(key, 'lawerapp-salt', this.KEY_LENGTH);
  }

  /**
   * Шифрование текста
   */
  static encrypt(text: string): string {
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(this.IV_LENGTH);
      const cipher = crypto.createCipher(this.ALGORITHM, key);
      
      // Устанавливаем AAD для дополнительной безопасности
      cipher.setAAD(Buffer.from('lawerapp-pd', 'utf8'));
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      // Возвращаем в формате: iv:authTag:encrypted
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Расшифровка текста
   */
  static decrypt(encryptedData: string): string {
    try {
      const key = this.getEncryptionKey();
      const parts = encryptedData.split(':');
      
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }
      
      const [ivHex, authTagHex, encrypted] = parts;
      
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      const decipher = crypto.createDecipher(this.ALGORITHM, key);
      decipher.setAAD(Buffer.from('lawerapp-pd', 'utf8'));
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Хеширование для поиска (необратимое)
   */
  static hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Генерация безопасного случайного токена
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Проверка целостности данных
   */
  static verifyIntegrity(data: string, expectedHash: string): boolean {
    const actualHash = this.hash(data);
    return actualHash === expectedHash;
  }
}

/**
 * Сервис управления согласиями на обработку ПД
 */
export class ConsentManager {
  /**
   * Запрос согласия на обработку ПД
   */
  static async requestConsent(
    userId: string,
    dataTypes: string[],
    purpose: string
  ): Promise<ConsentRecord> {
    const consentId = DataEncryption.generateToken();
    
    const consent: ConsentRecord = {
      id: consentId,
      userId,
      dataTypes,
      purpose,
      granted: false,
      grantedAt: null,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 год
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // В реальном приложении здесь будет сохранение в базу данных
    console.log('Consent requested:', consent);
    
    return consent;
  }

  /**
   * Предоставление согласия
   */
  static async grantConsent(consentId: string): Promise<void> {
    // В реальном приложении здесь будет обновление в базе данных
    console.log('Consent granted:', consentId);
  }

  /**
   * Отзыв согласия
   */
  static async revokeConsent(consentId: string): Promise<void> {
    // В реальном приложении здесь будет обновление в базе данных
    console.log('Consent revoked:', consentId);
  }

  /**
   * Проверка согласия
   */
  static async checkConsent(userId: string, dataType: string): Promise<boolean> {
    // В реальном приложении здесь будет запрос к базе данных
    // Пока возвращаем true для демонстрации
    return true;
  }
}

/**
 * Сервис аудита доступа к данным
 */
export class DataAccessAudit {
  /**
   * Логирование доступа к данным
   */
  static async logAccess(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    metadata: {
      ipAddress?: string;
      userAgent?: string;
      timestamp?: Date;
    } = {}
  ): Promise<void> {
    const auditRecord: AuditRecord = {
      id: DataEncryption.generateToken(),
      userId,
      action,
      resourceType,
      resourceId,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      timestamp: metadata.timestamp || new Date(),
    };

    // В реальном приложении здесь будет сохранение в базу данных
    console.log('Data access logged:', auditRecord);
  }

  /**
   * Получение истории доступа
   */
  static async getAccessHistory(
    userId: string,
    limit: number = 100
  ): Promise<AuditRecord[]> {
    // В реальном приложении здесь будет запрос к базе данных
    return [];
  }
}

/**
 * Сервис управления жизненным циклом данных
 */
export class DataLifecycleManager {
  /**
   * Автоматическое удаление истекших данных
   */
  static async cleanupExpiredData(): Promise<void> {
    const now = new Date();
    
    // Удаление истекших диалогов
    await this.deleteExpiredConversations(now);
    
    // Удаление истекших сессий
    await this.deleteExpiredSessions(now);
    
    // Удаление истекших кэшей
    await this.deleteExpiredCaches(now);
  }

  /**
   * Удаление данных пользователя (право на забвение)
   */
  static async deleteUserData(userId: string): Promise<void> {
    // 1. Удаление персональных данных
    await this.deletePersonalData(userId);
    
    // 2. Анонимизация диалогов
    await this.anonymizeConversations(userId);
    
    // 3. Удаление споров
    await this.deleteDisputes(userId);
    
    // 4. Удаление документов
    await this.deleteDocuments(userId);
    
    // 5. Логирование операции
    await DataAccessAudit.logAccess(
      userId,
      'DELETE_ALL_DATA',
      'USER',
      userId,
      { timestamp: new Date() }
    );
  }

  /**
   * Экспорт данных пользователя
   */
  static async exportUserData(userId: string): Promise<UserDataExport> {
    const userData: UserDataExport = {
      userId,
      personalData: await this.getPersonalData(userId),
      conversations: await this.getConversations(userId),
      disputes: await this.getDisputes(userId),
      documents: await this.getDocuments(userId),
      exportDate: new Date(),
      format: 'JSON',
    };

    return userData;
  }

  private static async deleteExpiredConversations(now: Date): Promise<void> {
    // В реальном приложении здесь будет SQL запрос
    console.log('Deleting expired conversations before:', now);
  }

  private static async deleteExpiredSessions(now: Date): Promise<void> {
    // В реальном приложении здесь будет Redis операция
    console.log('Deleting expired sessions before:', now);
  }

  private static async deleteExpiredCaches(now: Date): Promise<void> {
    // В реальном приложении здесь будет Redis операция
    console.log('Deleting expired caches before:', now);
  }

  private static async deletePersonalData(userId: string): Promise<void> {
    console.log('Deleting personal data for user:', userId);
  }

  private static async anonymizeConversations(userId: string): Promise<void> {
    console.log('Anonymizing conversations for user:', userId);
  }

  private static async deleteDisputes(userId: string): Promise<void> {
    console.log('Deleting disputes for user:', userId);
  }

  private static async deleteDocuments(userId: string): Promise<void> {
    console.log('Deleting documents for user:', userId);
  }

  private static async getPersonalData(userId: string): Promise<any> {
    return { userId, data: 'encrypted_personal_data' };
  }

  private static async getConversations(userId: string): Promise<any[]> {
    return [];
  }

  private static async getDisputes(userId: string): Promise<any[]> {
    return [];
  }

  private static async getDocuments(userId: string): Promise<any[]> {
    return [];
  }
}

// Типы данных
interface ConsentRecord {
  id: string;
  userId: string;
  dataTypes: string[];
  purpose: string;
  granted: boolean;
  grantedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface AuditRecord {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

interface UserDataExport {
  userId: string;
  personalData: any;
  conversations: any[];
  disputes: any[];
  documents: any[];
  exportDate: Date;
  format: string;
}
