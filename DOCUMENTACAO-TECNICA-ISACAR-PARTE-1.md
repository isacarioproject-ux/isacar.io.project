# 📋 DOCUMENTAÇÃO TÉCNICA COMPLETA - ISACAR v1.3.0

## 🎯 OBJETIVO DO DOCUMENTO

Este documento descreve **TODA a arquitetura, lógica e funcionalidades** do sistema ISACAR para permitir que outra IA possa entender completamente o projeto e propor melhorias no sistema de permissões, gerenciamento de membros e colaboração em projetos.

---

## 📊 VISÃO GERAL DO SISTEMA

**ISACAR** é uma plataforma SaaS de gestão de projetos e documentos com foco em colaboração em equipe, incluindo:
- Gerenciamento de projetos
- Sistema de documentos com upload
- Whiteboards colaborativos em tempo real
- Sistema de convites e membros de equipe
- Controle de assinaturas e limites por plano
- Multi-idioma (PT-BR, EN, ES)
- Dark/Light mode

---

## 🛠️ STACK TÉCNICO COMPLETO

### **Frontend**
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: React Hooks + Context API
- **Styling**: TailwindCSS + shadcn/ui components
- **Animations**: Framer Motion
- **Forms/Validation**: Zod schemas
- **Icons**: Lucide React
- **Charts**: Recharts
- **Toasts**: Sonner
- **PWA**: vite-plugin-pwa (workbox)
- **i18n**: Custom hook with localStorage

### **Backend/Database**
- **BaaS**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Authentication**: Supabase Auth (JWT)
- **Database**: PostgreSQL 15
- **RLS**: Row Level Security (Supabase)
- **Storage**: Supabase Storage (public bucket)
- **Realtime**: Supabase Realtime (websockets)

### **Deploy**
- **Hosting**: Vercel
- **CI/CD**: Git push → Vercel auto-deploy
- **Domain**: app-isacar-dev.vercel.app
- **Environment**: Production

### **Principais Bibliotecas**
```json
{
  "@supabase/supabase-js": "^2.x",
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "tailwindcss": "^3.x",
  "framer-motion": "^11.x",
  "zod": "^3.x",
  "sonner": "^1.x",
  "lucide-react": "^0.x",
  "recharts": "^2.x"
}
```

---

## 🔐 SISTEMA DE AUTENTICAÇÃO

### **Arquitetura**
- **Provider**: `AuthContext` (`src/contexts/auth-context.tsx`)
- **State Global**: `user`, `loading`, `error`
- **Persistência**: Supabase Session (localStorage)
- **Auto-refresh**: Token JWT auto-refresh

### **Fluxo de Autenticação**

#### **Cadastro (SignUp)**
```typescript
supabase.auth.signUp({
  email, password,
  options: { data: { name } }
})
```
- Cria usuário no `auth.users`
- Envia email de confirmação
- Retorna session se email não precisa confirmação
- Trigger cria perfil em `public.profiles`

#### **Login**
```typescript
supabase.auth.signInWithPassword({ email, password })
```
- Valida credenciais
- Retorna JWT token + refresh token
- Atualiza `AuthContext.user`
- Redirect para `/dashboard`

#### **Logout**
```typescript
supabase.auth.signOut()
```
- Limpa session localStorage
- Reseta `AuthContext.user` para `null`
- Redirect para `/auth`

#### **Recuperação de Senha**
```typescript
supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${origin}/auth/reset`
})
```
- Envia email com link mágico
- Link redireciona para reset password page

### **Proteção de Rotas**
```typescript
// src/App.tsx
{user ? <DashboardRoutes /> : <Navigate to="/auth" />}
```
- Verifica `AuthContext.user`
- Redireciona não autenticados para `/auth`

### **OAuth Providers** (Configurados mas não implementados)
- Google OAuth
- GitHub OAuth

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### **Tabelas Principais**

#### 1. **auth.users** (Gerenciado pelo Supabase)
- `id` (UUID) - PK
- `email` (TEXT) - UNIQUE
- `encrypted_password` (TEXT)
- `email_confirmed_at` (TIMESTAMPTZ)
- `last_sign_in_at` (TIMESTAMPTZ)
- Metadados: `raw_user_meta_data`, `raw_app_meta_data`

#### 2. **public.profiles**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```
- RLS: Desabilitado
- Trigger: Auto-criado no signup

#### 3. **public.user_preferences**
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id),
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  session_timeout INTEGER DEFAULT 30,
  login_notifications BOOLEAN DEFAULT TRUE,
  suspicious_activity_alerts BOOLEAN DEFAULT TRUE,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  time_format TEXT DEFAULT '24h',
  timezone_dialog_shown BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```
- RLS: Habilitado (user vê apenas seu próprio)
- Uso: Settings de segurança e preferências

#### 4. **public.notification_settings**
```sql
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  setting_key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, setting_key)
)
```
- RLS: Habilitado
- Uso: Preferências de notificações individuais

---

## 📁 SISTEMA DE PROJETOS

### **Tabela: public.projects**
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'Planejamento',
    CHECK (status IN ('Planejamento', 'Em andamento', 'Concluído', 'Pausado', 'Cancelado')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  team_size INTEGER DEFAULT 1,
  due_date DATE,
  color VARCHAR(50) DEFAULT 'indigo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

### **RLS Policies - Projects**
```sql
-- SELECT: Ver próprios projetos
CREATE POLICY "Users can view own projects"
ON projects FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Criar projetos (com limite de plano)
CREATE POLICY "Users can create projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Atualizar próprios projetos
CREATE POLICY "Users can update own projects"
ON projects FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE: Deletar próprios projetos
CREATE POLICY "Users can delete own projects"
ON projects FOR DELETE
USING (auth.uid() = user_id);
```

### **Hook: use-projects.ts**
```typescript
interface UseProjectsReturn {
  projects: Project[]
  loading: boolean
  error: Error | null
  createProject: (data) => Promise<Project | null>
  updateProject: (id, data) => Promise<boolean>
  deleteProject: (id) => Promise<boolean>
  refetch: () => Promise<void>
}
```

**Funcionalidades**:
- CRUD completo de projetos
- Realtime updates (subscribed to `projects` table changes)
- Verificação de limite do plano antes de criar
- Atualização otimista no estado local

### **Relações do Projeto**
- **1:N** com `documents` (project_id)
- **1:N** com `whiteboards` (project_id - TEXT)
- **1:N** com `team_members` (project_id - opcional)

---

Continua na Parte 2...
