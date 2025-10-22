/**
 * API роут для загрузки правовых документов в базу знаний
 * POST /api/knowledge-base/upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LegalKnowledgeService } from '@/lib/knowledge-base/legal-knowledge-service';
import { LegalDocumentsLoader } from '@/lib/knowledge-base/legal-documents-loader';
import { defaultRAGConfig } from '@/lib/rag/config';

// Схема валидации для загрузки документов
const uploadSchema = z.object({
  documentType: z.enum(['laws', 'precedents', 'templates', 'all']),
  category: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = uploadSchema.parse(body);

    // Инициализация сервисов
    const knowledgeService = new LegalKnowledgeService(defaultRAGConfig);
    const documentsLoader = new LegalDocumentsLoader();

    let documents = [];

    // Загрузка документов в зависимости от типа
    switch (validatedData.documentType) {
      case 'laws':
        documents = await documentsLoader.loadRussianLaws();
        break;
      case 'precedents':
        documents = await documentsLoader.loadLegalPrecedents();
        break;
      case 'templates':
        documents = await documentsLoader.loadDocumentTemplates();
        break;
      case 'all':
        const laws = await documentsLoader.loadRussianLaws();
        const precedents = await documentsLoader.loadLegalPrecedents();
        const templates = await documentsLoader.loadDocumentTemplates();
        documents = [...laws, ...precedents, ...templates];
        break;
      default:
        return NextResponse.json(
          { error: 'Неверный тип документа' },
          { status: 400 }
        );
    }

    // Фильтрация по категории, если указана
    if (validatedData.category) {
      documents = documents.filter(
        doc => doc.category.id === validatedData.category
      );
    }

    // Загрузка документов в базу знаний
    await knowledgeService.uploadLegalDocuments(documents);

    return NextResponse.json({
      success: true,
      message: `Успешно загружено ${documents.length} документов`,
      documents: documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        category: doc.category.name,
      })),
    });

  } catch (error) {
    console.error('Ошибка загрузки документов в базу знаний:', error);
    
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
    const documentsLoader = new LegalDocumentsLoader();
    const categories = documentsLoader.getCategories();

    return NextResponse.json({
      success: true,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
      })),
    });

  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
