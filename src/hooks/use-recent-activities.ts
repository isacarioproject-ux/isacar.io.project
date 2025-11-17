import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useWorkspace } from '@/contexts/workspace-context'

export interface RecentActivity {
  id: string
  type: 'task' | 'document' | 'finance' | 'project' | 'member' | 'whiteboard'
  action: 'created' | 'updated' | 'completed' | 'deleted'
  user_name: string
  user_id: string
  details: string
  entity_name: string
  created_at: string
  metadata?: any
}

export const useRecentActivities = (limit: number = 50) => {
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const { currentWorkspace } = useWorkspace()

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const allActivities: RecentActivity[] = []

        // 1. TAREFAS (tasks)
        const tasksQuery = supabase
          .from('tasks')
          .select('id, title, status, created_at, updated_at, created_by, completed_at')
          .order('updated_at', { ascending: false })
          .limit(20)

        if (currentWorkspace?.id) {
          tasksQuery.eq('workspace_id', currentWorkspace.id)
        } else {
          tasksQuery.is('workspace_id', null)
        }

        const { data: tasks } = await tasksQuery

        if (tasks) {
          tasks.forEach(task => {
            // Criação
            allActivities.push({
              id: `task-created-${task.id}`,
              type: 'task',
              action: 'created',
              user_name: 'Você',
              user_id: user.id,
              details: 'criou a tarefa',
              entity_name: task.title,
              created_at: task.created_at,
            })

            // Conclusão (se completed)
            if (task.completed_at && task.status === 'completed') {
              allActivities.push({
                id: `task-completed-${task.id}`,
                type: 'task',
                action: 'completed',
                user_name: 'Você',
                user_id: user.id,
                details: 'concluiu a tarefa',
                entity_name: task.title,
                created_at: task.completed_at,
              })
            }
          })
        }

        // 2. DOCUMENTOS FINANCEIROS (finance_documents)
        const financeQuery = supabase
          .from('finance_documents')
          .select('id, name, created_at, updated_at, user_id')
          .order('updated_at', { ascending: false })
          .limit(15)

        if (currentWorkspace?.id) {
          financeQuery.eq('workspace_id', currentWorkspace.id)
        } else {
          financeQuery.is('workspace_id', null)
        }

        const { data: finances } = await financeQuery

        if (finances) {
          finances.forEach(doc => {
            allActivities.push({
              id: `finance-${doc.id}`,
              type: 'finance',
              action: 'created',
              user_name: 'Você',
              user_id: user.id,
              details: 'criou documento financeiro',
              entity_name: doc.name,
              created_at: doc.created_at,
            })
          })
        }

        // 3. PROJETOS (projects)
        const projectsQuery = supabase
          .from('projects')
          .select('id, name, created_at, updated_at')
          .order('updated_at', { ascending: false })
          .limit(10)

        if (currentWorkspace?.id) {
          projectsQuery.eq('workspace_id', currentWorkspace.id)
        }

        const { data: projects } = await projectsQuery

        if (projects) {
          projects.forEach(project => {
            allActivities.push({
              id: `project-${project.id}`,
              type: 'project',
              action: 'created',
              user_name: 'Você',
              user_id: user.id,
              details: 'criou o projeto',
              entity_name: project.name,
              created_at: project.created_at,
            })
          })
        }

        // 4. WHITEBOARDS
        const whiteboardsQuery = supabase
          .from('whiteboards')
          .select('id, name, created_at, updated_at')
          .order('updated_at', { ascending: false })
          .limit(10)

        if (currentWorkspace?.id) {
          whiteboardsQuery.eq('workspace_id', currentWorkspace.id)
        }

        const { data: whiteboards } = await whiteboardsQuery

        if (whiteboards) {
          whiteboards.forEach(wb => {
            allActivities.push({
              id: `whiteboard-${wb.id}`,
              type: 'whiteboard',
              action: 'created',
              user_name: 'Você',
              user_id: user.id,
              details: 'criou o quadro',
              entity_name: wb.name,
              created_at: wb.created_at,
            })
          })
        }

        // 5. TRANSAÇÕES FINANCEIRAS (finance_transactions) - mais recentes
        const transactionsQuery = supabase
          .from('finance_transactions')
          .select('id, description, type, amount, created_at')
          .order('created_at', { ascending: false })
          .limit(10)

        const { data: transactions } = await transactionsQuery

        if (transactions) {
          transactions.forEach(trans => {
            const actionText = trans.type === 'income' ? 'registrou receita' : 'registrou despesa'
            allActivities.push({
              id: `transaction-${trans.id}`,
              type: 'finance',
              action: 'created',
              user_name: 'Você',
              user_id: user.id,
              details: actionText,
              entity_name: trans.description || 'Sem descrição',
              created_at: trans.created_at,
              metadata: { amount: trans.amount, type: trans.type }
            })
          })
        }

        // 6. EMPRESAS (companies)
        // TODO: Descomentar quando tabela 'companies' for criada no Supabase
        /* 
        const companiesQuery = supabase
          .from('companies')
          .select('id, name, created_at')
          .order('created_at', { ascending: false })
          .limit(5)

        if (currentWorkspace?.id) {
          companiesQuery.eq('workspace_id', currentWorkspace.id)
        }

        const { data: companies } = await companiesQuery

        if (companies) {
          companies.forEach(company => {
            allActivities.push({
              id: `company-${company.id}`,
              type: 'project',
              action: 'created',
              user_name: 'Você',
              user_id: user.id,
              details: 'criou a empresa',
              entity_name: company.name,
              created_at: company.created_at,
            })
          })
        }
        */

        // Ordenar tudo por data (mais recente primeiro)
        const sortedActivities = allActivities
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, limit)

        setActivities(sortedActivities)
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [currentWorkspace?.id, limit])

  return { activities, loading, refetch: () => {} }
}
