-- Adicionar campo template_id para identificar documentos criados de templates
-- Isso permite re-traduzir templates quando o idioma muda

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS template_id TEXT;

-- Comentário explicativo
COMMENT ON COLUMN documents.template_id IS 'ID do template usado para criar este documento (ex: meeting-notes, project-brief). Permite re-traduzir o conteúdo quando o idioma muda.';

-- Índice para buscar documentos por template
CREATE INDEX IF NOT EXISTS idx_documents_template_id ON documents(template_id);
