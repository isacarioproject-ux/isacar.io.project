import { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { StatsCard } from '@/components/stats-card'
import { StatsSkeleton, CardSkeleton } from '@/components/loading-skeleton'
import { InviteMemberModal } from '@/components/invite-member-modal'
import { useOrganizationMembers } from '@/hooks/use-organization-members'
import { useSubscription } from '@/hooks/use-subscription'
import { Search, Users, UserPlus, Clock, AlertCircle, Crown, Mail, UserCheck, X, CheckCircle, XCircle } from 'lucide-react'
import type { TeamMemberRole } from '@/types/database'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

export default function TeamPage() {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('build')
  
  const { members, loading, error, inviteMember, updateMember, removeMember } = useOrganizationMembers()
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

  const handleInvite = async (email: string, role: TeamMemberRole, name?: string) => {
    if (!canInviteMember()) {
      return
    }
    await inviteMember(email, role, name)
  }

  const handleRemove = (memberId: string) => {
    if (window.confirm(t('team.removeConfirm'))) {
      removeMember(memberId)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 lg:p-6">
        {/* Error State */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{error.message}</p>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="build">
              <UserPlus className="mr-2 h-4 w-4" />
              {t('team.buildTeam')}
            </TabsTrigger>
            <TabsTrigger value="manage">
              <Users className="mr-2 h-4 w-4" />
              {t('team.manageMembers')}
            </TabsTrigger>
          </TabsList>

          {/* Tab: Formar Equipe */}
          <TabsContent value="build" className="space-y-6">
            {/* Empty State / Invite */}
            <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="relative">
                      <div className="rounded-full bg-primary/10 p-6 mb-4">
                        <UserPlus className="h-12 w-12 text-primary" />
                      </div>
                      <div
                        aria-hidden="true"
                        className={cn(
                          'pointer-events-none absolute -top-10 left-1/2 size-full -translate-x-1/2 rounded-full',
                          'bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/.1),transparent_50%)]',
                          'blur-[30px]',
                        )}
                      />
                    </div>
                    <h3 className="text-lg font-semibold">{t('team.inviteTitle')}</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                      {t('team.inviteDescription')}
                    </p>
                    <InviteMemberModal
                      onInvite={handleInvite}
                      trigger={
                        <Button className="mt-6">
                          <UserPlus className="mr-2 h-4 w-4" />
                          {t('team.inviteMember')}
                        </Button>
                      }
                    />
                  </CardContent>
                </Card>
          </TabsContent>

          {/* Tab: Gerenciar Membros */}
          <TabsContent value="manage" className="space-y-6">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <StatsSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                  <StatsCard
                    title={t('team.stats.active')}
                    value={stats.total}
                    description={t('team.stats.thisMonth', { count: stats.thisMonth })}
                    icon={UserCheck}
                  />
                  <StatsCard
                    title={t('team.stats.pending')}
                    value={stats.pending}
                    description={t('team.stats.pendingDesc')}
                    icon={Mail}
                  />
                  <StatsCard
                    title="Total"
                    value={members.length}
                    description="Membros na equipe"
                    icon={Users}
                  />
                  {subscription && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Crown className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {subscription.plan_id.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-2xl font-bold">
                          {subscription.usage.members_used} / {subscription.limits.members_limit === -1 ? '∞' : subscription.limits.members_limit}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Limite de membros
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
              </>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('team.searchMembers')}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="grid gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : members.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-base font-semibold">{t('team.noMembers')}</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('team.startInviting')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Tabela de Membros */}
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b bg-muted/50">
                          <tr>
                            <th className="text-left p-3 text-xs font-medium text-muted-foreground">
                              Membro
                            </th>
                            <th className="text-left p-3 text-xs font-medium text-muted-foreground">
                              Função
                            </th>
                            <th className="text-left p-3 text-xs font-medium text-muted-foreground">
                              Status
                            </th>
                            <th className="text-left p-3 text-xs font-medium text-muted-foreground">
                              Convidado em
                            </th>
                            <th className="text-right p-3 text-xs font-medium text-muted-foreground">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {filteredMembers.map((member) => (
                            <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                              {/* Membro */}
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                      {member.email.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {member.email}
                                    </p>
                                    {member.invited_at && (
                                      <p className="text-xs text-muted-foreground">
                                        Convidado por você
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Função */}
                              <td className="p-3">
                                <Badge variant="secondary" className="text-xs">
                                  {member.role === 'admin' && '🛡️ Admin'}
                                  {member.role === 'editor' && '✏️ Editor'}
                                  {member.role === 'viewer' && '👁️ Viewer'}
                                  {member.role === 'owner' && '👑 Owner'}
                                </Badge>
                              </td>

                              {/* Status */}
                              <td className="p-3">
                                {member.status === 'active' && (
                                  <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-200">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Ativo
                                  </Badge>
                                )}
                                {member.status === 'pending' && (
                                  <Badge className="bg-orange-500/10 text-orange-700 hover:bg-orange-500/20 border-orange-200">
                                    <Clock className="mr-1 h-3 w-3" />
                                    Pendente
                                  </Badge>
                                )}
                                {member.status === 'declined' && (
                                  <Badge className="bg-red-500/10 text-red-700 hover:bg-red-500/20 border-red-200">
                                    <XCircle className="mr-1 h-3 w-3" />
                                    Recusado
                                  </Badge>
                                )}
                              </td>

                              {/* Data */}
                              <td className="p-3">
                                <span className="text-sm text-muted-foreground">
                                  {new Date(member.invited_at || member.created_at).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                              </td>

                              {/* Ações */}
                              <td className="p-3 text-right">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleRemove(member.id)}
                                  className="h-8 w-8"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
