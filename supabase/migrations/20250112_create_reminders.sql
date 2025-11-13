-- =====================================================
-- SCHEMA DE REMINDERS PARA SUPABASE
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca de texto

-- =====================================================
-- TABELA: reminders
-- =====================================================
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  
  -- Agendamento
  reminder_date TIMESTAMPTZ NOT NULL,
  reminder_time TIME,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  
  -- Recorrência
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_type TEXT CHECK (recurrence_type IN ('daily', 'weekly', 'monthly', 'yearly', 'custom')),
  recurrence_config JSONB DEFAULT '{}', -- { interval: 1, daysOfWeek: [1,3,5], endDate: '2025-12-31' }
  recurrence_end_date TIMESTAMPTZ,
  
  -- Notificações
  notification_enabled BOOLEAN DEFAULT TRUE,
  notification_channels TEXT[] DEFAULT ARRAY['browser'], -- ['browser', 'email', 'push']
  notification_times JSONB DEFAULT '[0]', -- Minutos antes: [0, 10, 60] = na hora, 10min antes, 1h antes
  last_notified_at TIMESTAMPTZ,
  next_notification_at TIMESTAMPTZ,
  
  -- Contexto e Localização
  location_enabled BOOLEAN DEFAULT FALSE,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_radius INTEGER DEFAULT 100, -- metros
  location_name TEXT,
  
  -- Prioridade e Categorização
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'snoozed')),
  completed_at TIMESTAMPTZ,
  snoozed_until TIMESTAMPTZ,
  
  -- Relacionamentos
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  workspace_id UUID,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to UUID[] DEFAULT '{}',
  
  -- Metadados
  metadata JSONB DEFAULT '{}', -- Para dados customizados, IA suggestions, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Índices
  CONSTRAINT reminders_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_reminders_created_by ON reminders(created_by);
CREATE INDEX IF NOT EXISTS idx_reminders_reminder_date ON reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_reminders_next_notification ON reminders(next_notification_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_task_id ON reminders(task_id);
CREATE INDEX IF NOT EXISTS idx_reminders_workspace_id ON reminders(workspace_id);
CREATE INDEX IF NOT EXISTS idx_reminders_location ON reminders(location_latitude, location_longitude) WHERE location_enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_reminders_title_search ON reminders USING gin(title gin_trgm_ops);

-- =====================================================
-- TABELA: reminder_notifications (Histórico)
-- =====================================================
CREATE TABLE IF NOT EXISTS reminder_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reminder_id UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('browser', 'email', 'push', 'sms')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'clicked')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_reminder_notifications_reminder_id ON reminder_notifications(reminder_id);
CREATE INDEX IF NOT EXISTS idx_reminder_notifications_sent_at ON reminder_notifications(sent_at DESC);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_reminders_updated_at();

-- Função para calcular próximo lembrete baseado em recorrência
CREATE OR REPLACE FUNCTION calculate_next_reminder_date(
  p_reminder_date TIMESTAMPTZ,
  p_recurrence_type TEXT,
  p_recurrence_config JSONB
)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_next_date TIMESTAMPTZ;
  v_interval INTEGER;
  v_days_of_week INTEGER[];
BEGIN
  IF p_recurrence_type IS NULL THEN
    RETURN NULL;
  END IF;
  
  v_interval := COALESCE((p_recurrence_config->>'interval')::INTEGER, 1);
  v_days_of_week := ARRAY(SELECT jsonb_array_elements_text(p_recurrence_config->'daysOfWeek'))::INTEGER[];
  
  CASE p_recurrence_type
    WHEN 'daily' THEN
      v_next_date := p_reminder_date + (v_interval || ' days')::INTERVAL;
    WHEN 'weekly' THEN
      IF array_length(v_days_of_week, 1) > 0 THEN
        -- Encontrar próximo dia da semana válido
        v_next_date := p_reminder_date + (v_interval || ' weeks')::INTERVAL;
      ELSE
        v_next_date := p_reminder_date + (v_interval || ' weeks')::INTERVAL;
      END IF;
    WHEN 'monthly' THEN
      v_next_date := p_reminder_date + (v_interval || ' months')::INTERVAL;
    WHEN 'yearly' THEN
      v_next_date := p_reminder_date + (v_interval || ' years')::INTERVAL;
    ELSE
      v_next_date := NULL;
  END CASE;
  
  RETURN v_next_date;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar next_notification_at quando reminder_date muda
CREATE OR REPLACE FUNCTION update_next_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_notification_times INTEGER[];
  v_minutes_before INTEGER;
  v_next_notification TIMESTAMPTZ;
BEGIN
  IF NEW.status != 'active' THEN
    NEW.next_notification_at := NULL;
    RETURN NEW;
  END IF;
  
  -- Pegar primeiro tempo de notificação (mais próximo)
  v_notification_times := ARRAY(SELECT jsonb_array_elements_text(NEW.notification_times))::INTEGER[];
  
  IF array_length(v_notification_times, 1) > 0 THEN
    v_minutes_before := v_notification_times[1];
    v_next_notification := NEW.reminder_date - (v_minutes_before || ' minutes')::INTERVAL;
    
    -- Se já passou, calcular próximo baseado em recorrência
    IF v_next_notification < NOW() AND NEW.is_recurring THEN
      v_next_notification := calculate_next_reminder_date(
        NEW.reminder_date,
        NEW.recurrence_type,
        NEW.recurrence_config
      ) - (v_minutes_before || ' minutes')::INTERVAL;
    END IF;
    
    NEW.next_notification_at := v_next_notification;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reminder_next_notification
  BEFORE INSERT OR UPDATE ON reminders
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION update_next_notification();

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_notifications ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: usuários podem ver seus próprios lembretes e de workspaces que participam
CREATE POLICY "Users can view their reminders"
  ON reminders FOR SELECT
  USING (
    created_by = auth.uid() OR
    auth.uid() = ANY(assigned_to) OR
    (
      workspace_id IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = reminders.workspace_id
        AND workspace_members.user_id = auth.uid()
      )
    )
  );

-- Política para INSERT: usuários podem criar lembretes
CREATE POLICY "Users can create reminders"
  ON reminders FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Política para UPDATE: usuários podem atualizar seus próprios lembretes
CREATE POLICY "Users can update their reminders"
  ON reminders FOR UPDATE
  USING (
    created_by = auth.uid() OR
    auth.uid() = ANY(assigned_to)
  );

-- Política para DELETE: usuários podem deletar seus próprios lembretes
CREATE POLICY "Users can delete their reminders"
  ON reminders FOR DELETE
  USING (created_by = auth.uid());

-- Políticas para reminder_notifications
CREATE POLICY "Users can view reminder notifications"
  ON reminder_notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reminders
      WHERE reminders.id = reminder_notifications.reminder_id
      AND (
        reminders.created_by = auth.uid() OR
        auth.uid() = ANY(reminders.assigned_to)
      )
    )
  );

CREATE POLICY "System can create reminder notifications"
  ON reminder_notifications FOR INSERT
  WITH CHECK (true); -- Permitido via função SECURITY DEFINER

-- =====================================================
-- FUNÇÃO PARA BUSCAR LEMBRETES PRÓXIMOS (para notificações)
-- =====================================================

CREATE OR REPLACE FUNCTION get_upcoming_reminders(
  p_minutes_ahead INTEGER DEFAULT 60
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  reminder_date TIMESTAMPTZ,
  notification_times JSONB,
  notification_channels TEXT[],
  created_by UUID,
  assigned_to UUID[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.title,
    r.reminder_date,
    r.notification_times,
    r.notification_channels,
    r.created_by,
    r.assigned_to
  FROM reminders r
  WHERE r.status = 'active'
    AND r.notification_enabled = TRUE
    AND r.next_notification_at IS NOT NULL
    AND r.next_notification_at <= NOW() + (p_minutes_ahead || ' minutes')::INTERVAL
    AND r.next_notification_at > NOW() - INTERVAL '5 minutes'
  ORDER BY r.next_notification_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

