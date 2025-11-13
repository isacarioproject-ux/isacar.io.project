-- Fix RLS policies for task_activities
-- Adicionar política de INSERT para permitir que triggers e usuários criem atividades

-- Primeiro, remover política antiga se existir (para evitar conflitos)
DROP POLICY IF EXISTS "Users can create activities on their tasks" ON task_activities;

-- Política para INSERT: Permitir inserção de atividades
-- Permitir inserções quando a task existe e o user_id é válido
CREATE POLICY "Users can create activities on their tasks"
  ON task_activities FOR INSERT
  WITH CHECK (
    -- Verificar se a task existe
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_activities.task_id
    )
    AND
    (
      -- Caso 1: Usuário autenticado criando atividade em sua própria tarefa
      (
        task_activities.user_id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM tasks
          WHERE tasks.id = task_activities.task_id
          AND (
            tasks.created_by = auth.uid() OR
            auth.uid() = ANY(tasks.assigned_to)
          )
        )
      )
      OR
      -- Caso 2: Função SECURITY DEFINER inserindo (trigger)
      -- Permitir se user_id corresponde ao creator_id da task
      -- Isso permite que o trigger insira atividades automaticamente
      (
        EXISTS (
          SELECT 1 FROM tasks
          WHERE tasks.id = task_activities.task_id
          AND tasks.created_by = task_activities.user_id
        )
      )
    )
  );

-- Atualizar a função para garantir que funcione corretamente
-- A função SECURITY DEFINER deve poder inserir, mas vamos melhorar ela
CREATE OR REPLACE FUNCTION log_task_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Obter o user_id correto dependendo da operação
  IF TG_OP = 'INSERT' THEN
    v_user_id := NEW.created_by;
    INSERT INTO task_activities (task_id, user_id, action, details)
    VALUES (NEW.id, v_user_id, 'created', 'criou a tarefa');
  ELSIF TG_OP = 'UPDATE' THEN
    -- Para UPDATE, tentar usar auth.uid(), mas se não estiver disponível, usar creator_id
    v_user_id := COALESCE(
      (current_setting('request.jwt.claims', true)::json->>'sub')::uuid,
      NEW.created_by
    );
    
    IF OLD.status != NEW.status THEN
      INSERT INTO task_activities (task_id, user_id, action, details)
      VALUES (NEW.id, v_user_id, 'status_changed', 'alterou o status para ' || NEW.status);
    END IF;
    IF OLD.priority != NEW.priority THEN
      INSERT INTO task_activities (task_id, user_id, action, details)
      VALUES (NEW.id, v_user_id, 'priority_changed', 'definiu a prioridade como ' || NEW.priority);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

