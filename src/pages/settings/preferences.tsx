import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  Shield, 
  Key, 
  Smartphone, 
  Globe, 
  Clock,
  AlertTriangle,
  Trash2,
  LogOut,
  Save,
  Loader2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function PreferencesPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: '30',
    loginNotifications: true,
    suspiciousActivity: true,
  })

  const [preferences, setPreferences] = useState({
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      localStorage.setItem('security_settings', JSON.stringify(security))
      localStorage.setItem('preferences', JSON.stringify(preferences))
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      alert('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      // Here you would call your API to delete the account
      // For now, just sign out
      await supabase.auth.signOut()
      navigate('/auth')
    } catch (error) {
      alert('Erro ao deletar conta')
    } finally {
      setDeleting(false)
    }
  }

  const handleSignOutAllDevices = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' })
      navigate('/auth')
    } catch (error) {
      alert('Erro ao desconectar dispositivos')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Configurações</h1>
            <p className="mt-2 text-slate-400">
              Segurança, idioma, região e preferências avançadas
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
                Salvar
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança
              </CardTitle>
              <CardDescription>
                Proteja sua conta com medidas de segurança adicionais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 2FA */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="twoFactor" className="font-medium text-slate-50">
                      Autenticação de Dois Fatores (2FA)
                    </Label>
                    <p className="text-sm text-slate-400">
                      Adicione uma camada extra de segurança
                    </p>
                  </div>
                  <Switch
                    id="twoFactor"
                    checked={security.twoFactor}
                    onCheckedChange={(checked) => 
                      setSecurity({ ...security, twoFactor: checked })
                    }
                  />
                </div>

                {security.twoFactor && (
                  <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
                    <div className="flex items-start gap-3">
                      <Smartphone className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-green-400">2FA Ativado</p>
                        <p className="mt-1 text-sm text-green-400/80">
                          Sua conta está protegida com autenticação de dois fatores
                        </p>
                        <Button variant="outline" size="sm" className="mt-3">
                          Configurar Aplicativo
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Session Timeout */}
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Tempo de Sessão</Label>
                <Select
                  value={security.sessionTimeout}
                  onValueChange={(value) => 
                    setSecurity({ ...security, sessionTimeout: value })
                  }
                >
                  <SelectTrigger id="sessionTimeout">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="never">Nunca expirar</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Tempo de inatividade antes de desconectar automaticamente
                </p>
              </div>

              <Separator />

              {/* Login Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="loginNotifications" className="font-medium text-slate-50">
                    Notificações de Login
                  </Label>
                  <p className="text-sm text-slate-400">
                    Avise quando houver login de novo dispositivo
                  </p>
                </div>
                <Switch
                  id="loginNotifications"
                  checked={security.loginNotifications}
                  onCheckedChange={(checked) => 
                    setSecurity({ ...security, loginNotifications: checked })
                  }
                />
              </div>

              <Separator />

              {/* Suspicious Activity */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="suspiciousActivity" className="font-medium text-slate-50">
                    Alertas de Atividade Suspeita
                  </Label>
                  <p className="text-sm text-slate-400">
                    Detectar e notificar atividades incomuns
                  </p>
                </div>
                <Switch
                  id="suspiciousActivity"
                  checked={security.suspiciousActivity}
                  onCheckedChange={(checked) => 
                    setSecurity({ ...security, suspiciousActivity: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Language & Region */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Idioma e Região
              </CardTitle>
              <CardDescription>
                Personalize idioma, fuso horário e formato de data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Select
                  value={preferences.language}
                  onValueChange={(value) => 
                    setPreferences({ ...preferences, language: value })
                  }
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">🇧🇷 Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">🇺🇸 English (US)</SelectItem>
                    <SelectItem value="es-ES">🇪🇸 Español</SelectItem>
                    <SelectItem value="fr-FR">🇫🇷 Français</SelectItem>
                    <SelectItem value="de-DE">🇩🇪 Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Timezone */}
              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário</Label>
                <Select
                  value={preferences.timezone}
                  onValueChange={(value) => 
                    setPreferences({ ...preferences, timezone: value })
                  }
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">(UTC-3) São Paulo</SelectItem>
                    <SelectItem value="America/New_York">(UTC-5) New York</SelectItem>
                    <SelectItem value="America/Los_Angeles">(UTC-8) Los Angeles</SelectItem>
                    <SelectItem value="Europe/London">(UTC+0) London</SelectItem>
                    <SelectItem value="Europe/Paris">(UTC+1) Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo">(UTC+9) Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Date Format */}
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Formato de Data</Label>
                <Select
                  value={preferences.dateFormat}
                  onValueChange={(value) => 
                    setPreferences({ ...preferences, dateFormat: value })
                  }
                >
                  <SelectTrigger id="dateFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (24/10/2024)</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (10/24/2024)</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-10-24)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Time Format */}
              <div className="space-y-2">
                <Label htmlFor="timeFormat">Formato de Hora</Label>
                <Select
                  value={preferences.timeFormat}
                  onValueChange={(value) => 
                    setPreferences({ ...preferences, timeFormat: value })
                  }
                >
                  <SelectTrigger id="timeFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 horas (23:59)</SelectItem>
                    <SelectItem value="12h">12 horas (11:59 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Zona de Perigo
            </CardTitle>
            <CardDescription>
              Ações irreversíveis que afetam sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sign Out All Devices */}
            <div className="flex items-center justify-between rounded-lg border border-slate-800 p-4">
              <div>
                <p className="font-medium text-slate-50">Desconectar Todos os Dispositivos</p>
                <p className="text-sm text-slate-400">
                  Encerra todas as sessões ativas exceto a atual
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Desconectar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Desconectar todos os dispositivos?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Você será desconectado de todos os dispositivos e precisará fazer login novamente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSignOutAllDevices}>
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Delete Account */}
            <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-4">
              <div>
                <p className="font-medium text-red-400">Excluir Conta</p>
                <p className="text-sm text-red-400/70">
                  Exclui permanentemente sua conta e todos os dados
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-400">
                      Tem certeza absoluta?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação NÃO PODE ser desfeita. Isso irá excluir permanentemente sua conta,
                      todos os seus projetos, documentos e remover todos os dados de nossos servidores.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Excluindo...
                        </>
                      ) : (
                        'Sim, excluir minha conta'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
