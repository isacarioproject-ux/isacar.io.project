import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Autenticando com Google...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔍 [AuthCallback] Processando callback do Google...')
        
        // Pegar sessão do hash/query params
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ [AuthCallback] Erro ao obter sessão:', error)
          throw error
        }

        if (session) {
          console.log('✅ [AuthCallback] Sessão obtida com sucesso:', session.user.email)
          setStatus('success')
          setMessage('Login realizado com sucesso!')
          
          // Pequeno delay para mostrar feedback
          setTimeout(() => {
            navigate('/dashboard', { replace: true })
          }, 1500)
        } else {
          console.warn('⚠️ [AuthCallback] Nenhuma sessão encontrada')
          setStatus('error')
          setMessage('Nenhuma sessão encontrada')
          
          setTimeout(() => {
            navigate('/login', { replace: true })
          }, 2000)
        }
      } catch (error: any) {
        console.error('❌ [AuthCallback] Erro no callback:', error)
        setStatus('error')
        setMessage(error.message || 'Erro ao autenticar')
        
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 2000)
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-4"
      >
        {/* Ícone animado */}
        <div className="flex justify-center">
          {status === 'loading' && (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          )}
          {status === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <XCircle className="h-12 w-12 text-red-500" />
            </motion.div>
          )}
        </div>

        {/* Mensagem */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-lg font-medium">{message}</p>
          {status === 'loading' && (
            <p className="text-sm text-muted-foreground mt-2">
              Isso pode levar alguns segundos...
            </p>
          )}
          {status === 'error' && (
            <p className="text-sm text-muted-foreground mt-2">
              Redirecionando para a página de login...
            </p>
          )}
        </motion.div>

        {/* Loading dots animados */}
        {status === 'loading' && (
          <div className="flex justify-center gap-1 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-primary"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
