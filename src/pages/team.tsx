import { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MemberCard } from '@/components/member-card'
import { StatsCard } from '@/components/stats-card'
import { StatsSkeleton, CardSkeleton } from '@/components/loading-skeleton'
import { EmptyState } from '@/components/interactive-empty-state'
import { InviteMemberDialog } from '@/components/invite-member-dialog'
import { Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useTeamMembers } from '@/hooks/use-team-members'
import { useProjects } from '@/hooks/use-projects'
import { useSubscription } from '@/hooks/use-subscription'
import { Plus, Search, Mail, Users, UserPlus, Clock, AlertCircle, Crown } from 'lucide-react'
import type { TeamMemberRole } from '@/types/database'
import { useI18n } from '@/hooks/use-i18n'

export default function TeamPage() {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('')
  
  const { projects, loading: loadingProjects } = useProjects()
  const { members, loading, error, inviteMember, updateMember, removeMember } = useTeamMembers(selectedProject || undefined)
  const { subscription, canInviteMember } = useSubscription()

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
    // Verificar limite antes de convidar
    if (!canInviteMember()) {
      return // Toast já é mostrado pelo hook
    }
    await inviteMember(data)
  }

  const handleUpdateRole = async (memberId: string, newRole: TeamMemberRole) => {
    await updateMember(memberId, { role: newRole })
  }

  const handleRemove = async (memberId: string) => {
    if (window.confirm(t('team.removeConfirm'))) {
      await removeMember(memberId)
    }
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
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
                <BreadcrumbPage>{t('team.title')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          {selectedProject && (
            <InviteMemberDialog
              projectId={selectedProject}
              onInvite={handleInvite}
              trigger={
                <Button data-team-invite-trigger>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t('team.invite')}
                </Button>
              }
            />
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Select value={selectedProject} onValueChange={setSelectedProject} disabled={loadingProjects || projects.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder={
                  loadingProjects 
                    ? "Carregando projetos..." 
                    : projects.length === 0 
                      ? "Nenhum projeto encontrado - Crie um projeto primeiro" 
                      : t('team.selectProject')
                } />
              </SelectTrigger>
              <SelectContent>
                {loadingProjects ? (
                  <SelectItem value="loading" disabled>
                    Carregando...
                  </SelectItem>
                ) : projects.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    <div className="flex flex-col gap-1">
                      <span>Nenhum projeto encontrado</span>
                      <span className="text-xs text-muted-foreground">
                        Crie um projeto em Projetos primeiro
                      </span>
                    </div>
                  </SelectItem>
                ) : (
                  projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('team.searchMembers')}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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

        {!selectedProject ? (
          <EmptyState
            title={t('team.selectProjectTitle')}
            description={t('team.selectProjectDesc')}
            icons={[<Users key="1" />, <Clock key="2" />, <Mail key="3" />]}
            variant="subtle"
            size="default"
            isIconAnimated={true}
          />
        ) : loading ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <StatsSkeleton key={i} />
              ))}
            </div>
            <div className="grid gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <StatsCard
                title={t('team.stats.active')}
                value={stats.total}
                description={t('team.stats.thisMonth', { count: stats.thisMonth })}
                icon={Users}
              />
              <StatsCard
                title={t('team.stats.pending')}
                value={stats.pending}
                description={t('team.stats.pendingDesc')}
                icon={Mail}
              />
              <StatsCard
                title="Projeto Selecionado"
                value={projects.find(p => p.id === selectedProject)?.name || '-'}
                icon={Clock}
              />
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
                      {subscription.usage.members_used} / {subscription.limits.members_limit === -1 ? '∞' : subscription.limits.members_limit}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Membros utilizados
                    </p>
                    {subscription.limits.members_limit !== -1 && (
                      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ 
                            width: `${Math.min((subscription.usage.members_used / subscription.limits.members_limit) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Content */}
            {activeMembers.length === 0 && pendingInvites.length === 0 ? (
              <EmptyState
                title={t('team.noMembers')}
                description={t('team.inviteFirst')}
                icons={[<Users key="1" />, <UserPlus key="2" />, <Mail key="3" />]}
                action={{
                  label: t('team.invite'),
                  icon: <UserPlus />,
                  onClick: () => {
                    const btn = document.querySelector('[data-team-invite-trigger]') as HTMLElement
                    btn?.click()
                  }
                }}
                variant="default"
                size="default"
                isIconAnimated={true}
              />
            ) : (
              <div className="space-y-6">
                {/* Active Members */}
                {activeMembers.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold">Membros Ativos</h3>
                    <div className="grid gap-4">
                      {activeMembers.map((member) => (
                        <MemberCard
                          key={member.id}
                          member={{
                            ...member,
                            name: member.email.split('@')[0],
                            avatar_url: null,
                          }}
                          onChangeRole={() => {}}
                          onRemove={() => handleRemove(member.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Invites */}
                {pendingInvites.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold">Convites Pendentes</h3>
                    <div className="grid gap-4">
                      {pendingInvites.map((invite) => (
                        <Card key={invite.id}>
                          <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{invite.email}</p>
                                <p className="text-xs text-muted-foreground">
                                  Convidado em {new Date(invite.created_at).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemove(invite.id)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              Cancelar
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
