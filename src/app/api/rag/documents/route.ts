/**
 * API роут для обработки документов с RAG и Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { RAGServiceWithPrisma } from '@/lib/rag/rag-service-with-prisma';
import { RAGConfig } from '@/lib/rag/config';
import { z } from 'zod';

// Схема валидации запроса
const documentProcessingRequestSchema = z.object({
  userId: z.string().uuid('Неверный формат ID пользователя'),
  originalName: z.string().min(1, 'Имя файла не может быть пустым'),
  s3Key: z.string().min(1, 'S3 ключ не может быть пустым'),
  fileSize: z.number().min(1, 'Размер файла должен быть больше 0'),
  mimeType: z.string().min(1, 'MIME тип не может быть пустым'),
  legalArea: z.string().optional(),
  documentType: z.string().optional()
});

// Конфигурация RAG
const ragConfig: RAGConfig = {
  timeweb: {
    apiKey: process.env.TIMEWEB_CLOUD_API_KEY || 'demo-key',
    vectorDbEndpoint: process.env.TIMEWEB_CLOUD_ENDPOINT || 'https://api.timeweb.cloud/vector-db',
    objectStorageEndpoint: process.env.S3_ENDPOINT || 'https://s3.timeweb.cloud',
    embeddingServiceEndpoint: process.env.EMBEDDING_ENDPOINT || 'https://api.timeweb.cloud/embedding'
  },
  objectStorage: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || 'demo-key',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'demo-secret',
    endpoint: process.env.S3_ENDPOINT || 'https://s3.timeweb.cloud',
    bucket: process.env.S3_BUCKET_NAME || 'lawerapp-legal-documents',
    region: process.env.S3_REGION || 'ru-1'
  },
  vectorDb: {
    endpoint: process.env.TIMEWEB_CLOUD_ENDPOINT || 'https://api.timeweb.cloud/vector-db',
    apiKey: process.env.TIMEWEB_CLOUD_API_KEY || 'demo-key',
    collectionName: process.env.TIMEWEB_CLOUD_COLLECTION_NAME || 'lawerapp-legal-docs',
    dimensions: 1536
  },
  embedding: {
    model: process.env.EMBEDDING_MODEL || 'text-embedding-ada-002',
    dimensions: 1536,
    maxTokens: 8192,
    batchSize: 100
  },
  documentProcessing: {
    chunkSize: 1000,
    chunkOverlap: 200,
    maxFileSize: 50 * 1024 * 1024,
    supportedFormats: ['pdf', 'docx', 'doc', 'txt', 'rtf']
  }
};

const ragService = new RAGServiceWithPrisma(ragConfig);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация запроса
    const validatedData = documentProcessingRequestSchema.parse(body);
    
    // Проверяем лимиты пользователя
    const userLimits = await ragService.checkUserLimits(validatedData.userId);
    
    if (!userLimits.canUseDocument) {
      return NextResponse.json(
        {
          error: 'Превышен лимит документов',
          details: {
            documentsUsed: userLimits.documentsUsed,
            documentsLimit: userLimits.documentsLimit,
            isPremium: userLimits.isPremium
          }
        },
        { status: 429 }
      );
    }

    // Обрабатываем документ с сохранением
    const result = await ragService.processDocumentWithPersistence(
      validatedData.userId,
      Buffer.from('mock file content'), // В реальном приложении здесь был бы файл
      {
        originalName: validatedData.originalName,
        s3Key: validatedData.s3Key,
        fileSize: validatedData.fileSize,
        mimeType: validatedData.mimeType,
        legalArea: validatedData.legalArea,
        documentType: validatedData.documentType
      },
      {
        chunkSize: 1000,
        chunkOverlap: 100,
        saveChunks: true
      }
    );

    if (result.status === 'error') {
      return NextResponse.json(
        {
          error: 'Ошибка обработки документа',
          details: result.error
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        documentId: result.documentId,
        chunksCount: result.chunksCount,
        processingTime: result.processingTime,
        userLimits: {
          documentsUsed: userLimits.documentsUsed + 1,
          documentsLimit: userLimits.documentsLimit,
          isPremium: userLimits.isPremium
        }
      }
    });

  } catch (error) {
    console.error('RAG Document Processing API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Ошибка валидации',
          details: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId обязателен' },
        { status: 400 }
      );
    }

    // Получаем обработанные документы пользователя
    const documents = await ragService.getUserProcessedDocuments(userId, limit, offset);

    return NextResponse.json({
      success: true,
      data: documents
    });

  } catch (error) {
    console.error('RAG Document History API Error:', error);
    
    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}
