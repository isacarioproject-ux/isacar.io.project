-- Migration: Sistema de Comentários
-- Criar tabela de comentários

CREATE TABLE document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES document_comments(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  mentions UUID[], -- Array de user_ids mencionados
  
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_document_comments_document_id ON document_comments(document_id);
CREATE INDEX idx_document_comments_user_id ON document_comments(user_id);
CREATE INDEX idx_document_comments_parent_id ON document_comments(parent_comment_id);

ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;

-- Ver comentários de documentos que posso ver
CREATE POLICY "View comments on accessible documents"
ON document_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM documents
    WHERE documents.id = document_comments.document_id
    AND documents.user_id = auth.uid()
  )
);

-- Criar comentários
CREATE POLICY "Create comments on accessible documents"
ON document_comments FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM documents
    WHERE documents.id = document_comments.document_id
    AND documents.user_id = auth.uid()
  )
);

-- Atualizar próprios comentários
CREATE POLICY "Update own comments"
ON document_comments FOR UPDATE
USING (auth.uid() = user_id);

-- Deletar próprios comentários
CREATE POLICY "Delete own comments"
ON document_comments FOR DELETE
USING (auth.uid() = user_id);

-- Trigger updated_at
CREATE TRIGGER document_comments_updated_at
BEFORE UPDATE ON document_comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
