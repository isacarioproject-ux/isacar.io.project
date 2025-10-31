import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Whiteboard, WhiteboardType } from '@/types/whiteboard'
import { toast } from 'sonner'
import { useSubscription } from './use-subscription'

const PLAN_LIMITS: Record<string, Record<WhiteboardType, number>> = {
  free: {
    tasks: 1,
    plans: 1,
    journey: 1,
  },
  pro: {
    tasks: 5,
    plans: 5,
    journey: 5,
  },
  business: {
    tasks: Infinity,
    plans: Infinity,
    journey: Infinity,
  },
  enterprise: {
    tasks: Infinity,
    plans: Infinity,
    journey: Infinity,
  },
}

type WhiteboardTab = 'recent' | 'favorites' | 'createdByMe'

interface UseWhiteboardsListOptions {
  teamId?: string | null
}

type OwnedBoardSummary = Pick<Whiteboard, 'id' | 'name' | 'whiteboard_type'>

interface UseWhiteboardsListResult {
  loading: boolean
  whiteboards: Whiteboard[]
  canCreate: (type: WhiteboardType) => boolean
  createWhiteboard: (input: CreateWhiteboardInput) => Promise<Whiteboard | null>
  refresh: () => Promise<void>
  toggleFavorite: (id: string, currentState: boolean) => Promise<void>
  updateLastAccessed: (id: string) => Promise<void>
  totalCount: number
  planId: string
  removeWhiteboard: (id: string) => Promise<void>
  ownedBoardsByType: Record<WhiteboardType, OwnedBoardSummary[]>
  currentUserId: string | null
}

interface CreateWhiteboardInput {
  name?: string
  type: WhiteboardType
  teamId?: string | null
  projectId?: string | null
}

const SUBSCRIPTION_MISSING_STORAGE_KEY = 'isacar.user_subscriptions_missing';
const BILLING_FEATURE_ENABLED =
  typeof import.meta !== 'undefined' && typeof (import.meta as any).env !== 'undefined'
    ? ((import.meta as any).env.VITE_HAS_SUBSCRIPTIONS === 'true')
    : false;

let userSubscriptionsMissing = false
if (!BILLING_FEATURE_ENABLED) {
  userSubscriptionsMissing = true
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SUBSCRIPTION_MISSING_STORAGE_KEY, 'true')
  }
}

const ensureMissingFlagFromStorage = () => {
  if (userSubscriptionsMissing) return true
  if (typeof window === 'undefined') return false
  const stored = window.localStorage.getItem(SUBSCRIPTION_MISSING_STORAGE_KEY)
  if (stored === 'true') {
    userSubscriptionsMissing = true
    return true
  }
  return false
}

const markSubscriptionsMissing = () => {
  userSubscriptionsMissing = true
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SUBSCRIPTION_MISSING_STORAGE_KEY, 'true')
  }
}

const fetchCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  if (!user) throw new Error('Usuário não autenticado')
  return user
}

const fetchUserPlan = async (userId: string): Promise<string> => {
  if (!BILLING_FEATURE_ENABLED) return 'free'
  if (ensureMissingFlagFromStorage()) return 'free'
  if (userSubscriptionsMissing) return 'free'
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle()

    if (error) throw error
    return data?.plan_id ?? 'free'
  } catch (err: any) {
    const message: string = err?.message ?? ''
    const code: string | number | undefined = err?.code ?? err?.status
    if (
      message.includes('relation "subscriptions" does not exist') ||
      message.includes('subscriptions') && message.includes('does not exist') ||
      message.includes('404') ||
      code === 'PGRST301' ||
      code === 404
    ) {
      console.info('Tabela subscriptions não encontrada, assumindo plano free')
      markSubscriptionsMissing()
    } else {
      console.warn('Falha ao buscar plano do usuário, usando free por padrão', err)
    }
    return 'free'
  }
}

export const useWhiteboardsList = ({
  teamId,
}: UseWhiteboardsListOptions = {}): UseWhiteboardsListResult => {
  const [loading, setLoading] = useState(true)
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [planId, setPlanId] = useState<string>('free')
  const [ownedBoardsByType, setOwnedBoardsByType] = useState<Record<WhiteboardType, OwnedBoardSummary[]>>({
    tasks: [],
    plans: [],
    journey: [],
  })
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const user = await fetchCurrentUser()
      const plan = await fetchUserPlan(user.id)
      setPlanId(plan)
      setCurrentUserId(user.id)

      let queryBuilder = supabase
        .from('whiteboards')
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .or(`user_id.eq.${user.id},collaborators.cs.{"${user.id}"}`)

      if (teamId) {
        queryBuilder = queryBuilder.eq('team_id', teamId)
      }

      const { data, error, count } = await queryBuilder

      if (error) throw error

      const fetched = ((data ?? []) as Whiteboard[])
      const uniqueBoards = Array.from(new Map(fetched.map((board) => [board.id, board])).values())
      setWhiteboards(uniqueBoards)
      setTotalCount(count ?? uniqueBoards.length)

      const grouped: Record<WhiteboardType, OwnedBoardSummary[]> = {
        tasks: [],
        plans: [],
        journey: [],
      }

      uniqueBoards
        .filter((board) => board.user_id === user.id)
        .forEach((board) => {
          const type = (board.whiteboard_type ?? 'tasks') as WhiteboardType
          grouped[type] = grouped[type] || []
          if (!grouped[type].some((item) => item.id === board.id)) {
            grouped[type].push({ id: board.id, name: board.name, whiteboard_type: type })
          }
        })

      setOwnedBoardsByType(grouped)
    } catch (err: any) {
      console.error('Erro ao carregar whiteboards', err)
      toast.error('Não foi possível carregar os whiteboards', {
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }, [teamId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const canCreate = useCallback(
    (type: WhiteboardType) => {
      const limit = PLAN_LIMITS[planId]?.[type] ?? 0
      if (!isFinite(limit)) return true
      const countForType = ownedBoardsByType[type]?.length ?? 0
      return countForType < limit
    },
    [planId, ownedBoardsByType]
  )

  const createWhiteboard = useCallback(
    async ({ name, type, teamId: createTeamId, projectId }: CreateWhiteboardInput) => {
      try {
        const user = await fetchCurrentUser()
        const limit = PLAN_LIMITS[planId]?.[type] ?? 0
        if (isFinite(limit)) {
          const { count: ownedCount, error: countError } = await supabase
            .from('whiteboards')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('whiteboard_type', type)

          if (countError) throw countError
          if ((ownedCount ?? 0) >= limit) {
            toast.error('Limite atingido para este tipo de whiteboard no seu plano')
            return null
          }
        }

        const { data, error } = await supabase
          .from('whiteboards')
          .insert({
            name: name ?? 'Whiteboard sem título',
            user_id: user.id,
            whiteboard_type: type,
            team_id: createTeamId ?? null,
            project_id: projectId ?? null,
            status: 'active',
            collaborators: [user.id],
            last_accessed_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) throw error

        const newBoard = data as Whiteboard
        let alreadyExists = false
        setWhiteboards((prev) => {
          alreadyExists = prev.some((board) => board.id === newBoard.id)
          const withoutCurrent = prev.filter((board) => board.id !== newBoard.id)
          return [newBoard, ...withoutCurrent]
        })
        setTotalCount((prev) => (alreadyExists ? prev : prev + 1))
        setOwnedBoardsByType((prev) => {
          const existingTypeList = prev[type] ?? []
          const withoutCurrent = existingTypeList.filter((board) => board.id !== newBoard.id)
          return {
            ...prev,
            [type]: [{ id: newBoard.id, name: newBoard.name, whiteboard_type: type }, ...withoutCurrent],
          }
        })
        toast.success('Whiteboard criado com sucesso!')
        return newBoard
      } catch (err: any) {
        console.error('Erro ao criar whiteboard', err)
        toast.error('Não foi possível criar o whiteboard', {
          description: err.message,
        })
        return null
      }
    },
    [canCreate]
  )

  const toggleFavorite = useCallback(async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('whiteboards')
        .update({ is_favorite: !currentState })
        .eq('id', id)

      if (error) throw error

      setWhiteboards((prev) =>
        prev.map((board) =>
          board.id === id ? { ...board, is_favorite: !currentState } : board
        )
      )

      toast.success(
        !currentState
          ? 'Adicionado aos favoritos'
          : 'Removido dos favoritos'
      )
    } catch (err: any) {
      console.error('Erro ao atualizar favorito', err)
      toast.error('Não foi possível atualizar favorito', {
        description: err.message,
      })
    }
  }, [])

  const updateLastAccessed = useCallback(async (id: string) => {
    try {
      const now = new Date().toISOString()
      const { error } = await supabase
        .from('whiteboards')
        .update({ last_accessed_at: now })
        .eq('id', id)

      if (error) throw error

      setWhiteboards((prev) =>
        prev.map((board) =>
          board.id === id ? { ...board, last_accessed_at: now } : board
        )
      )
    } catch (err: any) {
      console.error('Erro ao atualizar last_accessed_at', err)
    }
  }, [])

  const removeWhiteboard = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('whiteboards')
        .delete()
        .eq('id', id)

      if (error) throw error

      setWhiteboards(prev => prev.filter(board => board.id !== id))
      setTotalCount(prev => Math.max(0, prev - 1))
      setOwnedBoardsByType(prev => {
        const updated: Record<WhiteboardType, OwnedBoardSummary[]> = {
          tasks: [...prev.tasks],
          plans: [...prev.plans],
          journey: [...prev.journey],
        }
        ;(['tasks', 'plans', 'journey'] as WhiteboardType[]).forEach((type) => {
          updated[type] = updated[type].filter(board => board.id !== id)
        })
        return updated
      })
      toast.success('Whiteboard excluído com sucesso!')
    } catch (err: any) {
      console.error('Erro ao excluir whiteboard', err)
      toast.error('Não foi possível excluir o whiteboard', {
        description: err.message,
      })
    }
  }, [])

  return useMemo(
    () => ({
      loading,
      whiteboards,
      canCreate,
      createWhiteboard,
      refresh,
      toggleFavorite,
      updateLastAccessed,
      totalCount,
      planId,
      removeWhiteboard,
      ownedBoardsByType,
      currentUserId,
    }),
    [
      loading,
      whiteboards,
      canCreate,
      createWhiteboard,
      refresh,
      toggleFavorite,
      updateLastAccessed,
      totalCount,
      planId,
      removeWhiteboard,
      ownedBoardsByType,
      currentUserId,
    ]
  )
}
