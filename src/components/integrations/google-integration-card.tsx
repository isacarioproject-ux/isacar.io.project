import { useGoogleIntegration } from '@/hooks/use-google-integration'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Loader2, Mail, Calendar, Table, CheckCircle } from 'lucide-react'

export function GoogleIntegrationCard() {
  const { 
    integration, 
    isConnected, 
    loading, 
    checking,
    connect, 
    disconnect,
    updateSettings 
  } = useGoogleIntegration()

  if (checking) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Google */}
            <div className="p-2 rounded-lg bg-white border">
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            
            <div>
              <CardTitle>Google Workspace</CardTitle>
              <CardDescription>
                {isConnected 
                  ? integration?.google_email 
                  : 'Gmail, Calendar e Sheets'
                }
              </CardDescription>
            </div>
          </div>

          {/* Badge de status */}
          {isConnected && (
            <Badge variant="outline" className="gap-1.5">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Conectado
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isConnected ? (
          // Botão conectar
          <Button 
            onClick={connect} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Conectando...
              </>
            ) : (
              'Conectar Google'
            )}
          </Button>
        ) : (
          <>
            {/* Configurações dos serviços */}
            <div className="space-y-3">
              {/* Gmail */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Gmail</p>
                    <p className="text-xs text-muted-foreground">
                      Importar boletos e faturas
                    </p>
                  </div>
                </div>
                <Switch
                  checked={integration?.settings?.gmail?.enabled}
                  onCheckedChange={(checked) => 
                    updateSettings({ gmail: { enabled: checked, auto_import: integration?.settings?.gmail?.auto_import ?? true } })
                  }
                />
              </div>

              {/* Calendar */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Google Calendar</p>
                    <p className="text-xs text-muted-foreground">
                      Sincronizar tarefas e eventos
                    </p>
                  </div>
                </div>
                <Switch
                  checked={integration?.settings?.calendar?.enabled}
                  onCheckedChange={(checked) => 
                    updateSettings({ calendar: { enabled: checked, sync_tasks: integration?.settings?.calendar?.sync_tasks ?? true } })
                  }
                />
              </div>

              {/* Sheets */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Table className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Google Sheets</p>
                    <p className="text-xs text-muted-foreground">
                      Exportar relatórios
                    </p>
                  </div>
                </div>
                <Switch
                  checked={integration?.settings?.sheets?.enabled}
                  onCheckedChange={(checked) => 
                    updateSettings({ sheets: { enabled: checked } })
                  }
                />
              </div>
            </div>

            {/* Botão desconectar */}
            <Button 
              variant="outline" 
              onClick={disconnect}
              className="w-full"
            >
              Desconectar
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
