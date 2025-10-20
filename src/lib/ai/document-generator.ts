import { timeWebAI } from './timeweb-ai';
import { multiAgentSystem } from './multi-agent-system';
import { LegalPromptManager } from './legal-prompts';
import { LegalContext, GeneratedDocument, GenerationOptions } from '@/types';

/**
 * AI-генератор документов
 * Основано на FEATURE_SPECIFICATION.md и DEVELOPMENT_ROADMAP.md
 */

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  legalArea: string;
  category: 'claim' | 'contract' | 'statement' | 'lawsuit' | 'other';
  requiredFields: string[];
  optionalFields: string[];
  promptTemplate: string;
  outputFormat: 'html' | 'pdf' | 'docx';
}

interface DocumentGenerationRequest {
  templateId: string;
  data: Record<string, any>;
  context: LegalContext;
  options?: GenerationOptions;
}

interface DocumentGenerationResult {
  document: GeneratedDocument;
  confidence: number;
  suggestions: string[];
  warnings: string[];
  metadata: {
    templateUsed: string;
    agentUsed: string;
    tokensUsed: number;
    generationTime: number;
  };
}

export class DocumentGenerator {
  private templates: Map<string, DocumentTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Инициализация шаблонов документов
   */
  private initializeTemplates(): void {
    const templates: DocumentTemplate[] = [
      {
        id: 'consumer_claim',
        name: 'Претензия по ЗЗПП',
        description: 'Претензия по защите прав потребителей',
        legalArea: 'consumer_protection',
        category: 'claim',
        requiredFields: ['seller_name', 'product_description', 'problem_description', 'demands'],
        optionalFields: ['purchase_date', 'receipt_number', 'warranty_period'],
        promptTemplate: 'consumer_claim',
        outputFormat: 'html',
      },
      {
        id: 'labor_lawsuit',
        name: 'Исковое заявление по трудовому праву',
        description: 'Исковое заявление о восстановлении на работе или взыскании заработной платы',
        legalArea: 'labor',
        category: 'lawsuit',
        requiredFields: ['employer_name', 'position', 'employment_period', 'violation_description', 'demands'],
        optionalFields: ['salary_amount', 'contract_number', 'dismissal_date'],
        promptTemplate: 'labor_lawsuit',
        outputFormat: 'html',
      },
      {
        id: 'contract_template',
        name: 'Шаблон договора',
        description: 'Универсальный шаблон договора',
        legalArea: 'civil',
        category: 'contract',
        requiredFields: ['party1_name', 'party2_name', 'subject', 'terms', 'payment_terms'],
        optionalFields: ['contract_duration', 'penalty_clause', 'termination_conditions'],
        promptTemplate: 'contract_template',
        outputFormat: 'html',
      },
      {
        id: 'administrative_complaint',
        name: 'Жалоба в административные органы',
        description: 'Жалоба на действия должностных лиц',
        legalArea: 'administrative',
        category: 'statement',
        requiredFields: ['authority_name', 'violation_description', 'evidence', 'demands'],
        optionalFields: ['violation_date', 'witnesses', 'documents'],
        promptTemplate: 'administrative_complaint',
        outputFormat: 'html',
      },
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Генерация документа
   */
  async generateDocument(request: DocumentGenerationRequest): Promise<DocumentGenerationResult> {
    const startTime = Date.now();
    
    try {
      // Получаем шаблон
      const template = this.templates.get(request.templateId);
      if (!template) {
        throw new Error(`Template ${request.templateId} not found`);
      }

      // Валидируем обязательные поля
      const validationResult = this.validateRequiredFields(template, request.data);
      if (!validationResult.isValid) {
        throw new Error(`Missing required fields: ${validationResult.missingFields.join(', ')}`);
      }

      // Получаем промпт для генерации
      const prompt = LegalPromptManager.getDocumentPrompt(template.promptTemplate);
      if (!prompt) {
        throw new Error(`Prompt template ${template.promptTemplate} not found`);
      }

      // Форматируем промпт с данными
      const formattedPrompt = LegalPromptManager.formatPrompt(prompt, {
        ...request.data,
        context: JSON.stringify(request.context),
        template: template.name,
      });

      // Генерируем документ с помощью многоагентной системы
      const agentResponse = await multiAgentSystem.processQuery(
        formattedPrompt,
        request.context
      );

      // Создаем документ
      const document: GeneratedDocument = {
        id: this.generateDocumentId(),
        content: agentResponse.response,
        metadata: {
          templateId: request.templateId,
          generatedAt: new Date(),
          version: '1.0',
        },
      };

      // Форматируем документ
      const formattedDocument = await this.formatDocument(
        document,
        template,
        request.options
      );

      const generationTime = Date.now() - startTime;

      return {
        document: formattedDocument,
        confidence: agentResponse.confidence,
        suggestions: this.generateSuggestions(template, request.data),
        warnings: this.generateWarnings(template, request.data),
        metadata: {
          templateUsed: template.name,
          agentUsed: 'multi-agent-system',
          tokensUsed: 0, // Будет заполнено из ответа AI
          generationTime,
        },
      };
    } catch (error) {
      console.error('Document generation error:', error);
      throw new Error(`Failed to generate document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Получение списка доступных шаблонов
   */
  getAvailableTemplates(legalArea?: string): DocumentTemplate[] {
    const templates = Array.from(this.templates.values());
    
    if (legalArea) {
      return templates.filter(template => template.legalArea === legalArea);
    }
    
    return templates;
  }

  /**
   * Получение шаблона по ID
   */
  getTemplate(templateId: string): DocumentTemplate | null {
    return this.templates.get(templateId) || null;
  }

  /**
   * Валидация обязательных полей
   */
  private validateRequiredFields(
    template: DocumentTemplate,
    data: Record<string, any>
  ): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];

    template.requiredFields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        missingFields.push(field);
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }

  /**
   * Форматирование документа
   */
  private async formatDocument(
    document: GeneratedDocument,
    template: DocumentTemplate,
    options?: GenerationOptions
  ): Promise<GeneratedDocument> {
    const format = options?.format || template.outputFormat;
    const language = options?.language || 'ru';

    let formattedContent = document.content;

    // Добавляем заголовок и структуру
    formattedContent = this.addDocumentStructure(formattedContent, template);

    // Применяем форматирование в зависимости от типа
    switch (format) {
      case 'html':
        formattedContent = this.formatAsHTML(formattedContent, template);
        break;
      case 'pdf':
        formattedContent = this.formatAsPDF(formattedContent, template);
        break;
      case 'docx':
        formattedContent = this.formatAsDOCX(formattedContent, template);
        break;
    }

    return {
      ...document,
      content: formattedContent,
    };
  }

  /**
   * Добавление структуры документа
   */
  private addDocumentStructure(content: string, template: DocumentTemplate): string {
    const header = `
      <div class="document-header">
        <h1>${template.name}</h1>
        <p class="document-description">${template.description}</p>
        <div class="document-meta">
          <span>Дата создания: ${new Date().toLocaleDateString('ru-RU')}</span>
          <span>Тип документа: ${template.category}</span>
        </div>
      </div>
    `;

    const footer = `
      <div class="document-footer">
        <p><strong>Внимание:</strong> Данный документ сгенерирован с помощью AI и предназначен для ознакомительных целей. Рекомендуется консультация с квалифицированным юристом.</p>
        <p>Сгенерировано LawerApp • ${new Date().toLocaleDateString('ru-RU')}</p>
      </div>
    `;

    return `${header}\n<div class="document-content">${content}</div>\n${footer}`;
  }

  /**
   * Форматирование как HTML
   */
  private formatAsHTML(content: string, template: DocumentTemplate): string {
    return `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${template.name}</title>
        <style>
          body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 40px; }
          .document-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .document-content { margin: 30px 0; }
          .document-footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 0.9em; color: #666; }
          h1 { color: #333; margin-bottom: 10px; }
          h2 { color: #555; margin-top: 30px; }
          p { margin-bottom: 15px; text-align: justify; }
          .document-meta { display: flex; justify-content: space-between; margin-top: 15px; font-size: 0.9em; color: #666; }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
  }

  /**
   * Форматирование как PDF (заглушка)
   */
  private formatAsPDF(content: string, template: DocumentTemplate): string {
    // В реальном приложении здесь будет конвертация в PDF
    return this.formatAsHTML(content, template);
  }

  /**
   * Форматирование как DOCX (заглушка)
   */
  private formatAsDOCX(content: string, template: DocumentTemplate): string {
    // В реальном приложении здесь будет конвертация в DOCX
    return this.formatAsHTML(content, template);
  }

  /**
   * Генерация предложений по улучшению документа
   */
  private generateSuggestions(template: DocumentTemplate, data: Record<string, any>): string[] {
    const suggestions: string[] = [];

    // Проверяем полноту данных
    if (template.optionalFields.some(field => !data[field])) {
      suggestions.push('Рекомендуется заполнить все доступные поля для более точного документа');
    }

    // Проверяем специфичные для типа предложения
    switch (template.category) {
      case 'claim':
        suggestions.push('Приложите копии документов, подтверждающих покупку');
        suggestions.push('Укажите точную дату покупки и номер чека');
        break;
      case 'lawsuit':
        suggestions.push('Соберите все документы, связанные с трудовыми отношениями');
        suggestions.push('Рассмотрите возможность досудебного урегулирования');
        break;
      case 'contract':
        suggestions.push('Проверьте все условия договора перед подписанием');
        suggestions.push('Рассмотрите возможность нотариального заверения');
        break;
    }

    return suggestions;
  }

  /**
   * Генерация предупреждений
   */
  private generateWarnings(template: DocumentTemplate, data: Record<string, any>): string[] {
    const warnings: string[] = [];

    // Общие предупреждения
    warnings.push('Документ сгенерирован с помощью AI и требует проверки юристом');
    warnings.push('Убедитесь в актуальности всех правовых норм');

    // Специфичные предупреждения
    switch (template.legalArea) {
      case 'consumer_protection':
        warnings.push('Проверьте сроки для подачи претензии');
        break;
      case 'labor':
        warnings.push('Убедитесь в соблюдении трудового законодательства');
        break;
      case 'administrative':
        warnings.push('Проверьте сроки подачи жалобы');
        break;
    }

    return warnings;
  }

  /**
   * Генерация ID документа
   */
  private generateDocumentId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `doc_${timestamp}_${random}`;
  }
}

// Экспорт синглтона
export const documentGenerator = new DocumentGenerator();
