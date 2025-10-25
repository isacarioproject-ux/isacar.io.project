import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  BarChart3,
  Users,
  Mail,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Bell,
  Shield,
  CreditCard,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useMyInvites } from '@/hooks/use-my-invites'

interface SidebarProps {
  className?: string
}

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    title: 'Projetos',
    icon: FolderKanban,
    href: '/projects',
  },
  {
    title: 'Documentos',
    icon: FileText,
    href: '/documents',
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
  },
  {
    title: 'Equipe',
    icon: Users,
    href: '/team',
  },
  {
    title: 'Convites',
    icon: Mail,
    href: '/invites',
    badge: true, // Mostrar badge
  },
]

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const { invites } = useMyInvites()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  return (
    <aside
      className={cn(
        'relative flex h-screen flex-col border-r border-slate-800 bg-slate-900 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && <Logo size="md" />}
        {collapsed && (
          <div className="mx-auto">
            <Logo size="sm" showText={false} />
          </div>
        )}
      </div>

      <Separator className="bg-slate-800" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          const showBadge = item.badge && invites.length > 0

          return (
            <Link key={item.href} to={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 text-slate-400 hover:bg-slate-800 hover:text-slate-50',
                  isActive && 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300',
                  collapsed && 'justify-center'
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5 shrink-0" />
                  {showBadge && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {invites.length > 9 ? '9+' : invites.length}
                    </span>
                  )}
                </div>
                {!collapsed && (
                  <span className="flex-1">{item.title}</span>
                )}
                {!collapsed && showBadge && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                    {invites.length}
                  </span>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>

      <Separator className="bg-slate-800" />

      {/* Footer */}
      <div className="space-y-1 p-2">
        {/* Settings Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 text-slate-400 hover:bg-slate-800 hover:text-slate-50',
                location.pathname.startsWith('/settings') && 'bg-indigo-500/10 text-indigo-400',
                collapsed && 'justify-center'
              )}
            >
              <Settings className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Configurações</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            side="right" 
            align="end"
            className="w-56"
          >
            <DropdownMenuItem onClick={() => navigate('/settings/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings/notifications')}>
              <Bell className="mr-2 h-4 w-4" />
              <span>Notificações</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings/preferences')}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Preferências</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings/billing')}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Plano e Cobrança</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onSelect={() => handleLogout()}
              className="text-red-500 focus:text-red-400"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-slate-800 bg-slate-900 hover:bg-slate-800"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </aside>
  )
}
