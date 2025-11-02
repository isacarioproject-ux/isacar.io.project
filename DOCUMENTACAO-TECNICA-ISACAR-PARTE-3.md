# 📋 DOCUMENTAÇÃO TÉCNICA - ISACAR v1.3.0 (PARTE 3)

## 🎨 SISTEMA DE WHITEBOARDS

### **Tabela: public.whiteboards**
```sql
CREATE TABLE whiteboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  project_id TEXT NULL,  -- ⚠️ TEXT (não UUID!)
  name TEXT DEFAULT 'Whiteboard sem título',
  items JSONB DEFAULT '[]',  -- Array de objetos canvas
  is_favorite BOOLEAN DEFAULT FALSE,
  collaborators UUID[] DEFAULT ARRAY[]::uuid[],
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  team_id UUID NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  whiteboard_type TEXT DEFAULT 'tasks' 
    CHECK (whiteboard_type IN ('tasks', 'plans', 'journey')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**⚠️ PROBLEMA**: `project_id` é TEXT mas deveria ser UUID!

### **Funcionalidades Implementadas**
- **11 ferramentas**: Select, Hand, Checkbox, Post-it, Text, Box, Circle, Triangle, Line, Arrow, Image
- **Undo/Redo**: 50 steps de histórico
- **Auto-save**: 10s debounce
- **Zoom/Pan**: 30-300% zoom
- **Real-time**: Cursores colaborativos (via Supabase Realtime)
- **Templates**: 6 templates prontos
- **Export**: PNG, PDF, Clipboard
- **Compartilhamento**: Link público (view/edit)

### **RLS Policies - Whiteboards**
```sql
-- Ver próprios whiteboards + onde é colaborador
CREATE POLICY "View own and collaborated whiteboards"
ON whiteboards FOR SELECT
USING (
  auth.uid() = user_id 
  OR auth.uid() = ANY(collaborators)
);

-- Criar whiteboards
CREATE POLICY "Create own whiteboards"
ON whiteboards FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Atualizar se for owner ou colaborador
CREATE POLICY "Update own or collaborated whiteboards"
ON whiteboards FOR UPDATE
USING (
  auth.uid() = user_id 
  OR auth.uid() = ANY(collaborators)
);

-- Deletar apenas se for owner
CREATE POLICY "Delete own whiteboards"
ON whiteboards FOR DELETE
USING (auth.uid() = user_id);
```

### **Colaboração Real-time**
```typescript
// Subscription para mudanças no whiteboard
const channel = supabase.channel(`whiteboard:${whiteboardId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'whiteboards',
    filter: `id=eq.${whiteboardId}`
  }, (payload) => {
    setWhiteboard(payload.new)
  })
  .on('broadcast', { event: 'cursor_move' }, ({ payload }) => {
    updateCollaboratorCursor(payload)
  })
  .subscribe()
```

**Cursores colaborativos**: Broadcast events para mostrar posição do mouse de outros usuários

---

## 💰 SISTEMA DE ASSINATURAS E LIMITES

### **Tabela: public.subscriptions**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
  plan_id TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  billing_period TEXT DEFAULT 'monthly',
  next_billing_date TIMESTAMPTZ,
  
  -- Limites do plano
  projects_limit INTEGER DEFAULT 1,
  whiteboards_per_project_limit INTEGER DEFAULT 3,
  members_limit INTEGER DEFAULT 2,
  invited_members_limit INTEGER DEFAULT 1,
  storage_limit_gb INTEGER DEFAULT 1,
  
  -- Uso atual
  projects_used INTEGER DEFAULT 0,
  whiteboards_used INTEGER DEFAULT 0,
  members_used INTEGER DEFAULT 1,
  storage_used_gb NUMERIC DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

### **Planos Disponíveis**

| Plan | Preço/mês | Projetos | Whiteboards | Membros | Storage |
|------|-----------|----------|-------------|---------|---------|
| **FREE** | R$ 0 | 1 | 3/projeto | 2 | 1 GB |
| **PRO** | R$ 65 | 5 | Ilimitados | 10 | 50 GB |
| **BUSINESS** | R$ 197 | Ilimitados | Ilimitados | Ilimitados | 200 GB |
| **ENTERPRISE** | Customizado | Ilimitados | Ilimitados | Ilimitados | Customizado |

**Desconto Anual**: 20% OFF

### **Hook: use-subscription.ts**
```typescript
interface UseSubscriptionReturn {
  subscription: Subscription | null
  loading: boolean
  error: Error | null
  canCreateProject: () => boolean
  canCreateWhiteboard: (projectId: string) => Promise<boolean>
  canInviteMember: () => boolean
  checkStorageLimit: (sizeInBytes: number) => boolean
  refetch: () => Promise<void>
}
```

### **Verificação de Limites**
```typescript
const canCreateProject = () => {
  const limit = subscription.limits.projects_limit
  const used = subscription.usage.projects_used
  
  if (limit === -1) return true  // Ilimitado
  
  if (used >= limit) {
    toast.error('Limite de projetos atingido')
    return false
  }
  
  return true
}
```

### **Triggers para Atualização Automática**
```sql
-- Trigger: Atualizar usage ao criar/deletar projeto
CREATE TRIGGER update_subscription_usage_projects
AFTER INSERT OR DELETE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_subscription_usage();
```

**Função**: `update_subscription_usage()`
- Conta projetos, whiteboards, membros ativos
- Atualiza `subscriptions.projects_used`, etc
- **⚠️ BUG CORRIGIDO v1.3.0**: Cast `project_id::UUID` para JOIN com whiteboards

---

## 🌐 SISTEMA DE INTERNACIONALIZAÇÃO (i18n)

### **Implementação**
- **Hook**: `useI18n()` (`src/hooks/use-i18n.ts`)
- **Storage**: `localStorage.getItem('isacar:locale')`
- **Idiomas**: `pt-BR`, `en`, `es`
- **Traduções**: Objeto JSON com chaves aninhadas

```typescript
const translations = {
  'pt-BR': {
    common: { save: 'Salvar', cancel: 'Cancelar' },
    projects: { title: 'Projetos', create: 'Criar Projeto' }
  },
  'en': {
    common: { save: 'Save', cancel: 'Cancel' },
    projects: { title: 'Projects', create: 'Create Project' }
  }
}
```

### **Uso**
```typescript
const { t } = useI18n()
return <Button>{t('projects.create')}</Button>
```

---

## 🎨 DESIGN SYSTEM

### **shadcn/ui Components**
- Button, Input, Select, Dialog, Modal, Drawer
- Card, Badge, Avatar, Skeleton
- Tabs, Accordion, DropdownMenu
- Sidebar (collapsible)

### **Tailwind Classes Padrão**
- **Spacing**: `p-6`, `gap-4`, `space-y-6`
- **Typography**: `text-lg`, `text-sm`, `text-xs`
- **Icons**: `h-4 w-4`
- **Borders**: `rounded-lg`, `border`
- **Colors**: `bg-primary`, `text-foreground` (theme-aware)

### **Animações**
- **Framer Motion**: Transitions, hover effects
- **Variants**: `scaleIn`, `fadeIn`, `slideIn`

---

## ❗ PROBLEMAS CRÍTICOS E MELHORIAS NECESSÁRIAS

### **1. Sistema de Permissões Inexistente**
**PROBLEMA**: Roles (`owner`, `admin`, `editor`, `viewer`) estão definidas mas **NÃO são verificadas** em nenhuma ação!

**IMPACTO**:
- Qualquer membro pode convidar outros
- Qualquer membro pode editar/deletar projetos
- Qualquer membro pode remover outros membros
- Sem controle granular de acesso

**SOLUÇÃO NECESSÁRIA**:
1. Criar helper `getUserProjectRole(userId, projectId)`
2. Verificar role antes de **CADA ação**:
   - Convidar → `role IN ('owner', 'admin')`
   - Editar projeto → `role IN ('owner', 'admin', 'editor')`
   - Deletar projeto → `role = 'owner'`
   - Upload doc → `role IN ('owner', 'admin', 'editor')`
3. Atualizar RLS policies para verificar roles
4. Adicionar UI feedback (botões desabilitados se sem permissão)

### **2. Confusão: Convite de Organização vs Projeto**
**PROBLEMA**: `team_members.project_id` é **opcional**, criando 2 tipos de convite:
- `project_id = NULL` → Convite de organização
- `project_id = <uuid>` → Convite de projeto específico

**CONFUSÃO**:
- Usuário aceita convite de organização mas não é adicionado a nenhum projeto
- Não há fluxo para "adicionar membro da organização a um projeto"
- Interface mistura os dois tipos sem clareza

**SOLUÇÕES POSSÍVEIS**:

#### **Opção A: Manter Organização + Projeto**
1. Criar tabela `organizations` separada
2. `team_members` vira `organization_members`
3. Criar tabela `project_members` (M:N entre projects e organization_members)
4. Fluxo:
   - Convidar para organização → vira membro da org
   - Owner adiciona membros da org a projetos específicos
   - Cada projeto tem seus próprios membros com roles

#### **Opção B: Simplificar (Só Projetos)**
1. Remover `project_id = NULL`
2. Todo convite é **sempre** para um projeto
3. Simplificar UI e lógica
4. Mais fácil de entender para usuário

**RECOMENDAÇÃO**: Opção B (simplificar) para MVP, Opção A para escala

### **3. Falta Gerenciamento de Colaboradores em Projetos**
**PROBLEMA**: Existe `ManageCollaboratorsDialog` mas:
- Só mostra UI de selecionar membros
- **NÃO salva** colaboradores no projeto
- Não tem tabela `project_collaborators`
- Colaboradores de whiteboard são array UUID

**SOLUÇÃO**:
1. Criar tabela `project_collaborators`:
```sql
CREATE TABLE project_collaborators (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES auth.users(id),
  role VARCHAR(50) CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  added_by UUID REFERENCES auth.users(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
)
```
2. Implementar lógica de adicionar/remover colaboradores
3. Atualizar RLS de `projects`, `documents`, `whiteboards` para respeitar colaboradores

### **4. Whiteboards: project_id é TEXT (deveria ser UUID)**
**PROBLEMA**:
```sql
project_id TEXT NULL  -- ❌ ERRADO
```
Deveria ser:
```sql
project_id UUID NULL REFERENCES projects(id)  -- ✅ CORRETO
```

**IMPACTO**:
- Não tem foreign key constraint
- Não valida se projeto existe
- Dificulta JOINs

**SOLUÇÃO**: Migration para alterar tipo de coluna

### **5. Falta Sistema de Notificações**
**PROBLEMA**: Usuário **não recebe email** quando:
- É convidado para projeto
- Convite é aceito/recusado
- Documento é compartilhado
- Projeto muda de status

**SOLUÇÃO**:
1. Integrar Supabase Edge Functions + Resend/SendGrid
2. Templates de email para cada evento
3. Preferências de notificação (`notification_settings`)

### **6. Storage: Sem Verificação de Limites**
**PROBLEMA**: Upload de arquivo **não verifica** `storage_limit_gb` do plano

**SOLUÇÃO**:
```typescript
const uploadFile = async (file: File) => {
  const sizeGB = file.size / (1024 * 1024 * 1024)
  
  if (!checkStorageLimit(file.size)) {
    throw new Error('Limite de armazenamento atingido')
  }
  
  // ... upload
}
```

### **7. RLS Policies: Falta Verificação de Roles**
**PROBLEMA**: Policies verificam `user_id` mas **não verificam role**

**EXEMPLO**:
```sql
-- ❌ ATUAL
CREATE POLICY "Update projects"
USING (user_id = auth.uid());

-- ✅ DEVERIA
CREATE POLICY "Update projects"
USING (
  EXISTS (
    SELECT 1 FROM project_collaborators
    WHERE project_id = projects.id
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin', 'editor')
  )
);
```

---

Continua na Parte 4...
