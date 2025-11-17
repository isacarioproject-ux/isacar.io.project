import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useWorkspace } from '@/contexts/workspace-context'
import { toast } from 'sonner'

interface GoogleIntegration {
  id: string
  google_email: string
  is_active: boolean
  scopes: string[]
  settings: {
    gmail: { enabled: boolean; auto_import: boolean }
    calendar: { enabled: boolean; sync_tasks: boolean }
    sheets: { enabled: boolean }
  }
  created_at: string
}

export function useGoogleIntegration() {
  const { currentWorkspace } = useWorkspace()
  const [integration, setIntegration] = useState<GoogleIntegration | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  // Verificar se Google está conectado
  const checkConnection = useCallback(async () => {
    if (!currentWorkspace?.id) {
      setChecking(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('google_integrations')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .eq('is_active', true)
        .maybeSingle()

      if (error) throw error

      setIntegration(data)
    } catch (error) {
      console.error('Erro ao verificar integração Google:', error)
    } finally {
      setChecking(false)
    }
  }, [currentWorkspace?.id])

  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  // Conectar Google (OAuth)
  const connect = useCallback(async () => {
    if (!currentWorkspace?.id) {
      toast.error('Selecione um workspace primeiro')
      return
    }

    setLoading(true)

    try {
      // Scopes necessários
      const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.labels',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/drive.file'
      ]

      // Construir URL OAuth (Supabase Auth callback)
      const redirectUri = 'https://jjeudthfiqvvauuqnezs.supabase.co/auth/v1/callback'

      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      authUrl.searchParams.set('client_id', import.meta.env.VITE_GOOGLE_CLIENT_ID!)
      authUrl.searchParams.set('redirect_uri', redirectUri)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', scopes.join(' '))
      authUrl.searchParams.set('access_type', 'offline')
      authUrl.searchParams.set('prompt', 'consent')
      authUrl.searchParams.set('state', currentWorkspace.id) // Passar workspace ID

      // Abrir popup OAuth
      const width = 600
      const height = 700
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2

      const popup = window.open(
        authUrl.toString(),
        'google-oauth',
        `width=${width},height=${height},left=${left},top=${top}` 
      )

      if (!popup) {
        toast.error('Popup bloqueado! Permita popups para este site.')
        setLoading(false)
        return
      }

      // Aguardar callback
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return
        if (event.data.type !== 'google-oauth-success') return

        popup?.close()
        window.removeEventListener('message', handleMessage)

        // Recarregar integração
        await checkConnection()
        toast.success('Google conectado com sucesso!')
        setLoading(false)
      }

      window.addEventListener('message', handleMessage)

      // Timeout de 5 minutos
      setTimeout(() => {
        if (!popup.closed) {
          popup.close()
          toast.error('Tempo esgotado. Tente novamente.')
          setLoading(false)
        }
        window.removeEventListener('message', handleMessage)
      }, 5 * 60 * 1000)

    } catch (error: any) {
      console.error('Erro ao conectar Google:', error)
      toast.error('Erro ao conectar Google')
      setLoading(false)
    }
  }, [currentWorkspace?.id, checkConnection])

  // Desconectar
  const disconnect = useCallback(async () => {
    if (!integration) return

    if (!confirm('Desconectar Google? Você precisará reconectar para usar as integrações.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('google_integrations')
        .delete()
        .eq('id', integration.id)

      if (error) throw error

      setIntegration(null)
      toast.success('Google desconectado')
    } catch (error) {
      console.error('Erro ao desconectar:', error)
      toast.error('Erro ao desconectar Google')
    }
  }, [integration])

  // Atualizar configurações
  const updateSettings = useCallback(async (newSettings: Partial<GoogleIntegration['settings']>) => {
    if (!integration) return

    try {
      const { error } = await supabase
        .from('google_integrations')
        .update({
          settings: { ...integration.settings, ...newSettings }
        })
        .eq('id', integration.id)

      if (error) throw error

      setIntegration(prev => prev ? { ...prev, settings: { ...prev.settings, ...newSettings } } : null)
      toast.success('Configurações atualizadas')
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
      toast.error('Erro ao atualizar configurações')
    }
  }, [integration])

  return {
    integration,
    isConnected: !!integration,
    loading,
    checking,
    connect,
    disconnect,
    updateSettings,
    refresh: checkConnection
  }
}
