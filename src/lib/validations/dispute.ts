import { z } from 'zod';

export const createDisputeSchema = z.object({
  title: z.string().min(5, 'Название должно содержать минимум 5 символов').max(200, 'Название не должно превышать 200 символов'),
  description: z.string().min(20, 'Описание должно содержать минимум 20 символов').max(2000, 'Описание не должно превышать 2000 символов'),
  type: z.enum(['CONSUMER', 'LABOR', 'PROPERTY', 'OTHER'], {
    message: 'Выберите корректный тип спора'
  }),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW'], {
    message: 'Выберите корректный приоритет'
  }),
  amount: z.number().positive('Сумма должна быть положительной').optional(),
});

export const updateDisputeSchema = createDisputeSchema.partial().extend({
  status: z.enum(['ACTIVE', 'PENDING', 'RESOLVED', 'CLOSED']).optional(),
});

export const disputeQuerySchema = z.object({
  status: z.enum(['ACTIVE', 'PENDING', 'RESOLVED', 'CLOSED']).optional(),
  type: z.enum(['CONSUMER', 'LABOR', 'PROPERTY', 'OTHER']).optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const timelineEventSchema = z.object({
  type: z.enum(['CREATED', 'UPDATED', 'DOCUMENT_ADDED', 'STATUS_CHANGED', 'COMMENT_ADDED']),
  description: z.string().min(1, 'Описание события обязательно'),
});

export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
export type UpdateDisputeInput = z.infer<typeof updateDisputeSchema>;
export type DisputeQueryInput = z.infer<typeof disputeQuerySchema>;
export type TimelineEventInput = z.infer<typeof timelineEventSchema>;
