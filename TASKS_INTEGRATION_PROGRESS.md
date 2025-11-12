# 🚀 INTEGRAÇÃO TASKS CARD - PROGRESSO

## ✅ FASE 1: LIMPEZA E ORGANIZAÇÃO (COMPLETA)

### Arquivos Removidos ✅
```
✅ Document Management System/package.json
✅ Document Management System/vite.config.ts
✅ Document Management System/index.html
✅ Document Management System/README.md
✅ Document Management System/src/main.tsx
✅ Document Management System/src/App.tsx
```

### Nova Estrutura Criada ✅
```
src/
├── components/
│   └── tasks/                    ✅ NOVA PASTA
│       ├── tasks-card.tsx
│       ├── tasks-group-view.tsx
│       ├── tasks-list-view.tsx
│       ├── task-row.tsx
│       ├── task-modal.tsx
│       ├── task-detail-view.tsx
│       ├── task-activity-sidebar.tsx
│       └── task-template-selector.tsx
│
├── hooks/
│   └── tasks/                    ✅ NOVA PASTA
│       └── use-tasks-card.ts
│
├── lib/
│   └── tasks/                    ✅ NOVA PASTA
│       ├── tasks-storage.ts
│       ├── sample-tasks-data.ts
│       └── utils.ts
│
└── types/
    └── tasks.ts                  ✅ MOVIDO
```

---

## 📋 PRÓXIMOS PASSOS

### FASE 2: Adaptação de Imports
- [ ] Atualizar imports nos componentes de tasks
- [ ] Corrigir caminhos relativos
- [ ] Adicionar alias @/components/tasks
- [ ] Adicionar alias @/hooks/tasks
- [ ] Adicionar alias @/lib/tasks

### FASE 3: Integração com Supabase
- [ ] Criar tabela `tasks` no Supabase
- [ ] Criar tabela `task_comments` no Supabase
- [ ] Criar tabela `task_activities` no Supabase
- [ ] Criar tabela `task_attachments` no Supabase
- [ ] Substituir localStorage por Supabase
- [ ] Adicionar `workspace_id` aos dados
- [ ] Adicionar `user_id` do Supabase Auth

### FASE 4: Traduções (i18n)
- [ ] Adicionar chaves de tradução para tasks
- [ ] Traduzir todos os textos hardcoded
- [ ] Suportar PT-BR, EN, ES

### FASE 5: Integração no Dashboard
- [ ] Criar TasksCard wrapper
- [ ] Adicionar drag handle
- [ ] Integrar com ResizableCard
- [ ] Adicionar ao dashboard
- [ ] Testar responsividade

### FASE 6: Melhorias
- [ ] Conectar com projetos existentes
- [ ] Sincronização real-time
- [ ] Notificações
- [ ] Filtros avançados
- [ ] Busca de tarefas

---

## 📊 COMPONENTES MOVIDOS

### Componentes Principais (8)
1. ✅ `tasks-card.tsx` - Card principal
2. ✅ `tasks-group-view.tsx` - Vista agrupada
3. ✅ `tasks-list-view.tsx` - Vista lista
4. ✅ `task-row.tsx` - Linha de tarefa
5. ✅ `task-modal.tsx` - Modal de detalhes
6. ✅ `task-detail-view.tsx` - Vista detalhada
7. ✅ `task-activity-sidebar.tsx` - Sidebar atividades
8. ✅ `task-template-selector.tsx` - Seletor templates

### Hooks (1)
1. ✅ `use-tasks-card.ts` - Hook principal

### Lib (3)
1. ✅ `tasks-storage.ts` - Storage localStorage
2. ✅ `sample-tasks-data.ts` - Dados de exemplo
3. ✅ `utils.ts` - Utilitários

### Types (1)
1. ✅ `tasks.ts` - TypeScript interfaces

---

## 🔧 IMPORTS A CORRIGIR

### Padrão Antigo
```typescript
import { TasksCard } from './components/tasks-card';
import { useTasksCard } from '../hooks/use-tasks-card';
import { Task } from '../types/tasks';
```

### Padrão Novo
```typescript
import { TasksCard } from '@/components/tasks/tasks-card';
import { useTasksCard } from '@/hooks/tasks/use-tasks-card';
import { Task } from '@/types/tasks';
```

---

## 🗄️ SCHEMA SUPABASE (A CRIAR)

### Tabela: tasks
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL, -- 'todo', 'in_progress', 'review', 'done'
  priority TEXT NOT NULL, -- 'low', 'medium', 'high', 'urgent'
  due_date DATE,
  start_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  creator_id UUID REFERENCES auth.users(id),
  project_id UUID REFERENCES projects(id),
  parent_task_id UUID REFERENCES tasks(id),
  location TEXT,
  custom_fields JSONB DEFAULT '[]'::jsonb,
  CONSTRAINT valid_status CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Índices
CREATE INDEX idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);
```

### Tabela: task_assignees
```sql
CREATE TABLE task_assignees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

CREATE INDEX idx_task_assignees_task ON task_assignees(task_id);
CREATE INDEX idx_task_assignees_user ON task_assignees(user_id);
```

### Tabela: task_comments
```sql
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  text TEXT NOT NULL,
  mentions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_task_comments_task ON task_comments(task_id);
```

### Tabela: task_activities
```sql
CREATE TABLE task_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_task_activities_task ON task_activities(task_id);
```

### Tabela: task_attachments
```sql
CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_task_attachments_task ON task_attachments(task_id);
```

### Tabela: task_checklists
```sql
CREATE TABLE task_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_task_checklists_task ON task_checklists(task_id);
```

---

## 🌐 TRADUÇÕES A ADICIONAR

### tasks.* (Principal)
```typescript
'tasks.title': 'Tarefas'
'tasks.newTask': 'Nova Tarefa'
'tasks.myWork': 'Meu trabalho'
'tasks.settings': 'Configurações'
'tasks.filters': 'Filtros'

// Abas
'tasks.tabs.pending': 'Pendente'
'tasks.tabs.done': 'Feito'
'tasks.tabs.delegated': 'Delegado'

// Grupos
'tasks.groups.today': 'Hoje'
'tasks.groups.overdue': 'Em Atraso'
'tasks.groups.upcoming': 'Próximo'
'tasks.groups.unscheduled': 'Não Programado'

// Status
'tasks.status.todo': 'A Fazer'
'tasks.status.inProgress': 'Em Progresso'
'tasks.status.review': 'Em Revisão'
'tasks.status.done': 'Concluído'

// Prioridades
'tasks.priority.low': 'Baixa'
'tasks.priority.medium': 'Média'
'tasks.priority.high': 'Alta'
'tasks.priority.urgent': 'Urgente'

// Ações
'tasks.actions.edit': 'Editar'
'tasks.actions.duplicate': 'Duplicar'
'tasks.actions.delete': 'Excluir'
'tasks.actions.complete': 'Marcar como concluída'

// Detalhes
'tasks.detail.title': 'Título'
'tasks.detail.description': 'Descrição'
'tasks.detail.status': 'Status'
'tasks.detail.priority': 'Prioridade'
'tasks.detail.dueDate': 'Data de Vencimento'
'tasks.detail.startDate': 'Data de Início'
'tasks.detail.assignees': 'Responsáveis'
'tasks.detail.tags': 'Tags'
'tasks.detail.subtasks': 'Sub-tarefas'
'tasks.detail.checklists': 'Checklists'
'tasks.detail.attachments': 'Anexos'
'tasks.detail.comments': 'Comentários'
'tasks.detail.activity': 'Atividade'

// Templates
'tasks.templates.title': 'Escolha um Template'
'tasks.templates.personal': 'Pessoal'
'tasks.templates.work': 'Trabalho'
'tasks.templates.it': 'TI'
'tasks.templates.general': 'Geral'

// Mensagens
'tasks.created': 'Tarefa criada com sucesso!'
'tasks.updated': 'Tarefa atualizada!'
'tasks.deleted': 'Tarefa excluída!'
'tasks.completed': 'Tarefa concluída!'
```

---

## 📦 DEPENDÊNCIAS A ADICIONAR

### package.json
```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2"
  }
}
```

**Comando:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

---

## 🎯 STATUS ATUAL

### ✅ Completo
- Arquivos duplicados removidos
- Estrutura de pastas criada
- Componentes organizados
- Hooks movidos
- Lib movida
- Types movidos

### 🔄 Em Andamento
- Nada no momento

### ⏳ Pendente
- Corrigir imports
- Integrar com Supabase
- Adicionar traduções
- Integrar no dashboard
- Testar funcionalidades

---

## 🚀 PRÓXIMO COMANDO

```bash
# Instalar dependências do DnD Kit
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

---

**Status:** ✅ Fase 1 Completa - Pronto para Fase 2 (Adaptação de Imports)
