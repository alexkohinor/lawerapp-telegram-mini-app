import { timeWebAI } from './timeweb-ai';
import { ragService } from './rag-service';
import { LegalContext, AISuggestion } from '@/types';

/**
 * Многоагентная система AI для правовых консультаций
 * Основано на FEATURE_SPECIFICATION.md
 */

interface AgentResponse {
  response: string;
  confidence: number;
  suggestions: AISuggestion[];
  sources: any[];
  reasoning: string;
}

interface AgentCapabilities {
  canHandle: (context: LegalContext) => boolean;
  priority: number;
  name: string;
  description: string;
}

/**
 * Базовый класс для AI агентов
 */
abstract class LegalAgent {
  abstract name: string;
  abstract description: string;
  abstract capabilities: AgentCapabilities;

  abstract processQuery(query: string, context: LegalContext): Promise<AgentResponse>;

  canHandle(context: LegalContext): boolean {
    return this.capabilities.canHandle(context);
  }
}

/**
 * Агент по защите прав потребителей
 */
class ConsumerProtectionAgent extends LegalAgent {
  name = 'Consumer Protection Agent';
  description = 'Специализируется на вопросах защиты прав потребителей, возврата товаров, качества услуг';
  
  capabilities = {
    canHandle: (context: LegalContext) => context.area === 'consumer_protection',
    priority: 1,
    name: this.name,
    description: this.description,
  };

  async processQuery(query: string, context: LegalContext): Promise<AgentResponse> {
    try {
      // Поиск в специализированной базе знаний
      const searchResults = await ragService.searchLegalKnowledge(query, {
        ...context,
        area: 'consumer_protection',
      }, {
        limit: 5,
        threshold: 0.8,
      });

      // Генерация специализированного ответа
      const consultation = await timeWebAI.getLegalConsultation(
        `[ЗАЩИТА ПРАВ ПОТРЕБИТЕЛЕЙ] ${query}`,
        {
          ...context,
          area: 'consumer_protection',
        }
      );

      // Генерация предложений действий
      const suggestions = await this.generateConsumerProtectionSuggestions(query, context);

      return {
        response: consultation.response,
        confidence: consultation.confidence,
        suggestions,
        sources: consultation.sources,
        reasoning: 'Анализ проведен с использованием специализированной базы знаний по защите прав потребителей',
      };
    } catch (error) {
      console.error('Consumer Protection Agent error:', error);
      throw error;
    }
  }

  private async generateConsumerProtectionSuggestions(
    query: string,
    context: LegalContext
  ): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];

    // Анализируем запрос и генерируем релевантные предложения
    if (query.toLowerCase().includes('возврат') || query.toLowerCase().includes('товар')) {
      suggestions.push({
        id: '1',
        type: 'document',
        title: 'Составить претензию',
        description: 'Создать официальную претензию по ЗЗПП',
        confidence: 0.9,
        action: {
          type: 'generate_document',
          parameters: {
            template: 'consumer_claim',
            disputeType: 'consumer_protection',
          },
        },
      });
    }

    if (query.toLowerCase().includes('некачественный') || query.toLowerCase().includes('брак')) {
      suggestions.push({
        id: '2',
        type: 'action',
        title: 'Провести экспертизу',
        description: 'Рекомендуется провести независимую экспертизу товара',
        confidence: 0.8,
        action: {
          type: 'contact_lawyer',
          parameters: {
            specialty: 'consumer_protection',
            urgency: 'medium',
          },
        },
      });
    }

    return suggestions;
  }
}

/**
 * Агент по трудовому праву
 */
class LaborLawAgent extends LegalAgent {
  name = 'Labor Law Agent';
  description = 'Специализируется на трудовых спорах, увольнениях, зарплатах, трудовых договорах';
  
  capabilities = {
    canHandle: (context: LegalContext) => context.area === 'labor',
    priority: 1,
    name: this.name,
    description: this.description,
  };

  async processQuery(query: string, context: LegalContext): Promise<AgentResponse> {
    try {
      const searchResults = await ragService.searchLegalKnowledge(query, {
        ...context,
        area: 'labor',
      }, {
        limit: 5,
        threshold: 0.8,
      });

      const consultation = await timeWebAI.getLegalConsultation(
        `[ТРУДОВОЕ ПРАВО] ${query}`,
        {
          ...context,
          area: 'labor',
        }
      );

      const suggestions = await this.generateLaborLawSuggestions(query, context);

      return {
        response: consultation.response,
        confidence: consultation.confidence,
        suggestions,
        sources: consultation.sources,
        reasoning: 'Анализ проведен с использованием Трудового кодекса РФ и судебной практики',
      };
    } catch (error) {
      console.error('Labor Law Agent error:', error);
      throw error;
    }
  }

  private async generateLaborLawSuggestions(
    query: string,
    context: LegalContext
  ): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];

    if (query.toLowerCase().includes('увольнение') || query.toLowerCase().includes('уволили')) {
      suggestions.push({
        id: '1',
        type: 'document',
        title: 'Составить исковое заявление',
        description: 'Создать исковое заявление о восстановлении на работе',
        confidence: 0.9,
        action: {
          type: 'generate_document',
          parameters: {
            template: 'labor_lawsuit',
            disputeType: 'labor',
          },
        },
      });
    }

    if (query.toLowerCase().includes('зарплата') || query.toLowerCase().includes('задержка')) {
      suggestions.push({
        id: '2',
        type: 'action',
        title: 'Обратиться в трудовую инспекцию',
        description: 'Подать жалобу в Государственную трудовую инспекцию',
        confidence: 0.8,
        action: {
          type: 'file_complaint',
          parameters: {
            authority: 'labor_inspection',
            urgency: 'high',
          },
        },
      });
    }

    return suggestions;
  }
}

/**
 * Агент по гражданскому праву
 */
class CivilLawAgent extends LegalAgent {
  name = 'Civil Law Agent';
  description = 'Специализируется на гражданских спорах, договорах, недвижимости, наследстве';
  
  capabilities = {
    canHandle: (context: LegalContext) => context.area === 'civil',
    priority: 2,
    name: this.name,
    description: this.description,
  };

  async processQuery(query: string, context: LegalContext): Promise<AgentResponse> {
    try {
      const searchResults = await ragService.searchLegalKnowledge(query, {
        ...context,
        area: 'civil',
      }, {
        limit: 5,
        threshold: 0.7,
      });

      const consultation = await timeWebAI.getLegalConsultation(
        `[ГРАЖДАНСКОЕ ПРАВО] ${query}`,
        {
          ...context,
          area: 'civil',
        }
      );

      const suggestions = await this.generateCivilLawSuggestions(query, context);

      return {
        response: consultation.response,
        confidence: consultation.confidence,
        suggestions,
        sources: consultation.sources,
        reasoning: 'Анализ проведен с использованием Гражданского кодекса РФ и судебной практики',
      };
    } catch (error) {
      console.error('Civil Law Agent error:', error);
      throw error;
    }
  }

  private async generateCivilLawSuggestions(
    query: string,
    context: LegalContext
  ): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];

    if (query.toLowerCase().includes('договор') || query.toLowerCase().includes('соглашение')) {
      suggestions.push({
        id: '1',
        type: 'document',
        title: 'Составить договор',
        description: 'Создать правовой документ с учетом ваших требований',
        confidence: 0.8,
        action: {
          type: 'generate_document',
          parameters: {
            template: 'contract_template',
            disputeType: 'contract',
          },
        },
      });
    }

    return suggestions;
  }

}

/**
 * Главный координатор многоагентной системы
 */
export class MultiAgentSystem {
  private agents: LegalAgent[] = [];

  constructor() {
    // Инициализируем агентов
    this.agents = [
      new ConsumerProtectionAgent(),
      new LaborLawAgent(),
      new CivilLawAgent(),
    ];
  }

  /**
   * Обработка запроса с использованием подходящего агента
   */
  async processQuery(query: string, context: LegalContext): Promise<AgentResponse> {
    try {
      // Находим подходящего агента
      const suitableAgents = this.agents
        .filter(agent => agent.canHandle(context))
        .sort((a, b) => a.capabilities.priority - b.capabilities.priority);

      if (suitableAgents.length === 0) {
        // Если нет специализированного агента, используем общий подход
        return await this.processWithGeneralAgent(query, context);
      }

      // Используем агента с наивысшим приоритетом
      const selectedAgent = suitableAgents[0];
      
      console.log(`Using agent: ${selectedAgent.name}`);
      
      return await selectedAgent.processQuery(query, context);
    } catch (error) {
      console.error('Multi-agent system error:', error);
      throw new Error('Ошибка обработки запроса в многоагентной системе');
    }
  }

  /**
   * Обработка с общим агентом
   */
  private async processWithGeneralAgent(query: string, context: LegalContext): Promise<AgentResponse> {
    try {
      const consultation = await timeWebAI.getLegalConsultation(query, context);
      
      return {
        response: consultation.response,
        confidence: consultation.confidence,
        suggestions: [],
        sources: consultation.sources,
        reasoning: 'Обработка выполнена общим агентом без специализации',
      };
    } catch (error) {
      console.error('General agent error:', error);
      throw error;
    }
  }

  /**
   * Получение списка доступных агентов
   */
  getAvailableAgents(): Array<{
    name: string;
    description: string;
    capabilities: AgentCapabilities;
  }> {
    return this.agents.map(agent => ({
      name: agent.name,
      description: agent.description,
      capabilities: agent.capabilities,
    }));
  }

  /**
   * Проверка здоровья всех агентов
   */
  async healthCheck(): Promise<{
    overall: boolean;
    agents: Record<string, boolean>;
  }> {
    const agentHealth: Record<string, boolean> = {};
    
    for (const agent of this.agents) {
      try {
        // Простая проверка - можем ли агент обработать базовый запрос
        const testContext: LegalContext = {
          area: 'civil',
          jurisdiction: 'russia',
          urgency: 'low',
        };
        
        agentHealth[agent.name] = agent.canHandle(testContext);
      } catch (error) {
        agentHealth[agent.name] = false;
      }
    }

    const overall = Object.values(agentHealth).every(healthy => healthy);

    return {
      overall,
      agents: agentHealth,
    };
  }
}

// Экспорт синглтона
export const multiAgentSystem = new MultiAgentSystem();
