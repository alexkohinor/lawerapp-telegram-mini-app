/**
 * Object Storage Client - клиент для работы с TimeWeb Cloud Object Storage (S3)
 * Обеспечивает хранение исходных документов и метаданных
 */

import { RAGConfig } from './config';

export interface DocumentMetadata {
  id: string;
  title: string;
  originalName: string;
  legalArea: string;
  documentType: 'law' | 'precedent' | 'template' | 'guideline';
  source: string;
  url?: string;
  tags: string[];
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  processedAt?: string;
  chunksCount?: number;
  status: 'uploaded' | 'processing' | 'processed' | 'error';
}

export interface UploadOptions {
  metadata?: Record<string, string>;
  contentType?: string;
  public?: boolean;
}

export interface ListOptions {
  prefix?: string;
  maxKeys?: number;
  continuationToken?: string;
}

export interface ListResult {
  objects: Array<{
    key: string;
    size: number;
    lastModified: string;
    etag: string;
  }>;
  isTruncated: boolean;
  nextContinuationToken?: string;
}

export class ObjectStorageClient {
  private config: RAGConfig;
  private bucket: string;
  private endpoint: string;
  private accessKeyId: string;
  private secretAccessKey: string;

  constructor(config: RAGConfig) {
    this.config = config;
    this.bucket = config.objectStorage.bucket;
    this.endpoint = config.objectStorage.endpoint;
    this.accessKeyId = config.objectStorage.accessKeyId;
    this.secretAccessKey = config.objectStorage.secretAccessKey;
  }

  /**
   * Загрузка документа в Object Storage
   */
  async uploadDocument(
    key: string,
    file: File | Buffer,
    metadata: DocumentMetadata,
    options: UploadOptions = {}
  ): Promise<string> {
    try {
      const formData = new FormData();
      
      if (file instanceof File) {
        formData.append('file', file);
      } else {
        const blob = new Blob([file]);
        formData.append('file', blob, metadata.originalName);
      }

      // Добавляем метаданные
      formData.append('metadata', JSON.stringify(metadata));
      
      if (options.metadata) {
        Object.entries(options.metadata).forEach(([key, value]) => {
          formData.append(`x-amz-meta-${key}`, value);
        });
      }

      const response = await fetch(`${this.endpoint}/${this.bucket}/${key}`, {
        method: 'PUT',
        headers: {
          'Authorization': this.getAuthHeader('PUT', key),
          'Content-Type': options.contentType || 'application/octet-stream',
          'x-amz-acl': options.public ? 'public-read' : 'private'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Ошибка загрузки документа: ${response.statusText}`);
      }

      const url = `${this.endpoint}/${this.bucket}/${key}`;
      console.log(`Документ загружен: ${url}`);
      
      return url;
    } catch (error) {
      console.error('Object Storage Upload Error:', error);
      throw new Error(`Ошибка загрузки документа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Скачивание документа из Object Storage
   */
  async downloadDocument(key: string): Promise<Buffer> {
    try {
      const response = await fetch(`${this.endpoint}/${this.bucket}/${key}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader('GET', key)
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка скачивания документа: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Object Storage Download Error:', error);
      throw new Error(`Ошибка скачивания документа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение метаданных документа
   */
  async getDocumentMetadata(key: string): Promise<DocumentMetadata | null> {
    try {
      const response = await fetch(`${this.endpoint}/${this.bucket}/${key}`, {
        method: 'HEAD',
        headers: {
          'Authorization': this.getAuthHeader('HEAD', key)
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Ошибка получения метаданных: ${response.statusText}`);
      }

      const metadataHeader = response.headers.get('x-amz-meta-document-metadata');
      if (!metadataHeader) {
        throw new Error('Метаданные документа не найдены');
      }

      return JSON.parse(metadataHeader);
    } catch (error) {
      console.error('Object Storage Metadata Error:', error);
      throw new Error(`Ошибка получения метаданных документа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Обновление метаданных документа
   */
  async updateDocumentMetadata(key: string, metadata: Partial<DocumentMetadata>): Promise<void> {
    try {
      // Получаем текущие метаданные
      const currentMetadata = await this.getDocumentMetadata(key);
      if (!currentMetadata) {
        throw new Error('Документ не найден');
      }

      // Объединяем с новыми метаданными
      const updatedMetadata = { ...currentMetadata, ...metadata };

      // Копируем объект с новыми метаданными
      const response = await fetch(`${this.endpoint}/${this.bucket}/${key}`, {
        method: 'PUT',
        headers: {
          'Authorization': this.getAuthHeader('PUT', key),
          'x-amz-copy-source': `${this.bucket}/${key}`,
          'x-amz-metadata-directive': 'REPLACE',
          'x-amz-meta-document-metadata': JSON.stringify(updatedMetadata)
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка обновления метаданных: ${response.statusText}`);
      }

      console.log(`Метаданные документа ${key} обновлены`);
    } catch (error) {
      console.error('Object Storage Update Metadata Error:', error);
      throw new Error(`Ошибка обновления метаданных: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Список документов в хранилище
   */
  async listDocuments(options: ListOptions = {}): Promise<ListResult> {
    try {
      const params = new URLSearchParams();
      if (options.prefix) params.append('prefix', options.prefix);
      if (options.maxKeys) params.append('max-keys', options.maxKeys.toString());
      if (options.continuationToken) params.append('continuation-token', options.continuationToken);

      const response = await fetch(`${this.endpoint}/${this.bucket}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader('GET', '')
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка получения списка документов: ${response.statusText}`);
      }

      const xmlText = await response.text();
      const result = this.parseListResponse(xmlText);

      return result;
    } catch (error) {
      console.error('Object Storage List Error:', error);
      throw new Error(`Ошибка получения списка документов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Удаление документа
   */
  async deleteDocument(key: string): Promise<void> {
    try {
      const response = await fetch(`${this.endpoint}/${this.bucket}/${key}`, {
        method: 'DELETE',
        headers: {
          'Authorization': this.getAuthHeader('DELETE', key)
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка удаления документа: ${response.statusText}`);
      }

      console.log(`Документ ${key} удален из Object Storage`);
    } catch (error) {
      console.error('Object Storage Delete Error:', error);
      throw new Error(`Ошибка удаления документа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Получение URL для доступа к документу
   */
  getDocumentUrl(key: string, expiresIn: number = 3600): string {
    // В реальном приложении здесь была бы генерация подписанного URL
    return `${this.endpoint}/${this.bucket}/${key}`;
  }

  /**
   * Генерация заголовка авторизации (упрощенная версия)
   */
  private getAuthHeader(method: string, key: string): string {
    // В реальном приложении здесь была бы полная реализация AWS Signature V4
    // Для демо используем простую авторизацию
    return `AWS ${this.accessKeyId}:${this.secretAccessKey}`;
  }

  /**
   * Парсинг XML ответа от S3 API
   */
  private parseListResponse(xmlText: string): ListResult {
    // Упрощенный парсинг XML для демо
    // В реальном приложении использовался бы XML парсер
    const objects: Array<{
      key: string;
      size: number;
      lastModified: string;
      etag: string;
    }> = [];

    // Простой regex парсинг для демо
    const keyMatches = xmlText.match(/<Key>(.*?)<\/Key>/g);
    const sizeMatches = xmlText.match(/<Size>(.*?)<\/Size>/g);
    const lastModifiedMatches = xmlText.match(/<LastModified>(.*?)<\/LastModified>/g);
    const etagMatches = xmlText.match(/<ETag>(.*?)<\/ETag>/g);

    if (keyMatches) {
      keyMatches.forEach((match, index) => {
        const key = match.replace(/<\/?Key>/g, '');
        const size = sizeMatches?.[index] ? parseInt(sizeMatches[index].replace(/<\/?Size>/g, '')) : 0;
        const lastModified = lastModifiedMatches?.[index]?.replace(/<\/?LastModified>/g, '') || '';
        const etag = etagMatches?.[index]?.replace(/<\/?ETag>/g, '') || '';

        objects.push({ key, size, lastModified, etag });
      });
    }

    return {
      objects,
      isTruncated: xmlText.includes('<IsTruncated>true</IsTruncated>'),
      nextContinuationToken: undefined // Упрощено для демо
    };
  }
}

export default ObjectStorageClient;
