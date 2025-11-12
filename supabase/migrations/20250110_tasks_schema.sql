-- =====================================================
-- SCHEMA DE TASKS PARA SUPABASE
-- =====================================================

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: tasks
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID,
  list_id UUID,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  location TEXT,
  workspace TEXT,
  
  -- Índices para performance
  CONSTRAINT tasks_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tasks_creator_id ON tasks(creator_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- =====================================================
-- TABELA: task_assignees (muitos-para-muitos)
-- =====================================================
CREATE TABLE IF NOT EXISTS task_assignees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(task_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_task_assignees_task_id ON task_assignees(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_user_id ON task_assignees(user_id);

-- =====================================================
-- TABELA: task_tags (muitos-para-muitos)
-- =====================================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  
  UNIQUE(task_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_tag_id ON task_tags(tag_id);

-- =====================================================
-- TABELA: task_custom_fields
-- =====================================================
CREATE TABLE IF NOT EXISTS task_custom_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'number', 'date', 'select', 'multiselect')),
  value JSONB,
  options JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_custom_fields_task_id ON task_custom_fields(task_id);

-- =====================================================
-- TABELA: task_comments
-- =====================================================
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  mentions UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON task_comments(created_at DESC);

-- =====================================================
-- TABELA: task_activities
-- =====================================================
CREATE TABLE IF NOT EXISTS task_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_activities_task_id ON task_activities(task_id);
CREATE INDEX IF NOT EXISTS idx_task_activities_created_at ON task_activities(created_at DESC);

-- =====================================================
-- TABELA: task_checklists
-- =====================================================
CREATE TABLE IF NOT EXISTS task_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID NOT NULL REFERENCES task_checklists(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_checklists_task_id ON task_checklists(task_id);
CREATE INDEX IF NOT EXISTS idx_task_checklist_items_checklist_id ON task_checklist_items(checklist_id);

-- =====================================================
-- TABELA: task_attachments
-- =====================================================
CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;

-- Políticas para tasks
CREATE POLICY "Users can view tasks they created or are assigned to"
  ON tasks FOR SELECT
  USING (
    auth.uid() = creator_id OR
    EXISTS (
      SELECT 1 FROM task_assignees
      WHERE task_assignees.task_id = tasks.id
      AND task_assignees.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own tasks or assigned tasks"
  ON tasks FOR UPDATE
  USING (
    auth.uid() = creator_id OR
    EXISTS (
      SELECT 1 FROM task_assignees
      WHERE task_assignees.task_id = tasks.id
      AND task_assignees.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = creator_id);

-- Políticas para task_assignees
CREATE POLICY "Users can view assignees of their tasks"
  ON task_assignees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_assignees.task_id
      AND (tasks.creator_id = auth.uid() OR task_assignees.user_id = auth.uid())
    )
  );

CREATE POLICY "Task creators can manage assignees"
  ON task_assignees FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_assignees.task_id
      AND tasks.creator_id = auth.uid()
    )
  );

-- Políticas para comments
CREATE POLICY "Users can view comments on their tasks"
  ON task_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_comments.task_id
      AND (
        tasks.creator_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM task_assignees
          WHERE task_assignees.task_id = tasks.id
          AND task_assignees.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create comments on their tasks"
  ON task_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_comments.task_id
      AND (
        tasks.creator_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM task_assignees
          WHERE task_assignees.task_id = tasks.id
          AND task_assignees.user_id = auth.uid()
        )
      )
    )
  );

-- Políticas similares para outras tabelas
CREATE POLICY "Users can view activities on their tasks"
  ON task_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_activities.task_id
      AND (
        tasks.creator_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM task_assignees
          WHERE task_assignees.task_id = tasks.id
          AND task_assignees.user_id = auth.uid()
        )
      )
    )
  );

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at
  BEFORE UPDATE ON task_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para registrar atividades automaticamente
CREATE OR REPLACE FUNCTION log_task_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO task_activities (task_id, user_id, action, details)
    VALUES (NEW.id, NEW.creator_id, 'created', 'criou a tarefa');
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO task_activities (task_id, user_id, action, details)
      VALUES (NEW.id, auth.uid(), 'status_changed', 'alterou o status para ' || NEW.status);
    END IF;
    IF OLD.priority != NEW.priority THEN
      INSERT INTO task_activities (task_id, user_id, action, details)
      VALUES (NEW.id, auth.uid(), 'priority_changed', 'definiu a prioridade como ' || NEW.priority);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_task_changes
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION log_task_activity();
