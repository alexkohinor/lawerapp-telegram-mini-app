/**
 * Основные типы для Telegram Mini App
 * Основано на PROJECT_OVERVIEW.md и FEATURE_SPECIFICATION.md
 */

// Telegram User Types
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_bot: boolean;
  allows_write_to_pm?: boolean;
}

// AI Consultation Types
export interface AIConsultationRequest {
  query: string;
  context: LegalContext;
}

export interface AIConsultationResponse {
  advice: string;
  confidence: number;
  sources: LegalSource[];
  timestamp: Date;
  agent: string;
}

export interface LegalContext {
  area: 'consumer_protection' | 'labor_law' | 'civil_law' | 'criminal_law' | 'family_law';
  jurisdiction: 'russia';
  urgency: 'low' | 'medium' | 'high';
  userProfile?: {
    userId: string;
    subscriptionStatus: string;
    consultationCount: number;
  };
}

export interface LegalSource {
  id: string;
  title: string;
  type: 'law' | 'regulation' | 'precedent' | 'article';
  relevance: number;
  excerpt: string;
}

// Document Generation Types
export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: DocumentField[];
  outputFormats: ('html' | 'pdf' | 'docx')[];
}

export interface DocumentField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'boolean';
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface GeneratedDocument {
  id: string;
  templateId: string;
  content: string;
  format: 'html' | 'pdf' | 'docx';
  metadata: {
    title: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
  };
}

// Payment Types
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'telegram_stars' | 'bank_card' | 'sbp' | 'yoomoney' | 'qiwi' | 'bank_transfer';
  icon: string;
  available: boolean;
  description: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  period: 'month' | 'year';
  features: string[];
  limitations: string[];
  popular?: boolean;
}

export interface PaymentRequest {
  planId: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  userId: string;
}

// Dispute Types
export interface Dispute {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'submitted' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  documents?: string[];
  messages?: DisputeMessage[];
}

export interface DisputeMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'lawyer';
  timestamp: Date;
  attachments?: string[];
}

// Application State Types
export interface AppState {
  user: TelegramUser | null;
  isAuthenticated: boolean;
  subscription: {
    plan: string;
    status: 'active' | 'inactive' | 'expired';
    expiresAt?: Date;
  };
  consultationCount: number;
  disputes: Dispute[];
  documents: GeneratedDocument[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Security Types
export interface SecurityEvent {
  type: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  userId?: string;
  details?: Record<string, any>;
}

// Monitoring Types
export interface MonitoringMetrics {
  timestamp: Date;
  activeUsers: number;
  consultationsCount: number;
  documentsGenerated: number;
  disputesCreated: number;
  paymentSuccessRate: number;
  averageResponseTime: number;
}
