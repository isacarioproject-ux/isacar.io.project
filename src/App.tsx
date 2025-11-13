import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { SubscriptionProvider } from '@/contexts/subscription-context'
import { WorkspaceProvider } from '@/contexts/workspace-context'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/auth-context'
import { PendingInvitesNotification } from '@/components/workspace/pending-invites-notification'
import { InitialPreload } from '@/components/loading-skeleton'
import { useReminderServices } from '@/hooks/use-reminder-services'

// Lazy load pages for code splitting
const AuthPage = lazy(() => import('@/pages/auth'))
const DashboardPage = lazy(() => import('@/pages/dashboard'))
const MyWorkPage = lazy(() => import('@/pages/my-work'))
const MyFinancePage = lazy(() => import('@/pages/my-finance'))
const ProfilePage = lazy(() => import('@/pages/settings/profile'))
const NotificationsPage = lazy(() => import('@/pages/settings/notifications'))
const PreferencesPage = lazy(() => import('@/pages/settings/preferences'))
const BillingPage = lazy(() => import('@/pages/settings/billing'))
const PrivacyPolicyPage = lazy(() => import('@/pages/privacy-policy'))
const TermsOfServicePage = lazy(() => import('@/pages/terms-of-service'))
const AcceptInvitePage = lazy(() => import('@/pages/accept-invite'))

// Loader minimalista para lazy loading de páginas
const PageLoader = () => <InitialPreload />

function App() {
  // Inicializar serviços de lembrete
  useReminderServices();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
      <Toaster richColors position="top-right" expand={false} />
      <BrowserRouter>
        <AuthProvider>
          <SubscriptionProvider>
            <WorkspaceProvider>
              <Suspense fallback={<PageLoader />}>
            <Routes>
          {/* Auth */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Legal Pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          
          {/* Workspace Invite - ANTES dos redirects */}
          <Route path="/invite/:token" element={<AcceptInvitePage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/meu-trabalho" element={<MyWorkPage />} />
          <Route path="/minha-financa" element={<MyFinancePage />} />
          
          {/* Settings Routes */}
          <Route path="/settings/profile" element={<ProfilePage />} />
          <Route path="/settings/notifications" element={<NotificationsPage />} />
          <Route path="/settings/preferences" element={<PreferencesPage />} />
          <Route path="/settings/billing" element={<BillingPage />} />
          
          {/* Redirects - apenas home */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            </Suspense>
            
            {/* Notificação de convites pendentes */}
            <PendingInvitesNotification />
            </WorkspaceProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
