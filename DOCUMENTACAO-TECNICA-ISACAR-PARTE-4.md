# 📋 DOCUMENTAÇÃO TÉCNICA - ISACAR v1.3.0 (PARTE 4 FINAL)

## 📁 ESTRUTURA DE PASTAS DO PROJETO

```
isacar.dev/
├── public/
│   ├── _redirects          # Vercel SPA routing
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   └── vite.svg
│
├── src/
│   ├── components/
│   │   ├── ui/             # shadcn/ui components (31 files)
│   │   ├── whiteboard/     # Whiteboard específico (25 files)
│   │   ├── dashboard-layout.tsx
│   │   ├── document-card.tsx
│   │   ├── document-dialog.tsx
│   │   ├── empty-state.tsx
│   │   ├── invite-member-modal.tsx
│   │   ├── loading-skeleton.tsx
│   │   ├── logo.tsx
│   │   ├── manage-collaborators-dialog.tsx
│   │   ├── member-card.tsx
│   │   ├── project-card.tsx
│   │   ├── project-dialog.tsx
│   │   ├── sidebar.tsx
│   │   ├── stats-card.tsx
│   │   ├── theme-provider.tsx
│   │   ├── theme-toggle.tsx
│   │   └── language-switcher.tsx
│   │
│   ├── contexts/
│   │   └── auth-context.tsx       # ✅ Context global de auth
│   │
│   ├── hooks/
│   │   ├── use-all-team-members.ts
│   │   ├── use-documents.ts
│   │   ├── use-i18n.ts
│   │   ├── use-media-query.ts
│   │   ├── use-my-invites.ts
│   │   ├── use-organization-members.ts  # ✅ Hook principal de membros
│   │   ├── use-projects.ts
│   │   ├── use-subscription.ts    # ✅ Hook de limites
│   │   └── use-whiteboard.ts
│   │
│   ├── lib/
│   │   ├── animations.ts          # Framer Motion variants
│   │   ├── i18n.ts                # Traduções
│   │   ├── supabase.ts            # ✅ Cliente Supabase
│   │   ├── utils.ts               # cn() helper
│   │   └── validations/           # Zod schemas
│   │       ├── project.ts
│   │       └── team-member.ts
│   │
│   ├── pages/
│   │   ├── analytics.tsx
│   │   ├── auth.tsx               # ✅ Login/Signup
│   │   ├── billing.tsx
│   │   ├── dashboard.tsx
│   │   ├── documents.tsx
│   │   ├── invites.tsx            # ✅ Aceitar convites
│   │   ├── preferences.tsx
│   │   ├── projects.tsx           # ✅ CRUD projetos
│   │   ├── settings.tsx
│   │   └── team.tsx               # ✅ Gerenciar membros
│   │
│   ├── types/
│   │   └── database.ts            # ✅ TypeScript interfaces
│   │
│   ├── App.tsx                    # Router
│   ├── index.css                  # Tailwind globals
│   └── main.tsx                   # Entry point
│
├── .gitignore
├── .vercelignore
├── components.json                # shadcn config
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json                    # ✅ Vercel SPA config
└── vite.config.ts                 # ✅ Vite + PWA
```

---

## 🔑 COMPONENTES PRINCIPAIS

### **1. AuthContext**
- **Local**: `src/contexts/auth-context.tsx`
- **Responsabilidade**: Estado global de autenticação
- **Exports**: `useAuth()` hook
- **Estado**: `{ user, loading, error }`

### **2. DashboardLayout**
- **Local**: `src/components/dashboard-layout.tsx`
- **Responsabilidade**: Layout principal com sidebar
- **Componentes**: `AppSidebar`, `Header`, `Content`

### **3. InviteMemberModal**
- **Local**: `src/components/invite-member-modal.tsx`
- **Props**: `onInvite: (email, role, name?) => Promise<void>`
- **Uso**: Convidar membros com role selection

### **4. ManageCollaboratorsDialog**
- **Local**: `src/components/manage-collaborators-dialog.tsx`
- **Props**: `project: Project`
- **Status**: ⚠️ UI pronta mas **não salva** colaboradores

### **5. ProjectCard**
- **Local**: `src/components/project-card.tsx`
- **Props**: `project: Project`
- **Ações**: Edit, Delete, Open

### **6. Whiteboards**
- **Local**: `src/components/whiteboard/`
- **Principais**:
  - `whiteboard-dialog.tsx` - Container principal
  - `futuristic-toolbar.tsx` - Toolbar 3D
  - `zoom-controls.tsx` - Controles de zoom
  - `share-dialog.tsx` - Compartilhamento

---

## 🎯 RECOMENDAÇÕES DE IMPLEMENTAÇÃO

### **PRIORIDADE 1: Sistema de Permissões Funcional**

#### **1.1. Criar Helper de Verificação**
```typescript
// src/lib/permissions.ts

export type ProjectRole = 'owner' | 'admin' | 'editor' | 'viewer'

export interface Permission {
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canInvite: boolean
  canManageMembers: boolean
  canUploadFiles: boolean
}

export const getProjectRole = async (
  userId: string, 
  projectId: string
): Promise<ProjectRole | null> => {
  // 1. Verificar se é owner do projeto
  const { data: project } = await supabase
    .from('projects')
    .select('user_id')
    .eq('id', projectId)
    .single()
    
  if (project?.user_id === userId) return 'owner'
  
  // 2. Verificar role em team_members
  const { data: member } = await supabase
    .from('team_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()
    
  return member?.role || null
}

export const getPermissions = (role: ProjectRole | null): Permission => {
  if (!role) return {
    canView: false,
    canEdit: false,
    canDelete: false,
    canInvite: false,
    canManageMembers: false,
    canUploadFiles: false,
  }
  
  const permissions: Record<ProjectRole, Permission> = {
    owner: {
      canView: true,
      canEdit: true,
      canDelete: true,
      canInvite: true,
      canManageMembers: true,
      canUploadFiles: true,
    },
    admin: {
      canView: true,
      canEdit: true,
      canDelete: false,  // Só owner deleta projeto
      canInvite: true,
      canManageMembers: true,
      canUploadFiles: true,
    },
    editor: {
      canView: true,
      canEdit: true,
      canDelete: false,
      canInvite: false,
      canManageMembers: false,
      canUploadFiles: true,
    },
    viewer: {
      canView: true,
      canEdit: false,
      canDelete: false,
      canInvite: false,
      canManageMembers: false,
      canUploadFiles: false,
    },
  }
  
  return permissions[role]
}
```

#### **1.2. Hook useProjectPermissions**
```typescript
// src/hooks/use-project-permissions.ts

import { useState, useEffect } from 'react'
import { getProjectRole, getPermissions, type Permission } from '@/lib/permissions'
import { useAuth } from '@/contexts/auth-context'

export const useProjectPermissions = (projectId: string | null) => {
  const { user } = useAuth()
  const [permissions, setPermissions] = useState<Permission | null>(null)
  const [role, setRole] = useState<ProjectRole | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!user || !projectId) {
      setPermissions(null)
      setRole(null)
      setLoading(false)
      return
    }
    
    const fetchPermissions = async () => {
      const userRole = await getProjectRole(user.id, projectId)
      setRole(userRole)
      setPermissions(getPermissions(userRole))
      setLoading(false)
    }
    
    fetchPermissions()
  }, [user, projectId])
  
  return { permissions, role, loading }
}
```

#### **1.3. Usar em Componentes**
```typescript
// src/pages/projects.tsx

const ProjectPage = () => {
  const { permissions } = useProjectPermissions(projectId)
  
  return (
    <>
      {permissions?.canEdit && (
        <Button onClick={handleEdit}>Editar</Button>
      )}
      {permissions?.canDelete && (
        <Button onClick={handleDelete}>Deletar</Button>
      )}
      {permissions?.canInvite && (
        <InviteMemberModal />
      )}
    </>
  )
}
```

---

### **PRIORIDADE 2: Simplificar Convites**

#### **Opção Recomendada: Convites Sempre de Projeto**

**Mudanças**:
1. Tornar `project_id` **obrigatório** em `team_members`
2. Remover lógica de convite de organização
3. Simplificar UI

```sql
-- Migration
ALTER TABLE team_members
ALTER COLUMN project_id SET NOT NULL;

ALTER TABLE team_members
ADD CONSTRAINT team_members_project_id_fk
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
```

```typescript
// Hook simplificado
const inviteMember = async (
  projectId: string,  // ✅ Agora obrigatório
  email: string,
  role: TeamMemberRole
) => {
  // Verificar permissão
  const myRole = await getProjectRole(userId, projectId)
  if (!['owner', 'admin'].includes(myRole)) {
    throw new Error('Sem permissão para convidar')
  }
  
  await supabase.from('team_members').insert({
    project_id: projectId,  // ✅ Sempre preenchido
    email,
    role,
    invited_by: userId,
    status: 'pending'
  })
}
```

---

### **PRIORIDADE 3: Atualizar RLS Policies**

```sql
-- Exemplo: Ver projetos onde sou owner ou membro ativo

CREATE POLICY "View own and collaborated projects"
ON projects FOR SELECT
USING (
  auth.uid() = user_id  -- Owner
  OR EXISTS (  -- OU sou membro ativo do projeto
    SELECT 1 FROM team_members
    WHERE team_members.project_id = projects.id
    AND team_members.user_id = auth.uid()
    AND team_members.status = 'active'
  )
);

-- Editar projeto: owner, admin ou editor

CREATE POLICY "Update projects with permission"
ON projects FOR UPDATE
USING (
  auth.uid() = user_id  -- Owner sempre pode
  OR EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.project_id = projects.id
    AND team_members.user_id = auth.uid()
    AND team_members.status = 'active'
    AND team_members.role IN ('admin', 'editor')
  )
);

-- Deletar projeto: apenas owner

CREATE POLICY "Delete own projects only"
ON projects FOR DELETE
USING (auth.uid() = user_id);
```

---

### **PRIORIDADE 4: Implementar Notificações**

#### **4.1. Edge Function para Envio de Email**
```typescript
// supabase/functions/send-invite-email/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'

serve(async (req) => {
  const { email, projectName, inviterName, inviteUrl } = await req.json()
  
  // Enviar email via Resend ou SendGrid
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'ISACAR <convites@isacar.io>',
      to: email,
      subject: `${inviterName} te convidou para ${projectName}`,
      html: `
        <h1>Você foi convidado!</h1>
        <p>${inviterName} te convidou para colaborar no projeto "${projectName}".</p>
        <a href="${inviteUrl}">Aceitar Convite</a>
      `
    })
  })
  
  return new Response('OK', { status: 200 })
})
```

#### **4.2. Trigger para Chamar Edge Function**
```sql
CREATE TRIGGER send_invite_email_trigger
AFTER INSERT ON team_members
FOR EACH ROW
WHEN (NEW.status = 'pending')
EXECUTE FUNCTION supabase_functions.http_request(
  'https://[PROJECT_REF].supabase.co/functions/v1/send-invite-email',
  'POST',
  json_build_object(
    'email', NEW.email,
    'projectName', (SELECT name FROM projects WHERE id = NEW.project_id),
    'inviterName', (SELECT full_name FROM profiles WHERE id = NEW.invited_by),
    'inviteUrl', 'https://app-isacar-dev.vercel.app/invites'
  )::text
);
```

---

## 📦 PRÓXIMOS PASSOS (Roadmap)

### **MVP (Versão 1.4.0)**
- [ ] Sistema de permissões funcional
- [ ] Simplificar convites (só projeto)
- [ ] RLS policies com verificação de roles
- [ ] Notificações de convites por email
- [ ] Fix whiteboard `project_id` para UUID

### **Versão 1.5.0**
- [ ] Tabela `project_collaborators`
- [ ] Gerenciamento robusto de colaboradores
- [ ] Permissões granulares por projeto
- [ ] Audit log de ações

### **Versão 2.0.0**
- [ ] Organizações (multi-tenant)
- [ ] Workspaces
- [ ] SSO (Single Sign-On)
- [ ] API pública
- [ ] Integrações (Slack, Discord, etc)

---

## ✅ RESUMO FINAL

### **O QUE FUNCIONA BEM**
- ✅ Autenticação Supabase
- ✅ CRUD de projetos
- ✅ CRUD de documentos
- ✅ Whiteboards colaborativos em tempo real
- ✅ Sistema de assinaturas e limites
- ✅ UI/UX moderna e responsiva
- ✅ Deploy automatizado na Vercel

### **O QUE PRECISA SER IMPLEMENTADO**
- ❌ Verificação de permissões (roles não são checadas)
- ❌ Gerenciamento claro de colaboradores em projetos
- ❌ Notificações de convites por email
- ❌ RLS policies com verificação de roles
- ❌ Audit log
- ❌ Fix `whiteboard.project_id` (TEXT → UUID)

### **DECISÕES ARQUITETURAIS PENDENTES**
- 🤔 Manter convites de organização ou simplificar para só projeto?
- 🤔 Criar tabela `organizations` separada?
- 🤔 Usar `project_collaborators` ou confiar só em `team_members`?

---

## 📞 INFORMAÇÕES DE CONTATO E ACESSO

**Supabase Project**:
- URL: https://jjeudthfiqvvauuqnezs.supabase.co
- Project ID: jjeudthfiqvvauuqnezs

**Vercel Deploy**:
- URL: https://app-isacar-dev.vercel.app

**Repositório Git**:
- GitHub: https://github.com/isacarioproject-ux/app.isacar.dev.git

**Versão Atual**: v1.3.0  
**Última Atualização**: Novembro 2024

---

FIM DA DOCUMENTAÇÃO TÉCNICA COMPLETA
