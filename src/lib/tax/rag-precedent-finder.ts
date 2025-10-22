import { VectorDBClient } from '../rag/vector-db-client';
import { EmbeddingClient } from '../rag/embedding-client';
import { defaultRAGConfig } from '../rag/config';
import { prisma } from '../prisma';

/**
 * RAG Precedent Finder - Поиск прецедентов и релевантных документов
 * Использует векторную БД для семантического поиска похожих дел
 */

export interface PrecedentSearchRequest {
  query: string;
  taxType?: string;
  category?: string;
  limit?: number;
  minRelevance?: number;
}

export interface Precedent {
  id: string;
  title: string;
  content: string;
  type: 'law' | 'precedent' | 'template' | 'guideline';
  category: string;
  relevanceScore: number;
  legalBasis?: string[];
  courtDecision?: {
    court: string;
    caseNumber: string;
    date: string;
    outcome: 'favorable' | 'unfavorable' | 'partial';
  };
  applicableArguments: string[];
  url?: string;
}

export interface EnhancedAnalysisWithPrecedents {
  originalAnalysis: unknown;
  precedents: Precedent[];
  enhancedArguments: string[];
  citationsAdded: number;
}

/**
 * Поиск релевантных прецедентов для налогового спора
 */
export async function findRelevantPrecedents(
  request: PrecedentSearchRequest
): Promise<Precedent[]> {
  try {
    // Инициализация клиентов
    const vectorDbClient = new VectorDBClient(defaultRAGConfig);
    const embeddingClient = new EmbeddingClient(defaultRAGConfig);
    
    // Генерация эмбеддинга для запроса
    const queryEmbedding = await embeddingClient.generateEmbeddings([request.query]);
    
    if (!queryEmbedding || queryEmbedding.length === 0) {
      console.error('Failed to generate query embedding');
      return [];
    }
    
    // Поиск похожих документов в векторной БД
    const similarDocs = await vectorDbClient.search(
      queryEmbedding[0],
      {
        limit: request.limit || 10,
        filter: {
          type: request.category ? request.category : undefined,
          legalArea: request.taxType ? request.taxType : undefined,
        },
      }
    );
    
    // Фильтрация по минимальной релевантности
    const minRelevance = request.minRelevance || 0.7;
    const relevantDocs = similarDocs.filter(doc => 
      (doc.score || 0) >= minRelevance
    );
    
    // Преобразование в формат Precedent
    const precedents: Precedent[] = relevantDocs.map(doc => ({
      id: doc.id,
      title: (doc.metadata?.title as string) || 'Документ без названия',
      content: (doc.metadata?.content as string) || '',
      type: (doc.metadata?.documentType as 'law' | 'precedent' | 'template' | 'guideline') || 'guideline',
      category: (doc.metadata?.legalArea as string) || 'general',
      relevanceScore: doc.score || 0,
      legalBasis: extractLegalBasis(doc.metadata?.content as string),
      applicableArguments: extractArguments(doc.metadata?.content as string),
      url: (doc.metadata?.url as string) || undefined,
    }));
    
    // Сортировка по релевантности
    return precedents.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
  } catch (error) {
    console.error('Error finding precedents:', error);
    return [];
  }
}

/**
 * Улучшение AI-анализа с помощью найденных прецедентов
 */
export async function enhanceAnalysisWithPrecedents(
  disputeId: string,
  analysis: unknown
): Promise<EnhancedAnalysisWithPrecedents> {
  try {
    // Получение данных спора
    const dispute = await prisma.taxDispute.findUnique({
      where: { id: disputeId },
      select: {
        taxType: true,
        period: true,
        amount: true,
        grounds: true,
      },
    });
    
    if (!dispute) {
      return {
        originalAnalysis: analysis,
        precedents: [],
        enhancedArguments: [],
        citationsAdded: 0,
      };
    }
    
    // Формирование запроса для поиска прецедентов
    const grounds = Array.isArray(dispute.grounds) 
      ? (dispute.grounds as string[]).join('. ') 
      : '';
    
    const searchQuery = `${dispute.taxType} налог ${dispute.period}. ${grounds}. 
      Оспаривание начисления, ошибки в расчетах, судебная практика.`;
    
    // Поиск прецедентов
    const precedents = await findRelevantPrecedents({
      query: searchQuery,
      taxType: dispute.taxType,
      limit: 5,
      minRelevance: 0.75,
    });
    
    // Генерация улучшенных аргументов на основе прецедентов
    const enhancedArguments = precedents.flatMap(p => p.applicableArguments);
    
    // Подсчет добавленных цитат
    const citationsAdded = precedents.length;
    
    // Сохранение прецедентов в БД для спора
    await savePrecedentsToDispute(disputeId, precedents);
    
    return {
      originalAnalysis: analysis,
      precedents,
      enhancedArguments,
      citationsAdded,
    };
    
  } catch (error) {
    console.error('Error enhancing analysis with precedents:', error);
    return {
      originalAnalysis: analysis,
      precedents: [],
      enhancedArguments: [],
      citationsAdded: 0,
    };
  }
}

/**
 * Поиск прецедентов по конкретной правовой проблеме
 */
export async function findPrecedentsByIssue(
  issue: string,
  taxType: string,
  limit: number = 5
): Promise<Precedent[]> {
  const searchQuery = `${issue} ${taxType} судебная практика ВС РФ КС РФ решение суда`;
  
  return await findRelevantPrecedents({
    query: searchQuery,
    taxType,
    category: 'precedent',
    limit,
    minRelevance: 0.7,
  });
}

/**
 * Поиск релевантных статей НК РФ
 */
export async function findRelevantLegalArticles(
  issue: string,
  taxType: string,
  limit: number = 3
): Promise<Precedent[]> {
  const searchQuery = `${issue} ${taxType} НК РФ статья налоговый кодекс`;
  
  return await findRelevantPrecedents({
    query: searchQuery,
    taxType,
    category: 'law',
    limit,
    minRelevance: 0.8,
  });
}

/**
 * Извлечение правовых оснований из текста
 */
function extractLegalBasis(content: string): string[] {
  if (!content) return [];
  
  const legalBasis: string[] = [];
  
  // Поиск упоминаний статей НК РФ
  const articlePattern = /(?:ст(?:атья)?\.?\s*|статьи\s*)(\d+)(?:\s*НК\s*РФ)?/gi;
  const matches = content.matchAll(articlePattern);
  
  for (const match of matches) {
    legalBasis.push(`Статья ${match[1]} НК РФ`);
  }
  
  // Поиск упоминаний Постановлений
  const resolutionPattern = /Постановлени[ея]\s+(?:Пленума\s+)?(?:ВС|КС)\s+РФ[^.]{0,100}/gi;
  const resolutionMatches = content.matchAll(resolutionPattern);
  
  for (const match of resolutionMatches) {
    legalBasis.push(match[0]);
  }
  
  // Удаление дубликатов
  return Array.from(new Set(legalBasis)).slice(0, 5);
}

/**
 * Извлечение применимых аргументов из текста
 */
function extractArguments(content: string): string[] {
  if (!content) return [];
  
  const arguments: string[] = [];
  
  // Поиск аргументов в тексте (предложения с ключевыми словами)
  const sentences = content.split(/[.!?]+/);
  
  const keyPhrases = [
    'суд указал',
    'суд постановил',
    'налогоплательщик вправе',
    'налоговый орган обязан',
    'в соответствии с',
    'согласно позиции',
    'не может быть признан',
    'является незаконным',
    'нарушение',
  ];
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length < 20) continue;
    
    for (const phrase of keyPhrases) {
      if (trimmed.toLowerCase().includes(phrase)) {
        arguments.push(trimmed);
        break;
      }
    }
    
    if (arguments.length >= 3) break;
  }
  
  return arguments;
}

/**
 * Сохранение найденных прецедентов в БД для спора
 */
async function savePrecedentsToDispute(
  disputeId: string,
  precedents: Precedent[]
): Promise<void> {
  try {
    // Обновление AI-анализа с прецедентами
    const dispute = await prisma.taxDispute.findUnique({
      where: { id: disputeId },
      select: { aiAnalysis: true },
    });
    
    if (!dispute) return;
    
    const currentAnalysis = (dispute.aiAnalysis as Record<string, unknown>) || {};
    
    await prisma.taxDispute.update({
      where: { id: disputeId },
      data: {
        aiAnalysis: {
          ...currentAnalysis,
          precedents: precedents.map(p => ({
            title: p.title,
            type: p.type,
            relevanceScore: p.relevanceScore,
            legalBasis: p.legalBasis,
            url: p.url,
          })),
          precedentsFoundAt: new Date().toISOString(),
        },
      },
    });
    
    // Добавление в таймлайн
    await prisma.taxDisputeTimeline.create({
      data: {
        disputeId,
        eventType: 'precedents_found',
        description: `Найдено ${precedents.length} релевантных прецедентов и документов`,
        metadata: {
          precedentsCount: precedents.length,
          avgRelevance: precedents.reduce((sum, p) => sum + p.relevanceScore, 0) / precedents.length,
          types: Array.from(new Set(precedents.map(p => p.type))),
        },
      },
    });
  } catch (error) {
    console.error('Error saving precedents to dispute:', error);
  }
}

/**
 * Генерация цитат для документа на основе прецедентов
 */
export function generateCitationsForDocument(
  precedents: Precedent[],
  documentType: string
): string[] {
  const citations: string[] = [];
  
  for (const precedent of precedents) {
    if (precedent.type === 'precedent' && precedent.courtDecision) {
      const { court, caseNumber, date, outcome } = precedent.courtDecision;
      
      if (outcome === 'favorable' || outcome === 'partial') {
        citations.push(
          `Согласно решению ${court} по делу № ${caseNumber} от ${date}, ` +
          `${precedent.applicableArguments[0] || 'аналогичная позиция налогоплательщика была признана обоснованной'}.`
        );
      }
    } else if (precedent.type === 'law' && precedent.legalBasis && precedent.legalBasis.length > 0) {
      citations.push(
        `В соответствии с ${precedent.legalBasis[0]}, ` +
        `${precedent.applicableArguments[0] || 'применяется соответствующая норма'}.`
      );
    }
    
    if (citations.length >= 3) break;
  }
  
  return citations;
}

