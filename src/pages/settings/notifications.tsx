import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  FolderKanban, 
  FileText, 
  Users, 
  Calendar,
  AlertCircle,
  Save,
  Loader2
} from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface NotificationSettings {
  // Email Notifications
  email_projects: boolean
  email_documents: boolean
  email_team: boolean
  email_deadlines: boolean
  email_mentions: boolean
  email_security: boolean
  
  // In-App Notifications
  app_projects: boolean
  app_documents: boolean
  app_team: boolean
  app_deadlines: boolean
  app_mentions: boolean
  app_comments: boolean
  
  // Marketing
  marketing_newsletter: boolean
  marketing_updates: boolean
  marketing_tips: boolean
  
  // System
  system_maintenance: boolean
  system_updates: boolean
}

export default function NotificationsPage() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>({
    // Email
    email_projects: true,
    email_documents: true,
    email_team: true,
    email_deadlines: true,
    email_mentions: true,
    email_security: true,
    
    // In-App
    app_projects: true,
    app_documents: true,
    app_team: true,
    app_deadlines: true,
    app_mentions: true,
    app_comments: true,
    
    // Marketing
    marketing_newsletter: false,
    marketing_updates: true,
    marketing_tips: false,
    
    // System
    system_maintenance: true,
    system_updates: true,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error

      if (data && data.length > 0) {
        const loadedSettings: any = { ...settings }
        data.forEach(item => {
          loadedSettings[item.setting_key] = item.enabled
        })
        setSettings(loadedSettings)
      }
    } catch (error: any) {
      console.error('Error loading notification settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      // Upsert all 17 notification settings
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        user_id: user.id,
        setting_key: key,
        enabled: value,
      }))

      const { error } = await supabase
        .from('notification_settings')
        .upsert(settingsArray, {
          onConflict: 'user_id,setting_key',
        })

      if (error) throw error

      toast.success(t('common.success'), {
        description: t('notifications.saved')
      })
    } catch (error: any) {
      toast.error(t('common.error'), {
        description: error.message
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleDisableAll = () => {
    const allDisabled = Object.keys(settings).reduce((acc, key) => {
      // Manter apenas notificações de segurança e sistema críticas
      if (key === 'email_security' || key === 'system_maintenance') {
        acc[key as keyof NotificationSettings] = true
      } else {
        acc[key as keyof NotificationSettings] = false
      }
      return acc
    }, {} as NotificationSettings)
    
    setSettings(allDisabled)
    toast.info(t('notifications.allDisabled'), {
      description: t('notifications.securityRemains')
    })
  }

  const NotificationItem = ({ 
    icon: Icon, 
    title, 
    description, 
    settingKey 
  }: { 
    icon: any
    title: string
    description: string
    settingKey: keyof NotificationSettings
  }) => (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="rounded-lg bg-primary/10 p-2 shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-0.5 flex-1 min-w-0">
          <Label htmlFor={settingKey} className="font-medium cursor-pointer text-sm">
            {title}
          </Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch
        id={settingKey}
        checked={settings[settingKey]}
        onCheckedChange={(checked) => updateSetting(settingKey, checked)}
        className="shrink-0"
      />
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
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
                <BreadcrumbLink asChild>
                  <Link to="/settings">{t('settings.title')}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t('notifications.title')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Button onClick={handleSave} disabled={saving} className="h-9">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('settings.saving')}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t('notifications.saveChanges')}
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t('notifications.emailNotifications')}
              </CardTitle>
              <CardDescription className="text-xs">
                {t('notifications.emailNotificationsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationItem
                icon={FolderKanban}
                title={t('notifications.newProjects')}
                description={t('notifications.newProjectsDesc')}
                settingKey="email_projects"
              />
              <Separator />
              
              <NotificationItem
                icon={FileText}
                title={t('notifications.documents')}
                description={t('notifications.documentsDesc')}
                settingKey="email_documents"
              />
              <Separator />
              
              <NotificationItem
                icon={Users}
                title={t('notifications.team')}
                description={t('notifications.teamDesc')}
                settingKey="email_team"
              />
              <Separator />
              
              <NotificationItem
                icon={Calendar}
                title={t('notifications.deadlines')}
                description={t('notifications.deadlinesDesc')}
                settingKey="email_deadlines"
              />
              <Separator />
              
              <NotificationItem
                icon={MessageSquare}
                title={t('notifications.mentions')}
                description={t('notifications.mentionsDesc')}
                settingKey="email_mentions"
              />
              <Separator />
              
              <NotificationItem
                icon={AlertCircle}
                title={t('notifications.security')}
                description={t('notifications.securityDesc')}
                settingKey="email_security"
              />
            </CardContent>
          </Card>

          {/* In-App Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                {t('notifications.appNotifications')}
              </CardTitle>
              <CardDescription className="text-xs">
                {t('notifications.appNotificationsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationItem
                icon={FolderKanban}
                title={t('notifications.projects')}
                description={t('notifications.projectsDesc')}
                settingKey="app_projects"
              />
              <Separator />
              
              <NotificationItem
                icon={FileText}
                title={t('notifications.documents')}
                description={t('notifications.documentsDesc')}
                settingKey="app_documents"
              />
              <Separator />
              
              <NotificationItem
                icon={Users}
                title={t('notifications.team')}
                description={t('notifications.teamDesc')}
                settingKey="app_team"
              />
              <Separator />
              
              <NotificationItem
                icon={Calendar}
                title={t('notifications.deadlines')}
                description={t('notifications.deadlinesDesc')}
                settingKey="app_deadlines"
              />
              <Separator />
              
              <NotificationItem
                icon={MessageSquare}
                title={t('notifications.mentions')}
                description={t('notifications.mentionsDesc')}
                settingKey="app_mentions"
              />
              <Separator />
              
              <NotificationItem
                icon={MessageSquare}
                title={t('notifications.comments')}
                description={t('notifications.commentsDesc')}
                settingKey="app_comments"
              />
            </CardContent>
          </Card>
        </div>

        {/* Marketing & System */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Marketing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('notifications.marketing')}</CardTitle>
              <CardDescription className="text-xs">
                {t('notifications.marketingDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationItem
                icon={Mail}
                title={t('notifications.newsletter')}
                description={t('notifications.newsletterDesc')}
                settingKey="marketing_newsletter"
              />
              <Separator />
              
              <NotificationItem
                icon={Bell}
                title={t('notifications.productUpdates')}
                description={t('notifications.productUpdatesDesc')}
                settingKey="marketing_updates"
              />
              <Separator />
              
              <NotificationItem
                icon={MessageSquare}
                title={t('notifications.tips')}
                description={t('notifications.tipsDesc')}
                settingKey="marketing_tips"
              />
            </CardContent>
          </Card>

          {/* System */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('notifications.system')}</CardTitle>
              <CardDescription className="text-xs">
                {t('notifications.systemDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationItem
                icon={AlertCircle}
                title={t('notifications.maintenance')}
                description={t('notifications.maintenanceDesc')}
                settingKey="system_maintenance"
              />
              <Separator />
              
              <NotificationItem
                icon={Bell}
                title={t('notifications.systemUpdates')}
                description={t('notifications.systemUpdatesDesc')}
                settingKey="system_updates"
              />

              <div className="mt-4 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-amber-400">{t('notifications.critical')}</p>
                    <p className="mt-0.5 text-xs text-amber-400/80">
                      {t('notifications.criticalDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <Card>
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium text-sm">{t('notifications.disableAll')}</p>
              <p className="text-xs text-muted-foreground">
                {t('notifications.reactivateAnytime')}
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleDisableAll}
              className="h-9"
            >
              {t('notifications.disableAllButton')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
