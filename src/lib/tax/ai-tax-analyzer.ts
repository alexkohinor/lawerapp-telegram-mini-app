import OpenAI from 'openai';
import { getPromptByType, logPromptUsage } from './ai-prompt-service';
import { prisma } from '../prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI Tax Analyzer - Углубленный анализ налоговых требований
 * Использует OpenAI для детального разбора начислений и поиска ошибок
 */

export interface TaxAnalysisRequest {
  disputeId: string;
  taxType: string;
  taxPeriod: string;
  claimedAmount: number;
  calculatedAmount?: number;
  grounds?: string[];
  
  // Детали начисления от налоговой
  taxNotice?: {
    noticeNumber?: string;
    noticeDate?: Date;
    taxBase?: number;
    rate?: number;
    coefficients?: Record<string, number>;
    penalties?: number;
    fines?: number;
  };
  
  // Детали налогоплательщика
  taxpayerData?: {
    hasPrivileges?: boolean;
    privilegeType?: string;
    ownershipPeriod?: number; // месяцев
    vehicleAge?: number; // для транспортного
    propertyValue?: number; // для имущественного
  };
}

export interface TaxAnalysisResult {
  overallAssessment: string;
  successProbability: number; // 0-100%
  
  // Детальный анализ
  detectedErrors: TaxError[];
  proceduralViolations: ProceduralViolation[];
  legalArguments: LegalArgument[];
  
  // Рекомендации
  recommendedActions: RecommendedAction[];
  estimatedTimeline: string;
  estimatedCosts: {
    courtFees?: number;
    expertiseСosts?: number;
    totalEstimated: number;
  };
  
  // Риски
  risks: Risk[];
  
  // Стратегия
  strategy: {
    preferredApproach: 'administrative' | 'judicial' | 'settlement';
    stepByStepPlan: string[];
    alternativeOptions: string[];
  };
}

export interface TaxError {
  type: 'calculation' | 'rate' | 'base' | 'coefficient' | 'period' | 'privilege';
  description: string;
  impact: 'high' | 'medium' | 'low';
  correctValue?: number;
  incorrectValue?: number;
  legalBasis: string[];
  evidenceNeeded: string[];
}

export interface ProceduralViolation {
  type: 'notification' | 'deadline' | 'documentation' | 'rights' | 'audit';
  description: string;
  severity: 'critical' | 'significant' | 'minor';
  legalBasis: string[];
  remedy: string;
}

export interface LegalArgument {
  argument: string;
  strength: 'strong' | 'moderate' | 'weak';
  legalBasis: string[];
  precedents?: string[];
  counterarguments?: string[];
}

export interface RecommendedAction {
  step: number;
  action: string;
  deadline?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  documents: string[];
  expectedOutcome: string;
}

export interface Risk {
  description: string;
  probability: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
}

/**
 * Выполнение углубленного анализа налогового требования
 */
export async function analyzeTaxRequirement(
  request: TaxAnalysisRequest,
  userId?: string
): Promise<TaxAnalysisResult> {
  const startTime = Date.now();
  
  // Получение промпта из БД
  const promptTemplate = await getPromptByType('tax_analysis', request.taxType);
  
  let systemPrompt: string;
  let userPrompt: string;
  let temperature = 0.2; // Низкая температура для точного анализа
  let maxTokens = 4000;
  let model = 'gpt-4';
  let promptId: string | null = null;
  
  if (promptTemplate) {
    systemPrompt = promptTemplate.systemPrompt || getDefaultAnalysisSystemPrompt();
    userPrompt = buildUserPrompt(request, promptTemplate.userPrompt);
    temperature = promptTemplate.temperature;
    maxTokens = promptTemplate.maxTokens;
    model = promptTemplate.model;
    promptId = promptTemplate.id;
  } else {
    systemPrompt = getDefaultAnalysisSystemPrompt();
    userPrompt = buildUserPrompt(request);
  }
  
  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' }, // Запрашиваем JSON ответ
    });
    
    const responseTime = Date.now() - startTime;
    const analysisContent = completion.choices[0].message.content || '{}';
    
    // Парсинг JSON ответа
    const parsedAnalysis = parseAnalysisResponse(analysisContent, request);
    
    // Сохранение анализа в БД
    await saveAnalysisToDatabase(request.disputeId, parsedAnalysis);
    
    // Логирование использования промпта
    if (promptId) {
      await logPromptUsage({
        promptId,
        userId,
        disputeId: request.disputeId,
        success: true,
        responseTime,
        tokensUsed: completion.usage?.total_tokens,
        content: analysisContent,
        inputData: {
          taxType: request.taxType,
          claimedAmount: request.claimedAmount,
          calculatedAmount: request.calculatedAmount,
        },
      });
    }
    
    return parsedAnalysis;
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Логирование ошибки
    if (promptId) {
      await logPromptUsage({
        promptId,
        userId,
        disputeId: request.disputeId,
        success: false,
        responseTime,
        error: error instanceof Error ? error.message : String(error),
        inputData: {
          taxType: request.taxType,
        },
      });
    }
    
    console.error('AI Tax Analysis Error:', error);
    
    // Возвращаем базовый анализ при ошибке
    return generateFallbackAnalysis(request);
  }
}

/**
 * Системный промпт для налогового анализа
 */
function getDefaultAnalysisSystemPrompt(): string {
  return `Ты - опытный налоговый эксперт и юрист с 20+ летним стажем работы в области налоговых споров.

Твоя задача - провести ДЕТАЛЬНЫЙ профессиональный анализ налогового требования и выявить все возможные ошибки, нарушения и основания для оспаривания.

В своем анализе ты ДОЛЖЕН:

1. ОШИБКИ В РАСЧЕТАХ:
   - Проверить правильность применения налоговой ставки
   - Проверить налоговую базу
   - Проверить коэффициенты (владения, повышающий)
   - Проверить учет льгот и вычетов
   - Проверить период владения

2. ПРОЦЕССУАЛЬНЫЕ НАРУШЕНИЯ:
   - Проверить соблюдение сроков уведомления
   - Проверить форму и содержание требования
   - Проверить соблюдение прав налогоплательщика
   - Проверить процедуру проверки (если была)

3. ПРАВОВЫЕ АРГУМЕНТЫ:
   - Найти применимые статьи НК РФ
   - Найти судебную практику (Постановления ВС РФ, КС РФ)
   - Оценить силу каждого аргумента
   - Предусмотреть контраргументы налоговой

4. СТРАТЕГИЯ:
   - Определить оптимальный путь оспаривания
   - Составить пошаговый план действий
   - Оценить сроки и затраты
   - Указать риски

5. ПРОГНОЗ:
   - Дать реалистичную оценку шансов на успех (в %)
   - Обосновать оценку
   - Указать факторы, влияющие на исход

КРИТИЧНО ВАЖНО:
- Будь максимально конкретным
- Ссылайся только на реальные статьи НК РФ
- Не преувеличивай шансы на успех
- Укажи ВСЕ найденные ошибки
- Будь объективным

ФОРМАТ ОТВЕТА: JSON со следующей структурой:
{
  "overallAssessment": "текст общей оценки",
  "successProbability": число от 0 до 100,
  "detectedErrors": [...],
  "proceduralViolations": [...],
  "legalArguments": [...],
  "recommendedActions": [...],
  "estimatedTimeline": "текст",
  "estimatedCosts": {...},
  "risks": [...],
  "strategy": {...}
}`;
}

/**
 * Построение пользовательского промпта
 */
function buildUserPrompt(request: TaxAnalysisRequest, template?: string): string {
  if (template) {
    // TODO: Интерполяция переменных в шаблоне
    return template;
  }
  
  let prompt = `Проанализируй следующее налоговое требование:\n\n`;
  
  prompt += `БАЗОВАЯ ИНФОРМАЦИЯ:\n`;
  prompt += `- Вид налога: ${request.taxType}\n`;
  prompt += `- Налоговый период: ${request.taxPeriod}\n`;
  prompt += `- Начислено налоговой: ${request.claimedAmount} руб.\n`;
  
  if (request.calculatedAmount) {
    prompt += `- Правильная сумма (по расчету): ${request.calculatedAmount} руб.\n`;
    prompt += `- Разница: ${Math.abs(request.claimedAmount - request.calculatedAmount)} руб.\n`;
  }
  
  if (request.taxNotice) {
    prompt += `\nДЕТАЛИ ТРЕБОВАНИЯ:\n`;
    if (request.taxNotice.noticeNumber) prompt += `- Номер требования: ${request.taxNotice.noticeNumber}\n`;
    if (request.taxNotice.noticeDate) prompt += `- Дата требования: ${request.taxNotice.noticeDate.toLocaleDateString('ru-RU')}\n`;
    if (request.taxNotice.taxBase) prompt += `- Налоговая база: ${request.taxNotice.taxBase}\n`;
    if (request.taxNotice.rate) prompt += `- Ставка: ${request.taxNotice.rate}\n`;
    if (request.taxNotice.coefficients) {
      prompt += `- Коэффициенты: ${JSON.stringify(request.taxNotice.coefficients)}\n`;
    }
    if (request.taxNotice.penalties) prompt += `- Пени: ${request.taxNotice.penalties} руб.\n`;
    if (request.taxNotice.fines) prompt += `- Штрафы: ${request.taxNotice.fines} руб.\n`;
  }
  
  if (request.taxpayerData) {
    prompt += `\nДАННЫЕ НАЛОГОПЛАТЕЛЬЩИКА:\n`;
    if (request.taxpayerData.hasPrivileges) {
      prompt += `- Наличие льгот: Да (${request.taxpayerData.privilegeType || 'не указано'})\n`;
    }
    if (request.taxpayerData.ownershipPeriod) {
      prompt += `- Период владения: ${request.taxpayerData.ownershipPeriod} мес.\n`;
    }
    if (request.taxpayerData.vehicleAge) {
      prompt += `- Возраст ТС: ${request.taxpayerData.vehicleAge} лет\n`;
    }
    if (request.taxpayerData.propertyValue) {
      prompt += `- Кадастровая стоимость: ${request.taxpayerData.propertyValue} руб.\n`;
    }
  }
  
  if (request.grounds && request.grounds.length > 0) {
    prompt += `\nОСНОВАНИЯ ДЛЯ ОСПАРИВАНИЯ (предварительные):\n`;
    request.grounds.forEach((ground, index) => {
      prompt += `${index + 1}. ${ground}\n`;
    });
  }
  
  prompt += `\nВЫПОЛНИ ДЕТАЛЬНЫЙ АНАЛИЗ:\n`;
  prompt += `1. Найди ВСЕ ошибки в расчетах и их применении\n`;
  prompt += `2. Выяви процессуальные нарушения\n`;
  prompt += `3. Сформулируй правовые аргументы со ссылками на НК РФ\n`;
  prompt += `4. Дай пошаговый план оспаривания\n`;
  prompt += `5. Оцени реальные шансы на успех\n`;
  prompt += `6. Укажи риски и способы их минимизации\n\n`;
  
  prompt += `Верни ТОЛЬКО валидный JSON в указанном формате.`;
  
  return prompt;
}

/**
 * Парсинг ответа AI
 */
function parseAnalysisResponse(content: string, request: TaxAnalysisRequest): TaxAnalysisResult {
  try {
    const parsed = JSON.parse(content);
    
    // Валидация и дополнение данных
    return {
      overallAssessment: parsed.overallAssessment || 'Анализ выполнен',
      successProbability: Math.min(Math.max(parsed.successProbability || 50, 0), 100),
      detectedErrors: parsed.detectedErrors || [],
      proceduralViolations: parsed.proceduralViolations || [],
      legalArguments: parsed.legalArguments || [],
      recommendedActions: parsed.recommendedActions || [],
      estimatedTimeline: parsed.estimatedTimeline || '1-3 месяца',
      estimatedCosts: {
        courtFees: parsed.estimatedCosts?.courtFees,
        expertiseСosts: parsed.estimatedCosts?.expertiseСosts,
        totalEstimated: parsed.estimatedCosts?.totalEstimated || 0,
      },
      risks: parsed.risks || [],
      strategy: {
        preferredApproach: parsed.strategy?.preferredApproach || 'administrative',
        stepByStepPlan: parsed.strategy?.stepByStepPlan || [],
        alternativeOptions: parsed.strategy?.alternativeOptions || [],
      },
    };
  } catch (error) {
    console.error('Error parsing AI analysis response:', error);
    return generateFallbackAnalysis(request);
  }
}

/**
 * Генерация базового анализа при ошибке
 */
function generateFallbackAnalysis(request: TaxAnalysisRequest): TaxAnalysisResult {
  const difference = request.calculatedAmount 
    ? Math.abs(request.claimedAmount - request.calculatedAmount) 
    : 0;
  
  const successProbability = difference > request.claimedAmount * 0.3 ? 70 : 50;
  
  return {
    overallAssessment: `Предварительный анализ показывает возможность оспаривания начисления ${request.taxType} за ${request.taxPeriod}. Требуется детальная проверка расчетов и процедуры начисления.`,
    successProbability,
    detectedErrors: [],
    proceduralViolations: [],
    legalArguments: [
      {
        argument: 'Право на оспаривание начислений согласно ст. 137-138 НК РФ',
        strength: 'strong',
        legalBasis: ['Статья 137 НК РФ', 'Статья 138 НК РФ'],
      },
    ],
    recommendedActions: [
      {
        step: 1,
        action: 'Подать возражения на акт проверки или требование',
        deadline: '30 дней с момента получения',
        priority: 'urgent',
        documents: ['Письменные возражения', 'Расчет налога', 'Подтверждающие документы'],
        expectedOutcome: 'Рассмотрение возражений налоговой инспекцией',
      },
    ],
    estimatedTimeline: '1-3 месяца',
    estimatedCosts: {
      totalEstimated: 0,
    },
    risks: [
      {
        description: 'Возможен отказ в удовлетворении возражений',
        probability: 'medium',
        impact: 'medium',
        mitigation: 'Подготовить обращение в вышестоящий орган или суд',
      },
    ],
    strategy: {
      preferredApproach: 'administrative',
      stepByStepPlan: [
        'Подача возражений в ИФНС',
        'При отказе - жалоба в УФНС',
        'При отказе - обращение в суд',
      ],
      alternativeOptions: [
        'Досудебное урегулирование с налоговой',
        'Обращение к налоговому омбудсмену',
      ],
    },
  };
}

/**
 * Сохранение анализа в БД
 */
async function saveAnalysisToDatabase(disputeId: string, analysis: TaxAnalysisResult): Promise<void> {
  try {
    await prisma.taxDispute.update({
      where: { id: disputeId },
      data: {
        successRate: analysis.successProbability,
        aiAnalysis: {
          analyzedAt: new Date().toISOString(),
          ...analysis,
        },
      },
    });
    
    // Добавление в таймлайн
    await prisma.taxDisputeTimeline.create({
      data: {
        disputeId,
        eventType: 'ai_analysis_completed',
        description: `Выполнен детальный AI-анализ. Шансы на успех: ${analysis.successProbability}%`,
        metadata: {
          errorsFound: analysis.detectedErrors.length,
          violationsFound: analysis.proceduralViolations.length,
          legalArgumentsCount: analysis.legalArguments.length,
        },
      },
    });
  } catch (error) {
    console.error('Error saving analysis to database:', error);
  }
}

