import { useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/project-card'
import { StatsCard } from '@/components/stats-card'
import { StatsSkeleton, CardSkeleton } from '@/components/loading-skeleton'
import { EmptyState } from '@/components/empty-state'
import { ProjectDialog } from '@/components/project-dialog'
import { useProjects } from '@/hooks/use-projects'
import { useSubscription } from '@/hooks/use-subscription'
import { FolderKanban, Clock, CheckCircle2, Plus, AlertCircle, Crown } from 'lucide-react'
import type { ProjectFormData } from '@/lib/validations/project'
import { toast } from 'sonner'
import { useI18n } from '@/hooks/use-i18n'
import { Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export default function ProjectsPage() {
  const { t } = useI18n()
  const { projects, loading, error, createProject, updateProject, deleteProject } = useProjects()
  const { subscription, canCreateProject } = useSubscription()

  // Calcular stats
  const stats = useMemo(() => {
    const total = projects.length
    const inProgress = projects.filter((p) => p.status === 'Em andamento').length
    const completed = projects.filter((p) => p.status === 'Concluído').length
    
    return { total, inProgress, completed }
  }, [projects])

  const handleCreateProject = async (data: ProjectFormData) => {
    // Verificar limite antes de criar
    if (!canCreateProject()) {
      return // Toast já é mostrado pelo hook
    }
    await createProject(data)
  }

  const handleUpdateProject = (projectId: string) => async (data: ProjectFormData) => {
    await updateProject(projectId, data)
  }

  const handleDeleteProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    toast.promise(
      deleteProject(projectId),
      {
        loading: t('projects.deleting'),
        success: `${t('projects.deleted')}: "${project?.name}"`,
        error: t('projects.deleteError')
      }
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 lg:p-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">{t('nav.dashboard')}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t('projects.title')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <ProjectDialog
            onSave={handleCreateProject}
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('projects.new')}
              </Button>
            }
          />
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{error.message}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <StatsSkeleton key={i} />
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <StatsCard title={t('projects.stats.total')} value={stats.total} icon={FolderKanban} />
              <StatsCard title={t('projects.stats.inProgress')} value={stats.inProgress} icon={Clock} />
              <StatsCard title={t('projects.stats.completed')} value={stats.completed} icon={CheckCircle2} />
              
              {/* Card de Limite do Plano */}
              {subscription && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Plano {subscription.plan_id.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-2xl font-bold">
                      {subscription.usage.projects_used} / {subscription.limits.projects_limit === -1 ? '∞' : subscription.limits.projects_limit}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Projetos utilizados
                    </p>
                    {subscription.limits.projects_limit !== -1 && (
                      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ 
                            width: `${Math.min((subscription.usage.projects_used / subscription.limits.projects_limit) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    )}
                    {subscription.usage.projects_used >= subscription.limits.projects_limit && subscription.limits.projects_limit !== -1 && (
                      <p className="text-xs text-destructive mt-2">
                        Limite atingido! Faça upgrade.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Empty State */}
            {projects.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title={t('projects.empty.title')}
                description={t('projects.empty.description')}
                action={
                  <ProjectDialog
                    onSave={handleCreateProject}
                    trigger={
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('projects.empty.action')}
                      </Button>
                    }
                  />
                }
              />
            ) : (
              /* Projects Grid */
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={() => {}}
                    onDelete={() => handleDeleteProject(project.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
