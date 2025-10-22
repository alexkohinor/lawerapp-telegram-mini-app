import { NextRequest, NextResponse } from 'next/server';
import { getPromptStatistics } from '@/lib/tax/ai-prompt-service';

/**
 * GET /api/admin/prompts/[id]/stats
 * Получение статистики промпта
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    // TODO: Добавить проверку прав админа
    
    const promptId = resolvedParams.id;
    
    const statistics = await getPromptStatistics(promptId);
    
    if (!statistics) {
      return NextResponse.json({
        success: false,
        message: 'Prompt not found',
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      ...statistics,
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

