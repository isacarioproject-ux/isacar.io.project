-- =====================================================
-- MIGRATION: Subscriptions and Plan Limits System
-- Description: Sistema de assinaturas com limites por plano
-- =====================================================

-- Tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL DEFAULT 'free', -- free, pro, business, enterprise
  status TEXT NOT NULL DEFAULT 'active', -- active, canceled, past_due, trialing
  billing_period TEXT NOT NULL DEFAULT 'monthly', -- monthly, yearly
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  next_billing_date TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Adicionar colunas de limites se não existirem
DO $$ 
BEGIN
  -- Limites do plano
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='projects_limit') THEN
    ALTER TABLE subscriptions ADD COLUMN projects_limit INTEGER NOT NULL DEFAULT 1;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='whiteboards_per_project_limit') THEN
    ALTER TABLE subscriptions ADD COLUMN whiteboards_per_project_limit INTEGER NOT NULL DEFAULT 3;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='members_limit') THEN
    ALTER TABLE subscriptions ADD COLUMN members_limit INTEGER NOT NULL DEFAULT 2;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='invited_members_limit') THEN
    ALTER TABLE subscriptions ADD COLUMN invited_members_limit INTEGER NOT NULL DEFAULT 1;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='storage_limit_gb') THEN
    ALTER TABLE subscriptions ADD COLUMN storage_limit_gb INTEGER NOT NULL DEFAULT 1;
  END IF;
  
  -- Uso atual
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='projects_used') THEN
    ALTER TABLE subscriptions ADD COLUMN projects_used INTEGER NOT NULL DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='whiteboards_used') THEN
    ALTER TABLE subscriptions ADD COLUMN whiteboards_used INTEGER NOT NULL DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='members_used') THEN
    ALTER TABLE subscriptions ADD COLUMN members_used INTEGER NOT NULL DEFAULT 1;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='storage_used_gb') THEN
    ALTER TABLE subscriptions ADD COLUMN storage_used_gb DECIMAL(10,2) NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON subscriptions(next_billing_date);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- =====================================================
-- Função para verificar limites do plano
-- =====================================================
CREATE OR REPLACE FUNCTION check_plan_limit(
  p_user_id UUID,
  p_resource_type TEXT, -- 'projects', 'whiteboards', 'members', 'storage'
  p_project_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription RECORD;
  v_current_count INTEGER;
  v_limit INTEGER;
BEGIN
  -- Buscar assinatura do usuário
  SELECT * INTO v_subscription
  FROM subscriptions
  WHERE user_id = p_user_id AND status = 'active';
  
  -- Se não tem assinatura, criar uma FREE
  IF NOT FOUND THEN
    INSERT INTO subscriptions (user_id, plan_id, projects_limit, whiteboards_per_project_limit, members_limit, invited_members_limit, storage_limit_gb)
    VALUES (p_user_id, 'free', 1, 3, 2, 1, 1)
    RETURNING * INTO v_subscription;
  END IF;
  
  -- Verificar limite baseado no tipo de recurso
  CASE p_resource_type
    WHEN 'projects' THEN
      v_limit := v_subscription.projects_limit;
      SELECT COUNT(*) INTO v_current_count FROM projects WHERE user_id = p_user_id;
      
    WHEN 'whiteboards' THEN
      v_limit := v_subscription.whiteboards_per_project_limit;
      IF p_project_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_current_count FROM whiteboards WHERE project_id = p_project_id;
      ELSE
        RETURN FALSE; -- Precisa de project_id para whiteboards
      END IF;
      
    WHEN 'members' THEN
      v_limit := v_subscription.members_limit;
      SELECT COUNT(*) INTO v_current_count FROM team_members WHERE user_id = p_user_id AND status = 'active';
      
    WHEN 'storage' THEN
      v_limit := v_subscription.storage_limit_gb;
      -- Storage check seria feito na aplicação
      RETURN TRUE;
      
    ELSE
      RETURN FALSE;
  END CASE;
  
  -- -1 significa ilimitado
  IF v_limit = -1 THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar se está dentro do limite
  RETURN v_current_count < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Função para atualizar uso de recursos
-- =====================================================
CREATE OR REPLACE FUNCTION update_subscription_usage()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Determinar user_id baseado na tabela
  IF TG_TABLE_NAME = 'projects' THEN
    v_user_id := COALESCE(NEW.user_id, OLD.user_id);
  ELSIF TG_TABLE_NAME = 'whiteboards' THEN
    SELECT user_id INTO v_user_id FROM projects WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  ELSIF TG_TABLE_NAME = 'team_members' THEN
    v_user_id := COALESCE(NEW.user_id, OLD.user_id);
  END IF;
  
  IF v_user_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  
  -- Atualizar contadores
  UPDATE subscriptions SET
    projects_used = (SELECT COUNT(*) FROM projects WHERE user_id = v_user_id),
    whiteboards_used = (SELECT COUNT(*) FROM whiteboards w JOIN projects p ON w.project_id = p.id WHERE p.user_id = v_user_id),
    members_used = (SELECT COUNT(*) FROM team_members WHERE user_id = v_user_id AND status = 'active')
  WHERE user_id = v_user_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para atualizar uso automaticamente
DROP TRIGGER IF EXISTS update_subscription_usage_projects ON projects;
CREATE TRIGGER update_subscription_usage_projects
  AFTER INSERT OR DELETE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_usage();

DROP TRIGGER IF EXISTS update_subscription_usage_whiteboards ON whiteboards;
CREATE TRIGGER update_subscription_usage_whiteboards
  AFTER INSERT OR DELETE ON whiteboards
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_usage();

DROP TRIGGER IF EXISTS update_subscription_usage_members ON team_members;
CREATE TRIGGER update_subscription_usage_members
  AFTER INSERT OR UPDATE OR DELETE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_usage();

-- =====================================================
-- RLS Policies
-- =====================================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas sua própria assinatura
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem atualizar apenas sua própria assinatura (para upgrade)
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;
CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Sistema pode inserir assinaturas
DROP POLICY IF EXISTS "System can insert subscriptions" ON subscriptions;
CREATE POLICY "System can insert subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- Adicionar constraint UNIQUE se não existir
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subscriptions_user_id_key' 
    AND conrelid = 'subscriptions'::regclass
  ) THEN
    ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- =====================================================
-- Criar assinatura FREE para usuários existentes
-- =====================================================
INSERT INTO subscriptions (user_id, plan_id, projects_limit, whiteboards_per_project_limit, members_limit, invited_members_limit, storage_limit_gb)
SELECT 
  id as user_id,
  'free' as plan_id,
  1 as projects_limit,
  3 as whiteboards_per_project_limit,
  2 as members_limit,
  1 as invited_members_limit,
  1 as storage_limit_gb
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM subscriptions)
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- Comentários
-- =====================================================
COMMENT ON TABLE subscriptions IS 'Assinaturas e limites de planos dos usuários';
COMMENT ON FUNCTION check_plan_limit IS 'Verifica se usuário pode criar mais recursos baseado no plano';
COMMENT ON FUNCTION update_subscription_usage IS 'Atualiza contadores de uso de recursos automaticamente';
