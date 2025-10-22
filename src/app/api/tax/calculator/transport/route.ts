import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Схема валидации для расчета транспортного налога
const calculateTransportTaxSchema = z.object({
  userId: z.string().uuid().optional(),
  disputeId: z.string().uuid().optional(),
  
  // Параметры ТС
  region: z.string().min(1),
  regionCode: z.string().optional(),
  vehicleType: z.enum(['car', 'motorcycle', 'truck', 'bus']),
  enginePower: z.number().positive(), // л.с.
  yearOfManufacture: z.number().int().min(1900).max(new Date().getFullYear()),
  ownershipMonths: z.number().int().min(1).max(12),
  
  // Льготы
  hasPrivilege: z.boolean().default(false),
  privilegePercent: z.number().min(0).max(100).default(50), // Процент льготы
  
  // Сравнение с начислением налоговой
  claimedAmount: z.number().optional(),
  
  // Налоговый период
  period: z.string().optional(),
});

/**
 * POST /api/tax/calculator/transport
 * Расчет транспортного налога
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = calculateTransportTaxSchema.parse(body);
    
    // Получение ставки налога для региона
    const taxRate = await getTaxRateForRegion(
      validatedData.region,
      validatedData.vehicleType,
      validatedData.enginePower,
      new Date().getFullYear() // Текущий год для MVP
    );
    
    if (!taxRate) {
      return NextResponse.json({
        success: false,
        message: 'Tax rate not found for this region and vehicle type',
        suggestion: 'Попробуйте указать другой регион или тип ТС',
      }, { status: 404 });
    }
    
    // Расчет коэффициента владения
    const ownershipCoef = validatedData.ownershipMonths / 12;
    
    // Расчет повышающего коэффициента (для дорогих авто)
    const luxuryCoef = await getLuxuryCoefficient(
      validatedData.vehicleType,
      validatedData.yearOfManufacture,
      validatedData.enginePower
    );
    
    // Базовый расчет
    const baseTax = validatedData.enginePower * Number(taxRate.rate) * ownershipCoef * luxuryCoef;
    
    // Применение льготы
    const privilegeDiscount = validatedData.hasPrivilege 
      ? (validatedData.privilegePercent / 100) 
      : 0;
    
    const calculatedAmount = baseTax * (1 - privilegeDiscount);
    
    // Сравнение с начислением налоговой
    const difference = validatedData.claimedAmount 
      ? validatedData.claimedAmount - calculatedAmount
      : null;
    
    // Сохранение расчета в БД
    let calculation = null;
    
    if (validatedData.userId) {
      calculation = await prisma.taxCalculation.create({
        data: {
          userId: validatedData.userId,
          disputeId: validatedData.disputeId,
          taxType: 'transport',
          parameters: {
            region: validatedData.region,
            regionCode: validatedData.regionCode,
            vehicleType: validatedData.vehicleType,
            enginePower: validatedData.enginePower,
            yearOfManufacture: validatedData.yearOfManufacture,
            ownershipMonths: validatedData.ownershipMonths,
            hasPrivilege: validatedData.hasPrivilege,
            privilegePercent: validatedData.privilegePercent,
            taxRateId: taxRate.id,
          },
          calculatedAmount,
          rate: taxRate.rate,
          claimedAmount: validatedData.claimedAmount,
          difference,
          region: validatedData.region,
          period: validatedData.period,
        },
      });
    }
    
    // Формирование результата
    const result = {
      baseTax: Math.round(baseTax * 100) / 100,
      calculatedAmount: Math.round(calculatedAmount * 100) / 100,
      claimedAmount: validatedData.claimedAmount,
      difference: difference ? Math.round(difference * 100) / 100 : null,
      
      // Детали расчета
      breakdown: {
        enginePower: validatedData.enginePower,
        rate: Number(taxRate.rate),
        ownershipCoef,
        luxuryCoef,
        privilegeDiscount: privilegeDiscount * 100,
      },
      
      // Метаданные
      taxRate: {
        id: taxRate.id,
        region: taxRate.region,
        vehicleType: taxRate.vehicleType,
        powerRange: `${taxRate.powerMin}-${taxRate.powerMax} л.с.`,
        rate: Number(taxRate.rate),
        year: taxRate.year,
        source: taxRate.source,
      },
      
      // Рекомендации
      recommendations: generateRecommendations(
        calculatedAmount,
        validatedData.claimedAmount,
        difference
      ),
      
      // ID расчета в БД
      calculationId: calculation?.id,
    };
    
    return NextResponse.json({
      success: true,
      result,
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
 * Получение ставки налога для региона
 */
async function getTaxRateForRegion(
  region: string,
  vehicleType: string,
  enginePower: number,
  year: number
): Promise<{
  id: string;
  region: string;
  vehicleType: string;
  powerMin: number;
  powerMax: number;
  rate: number;
  year: number;
  source: string | null;
} | null> {
  const rate = await prisma.transportTaxRate.findFirst({
    where: {
      region,
      vehicleType,
      powerMin: { lte: enginePower },
      powerMax: { gte: enginePower },
      year,
      isActive: true,
    },
    select: {
      id: true,
      region: true,
      vehicleType: true,
      powerMin: true,
      powerMax: true,
      rate: true,
      year: true,
      source: true,
    },
  });
  
  if (!rate) {
    return null;
  }
  
  return {
    ...rate,
    rate: Number(rate.rate),
  };
}

/**
 * Расчет повышающего коэффициента для дорогих авто
 * (Упрощенная версия для MVP)
 */
async function getLuxuryCoefficient(
  vehicleType: string,
  yearOfManufacture: number,
  enginePower: number
): Promise<number> {
  // Повышающий коэффициент применяется только для легковых автомобилей
  if (vehicleType !== 'car') {
    return 1.0;
  }
  
  const currentYear = new Date().getFullYear();
  const age = currentYear - yearOfManufacture;
  
  // Упрощенная логика: мощность > 250 л.с. и возраст < 3 лет
  if (enginePower > 250 && age <= 3) {
    return 1.1; // 10% повышение
  }
  
  // В реальности нужно проверять стоимость авто по справочнику Минпромторга
  // TODO: Интеграция с API Минпромторга для получения списка дорогих авто
  
  return 1.0;
}

/**
 * Генерация рекомендаций на основе расчета
 */
function generateRecommendations(
  calculatedAmount: number,
  claimedAmount: number | undefined,
  difference: number | null
): string[] {
  const recommendations: string[] = [];
  
  if (!claimedAmount || difference === null) {
    recommendations.push('Сравните рассчитанную сумму с налоговым уведомлением');
    return recommendations;
  }
  
  if (Math.abs(difference) < 100) {
    recommendations.push('Расчет налоговой корректен, расхождение минимальное');
    recommendations.push('Оспаривание может быть нецелесообразным из-за малой суммы');
  } else if (difference > 0) {
    recommendations.push(`Переплата: ${Math.round(difference)} рублей`);
    recommendations.push('Рекомендуется подать заявление о перерасчете налога');
    recommendations.push('Приложите расчет и документы, подтверждающие параметры ТС');
    
    if (difference > 1000) {
      recommendations.push('Значительная переплата! Обязательно оспорьте начисление');
    }
  } else {
    recommendations.push(`Недоплата: ${Math.round(Math.abs(difference))} рублей`);
    recommendations.push('Расчет налоговой может быть завышен');
    recommendations.push('Проверьте ставки для вашего региона и параметры ТС в базе ФНС');
  }
  
  return recommendations;
}

