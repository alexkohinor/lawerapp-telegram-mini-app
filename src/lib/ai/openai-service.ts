/**
 * OpenAI GPT-4 Service для юридических консультаций
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface LegalConsultationRequest {
  query: string;
  category: LegalCategory;
  context?: string;
  userId: string;
}

export interface LegalConsultationResponse {
  response: string;
  confidence: number;
  sources: string[];
  suggestions: string[];
  followUpQuestions: string[];
}

export enum LegalCategory {
  LABOR = 'labor',           // Трудовое право
  HOUSING = 'housing',       // Жилищное право
  FAMILY = 'family',         // Семейное право
  CIVIL = 'civil',           // Гражданское право
  CONSUMER = 'consumer',     // Защита прав потребителей
  ADMINISTRATIVE = 'administrative', // Административное право
  CRIMINAL = 'criminal',     // Уголовное право
  TAX = 'tax',              // Налоговое право
  CORPORATE = 'corporate',   // Корпоративное право
  INTELLECTUAL = 'intellectual', // Интеллектуальная собственность
}

const LEGAL_CATEGORY_NAMES = {
  [LegalCategory.LABOR]: 'Трудовое право',
  [LegalCategory.HOUSING]: 'Жилищное право',
  [LegalCategory.FAMILY]: 'Семейное право',
  [LegalCategory.CIVIL]: 'Гражданское право',
  [LegalCategory.CONSUMER]: 'Защита прав потребителей',
  [LegalCategory.ADMINISTRATIVE]: 'Административное право',
  [LegalCategory.CRIMINAL]: 'Уголовное право',
  [LegalCategory.TAX]: 'Налоговое право',
  [LegalCategory.CORPORATE]: 'Корпоративное право',
  [LegalCategory.INTELLECTUAL]: 'Интеллектуальная собственность',
};

/**
 * Получить консультацию по правовому вопросу
 */
export async function getLegalConsultation(
  request: LegalConsultationRequest
): Promise<LegalConsultationResponse> {
  try {
    const systemPrompt = getSystemPrompt(request.category);
    const userPrompt = buildUserPrompt(request);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // Парсим ответ для извлечения структурированных данных
    const parsedResponse = parseLegalResponse(response);

    return {
      response: parsedResponse.response,
      confidence: parsedResponse.confidence,
      sources: parsedResponse.sources,
      suggestions: parsedResponse.suggestions,
      followUpQuestions: parsedResponse.followUpQuestions,
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Ошибка при получении консультации. Попробуйте позже.');
  }
}

/**
 * Получить системный промпт для категории права
 */
function getSystemPrompt(category: LegalCategory): string {
  const categoryName = LEGAL_CATEGORY_NAMES[category];
  
  return `Вы - опытный юрист-консультант, специализирующийся на ${categoryName} в Российской Федерации.

ВАЖНЫЕ ПРИНЦИПЫ:
1. Отвечайте только на основе действующего российского законодательства
2. Указывайте конкретные статьи законов и нормативных актов
3. Давайте практические рекомендации
4. Предупреждайте о рисках и ограничениях
5. Рекомендуйте обращение к юристу в сложных случаях

СТРУКТУРА ОТВЕТА:
- Краткий ответ на вопрос
- Правовое обоснование со ссылками на законы
- Практические рекомендации
- Возможные риски и ограничения
- Следующие шаги

ФОРМАТ ОТВЕТА:
Ответ: [краткий ответ]

Правовое обоснование:
[подробное объяснение с ссылками на законы]

Рекомендации:
[практические советы]

Риски:
[возможные проблемы]

Следующие шаги:
[что делать дальше]

Источники: [список законов и статей]
Уверенность: [0-100]
Предложения: [дополнительные действия]
Вопросы: [уточняющие вопросы]`;
}

/**
 * Построить пользовательский промпт
 */
function buildUserPrompt(request: LegalConsultationRequest): string {
  let prompt = `Вопрос по ${LEGAL_CATEGORY_NAMES[request.category]}:\n\n${request.query}`;
  
  if (request.context) {
    prompt += `\n\nДополнительный контекст:\n${request.context}`;
  }
  
  prompt += `\n\nПожалуйста, дайте подробную консультацию с учетом российского законодательства.`;
  
  return prompt;
}

/**
 * Парсинг ответа от GPT для извлечения структурированных данных
 */
function parseLegalResponse(response: string): {
  response: string;
  confidence: number;
  sources: string[];
  suggestions: string[];
  followUpQuestions: string[];
} {
  // Извлекаем уверенность
  const confidenceMatch = response.match(/Уверенность:\s*(\d+)/);
  const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 85;

  // Извлекаем источники
  const sourcesMatch = response.match(/Источники:\s*([^\n]+)/);
  const sources = sourcesMatch 
    ? sourcesMatch[1].split(',').map(s => s.trim()).filter(Boolean)
    : ['Российское законодательство'];

  // Извлекаем предложения
  const suggestionsMatch = response.match(/Предложения:\s*([^\n]+)/);
  const suggestions = suggestionsMatch 
    ? suggestionsMatch[1].split(',').map(s => s.trim()).filter(Boolean)
    : [];

  // Извлекаем вопросы
  const questionsMatch = response.match(/Вопросы:\s*([^\n]+)/);
  const followUpQuestions = questionsMatch 
    ? questionsMatch[1].split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return {
    response: response,
    confidence,
    sources,
    suggestions,
    followUpQuestions,
  };
}

/**
 * Получить потоковую консультацию (для реального времени)
 */
export async function* getStreamingLegalConsultation(
  request: LegalConsultationRequest
): AsyncGenerator<string, void, unknown> {
  try {
    const systemPrompt = getSystemPrompt(request.category);
    const userPrompt = buildUserPrompt(request);

    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error('OpenAI Streaming Error:', error);
    throw new Error('Ошибка при получении консультации. Попробуйте позже.');
  }
}

/**
 * Получить краткую консультацию (для быстрых ответов)
 */
export async function getQuickLegalConsultation(
  query: string,
  category: LegalCategory
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Вы - юрист-консультант. Дайте краткий ответ (до 200 слов) на вопрос по ${LEGAL_CATEGORY_NAMES[category]} в России. Укажите основные правовые нормы.`,
        },
        {
          role: 'user',
          content: query,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content || 'Не удалось получить ответ.';
  } catch (error) {
    console.error('OpenAI Quick Consultation Error:', error);
    return 'Ошибка при получении консультации. Попробуйте позже.';
  }
}
