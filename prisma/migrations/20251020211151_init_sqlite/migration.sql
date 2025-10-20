-- CreateTable
CREATE TABLE "lawerapp_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "telegram_id" BIGINT NOT NULL,
    "telegram_username" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "subscription_plan" TEXT NOT NULL DEFAULT 'free',
    "subscription_expires_at" DATETIME,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "documents_used" INTEGER NOT NULL DEFAULT 0,
    "last_login_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "lawerapp_consultations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "legal_area" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT DEFAULT 'medium',
    "source" TEXT DEFAULT 'manual',
    "tags" JSONB DEFAULT [],
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "lawerapp_consultations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "lawerapp_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lawerapp_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "document_type" TEXT,
    "legal_area" TEXT,
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "s3_key" TEXT,
    "tags" JSONB DEFAULT [],
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "lawerapp_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "lawerapp_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lawerapp_disputes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "legal_area" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT DEFAULT 'medium',
    "dispute_type" TEXT,
    "estimated_value" REAL,
    "currency" TEXT DEFAULT 'RUB',
    "deadline" DATETIME,
    "tags" JSONB DEFAULT [],
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "lawerapp_disputes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "lawerapp_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lawerapp_payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "description" TEXT,
    "payment_method" TEXT NOT NULL,
    "payment_type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "external_id" TEXT,
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "lawerapp_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "lawerapp_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lawerapp_notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "category" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "action_url" TEXT,
    "action_text" TEXT,
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" DATETIME,
    CONSTRAINT "lawerapp_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "lawerapp_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lawerapp_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" DATETIME,
    CONSTRAINT "lawerapp_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "lawerapp_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lawerapp_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "lawerapp_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "lawerapp_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lawerapp_ai_monitoring" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "consultation_id" TEXT,
    "rag_consultation_id" TEXT,
    "model" TEXT,
    "tokens_input" INTEGER,
    "tokens_output" INTEGER,
    "response_time_ms" INTEGER,
    "cost_usd" REAL,
    "error_message" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lawerapp_ai_monitoring_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "lawerapp_consultations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "lawerapp_ai_monitoring_rag_consultation_id_fkey" FOREIGN KEY ("rag_consultation_id") REFERENCES "rag_consultations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lawerapp_timeline_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dispute_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lawerapp_timeline_events_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "lawerapp_disputes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rag_consultations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "legal_area" TEXT,
    "sources" JSONB,
    "confidence" REAL,
    "tokens_used" INTEGER NOT NULL DEFAULT 0,
    "cost_usd" REAL,
    "response_time_ms" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME,
    CONSTRAINT "rag_consultations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "lawerapp_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "processed_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "s3_key" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "chunks_count" INTEGER NOT NULL,
    "legal_area" TEXT,
    "document_type" TEXT,
    "processing_status" TEXT NOT NULL DEFAULT 'pending',
    "vector_db_ids" JSONB DEFAULT [],
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" DATETIME,
    CONSTRAINT "processed_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "lawerapp_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rag_queries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "legal_area" TEXT,
    "results" JSONB,
    "tokens_used" INTEGER NOT NULL DEFAULT 0,
    "cost_usd" REAL,
    "response_time_ms" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rag_queries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "lawerapp_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "document_chunks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "document_id" TEXT NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "start_position" INTEGER NOT NULL,
    "end_position" INTEGER NOT NULL,
    "vector_id" TEXT,
    "embedding" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "document_chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "processed_documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "lawerapp_users_telegram_id_key" ON "lawerapp_users"("telegram_id");

-- CreateIndex
CREATE UNIQUE INDEX "lawerapp_sessions_session_token_key" ON "lawerapp_sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "lawerapp_accounts_provider_provider_account_id_key" ON "lawerapp_accounts"("provider", "provider_account_id");
