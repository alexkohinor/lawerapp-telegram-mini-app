/**
 * API роут для статистики RAG системы
 */

import { NextRequest, NextResponse } from 'next/server';
import { RAGServiceWithPrisma } from '@/lib/rag/rag-service-with-prisma';
import { RAGConfig } from '@/lib/rag/config';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'user' | 'system'
    const userId = searchParams.get('userId');

    if (type === 'user' && userId) {
      // Статистика пользователя
      const userStats = await ragService.getUserStats(userId);
      
      return NextResponse.json({
        success: true,
        data: {
          type: 'user',
          userId,
          stats: userStats
        }
      });
    } else if (type === 'system') {
      // Статистика системы
      const systemStats = await ragService.getSystemStats();
      
      return NextResponse.json({
        success: true,
        data: {
          type: 'system',
          stats: systemStats
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Неверный тип статистики или отсутствует userId' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('RAG Stats API Error:', error);
    
    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}
