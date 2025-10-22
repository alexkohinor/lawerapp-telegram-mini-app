import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Схема валидации для создания налогового спора
const createTaxDisputeSchema = z.object({
  userId: z.string().uuid(),
  taxType: z.enum(['NDFL', 'transport', 'property', 'land', 'NPD']),
  amount: z.number().positive(),
  penaltyAmount: z.number().nonnegative().optional(),
  fineAmount: z.number().nonnegative().optional(),
  period: z.string(),
  grounds: z.array(z.string()).optional(),
  requirementDate: z.string().datetime().optional(),
  deadlineDays: z.number().int().positive().default(7), // Дней до дедлайна
  
  // Данные налогоплательщика
  taxpayerINN: z.string().optional(),
  taxpayerAddress: z.string().optional(),
  taxpayerPhone: z.string().optional(),
  
  // ИФНС
  inspectionNumber: z.string().optional(),
  inspectionName: z.string().optional(),
});

// Схема для получения списка споров
const listTaxDisputesSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(['active', 'pending_response', 'resolved', 'rejected', 'closed', 'all']).optional(),
  taxType: z.enum(['NDFL', 'transport', 'property', 'land', 'NPD', 'all']).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

/**
 * POST /api/tax/disputes
 * Создание нового налогового спора
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTaxDisputeSchema.parse(body);
    
    // Расчет общей суммы
    const totalAmount = 
      validatedData.amount + 
      (validatedData.penaltyAmount || 0) + 
      (validatedData.fineAmount || 0);
    
    // Расчет дедлайна
    const requirementDate = validatedData.requirementDate 
      ? new Date(validatedData.requirementDate)
      : new Date();
    
    const deadline = new Date(requirementDate);
    deadline.setDate(deadline.getDate() + validatedData.deadlineDays);
    
    // Создание спора
    const dispute = await prisma.taxDispute.create({
      data: {
        userId: validatedData.userId,
        taxType: validatedData.taxType,
        amount: validatedData.amount,
        penaltyAmount: validatedData.penaltyAmount,
        fineAmount: validatedData.fineAmount,
        totalAmount,
        period: validatedData.period,
        grounds: validatedData.grounds || [],
        requirementDate,
        deadline,
        taxpayerINN: validatedData.taxpayerINN,
        taxpayerAddress: validatedData.taxpayerAddress,
        taxpayerPhone: validatedData.taxpayerPhone,
        inspectionNumber: validatedData.inspectionNumber,
        inspectionName: validatedData.inspectionName,
        status: 'active',
      },
      include: {
        documents: true,
        timeline: true,
        calculations: true,
      },
    });
    
    // Создание записи в таймлайне
    await prisma.taxDisputeTimeline.create({
      data: {
        disputeId: dispute.id,
        eventType: 'created',
        description: `Налоговый спор создан: ${validatedData.taxType} за ${validatedData.period}`,
        metadata: {
          amount: validatedData.amount,
          taxType: validatedData.taxType,
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      dispute,
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
 * GET /api/tax/disputes
 * Получение списка налоговых споров
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const validatedData = listTaxDisputesSchema.parse({
      userId: searchParams.get('userId'),
      status: searchParams.get('status') || 'all',
      taxType: searchParams.get('taxType') || 'all',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    });
    
    // Построение фильтров
    const where: Record<string, unknown> = {
      userId: validatedData.userId,
    };
    
    if (validatedData.status && validatedData.status !== 'all') {
      where.status = validatedData.status;
    }
    
    if (validatedData.taxType && validatedData.taxType !== 'all') {
      where.taxType = validatedData.taxType;
    }
    
    // Получение споров
    const [disputes, total] = await Promise.all([
      prisma.taxDispute.findMany({
        where,
        include: {
          documents: {
            select: {
              id: true,
              type: true,
              status: true,
              generatedAt: true,
            },
          },
          timeline: {
            orderBy: {
              eventDate: 'desc',
            },
            take: 1,
          },
          _count: {
            select: {
              documents: true,
              timeline: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: validatedData.limit,
        skip: validatedData.offset,
      }),
      prisma.taxDispute.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      disputes,
      pagination: {
        total,
        limit: validatedData.limit,
        offset: validatedData.offset,
        hasMore: validatedData.offset + validatedData.limit < total,
      },
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

