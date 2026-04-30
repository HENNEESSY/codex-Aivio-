-- business_os_logic.sql
-- Missing logical features for Aivio Business OS

CREATE TABLE IF NOT EXISTS public.workspace_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id uuid,
    email text NOT NULL,
    name text NOT NULL,
    role text NOT NULL DEFAULT 'viewer',
    status text NOT NULL DEFAULT 'active',
    invited_by uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    actor_type text NOT NULL,
    actor_id text NOT NULL,
    entity_type text NOT NULL,
    entity_id text NOT NULL,
    action text NOT NULL,
    before jsonb,
    after jsonb,
    metadata jsonb,
    ip_address text,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.outbound_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    message_id uuid NOT NULL,
    channel text NOT NULL,
    provider text NOT NULL,
    status text NOT NULL DEFAULT 'queued',
    payload jsonb,
    provider_response jsonb,
    error_message text,
    attempts integer DEFAULT 0,
    sent_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.automation_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    trigger_type text NOT NULL,
    trigger_config jsonb,
    action_type text NOT NULL,
    action_config jsonb,
    status text NOT NULL DEFAULT 'active',
    runs_count integer DEFAULT 0,
    last_run_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    deleted_by uuid
);

CREATE TABLE IF NOT EXISTS public.notification_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id uuid,
    type text NOT NULL,
    title text NOT NULL,
    body text,
    status text NOT NULL DEFAULT 'unread',
    priority text NOT NULL DEFAULT 'medium',
    entity_type text,
    entity_id text,
    created_at timestamptz NOT NULL DEFAULT now(),
    read_at timestamptz
);

-- Workspace Settings
CREATE TABLE IF NOT EXISTS public.workspace_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE UNIQUE,
    company_name text NOT NULL,
    timezone text DEFAULT 'Europe/Moscow',
    currency text DEFAULT 'RUB',
    language text DEFAULT 'ru',
    working_hours text DEFAULT '09:00-18:00',
    default_ai_model text DEFAULT 'claude-3-5-sonnet',
    auto_create_deals boolean DEFAULT true,
    auto_create_tasks boolean DEFAULT true,
    require_approval_for_replies boolean DEFAULT true,
    notifications jsonb DEFAULT '{"new_lead": true, "hot_client": true, "overdue_task": true, "ai_recommendation": true, "finance_risk": true, "channels": {"email": true, "telegram": true}}'::jsonb
);

-- Extending existing tables
DO $$ BEGIN
    -- Add probability to pipeline_stages
    ALTER TABLE public.pipeline_stages ADD COLUMN IF NOT EXISTS probability integer DEFAULT 0;
    
    -- Messages idempotency
    ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS external_message_id text;
    ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS idempotency_key text;
    ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS delivery_status text;

    -- AI Runs extensions
    ALTER TABLE public.ai_runs ADD COLUMN IF NOT EXISTS status text DEFAULT 'queued';
    ALTER TABLE public.ai_runs ADD COLUMN IF NOT EXISTS error_message text;
    ALTER TABLE public.ai_runs ADD COLUMN IF NOT EXISTS tokens_input integer;
    ALTER TABLE public.ai_runs ADD COLUMN IF NOT EXISTS tokens_output integer;
    ALTER TABLE public.ai_runs ADD COLUMN IF NOT EXISTS cost_estimate numeric;
    ALTER TABLE public.ai_runs ADD COLUMN IF NOT EXISTS latency_ms integer;

    -- Finance Transactions extensions
    ALTER TABLE public.finance_transactions ADD COLUMN IF NOT EXISTS status text DEFAULT 'actual';
    ALTER TABLE public.finance_transactions ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'manual';
    ALTER TABLE public.finance_transactions ADD COLUMN IF NOT EXISTS source_id text;
    ALTER TABLE public.finance_transactions ADD COLUMN IF NOT EXISTS direction text DEFAULT 'income';
    ALTER TABLE public.finance_transactions ADD COLUMN IF NOT EXISTS deal_id uuid REFERENCES public.deals(id) ON DELETE SET NULL;
    
    -- Soft Deletes
    ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
    ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS deleted_by uuid;
    
    ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
    ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS deleted_by uuid;
    
    ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
    ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS deleted_by uuid;
    
    ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
    ALTER TABLE public.ai_agents ADD COLUMN IF NOT EXISTS deleted_by uuid;

    ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
    ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS deleted_by uuid;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Drop obsolete or problematic policies safely (if they exist) so we can recreate if needed
-- (Assuming standard RLS setup where the user is just a workspace member)

-- Indexes for performance and idempotency
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_idempotency ON public.messages(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_channel_ext ON public.conversations(workspace_id, channel, external_chat_id);
CREATE INDEX IF NOT EXISTS idx_tasks_fetch ON public.tasks(workspace_id, status, due_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_deals_fetch ON public.deals(workspace_id, status, stage_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_finance_signals_active ON public.finance_signals(workspace_id, status, severity);
CREATE INDEX IF NOT EXISTS idx_activities_workspace_time ON public.activities(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace_time ON public.audit_logs(workspace_id, created_at DESC);
