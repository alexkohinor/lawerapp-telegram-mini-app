/**
 * API роут для поиска в базе знаний
 * POST /api/knowledge-base/search
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LegalKnowledgeService } from '@/lib/knowledge-base/legal-knowledge-service';
import { defaultRAGConfig } from '@/lib/rag/config';

// Схема валидации для поиска
const searchSchema = z.object({
  query: z.string().min(1, 'Запрос не может быть пустым'),
  type: z.enum(['law', 'precedent', 'template', 'all']).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().min(1).max(50).optional().default(10),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = searchSchema.parse(body);

    // Инициализация сервиса базы знаний
    const knowledgeService = new LegalKnowledgeService(defaultRAGConfig);

    // Построение фильтров
    const filters: {
      type?: string;
      category?: string;
      tags?: string[];
    } = {};

    if (validatedData.type && validatedData.type !== 'all') {
      filters.type = validatedData.type;
    }

    if (validatedData.category) {
      filters.category = validatedData.category;
    }

    if (validatedData.tags && validatedData.tags.length > 0) {
      filters.tags = validatedData.tags;
    }

    // Поиск в базе знаний
    const results = await knowledgeService.searchLegalDocuments(
      validatedData.query,
      filters
    );

    // Ограничение количества результатов
    const limitedResults = results.slice(0, validatedData.limit);

    return NextResponse.json({
      success: true,
      query: validatedData.query,
      filters,
      results: limitedResults,
      total: results.length,
      returned: limitedResults.length,
    });

  } catch (error) {
    console.error('Ошибка поиска в базе знаний:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные запроса', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const knowledgeService = new LegalKnowledgeService(defaultRAGConfig);
    const stats = await knowledgeService.getKnowledgeBaseStats();

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error('Ошибка получения статистики базы знаний:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
