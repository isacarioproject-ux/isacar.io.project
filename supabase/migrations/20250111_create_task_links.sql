-- =====================================================
-- TABELA: task_links
-- =====================================================
CREATE TABLE IF NOT EXISTS task_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  favicon_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_links_task_id ON task_links(task_id);
CREATE INDEX IF NOT EXISTS idx_task_links_created_at ON task_links(created_at DESC);

-- RLS Policies
ALTER TABLE task_links ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver links de tarefas que têm acesso
CREATE POLICY "Users can view links of accessible tasks"
  ON task_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_links.task_id
      AND (
        tasks.created_by = auth.uid()
        OR auth.uid() = ANY(tasks.assigned_to)
        OR EXISTS (
          SELECT 1 FROM workspace_members
          WHERE workspace_members.workspace_id = tasks.workspace_id
          AND workspace_members.user_id = auth.uid()
        )
      )
    )
  );

-- Política: Usuários podem criar links em tarefas que têm acesso
CREATE POLICY "Users can create links in accessible tasks"
  ON task_links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_links.task_id
      AND (
        tasks.created_by = auth.uid()
        OR auth.uid() = ANY(tasks.assigned_to)
        OR EXISTS (
          SELECT 1 FROM workspace_members
          WHERE workspace_members.workspace_id = tasks.workspace_id
          AND workspace_members.user_id = auth.uid()
        )
      )
    )
    AND task_links.created_by = auth.uid()
  );

-- Política: Usuários podem atualizar seus próprios links
CREATE POLICY "Users can update their own links"
  ON task_links FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Política: Usuários podem deletar seus próprios links
CREATE POLICY "Users can delete their own links"
  ON task_links FOR DELETE
  USING (created_by = auth.uid());

