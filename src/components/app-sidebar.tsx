import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/logo'
import { WorkspaceSwitcher } from '@/components/workspace-switcher'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  BarChart3,
  User,
  Bell,
  Palette,
  CreditCard,
  LogOut,
  ChevronUp,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { useI18n } from '@/hooks/use-i18n'

export function AppSidebar() {
  const { t } = useI18n()
  const location = useLocation()
  const navigate = useNavigate()
  const { isMobile } = useSidebar()
  const [user, setUser] = useState<SupabaseUser | null>(null)

  const menuItems = [
    {
      title: t('nav.dashboard'),
      icon: LayoutDashboard,
      href: '/dashboard',
    },
  ]

  useEffect(() => {
    // Carregar usuário inicial
    const loadUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.warn('Erro ao carregar sessão no sidebar:', error)
          setUser(null)
          return
        }
        setUser(session?.user || null)
      } catch (err) {
        console.warn('Erro de conexão ao carregar usuário:', err)
        setUser(null)
      }
    }
    
    loadUser()

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    // Listener customizado para atualizações de perfil
    const handleUserUpdate = () => {
      console.log('🔄 Atualizando dados do usuário no sidebar...')
      loadUser()
    }

    window.addEventListener('user-updated', handleUserUpdate)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('user-updated', handleUserUpdate)
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  const getUserInitials = () => {
    if (!user?.email) return '??'
    const email = user.email
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 py-1">
          {/* Sidebar Aberta: WorkspaceSwitcher + Toggle */}
          <div className="group-data-[collapsible=icon]:hidden w-full flex items-center gap-2">
            <WorkspaceSwitcher />
            <SidebarTrigger className="ml-auto -mr-2" />
          </div>
          
          {/* Sidebar Fechada: Toggle no lugar do logo */}
          <div className="hidden group-data-[collapsible=icon]:flex w-full justify-center">
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                  >
                    <Link to={item.href} className="gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                    <AvatarFallback className="rounded-lg">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.user_metadata?.name || user?.email?.split('@')[0] || t('common.user')}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "top" : "bottom"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                      <AvatarFallback className="rounded-lg">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.user_metadata?.name || user?.email?.split('@')[0] || t('common.user')}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  {t('settings.profile')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings/notifications')}>
                  <Bell className="mr-2 h-4 w-4" />
                  {t('settings.notifications')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings/preferences')}>
                  <Palette className="mr-2 h-4 w-4" />
                  {t('settings.preferences')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings/billing')}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  {t('settings.billing')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('auth.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
