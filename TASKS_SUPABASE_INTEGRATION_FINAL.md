# 📋 Integração Tasks com Supabase - COMPLETA

## 🎯 Visão Geral

O módulo de Tasks está **totalmente integrado com Supabase** usando as tabelas existentes do banco de dados. A integração considera:

- ✅ **Workspaces** - Tarefas isoladas por workspace
- ✅ **Profiles** - Usuários do sistema
- ✅ **Auth** - Autenticação Supabase
- ✅ **RLS** - Segurança em nível de linha
- ✅ **Fallback** - localStorage como backup

---

## 📊 Estrutura do Banco (Tabelas Existentes)

### **Tabelas Principais:**

1. **`tasks`** - Tarefas principais
   - `workspace_id` → Isolamento por workspace
   - `created_by` → Referência a `profiles.id`
   - `assigned_to` → Array de user_ids
   - `labels` → Array de tags
   - `custom_fields` → JSONB para campos customizados

2. **`task_checklists`** - Checklists
   - `items` → JSONB com array de itens

3. **`task_comments`** - Comentários
   - `user_id` → Referência a `profiles.id`
   - `content` → Texto do comentário

4. **`task_attachments`** - Anexos
   - `uploaded_by` → Referência a `profiles.id`

5. **`task_activities`** - Histórico
   - `user_id` → Referência a `profiles.id`
   - `changes` → JSONB com mudanças

6. **`workspace_members`** - Membros do workspace
   - Usado para buscar usuários disponíveis

---

## 🔄 Mapeamento de Campos

### **Frontend → Supabase:**

| Frontend | Supabase | Tipo |
|----------|----------|------|
| `assignee_ids` | `assigned_to` | UUID[] |
| `tag_ids` | `labels` | TEXT[] |
| `creator_id` | `created_by` | UUID |
| `custom_fields` | `custom_fields` | JSONB |
| `text` (comment) | `content` | TEXT |
| `details` (activity) | `changes` | JSONB |

---

## 🚀 Como Usar

### **1. Habilitar Supabase**

```typescript
import { enableSupabase } from '@/lib/tasks/tasks-storage';

// Habilitar integração
enableSupabase();

// Recarregar
window.location.reload();
```

### **2. Verificar Workspace Ativo**

O sistema automaticamente busca o workspace ativo do usuário logado:

```typescript
// tasks-db.ts
export async function getCurrentWorkspaceId(): Promise<string> {
  const userId = await getCurrentUserId();
  
  const { data } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  return data.workspace_id;
}
```

### **3. Criar Tarefa**

```typescript
import { createTask } from '@/lib/tasks/tasks-storage';

const task = await createTask({
  title: 'Nova tarefa',
  description: 'Descrição',
  status: 'todo',
  priority: 'high',
  due_date: '2025-01-15',
  start_date: null,
  assignee_ids: ['user-id-1'],
  tag_ids: [],
  custom_fields: [],
  project_id: null,
  list_id: null,
  parent_task_id: null,
});
```

### **4. Listar Tarefas do Workspace**

```typescript
import { getTasks } from '@/lib/tasks/tasks-storage';

// Busca automaticamente do workspace ativo
const tasks = await getTasks();
```

### **5. Adicionar Comentário**

```typescript
import { addComment } from '@/lib/tasks/tasks-storage';

const comment = {
  id: `comment-${Date.now()}`,
  task_id: 'task-id',
  user_id: 'user-id',
  user_name: 'João',
  text: 'Ótimo trabalho!',
  created_at: new Date().toISOString(),
  mentions: [],
};

await addComment(comment);
```

---

## 🔒 Segurança (RLS)

As tabelas já possuem RLS habilitado:

- ✅ `tasks` - RLS enabled
- ✅ `task_comments` - RLS enabled
- ✅ `task_activities` - RLS enabled
- ✅ `task_attachments` - RLS enabled
- ✅ `task_checklists` - RLS enabled

---

## 📝 Funções Disponíveis

### **tasks-db.ts:**

```typescript
// Workspace & User
getCurrentUserId(): Promise<string>
getCurrentWorkspaceId(): Promise<string>
getUsers(): Promise<User[]>

// Tasks
getTasks(): Promise<Task[]>
getTaskById(id: string): Promise<Task | null>
getTaskWithDetails(id: string): Promise<TaskWithDetails | null>
createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task>
updateTask(id: string, updates: Partial<Task>): Promise<Task>
deleteTask(id: string): Promise<void>

// Comments
addComment(taskId: string, text: string, mentions?: string[]): Promise<Comment>
```

### **tasks-storage.ts:**

```typescript
// Controle
enableSupabase(): void
disableSupabase(): void

// Mesmas funções de tasks-db.ts com fallback para localStorage
```

---

## 🧪 Testando

### **1. Verificar Autenticação:**

```typescript
import { supabase } from '@/lib/supabase';

const { data } = await supabase.auth.getUser();
console.log('Usuário:', data.user);
```

### **2. Verificar Workspace:**

```typescript
import { getCurrentWorkspaceId } from '@/lib/tasks/tasks-db';

const workspaceId = await getCurrentWorkspaceId();
console.log('Workspace ID:', workspaceId);
```

### **3. Testar CRUD:**

```typescript
import { getTasks, createTask, updateTask, deleteTask } from '@/lib/tasks/tasks-storage';

// Listar
const tasks = await getTasks();
console.log('Tasks:', tasks);

// Criar
const newTask = await createTask({
  title: 'Teste',
  description: 'Teste',
  status: 'todo',
  priority: 'medium',
  due_date: null,
  start_date: null,
  assignee_ids: [],
  tag_ids: [],
  custom_fields: [],
  project_id: null,
  list_id: null,
  parent_task_id: null,
});

// Atualizar
await updateTask(newTask.id, { status: 'done' });

// Deletar
await deleteTask(newTask.id);
```

---

## 🐛 Troubleshooting

### **Erro: "Nenhum workspace ativo encontrado"**

```typescript
// Verificar workspaces do usuário
const { data } = await supabase
  .from('workspace_members')
  .select('*')
  .eq('user_id', userId);

console.log('Workspaces:', data);

// Ativar um workspace
await supabase
  .from('workspace_members')
  .update({ is_active: true })
  .eq('workspace_id', 'workspace-id')
  .eq('user_id', userId);
```

### **Erro: "Usuário não autenticado"**

```typescript
// Fazer login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});
```

### **Erro: RLS Policy**

```sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'tasks';
```

---

## ✅ Checklist de Implementação

- [x] tasks-db.ts criado com integração real
- [x] Mapeamento de campos correto
- [x] Suporte a workspaces
- [x] Suporte a profiles
- [x] Fallback para localStorage
- [x] Componentes atualizados para async/await
- [x] Documentação completa
- [ ] Testes E2E
- [ ] Deploy em produção

---

## 📈 Próximos Passos

1. **Realtime** - Sincronização em tempo real
2. **Storage** - Upload de anexos
3. **Notificações** - Avisos de mudanças
4. **Busca** - Full-text search
5. **Filtros** - Filtros avançados

---

**Integração completa com Supabase usando tabelas existentes!** 🎉✨
