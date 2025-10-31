import { useState, useEffect } from 'react'
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
import { useI18n } from '@/hooks/use-i18n'
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

export default function PreferencesPage() {
  const navigate = useNavigate()
  const { locale, changeLocale, t } = useI18n()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: '30',
    loginNotifications: true,
    suspiciousActivity: true,
  })

  const [preferences, setPreferences] = useState({
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
  })

  // Sync language with i18n system
  const [currentLanguage, setCurrentLanguage] = useState<'pt-BR' | 'en' | 'es'>(locale)

  // Sync with i18n when locale changes
  useEffect(() => {
    setCurrentLanguage(locale)
  }, [locale])

  // Load preferences from Supabase
  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setSecurity({
          twoFactor: data.two_factor_enabled,
          sessionTimeout: data.session_timeout.toString(),
          loginNotifications: data.login_notifications,
          suspiciousActivity: data.suspicious_activity_alerts,
        })
        setPreferences({
          timezone: data.timezone,
          dateFormat: data.date_format,
          timeFormat: data.time_format,
        })
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    }
  }

  // Update language when changed
  const handleLanguageChange = (newLanguage: string) => {
    const lang = newLanguage as 'pt-BR' | 'en' | 'es'
    setCurrentLanguage(lang)
    // Update i18n immediately - this triggers re-render of entire app
    changeLocale(lang)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          two_factor_enabled: security.twoFactor,
          session_timeout: parseInt(security.sessionTimeout),
          login_notifications: security.loginNotifications,
          suspicious_activity_alerts: security.suspiciousActivity,
          timezone: preferences.timezone,
          date_format: preferences.dateFormat,
          time_format: preferences.timeFormat,
        })

      if (error) throw error

      toast.success(t('common.success'), {
        description: t('settings.saved')
      })
    } catch (error: any) {
      toast.error(t('common.error'), {
        description: error.message || t('settings.saveFailed')
      })
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
                <BreadcrumbPage>{t('preferences.title')}</BreadcrumbPage>
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
                {t('settings.save')}
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t('settings.security')}
              </CardTitle>
              <CardDescription className="text-xs">
                {t('settings.securityDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 2FA */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="twoFactor" className="font-medium text-sm">
                      {t('settings.twoFactor')}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t('settings.twoFactorDesc')}
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
                  <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
                    <div className="flex items-start gap-2">
                      <Smartphone className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm text-green-400">{t('settings.twoFactorActive')}</p>
                        <p className="mt-0.5 text-xs text-green-400/80">
                          {t('settings.twoFactorActiveDesc')}
                        </p>
                        <Button variant="outline" size="sm" className="mt-2 h-8">
                          {t('settings.configureApp')}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Session Timeout */}
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout" className="text-sm">{t('settings.sessionTimeout')}</Label>
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
                    <SelectItem value="15">{t('settings.timeout15')}</SelectItem>
                    <SelectItem value="30">{t('settings.timeout30')}</SelectItem>
                    <SelectItem value="60">{t('settings.timeout60')}</SelectItem>
                    <SelectItem value="120">{t('settings.timeout120')}</SelectItem>
                    <SelectItem value="never">{t('settings.timeoutNever')}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t('settings.sessionTimeoutDesc')}
                </p>
              </div>

              <Separator />

              {/* Login Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="loginNotifications" className="font-medium text-sm">
                    {t('settings.loginNotifications')}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t('settings.loginNotificationsDesc')}
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
                <div className="space-y-0.5">
                  <Label htmlFor="suspiciousActivity" className="font-medium text-sm">
                    {t('settings.suspiciousActivity')}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t('settings.suspiciousActivityDesc')}
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
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {t('settings.languageRegion')}
              </CardTitle>
              <CardDescription className="text-xs">
                {t('settings.languageRegionDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm">{t('settings.language')}</Label>
                <Select
                  value={currentLanguage}
                  onValueChange={handleLanguageChange}
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">🇧🇷 Português (Brasil)</SelectItem>
                    <SelectItem value="en">🇺🇸 English (US)</SelectItem>
                    <SelectItem value="es">🇪🇸 Español</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t('settings.languageDesc')}
                </p>
              </div>

              <Separator />

              {/* Timezone */}
              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-sm">{t('settings.timezone')}</Label>
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
                <Label htmlFor="dateFormat" className="text-sm">{t('settings.dateFormat')}</Label>
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
                <Label htmlFor="timeFormat" className="text-sm">{t('settings.timeFormat')}</Label>
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
            <CardTitle className="text-base flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-4 w-4" />
              {t('settings.dangerZone')}
            </CardTitle>
            <CardDescription className="text-xs">
              {t('settings.dangerZoneDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sign Out All Devices */}
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="font-medium text-sm">{t('settings.signOutAll')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('settings.signOutAllDesc')}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <LogOut className="h-4 w-4" />
                    {t('settings.signOut')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('settings.signOutAllTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('settings.signOutAllConfirm')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSignOutAllDevices}>
                      {t('common.confirm')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Delete Account */}
            <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              <div>
                <p className="font-medium text-sm text-red-400">{t('settings.deleteAccount')}</p>
                <p className="text-xs text-red-400/70">
                  {t('settings.deleteAccountDesc')}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    {t('common.delete')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-400">
                      {t('settings.deleteAccountTitle')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('settings.deleteAccountConfirm')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('settings.deleting')}
                        </>
                      ) : (
                        t('settings.deleteAccountButton')
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
