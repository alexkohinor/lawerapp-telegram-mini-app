import { prisma } from '../prisma';

/**
 * Сервис для управления AI промптами
 * Позволяет загружать, обновлять и отслеживать промпты из БД
 */

export interface AIPrompt {
  id: string;
  name: string;
  systemPrompt: string | null;
  userPrompt: string | null;
  temperature: number;
  maxTokens: number;
  model: string;
}

export interface PromptUsageResult {
  promptId: string;
  success: boolean;
  responseTime: number;
  tokensUsed?: number;
  content?: string;
  error?: string;
}

/**
 * Получение промпта по типу и категории
 */
export async function getPromptByType(
  promptType: string,
  category?: string
): Promise<AIPrompt | null> {
  try {
    const prompt = await prisma.aIPromptTemplate.findFirst({
      where: {
        promptType,
        category: category || null,
        isActive: true,
        isDefault: true,
      },
      select: {
        id: true,
        name: true,
        systemPrompt: true,
        userPrompt: true,
        temperature: true,
        maxTokens: true,
        model: true,
      },
    });
    
    if (!prompt) {
      // Если не найден промпт по умолчанию, ищем любой активный
      const anyPrompt = await prisma.aIPromptTemplate.findFirst({
        where: {
          promptType,
          category: category || null,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          systemPrompt: true,
          userPrompt: true,
          temperature: true,
          maxTokens: true,
          model: true,
        },
        orderBy: {
          successRate: 'desc',
        },
      });
      
      return anyPrompt;
    }
    
    return prompt;
  } catch (error) {
    console.error('Error getting prompt:', error);
    return null;
  }
}

/**
 * Логирование использования промпта
 */
export async function logPromptUsage(
  result: PromptUsageResult & {
    userId?: string;
    disputeId?: string;
    inputData: Record<string, unknown>;
  }
): Promise<void> {
  try {
    await prisma.aIPromptUsageLog.create({
      data: {
        promptId: result.promptId,
        userId: result.userId,
        disputeId: result.disputeId,
        inputData: result.inputData,
        generatedContent: result.content,
        responseTime: result.responseTime,
        tokensUsed: result.tokensUsed,
        wasSuccessful: result.success,
        errorMessage: result.error,
      },
    });
    
    // Обновление статистики промпта
    await updatePromptStatistics(result.promptId, result.success, result.responseTime);
    
  } catch (error) {
    console.error('Error logging prompt usage:', error);
  }
}

/**
 * Обновление статистики промпта
 */
async function updatePromptStatistics(
  promptId: string,
  wasSuccessful: boolean,
  responseTime: number
): Promise<void> {
  try {
    const prompt = await prisma.aIPromptTemplate.findUnique({
      where: { id: promptId },
      select: {
        usageCount: true,
        successRate: true,
        avgResponseTime: true,
      },
    });
    
    if (!prompt) return;
    
    const newUsageCount = prompt.usageCount + 1;
    
    // Расчет нового successRate (экспоненциальное скользящее среднее)
    const alpha = 0.1; // Вес новых данных
    const currentSuccessRate = prompt.successRate || 50;
    const newSuccessRate = wasSuccessful 
      ? currentSuccessRate + alpha * (100 - currentSuccessRate)
      : currentSuccessRate - alpha * currentSuccessRate;
    
    // Расчет нового avgResponseTime
    const currentAvgResponseTime = prompt.avgResponseTime || responseTime;
    const newAvgResponseTime = Math.round(
      currentAvgResponseTime + (responseTime - currentAvgResponseTime) / newUsageCount
    );
    
    await prisma.aIPromptTemplate.update({
      where: { id: promptId },
      data: {
        usageCount: newUsageCount,
        successRate: newSuccessRate,
        avgResponseTime: newAvgResponseTime,
      },
    });
    
  } catch (error) {
    console.error('Error updating prompt statistics:', error);
  }
}

/**
 * Запись отзыва о промпте
 */
export async function submitPromptFeedback(
  logId: string,
  rating: number,
  feedback?: string
): Promise<void> {
  try {
    const log = await prisma.aIPromptUsageLog.update({
      where: { id: logId },
      data: {
        userRating: rating,
        feedback,
      },
      select: {
        promptId: true,
      },
    });
    
    // Обновление голосов промпта
    if (rating >= 4) {
      await prisma.aIPromptTemplate.update({
        where: { id: log.promptId },
        data: {
          positiveVotes: {
            increment: 1,
          },
        },
      });
    } else if (rating <= 2) {
      await prisma.aIPromptTemplate.update({
        where: { id: log.promptId },
        data: {
          negativeVotes: {
            increment: 1,
          },
        },
      });
    }
    
  } catch (error) {
    console.error('Error submitting feedback:', error);
  }
}

/**
 * Получение всех промптов для админки
 */
export async function getAllPrompts() {
  return await prisma.aIPromptTemplate.findMany({
    orderBy: [
      { isDefault: 'desc' },
      { successRate: 'desc' },
    ],
    include: {
      _count: {
        select: {
          usageLogs: true,
        },
      },
    },
  });
}

/**
 * Создание нового промпта
 */
export async function createPrompt(data: {
  name: string;
  promptType: string;
  category?: string;
  systemPrompt?: string;
  userPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
  isDefault?: boolean;
}) {
  // Если новый промпт должен быть по умолчанию, снимаем флаг с других
  if (data.isDefault) {
    await prisma.aIPromptTemplate.updateMany({
      where: {
        promptType: data.promptType,
        category: data.category || null,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }
  
  return await prisma.aIPromptTemplate.create({
    data,
  });
}

/**
 * Обновление промпта
 */
export async function updatePrompt(
  id: string,
  data: Partial<{
    name: string;
    systemPrompt: string;
    userPrompt: string;
    temperature: number;
    maxTokens: number;
    model: string;
    isActive: boolean;
    isDefault: boolean;
  }>
) {
  // Если промпт становится по умолчанию, снимаем флаг с других
  if (data.isDefault) {
    const prompt = await prisma.aIPromptTemplate.findUnique({
      where: { id },
      select: { promptType: true, category: true },
    });
    
    if (prompt) {
      await prisma.aIPromptTemplate.updateMany({
        where: {
          promptType: prompt.promptType,
          category: prompt.category,
          isDefault: true,
          id: { not: id },
        },
        data: {
          isDefault: false,
        },
      });
    }
  }
  
  return await prisma.aIPromptTemplate.update({
    where: { id },
    data,
  });
}

/**
 * Получение статистики промпта
 */
export async function getPromptStatistics(promptId: string) {
  const prompt = await prisma.aIPromptTemplate.findUnique({
    where: { id: promptId },
    include: {
      usageLogs: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
        select: {
          wasSuccessful: true,
          userRating: true,
          responseTime: true,
          tokensUsed: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          usageLogs: true,
        },
      },
    },
  });
  
  if (!prompt) return null;
  
  // Расчет статистики
  const totalUsage = prompt._count.usageLogs;
  const successfulUsage = prompt.usageLogs.filter(log => log.wasSuccessful).length;
  const averageRating = prompt.usageLogs
    .filter(log => log.userRating !== null)
    .reduce((sum, log) => sum + (log.userRating || 0), 0) / 
    (prompt.usageLogs.filter(log => log.userRating !== null).length || 1);
  
  return {
    prompt: {
      id: prompt.id,
      name: prompt.name,
      promptType: prompt.promptType,
      category: prompt.category,
      successRate: prompt.successRate,
      avgResponseTime: prompt.avgResponseTime,
      positiveVotes: prompt.positiveVotes,
      negativeVotes: prompt.negativeVotes,
    },
    statistics: {
      totalUsage,
      successfulUsage,
      failureRate: totalUsage > 0 ? ((totalUsage - successfulUsage) / totalUsage * 100) : 0,
      averageRating,
    },
    recentUsage: prompt.usageLogs,
  };
}

