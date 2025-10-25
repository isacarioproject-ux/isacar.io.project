import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { TeamMember } from '@/types/database'

interface UseMyInvitesReturn {
  invites: TeamMember[]
  loading: boolean
  error: Error | null
  acceptInvite: (inviteId: string) => Promise<void>
  declineInvite: (inviteId: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useMyInvites(): UseMyInvitesReturn {
  const [invites, setInvites] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchInvites = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Pegar email do usuário logado
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        setInvites([])
        setLoading(false)
        return
      }

      // Buscar convites pendentes para esse email
      const { data, error: fetchError } = await supabase
        .from('team_members')
        .select('*')
        .eq('email', user.email)
        .eq('status', 'pending')
        .order('invited_at', { ascending: false })

      if (fetchError) throw fetchError

      setInvites(data || [])
    } catch (err) {
      console.error('Erro ao buscar convites:', err)
      setError(err instanceof Error ? err : new Error('Erro ao buscar convites'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInvites()
  }, [fetchInvites])

  // Realtime subscription para novos convites
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      channel = supabase
        .channel('my-invites')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'team_members',
            filter: `email=eq.${user.email}`,
          },
          () => {
            fetchInvites()
          }
        )
        .subscribe()
    }

    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [fetchInvites])

  const acceptInvite = async (inviteId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { error: updateError } = await supabase
        .from('team_members')
        .update({
          status: 'active',
          user_id: user.id,
          joined_at: new Date().toISOString(),
        })
        .eq('id', inviteId)

      if (updateError) throw updateError

      // Atualização otimista
      setInvites(prev => prev.filter(invite => invite.id !== inviteId))
    } catch (err) {
      console.error('Erro ao aceitar convite:', err)
      await fetchInvites() // Revert on error
      throw err instanceof Error ? err : new Error('Erro ao aceitar convite')
    }
  }

  const declineInvite = async (inviteId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('team_members')
        .update({ status: 'declined' })
        .eq('id', inviteId)

      if (updateError) throw updateError

      // Atualização otimista
      setInvites(prev => prev.filter(invite => invite.id !== inviteId))
    } catch (err) {
      console.error('Erro ao recusar convite:', err)
      await fetchInvites() // Revert on error
      throw err instanceof Error ? err : new Error('Erro ao recusar convite')
    }
  }

  return {
    invites,
    loading,
    error,
    acceptInvite,
    declineInvite,
    refetch: fetchInvites,
  }
}
