import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatsCard } from '@/components/stats-card'
import { StatsCardStacked, StatsCardsContainer } from '@/components/stats-card-stacked'
import { StatsSkeleton, CardSkeleton } from '@/components/loading-skeleton'
import { EmptyState } from '@/components/empty-state'
import { DashboardManagement } from '@/components/dashboard-management'
import { User } from '@supabase/supabase-js'
import { Activity, Users, FolderKanban, FileText, Clock, HardDrive, Layout, Crown } from 'lucide-react'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { useSubscription } from '@/contexts/subscription-context'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/use-i18n'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const COLORS = ['hsl(var(--primary))', 'hsl(239 84% 57%)', 'hsl(239 84% 77%)', 'hsl(239 84% 87%)']

const activityIcons: Record<string, any> = {
  project: FolderKanban,
  document: FileText,
  team: Users,
}

const activityColors: Record<string, string> = {
  project: 'bg-blue-500/10 text-blue-500',
  document: 'bg-purple-500/10 text-purple-500',
  team: 'bg-green-500/10 text-green-500',
}

export default function DashboardPage() {
  const { t, locale } = useI18n()
  const [user, setUser] = useState<User | null>(null)
  const { stats, loading, error } = useDashboardStats()
  const { subscription } = useSubscription()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
      }
    })
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatTimestamp = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t('common.now')
    if (diffMins < 60) return `${diffMins}${t('common.minutesAgo')}`
    if (diffHours < 24) return `${diffHours}${t('common.hoursAgo')}`
    if (diffDays < 7) return `${diffDays}${t('common.daysAgo')}`
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList key={locale} className="h-9 w-fit">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              {t('dashboard.tabs.overview')}
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs sm:text-sm">
              {t('dashboard.tabs.recentActivity')}
            </TabsTrigger>
            <TabsTrigger value="management" className="text-xs sm:text-sm">
              {t('dashboard.tabs.management')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {error ? (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-destructive">{error.message}</p>
                </CardContent>
              </Card>
            ) : null}

            {loading ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <StatsSkeleton key={i} />
                  ))}
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              </>
            ) : stats ? (
              <>
                {/* Stats Principais com Cards Empilhados */}
                <StatsCardsContainer>
                  <StatsCardStacked
                    index={0}
                    title={t('dashboard.stats.totalProjects')}
                    value={stats.totalProjects}
                    description={t('dashboard.stats.inProgress', { count: stats.activeProjects })}
                    icon={FolderKanban}
                    trend="up"
                    trendValue="+12%"
                  />
                  <StatsCardStacked
                    index={1}
                    title={t('dashboard.stats.documents')}
                    value={stats.totalDocuments}
                    description={formatBytes(stats.totalStorage)}
                    icon={FileText}
                    trend="up"
                    trendValue="+8%"
                  />
                  <StatsCardStacked
                    index={2}
                    title={t('dashboard.stats.teamMembers')}
                    value={stats.totalTeamMembers}
                    description={t('dashboard.stats.activeMembers', { count: stats.activeMembers })}
                    icon={Users}
                  />
                  <StatsCardStacked
                    index={3}
                    title={t('dashboard.stats.newThisWeek')}
                    value={stats.recentDocuments}
                    description={t('dashboard.stats.docsAdded')}
                    icon={Clock}
                    trend="up"
                    trendValue="+23%"
                  />
                </StatsCardsContainer>

                {/* Limites do Plano */}
                {subscription && (
                  <Card className="border-primary/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Crown className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base">
                            Plano {subscription.plan_id.toUpperCase()}
                          </CardTitle>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link to="/settings/billing">Gerenciar Plano</Link>
                        </Button>
                      </div>
                      <CardDescription>Uso dos recursos do seu plano</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* Projetos */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Projetos</span>
                            <span className="font-medium">
                              {subscription.usage.projects_used} / {subscription.limits.projects_limit === -1 ? '∞' : subscription.limits.projects_limit}
                            </span>
                          </div>
                          {subscription.limits.projects_limit !== -1 && (
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all"
                                style={{ 
                                  width: `${Math.min((subscription.usage.projects_used / subscription.limits.projects_limit) * 100, 100)}%` 
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Whiteboards */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Whiteboards</span>
                            <span className="font-medium">
                              {subscription.usage.whiteboards_used} {subscription.limits.whiteboards_per_project_limit === -1 && '/ ∞'}
                            </span>
                          </div>
                          {subscription.limits.whiteboards_per_project_limit !== -1 && (
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: '0%' }} />
                            </div>
                          )}
                        </div>

                        {/* Membros */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Membros</span>
                            <span className="font-medium">
                              {subscription.usage.members_used} / {subscription.limits.members_limit === -1 ? '∞' : subscription.limits.members_limit}
                            </span>
                          </div>
                          {subscription.limits.members_limit !== -1 && (
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all"
                                style={{ 
                                  width: `${Math.min((subscription.usage.members_used / subscription.limits.members_limit) * 100, 100)}%` 
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Armazenamento */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Armazenamento</span>
                            <span className="font-medium">
                              {subscription.usage.storage_used_gb.toFixed(2)} GB / {subscription.limits.storage_limit_gb === -1 ? '∞' : subscription.limits.storage_limit_gb} GB
                            </span>
                          </div>
                          {subscription.limits.storage_limit_gb !== -1 && (
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all"
                                style={{ 
                                  width: `${Math.min((subscription.usage.storage_used_gb / subscription.limits.storage_limit_gb) * 100, 100)}%` 
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{t('dashboard.charts.projectsByStatus')}</CardTitle>
                      <CardDescription>{t('dashboard.charts.projectsDistribution')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={[
                            { name: t('dashboard.status.planning'), value: stats.projectsByStatus.planning },
                            { name: t('dashboard.status.inProgress'), value: stats.projectsByStatus.in_progress },
                            { name: t('dashboard.status.completed'), value: stats.projectsByStatus.completed },
                            { name: t('dashboard.status.onHold'), value: stats.projectsByStatus.on_hold },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} />
                          <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px',
                              fontSize: '12px',
                            }}
                          />
                          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{t('dashboard.charts.documentsByCategory')}</CardTitle>
                      <CardDescription>{t('dashboard.charts.documentsTypes')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={stats.documentsByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="hsl(var(--primary))"
                            dataKey="count"
                            label={({ category, percent }) =>
                              `${category} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {stats.documentsByCategory.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px',
                              fontSize: '12px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : null}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            {loading ? (
              <CardSkeleton />
            ) : stats ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{t('dashboard.activity.title')}</CardTitle>
                  <CardDescription>{t('dashboard.activity.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.recentActivity.length === 0 ? (
                    <EmptyState
                      icon={Activity}
                      title={t('dashboard.activity.empty')}
                      description={t('dashboard.activity.emptyDesc')}
                      compact
                    />
                  ) : (
                    <div className="space-y-3">
                      {stats.recentActivity.map((activity: any, index: number) => {
                        const Icon = activityIcons[activity.type] || Activity
                        return (
                          <div
                            key={index}
                            className="flex flex-col gap-2 rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/40 sm:flex-row sm:items-start sm:gap-3"
                          >
                            <div
                              className={cn(
                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                                activityColors[activity.type]
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm">
                                <span className="font-medium">{activity.title}</span>
                                <span className="text-muted-foreground">
                                  {' '}
                                  {t('dashboard.activity.was')} {
                                    activity.action === 'created'
                                      ? t('dashboard.activity.created')
                                      : activity.action === 'updated'
                                      ? t('dashboard.activity.updated')
                                      : t('dashboard.activity.deleted')
                                  }
                                </span>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 sm:mt-0.5">
                                {formatTimestamp(activity.timestamp)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>

          <TabsContent value="management" className="space-y-4">
            <DashboardManagement loading={loading} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
