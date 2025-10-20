/**
 * API роут для RAG консультаций с интеграцией Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { RAGServiceWithPrisma } from '@/lib/rag/rag-service-with-prisma';
import { RAGConfig } from '@/lib/rag/config';
import { z } from 'zod';

// Схема валидации запроса
const consultationRequestSchema = z.object({
  question: z.string().min(1, 'Вопрос не может быть пустым'),
  legalArea: z.string().optional(),
  userId: z.string().uuid('Неверный формат ID пользователя'),
  maxResults: z.number().min(1).max(20).optional().default(5),
  threshold: z.number().min(0).max(1).optional().default(0.7)
});

// Конфигурация RAG (в реальном приложении из env переменных)
const ragConfig: RAGConfig = {
  timeWebCloud: {
    apiKey: process.env.TIMEWEB_CLOUD_API_KEY || 'demo-key',
    endpoint: process.env.TIMEWEB_CLOUD_ENDPOINT || 'https://api.timeweb.cloud/vector-db',
    collectionName: process.env.TIMEWEB_CLOUD_COLLECTION_NAME || 'lawerapp-legal-docs'
  },
  objectStorage: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || 'demo-key',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'demo-secret',
    endpoint: process.env.S3_ENDPOINT || 'https://s3.timeweb.cloud',
    bucketName: process.env.S3_BUCKET_NAME || 'lawerapp-legal-documents'
  },
  embedding: {
    apiKey: process.env.EMBEDDING_API_KEY || 'demo-key',
    endpoint: process.env.EMBEDDING_ENDPOINT || 'https://api.timeweb.cloud/embedding',
    model: process.env.EMBEDDING_MODEL || 'text-embedding-ada-002'
  },
  llmModel: process.env.LLM_MODEL || 'gpt-4',
  llmEndpoint: process.env.LLM_ENDPOINT || 'https://api.openai.com/v1/chat/completions'
};

const ragService = new RAGServiceWithPrisma(ragConfig);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация запроса
    const validatedData = consultationRequestSchema.parse(body);
    
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

    // Выполняем RAG запрос с сохранением
    const result = await ragService.queryWithPersistence(
      {
        question: validatedData.question,
        legalArea: validatedData.legalArea as any,
        maxResults: validatedData.maxResults,
        threshold: validatedData.threshold
      },
      {
        saveToDatabase: true,
        trackUsage: true,
        userId: validatedData.userId
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        answer: result.answer,
        sources: result.sources,
        confidence: result.confidence,
        legalReferences: result.legalReferences,
        suggestedActions: result.suggestedActions,
        consultationId: result.consultationId,
        queryId: result.queryId,
        userLimits: {
          documentsUsed: userLimits.documentsUsed + 1, // +1 после использования
          documentsLimit: userLimits.documentsLimit,
          isPremium: userLimits.isPremium
        }
      }
    });

  } catch (error) {
    console.error('RAG Consultation API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Ошибка валидации',
          details: error.errors
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

    // Получаем историю консультаций пользователя
    const consultations = await ragService.getUserConsultations(userId, limit, offset);

    return NextResponse.json({
      success: true,
      data: consultations
    });

  } catch (error) {
    console.error('RAG Consultation History API Error:', error);
    
    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}
