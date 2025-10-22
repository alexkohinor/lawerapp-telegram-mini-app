import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Схема валидации для генерации документа
const generateDocumentSchema = z.object({
  disputeId: z.string().uuid(),
  documentType: z.enum(['objection', 'complaint', 'notice', 'recalculation_request']),
  templateId: z.string().uuid().optional(),
  customData: z.record(z.unknown()).optional(),
});

/**
 * POST /api/tax/documents/generate
 * Генерация налогового документа
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = generateDocumentSchema.parse(body);
    
    // Получение данных спора
    const dispute = await prisma.taxDispute.findUnique({
      where: { id: validatedData.disputeId },
      include: {
        user: {
          select: {
            id: true,
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
    
    // Получение шаблона документа
    let template = null;
    
    if (validatedData.templateId) {
      template = await prisma.taxDocumentTemplate.findUnique({
        where: { id: validatedData.templateId },
      });
    } else {
      // Автоматический выбор шаблона по типу документа и налога
      template = await prisma.taxDocumentTemplate.findFirst({
        where: {
          type: validatedData.documentType,
          category: dispute.taxType.toLowerCase(),
        },
        orderBy: {
          usageCount: 'desc', // Выбираем самый популярный шаблон
        },
      });
    }
    
    if (!template) {
      return NextResponse.json({
        success: false,
        message: 'Template not found for this document type',
      }, { status: 404 });
    }
    
    // Подготовка переменных для шаблона
    const variables = {
      // Данные налогоплательщика
      taxpayerName: `${dispute.user.lastName || ''} ${dispute.user.firstName || ''}`.trim() || dispute.user.telegramUsername || 'Налогоплательщик',
      taxpayerINN: dispute.taxpayerINN || '',
      taxpayerAddress: dispute.taxpayerAddress || '',
      taxpayerPhone: dispute.taxpayerPhone || '',
      
      // Данные ИФНС
      inspectionNumber: dispute.inspectionNumber || '',
      inspectionName: dispute.inspectionName || `ИФНС № ${dispute.inspectionNumber}`,
      inspectionCity: '', // TODO: извлечь из inspectionName
      
      // Данные о налоге
      taxType: getTaxTypeLabel(dispute.taxType),
      taxPeriod: dispute.period,
      taxAmount: Number(dispute.amount),
      penaltyAmount: Number(dispute.penaltyAmount || 0),
      fineAmount: Number(dispute.fineAmount || 0),
      totalAmount: Number(dispute.totalAmount || 0),
      
      // Основания для оспаривания
      grounds: Array.isArray(dispute.grounds) ? (dispute.grounds as string[]) : [],
      
      // Расчеты
      correctAmount: dispute.calculations?.[0] ? Number(dispute.calculations[0].calculatedAmount) : 0,
      overpaidAmount: dispute.calculations?.[0] && dispute.calculations[0].difference 
        ? Math.abs(Number(dispute.calculations[0].difference))
        : 0,
      
      // Даты
      currentDate: new Date().toLocaleDateString('ru-RU'),
      requirementDate: dispute.requirementDate 
        ? new Date(dispute.requirementDate).toLocaleDateString('ru-RU')
        : '',
      
      // Дополнительные данные от пользователя
      ...validatedData.customData,
    };
    
    // Генерация содержимого документа
    const content = await generateDocumentContent(
      template.template,
      variables,
      template.legalBasis as Record<string, unknown> | null
    );
    
    // Определение заголовка документа
    const title = getDocumentTitle(validatedData.documentType, dispute.taxType, dispute.period);
    
    // Создание документа в БД
    const document = await prisma.taxDisputeDocument.create({
      data: {
        disputeId: dispute.id,
        type: validatedData.documentType,
        title,
        content,
        templateId: template.id,
        variables,
        legalBasis: template.legalBasis || {},
        status: 'generated',
      },
    });
    
    // Обновление статистики шаблона
    await prisma.taxDocumentTemplate.update({
      where: { id: template.id },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });
    
    // Создание записи в таймлайне
    await prisma.taxDisputeTimeline.create({
      data: {
        disputeId: dispute.id,
        eventType: 'document_generated',
        description: `Документ сгенерирован: ${title}`,
        metadata: {
          documentId: document.id,
          documentType: validatedData.documentType,
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      document,
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
 * Генерация содержимого документа на основе шаблона
 */
async function generateDocumentContent(
  template: string,
  variables: Record<string, unknown>,
  legalBasis: Record<string, unknown> | null
): Promise<string> {
  // Простая замена переменных в шаблоне (для MVP)
  // В будущем можно использовать Handlebars или Mustache
  let content = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    content = content.replace(placeholder, String(value));
  }
  
  // Добавление правового обоснования
  if (legalBasis && typeof legalBasis === 'object') {
    const legalBasisArray = legalBasis as Record<string, string>;
    const legalBasisText = Object.values(legalBasisArray).join('\n');
    content = content.replace('{{legalBasis}}', legalBasisText);
  }
  
  return content;
}

/**
 * Получение человекочитаемого названия типа налога
 */
function getTaxTypeLabel(taxType: string): string {
  const labels: Record<string, string> = {
    'NDFL': 'НДФЛ (налог на доходы физических лиц)',
    'transport': 'Транспортный налог',
    'property': 'Налог на имущество физических лиц',
    'land': 'Земельный налог',
    'NPD': 'Налог на профессиональный доход (НПД)',
  };
  
  return labels[taxType] || taxType;
}

/**
 * Генерация заголовка документа
 */
function getDocumentTitle(documentType: string, taxType: string, period: string): string {
  const taxLabel = getTaxTypeLabel(taxType);
  
  const titleTemplates: Record<string, string> = {
    'objection': `Возражения на акт проверки по ${taxLabel} за ${period}`,
    'complaint': `Жалоба на решение по ${taxLabel} за ${period}`,
    'notice': `Уведомление о несогласии с решением по ${taxLabel} за ${period}`,
    'recalculation_request': `Заявление о перерасчете ${taxLabel} за ${period}`,
  };
  
  return titleTemplates[documentType] || `Документ по ${taxLabel} за ${period}`;
}

