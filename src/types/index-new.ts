/**
 * Типы для LawerApp
 * Основано на ARCHITECTURE.md и FEATURE_SPECIFICATION.md
 */

// Telegram типы
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setParams: (params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  CloudStorage: {
    setItem: (key: string, value: string, callback?: (error: string | null, result?: boolean) => void) => void;
    getItem: (key: string, callback: (error: string | null, result?: string) => void) => void;
    getItems: (keys: string[], callback: (error: string | null, result?: Record<string, string>) => void) => void;
    removeItem: (key: string, callback?: (error: string | null, result?: boolean) => void) => void;
    removeItems: (keys: string[], callback?: (error: string | null, result?: boolean) => void) => void;
    getKeys: (callback: (error: string | null, result?: string[]) => void) => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  sendData: (data: string) => void;
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text?: string;
    }>;
  }, callback?: (buttonId: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  showScanQrPopup: (params: {
    text?: string;
  }, callback?: (text: string) => void) => void;
  closeScanQrPopup: () => void;
  readTextFromClipboard: (callback?: (text: string) => void) => void;
  requestWriteAccess: (callback?: (granted: boolean) => void) => void;
  requestContact: (callback?: (granted: boolean) => void) => void;
}

// Dispute типы
export enum DisputeType {
  CONSUMER_PROTECTION = 'consumer_protection',
  LABOR = 'labor',
  CIVIL = 'civil',
  ADMINISTRATIVE = 'administrative',
  FAMILY = 'family',
  TAX = 'tax',
  CORPORATE = 'corporate',
}

export enum DisputeStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

export interface Dispute {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: DisputeType;
  status: DisputeStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  attachments: Attachment[];
  messages: DisputeMessage[];
}

export interface DisputeMessage {
  id: string;
  disputeId: string;
  userId: string;
  content: string;
  type: 'text' | 'document' | 'image' | 'audio';
  createdAt: Date;
  attachments?: Attachment[];
}

export interface CreateDisputeRequest {
  title: string;
  description: string;
  type: DisputeType;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  attachments?: Attachment[];
}

export interface UpdateDisputeRequest {
  title?: string;
  description?: string;
  status?: DisputeStatus;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

// Document типы
export enum DocumentType {
  CLAIM = 'claim',
  CONTRACT = 'contract',
  STATEMENT = 'statement',
  LAWSUIT = 'lawsuit',
  OTHER = 'other',
}

export interface Document {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: DocumentType;
  status: 'draft' | 'final' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  templateId?: string;
  metadata?: Record<string, any>;
}

export interface CreateDocumentRequest {
  title: string;
  content: string;
  type: DocumentType;
  templateId?: string;
  metadata?: Record<string, any>;
}

// AI типы
export interface AIConsultationRequest {
  query: string;
  context?: LegalContext;
  userId: string;
}

export interface AIConsultationResponse {
  advice: string;
  confidence: number;
  sources: LegalSource[];
  suggestions?: AISuggestion[];
  reasoning?: string;
  agent?: string;
  timestamp: Date;
}

export interface LegalSource {
  id: string;
  title: string;
  type: 'law' | 'regulation' | 'case' | 'article';
  url?: string;
  relevance: number;
  excerpt: string;
}

export interface AISuggestion {
  id: string;
  type: 'action' | 'document' | 'contact' | 'research';
  title: string;
  description: string;
  confidence: number;
  action?: {
    type: string;
    parameters: Record<string, any>;
  };
}

export interface LegalContext {
  area: 'civil' | 'criminal' | 'administrative' | 'labor' | 'family' | 'tax' | 'corporate' | 'consumer_protection';
  jurisdiction: 'russia';
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  disputeType?: string;
  userProfile?: {
    userId: string;
    subscriptionStatus: string;
    consultationCount: number;
  };
}

export interface AIConsultation {
  id: string;
  userId: string;
  query: string;
  context: LegalContext;
  response: string;
  confidence: number;
  sources: LegalSource[];
  model: string;
  tokensUsed: number;
  cost: number;
  createdAt: Date;
}

// Document Generation типы
export interface GeneratedDocument {
  id: string;
  content: string;
  metadata: {
    templateId: string;
    generatedAt: Date;
    version: string;
    templateUsed?: string;
    agentUsed?: string;
    confidence?: number;
  };
}

export interface GenerationOptions {
  format?: 'html' | 'pdf' | 'docx';
  language?: 'ru' | 'en';
  includeMetadata?: boolean;
  customStyling?: boolean;
}

export interface DocumentTemplate {
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

export interface DocumentGenerationRequest {
  templateId: string;
  data: Record<string, any>;
  context: LegalContext;
  options?: GenerationOptions;
}

export interface DocumentGenerationResult {
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

// Payment типы
export type PaymentMethod = 'telegram_stars' | 'bank_card' | 'sbp' | 'yoomoney' | 'qiwi';

export interface PaymentRequest {
  method: PaymentMethod;
  amount: number;
  currency: string;
  description: string;
  userId: string;
  plan: SubscriptionPlan;
  cardData?: {
    number: string;
    expiry: string;
    cvv: string;
    holder: string;
  };
  yoomoneyAccount?: string;
  qiwiAccount?: string;
}

export interface PaymentResult {
  id: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  method: PaymentMethod;
  amount: number;
  currency: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  period: 'month' | 'year';
  features: string[];
  limitations?: string[];
  popular?: boolean;
  icon?: React.ReactNode;
  color?: string;
  badge?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
}

// API типы
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Form типы
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Store типы
export interface AppState {
  // Auth state
  user: TelegramUser | null;
  isAuthenticated: boolean;
  
  // Disputes state
  disputes: Dispute[];
  currentDispute: Dispute | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (user: TelegramUser) => void;
  logout: () => void;
  loadDisputes: () => Promise<void>;
  createDispute: (dispute: CreateDisputeRequest) => Promise<void>;
  updateDispute: (id: string, dispute: UpdateDisputeRequest) => Promise<void>;
  deleteDispute: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Attachment типы
export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
}
