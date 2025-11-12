# 🔄 BACKUP - SIDEBAR CUSTOMIZAÇÕES

## Data: 2025-11-07

### Menu Items Salvos:
```typescript
const menuItems = [
  {
    title: t('nav.dashboard'),
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    title: t('nav.analytics'),
    icon: BarChart3,
    href: '/analytics',
  },
]
```

### Imports Necessários:
```typescript
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/logo'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/hooks/use-i18n'
```

### Dropdown Menu User:
- Profile → `/settings/profile`
- Notifications → `/settings/notifications`
- Preferences → `/settings/preferences`
- Billing → `/settings/billing`
- Logout → `handleLogout()`

### Auth Logic:
```typescript
useEffect(() => {
  const loadUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user || null)
  }
  
  loadUser()
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user || null)
  })
  
  window.addEventListener('user-updated', handleUserUpdate)
  
  return () => {
    subscription.unsubscribe()
    window.removeEventListener('user-updated', handleUserUpdate)
  }
}, [])
```

### User Initials:
```typescript
const getUserInitials = () => {
  if (!user?.email) return '??'
  return user.email.substring(0, 2).toUpperCase()
}
```

---

## ✅ BACKUP COMPLETO
Todas as customizações foram salvas!
