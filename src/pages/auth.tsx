import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Chrome, Github } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { loginSchema, registerSchema, forgotPasswordSchema, type LoginInput, type RegisterInput, type ForgotPasswordInput } from '@/lib/validations'
import { z } from 'zod'

type LoginStatus = 'idle' | 'loading' | 'success' | 'error'

export default function AuthPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
    remember: false,
  })
  const [registerData, setRegisterData] = useState<RegisterInput>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  })
  const [forgotData, setForgotData] = useState<ForgotPasswordInput>({ email: '' })
  const [status, setStatus] = useState<LoginStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  useEffect(() => {
    const rememberedEmail = window.localStorage.getItem('isacar:last-email')
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }))
    }
  }, [])

  const canSubmit = useMemo(() => formData.email && formData.password, [formData])

  const handleLogin = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setStatus('loading')
      setErrorMessage(null)
      setInfoMessage(null)

      const parsed = loginSchema.safeParse(formData)
      if (!parsed.success) {
        setStatus('error')
        setErrorMessage(parsed.error.issues[0]?.message ?? 'Preencha os campos corretamente')
        return
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        })

        if (error) {
          setStatus('error')
          setErrorMessage(error.message)
          return
        }

        if (!data.session) {
          setStatus('error')
          setErrorMessage('Não foi possível iniciar a sessão. Tente novamente.')
          return
        }

        if (parsed.data.remember) {
          window.localStorage.setItem('isacar:last-email', parsed.data.email)
        } else {
          window.localStorage.removeItem('isacar:last-email')
        }

        setStatus('success')
        setInfoMessage('Login realizado com sucesso! Redirecionando...')
        
        setTimeout(() => {
          navigate('/dashboard')
        }, 1000)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro inesperado ao fazer login'
        setStatus('error')
        setErrorMessage(message)
      }
    },
    [formData, navigate]
  )

  const handleRegister = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setStatus('loading')
      setErrorMessage(null)
      setInfoMessage(null)

      const parsed = registerSchema.safeParse(registerData)
      if (!parsed.success) {
        setStatus('error')
        setErrorMessage(parsed.error.issues[0]?.message ?? 'Preencha os campos corretamente')
        return
      }

      try {
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            data: {
              name: parsed.data.name,
            },
          },
        })

        if (error) {
          setStatus('error')
          setErrorMessage(error.message)
          return
        }

        if (data.user && !data.session) {
          setStatus('success')
          setInfoMessage('Conta criada! Verifique seu email para confirmar o cadastro.')
          return
        }

        setStatus('success')
        setInfoMessage('Conta criada com sucesso! Redirecionando...')
        
        setTimeout(() => {
          navigate('/dashboard')
        }, 1000)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro inesperado ao criar conta'
        setStatus('error')
        setErrorMessage(message)
      }
    },
    [registerData, navigate]
  )

  const handleForgot = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setStatus('loading')
      setErrorMessage(null)
      setInfoMessage(null)

      const parsed = forgotPasswordSchema.safeParse(forgotData)
      if (!parsed.success) {
        setStatus('error')
        setErrorMessage(parsed.error.issues[0]?.message ?? 'Informe um email válido')
        return
      }

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
          redirectTo: `${window.location.origin}/auth/reset`,
        })

        if (error) {
          setStatus('error')
          setErrorMessage(error.message)
          return
        }

        setStatus('success')
        setInfoMessage('Enviamos um link de recuperação para seu email.')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro inesperado ao enviar recuperação'
        setStatus('error')
        setErrorMessage(message)
      }
    },
    [forgotData]
  )

  const isLoading = status === 'loading'

  const renderFeedback = () => {
    if (errorMessage) {
      return (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {errorMessage}
        </div>
      )
    }

    if (infoMessage) {
      return (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          {infoMessage}
        </div>
      )
    }

    return null
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <Logo size="lg" className="mx-auto mb-4" />
            <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
            <CardDescription>
              Digite seu email para receber instruções de recuperação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderFeedback()}
            <form className="space-y-4" onSubmit={handleForgot}>
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  value={forgotData.email}
                  onChange={(event) => setForgotData({ email: event.target.value })}
                  disabled={isLoading}
                />
              </div>

              <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar email de recuperação'}
              </Button>
            </form>

            <button
              onClick={() => setShowForgotPassword(false)}
              className="w-full text-center text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              Voltar para login
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Logo size="lg" className="mx-auto mb-4" />
        </CardHeader>
        <CardContent>
          {renderFeedback()}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')} className="mt-4">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, email: event.target.value }))
                    }
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, password: event.target.value }))
                    }
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={formData.remember}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, remember: checked === true }))
                      }
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm text-slate-400 cursor-pointer"
                    >
                      Lembrar-me
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true)
                      setStatus('idle')
                      setErrorMessage(null)
                      setInfoMessage(null)
                    }}
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </div>

                <Button className="w-full" size="lg" type="submit" disabled={!canSubmit || isLoading}>
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-800/50 px-2 text-slate-400">ou</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg">
                  <Chrome className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button variant="outline" size="lg">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form className="space-y-4" onSubmit={handleRegister}>
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nome completo</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Seu nome"
                    autoComplete="name"
                    value={registerData.name}
                    onChange={(event) =>
                      setRegisterData((prev) => ({ ...prev, name: event.target.value }))
                    }
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    value={registerData.email}
                    onChange={(event) =>
                      setRegisterData((prev) => ({ ...prev, email: event.target.value }))
                    }
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Senha</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={registerData.password}
                    onChange={(event) =>
                      setRegisterData((prev) => ({ ...prev, password: event.target.value }))
                    }
                    disabled={isLoading}
                  />
                  <p className="text-xs text-slate-500">
                    Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 especial
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm">Confirmar senha</Label>
                  <Input
                    id="register-confirm"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={registerData.confirmPassword}
                    onChange={(event) =>
                      setRegisterData((prev) => ({ ...prev, confirmPassword: event.target.value }))
                    }
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={registerData.acceptTerms}
                    onCheckedChange={(checked) =>
                      setRegisterData((prev) => ({ ...prev, acceptTerms: checked === true }))
                    }
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-slate-400 cursor-pointer"
                  >
                    Aceito os{' '}
                    <a href="/terms" className="text-indigo-400 hover:text-indigo-300">
                      termos e condições
                    </a>
                  </label>
                </div>

                <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
                  {isLoading ? 'Criando conta...' : 'Criar conta'}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-800/50 px-2 text-slate-400">ou</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg">
                  <Chrome className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button variant="outline" size="lg">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
