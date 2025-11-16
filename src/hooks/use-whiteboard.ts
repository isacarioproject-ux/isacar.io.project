import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Whiteboard, WhiteboardItem } from '@/types/whiteboard'
import { toast } from 'sonner'
import { useI18n } from '@/hooks/use-i18n'
import { nanoid } from 'nanoid'

const getStableUserId = async (): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id) return user.id
  } catch {}
  // Fallback: gerar userId local estável
  let localId = localStorage.getItem('wb_local_user_id')
  if (!localId) {
    localId = nanoid()
    localStorage.setItem('wb_local_user_id', localId)
  }
  return localId
}

type UseWhiteboardArg =
  | undefined
  | null
  | string
  | {
      projectId?: string | null
      whiteboardId?: string | null
    }

const normalizeArgs = (arg: UseWhiteboardArg) => {
  if (!arg) return { projectId: undefined, whiteboardId: undefined }
  if (typeof arg === 'string') {
    return { projectId: arg, whiteboardId: undefined }
  }
  return {
    projectId: arg.projectId ?? undefined,
    whiteboardId: arg.whiteboardId ?? undefined,
  }
}

export const useWhiteboard = (arg?: UseWhiteboardArg) => {
  const { projectId, whiteboardId } = normalizeArgs(arg)
  const [whiteboard, setWhiteboard] = useState<Whiteboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const { t } = useI18n()
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const lastSavedRef = useRef<string>('')
  const [currentUserId, setCurrentUserId] = useState<string>('')
  
  // Estado do modo de desenho de seta
  const [arrowDrawMode, setArrowDrawMode] = useState<{
    active: boolean
    startPoint: { x: number; y: number } | null
    currentPoint: { x: number; y: number } | null
    style: 'straight' | 'curved' | 'double' | 'dashed' | 'thick'
  }>({
    active: false,
    startPoint: null,
    currentPoint: null,
    style: 'straight'
  })
  
  // Undo/Redo state
  // Pilhas por usuário (colaboração): histórico e índice independentes por userId
  const historyByUserRef = useRef<Map<string, WhiteboardItem[][]>>(new Map())
  const indexByUserRef = useRef<Map<string, number>>(new Map())
  const isUndoingRef = useRef(false)
  const initializedRef = useRef(false)

  const cloneItems = useCallback((items: WhiteboardItem[]): WhiteboardItem[] => {
    // Deep clone to avoid shared object references across history frames
    // Prefer structuredClone when available for performance; fallback to JSON
    try {
      // @ts-ignore
      if (typeof structuredClone === 'function') return structuredClone(items)
    } catch {}
    return JSON.parse(JSON.stringify(items)) as WhiteboardItem[]
  }, [])

  useEffect(() => {
    const initUserId = async () => {
      const uid = await getStableUserId()
      setCurrentUserId(uid)
    }
    initUserId()
  }, [])

  useEffect(() => {
    loadWhiteboard()
  }, [projectId, whiteboardId])

  const loadWhiteboard = async () => {
    try {
      // Se houver projectId, tenta buscar por projeto; senão, busca board pessoal (project_id IS NULL)
      let data: any = null
      let error: any = null
      const uid = await getStableUserId()
      setCurrentUserId(uid)

      if (whiteboardId) {
        const resp = await supabase
          .from('whiteboards')
          .select('*')
          .eq('id', whiteboardId)
          .maybeSingle()
        data = resp.data
        error = resp.error
      } else if (projectId) {
        const resp = await supabase
          .from('whiteboards')
          .select('*')
          .eq('project_id', projectId)
          .maybeSingle()
        data = resp.data
        error = resp.error
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')
        const resp = await supabase
          .from('whiteboards')
          .select('*')
          .eq('user_id', user.id)
          .is('project_id', null)
          .maybeSingle()
        data = resp.data
        error = resp.error
      }

      if (error) throw error

      if (data) {
        const board = data as Whiteboard
        setWhiteboard(board)
        // Inicializa histórico
        if (!initializedRef.current && uid) {
          const initialItems = cloneItems(board.items || [])
          historyByUserRef.current.set(uid, [initialItems])
          indexByUserRef.current.set(uid, 0)
          initializedRef.current = true
        }
      } else {
        // Criar novo
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')
        setCurrentUserId(user.id)

        const { data: newBoard, error: createError } = await supabase
          .from('whiteboards')
          .insert({ 
            user_id: user.id, 
            project_id: projectId ?? null, 
            items: [],
            is_favorite: false,
            collaborators: [user.id]
          })
          .select()
          .single()
        
        if (createError) throw createError
        setWhiteboard(newBoard as Whiteboard)
        if (!initializedRef.current && uid) {
          historyByUserRef.current.set(uid, [[]])
          indexByUserRef.current.set(uid, 0)
          initializedRef.current = true
        }
      }
    } catch (err: any) {
      toast.error(t('whiteboard.errorSaving'), {
        description: err.message
      })
    } finally {
      setLoading(false)
    }
  }

  // Adicionar ao histórico
  const addToHistory = useCallback((items: WhiteboardItem[]) => {
    if (isUndoingRef.current) return
    if (!currentUserId) return

    const map = historyByUserRef.current
    const idxMap = indexByUserRef.current
    const userHistory = map.get(currentUserId) ?? [[]]
    const userIndex = idxMap.get(currentUserId) ?? 0

    // corta futuro
    const sliced = userHistory.slice(0, userIndex + 1)
    sliced.push(cloneItems(items))
    // limita 50
    if (sliced.length > 50) sliced.shift()
    map.set(currentUserId, sliced)
    idxMap.set(currentUserId, Math.min(userIndex + 1, 49))
  }, [currentUserId, cloneItems])

  // Undo
  const undo = useCallback(() => {
    if (!whiteboard || !currentUserId) return
    const map = historyByUserRef.current
    const idxMap = indexByUserRef.current
    const userHistory = map.get(currentUserId) ?? []
    const userIndex = idxMap.get(currentUserId) ?? 0
    if (userIndex <= 0) return

    isUndoingRef.current = true
    const previousState = userHistory[userIndex - 1]
    setWhiteboard({ ...whiteboard, items: cloneItems(previousState) })
    idxMap.set(currentUserId, userIndex - 1)
    setHasChanges(true)
    setTimeout(() => { isUndoingRef.current = false }, 100)
  }, [whiteboard, currentUserId, cloneItems])

  // Redo
  const redo = useCallback(() => {
    if (!whiteboard || !currentUserId) return
    const map = historyByUserRef.current
    const idxMap = indexByUserRef.current
    const userHistory = map.get(currentUserId) ?? []
    const userIndex = idxMap.get(currentUserId) ?? 0
    if (userIndex >= userHistory.length - 1) return

    isUndoingRef.current = true
    const nextState = userHistory[userIndex + 1]
    setWhiteboard({ ...whiteboard, items: cloneItems(nextState) })
    idxMap.set(currentUserId, userIndex + 1)
    setHasChanges(true)
    setTimeout(() => { isUndoingRef.current = false }, 100)
  }, [whiteboard, currentUserId, cloneItems])

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z') {
        e.preventDefault()
        redo()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        undo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  // Auto-save com debounce
  const autoSave = useCallback(async (board: Whiteboard) => {
    if (!board) return
    
    const currentState = JSON.stringify(board.items)
    if (currentState === lastSavedRef.current) return // Sem mudanças
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('whiteboards')
        .update({ 
          items: board.items, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', board.id)
      
      if (error) throw error
      
      lastSavedRef.current = currentState
      setHasChanges(false)
      // Toast silencioso - não mostrar para auto-save
    } catch (err: any) {
      console.error('Auto-save error:', err)
      setHasChanges(true) // Manter flag de mudanças se falhar
    } finally {
      setSaving(false)
    }
  }, [])

  // Efeito de auto-save
  useEffect(() => {
    if (!whiteboard || !hasChanges) return

    // Limpar timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Agendar save para 10 segundos
    saveTimeoutRef.current = setTimeout(() => {
      autoSave(whiteboard)
    }, 10000)

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [whiteboard, hasChanges, autoSave])

  const addItem = (item: WhiteboardItem) => {
    if (!whiteboard) return
    const authored: WhiteboardItem = {
      ...item,
      created_by: item.created_by ?? currentUserId,
      last_edited_by: currentUserId ?? item.last_edited_by,
    }
    const newItems = [...whiteboard.items, authored]
    setWhiteboard({ ...whiteboard, items: newItems })
    addToHistory(newItems)
    setHasChanges(true)
  }

  const updateItem = (id: string, updates: Partial<WhiteboardItem>) => {
    if (!whiteboard) return
    const newItems = whiteboard.items.map(i => i.id === id ? { ...i, ...updates, last_edited_by: currentUserId ?? i.last_edited_by } : i)
    setWhiteboard({
      ...whiteboard,
      items: newItems
    })
    addToHistory(newItems)
    setHasChanges(true)
  }

  const deleteItem = (id: string) => {
    if (!whiteboard) return
    const newItems = whiteboard.items.filter(i => i.id !== id)
    setWhiteboard({
      ...whiteboard,
      items: newItems
    })
    addToHistory(newItems)
    setHasChanges(true)
  }

  const toggleFavorite = async () => {
    if (!whiteboard) return
    const newFavoriteState = !whiteboard.is_favorite
    
    try {
      const { error } = await supabase
        .from('whiteboards')
        .update({ is_favorite: newFavoriteState })
        .eq('id', whiteboard.id)
      
      if (error) throw error
      
      setWhiteboard({ ...whiteboard, is_favorite: newFavoriteState })
      toast.success(
        newFavoriteState 
          ? t('whiteboard.addedToFavorites') 
          : t('whiteboard.removedFromFavorites')
      )
    } catch (err: any) {
      toast.error(t('whiteboard.errorSaving'), {
        description: err.message
      })
    }
  }

  const save = async () => {
    if (!whiteboard) return
    
    // Cancelar auto-save pendente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('whiteboards')
        .update({ 
          items: whiteboard.items, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', whiteboard.id)
      
      if (error) throw error
      
      lastSavedRef.current = JSON.stringify(whiteboard.items)
      setHasChanges(false)
      
      toast.success(t('whiteboard.saved'), {
        description: t('whiteboard.savedSuccess')
      })
    } catch (err: any) {
      toast.error(t('whiteboard.errorSaving'), {
        description: err.message
      })
    } finally {
      setSaving(false)
    }
  }

  const canUndo = useMemo(() => {
    if (!currentUserId) return false
    const idx = indexByUserRef.current.get(currentUserId) ?? 0
    return idx > 0
  }, [currentUserId, whiteboard?.items])
  
  const canRedo = useMemo(() => {
    if (!currentUserId) return false
    const hist = historyByUserRef.current.get(currentUserId) ?? []
    const idx = indexByUserRef.current.get(currentUserId) ?? 0
    return idx < hist.length - 1
  }, [currentUserId, whiteboard?.items])

  // Upload de imagem
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `whiteboards/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('whiteboard-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('whiteboard-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (err: any) {
      console.error('Upload error:', err)
      toast.error('Erro ao fazer upload da imagem', {
        description: err.message
      })
      return null
    }
  }

  // Ativar modo de desenho de seta
  const startArrowDrawing = useCallback((style: 'straight' | 'curved' | 'double' | 'dashed' | 'thick' = 'straight') => {
    setArrowDrawMode({
      active: true,
      startPoint: null,
      currentPoint: null,
      style
    })
  }, [])

  // Cancelar modo de desenho
  const cancelArrowDrawing = useCallback(() => {
    setArrowDrawMode({
      active: false,
      startPoint: null,
      currentPoint: null,
      style: 'straight'
    })
  }, [])

  // Atualizar ponto inicial da seta
  const setArrowStartPoint = useCallback((point: { x: number; y: number }) => {
    setArrowDrawMode(prev => ({
      ...prev,
      startPoint: point,
      currentPoint: point
    }))
  }, [])

  // Atualizar ponto atual (preview)
  const setArrowCurrentPoint = useCallback((point: { x: number; y: number }) => {
    setArrowDrawMode(prev => ({
      ...prev,
      currentPoint: point
    }))
  }, [])

  return { 
    whiteboard, 
    loading, 
    saving,
    hasChanges,
    addItem, 
    updateItem, 
    deleteItem, 
    save,
    toggleFavorite,
    undo,
    redo,
    canUndo,
    canRedo,
    uploadImage,
    // Arrow drawing mode
    arrowDrawMode,
    startArrowDrawing,
    cancelArrowDrawing,
    setArrowStartPoint,
    setArrowCurrentPoint
  }
}
