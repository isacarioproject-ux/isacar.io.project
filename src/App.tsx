import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { SubscriptionProvider } from '@/contexts/subscription-context'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/auth-context'

// Lazy load pages for code splitting
const AuthPage = lazy(() => import('@/pages/auth'))
const DashboardPage = lazy(() => import('@/pages/dashboard'))
const ProjectsPage = lazy(() => import('@/pages/projects'))
const DocumentsPage = lazy(() => import('@/pages/documents'))
const AnalyticsPage = lazy(() => import('@/pages/analytics'))
const TeamPage = lazy(() => import('@/pages/team'))
const InvitesPage = lazy(() => import('@/pages/invites'))
const SettingsPage = lazy(() => import('@/pages/settings'))
const ProfilePage = lazy(() => import('@/pages/settings/profile'))
const NotificationsPage = lazy(() => import('@/pages/settings/notifications'))
const PreferencesPage = lazy(() => import('@/pages/settings/preferences'))
const BillingPage = lazy(() => import('@/pages/settings/billing'))
const PrivacyPolicyPage = lazy(() => import('@/pages/privacy-policy'))
const TermsOfServicePage = lazy(() => import('@/pages/terms-of-service'))

// Minimal loader - sem chamadas assíncronas
const PageLoader = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
        <div className="absolute inset-2 animate-pulse rounded-full bg-primary/50" />
        <div className="absolute inset-4 rounded-full bg-primary" />
      </div>
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
            <Suspense fallback={<PageLoader />}>
            <Routes>
          {/* Auth */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Legal Pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/invites" element={<InvitesPage />} />
          
          {/* Settings Routes */}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/profile" element={<ProfilePage />} />
          <Route path="/settings/notifications" element={<NotificationsPage />} />
          <Route path="/settings/preferences" element={<PreferencesPage />} />
          <Route path="/settings/billing" element={<BillingPage />} />
          
          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            </Suspense>
          </SubscriptionProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
