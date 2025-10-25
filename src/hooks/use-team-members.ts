import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { TeamMember, TeamMemberInsert, TeamMemberUpdate } from '@/types/database'

export interface UseTeamMembersOptions {
  allowParticipantAccess?: boolean
}

interface UseTeamMembersReturn {
  members: TeamMember[]
  loading: boolean
  error: Error | null
  inviteMember: (data: Omit<TeamMemberInsert, 'invited_by'>) => Promise<void>
  updateMember: (id: string, data: TeamMemberUpdate) => Promise<void>
  removeMember: (id: string) => Promise<void>
  acceptInvite?: (id: string) => Promise<void>
  declineInvite?: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useTeamMembers(projectId?: string, options: UseTeamMembersOptions = {}): UseTeamMembersReturn {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const allowParticipantAccess = options.allowParticipantAccess ?? false

  const fetchMembers = useCallback(async () => {
    if (!projectId) {
      setMembers([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('team_members')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setMembers(data || [])
    } catch (err) {
      console.error('Erro ao buscar membros:', err)
      setError(err instanceof Error ? err : new Error('Erro ao buscar membros'))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  // Realtime subscription
  useEffect(() => {
    if (!projectId) return

    const channel = supabase
      .channel(`team-members-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_members',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          fetchMembers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, fetchMembers])

  const inviteMember = async (data: Omit<TeamMemberInsert, 'invited_by'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { error: insertError } = await supabase
        .from('team_members')
        .insert({
          ...data,
          invited_by: user.id,
        })

      if (insertError) throw insertError

      await fetchMembers()
    } catch (err) {
      console.error('Erro ao convidar membro:', err)
      throw err instanceof Error ? err : new Error('Erro ao convidar membro')
    }
  }

  const updateMember = async (id: string, data: TeamMemberUpdate) => {
    try {
      const { error: updateError } = await supabase
        .from('team_members')
        .update(data)
        .eq('id', id)

      if (updateError) throw updateError

      // Atualização otimista
      setMembers(prev =>
        prev.map(member =>
          member.id === id ? { ...member, ...data } : member
        )
      )
    } catch (err) {
      console.error('Erro ao atualizar membro:', err)
      await fetchMembers() // Revert on error
      throw err instanceof Error ? err : new Error('Erro ao atualizar membro')
    }
  }

  const removeMember = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Atualização otimista
      setMembers(prev => prev.filter(member => member.id !== id))
    } catch (err) {
      console.error('Erro ao remover membro:', err)
      await fetchMembers() // Revert on error
      throw err instanceof Error ? err : new Error('Erro ao remover membro')
    }
  }

  const acceptInvite = async (id: string) => {
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
        .eq('id', id)

      if (updateError) throw updateError

      await fetchMembers()
    } catch (err) {
      console.error('Erro ao aceitar convite:', err)
      throw err instanceof Error ? err : new Error('Erro ao aceitar convite')
    }
  }

  const declineInvite = async (id: string) => {
    try {
      const { error: updateError } = await supabase
        .from('team_members')
        .update({ status: 'declined' })
        .eq('id', id)

      if (updateError) throw updateError

      await fetchMembers()
    } catch (err) {
      console.error('Erro ao recusar convite:', err)
      throw err instanceof Error ? err : new Error('Erro ao recusar convite')
    }
  }

  return {
    members,
    loading,
    error,
    inviteMember,
    updateMember,
    removeMember,
    acceptInvite: allowParticipantAccess ? acceptInvite : undefined,
    declineInvite: allowParticipantAccess ? declineInvite : undefined,
    refetch: fetchMembers,
  }
}
