-- ETAPA 12: Adicionar suporte a subpáginas (hierarquia)
-- Adicionar coluna parent_id se não existir
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES documents(id) ON DELETE CASCADE;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_documents_parent_id ON documents(parent_id);

-- Comentários
COMMENT ON COLUMN documents.parent_id IS 'ID do documento pai (para criar hierarquia de subpáginas)';
