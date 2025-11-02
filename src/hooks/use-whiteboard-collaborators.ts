import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export interface WhiteboardCollaboratorInfo {
  id: string
  email: string
  name?: string
  avatar?: string
  role: 'owner' | 'editor' | 'viewer'
}

export const useWhiteboardCollaborators = (whiteboardId?: string, ownerId?: string) => {
  const [collaborators, setCollaborators] = useState<WhiteboardCollaboratorInfo[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCollaborators = useCallback(async () => {
    if (!whiteboardId) return

    setLoading(true)
    try {
      // Buscar whiteboard para pegar lista de collaborators (user_ids)
      const { data: whiteboard, error: whiteboardError } = await supabase
        .from('whiteboards')
        .select('collaborators, user_id')
        .eq('id', whiteboardId)
        .single()

      if (whiteboardError) throw whiteboardError

      const collaboratorIds = whiteboard?.collaborators || []

      if (collaboratorIds.length === 0) {
        setCollaborators([])
        return
      }

      // Buscar informações dos usuários via auth.users (metadata)
      const collaboratorInfos: WhiteboardCollaboratorInfo[] = []

      for (const userId of collaboratorIds) {
        try {
          // Primeiro tentar buscar da tabela team_members se existir
          const { data: teamMember } = await supabase
            .from('team_members')
            .select('email, name, user_id')
            .eq('user_id', userId)
            .maybeSingle()

          if (teamMember) {
            collaboratorInfos.push({
              id: userId,
              email: teamMember.email,
              name: teamMember.name || teamMember.email,
              role: userId === whiteboard.user_id ? 'owner' : 'editor'
            })
          } else {
            // Se não encontrar, buscar do auth.users via user_id
            const { data: { user } } = await supabase.auth.admin.getUserById(userId)

            if (user) {
              collaboratorInfos.push({
                id: userId,
                email: user.email || 'unknown@example.com',
                name: user.user_metadata?.name || user.email || 'Usuário',
                avatar: user.user_metadata?.avatar_url,
                role: userId === whiteboard.user_id ? 'owner' : 'editor'
              })
            } else {
              // Fallback: adicionar com ID
              collaboratorInfos.push({
                id: userId,
                email: 'unknown@example.com',
                name: 'Usuário',
                role: userId === whiteboard.user_id ? 'owner' : 'editor'
              })
            }
          }
        } catch (err) {
          console.error('Error fetching collaborator info:', err)
          // Adicionar com informações mínimas
          collaboratorInfos.push({
            id: userId,
            email: 'unknown@example.com',
            name: 'Usuário',
            role: userId === whiteboard.user_id ? 'owner' : 'editor'
          })
        }
      }

      setCollaborators(collaboratorInfos)
    } catch (err: any) {
      console.error('Error fetching collaborators:', err)
      toast.error('Erro ao carregar colaboradores', {
        description: err.message
      })
    } finally {
      setLoading(false)
    }
  }, [whiteboardId, ownerId])

  useEffect(() => {
    fetchCollaborators()
  }, [fetchCollaborators])

  const addCollaborator = useCallback(async (userEmail: string) => {
    if (!whiteboardId) return false

    try {
      // Buscar user_id pelo email na tabela team_members
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('user_id, email, name')
        .eq('email', userEmail)
        .eq('status', 'active')
        .maybeSingle()

      if (!teamMember?.user_id) {
        toast.error('Usuário não encontrado ou convite ainda pendente')
        return false
      }

      // Buscar whiteboard atual
      const { data: whiteboard, error: fetchError } = await supabase
        .from('whiteboards')
        .select('collaborators')
        .eq('id', whiteboardId)
        .single()

      if (fetchError) throw fetchError

      const currentCollaborators = whiteboard?.collaborators || []

      // Verificar se já é colaborador
      if (currentCollaborators.includes(teamMember.user_id)) {
        toast.error('Usuário já é colaborador deste whiteboard')
        return false
      }

      // Adicionar ao array de colaboradores
      const { error: updateError } = await supabase
        .from('whiteboards')
        .update({
          collaborators: [...currentCollaborators, teamMember.user_id],
          updated_at: new Date().toISOString()
        })
        .eq('id', whiteboardId)

      if (updateError) throw updateError

      toast.success(`${teamMember.name || teamMember.email} adicionado como colaborador!`)

      // Atualizar lista local
      await fetchCollaborators()

      return true
    } catch (err: any) {
      console.error('Error adding collaborator:', err)
      toast.error('Erro ao adicionar colaborador', {
        description: err.message
      })
      return false
    }
  }, [whiteboardId, fetchCollaborators])

  const removeCollaborator = useCallback(async (userId: string) => {
    if (!whiteboardId) return false

    try {
      // Buscar whiteboard atual
      const { data: whiteboard, error: fetchError } = await supabase
        .from('whiteboards')
        .select('collaborators, user_id')
        .eq('id', whiteboardId)
        .single()

      if (fetchError) throw fetchError

      // Não permitir remover o owner
      if (userId === whiteboard.user_id) {
        toast.error('Não é possível remover o proprietário do whiteboard')
        return false
      }

      const currentCollaborators = whiteboard?.collaborators || []
      const newCollaborators = currentCollaborators.filter((id: string) => id !== userId)

      // Atualizar whiteboard
      const { error: updateError } = await supabase
        .from('whiteboards')
        .update({
          collaborators: newCollaborators,
          updated_at: new Date().toISOString()
        })
        .eq('id', whiteboardId)

      if (updateError) throw updateError

      toast.success('Colaborador removido com sucesso!')

      // Atualizar lista local
      await fetchCollaborators()

      return true
    } catch (err: any) {
      console.error('Error removing collaborator:', err)
      toast.error('Erro ao remover colaborador', {
        description: err.message
      })
      return false
    }
  }, [whiteboardId, fetchCollaborators])

  return {
    collaborators,
    loading,
    addCollaborator,
    removeCollaborator,
    refresh: fetchCollaborators
  }
}
