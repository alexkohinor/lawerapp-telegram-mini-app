export interface Dispute {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: 'CONSUMER' | 'LABOR' | 'PROPERTY' | 'OTHER';
  status: 'ACTIVE' | 'PENDING' | 'RESOLVED' | 'CLOSED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  amount: number | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  documents: Document[];
  timeline: TimelineEvent[];
}

export interface Document {
  id: string;
  userId: string;
  disputeId: string | null;
  title: string;
  content: string | null;
  documentType: string | null;
  filePath: string | null;
  fileSize: number | null;
  mimeType: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineEvent {
  id: string;
  disputeId: string;
  type: 'CREATED' | 'UPDATED' | 'DOCUMENT_ADDED' | 'STATUS_CHANGED' | 'COMMENT_ADDED';
  description: string;
  userId: string;
  createdAt: Date;
}

export interface DisputeFilters {
  status?: 'ACTIVE' | 'PENDING' | 'RESOLVED' | 'CLOSED';
  type?: 'CONSUMER' | 'LABOR' | 'PROPERTY' | 'OTHER';
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface DisputeStats {
  total: number;
  active: number;
  pending: number;
  resolved: number;
  closed: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

export const DISPUTE_TYPES = {
  CONSUMER: 'Потребительские споры',
  LABOR: 'Трудовые споры',
  PROPERTY: 'Имущественные споры',
  OTHER: 'Прочие споры',
} as const;

export const DISPUTE_STATUSES = {
  ACTIVE: 'Активный',
  PENDING: 'В ожидании',
  RESOLVED: 'Решен',
  CLOSED: 'Закрыт',
} as const;

export const DISPUTE_PRIORITIES = {
  HIGH: 'Высокий',
  MEDIUM: 'Средний',
  LOW: 'Низкий',
} as const;
