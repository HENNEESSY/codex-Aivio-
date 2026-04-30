CREATE TABLE IF NOT EXISTS public.ai_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  role text,
  description text,
  status text NOT NULL DEFAULT 'draft',
  system_prompt text NOT NULL,
  model text NOT NULL DEFAULT 'claude-3-5-sonnet',
  autonomy_level text DEFAULT 'advice_only',
  channels text[] DEFAULT '{}',
  stats jsonb DEFAULT '{"messages_processed": 0, "tasks_created": 0, "deals_found": 0}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace members can manage ai_agents"
ON public.ai_agents FOR ALL
USING (public.is_workspace_member(workspace_id));
