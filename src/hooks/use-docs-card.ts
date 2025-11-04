import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface Document {
  id: string
  name: string
  file_type: string
  file_size: number
  created_at: string
  file_url: string
  parent_id: string | null
  icon: string | null
}

interface DocumentWithChildren extends Document {
  children?: DocumentWithChildren[]
  level?: number
}

export const useDocsCard = (projectId?: string) => {
  const [documents, setDocuments] = useState<DocumentWithChildren[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDocuments()
  }, [projectId])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      
      // Verificar usuário autenticado
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('❌ Usuário não autenticado')
        setDocuments([])
        setLoading(false)
        return
      }

      let query = supabase
        .from('documents')
        .select('id, name, file_type, file_size, created_at, file_url, parent_id, icon')
        .eq('user_id', user.id) // ✅ Filtrar por usuário
        .order('created_at', { ascending: false })

      // Se projectId for especificado, filtrar por ele também
      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Erro ao buscar documentos:', error)
        throw error
      }

      console.log('✅ Documentos carregados:', data?.length || 0)

      // Construir hierarquia
      const docsMap = new Map<string, DocumentWithChildren>()
      const rootDocs: DocumentWithChildren[] = []

      // Criar map de todos os docs
      data?.forEach((doc: Document) => {
        docsMap.set(doc.id, { ...doc, children: [], level: 0 })
      })

      // Construir árvore
      docsMap.forEach((doc) => {
        if (doc.parent_id && docsMap.has(doc.parent_id)) {
          const parent = docsMap.get(doc.parent_id)!
          doc.level = (parent.level || 0) + 1
          parent.children!.push(doc)
        } else {
          rootDocs.push(doc)
        }
      })

      setDocuments(rootDocs)
    } catch (err: any) {
      toast.error('Erro ao carregar documentos', {
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return { documents, loading, refetch: fetchDocuments }
}
