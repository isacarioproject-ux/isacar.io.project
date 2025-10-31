import { useState, useEffect, FormEvent } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { supabase } from '@/lib/supabase'
import { User, Mail, Camera, Save, Key, Loader2, UserCircle, AlertCircle, Upload, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useI18n } from '@/hooks/use-i18n'

export default function ProfilePage() {
  const { t } = useI18n()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    bio: '',
    avatar_url: '',
  })
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  })
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      if (!user) throw new Error(t('profile.userNotFound'))

      setUser(user)
      setProfile({
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        email: user.email || '',
        bio: user.user_metadata?.bio || '',
        avatar_url: user.user_metadata?.avatar_url || '',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('profile.errorLoading'),
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)

      // 1. Update Auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          name: profile.full_name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
        },
      })

      if (authError) throw authError

      // 2. Update profiles table
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: profile.full_name,
            bio: profile.bio,
            avatar_url: profile.avatar_url,
            updated_at: new Date().toISOString(),
          })

        if (profileError) throw profileError
      }

      toast({
        title: t('profile.saved'),
        description: t('profile.savedDesc'),
      })

      // Recarregar dados do usuário para atualizar sidebar
      await fetchProfile()
      
      // Forçar reload da sessão para atualizar componentes
      window.dispatchEvent(new CustomEvent('user-updated'))
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('profile.errorSaving'),
        description: error.message,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    console.log('🔐 Iniciando troca de senha...', {
      newLength: passwordData.new.length,
      confirmLength: passwordData.confirm.length,
      match: passwordData.new === passwordData.confirm
    })

    if (passwordData.new !== passwordData.confirm) {
      console.warn('❌ Senhas não coincidem')
      toast({
        variant: 'destructive',
        title: t('profile.passwordMismatch'),
        description: t('profile.passwordMismatchDesc'),
      })
      return
    }

    if (passwordData.new.length < 8) {
      console.warn('❌ Senha muito curta:', passwordData.new.length)
      toast({
        variant: 'destructive',
        title: t('profile.passwordTooShort'),
        description: t('profile.passwordTooShortDesc'),
      })
      return
    }

    try {
      setSaving(true)
      console.log('📤 Enviando atualização de senha...')

      const { error } = await supabase.auth.updateUser({
        password: passwordData.new,
      })

      if (error) {
        console.error('❌ Erro do Supabase:', error)
        throw error
      }

      console.log('✅ Senha alterada com sucesso')

      toast({
        title: t('profile.passwordChanged'),
        description: t('profile.passwordChangedDesc'),
      })

      setPasswordData({ current: '', new: '', confirm: '' })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('profile.passwordError'),
        description: error.message,
      })
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'US'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true)
      const file = event.target.files?.[0]
      if (!file) return

      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Por favor, selecione uma imagem válida',
        })
        return
      }

      // Validar tamanho (máx 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'A imagem deve ter no máximo 2MB',
        })
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Upload para Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `avatars/${user.id}/${fileName}`

      console.log('📤 Iniciando upload:', { filePath, fileType: file.type, fileSize: file.size })

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        console.error('❌ Erro no upload:', uploadError)
        throw uploadError
      }

      console.log('✅ Upload concluído:', data)

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Atualizar perfil com nova URL
      setProfile({ ...profile, avatar_url: publicUrl })

      // Salvar automaticamente
      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      })

      if (authError) throw authError

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })

      if (profileError) throw profileError

      toast({
        title: 'Foto atualizada!',
        description: 'Sua foto de perfil foi alterada com sucesso',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer upload',
        description: error.message,
      })
    } finally {
      setUploadingAvatar(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 lg:p-6">
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
              <BreadcrumbLink asChild>
                <Link to="/settings">{t('settings.title')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('profile.title')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sidebar - Avatar */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('profile.avatar')}</CardTitle>
              <CardDescription className="text-xs">
                {t('profile.clickToChange')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-primary/20">
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-violet-500 text-lg font-bold text-white">
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="avatar-upload">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    disabled={uploadingAvatar}
                    asChild
                  >
                    <span>
                      {uploadingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </span>
                  </Button>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </div>

              <div className="text-center">
                <p className="font-medium text-sm">{profile.full_name || t('profile.noName')}</p>
                <p className="text-xs text-muted-foreground">{profile.email}</p>
              </div>

              <div className="w-full space-y-1">
                <Label htmlFor="avatar_url" className="text-xs">{t('profile.photoUrl')}</Label>
                <Input
                  id="avatar_url"
                  placeholder="https://..."
                  value={profile.avatar_url}
                  onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                  className="text-xs h-8"
                />
                <p className="text-xs text-muted-foreground">
                  {t('profile.pasteUrlOrUpload')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Informações Pessoais */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('profile.personalInfo')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t('profile.personalInfoDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">{t('profile.fullName')}</Label>
                  <Input
                    id="full_name"
                    placeholder={t('profile.fullNamePlaceholder')}
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('profile.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      value={profile.email}
                      disabled
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    {t('profile.emailCannotChange')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">{t('profile.bio')}</Label>
                  <Textarea
                    id="bio"
                    placeholder={t('profile.bioPlaceholder')}
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  />
                  <p className="text-xs text-slate-500">
                    {t('profile.maxChars', { current: profile.bio.length, max: 500 })}
                  </p>
                </div>

                <Button 
                  onClick={handleSaveProfile} 
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('settings.saving')}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t('common.save')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Alterar Senha */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  {t('profile.changePassword')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t('profile.changePasswordDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new_password">{t('profile.newPassword')}</Label>
                  <Input
                    id="new_password"
                    type="password"
                    placeholder={t('profile.minChars')}
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">{t('profile.confirmNewPassword')}</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder={t('profile.typeAgain')}
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  />
                </div>

                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
                  <p className="text-sm text-amber-400">
                    <strong>{t('profile.securityTip')}:</strong> {t('profile.securityTipDesc')}
                  </p>
                </div>

                <Button 
                  onClick={handleChangePassword} 
                  disabled={saving || !passwordData.new || !passwordData.confirm}
                  variant="outline"
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('profile.changing')}
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      {t('profile.changePasswordButton')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
