/**
 * S3 Storage Service для LawerApp
 * Использует S3 из advokat-fomin.ru
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class S3Service {
  private client: S3Client;
  private bucketName: string;

  constructor() {
    this.client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
      forcePathStyle: true, // Для TimeWeb S3
    });
    
    this.bucketName = process.env.S3_BUCKET_NAME!;
  }

  /**
   * Загружает файл в S3
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
      return `${process.env.S3_ENDPOINT}/${this.bucketName}/${key}`;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  /**
   * Получает файл из S3
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
        for await (const chunk of response.Body as any) {
          chunks.push(chunk);
        }
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error('S3 get error:', error);
      throw new Error('Failed to get file from S3');
    }
  }

  /**
   * Удаляет файл из S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('Failed to delete file from S3');
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
      console.error('S3 list error:', error);
      throw new Error('Failed to list files from S3');
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
      console.error('S3 signed URL error:', error);
      throw new Error('Failed to generate signed URL');
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
   * Очищает временные файлы старше указанного времени
   */
  async cleanupTempFiles(olderThanHours: number = 24): Promise<void> {
    try {
      const tempFiles = await this.listFiles('lawerapp/temp/');
      const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);

      for (const fileKey of tempFiles) {
        // Извлекаем timestamp из имени файла
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
      console.error('S3 cleanup error:', error);
    }
  }
}

export const s3Service = new S3Service();
