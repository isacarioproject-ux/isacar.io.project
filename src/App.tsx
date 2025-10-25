import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import AuthPage from '@/pages/auth'
import DashboardPage from '@/pages/dashboard'
import ProjectsPage from '@/pages/projects'
import DocumentsPage from '@/pages/documents'
import AnalyticsPage from '@/pages/analytics'
import TeamPage from '@/pages/team'
import InvitesPage from '@/pages/invites'
import SettingsPage from '@/pages/settings'
import ProfilePage from '@/pages/settings/profile'
import NotificationsPage from '@/pages/settings/notifications'
import PreferencesPage from '@/pages/settings/preferences'
import BillingPage from '@/pages/settings/billing'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/auth" element={<AuthPage />} />
          
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
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
