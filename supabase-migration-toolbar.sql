-- Migration: Adicionar colunas para toolbar da página
-- Execute este SQL no Supabase SQL Editor

-- Adicionar colunas para funcionalidades da toolbar
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS is_wiki BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Criar índice para buscar wikis rapidamente
CREATE INDEX IF NOT EXISTS idx_documents_is_wiki ON documents(is_wiki) WHERE is_wiki = true;

-- Comentários nas colunas
COMMENT ON COLUMN documents.is_wiki IS 'Indica se o documento é uma página wiki';
COMMENT ON COLUMN documents.icon IS 'Emoji ou ícone da página';
COMMENT ON COLUMN documents.cover_image IS 'URL da imagem de capa da página';

-- ============================================
-- IMPORTANTE: Criar bucket de storage
-- ============================================
-- Vá em: Storage > Create a new bucket
-- Nome: documents
-- Public: SIM (marque a opção "Public bucket")
-- 
-- Ou execute via SQL (se tiver permissão):
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('documents', 'documents', true)
-- ON CONFLICT (id) DO NOTHING;

-- Configurar políticas de storage (RLS)
-- Vá em: Storage > documents > Policies

-- Política 1: Permitir upload para usuários autenticados
-- CREATE POLICY "Usuários podem fazer upload"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política 2: Permitir leitura pública
-- CREATE POLICY "Leitura pública de capas"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'documents');

-- Política 3: Permitir delete para donos
-- CREATE POLICY "Usuários podem deletar seus arquivos"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
