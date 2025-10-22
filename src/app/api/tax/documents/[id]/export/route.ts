import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { exportDocument } from '@/lib/tax/document-export-service';

// Схема валидации для экспорта
const exportDocumentSchema = z.object({
  format: z.enum(['pdf', 'docx']),
});

/**
 * POST /api/tax/documents/[id]/export
 * Экспорт налогового документа в PDF или DOCX
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;
    
    // Валидация параметров
    const body = await request.json();
    const validatedData = exportDocumentSchema.parse(body);
    
    // Получение документа из БД
    const document = await prisma.taxDisputeDocument.findUnique({
      where: { id: documentId },
      include: {
        dispute: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                telegramUsername: true,
              },
            },
          },
        },
      },
    });
    
    if (!document) {
      return NextResponse.json({
        success: false,
        message: 'Document not found',
      }, { status: 404 });
    }
    
    // Подготовка метаданных
    const taxpayerName = `${document.dispute.user.lastName || ''} ${document.dispute.user.firstName || ''}`.trim() 
      || document.dispute.user.telegramUsername 
      || 'Налогоплательщик';
    
    const taxTypeLabels: Record<string, string> = {
      'transport': 'Транспортный налог',
      'property': 'Налог на имущество',
      'land': 'Земельный налог',
      'NDFL': 'НДФЛ',
      'NPD': 'Налог на профессиональный доход',
    };
    
    // Экспорт документа
    const exportResult = await exportDocument({
      documentId: document.id,
      title: document.title,
      content: document.content,
      format: validatedData.format,
      metadata: {
        taxpayerName,
        taxType: taxTypeLabels[document.dispute.taxType] || document.dispute.taxType,
        period: document.dispute.period,
        generatedAt: document.createdAt,
      },
    });
    
    if (!exportResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Export failed',
        error: exportResult.error,
      }, { status: 500 });
    }
    
    // Обновление документа в БД с информацией о S3
    await prisma.taxDisputeDocument.update({
      where: { id: documentId },
      data: {
        s3Key: exportResult.s3Key,
      },
    });
    
    // Добавление записи в таймлайн
    await prisma.taxDisputeTimeline.create({
      data: {
        disputeId: document.disputeId,
        eventType: 'document_exported',
        description: `Документ экспортирован в формат ${validatedData.format.toUpperCase()}`,
        metadata: {
          documentId: document.id,
          format: validatedData.format,
          s3Key: exportResult.s3Key,
          fileSize: exportResult.fileSize,
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        format: validatedData.format,
        s3Key: exportResult.s3Key,
        s3Url: exportResult.s3Url,
        fileSize: exportResult.fileSize,
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

/**
 * GET /api/tax/documents/[id]/export
 * Получение информации об экспортированном документе
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;
    
    const document = await prisma.taxDisputeDocument.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        title: true,
        type: true,
        s3Key: true,
        createdAt: true,
        status: true,
      },
    });
    
    if (!document) {
      return NextResponse.json({
        success: false,
        message: 'Document not found',
      }, { status: 404 });
    }
    
    // Проверка наличия экспортированного файла
    const isExported = !!document.s3Key;
    
    return NextResponse.json({
      success: true,
      document: {
        ...document,
        isExported,
        exportFormat: isExported ? (document.s3Key?.endsWith('.pdf') ? 'pdf' : 'docx') : null,
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

