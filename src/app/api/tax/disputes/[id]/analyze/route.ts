import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeTaxRequirement, type TaxAnalysisRequest } from '@/lib/tax/ai-tax-analyzer';

/**
 * POST /api/tax/disputes/[id]/analyze
 * Выполнение углубленного AI-анализа налогового спора
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const disputeId = resolvedParams.id;
    
    // Получение данных спора
    const dispute = await prisma.taxDispute.findUnique({
      where: { id: disputeId },
      include: {
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
    
    // Подготовка данных для анализа
    const analysisRequest: TaxAnalysisRequest = {
      disputeId: dispute.id,
      taxType: dispute.taxType,
      taxPeriod: dispute.period,
      claimedAmount: Number(dispute.amount),
      calculatedAmount: dispute.calculations?.[0] 
        ? Number(dispute.calculations[0].calculatedAmount) 
        : undefined,
      grounds: Array.isArray(dispute.grounds) ? (dispute.grounds as string[]) : [],
      
      // Детали требования
      taxNotice: {
        taxBase: dispute.calculations?.[0] 
          ? Number((dispute.calculations[0].parameters as Record<string, unknown>)?.taxBase || 0)
          : undefined,
        rate: dispute.calculations?.[0]
          ? Number(dispute.calculations[0].rate)
          : undefined,
        penalties: Number(dispute.penaltyAmount) || undefined,
        fines: Number(dispute.fineAmount) || undefined,
      },
      
      // Данные налогоплательщика (можно расширить)
      taxpayerData: {
        ownershipPeriod: dispute.calculations?.[0]
          ? Number((dispute.calculations[0].parameters as Record<string, unknown>)?.ownershipMonths || 12)
          : 12,
      },
    };
    
    // Выполнение AI-анализа
    const analysis = await analyzeTaxRequirement(analysisRequest, dispute.userId);
    
    return NextResponse.json({
      success: true,
      analysis,
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
 * GET /api/tax/disputes/[id]/analyze
 * Получение сохраненного анализа спора
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const disputeId = resolvedParams.id;
    
    const dispute = await prisma.taxDispute.findUnique({
      where: { id: disputeId },
      select: {
        id: true,
        taxType: true,
        period: true,
        amount: true,
        successRate: true,
        aiAnalysis: true,
        status: true,
      },
    });
    
    if (!dispute) {
      return NextResponse.json({
        success: false,
        message: 'Tax dispute not found',
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      dispute: {
        id: dispute.id,
        taxType: dispute.taxType,
        period: dispute.period,
        amount: dispute.amount,
        status: dispute.status,
        successRate: dispute.successRate,
        aiAnalysis: dispute.aiAnalysis,
        hasAnalysis: !!dispute.aiAnalysis,
      },
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

