import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI Document Generator для налоговых документов
 * Использует OpenAI GPT-4 для генерации профессиональных юридических текстов
 */

export interface DocumentGenerationParams {
  documentType: 'objection' | 'complaint' | 'notice' | 'recalculation_request';
  taxType: string;
  taxPeriod: string;
  
  // Данные налогоплательщика
  taxpayerName: string;
  taxpayerINN?: string;
  taxpayerAddress?: string;
  taxpayerPhone?: string;
  
  // Данные ИФНС
  inspectionNumber?: string;
  inspectionName?: string;
  
  // Суммы
  claimedAmount: number;
  calculatedAmount: number;
  difference: number;
  
  // Основания для оспаривания
  grounds: string[];
  
  // Дополнительные данные
  additionalData?: Record<string, unknown>;
  
  // Правовая база
  legalBasis?: string[];
}

export interface GeneratedDocument {
  content: string;
  title: string;
  legalReferences: string[];
  recommendations: string[];
  estimatedSuccessRate: number;
}

/**
 * Генерация налогового документа с помощью AI
 */
export async function generateTaxDocument(
  params: DocumentGenerationParams,
  baseTemplate?: string
): Promise<GeneratedDocument> {
  const systemPrompt = getSystemPrompt(params.documentType);
  const userPrompt = getUserPrompt(params, baseTemplate);
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Низкая температура для точности юридических текстов
      max_tokens: 3000,
    });
    
    const generatedContent = completion.choices[0].message.content || '';
    
    // Парсинг ответа AI
    const document = parseAIResponse(generatedContent, params);
    
    return document;
    
  } catch (error) {
    console.error('AI Document Generation Error:', error);
    throw new Error(`Failed to generate document: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Системный промпт для разных типов документов
 */
function getSystemPrompt(documentType: string): string {
  const basePrompt = `Ты - опытный налоговый юрист с 15+ летним стажем работы в области защиты прав налогоплательщиков. 
Ты специализируешься на оспаривании незаконных налоговых начислений и составлении профессиональных юридических документов.

Твоя задача - составить грамотный, убедительный и юридически корректный документ на основе предоставленных данных.

ВАЖНЫЕ ТРЕБОВАНИЯ:
1. Используй только актуальные статьи Налогового кодекса РФ
2. Ссылайся на судебную практику Верховного Суда РФ
3. Формулировки должны быть чёткими и профессиональными
4. Избегай эмоциональных выражений
5. Каждое утверждение должно иметь правовое обоснование
6. Документ должен быть структурированным и логичным
7. Используй стандартные юридические клише и обороты`;

  const typeSpecificPrompts: Record<string, string> = {
    'recalculation_request': `
Тип документа: ЗАЯВЛЕНИЕ О ПЕРЕРАСЧЕТЕ НАЛОГА

Структура документа:
1. Шапка (адресат, заявитель)
2. Название документа
3. Правовое основание (ст. 52, 78, 81 НК РФ)
4. Обстоятельства дела
5. Правовое обоснование с ссылками на НК РФ
6. Расчет правильной суммы налога (таблица)
7. Требования (конкретные и чёткие)
8. Приложения (список документов)
9. Дата и подпись`,

    'complaint': `
Тип документа: ЖАЛОБА В ВЫШЕСТОЯЩИЙ НАЛОГОВЫЙ ОРГАН

Структура документа:
1. Шапка (УФНС, заявитель)
2. Название документа
3. Правовое основание (ст. 137, 138 НК РФ)
4. Основания для отмены решения:
   - Нарушение материального права
   - Нарушение процессуального права
   - Недоказанность обстоятельств
5. Судебная практика (ссылки на решения ВС РФ)
6. Требования
7. Приложения
8. Дата и подпись`,

    'notice': `
Тип документа: УВЕДОМЛЕНИЕ О НЕСОГЛАСИИ С РЕШЕНИЕМ

Структура документа:
1. Шапка (ИФНС)
2. Название документа
3. Констатация несогласия
4. Краткое изложение позиции
5. Ссылка на ст. 142 НК РФ (право на обращение в суд)
6. Дата и подпись`,

    'objection': `
Тип документа: ВОЗРАЖЕНИЯ НА АКТ НАЛОГОВОЙ ПРОВЕРКИ

Структура документа:
1. Шапка (ИФНС)
2. Название документа
3. Правовое основание (ст. 100 НК РФ)
4. Несогласие с выводами проверки:
   - Нарушение порядка проведения проверки
   - Неправильное применение законодательства
   - Неправильное определение налоговой базы
5. Судебная практика
6. Требования
7. Приложения
8. Дата и подпись`,
  };

  return basePrompt + '\n\n' + (typeSpecificPrompts[documentType] || typeSpecificPrompts['recalculation_request']);
}

/**
 * Пользовательский промпт с данными для генерации
 */
function getUserPrompt(params: DocumentGenerationParams, baseTemplate?: string): string {
  const taxTypeLabels: Record<string, string> = {
    'transport': 'транспортного налога',
    'property': 'налога на имущество',
    'land': 'земельного налога',
    'NDFL': 'НДФЛ',
    'NPD': 'налога на профессиональный доход',
  };

  const taxLabel = taxTypeLabels[params.taxType] || params.taxType;
  
  let prompt = `Составь ${getDocumentTypeLabel(params.documentType)} по следующим данным:\n\n`;
  
  prompt += `ДАННЫЕ НАЛОГОПЛАТЕЛЬЩИКА:\n`;
  prompt += `- ФИО: ${params.taxpayerName}\n`;
  if (params.taxpayerINN) prompt += `- ИНН: ${params.taxpayerINN}\n`;
  if (params.taxpayerAddress) prompt += `- Адрес: ${params.taxpayerAddress}\n`;
  if (params.taxpayerPhone) prompt += `- Телефон: ${params.taxpayerPhone}\n`;
  
  prompt += `\nДАННЫЕ ИФНС:\n`;
  if (params.inspectionNumber) prompt += `- Номер: ${params.inspectionNumber}\n`;
  if (params.inspectionName) prompt += `- Название: ${params.inspectionName}\n`;
  
  prompt += `\nПРЕДМЕТ СПОРА:\n`;
  prompt += `- Вид налога: ${taxLabel}\n`;
  prompt += `- Налоговый период: ${params.taxPeriod}\n`;
  prompt += `- Начислено налоговой: ${params.claimedAmount} руб.\n`;
  prompt += `- Правильная сумма: ${params.calculatedAmount} руб.\n`;
  prompt += `- Переплата: ${Math.abs(params.difference)} руб.\n`;
  
  if (params.grounds && params.grounds.length > 0) {
    prompt += `\nОСНОВАНИЯ ДЛЯ ОСПАРИВАНИЯ:\n`;
    params.grounds.forEach((ground, index) => {
      prompt += `${index + 1}. ${ground}\n`;
    });
  }
  
  if (params.legalBasis && params.legalBasis.length > 0) {
    prompt += `\nИСПОЛЬЗУЙ СЛЕДУЮЩИЕ СТАТЬИ НК РФ:\n`;
    params.legalBasis.forEach(basis => {
      prompt += `- ${basis}\n`;
    });
  }
  
  if (baseTemplate) {
    prompt += `\nБАЗОВЫЙ ШАБЛОН (используй как основу, но улучши и адаптируй под данные):\n${baseTemplate}\n`;
  }
  
  prompt += `\nТРЕБОВАНИЯ К ДОКУМЕНТУ:\n`;
  prompt += `1. Документ должен быть профессиональным и убедительным\n`;
  prompt += `2. Все утверждения должны иметь правовое обоснование\n`;
  prompt += `3. Ссылайся на конкретные статьи НК РФ\n`;
  prompt += `4. Используй судебную практику (если применимо)\n`;
  prompt += `5. Расчеты должны быть представлены в виде таблицы\n`;
  prompt += `6. Формулировки должны быть чёткими и однозначными\n`;
  prompt += `7. Избегай эмоциональных выражений\n`;
  prompt += `8. Документ должен быть готов к печати и подаче в налоговую\n\n`;
  
  prompt += `ФОРМАТ ОТВЕТА:\n`;
  prompt += `Верни ТОЛЬКО текст документа без дополнительных комментариев.\n`;
  prompt += `В конце документа добавь раздел "ПРАВОВЫЕ ССЫЛКИ:" со списком использованных статей НК РФ.\n`;
  prompt += `Затем раздел "РЕКОМЕНДАЦИИ:" с советами по дальнейшим действиям.\n`;
  prompt += `И раздел "ШАНСЫ НА УСПЕХ:" с оценкой вероятности положительного исхода (в процентах).\n`;
  
  return prompt;
}

/**
 * Получение названия типа документа
 */
function getDocumentTypeLabel(documentType: string): string {
  const labels: Record<string, string> = {
    'recalculation_request': 'заявление о перерасчете налога',
    'complaint': 'жалобу в вышестоящий налоговый орган',
    'notice': 'уведомление о несогласии с решением',
    'objection': 'возражения на акт налоговой проверки',
  };
  
  return labels[documentType] || 'налоговый документ';
}

/**
 * Парсинг ответа от AI
 */
function parseAIResponse(content: string, params: DocumentGenerationParams): GeneratedDocument {
  // Извлечение основного текста документа
  const mainContentMatch = content.match(/^([\s\S]*?)(?=ПРАВОВЫЕ ССЫЛКИ:|$)/);
  const mainContent = mainContentMatch ? mainContentMatch[1].trim() : content;
  
  // Извлечение правовых ссылок
  const legalReferencesMatch = content.match(/ПРАВОВЫЕ ССЫЛКИ:([\s\S]*?)(?=РЕКОМЕНДАЦИИ:|ШАНСЫ НА УСПЕХ:|$)/);
  const legalReferencesText = legalReferencesMatch ? legalReferencesMatch[1].trim() : '';
  const legalReferences = legalReferencesText
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^[-•*]\s*/, '').trim());
  
  // Извлечение рекомендаций
  const recommendationsMatch = content.match(/РЕКОМЕНДАЦИИ:([\s\S]*?)(?=ШАНСЫ НА УСПЕХ:|$)/);
  const recommendationsText = recommendationsMatch ? recommendationsMatch[1].trim() : '';
  const recommendations = recommendationsText
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^[-•*]\s*/, '').trim());
  
  // Извлечение оценки шансов
  const successRateMatch = content.match(/ШАНСЫ НА УСПЕХ:\s*(\d+)%/);
  const estimatedSuccessRate = successRateMatch 
    ? parseInt(successRateMatch[1], 10) 
    : calculateSuccessRate(params);
  
  // Генерация заголовка
  const title = generateDocumentTitle(params.documentType, params.taxType, params.taxPeriod);
  
  return {
    content: mainContent,
    title,
    legalReferences: legalReferences.length > 0 ? legalReferences : getDefaultLegalReferences(params.documentType),
    recommendations: recommendations.length > 0 ? recommendations : getDefaultRecommendations(params),
    estimatedSuccessRate,
  };
}

/**
 * Расчет вероятности успеха на основе параметров
 */
function calculateSuccessRate(params: DocumentGenerationParams): number {
  let successRate = 50; // Базовая вероятность
  
  // Если разница большая, шансы выше
  const differencePercent = Math.abs(params.difference / params.claimedAmount * 100);
  if (differencePercent > 50) successRate += 30;
  else if (differencePercent > 25) successRate += 20;
  else if (differencePercent > 10) successRate += 10;
  
  // Если есть основания, шансы выше
  if (params.grounds && params.grounds.length > 0) {
    successRate += params.grounds.length * 5;
  }
  
  // Если есть правовая база, шансы выше
  if (params.legalBasis && params.legalBasis.length > 0) {
    successRate += 10;
  }
  
  // Ограничиваем диапазон 0-100%
  return Math.min(Math.max(successRate, 0), 100);
}

/**
 * Генерация заголовка документа
 */
function generateDocumentTitle(documentType: string, taxType: string, period: string): string {
  const taxTypeLabels: Record<string, string> = {
    'transport': 'транспортному налогу',
    'property': 'налогу на имущество',
    'land': 'земельному налогу',
    'NDFL': 'НДФЛ',
    'NPD': 'НПД',
  };

  const titleTemplates: Record<string, string> = {
    'recalculation_request': 'Заявление о перерасчете',
    'complaint': 'Жалоба в УФНС по',
    'notice': 'Уведомление о несогласии с решением по',
    'objection': 'Возражения на акт проверки по',
  };

  const taxLabel = taxTypeLabels[taxType] || taxType;
  const templateTitle = titleTemplates[documentType] || 'Документ по';

  return `${templateTitle} ${taxLabel} за ${period}`;
}

/**
 * Получение стандартных правовых ссылок по типу документа
 */
function getDefaultLegalReferences(documentType: string): string[] {
  const references: Record<string, string[]> = {
    'recalculation_request': [
      'Статья 52 НК РФ "Порядок исчисления налога"',
      'Статья 78 НК РФ "Зачет или возврат сумм излишне уплаченных налогов"',
      'Статья 81 НК РФ "Внесение изменений в налоговую декларацию"',
    ],
    'complaint': [
      'Статья 137 НК РФ "Порядок обжалования актов налоговых органов"',
      'Статья 138 НК РФ "Порядок подачи жалобы"',
      'Статья 140 НК РФ "Решение по жалобе"',
    ],
    'notice': [
      'Статья 138 НК РФ "Порядок подачи жалобы"',
      'Статья 142 НК РФ "Обжалование решений налоговых органов в судебном порядке"',
    ],
    'objection': [
      'Статья 88 НК РФ "Камеральная налоговая проверка"',
      'Статья 100 НК РФ "Вынесение решения по результатам рассмотрения материалов налоговой проверки"',
    ],
  };
  
  return references[documentType] || references['recalculation_request'];
}

/**
 * Получение стандартных рекомендаций
 */
function getDefaultRecommendations(params: DocumentGenerationParams): string[] {
  const recommendations: string[] = [];
  
  recommendations.push('Подайте документ в 2 экземплярах, один с отметкой о принятии верните себе');
  recommendations.push('Приложите все подтверждающие документы (свидетельство о регистрации ТС, расчеты)');
  recommendations.push('Сохраните копии всех документов и переписки');
  
  if (params.difference > 5000) {
    recommendations.push('При значительной сумме переплаты рекомендуется личное присутствие при подаче');
  }
  
  if (params.documentType === 'complaint') {
    recommendations.push('Срок рассмотрения жалобы в УФНС - 15 рабочих дней');
    recommendations.push('В случае отказа вы можете обратиться в суд в течение 3 месяцев');
  }
  
  return recommendations;
}

/**
 * Генерация краткого анализа ситуации
 */
export async function analyzeTaxSituation(params: DocumentGenerationParams): Promise<string> {
  const systemPrompt = `Ты - опытный налоговый консультант. 
Проанализируй налоговую ситуацию и дай краткую профессиональную оценку в 2-3 предложениях.
Укажи основные риски и шансы на успех.`;

  const userPrompt = `Налогоплательщик получил требование по ${params.taxType} за ${params.taxPeriod}.
Начислено: ${params.claimedAmount} руб.
По расчету должно быть: ${params.calculatedAmount} руб.
Разница: ${Math.abs(params.difference)} руб.
Основания: ${params.grounds.join(', ')}.

Дай краткий анализ ситуации.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    return completion.choices[0].message.content || 'Анализ недоступен';
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return 'Не удалось выполнить анализ. Рекомендуется обратиться к специалисту.';
  }
}

