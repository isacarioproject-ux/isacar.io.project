import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import type { Project, ProjectInsert, ProjectUpdate } from '@/types/database'

interface UseProjectsReturn {
  projects: Project[]
  loading: boolean
  error: Error | null
  createProject: (data: Omit<ProjectInsert, 'user_id'>) => Promise<Project | null>
  updateProject: (id: string, data: ProjectUpdate) => Promise<boolean>
  deleteProject: (id: string) => Promise<boolean>
  refetch: () => Promise<void>
}

export function useProjects(): UseProjectsReturn {
  const { user, loading: authLoading } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      console.log('🔄 useProjects: Iniciando fetchProjects')
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      console.log('👤 useProjects: User obtido:', user?.id ? 'OK' : 'NULL')
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      console.log('📊 useProjects: Buscando projetos no Supabase...')
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      console.log('📊 useProjects: Resultado:', { count: data?.length, error: fetchError?.message })

      if (fetchError) throw fetchError

      setProjects(data || [])
    } catch (err) {
      console.error('Erro ao buscar projetos:', err)
      setError(err instanceof Error ? err : new Error('Erro desconhecido'))
    } finally {
      setLoading(false)
    }
  }, [user, authLoading])

  // Create project
  const createProject = useCallback(async (data: Omit<ProjectInsert, 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const projectData: ProjectInsert = {
        ...data,
        user_id: user.id,
      }

      const { data: newProject, error: insertError } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single()

      if (insertError) throw insertError

      // Atualizar lista local
      setProjects((prev) => [newProject, ...prev])
      
      return newProject
    } catch (err) {
      console.error('Erro ao criar projeto:', err)
      setError(err instanceof Error ? err : new Error('Erro ao criar projeto'))
      return null
    }
  }, [])

  // Update project
  const updateProject = useCallback(async (id: string, data: ProjectUpdate) => {
    try {
      const { error: updateError } = await supabase
        .from('projects')
        .update(data)
        .eq('id', id)

      if (updateError) throw updateError

      // Atualizar lista local
      setProjects((prev) =>
        prev.map((project) =>
          project.id === id
            ? { ...project, ...data, updated_at: new Date().toISOString() }
            : project
        )
      )

      return true
    } catch (err) {
      console.error('Erro ao atualizar projeto:', err)
      setError(err instanceof Error ? err : new Error('Erro ao atualizar projeto'))
      return false
    }
  }, [])

  // Delete project
  const deleteProject = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Atualizar lista local
      setProjects((prev) => prev.filter((project) => project.id !== id))

      return true
    } catch (err) {
      console.error('Erro ao deletar projeto:', err)
      setError(err instanceof Error ? err : new Error('Erro ao deletar projeto'))
      return false
    }
  }, [])

  // Fetch on mount
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Setup realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          console.log('Realtime change:', payload)
          fetchProjects() // Refetch on any change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchProjects])

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  }
}
