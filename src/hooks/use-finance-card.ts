import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useWorkspace } from '@/contexts/workspace-context'
import { FinanceDocument } from '@/types/finance'
import { useRealtimeFinance } from './use-realtime-finance'

interface FinanceDocumentWithStats extends FinanceDocument {
  transaction_count?: number
  last_transaction_date?: string
}

export const useFinanceCard = (workspaceId?: string) => {
  const { currentWorkspace } = useWorkspace()
  const [documents, setDocuments] = useState<FinanceDocumentWithStats[]>([])
  const [loading, setLoading] = useState(true)

  // 📡 Realtime - Atualizar automaticamente quando houver mudanças
  useRealtimeFinance(currentWorkspace?.id || null, {
    enabled: true,
    showNotifications: true,
    onUpdate: () => {
      console.log('🔄 [useFinanceCard] Realtime triggered, refetching...')
      fetchDocuments()
    },
  })

  useEffect(() => {
    fetchDocuments()
  }, [workspaceId, currentWorkspace])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setDocuments([])
        setLoading(false)
        return
      }

      let query = supabase
        .from('finance_documents')
        .select('*')
        .order('created_at', { ascending: false })

      // Filtrar por workspace
      if (currentWorkspace) {
        query = query.eq('workspace_id', currentWorkspace.id)
      } else {
        query = query.is('workspace_id', null)
      }

      const { data, error } = await query

      if (error) throw error

      setDocuments(data || [])
    } catch (err: any) {
      console.error('Erro ao carregar documentos financeiros:', err)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  return { documents, loading, refetch: fetchDocuments }
}
