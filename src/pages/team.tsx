import { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/empty'
import { InviteMemberDialog } from '@/components/invite-member-dialog'
import { useTeamMembers } from '@/hooks/use-team-members'
import { useProjects } from '@/hooks/use-projects'
import { Plus, Search, Mail, MoreVertical, Crown, Shield, Edit, User, Check, X, Trash2, Users } from 'lucide-react'
import type { TeamMember, TeamMemberRole } from '@/types/database'

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

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  active: 'Ativo',
  declined: 'Recusado',
  removed: 'Removido',
}

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('')
  
  const { projects, loading: loadingProjects } = useProjects()
  const { members, loading, error, inviteMember, updateMember, removeMember } = useTeamMembers(selectedProject || undefined)

  // Filtrar membros por busca
  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members
    const query = searchQuery.toLowerCase()
    return members.filter((member) =>
      member.email.toLowerCase().includes(query)
    )
  }, [members, searchQuery])

  // Separar membros ativos e convites pendentes
  const activeMembers = filteredMembers.filter(m => m.status === 'active')
  const pendingInvites = filteredMembers.filter(m => m.status === 'pending')

  // Stats
  const stats = useMemo(() => ({
    total: activeMembers.length,
    pending: pendingInvites.length,
    thisMonth: members.filter(m => {
      const joinedAt = new Date(m.joined_at || m.created_at)
      const now = new Date()
      return (
        joinedAt.getMonth() === now.getMonth() &&
        joinedAt.getFullYear() === now.getFullYear()
      )
    }).length,
  }), [activeMembers, pendingInvites, members])

  const handleInvite = async (data: { email: string; role: TeamMemberRole; project_id: string }) => {
    await inviteMember(data)
  }

  const handleUpdateRole = async (memberId: string, newRole: TeamMemberRole) => {
    await updateMember(memberId, { role: newRole })
  }

  const handleRemove = async (memberId: string) => {
    if (window.confirm('Tem certeza que deseja remover este membro?')) {
      await removeMember(memberId)
    }
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Equipe</h1>
            <p className="mt-2 text-slate-400">
              Gerencie os membros dos seus projetos e suas permissões
            </p>
          </div>
          {selectedProject && (
            <InviteMemberDialog
              projectId={selectedProject}
              onInvite={handleInvite}
            />
          )}
        </header>

        {/* Project Selector */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Select
              value={selectedProject}
              onValueChange={setSelectedProject}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar membros..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {!selectedProject ? (
          <Empty className="border-2">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>Selecione um projeto</EmptyTitle>
              <EmptyDescription>
                Escolha um projeto acima para gerenciar seus membros e convites
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-slate-400">Carregando membros...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="border-red-500/50 bg-red-500/5">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-red-400">{error.message}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Membros Ativos</CardTitle>
                  <User className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-50">{stats.total}</div>
                  <p className="text-xs text-slate-500">+{stats.thisMonth} este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Convites Pendentes</CardTitle>
                  <Mail className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-50">{stats.pending}</div>
                  <p className="text-xs text-slate-500">Aguardando resposta</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Projeto</CardTitle>
                  <Shield className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-slate-50 truncate">
                    {projects.find(p => p.id === selectedProject)?.name}
                  </div>
                  <p className="text-xs text-slate-500">Projeto selecionado</p>
                </CardContent>
              </Card>
            </div>

            {/* Active Members */}
            {activeMembers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Membros Ativos</CardTitle>
                  <CardDescription>Pessoas com acesso ao projeto</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeMembers.map((member) => {
                      const RoleIcon = roleIcons[member.role]
                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-3 hover:border-indigo-500/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 font-semibold text-white text-sm">
                              {getInitials(member.email)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-50">{member.email}</p>
                              <p className="text-xs text-slate-500">
                                Entrou em {new Date(member.joined_at || member.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${roleColors[member.role]}`}>
                              <RoleIcon className="h-3 w-3" />
                              {roleLabels[member.role]}
                            </span>
                            {member.role !== 'owner' && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleRemove(member.id)}
                                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pending Invites */}
            {pendingInvites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Convites Pendentes</CardTitle>
                  <CardDescription>Convites enviados aguardando confirmação</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingInvites.map((invite) => (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
                            <Mail className="h-5 w-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-50">{invite.email}</p>
                            <p className="text-xs text-slate-500">
                              Convidado como {roleLabels[invite.role]} • {new Date(invite.invited_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(invite.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Cancelar
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {activeMembers.length === 0 && pendingInvites.length === 0 && (
              <Empty className="border-2">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Users className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyTitle>Nenhum membro ainda</EmptyTitle>
                  <EmptyDescription>
                    Comece convidando membros para colaborar neste projeto
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <InviteMemberDialog
                    projectId={selectedProject}
                    onInvite={handleInvite}
                  />
                </EmptyContent>
              </Empty>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
