import { useMemo } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProjectCard } from '@/components/project-card'
import { StatsCard } from '@/components/stats-card'
import { StatsSkeleton, CardSkeleton } from '@/components/loading-skeleton'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from '@/components/ui/empty'
import { ProjectDialog } from '@/components/project-dialog'
import { useProjects } from '@/hooks/use-projects'
import { useSubscription } from '@/hooks/use-subscription'
import { FolderKanban, Clock, CheckCircle2, Plus, AlertCircle, Crown, FolderPlus, ArrowUpRight, Upload } from 'lucide-react'
import type { ProjectFormData } from '@/lib/validations/project'
import { toast } from 'sonner'
import { useI18n } from '@/hooks/use-i18n'

export default function ProjectsPage() {
  const { t, locale } = useI18n()
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
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        {/* Tabs */}
        <Tabs defaultValue="my-projects" className="w-full">
          <TabsList key={locale} className="h-9 w-fit">
            <TabsTrigger value="new-project" className="text-xs sm:text-sm">
              <Plus className="mr-2 h-4 w-4" />
              {t('projects.tabs.newProject')}
            </TabsTrigger>
            <TabsTrigger value="my-projects" className="text-xs sm:text-sm">
              <FolderKanban className="mr-2 h-4 w-4" />
              {t('projects.tabs.myProjects')}
            </TabsTrigger>
          </TabsList>

          {/* Tab: Novo Projeto */}
          <TabsContent value="new-project" className="space-y-4">
            <Empty className="min-h-[500px]">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderPlus className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>{t('projects.new.title')}</EmptyTitle>
                <EmptyDescription>
                  {t('projects.new.description')}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <ProjectDialog
                    onSave={handleCreateProject}
                    trigger={
                      <Button size="lg" className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        {t('projects.create')}
                      </Button>
                    }
                  />
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Upload className="mr-2 h-4 w-4" />
                    {t('projects.new.import')}
                  </Button>
                </div>
              </EmptyContent>
              <Button
                variant="link"
                asChild
                className="text-muted-foreground"
                size="sm"
              >
                <a href="#">
                  {t('projects.new.learnMore')} <ArrowUpRight className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </Empty>
          </TabsContent>

          {/* Tab: Meus Projetos */}
          <TabsContent value="my-projects" className="space-y-4">
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

                {/* Projects Grid ou Empty State */}
                {projects.length === 0 ? (
                  <Empty className="min-h-[300px]">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <FolderKanban className="h-6 w-6" />
                      </EmptyMedia>
                      <EmptyTitle>{t('projects.empty.title')}</EmptyTitle>
                      <EmptyDescription>
                        {t('projects.empty.description')}
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <ProjectDialog
                        onSave={handleCreateProject}
                        trigger={
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('projects.empty.action')}
                          </Button>
                        }
                      />
                    </EmptyContent>
                  </Empty>
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
