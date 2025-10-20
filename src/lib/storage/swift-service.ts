/**
 * Swift Storage Service для LawerApp
 * Альтернативное хранилище через Swift API TimeWeb Cloud
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class SwiftService {
  private client: S3Client;
  private bucketName: string;

  constructor() {
    this.client = new S3Client({
      endpoint: process.env.SWIFT_ENDPOINT,
      region: 'ru-1',
      credentials: {
        accessKeyId: process.env.SWIFT_ACCESS_KEY!,
        secretAccessKey: process.env.SWIFT_SECRET_KEY!,
      },
      forcePathStyle: true, // Для TimeWeb Swift
    });
    
    this.bucketName = process.env.S3_BUCKET_NAME!; // Используем тот же bucket
  }

  /**
   * Загружает файл в Swift Storage
   */
  async uploadFile(
    key: string,
    body: Buffer | Uint8Array | string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
        Metadata: metadata,
      });

      await this.client.send(command);
      return `${process.env.SWIFT_ENDPOINT}/${this.bucketName}/${key}`;
    } catch (error) {
      console.error('Swift upload error:', error);
      throw new Error('Failed to upload file to Swift Storage');
    }
  }

  /**
   * Получает файл из Swift Storage
   */
  async getFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.client.send(command);
      const chunks: Uint8Array[] = [];
      
            if (response.Body) {
              for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
                chunks.push(chunk);
              }
            }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error('Swift get error:', error);
      throw new Error('Failed to get file from Swift Storage');
    }
  }

  /**
   * Удаляет файл из Swift Storage
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);
    } catch (error) {
      console.error('Swift delete error:', error);
      throw new Error('Failed to delete file from Swift Storage');
    }
  }

  /**
   * Получает список файлов в папке
   */
  async listFiles(prefix: string): Promise<string[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
      });

      const response = await this.client.send(command);
      return response.Contents?.map(obj => obj.Key!) || [];
    } catch (error) {
      console.error('Swift list error:', error);
      throw new Error('Failed to list files from Swift Storage');
    }
  }

  /**
   * Генерирует подписанный URL для доступа к файлу
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      console.error('Swift signed URL error:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Загружает резервную копию данных
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
   * Загружает логи приложения
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
   * Загружает метрики и аналитику
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
}

export const swiftService = new SwiftService();
