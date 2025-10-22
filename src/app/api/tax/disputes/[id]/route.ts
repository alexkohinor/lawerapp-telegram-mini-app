import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Схема для обновления спора
const updateTaxDisputeSchema = z.object({
  status: z.enum(['active', 'pending_response', 'resolved', 'rejected', 'closed']).optional(),
  successRate: z.number().min(0).max(100).optional(),
  aiAnalysis: z.record(z.unknown()).optional(),
}).strict();

/**
 * GET /api/tax/disputes/[id]
 * Получение деталей налогового спора
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const disputeId = params.id;
    
    const dispute = await prisma.taxDispute.findUnique({
      where: { id: disputeId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            telegramUsername: true,
          },
        },
        documents: {
          orderBy: {
            generatedAt: 'desc',
          },
        },
        timeline: {
          orderBy: {
            eventDate: 'desc',
          },
        },
        calculations: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
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
      dispute,
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
 * PATCH /api/tax/disputes/[id]
 * Обновление налогового спора
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const disputeId = params.id;
    const body = await request.json();
    const validatedData = updateTaxDisputeSchema.parse(body);
    
    // Проверка существования спора
    const existingDispute = await prisma.taxDispute.findUnique({
      where: { id: disputeId },
    });
    
    if (!existingDispute) {
      return NextResponse.json({
        success: false,
        message: 'Tax dispute not found',
      }, { status: 404 });
    }
    
    // Подготовка данных для обновления
    const updateData: Record<string, unknown> = {};
    
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
      
      // Если статус изменился на resolved, устанавливаем resolvedAt
      if (validatedData.status === 'resolved' && !existingDispute.resolvedAt) {
        updateData.resolvedAt = new Date();
      }
    }
    
    if (validatedData.successRate !== undefined) {
      updateData.successRate = validatedData.successRate;
    }
    
    if (validatedData.aiAnalysis !== undefined) {
      updateData.aiAnalysis = validatedData.aiAnalysis;
    }
    
    // Обновление спора
    const updatedDispute = await prisma.taxDispute.update({
      where: { id: disputeId },
      data: updateData,
      include: {
        documents: true,
        timeline: {
          orderBy: {
            eventDate: 'desc',
          },
          take: 5,
        },
      },
    });
    
    // Создание записи в таймлайне при изменении статуса
    if (validatedData.status && validatedData.status !== existingDispute.status) {
      await prisma.taxDisputeTimeline.create({
        data: {
          disputeId,
          eventType: 'status_changed',
          description: `Статус изменен: ${existingDispute.status} → ${validatedData.status}`,
          metadata: {
            oldStatus: existingDispute.status,
            newStatus: validatedData.status,
          },
        },
      });
    }
    
    return NextResponse.json({
      success: true,
      dispute: updatedDispute,
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
 * DELETE /api/tax/disputes/[id]
 * Удаление налогового спора
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const disputeId = params.id;
    
    // Проверка существования спора
    const existingDispute = await prisma.taxDispute.findUnique({
      where: { id: disputeId },
    });
    
    if (!existingDispute) {
      return NextResponse.json({
        success: false,
        message: 'Tax dispute not found',
      }, { status: 404 });
    }
    
    // Удаление спора (cascade удалит связанные документы и таймлайн)
    await prisma.taxDispute.delete({
      where: { id: disputeId },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Tax dispute deleted successfully',
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

