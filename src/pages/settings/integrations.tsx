import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Save, Loader2, Presentation, CheckSquare, Wallet, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function IntegrationsPage() {
  const [config, setConfig] = useState({
    ENABLED: false,
    WHITEBOARD_TO_TASKS: true,
    WHITEBOARD_TO_GERENCIADOR: true,
    TASKS_TO_FINANCE: true,
    AUTO_CREATE: true,
    SHOW_NOTIFICATIONS: true,
    DEBUG_MODE: false,
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const { INTEGRATION_CONFIG } = await import('@/integrations/config')
      setConfig({ ...INTEGRATION_CONFIG })
    } catch (error) {
      console.error('Error loading config:', error)
    }
  }

  const handleToggle = (key: string, value: boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const saveConfig = async () => {
    try {
      setSaving(true)
      localStorage.setItem('integration-config', JSON.stringify(config))
      setHasChanges(false)
      
      toast.success('✅ Configuração salva!', {
        description: 'Recarregando página para aplicar mudanças...',
      })

      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
    } catch (error) {
      toast.error('❌ Erro ao salvar configuração')
    } finally {
      setSaving(false)
    }
  }

  const IntegrationItem = ({ 
    title, 
    description, 
    settingKey,
    disabled = false,
    icon
  }: { 
    title: string
    description: string
    settingKey: string
    disabled?: boolean
    icon?: React.ReactNode
  }) => (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="space-y-0.5 flex-1 min-w-0 flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Label htmlFor={settingKey} className="font-medium cursor-pointer text-sm">
            {title}
          </Label>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
      <Switch
        id={settingKey}
        checked={config[settingKey as keyof typeof config] as boolean}
        onCheckedChange={(checked) => handleToggle(settingKey, checked)}
        className="shrink-0 scale-90"
        disabled={disabled}
      />
    </div>
  )

  return (
    <DashboardLayout>
      <div className="min-h-screen w-full flex items-start justify-center pt-6 pb-8">
        <div className="w-[60%] space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h1 className="text-xl font-semibold tracking-tight">Integrações</h1>
              <p className="text-xs text-muted-foreground">
                Gerencie as integrações automáticas entre módulos
              </p>
            </div>
            <Button onClick={saveConfig} disabled={saving || !hasChanges} size="sm">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-3.5 w-3.5" />
                  Salvar
                </>
              )}
            </Button>
          </div>

          {/* Sistema Principal */}
          <div className="space-y-3">
            <h2 className="text-base font-medium">Sistema Principal</h2>
            <div className="space-y-1">
              <IntegrationItem
                title="Ativar Sistema de Integrações"
                description="Ativa ou desativa todas as integrações de uma vez"
                settingKey="ENABLED"
              />
            </div>
          </div>

          {/* Integrações Disponíveis */}
          <div className="space-y-3">
            <h2 className="text-base font-medium">Integrações Disponíveis</h2>
            <div className="space-y-1">
              <IntegrationItem
                icon={
                  <div className="flex items-center gap-1.5">
                    <Presentation className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                }
                title="Whiteboard → Tasks"
                description="Criar action item no whiteboard cria task automaticamente"
                settingKey="WHITEBOARD_TO_TASKS"
                disabled={!config.ENABLED}
              />
              <IntegrationItem
                icon={
                  <div className="flex items-center gap-1.5">
                    <Presentation className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                }
                title="Whiteboard → Gerenciador"
                description="Criar meta no whiteboard adiciona no Meu Gerenciador"
                settingKey="WHITEBOARD_TO_GERENCIADOR"
                disabled={!config.ENABLED}
              />
              <IntegrationItem
                icon={
                  <div className="flex items-center gap-1.5">
                    <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                }
                title="Tasks → Finance"
                description="Completar task com custo cria despesa automaticamente"
                settingKey="TASKS_TO_FINANCE"
                disabled={!config.ENABLED}
              />
            </div>
          </div>

          {/* Opções de Comportamento */}
          <div className="space-y-3">
            <h2 className="text-base font-medium">Opções de Comportamento</h2>
            <div className="space-y-1">
              <IntegrationItem
                title="Criação Automática"
                description="Criar automaticamente sem perguntar"
                settingKey="AUTO_CREATE"
                disabled={!config.ENABLED}
              />
              <IntegrationItem
                title="Notificações"
                description="Mostrar toast ao criar via integração"
                settingKey="SHOW_NOTIFICATIONS"
                disabled={!config.ENABLED}
              />
              <IntegrationItem
                title="Modo Debug"
                description="Logs detalhados no console (desenvolvimento)"
                settingKey="DEBUG_MODE"
                disabled={!config.ENABLED}
              />
            </div>
          </div>

          {/* Status */}
          {config.ENABLED && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <p className="font-medium text-sm text-green-600 dark:text-green-400">
                  ✅ Sistema Ativo
                </p>
                <p className="text-xs text-muted-foreground">
                  As integrações estão funcionando. Eventos serão processados automaticamente.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
