import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/empty'
import { useMyInvites } from '@/hooks/use-my-invites'
import { useProjects } from '@/hooks/use-projects'
import { Mail, Check, X, Crown, Shield, Edit, User, Inbox } from 'lucide-react'
import type { TeamMemberRole } from '@/types/database'

const roleIcons: Record<TeamMemberRole, any> = {
  owner: Crown,
  admin: Shield,
  editor: Edit,
  viewer: User,
}

const roleColors: Record<TeamMemberRole, string> = {
  owner: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  admin: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  editor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  viewer: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
}

const roleLabels: Record<TeamMemberRole, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Visualizador',
}

export default function InvitesPage() {
  const { invites, loading, error, acceptInvite, declineInvite } = useMyInvites()
  const { projects, loading: loadingProjects } = useProjects()

  const handleAccept = async (inviteId: string) => {
    try {
      await acceptInvite(inviteId)
      // Toast de sucesso (você pode adicionar um toast aqui)
    } catch (err) {
      console.error('Erro ao aceitar:', err)
      // Toast de erro
    }
  }

  const handleDecline = async (inviteId: string) => {
    if (window.confirm('Tem certeza que deseja recusar este convite?')) {
      try {
        await declineInvite(inviteId)
        // Toast de sucesso
      } catch (err) {
        console.error('Erro ao recusar:', err)
        // Toast de erro
      }
    }
  }

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    return project?.name || 'Projeto'
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-slate-50">Convites Recebidos</h1>
          <p className="mt-2 text-slate-400">
            Gerencie os convites de projetos que você recebeu
          </p>
        </header>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-slate-400">Carregando convites...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="border-red-500/50 bg-red-500/5">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-red-400">{error.message}</p>
            </CardContent>
          </Card>
        ) : invites.length === 0 ? (
          /* Empty State */
          <Empty className="border-2">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Inbox className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>Nenhum convite pendente</EmptyTitle>
              <EmptyDescription>
                Você não tem convites de projetos no momento. Quando alguém te convidar para um projeto, aparecerá aqui.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          /* Lista de Convites */
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Convites Pendentes ({invites.length})</CardTitle>
                <CardDescription>
                  Você foi convidado para participar destes projetos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invites.map((invite) => {
                    const RoleIcon = roleIcons[invite.role]
                    return (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:border-indigo-500/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10">
                            <Mail className="h-6 w-6 text-indigo-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-50">
                              {loadingProjects ? 'Carregando...' : getProjectName(invite.project_id)}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleColors[invite.role]}`}>
                                <RoleIcon className="h-3 w-3" />
                                {roleLabels[invite.role]}
                              </span>
                              <span className="text-sm text-slate-500">
                                • Convidado em {new Date(invite.invited_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleAccept(invite.id)}
                            className="gap-2"
                            size="sm"
                          >
                            <Check className="h-4 w-4" />
                            Aceitar
                          </Button>
                          <Button
                            onClick={() => handleDecline(invite.id)}
                            variant="outline"
                            size="sm"
                            className="gap-2 text-red-400 hover:text-red-300 hover:border-red-500/50"
                          >
                            <X className="h-4 w-4" />
                            Recusar
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
