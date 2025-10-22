import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { analyzeTaxSituation, type DocumentGenerationParams } from '@/lib/tax/ai-document-generator';

// Схема валидации для анализа
const analyzeTaxSchema = z.object({
  disputeId: z.string().uuid(),
});

/**
 * POST /api/tax/analyze
 * AI-анализ налоговой ситуации
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = analyzeTaxSchema.parse(body);
    
    // Получение данных спора
    const dispute = await prisma.taxDispute.findUnique({
      where: { id: validatedData.disputeId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            telegramUsername: true,
          },
        },
        calculations: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });
    
    if (!dispute) {
      return NextResponse.json({
        success: false,
        message: 'Tax dispute not found',
      }, { status: 404 });
    }
    
    // Проверка наличия API ключа OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        message: 'AI analysis is not available. OpenAI API key is not configured.',
      }, { status: 503 });
    }
    
    // Подготовка параметров для анализа
    const params: DocumentGenerationParams = {
      documentType: 'recalculation_request',
      taxType: dispute.taxType,
      taxPeriod: dispute.period,
      taxpayerName: `${dispute.user.lastName || ''} ${dispute.user.firstName || ''}`.trim() || dispute.user.telegramUsername || 'Налогоплательщик',
      claimedAmount: Number(dispute.amount),
      calculatedAmount: dispute.calculations?.[0] ? Number(dispute.calculations[0].calculatedAmount) : Number(dispute.amount),
      difference: dispute.calculations?.[0] && dispute.calculations[0].difference 
        ? Number(dispute.calculations[0].difference)
        : 0,
      grounds: Array.isArray(dispute.grounds) ? (dispute.grounds as string[]) : [],
    };
    
    // Получение AI-анализа
    const analysis = await analyzeTaxSituation(params, dispute.userId, dispute.id);
    
    // Сохранение анализа в БД
    await prisma.taxDispute.update({
      where: { id: dispute.id },
      data: {
        aiAnalysis: {
          analyzedAt: new Date().toISOString(),
          analysis,
          parameters: {
            taxType: params.taxType,
            claimedAmount: params.claimedAmount,
            calculatedAmount: params.calculatedAmount,
            difference: params.difference,
          },
        },
      },
    });
    
    // Создание записи в таймлайне
    await prisma.taxDisputeTimeline.create({
      data: {
        disputeId: dispute.id,
        eventType: 'ai_analysis',
        description: 'Выполнен AI-анализ налоговой ситуации',
        metadata: {
          analysisPreview: analysis.substring(0, 200),
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      analysis,
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

