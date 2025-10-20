import { z } from 'zod';

/**
 * Схемы валидации для споров
 * Основано на FEATURE_SPECIFICATION.md и SECURITY_GUIDELINES.md
 */

// Базовые типы
export const DisputeTypeSchema = z.enum([
  'consumer_protection',
  'labor',
  'contract',
  'property',
  'family',
  'criminal',
  'administrative'
]);

export const DisputeStatusSchema = z.enum([
  'draft',
  'active',
  'in_progress',
  'resolved',
  'closed',
  'cancelled'
]);

export const DisputePrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent'
]);

export const LegalCategorySchema = z.enum([
  'civil',
  'criminal',
  'administrative',
  'labor',
  'family',
  'tax',
  'corporate'
]);

// Схема для создания спора
export const CreateDisputeSchema = z.object({
  title: z.string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(200, 'Название не должно превышать 200 символов')
    .regex(/^[а-яё\s\d\-\.,!?()]+$/i, 'Название может содержать только русские буквы, цифры и знаки препинания'),
  
  description: z.string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(5000, 'Описание не должно превышать 5000 символов'),
  
  type: DisputeTypeSchema,
  
  category: LegalCategorySchema,
  
  priority: DisputePrioritySchema.default('medium'),
  
  amount: z.number()
    .min(0, 'Сумма не может быть отрицательной')
    .max(100000000, 'Сумма не может превышать 100,000,000 рублей')
    .optional(),
  
  currency: z.string()
    .length(3, 'Валюта должна быть в формате ISO 4217')
    .default('RUB'),
  
  deadline: z.date()
    .min(new Date(), 'Срок не может быть в прошлом')
    .optional(),
  
  tags: z.array(z.string())
    .max(10, 'Максимум 10 тегов')
    .default([]),
});

// Схема для обновления спора
export const UpdateDisputeSchema = z.object({
  title: z.string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(200, 'Название не должно превышать 200 символов')
    .optional(),
  
  description: z.string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(5000, 'Описание не должно превышать 5000 символов')
    .optional(),
  
  status: DisputeStatusSchema.optional(),
  
  priority: DisputePrioritySchema.optional(),
  
  amount: z.number()
    .min(0, 'Сумма не может быть отрицательной')
    .max(100000000, 'Сумма не может превышать 100,000,000 рублей')
    .optional(),
  
  deadline: z.date()
    .min(new Date(), 'Срок не может быть в прошлом')
    .optional(),
  
  tags: z.array(z.string())
    .max(10, 'Максимум 10 тегов')
    .optional(),
});

// Схема для сообщений в споре
export const CreateDisputeMessageSchema = z.object({
  content: z.string()
    .min(1, 'Сообщение не может быть пустым')
    .max(10000, 'Сообщение не должно превышать 10000 символов'),
  
  type: z.enum(['text', 'document', 'ai_response', 'system']).default('text'),
  
  attachments: z.array(z.object({
    filename: z.string().min(1, 'Имя файла обязательно'),
    mimeType: z.string().min(1, 'Тип файла обязателен'),
    size: z.number().min(1, 'Размер файла должен быть больше 0'),
    url: z.string().url('Некорректный URL файла'),
  })).max(5, 'Максимум 5 вложений').default([]),
});

// Схема для поиска споров
export const SearchDisputesSchema = z.object({
  query: z.string().max(100, 'Поисковый запрос не должен превышать 100 символов').optional(),
  
  status: DisputeStatusSchema.optional(),
  
  type: DisputeTypeSchema.optional(),
  
  priority: DisputePrioritySchema.optional(),
  
  category: LegalCategorySchema.optional(),
  
  dateFrom: z.date().optional(),
  
  dateTo: z.date().optional(),
  
  amountFrom: z.number().min(0).optional(),
  
  amountTo: z.number().min(0).optional(),
  
  tags: z.array(z.string()).max(10).optional(),
  
  page: z.number().min(1).default(1),
  
  limit: z.number().min(1).max(100).default(20),
  
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'amount', 'priority']).default('updatedAt'),
  
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Схема для фильтров споров
export const DisputeFiltersSchema = z.object({
  status: z.array(DisputeStatusSchema).optional(),
  type: z.array(DisputeTypeSchema).optional(),
  priority: z.array(DisputePrioritySchema).optional(),
  category: z.array(LegalCategorySchema).optional(),
  tags: z.array(z.string()).optional(),
  hasDeadline: z.boolean().optional(),
  hasAmount: z.boolean().optional(),
});

// Типы для TypeScript
export type CreateDisputeRequest = z.infer<typeof CreateDisputeSchema>;
export type UpdateDisputeRequest = z.infer<typeof UpdateDisputeSchema>;
export type CreateDisputeMessageRequest = z.infer<typeof CreateDisputeMessageSchema>;
export type SearchDisputesRequest = z.infer<typeof SearchDisputesSchema>;
export type DisputeFilters = z.infer<typeof DisputeFiltersSchema>;

// Валидационные функции
export function validateCreateDispute(data: unknown): CreateDisputeRequest {
  return CreateDisputeSchema.parse(data);
}

export function validateUpdateDispute(data: unknown): UpdateDisputeRequest {
  return UpdateDisputeSchema.parse(data);
}

export function validateCreateDisputeMessage(data: unknown): CreateDisputeMessageRequest {
  return CreateDisputeMessageSchema.parse(data);
}

export function validateSearchDisputes(data: unknown): SearchDisputesRequest {
  return SearchDisputesSchema.parse(data);
}

export function validateDisputeFilters(data: unknown): DisputeFilters {
  return DisputeFiltersSchema.parse(data);
}
