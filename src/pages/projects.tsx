import { useMemo } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProjectDialog } from '@/components/project-dialog'
import { useProjects } from '@/hooks/use-projects'
import { FolderKanban, Calendar, Users, Pencil, Trash2, AlertCircle } from 'lucide-react'
import type { Project, ProjectStatus } from '@/types/database'
import type { ProjectFormData } from '@/lib/validations/project'

const statusColors: Record<ProjectStatus, string> = {
  'Em andamento': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Planejamento': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Concluído': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Pausado': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'Cancelado': 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function ProjectsPage() {
  const { projects, loading, error, createProject, updateProject, deleteProject } = useProjects()

  // Calcular stats
  const stats = useMemo(() => {
    const total = projects.length
    const inProgress = projects.filter((p) => p.status === 'Em andamento').length
    const completed = projects.filter((p) => p.status === 'Concluído').length
    
    return { total, inProgress, completed }
  }, [projects])

  const handleCreateProject = async (data: ProjectFormData) => {
    await createProject(data)
  }

  const handleUpdateProject = (projectId: string) => async (data: ProjectFormData) => {
    await updateProject(projectId, data)
  }

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      await deleteProject(projectId)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Projetos</h1>
            <p className="mt-2 text-slate-400">
              Gerencie todos os seus projetos em um só lugar
            </p>
          </div>
          <ProjectDialog onSave={handleCreateProject} />
        </header>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FolderKanban className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-50">{stats.total}</div>
              <p className="text-xs text-slate-500">Projetos ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Calendar className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-50">{stats.inProgress}</div>
              <p className="text-xs text-slate-500">Com prazo ativo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-50">{stats.completed}</div>
              <p className="text-xs text-slate-500">Este mês</p>
            </CardContent>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="text-sm text-red-400">{error.message}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-slate-400">Carregando projetos...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderKanban className="h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-50 mb-2">Nenhum projeto ainda</h3>
              <p className="text-sm text-slate-400 mb-6">Comece criando seu primeiro projeto</p>
              <ProjectDialog onSave={handleCreateProject} />
            </CardContent>
          </Card>
        )}

        {/* Projects Grid */}
        {!loading && projects.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover:border-indigo-500/30 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle>{project.name}</CardTitle>
                      <CardDescription>{project.description || 'Sem descrição'}</CardDescription>
                    </div>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${statusColors[project.status]}`}>
                      {project.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Progresso</span>
                      <span className="font-medium text-slate-50">{project.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users className="h-4 w-4" />
                      <span>{project.team_size || 1} membros</span>
                    </div>
                    {project.due_date && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(project.due_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <ProjectDialog
                      project={project}
                      onSave={handleUpdateProject(project.id)}
                      trigger={
                        <Button variant="outline" className="flex-1 gap-2">
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                      }
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-red-400 hover:text-red-300 hover:border-red-500/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
