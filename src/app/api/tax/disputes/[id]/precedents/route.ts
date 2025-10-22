import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { 
  findRelevantPrecedents, 
  enhanceAnalysisWithPrecedents,
  findPrecedentsByIssue 
} from '@/lib/tax/rag-precedent-finder';

// Схема валидации для поиска прецедентов
const searchPrecedentsSchema = z.object({
  issue: z.string().optional(),
  limit: z.number().int().min(1).max(20).default(5),
  minRelevance: z.number().min(0).max(1).default(0.7),
});

/**
 * POST /api/tax/disputes/[id]/precedents
 * Поиск релевантных прецедентов для налогового спора
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const disputeId = resolvedParams.id;
    
    // Валидация параметров
    const body = await request.json().catch(() => ({}));
    const validatedData = searchPrecedentsSchema.parse(body);
    
    // Получение данных спора
    const dispute = await prisma.taxDispute.findUnique({
      where: { id: disputeId },
      select: {
        taxType: true,
        period: true,
        amount: true,
        grounds: true,
        aiAnalysis: true,
      },
    });
    
    if (!dispute) {
      return NextResponse.json({
        success: false,
        message: 'Tax dispute not found',
      }, { status: 404 });
    }
    
    let precedents;
    
    if (validatedData.issue) {
      // Поиск по конкретной проблеме
      precedents = await findPrecedentsByIssue(
        validatedData.issue,
        dispute.taxType,
        validatedData.limit
      );
    } else {
      // Общий поиск прецедентов для спора
      const grounds = Array.isArray(dispute.grounds) 
        ? (dispute.grounds as string[]).join('. ') 
        : '';
      
      const searchQuery = `${dispute.taxType} налог ${dispute.period}. ${grounds}. 
        Оспаривание начисления, ошибки в расчетах, судебная практика.`;
      
      precedents = await findRelevantPrecedents({
        query: searchQuery,
        taxType: dispute.taxType,
        limit: validatedData.limit,
        minRelevance: validatedData.minRelevance,
      });
    }
    
    // Улучшение AI-анализа с прецедентами (если есть анализ)
    let enhancedAnalysis;
    if (dispute.aiAnalysis) {
      enhancedAnalysis = await enhanceAnalysisWithPrecedents(
        disputeId,
        dispute.aiAnalysis
      );
    }
    
    return NextResponse.json({
      success: true,
      precedents,
      totalFound: precedents.length,
      enhanced: enhancedAnalysis ? {
        citationsAdded: enhancedAnalysis.citationsAdded,
        enhancedArguments: enhancedAnalysis.enhancedArguments,
      } : null,
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

/**
 * GET /api/tax/disputes/[id]/precedents
 * Получение сохраненных прецедентов для спора
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
        aiAnalysis: true,
      },
    });
    
    if (!dispute) {
      return NextResponse.json({
        success: false,
        message: 'Tax dispute not found',
      }, { status: 404 });
    }
    
    const analysis = (dispute.aiAnalysis as Record<string, unknown>) || {};
    const precedents = (analysis.precedents as unknown[]) || [];
    
    return NextResponse.json({
      success: true,
      precedents,
      totalFound: precedents.length,
      foundAt: analysis.precedentsFoundAt || null,
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

