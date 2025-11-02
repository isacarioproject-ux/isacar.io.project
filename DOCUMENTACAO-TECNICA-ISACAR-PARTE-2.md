# 📋 DOCUMENTAÇÃO TÉCNICA - ISACAR v1.3.0 (PARTE 2)

## 👥 SISTEMA DE MEMBROS E CONVITES

### **Tabela: public.team_members**
```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NULL REFERENCES projects(id),  -- ⚠️ OPCIONAL!
  user_id UUID NULL REFERENCES auth.users(id),   -- NULL até aceitar
  email VARCHAR(255) NOT NULL,
  name TEXT NULL,
  role VARCHAR(50) DEFAULT 'viewer' 
    CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  status VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'declined', 'removed')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

### **Roles (Papéis)**
| Role | Descrição | Permissões (Planejadas) |
|------|-----------|-------------------------|
| `owner` | Dono do projeto/organização | Tudo + deletar projeto |
| `admin` | Administrador | Gerenciar membros, editar tudo |
| `editor` | Editor | Editar conteúdo, docs, whiteboards |
| `viewer` | Visualizador | Apenas visualizar, sem edição |

**⚠️ PROBLEMA ATUAL**: Roles estão definidas mas **NÃO são verificadas/aplicadas** no código!

### **Status dos Convites**
- `pending` - Convite enviado, aguardando aceitação
- `active` - Convite aceito, membro ativo
- `declined` - Convite recusado
- `removed` - Membro removido da equipe

### **RLS Policies - Team Members** (Simplificadas v1.3.0)

#### **Policy 1: Aceitar Próprio Convite**
```sql
CREATE POLICY "Users can accept their own invites"
ON team_members FOR UPDATE
USING (
  (email)::text = COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'email')::text,
    auth.email()
  )
)
WITH CHECK (
  (email)::text = COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'email')::text,
    auth.email()
  )
);
```

#### **Policy 2: Donos Gerenciam Membros do Projeto**
```sql
CREATE POLICY "Project owners can manage team members"
ON team_members FOR UPDATE
USING (
  project_id IS NOT NULL 
  AND project_id IN (
    SELECT id FROM projects WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  project_id IS NOT NULL 
  AND project_id IN (
    SELECT id FROM projects WHERE user_id = auth.uid()
  )
);
```

#### **Policy 3: Cancelar Convites Enviados**
```sql
CREATE POLICY "Inviters can cancel invites"
ON team_members FOR UPDATE
USING (invited_by = auth.uid())
WITH CHECK (invited_by = auth.uid());
```

#### **Policy SELECT: Ver Convites Relevantes**
```sql
CREATE POLICY "View invites"
ON team_members FOR SELECT
USING (
  auth.uid() = user_id           -- Convites aceitos pelo user
  OR email = auth.email()         -- Convites pendentes para email
  OR invited_by = auth.uid()      -- Convites que enviei
  OR project_id IN (
    SELECT id FROM projects WHERE user_id = auth.uid()
  )
);
```

---

## 🔄 FLUXOS DE CONVITES

### **1. Convidar Membro**
```typescript
// Hook: use-organization-members.ts
const inviteMember = async (
  email: string, 
  role: TeamMemberRole,
  projectId?: string | null,  // ⚠️ Opcional!
  name?: string
) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  await supabase.from('team_members').insert({
    project_id: projectId || null,  // NULL = convite de organização
    email,
    name,
    role,
    invited_by: user.id,
    status: 'pending'
  })
}
```

**Comportamento Atual**:
- Se `projectId` fornecido → Convite **para projeto específico**
- Se `projectId = null` → Convite **para organização** (sem projeto)

**⚠️ PROBLEMA**: Não há lógica para **adicionar membro a projeto** após aceitar convite de organização!

### **2. Aceitar Convite**
```typescript
// Hook: use-my-invites.ts
const acceptInvite = async (inviteId: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  
  await supabase.from('team_members').update({
    status: 'active',
    user_id: user.id,
    joined_at: new Date().toISOString()
  })
  .eq('id', inviteId)
  .eq('status', 'pending')
  .eq('email', user.email)  // ⚠️ Segurança: só aceita próprio email
}
```

**Fluxo**:
1. Usuário recebe email (implementação futura)
2. Faz login/signup com mesmo email do convite
3. Vê convite na página `/invites`
4. Clica "Aceitar"
5. UPDATE muda status para `active` e preenche `user_id`

### **3. Recusar Convite**
```typescript
const declineInvite = async (inviteId: string) => {
  await supabase.from('team_members').update({ status: 'declined' })
    .eq('id', inviteId)
}
```

### **4. Remover Membro**
```typescript
const removeMember = async (id: string) => {
  await supabase.from('team_members').delete().eq('id', id)
}
```

**⚠️ PROBLEMA**: Qualquer um com RLS policy pode deletar. Deveria verificar role `owner` ou `admin`!

---

## ❌ PROBLEMAS ATUAIS DO SISTEMA DE PERMISSÕES

### **1. Roles Não São Verificadas**
```typescript
// ❌ ATUAL: Qualquer membro pode convidar outros
const inviteMember = () => {
  // Não verifica se user tem role 'admin' ou 'owner'
  supabase.from('team_members').insert(...)
}
```

**Deveria**:
```typescript
// ✅ CORRETO:
const canInviteMember = () => {
  const myRole = getCurrentUserRole(projectId)
  return ['owner', 'admin'].includes(myRole)
}
```

### **2. Convites de Organização vs Projeto**
**Problema**: Sistema permite 2 tipos de convite mas **não diferencia** claramente:
- Convite de **Organização** (`project_id = NULL`)
- Convite de **Projeto** (`project_id = <uuid>`)

**Confusão**:
- Aceitar convite de organização → Não adiciona automaticamente a nenhum projeto
- Usuário aceita mas não consegue acessar nada
- Precisa ser adicionado **manualmente** a cada projeto depois

**Solução Sugerida**:
- Convite de organização → Membro vira "membro da organização"
- Owner do projeto pode adicionar "membros da organização" aos projetos
- OU: Simplificar e ter **só convites de projeto**

### **3. Falta Verificação de Permissões em Ações**
```typescript
// ❌ ATUAL: Qualquer membro pode editar projeto
const updateProject = (id, data) => {
  supabase.from('projects').update(data).eq('id', id)
}

// ❌ ATUAL: Qualquer membro pode deletar documento
const deleteDocument = (id) => {
  supabase.from('documents').delete().eq('id', id)
}
```

**Deveria verificar**:
- Editar projeto → apenas `owner`, `admin`, `editor`
- Deletar documento → apenas `owner` do projeto ou `admin`
- Upload arquivo → apenas `editor` ou superior

### **4. RLS Policies Não Verificam Roles**
```sql
-- ❌ ATUAL: Qualquer membro do projeto pode UPDATE
CREATE POLICY "Project owners can manage team members"
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- ✅ DEVERIA: Só owner/admin do projeto
CREATE POLICY "Only admins can manage members"
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE project_id = team_members.project_id 
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND status = 'active'
  )
);
```

### **5. Falta Tabela de Permissões Granulares**
**Não existe** uma tabela `project_permissions` ou similar para definir:
- Quem pode editar
- Quem pode convidar
- Quem pode deletar
- Permissões customizáveis por projeto

---

## 📄 SISTEMA DE DOCUMENTOS

### **Tabela: public.documents**
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID NULL REFERENCES projects(id),  -- ⚠️ OPCIONAL
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type VARCHAR(50),
  file_size BIGINT,  -- bytes
  category VARCHAR(50) DEFAULT 'Other'
    CHECK (category IN ('PDF', 'Word', 'Excel', 'PowerPoint', 'Image', 'Other')),
  tags TEXT[] DEFAULT '{}',
  is_shared BOOLEAN DEFAULT FALSE,
  shared_with UUID[] DEFAULT '{}',  -- Array de user_ids
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

### **RLS Policies - Documents**
```sql
-- Ver próprios docs + docs compartilhados comigo
CREATE POLICY "View own and shared documents"
ON documents FOR SELECT
USING (
  auth.uid() = user_id 
  OR auth.uid() = ANY(shared_with)
);

-- Criar documentos
CREATE POLICY "Create own documents"
ON documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Atualizar próprios documentos
CREATE POLICY "Update own documents"
ON documents FOR UPDATE
USING (auth.uid() = user_id);

-- Deletar próprios documentos
CREATE POLICY "Delete own documents"
ON documents FOR DELETE
USING (auth.uid() = user_id);
```

**⚠️ PROBLEMA**: Compartilhamento é por `user_id` direto, **não por role/projeto**!

### **Upload de Arquivos**
```typescript
// src/components/file-upload.tsx
const uploadFile = async (file: File) => {
  // 1. Upload para Supabase Storage
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(`${userId}/${Date.now()}_${file.name}`, file)
  
  // 2. Criar registro em documents table
  await supabase.from('documents').insert({
    user_id: userId,
    project_id: projectId || null,
    name: file.name,
    file_url: data.path,
    file_type: file.type,
    file_size: file.size,
    category: detectCategory(file.type)
  })
}
```

**Storage Bucket**: `documents` (público para leitura, autenticado para upload)

---

Continua na Parte 3...
