import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User } from '@supabase/supabase-js'
import { Activity, TrendingUp, Users, FolderKanban, FileText, Clock, UserPlus, BarChart3 } from 'lucide-react'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e']

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const { stats, loading, error } = useDashboardStats()

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

    if (diffMins < 1) return 'Agora'
    if (diffMins < 60) return `${diffMins}m atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 7) return `${diffDays}d atrás`
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-slate-50">Dashboard</h1>
          <p className="mt-2 text-slate-400">
            Bem-vindo de volta, {user?.user_metadata?.name || 'Usuário'}! 👋
          </p>
        </header>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-slate-400">Carregando estatísticas...</p>
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

        {/* Stats Cards */}
        {stats && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Projetos</CardTitle>
                  <FolderKanban className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-50">{stats.totalProjects}</div>
                  <p className="text-xs text-slate-500">
                    {stats.activeProjects} em andamento
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Documentos</CardTitle>
                  <FileText className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-50">{stats.totalDocuments}</div>
                  <p className="text-xs text-slate-500">
                    {formatBytes(stats.totalStorage)} armazenados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Membros Ativos</CardTitle>
                  <Users className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-50">{stats.activeMembers}</div>
                  <p className="text-xs text-slate-500">
                    {stats.totalTeamMembers} total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Novos Esta Semana</CardTitle>
                  <Clock className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-50">{stats.recentDocuments}</div>
                  <p className="text-xs text-slate-500">
                    Documentos recentes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Projetos por Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Projetos por Status</CardTitle>
                  <CardDescription>Distribuição dos seus projetos</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Planejamento', value: stats.projectsByStatus.planning },
                      { name: 'Em Andamento', value: stats.projectsByStatus.in_progress },
                      { name: 'Concluído', value: stats.projectsByStatus.completed },
                      { name: 'Pausado', value: stats.projectsByStatus.on_hold },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Documentos por Categoria */}
              <Card>
                <CardHeader>
                  <CardTitle>Documentos por Categoria</CardTitle>
                  <CardDescription>Distribuição por tipo</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.documentsByCategory}
                        dataKey="count"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.category}: ${entry.count}`}
                      >
                        {stats.documentsByCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Últimas alterações nos seus projetos e documentos</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentActivity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Activity className="h-12 w-12 text-slate-600 mb-4" />
                    <p className="text-slate-400">Nenhuma atividade recente</p>
                    <p className="text-sm text-slate-500 mt-2">
                      Crie projetos ou documentos para ver atividades aqui
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/50 p-3 hover:border-indigo-500/30 transition-colors"
                      >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          activity.type === 'project' ? 'bg-indigo-500/10 text-indigo-400' :
                          activity.type === 'document' ? 'bg-emerald-500/10 text-emerald-400' :
                          'bg-violet-500/10 text-violet-400'
                        }`}>
                          {activity.type === 'project' ? <FolderKanban className="h-4 w-4" /> :
                           activity.type === 'document' ? <FileText className="h-4 w-4" /> :
                           <UserPlus className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-50">
                            {activity.action === 'created' ? 'Criou' :
                             activity.action === 'updated' ? 'Atualizou' :
                             'Deletou'}{' '}
                            <span className="font-medium">{activity.title}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatTimestamp(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
