import { ReactNode, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { AppSidebar } from '@/components/sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { GlobalSearch } from '@/components/global-search'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { Search } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { useI18n } from '@/hooks/use-i18n'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const { t } = useI18n()

  // Global search shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    // Verificar sessão em background - NÃO bloqueia
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.warn('Erro de conexão ao verificar sessão:', error)
          // Não redireciona em caso de erro de rede
          return
        }
        if (!session) {
          navigate('/auth')
        } else {
          setUser(session.user)
        }
      })
      .catch((err) => {
        console.warn('Erro de rede ao verificar sessão:', err)
        // Mantém na página atual em caso de erro
      })

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/auth')
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  // Renderiza imediatamente - sem bloqueio
  return (
    <SidebarProvider defaultOpen={true}>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-10 flex h-12 items-center gap-3 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 lg:h-14 lg:px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-1 items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchOpen(true)}
                className="relative h-8 w-auto justify-start text-xs text-muted-foreground md:w-48 lg:w-56"
              >
                <Search className="mr-2 h-3.5 w-3.5" />
                <span className="hidden md:inline-flex">Buscar...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[9px] font-medium opacity-100 md:flex">
                  <span>⌘K</span>
                </kbd>
              </Button>
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </header>
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
