import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function GoogleIntegrationCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processando autorização...')

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state') // workspace_id
        const error = searchParams.get('error')

        if (error) {
          throw new Error('Autorização negada')
        }

        if (!code || !state) {
          throw new Error('Dados inválidos')
        }

        // Trocar código por tokens (via Edge Function)
        const { data, error: exchangeError } = await supabase.functions.invoke(
          'google-oauth-exchange',
          {
            body: { 
              code, 
              workspace_id: state 
            }
          }
        )

        if (exchangeError) throw exchangeError

        setStatus('success')
        setMessage('Google conectado com sucesso!')

        // Notificar janela pai (popup)
        if (window.opener) {
          window.opener.postMessage(
            { type: 'google-oauth-success', data },
            window.location.origin
          )
          
          // Fechar popup após 1s
          setTimeout(() => {
            window.close()
          }, 1000)
        } else {
          // Se não é popup, redirecionar
          setTimeout(() => {
            navigate('/settings/integrations')
          }, 2000)
        }

      } catch (error: any) {
        console.error('Erro no callback Google:', error)
        setStatus('error')
        setMessage(error.message || 'Erro ao conectar')

        setTimeout(() => {
          if (window.opener) {
            window.close()
          } else {
            navigate('/settings/integrations')
          }
        }, 3000)
      }
    }

    processCallback()
  }, [searchParams, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center">
          {status === 'loading' && (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          )}
          {status === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <CheckCircle className="h-12 w-12 text-green-500" />
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <XCircle className="h-12 w-12 text-red-500" />
            </motion.div>
          )}
        </div>

        <p className="text-lg font-medium">{message}</p>
      </motion.div>
    </div>
  )
}
