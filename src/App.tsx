import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { SubscriptionProvider } from '@/contexts/subscription-context'
import { WorkspaceProvider } from '@/contexts/workspace-context'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/auth-context'
import { PendingInvitesNotification } from '@/components/workspace/pending-invites-notification'

// Lazy load pages for code splitting
const AuthPage = lazy(() => import('@/pages/auth'))
const DashboardPage = lazy(() => import('@/pages/dashboard'))
const ProfilePage = lazy(() => import('@/pages/settings/profile'))
const NotificationsPage = lazy(() => import('@/pages/settings/notifications'))
const PreferencesPage = lazy(() => import('@/pages/settings/preferences'))
const BillingPage = lazy(() => import('@/pages/settings/billing'))
const PrivacyPolicyPage = lazy(() => import('@/pages/privacy-policy'))
const TermsOfServicePage = lazy(() => import('@/pages/terms-of-service'))
const AcceptInvitePage = lazy(() => import('@/pages/accept-invite'))

// Minimal loader
const PageLoader = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

function App() {
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
