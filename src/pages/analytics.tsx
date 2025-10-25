import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity, TrendingUp, TrendingDown, FolderKanban, FileText, Download } from 'lucide-react'
import { useAnalytics, TimePeriod } from '@/hooks/use-analytics'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  danger: '#ef4444',
}

export default function AnalyticsPage() {
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
      <div className="space-y-8 p-8">
        {/* Header com Filtros */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Analytics Avançado</h1>
            <p className="mt-2 text-slate-400">
              Métricas detalhadas e análises por período
            </p>
          </div>

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
                  {p === '7d' ? '7 dias' :
                   p === '30d' ? '30 dias' :
                   p === '90d' ? '90 dias' :
                   p === '1y' ? '1 ano' :
                   'Tudo'}
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
        </header>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-slate-400">Carregando analytics...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="border-red-500/50 bg-red-500/5">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-red-400">{error.message}</p>
            </CardContent>
          </Card>
        )}

        {/* Analytics Data */}
        {analytics && (
          <>
            {/* Comparação Mensal */}
            <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-violet-500/5">
              <CardHeader>
                <CardTitle>Comparação Mensal</CardTitle>
                <CardDescription>Este mês vs Mês anterior</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {/* Projetos */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-400">Projetos</p>
                      <FolderKanban className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-slate-50">
                        {analytics.monthlyComparison.current.projects}
                      </p>
                      <p className={`text-xs flex items-center gap-1 ${
                        analytics.monthlyComparison.growth.projects >= 0 
                          ? 'text-emerald-400' 
                          : 'text-red-400'
                      }`}>
                        {analytics.monthlyComparison.growth.projects >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {formatGrowth(analytics.monthlyComparison.growth.projects)}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">
                      vs {analytics.monthlyComparison.previous.projects} no mês anterior
                    </p>
                  </div>

                  {/* Documentos */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-400">Documentos</p>
                      <FileText className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-slate-50">
                        {analytics.monthlyComparison.current.documents}
                      </p>
                      <p className={`text-xs flex items-center gap-1 ${
                        analytics.monthlyComparison.growth.documents >= 0 
                          ? 'text-emerald-400' 
                          : 'text-red-400'
                      }`}>
                        {analytics.monthlyComparison.growth.documents >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {formatGrowth(analytics.monthlyComparison.growth.documents)}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">
                      vs {analytics.monthlyComparison.previous.documents} no mês anterior
                    </p>
                  </div>

                  {/* Armazenamento */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-400">Armazenamento</p>
                      <Activity className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-slate-50">
                        {formatBytes(analytics.monthlyComparison.current.storage)}
                      </p>
                      <p className={`text-xs flex items-center gap-1 ${
                        analytics.monthlyComparison.growth.storage >= 0 
                          ? 'text-emerald-400' 
                          : 'text-red-400'
                      }`}>
                        {analytics.monthlyComparison.growth.storage >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {formatGrowth(analytics.monthlyComparison.growth.storage)}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">
                      vs {formatBytes(analytics.monthlyComparison.previous.storage)} no mês anterior
                    </p>
                  </div>

                  {/* Taxa de Conclusão */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-400">Taxa de Conclusão</p>
                      <TrendingUp className="h-4 w-4 text-violet-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-slate-50">
                        {analytics.completionRate.toFixed(1)}%
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">
                      de todos os projetos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gráficos Temporais */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Linha Temporal - Atividades */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividades no Período</CardTitle>
                  <CardDescription>Evolução temporal de projetos e documentos</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  {analytics.timeSeries.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      Sem dados no período selecionado
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.timeSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
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
                <CardContent className="h-[350px]">
                  {analytics.timeSeries.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      Sem dados no período selecionado
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.timeSeries}>
                        <defs>
                          <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
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
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Atividade por Dia da Semana */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividade por Dia da Semana</CardTitle>
                  <CardDescription>Dia mais ativo: {analytics.mostActiveDay}</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.activityByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="day" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="count" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
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
                          <span className="text-slate-400 capitalize">{item.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-50">{item.count}</span>
                            <span className="text-xs text-slate-500">({item.percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
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
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total de Atividades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-50">{analytics.totalActivities}</div>
                  <p className="text-xs text-slate-500 mt-1">No período selecionado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Dia Mais Ativo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-50">{analytics.mostActiveDay}</div>
                  <p className="text-xs text-slate-500 mt-1">Da semana</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-50">{analytics.completionRate.toFixed(1)}%</div>
                  <p className="text-xs text-slate-500 mt-1">Dos projetos</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
