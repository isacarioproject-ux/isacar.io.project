import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Activity, TrendingUp, TrendingDown, FolderKanban, FileText, Download } from 'lucide-react'
import { useAnalytics, TimePeriod } from '@/hooks/use-analytics'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { StatsCard } from '@/components/stats-card'
import { CardSkeleton } from '@/components/loading-skeleton'
import { EmptyState } from '@/components/empty-state'
import { useI18n } from '@/hooks/use-i18n'

const COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  success: 'hsl(var(--success))',
  danger: 'hsl(var(--destructive))',
}

export default function AnalyticsPage() {
  const { t } = useI18n()
  const { analytics, loading, error, period, setPeriod, exportData } = useAnalytics()

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatGrowth = (value: number) => {
    const formatted = Math.abs(value).toFixed(1)
    return value >= 0 ? `+${formatted}%` : `-${formatted}%`
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">{t('nav.dashboard')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('analytics.title')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Filtros */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div className="flex flex-wrap gap-2">
            {/* Filtro de Período */}
            <div className="flex gap-2">
              {(['7d', '30d', '90d', '1y', 'all'] as TimePeriod[]).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(p)}
                  className="text-xs"
                >
                  {p === '7d' ? t('analytics.period.7d') :
                   p === '30d' ? t('analytics.period.30d') :
                   p === '90d' ? t('analytics.period.90d') :
                   p === '1y' ? t('analytics.period.1y') :
                   t('analytics.period.all')}
                </Button>
              ))}
            </div>

            {/* Botões de Exportação */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData('csv')}
              disabled={loading || !analytics}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData('json')}
              disabled={loading || !analytics}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              JSON
            </Button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            <CardSkeleton />
            <div className="grid gap-4 lg:grid-cols-2">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="border-destructive/50">
            <CardContent className="p-12">
              <EmptyState
                icon={Activity}
                title={t('analytics.errorLoading')}
                description={error.message}
              />
            </CardContent>
          </Card>
        )}

        {/* Analytics Data */}
        {analytics && (
          <>
            {/* Comparação Mensal */}
            <div>
              <div className="mb-4">
                <h2 className="text-sm font-medium">{t('analytics.monthlyComparison')}</h2>
                <p className="text-sm text-muted-foreground">{t('analytics.thisVsPrevious')}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title={t('analytics.stats.projects')}
                  value={analytics.monthlyComparison.current.projects.toString()}
                  description={t('analytics.stats.vsPrevious', { value: analytics.monthlyComparison.previous.projects })}
                  trend={analytics.monthlyComparison.growth.projects >= 0 ? 'up' : 'down'}
                  trendValue={formatGrowth(analytics.monthlyComparison.growth.projects)}
                  icon={FolderKanban}
                />
                <StatsCard
                  title={t('analytics.stats.documents')}
                  value={analytics.monthlyComparison.current.documents.toString()}
                  description={t('analytics.stats.vsPrevious', { value: analytics.monthlyComparison.previous.documents })}
                  trend={analytics.monthlyComparison.growth.documents >= 0 ? 'up' : 'down'}
                  trendValue={formatGrowth(analytics.monthlyComparison.growth.documents)}
                  icon={FileText}
                />
                <StatsCard
                  title={t('analytics.stats.storage')}
                  value={formatBytes(analytics.monthlyComparison.current.storage)}
                  description={t('analytics.stats.vsPrevious', { value: formatBytes(analytics.monthlyComparison.previous.storage) })}
                  trend={analytics.monthlyComparison.growth.storage >= 0 ? 'up' : 'down'}
                  trendValue={formatGrowth(analytics.monthlyComparison.growth.storage)}
                  icon={Activity}
                />
                <StatsCard
                  title={t('analytics.stats.completionRate')}
                  value={`${analytics.completionRate.toFixed(1)}%`}
                  description={t('analytics.stats.allProjects')}
                  icon={TrendingUp}
                />
              </div>
            </div>

            {/* Gráficos Temporais */}
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Linha Temporal - Atividades */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividades no Período</CardTitle>
                  <CardDescription>Evolução temporal de projetos e documentos</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {analytics.timeSeries.length === 0 ? (
                    <EmptyState
                      icon={Activity}
                      title="Sem dados"
                      description="Nenhuma atividade no período selecionado"
                    />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.timeSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                            fontSize: '12px',
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="projects" 
                          stroke={COLORS.primary} 
                          strokeWidth={2}
                          name="Projetos"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="documents" 
                          stroke={COLORS.success} 
                          strokeWidth={2}
                          name="Documentos"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="members" 
                          stroke={COLORS.secondary} 
                          strokeWidth={2}
                          name="Membros"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Área Temporal - Acumulado */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Acumulada</CardTitle>
                  <CardDescription>Visão geral do crescimento</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {analytics.timeSeries.length === 0 ? (
                    <EmptyState
                      icon={Activity}
                      title="Sem dados"
                      description="Nenhuma atividade no período selecionado"
                    />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.timeSeries}>
                        <defs>
                          <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                            fontSize: '12px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="projects"
                          stroke={COLORS.primary}
                          fillOpacity={1}
                          fill="url(#colorProjects)"
                          name="Projetos"
                        />
                        <Area
                          type="monotone"
                          dataKey="documents"
                          stroke={COLORS.success}
                          fillOpacity={1}
                          fill="url(#colorDocs)"
                          name="Documentos"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Distribuições */}
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Atividade por Dia da Semana */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividade por Dia da Semana</CardTitle>
                  <CardDescription>Dia mais ativo: {analytics.mostActiveDay}</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.activityByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Projetos por Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Projetos</CardTitle>
                  <CardDescription>Por status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.projectsByStatus.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{item.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.count}</span>
                            <span className="text-xs text-muted-foreground">({item.percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insights Adicionais */}
            <div className="grid gap-4 md:grid-cols-3">
              <StatsCard
                title="Total de Atividades"
                value={analytics.totalActivities.toString()}
                description="No período selecionado"
                icon={Activity}
              />
              <StatsCard
                title="Dia Mais Ativo"
                value={analytics.mostActiveDay}
                description="Da semana"
                icon={TrendingUp}
              />
              <StatsCard
                title="Taxa de Conclusão"
                value={`${analytics.completionRate.toFixed(1)}%`}
                description="Dos projetos"
                icon={TrendingUp}
              />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
