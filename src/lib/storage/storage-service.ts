/**
 * Универсальный Storage Service для LawerApp
 * Автоматически выбирает между S3 и Swift Storage
 */

import { s3Service } from './s3-service';
import { swiftService } from './swift-service';

export type StorageProvider = 's3' | 'swift' | 'auto';

export interface StorageConfig {
  provider: StorageProvider;
  fallbackProvider?: StorageProvider;
}

export class StorageService {
  private config: StorageConfig;

  constructor(config: StorageConfig = { provider: 'auto' }) {
    this.config = config;
  }

  /**
   * Автоматически выбирает лучший провайдер
   */
  private async selectProvider(): Promise<'s3' | 'swift'> {
    if (this.config.provider === 'auto') {
      // Логика выбора провайдера
      // Можно добавить проверку доступности, нагрузки и т.д.
      return 's3'; // По умолчанию используем S3
    }
    
    return this.config.provider as 's3' | 'swift';
  }

  /**
   * Загружает файл с автоматическим выбором провайдера
   */
  async uploadFile(
    key: string,
    body: Buffer | Uint8Array | string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    const provider = await this.selectProvider();
    
    try {
      if (provider === 's3') {
        return await s3Service.uploadFile(key, body, contentType, metadata);
      } else {
        return await swiftService.uploadFile(key, body, contentType, metadata);
      }
    } catch (error) {
      // Fallback на другой провайдер
      if (this.config.fallbackProvider && provider !== this.config.fallbackProvider) {
        console.warn(`Primary provider ${provider} failed, trying fallback ${this.config.fallbackProvider}`);
        
        if (this.config.fallbackProvider === 's3') {
          return await s3Service.uploadFile(key, body, contentType, metadata);
        } else {
          return await swiftService.uploadFile(key, body, contentType, metadata);
        }
      }
      
      throw error;
    }
  }

  /**
   * Получает файл с автоматическим выбором провайдера
   */
  async getFile(key: string): Promise<Buffer> {
    const provider = await this.selectProvider();
    
    try {
      if (provider === 's3') {
        return await s3Service.getFile(key);
      } else {
        return await swiftService.getFile(key);
      }
    } catch (error) {
      // Fallback на другой провайдер
      if (this.config.fallbackProvider && provider !== this.config.fallbackProvider) {
        console.warn(`Primary provider ${provider} failed, trying fallback ${this.config.fallbackProvider}`);
        
        if (this.config.fallbackProvider === 's3') {
          return await s3Service.getFile(key);
        } else {
          return await swiftService.getFile(key);
        }
      }
      
      throw error;
    }
  }

  /**
   * Удаляет файл с автоматическим выбором провайдера
   */
  async deleteFile(key: string): Promise<void> {
    const provider = await this.selectProvider();
    
    try {
      if (provider === 's3') {
        await s3Service.deleteFile(key);
      } else {
        await swiftService.deleteFile(key);
      }
    } catch (error) {
      // Fallback на другой провайдер
      if (this.config.fallbackProvider && provider !== this.config.fallbackProvider) {
        console.warn(`Primary provider ${provider} failed, trying fallback ${this.config.fallbackProvider}`);
        
        if (this.config.fallbackProvider === 's3') {
          await s3Service.deleteFile(key);
        } else {
          await swiftService.deleteFile(key);
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Получает список файлов с автоматическим выбором провайдера
   */
  async listFiles(prefix: string): Promise<string[]> {
    const provider = await this.selectProvider();
    
    try {
      if (provider === 's3') {
        return await s3Service.listFiles(prefix);
      } else {
        return await swiftService.listFiles(prefix);
      }
    } catch (error) {
      // Fallback на другой провайдер
      if (this.config.fallbackProvider && provider !== this.config.fallbackProvider) {
        console.warn(`Primary provider ${provider} failed, trying fallback ${this.config.fallbackProvider}`);
        
        if (this.config.fallbackProvider === 's3') {
          return await s3Service.listFiles(prefix);
        } else {
          return await swiftService.listFiles(prefix);
        }
      }
      
      throw error;
    }
  }

  /**
   * Генерирует подписанный URL с автоматическим выбором провайдера
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const provider = await this.selectProvider();
    
    try {
      if (provider === 's3') {
        return await s3Service.getSignedUrl(key, expiresIn);
      } else {
        return await swiftService.getSignedUrl(key, expiresIn);
      }
    } catch (error) {
      // Fallback на другой провайдер
      if (this.config.fallbackProvider && provider !== this.config.fallbackProvider) {
        console.warn(`Primary provider ${provider} failed, trying fallback ${this.config.fallbackProvider}`);
        
        if (this.config.fallbackProvider === 's3') {
          return await s3Service.getSignedUrl(key, expiresIn);
        } else {
          return await swiftService.getSignedUrl(key, expiresIn);
        }
      }
      
      throw error;
    }
  }

  /**
   * Загружает документ пользователя
   */
  async uploadUserDocument(
    userId: string,
    documentId: string,
    filename: string,
    content: Buffer,
    contentType: string
  ): Promise<string> {
    const key = `lawerapp/documents/${userId}/${documentId}/${filename}`;
    return this.uploadFile(key, content, contentType, {
      userId,
      documentId,
      uploadedAt: new Date().toISOString(),
    });
  }

  /**
   * Загружает аватар пользователя
   */
  async uploadUserAvatar(
    userId: string,
    filename: string,
    content: Buffer,
    contentType: string
  ): Promise<string> {
    const key = `lawerapp/avatars/${userId}/${filename}`;
    return this.uploadFile(key, content, contentType, {
      userId,
      uploadedAt: new Date().toISOString(),
    });
  }

  /**
   * Загружает временный файл
   */
  async uploadTempFile(
    filename: string,
    content: Buffer,
    contentType: string
  ): Promise<string> {
    const key = `lawerapp/temp/${Date.now()}-${filename}`;
    return this.uploadFile(key, content, contentType, {
      uploadedAt: new Date().toISOString(),
    });
  }

  /**
   * Загружает резервную копию
   */
  async uploadBackup(
    backupId: string,
    filename: string,
    content: Buffer,
    contentType: string = 'application/gzip'
  ): Promise<string> {
    const key = `lawerapp/backups/${backupId}/${filename}`;
    return this.uploadFile(key, content, contentType, {
      backupId,
      uploadedAt: new Date().toISOString(),
      type: 'backup',
    });
  }

  /**
   * Загружает логи
   */
  async uploadLogs(
    logId: string,
    filename: string,
    content: Buffer,
    contentType: string = 'text/plain'
  ): Promise<string> {
    const key = `lawerapp/logs/${logId}/${filename}`;
    return this.uploadFile(key, content, contentType, {
      logId,
      uploadedAt: new Date().toISOString(),
      type: 'log',
    });
  }

  /**
   * Загружает метрики
   */
  async uploadMetrics(
    metricId: string,
    filename: string,
    content: Buffer,
    contentType: string = 'application/json'
  ): Promise<string> {
    const key = `lawerapp/metrics/${metricId}/${filename}`;
    return this.uploadFile(key, content, contentType, {
      metricId,
      uploadedAt: new Date().toISOString(),
      type: 'metrics',
    });
  }

  /**
   * Очищает временные файлы
   */
  async cleanupTempFiles(olderThanHours: number = 24): Promise<void> {
    try {
      const tempFiles = await this.listFiles('lawerapp/temp/');
      const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);

      for (const fileKey of tempFiles) {
        const timestampMatch = fileKey.match(/lawerapp\/temp\/(\d+)-/);
        if (timestampMatch) {
          const fileTimestamp = parseInt(timestampMatch[1]);
          if (fileTimestamp < cutoffTime) {
            await this.deleteFile(fileKey);
            console.log(`Deleted temp file: ${fileKey}`);
          }
        }
      }
    } catch (error) {
      console.error('Storage cleanup error:', error);
    }
  }

  /**
   * Проверяет доступность провайдеров
   */
  async checkProvidersHealth(): Promise<{
    s3: boolean;
    swift: boolean;
  }> {
    const health = { s3: false, swift: false };

    // Проверяем S3
    try {
      await s3Service.listFiles('health-check/');
      health.s3 = true;
    } catch (error) {
      console.warn('S3 health check failed:', error);
    }

    // Проверяем Swift
    try {
      await swiftService.listFiles('health-check/');
      health.swift = true;
    } catch (error) {
      console.warn('Swift health check failed:', error);
    }

    return health;
  }
}

// Экспортируем предварительно настроенный сервис
export const storageService = new StorageService({
  provider: 'auto',
  fallbackProvider: 'swift'
});
