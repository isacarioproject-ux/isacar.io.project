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
    // Load settings from localStorage or API
    const saved = localStorage.getItem('notification_settings')
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      localStorage.setItem('notification_settings', JSON.stringify(settings))
      
      // Show success toast (you can add toast notification here)
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      alert('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
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
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex gap-3">
        <div className="rounded-lg bg-indigo-500/10 p-2">
          <Icon className="h-5 w-5 text-indigo-400" />
        </div>
        <div className="space-y-1">
          <Label htmlFor={settingKey} className="font-medium text-slate-50 cursor-pointer">
            {title}
          </Label>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
      <Switch
        id={settingKey}
        checked={settings[settingKey]}
        onCheckedChange={(checked) => updateSetting(settingKey, checked)}
      />
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Notificações</h1>
            <p className="mt-2 text-slate-400">
              Personalize como e quando você deseja receber notificações
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Notificações por Email
              </CardTitle>
              <CardDescription>
                Receba atualizações importantes por email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationItem
                icon={FolderKanban}
                title="Novos Projetos"
                description="Quando um novo projeto é criado ou você é adicionado a um"
                settingKey="email_projects"
              />
              <Separator />
              
              <NotificationItem
                icon={FileText}
                title="Documentos"
                description="Quando documentos são adicionados ou compartilhados com você"
                settingKey="email_documents"
              />
              <Separator />
              
              <NotificationItem
                icon={Users}
                title="Equipe"
                description="Convites de equipe e mudanças de membros"
                settingKey="email_team"
              />
              <Separator />
              
              <NotificationItem
                icon={Calendar}
                title="Prazos"
                description="Lembretes de prazos próximos e vencidos"
                settingKey="email_deadlines"
              />
              <Separator />
              
              <NotificationItem
                icon={MessageSquare}
                title="Menções"
                description="Quando alguém menciona você em um comentário"
                settingKey="email_mentions"
              />
              <Separator />
              
              <NotificationItem
                icon={AlertCircle}
                title="Segurança"
                description="Alertas de segurança e atividades suspeitas"
                settingKey="email_security"
              />
            </CardContent>
          </Card>

          {/* In-App Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações no App
              </CardTitle>
              <CardDescription>
                Notificações que aparecem enquanto você usa o app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationItem
                icon={FolderKanban}
                title="Projetos"
                description="Atualizações de status e progresso de projetos"
                settingKey="app_projects"
              />
              <Separator />
              
              <NotificationItem
                icon={FileText}
                title="Documentos"
                description="Novos documentos e compartilhamentos"
                settingKey="app_documents"
              />
              <Separator />
              
              <NotificationItem
                icon={Users}
                title="Equipe"
                description="Atividades e atualizações da equipe"
                settingKey="app_team"
              />
              <Separator />
              
              <NotificationItem
                icon={Calendar}
                title="Prazos"
                description="Alertas de prazos e lembretes"
                settingKey="app_deadlines"
              />
              <Separator />
              
              <NotificationItem
                icon={MessageSquare}
                title="Menções"
                description="Quando alguém menciona você"
                settingKey="app_mentions"
              />
              <Separator />
              
              <NotificationItem
                icon={MessageSquare}
                title="Comentários"
                description="Novos comentários em itens que você segue"
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
              <CardTitle>Marketing e Comunicações</CardTitle>
              <CardDescription>
                Emails promocionais e atualizações de produto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationItem
                icon={Mail}
                title="Newsletter"
                description="Novidades, tendências e melhores práticas mensais"
                settingKey="marketing_newsletter"
              />
              <Separator />
              
              <NotificationItem
                icon={Bell}
                title="Atualizações de Produto"
                description="Novos recursos e melhorias da plataforma"
                settingKey="marketing_updates"
              />
              <Separator />
              
              <NotificationItem
                icon={MessageSquare}
                title="Dicas e Tutoriais"
                description="Aprenda a usar melhor a plataforma"
                settingKey="marketing_tips"
              />
            </CardContent>
          </Card>

          {/* System */}
          <Card>
            <CardHeader>
              <CardTitle>Sistema</CardTitle>
              <CardDescription>
                Notificações importantes do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationItem
                icon={AlertCircle}
                title="Manutenção"
                description="Avisos de manutenção programada e downtime"
                settingKey="system_maintenance"
              />
              <Separator />
              
              <NotificationItem
                icon={Bell}
                title="Atualizações do Sistema"
                description="Mudanças importantes e patches de segurança"
                settingKey="system_updates"
              />

              <div className="mt-6 rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-400">Notificações Críticas</p>
                    <p className="mt-1 text-sm text-amber-400/80">
                      Alertas de segurança e manutenção crítica sempre serão enviados, independentemente das suas configurações.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="font-medium text-slate-50">Desativar todas as notificações</p>
              <p className="text-sm text-slate-400">
                Você pode reativar a qualquer momento
              </p>
            </div>
            <Button variant="destructive">
              Desativar Tudo
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
