/**
 * API роут для статистики RAG системы
 */

import { NextRequest, NextResponse } from 'next/server';
import { RAGServiceWithPrisma } from '@/lib/rag/rag-service-with-prisma';
import { RAGConfig } from '@/lib/rag/config';

// Конфигурация RAG
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
