-- Схема базы данных для LawerApp
-- Использует существующую PostgreSQL из advokat-fomin.ru

-- Таблица пользователей (расширение существующей)
CREATE TABLE IF NOT EXISTS lawerapp_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT UNIQUE NOT NULL,
    telegram_username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    subscription_plan VARCHAR(50) DEFAULT 'free',
    subscription_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Таблица AI консультаций
CREATE TABLE IF NOT EXISTS lawerapp_consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES lawerapp_users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT,
    legal_area VARCHAR(100), -- 'labor', 'housing', 'family', 'civil', 'consumer'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Таблица споров
CREATE TABLE IF NOT EXISTS lawerapp_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES lawerapp_users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    legal_area VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'resolved', 'closed'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    estimated_value DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Таблица документов
CREATE TABLE IF NOT EXISTS lawerapp_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES lawerapp_users(id) ON DELETE CASCADE,
    dispute_id UUID REFERENCES lawerapp_disputes(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    document_type VARCHAR(100), -- 'pretenziya', 'isk', 'contract', 'agreement'
    file_path VARCHAR(500), -- путь к файлу в S3
    file_size INTEGER,
    mime_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'generated', 'signed', 'sent'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица платежей
CREATE TABLE IF NOT EXISTS lawerapp_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES lawerapp_users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    payment_method VARCHAR(50), -- 'yookassa', 'yoomoney', 'qiwi', 'sbp', 'telegram_stars'
    payment_provider_id VARCHAR(255), -- ID платежа в системе провайдера
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'refunded'
    subscription_plan VARCHAR(50),
    subscription_period INTEGER, -- количество месяцев
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    metadata JSONB -- дополнительные данные платежа
);

-- Таблица уведомлений
CREATE TABLE IF NOT EXISTS lawerapp_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES lawerapp_users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- 'consultation_completed', 'dispute_updated', 'payment_success', 'subscription_expired'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    telegram_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP
);

-- Таблица сессий (для NextAuth)
CREATE TABLE IF NOT EXISTS lawerapp_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES lawerapp_users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица верификации аккаунтов
CREATE TABLE IF NOT EXISTS lawerapp_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES lawerapp_users(id) ON DELETE CASCADE,
    account_id VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL, -- 'telegram', 'google', 'yandex'
    provider_account_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(provider, provider_account_id)
);

-- Таблица мониторинга AI
CREATE TABLE IF NOT EXISTS lawerapp_ai_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES lawerapp_consultations(id) ON DELETE CASCADE,
    model VARCHAR(100), -- 'gpt-4', 'gpt-3.5-turbo'
    tokens_input INTEGER,
    tokens_output INTEGER,
    response_time_ms INTEGER,
    cost_usd DECIMAL(10,6),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_lawerapp_users_telegram_id ON lawerapp_users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_lawerapp_consultations_user_id ON lawerapp_consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_lawerapp_consultations_status ON lawerapp_consultations(status);
CREATE INDEX IF NOT EXISTS idx_lawerapp_disputes_user_id ON lawerapp_disputes(user_id);
CREATE INDEX IF NOT EXISTS idx_lawerapp_disputes_status ON lawerapp_disputes(status);
CREATE INDEX IF NOT EXISTS idx_lawerapp_documents_user_id ON lawerapp_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_lawerapp_payments_user_id ON lawerapp_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_lawerapp_payments_status ON lawerapp_payments(status);
CREATE INDEX IF NOT EXISTS idx_lawerapp_notifications_user_id ON lawerapp_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_lawerapp_notifications_is_read ON lawerapp_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_lawerapp_sessions_user_id ON lawerapp_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_lawerapp_sessions_expires_at ON lawerapp_sessions(expires_at);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_lawerapp_users_updated_at BEFORE UPDATE ON lawerapp_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lawerapp_disputes_updated_at BEFORE UPDATE ON lawerapp_disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lawerapp_documents_updated_at BEFORE UPDATE ON lawerapp_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
