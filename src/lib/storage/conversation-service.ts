import { DataEncryption } from './data-encryption';
import { DataAccessAudit } from './data-encryption';
import { LegalContext, AIConsultation } from '@/types';

/**
 * Сервис для работы с диалогами и консультациями
 * Основано на DATA_STORAGE_ARCHITECTURE.md
 */

interface ConversationSession {
  id: string;
  userId: string;
  startedAt: Date;
  lastActivity: Date;
  context: LegalContext;
  messageCount: number;
  isActive: boolean;
  expiresAt: Date;
}

interface ConversationMessage {
  id: string;
  sessionId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string; // Зашифрованное содержимое
  metadata: {
    timestamp: Date;
    tokensUsed?: number;
    cost?: number;
    confidence?: number;
    agent?: string;
    sources?: any[];
    suggestions?: any[];
  };
}

interface ConversationStats {
  totalSessions: number;
  totalMessages: number;
  averageSessionLength: number;
  mostActiveUsers: Array<{
    userId: string;
    messageCount: number;
  }>;
  popularTopics: Array<{
    legalArea: string;
    count: number;
  }>;
}

export class ConversationService {
  /**
   * Создание новой сессии диалога
   */
  async createSession(
    userId: string,
    context: LegalContext
  ): Promise<ConversationSession> {
    const sessionId = DataEncryption.generateToken();
    const now = new Date();
    
    const session: ConversationSession = {
      id: sessionId,
      userId,
      startedAt: now,
      lastActivity: now,
      context,
      messageCount: 0,
      isActive: true,
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 часа
    };

    // В реальном приложении здесь будет сохранение в базу данных
    console.log('Session created:', session);

    // Логируем создание сессии
    await DataAccessAudit.logAccess(
      userId,
      'CREATE_SESSION',
      'CONVERSATION',
      sessionId,
      { timestamp: now }
    );

    return session;
  }

  /**
   * Добавление сообщения в диалог
   */
  async addMessage(
    sessionId: string,
    userId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata: ConversationMessage['metadata'] = {}
  ): Promise<ConversationMessage> {
    const messageId = DataEncryption.generateToken();
    
    // Шифруем содержимое сообщения
    const encryptedContent = DataEncryption.encrypt(content);
    
    const message: ConversationMessage = {
      id: messageId,
      sessionId,
      userId,
      role,
      content: encryptedContent,
      metadata: {
        timestamp: new Date(),
        ...metadata,
      },
    };

    // В реальном приложении здесь будет сохранение в базу данных
    console.log('Message added:', { ...message, content: '[ENCRYPTED]' });

    // Логируем добавление сообщения
    await DataAccessAudit.logAccess(
      userId,
      'ADD_MESSAGE',
      'CONVERSATION',
      sessionId,
      { timestamp: new Date() }
    );

    return message;
  }

  /**
   * Получение истории диалога
   */
  async getConversationHistory(
    sessionId: string,
    userId: string,
    limit: number = 50
  ): Promise<ConversationMessage[]> {
    // Проверяем права доступа
    const hasAccess = await this.checkSessionAccess(sessionId, userId);
    if (!hasAccess) {
      throw new Error('Access denied to conversation');
    }

    // В реальном приложении здесь будет запрос к базе данных
    const messages: ConversationMessage[] = [];

    // Логируем доступ к истории
    await DataAccessAudit.logAccess(
      userId,
      'READ_CONVERSATION',
      'CONVERSATION',
      sessionId,
      { timestamp: new Date() }
    );

    return messages;
  }

  /**
   * Получение расшифрованных сообщений
   */
  async getDecryptedMessages(
    sessionId: string,
    userId: string,
    limit: number = 50
  ): Promise<Array<ConversationMessage & { decryptedContent: string }>> {
    const messages = await this.getConversationHistory(sessionId, userId, limit);
    
    return messages.map(message => ({
      ...message,
      decryptedContent: DataEncryption.decrypt(message.content),
    }));
  }

  /**
   * Сохранение AI консультации
   */
  async saveAIConsultation(
    consultation: AIConsultation,
    sessionId: string
  ): Promise<void> {
    // Шифруем запрос и ответ
    const encryptedQuery = DataEncryption.encrypt(consultation.query);
    const encryptedResponse = DataEncryption.encrypt(consultation.response);

    // Сохраняем консультацию
    const consultationRecord = {
      id: consultation.id,
      userId: consultation.userId,
      sessionId,
      query: encryptedQuery,
      response: encryptedResponse,
      context: consultation.context,
      confidence: consultation.confidence,
      sources: consultation.sources,
      model: consultation.model,
      tokensUsed: consultation.tokensUsed,
      cost: consultation.cost,
      createdAt: consultation.createdAt,
    };

    // В реальном приложении здесь будет сохранение в базу данных
    console.log('AI consultation saved:', { ...consultationRecord, query: '[ENCRYPTED]', response: '[ENCRYPTED]' });

    // Логируем сохранение консультации
    await DataAccessAudit.logAccess(
      consultation.userId,
      'SAVE_CONSULTATION',
      'AI_CONSULTATION',
      consultation.id,
      { timestamp: new Date() }
    );
  }

  /**
   * Получение статистики диалогов
   */
  async getConversationStats(
    userId?: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<ConversationStats> {
    // В реальном приложении здесь будет запрос к базе данных
    const stats: ConversationStats = {
      totalSessions: 0,
      totalMessages: 0,
      averageSessionLength: 0,
      mostActiveUsers: [],
      popularTopics: [],
    };

    return stats;
  }

  /**
   * Анонимизация диалогов для аналитики
   */
  async anonymizeConversations(userId: string): Promise<void> {
    // Получаем все диалоги пользователя
    const conversations = await this.getUserConversations(userId);
    
    for (const conversation of conversations) {
      // Анонимизируем содержимое
      const anonymizedContent = this.anonymizeContent(conversation.content);
      
      // Обновляем в базе данных
      await this.updateConversationContent(conversation.id, anonymizedContent);
    }

    console.log(`Anonymized ${conversations.length} conversations for user ${userId}`);
  }

  /**
   * Удаление истекших диалогов
   */
  async cleanupExpiredConversations(): Promise<void> {
    const now = new Date();
    const expiredSessions = await this.getExpiredSessions(now);
    
    for (const session of expiredSessions) {
      await this.deleteSession(session.id);
    }

    console.log(`Cleaned up ${expiredSessions.length} expired conversations`);
  }

  /**
   * Экспорт диалогов пользователя
   */
  async exportUserConversations(
    userId: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    const conversations = await this.getUserConversations(userId);
    const decryptedConversations = await Promise.all(
      conversations.map(async (conv) => ({
        ...conv,
        content: DataEncryption.decrypt(conv.content),
      }))
    );

    if (format === 'json') {
      return JSON.stringify(decryptedConversations, null, 2);
    } else {
      // CSV формат
      const csvHeader = 'id,sessionId,role,timestamp,content\n';
      const csvRows = decryptedConversations.map(conv => 
        `${conv.id},${conv.sessionId},${conv.role},${conv.metadata.timestamp.toISOString()},"${conv.content.replace(/"/g, '""')}"`
      ).join('\n');
      
      return csvHeader + csvRows;
    }
  }

  /**
   * Поиск по диалогам (только для пользователя)
   */
  async searchConversations(
    userId: string,
    query: string,
    limit: number = 20
  ): Promise<ConversationMessage[]> {
    // В реальном приложении здесь будет полнотекстовый поиск
    // с учетом шифрования данных
    const conversations = await this.getUserConversations(userId);
    
    // Фильтруем по запросу (упрощенная версия)
    const filteredConversations = conversations.filter(conv => {
      try {
        const decryptedContent = DataEncryption.decrypt(conv.content);
        return decryptedContent.toLowerCase().includes(query.toLowerCase());
      } catch (error) {
        return false;
      }
    });

    return filteredConversations.slice(0, limit);
  }

  // Приватные методы

  private async checkSessionAccess(sessionId: string, userId: string): Promise<boolean> {
    // В реальном приложении здесь будет проверка прав доступа
    return true;
  }

  private async getUserConversations(userId: string): Promise<ConversationMessage[]> {
    // В реальном приложении здесь будет запрос к базе данных
    return [];
  }

  private async getExpiredSessions(now: Date): Promise<ConversationSession[]> {
    // В реальном приложении здесь будет запрос к базе данных
    return [];
  }

  private async deleteSession(sessionId: string): Promise<void> {
    // В реальном приложении здесь будет удаление из базы данных
    console.log('Session deleted:', sessionId);
  }

  private async updateConversationContent(conversationId: string, content: string): Promise<void> {
    // В реальном приложении здесь будет обновление в базе данных
    console.log('Conversation content updated:', conversationId);
  }

  private anonymizeContent(content: string): string {
    // Анонимизируем персональные данные
    let anonymized = content;
    
    // Заменяем имена на [ИМЯ]
    anonymized = anonymized.replace(/\b[А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+\b/g, '[ИМЯ]');
    
    // Заменяем номера телефонов на [ТЕЛЕФОН]
    anonymized = anonymized.replace(/\b\+?[1-9]\d{1,14}\b/g, '[ТЕЛЕФОН]');
    
    // Заменяем email на [EMAIL]
    anonymized = anonymized.replace(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g, '[EMAIL]');
    
    return anonymized;
  }
}

// Экспорт синглтона
export const conversationService = new ConversationService();
