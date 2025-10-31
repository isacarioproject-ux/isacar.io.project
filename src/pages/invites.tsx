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
import { useMyInvites } from '@/hooks/use-my-invites'
import { useProjects } from '@/hooks/use-projects'
import { Mail, Check, X, Crown, Shield, Edit, User, Inbox } from 'lucide-react'
import type { TeamMemberRole } from '@/types/database'
import { CardSkeleton } from '@/components/loading-skeleton'
import { EmptyState } from '@/components/empty-state'
import { toast } from 'sonner'
import { useI18n } from '@/hooks/use-i18n'

const roleIcons: Record<TeamMemberRole, any> = {
  owner: Crown,
  admin: Shield,
  editor: Edit,
  viewer: User,
}

const roleColors: Record<TeamMemberRole, string> = {
  owner: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20',
  admin: 'bg-primary/10 text-primary border-primary/20',
  editor: 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20',
  viewer: 'bg-secondary text-secondary-foreground border-border',
}

// Removido - usar t('roles.xxx') em vez de roleLabels

export default function InvitesPage() {
  const { t } = useI18n()
  const { invites, loading, error, acceptInvite, declineInvite } = useMyInvites()
  const { projects, loading: loadingProjects } = useProjects()

  const handleAccept = async (inviteId: string) => {
    try {
      await acceptInvite(inviteId)
      toast.success(t('invites.accepted'), {
        description: t('invites.acceptedDescription')
      })
    } catch (err) {
      toast.error(t('invites.errorAccept'), {
        description: err instanceof Error ? err.message : t('invites.tryAgain')
      })
    }
  }

  const handleDecline = async (inviteId: string) => {
    toast.promise(
      declineInvite(inviteId),
      {
        loading: t('invites.declining'),
        success: t('invites.declinedSuccess'),
        error: t('invites.errorDecline')
      }
    )
  }

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    return project?.name || 'Projeto'
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
              <BreadcrumbPage>{t('invites.title')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Loading */}
        {loading ? (
          <CardSkeleton />
        ) : error ? (
          <Card className="border-destructive/50">
            <CardContent className="p-12">
              <EmptyState
                icon={Mail}
                title={t('invites.errorLoading')}
                description={error.message}
              />
            </CardContent>
          </Card>
        ) : invites.length === 0 ? (
          /* Empty State */
          <Card>
            <CardContent className="p-12">
              <EmptyState
                icon={Inbox}
                title={t('invites.noInvites')}
                description={t('invites.noInvitesDesc')}
              />
            </CardContent>
          </Card>
        ) : (
          /* Lista de Convites */
          <Card>
            <CardHeader>
              <CardTitle>{t('invites.pending')} ({invites.length})</CardTitle>
              <CardDescription>
                {t('invites.invitedTo')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                  {invites.map((invite) => {
                    const RoleIcon = roleIcons[invite.role]
                    return (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between rounded-lg border bg-card p-4 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Mail className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">
                              {loadingProjects ? t('common.loading') : getProjectName(invite.project_id)}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${roleColors[invite.role]}`}>
                                <RoleIcon className="h-3 w-3" />
                                {t(`roles.${invite.role}`)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                • {new Date(invite.invited_at).toLocaleDateString('pt-BR')}
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
                            {t('invites.accept')}
                          </Button>
                          <Button
                            onClick={() => handleDecline(invite.id)}
                            variant="outline"
                            size="sm"
                            className="gap-2 text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                            {t('invites.decline')}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
