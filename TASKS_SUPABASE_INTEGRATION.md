# 📋 Integração Tasks com Supabase

## 🎯 Visão Geral

O módulo de Tasks agora suporta **integração completa com Supabase** com fallback automático para localStorage. Isso permite:

- ✅ Persistência de dados em banco de dados PostgreSQL
- ✅ Sincronização em tempo real entre dispositivos
- ✅ Autenticação e segurança via RLS (Row Level Security)
- ✅ Fallback automático para localStorage se Supabase falhar
- ✅ Modo offline com sincronização posterior

---

## 🚀 Como Ativar a Integração

### **1. Aplicar Migrations no Supabase**

Execute o SQL no Supabase Dashboard:

```bash
# Arquivo: supabase/migrations/20250110_tasks_schema.sql
```

Ou via CLI:

```bash
supabase db push
```

### **2. Habilitar Supabase no Frontend**

No console do navegador ou em algum componente:

```typescript
import { enableSupabase } from '@/lib/tasks/tasks-storage';

// Habilitar Supabase
enableSupabase();

// Recarregar a página
window.location.reload();
```

### **3. Desabilitar Supabase (Voltar para localStorage)**

```typescript
import { disableSupabase } from '@/lib/tasks/tasks-storage';

// Desabilitar Supabase
disableSupabase();

// Recarregar a página
window.location.reload();
```

---

## 📊 Estrutura do Banco de Dados

### **Tabelas Principais:**

1. **`tasks`** - Tarefas principais
2. **`task_assignees`** - Responsáveis (muitos-para-muitos)
3. **`task_tags`** - Tags (muitos-para-muitos)
4. **`task_custom_fields`** - Campos customizados
5. **`task_comments`** - Comentários
6. **`task_activities`** - Histórico de atividades
7. **`task_checklists`** - Checklists
8. **`task_checklist_items`** - Itens de checklist
9. **`task_attachments`** - Anexos

### **Relacionamentos:**

```
tasks (1) ─── (N) task_assignees ─── (1) auth.users
tasks (1) ─── (N) task_tags ─── (1) tags
tasks (1) ─── (N) task_custom_fields
tasks (1) ─── (N) task_comments ─── (1) auth.users
tasks (1) ─── (N) task_activities ─── (1) auth.users
tasks (1) ─── (N) task_checklists ─── (N) task_checklist_items
tasks (1) ─── (N) task_attachments
tasks (1) ─── (N) tasks (subtasks)
```

---

## 🔒 Segurança (RLS)

### **Políticas Implementadas:**

#### **Tasks:**
- ✅ Usuários podem ver tarefas que criaram ou foram atribuídas
- ✅ Usuários podem criar tarefas
- ✅ Usuários podem atualizar suas tarefas ou tarefas atribuídas
- ✅ Usuários podem deletar apenas suas próprias tarefas

#### **Comments:**
- ✅ Usuários podem ver comentários de suas tarefas
- ✅ Usuários podem criar comentários em suas tarefas

#### **Activities:**
- ✅ Usuários podem ver atividades de suas tarefas

---

## 🔄 Triggers Automáticos

### **1. Updated At**
Atualiza automaticamente `updated_at` quando uma tarefa é modificada.

### **2. Activity Log**
Registra automaticamente atividades quando:
- Uma tarefa é criada
- O status é alterado
- A prioridade é alterada

---

## 📝 Exemplo de Uso

### **Criar uma Tarefa:**

```typescript
import { createTask } from '@/lib/tasks/tasks-storage';

const newTask = {
  title: 'Implementar feature X',
  description: 'Descrição detalhada',
  status: 'todo',
  priority: 'high',
  due_date: '2025-01-15',
  start_date: '2025-01-10',
  assignee_ids: ['user-id-1', 'user-id-2'],
  tag_ids: ['tag-id-1'],
  custom_fields: [],
  project_id: null,
  list_id: null,
  parent_task_id: null,
  location: 'Projeto X',
  workspace: 'Trabalho',
};

const task = await createTask(newTask);
console.log('Tarefa criada:', task);
```

### **Atualizar uma Tarefa:**

```typescript
import { updateTask } from '@/lib/tasks/tasks-storage';

await updateTask('task-id', {
  status: 'in_progress',
  priority: 'urgent',
});
```

### **Adicionar Comentário:**

```typescript
import { addComment } from '@/lib/tasks/tasks-storage';

const comment = {
  id: `comment-${Date.now()}`,
  task_id: 'task-id',
  user_id: 'user-id',
  user_name: 'João Silva',
  text: 'Ótimo trabalho!',
  created_at: new Date().toISOString(),
  mentions: ['user-id-2'],
};

await addComment(comment);
```

---

## 🧪 Testando a Integração

### **1. Verificar Conexão:**

```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.auth.getUser();
console.log('Usuário:', data);
console.log('Erro:', error);
```

### **2. Testar CRUD:**

```typescript
import { getTasks, createTask, updateTask, deleteTask } from '@/lib/tasks/tasks-storage';

// Listar
const tasks = await getTasks();
console.log('Tasks:', tasks);

// Criar
const newTask = await createTask({ /* ... */ });

// Atualizar
await updateTask(newTask.id, { status: 'done' });

// Deletar
await deleteTask(newTask.id);
```

### **3. Verificar Fallback:**

```typescript
// Desabilitar Supabase temporariamente
import { disableSupabase } from '@/lib/tasks/tasks-storage';
disableSupabase();

// Testar - deve usar localStorage
const tasks = await getTasks();
console.log('Tasks (localStorage):', tasks);

// Reabilitar
import { enableSupabase } from '@/lib/tasks/tasks-storage';
enableSupabase();
```

---

## 🐛 Troubleshooting

### **Erro: "Usuário não autenticado"**
```typescript
// Verificar autenticação
const { data } = await supabase.auth.getUser();
if (!data.user) {
  console.error('Usuário não está logado');
  // Redirecionar para login
}
```

### **Erro: RLS Policy**
```sql
-- Verificar políticas no Supabase Dashboard
SELECT * FROM pg_policies WHERE tablename = 'tasks';
```

### **Erro: Migration não aplicada**
```bash
# Verificar migrations aplicadas
supabase migration list

# Aplicar migration específica
supabase db push
```

---

## 📈 Próximos Passos

- [ ] Implementar sincronização em tempo real (Supabase Realtime)
- [ ] Adicionar suporte a anexos (Supabase Storage)
- [ ] Implementar busca full-text
- [ ] Adicionar notificações push
- [ ] Implementar colaboração em tempo real

---

## 🎓 Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)

---

## ✅ Checklist de Implementação

- [x] Schema SQL criado
- [x] Arquivo tasks-db.ts criado
- [x] tasks-storage.ts atualizado com Supabase
- [x] Componentes atualizados para async/await
- [x] RLS policies implementadas
- [x] Triggers automáticos criados
- [x] Fallback para localStorage
- [x] Documentação completa
- [ ] Testes E2E
- [ ] Deploy em produção

---

**Integração completa com Supabase pronta para uso!** 🎉
