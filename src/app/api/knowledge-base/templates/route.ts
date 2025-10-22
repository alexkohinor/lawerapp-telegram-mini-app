/**
 * API роут для работы с шаблонами документов
 * GET /api/knowledge-base/templates
 * POST /api/knowledge-base/templates
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LegalKnowledgeService } from '@/lib/knowledge-base/legal-knowledge-service';
import { defaultRAGConfig } from '@/lib/rag/config';

// Схема валидации для получения шаблонов
const getTemplatesSchema = z.object({
  category: z.string().optional(),
  type: z.enum(['claim', 'lawsuit', 'contract', 'complaint', 'petition']).optional(),
});

// Схема валидации для создания шаблона
const createTemplateSchema = z.object({
  name: z.string().min(1, 'Название шаблона обязательно'),
  type: z.enum(['claim', 'lawsuit', 'contract', 'complaint', 'petition']),
  category: z.string().min(1, 'Категория обязательна'),
  template: z.string().min(1, 'Содержимое шаблона обязательно'),
  variables: z.array(z.object({
    name: z.string(),
    type: z.enum(['text', 'date', 'number', 'select']),
    required: z.boolean(),
    description: z.string(),
    options: z.array(z.string()).optional(),
    defaultValue: z.string().optional(),
  })),
  description: z.string().optional(),
  examples: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');

    // Валидация параметров
    const validatedData = getTemplatesSchema.parse({
      category: category || undefined,
      type: (type as 'claim' | 'lawsuit' | 'contract' | 'complaint' | 'petition') || undefined,
    });

    // Инициализация сервиса базы знаний
    const knowledgeService = new LegalKnowledgeService(defaultRAGConfig);

    // Получение шаблонов
    const templates = await knowledgeService.getDocumentTemplates(
      validatedData.category
    );

    // Фильтрация по типу, если указан
    let filteredTemplates = templates;
    if (validatedData.type) {
      filteredTemplates = templates.filter(t => t.type === validatedData.type);
    }

    return NextResponse.json({
      success: true,
      templates: filteredTemplates.map(template => ({
        id: template.id,
        name: template.name,
        type: template.type,
        category: template.category,
        description: template.description,
        variables: template.variables,
        examples: template.examples,
      })),
      total: filteredTemplates.length,
    });

  } catch (error) {
    console.error('Ошибка получения шаблонов документов:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные параметры запроса', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTemplateSchema.parse(body);

    // Инициализация сервиса базы знаний
    const knowledgeService = new LegalKnowledgeService(defaultRAGConfig);

    // Создание нового шаблона
    const newTemplate = {
      id: `template-${Date.now()}`,
      name: validatedData.name,
      type: validatedData.type,
      category: validatedData.category,
      template: validatedData.template,
      variables: validatedData.variables,
      description: validatedData.description || '',
      examples: validatedData.examples || [],
    };

    // Сохранение шаблона в S3
    await knowledgeService.saveDocumentTemplate(newTemplate);

    return NextResponse.json({
      success: true,
      message: 'Шаблон успешно создан',
      template: {
        id: newTemplate.id,
        name: newTemplate.name,
        type: newTemplate.type,
        category: newTemplate.category,
        description: newTemplate.description,
        variables: newTemplate.variables,
        examples: newTemplate.examples,
      },
    });

  } catch (error) {
    console.error('Ошибка создания шаблона документа:', error);
    
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
