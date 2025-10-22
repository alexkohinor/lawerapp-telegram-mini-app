import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  getAllPrompts, 
  createPrompt, 
  updatePrompt, 
  getPromptStatistics 
} from '@/lib/tax/ai-prompt-service';

// Схема валидации для создания промпта
const createPromptSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  promptType: z.enum(['system', 'user', 'document_generation', 'analysis']),
  category: z.string().optional(),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.3),
  maxTokens: z.number().min(100).max(4000).default(3000),
  model: z.string().default('gpt-4'),
  isDefault: z.boolean().default(false),
});

// Схема валидации для обновления промпта
const updatePromptSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).optional(),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(100).max(4000).optional(),
  model: z.string().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

/**
 * GET /api/admin/prompts
 * Получение всех промптов
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Добавить проверку прав админа
    // const isAdmin = await checkAdminAccess(request);
    // if (!isAdmin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    
    const prompts = await getAllPrompts();
    
    return NextResponse.json({
      success: true,
      prompts,
      total: prompts.length,
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

/**
 * POST /api/admin/prompts
 * Создание нового промпта
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Добавить проверку прав админа
    
    const body = await request.json();
    const validatedData = createPromptSchema.parse(body);
    
    const prompt = await createPrompt(validatedData);
    
    return NextResponse.json({
      success: true,
      prompt,
    }, { status: 201 });
    
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation Error',
        errors: error.issues,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/prompts
 * Обновление промпта
 */
export async function PATCH(request: NextRequest) {
  try {
    // TODO: Добавить проверку прав админа
    
    const body = await request.json();
    const validatedData = updatePromptSchema.parse(body);
    
    const { id, ...updateData } = validatedData;
    
    const prompt = await updatePrompt(id, updateData);
    
    return NextResponse.json({
      success: true,
      prompt,
    });
    
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation Error',
        errors: error.issues,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

