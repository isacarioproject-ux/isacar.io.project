# 📋 ANÁLISE COMPLETA: Tasks Card (Document Management System)

## 🎯 VISÃO GERAL

Sistema de gerenciamento de tarefas completo importado do Figma, pronto para ser integrado como novo card de tarefas no aplicativo ISACAR.

---

## 📦 ESTRUTURA DO PROJETO

### Arquivos Principais
```
Document Management System/
├── package.json          # Dependências (DUPLICADAS com projeto principal)
├── vite.config.ts        # Config Vite (DUPLICADO)
├── index.html            # HTML (DUPLICADO)
├── README.md             # Documentação
└── src/
    ├── App.tsx           # App standalone (REMOVER)
    ├── main.tsx          # Entry point (REMOVER)
    ├── index.css         # Styles Tailwind (MESCLAR)
    ├── components/       # Componentes principais
    ├── hooks/            # Hooks customizados
    ├── lib/              # Utilitários e storage
    └── types/            # TypeScript types
```

---

## 🗂️ COMPONENTES PRINCIPAIS

### 1. **TasksCard** (Principal)
**Arquivo:** `src/components/tasks-card.tsx`

**Funcionalidades:**
- ✅ Card completo com header e breadcrumbs
- ✅ Sistema de abas (Pendente, Feito, Delegado)
- ✅ Botão "Nova Tarefa" com templates
- ✅ Dropdown de configurações
- ✅ Atalhos de teclado (Ctrl+M para nova tarefa, ESC para fechar)
- ✅ Integração com localStorage
- ✅ Dados de exemplo pré-carregados

**Estrutura:**
```tsx
<Card>
  <CardHeader>
    - Breadcrumbs (Início / Meu trabalho)
    - Botão Nova Tarefa
    - Menu configurações
  </CardHeader>
  
  <CardContent>
    <Tabs>
      - Pendente (agrupado por período)
      - Feito (lista simples)
      - Delegado (lista simples)
    </Tabs>
  </CardContent>
</Card>

<TaskModal />           // Modal de detalhes
<TaskTemplateSelector /> // Seletor de templates
```

### 2. **TasksGroupView** (Vista Agrupada)
**Arquivo:** `src/components/tasks-group-view.tsx`

**Funcionalidades:**
- Agrupa tarefas por período:
  - 🔴 Em Atraso
  - 🟡 Hoje
  - 🟢 Próximo
  - ⚪ Não Programado
- Grupos expansíveis/recolhíveis
- Contador de tarefas por grupo

### 3. **TasksListView** (Vista Lista)
**Arquivo:** `src/components/tasks-list-view.tsx`

**Funcionalidades:**
- Lista simples de tarefas
- Usado nas abas "Feito" e "Delegado"

### 4. **TaskRow** (Linha de Tarefa)
**Arquivo:** `src/components/task-row.tsx`

**Funcionalidades:**
- ✅ Checkbox para marcar como concluída
- ✅ Ícone de prioridade (cores)
- ✅ Título da tarefa
- ✅ Data de vencimento
- ✅ Avatares dos assignees
- ✅ Localização/Workspace
- ✅ Menu de ações (editar, duplicar, excluir)
- ✅ Hover effects

### 5. **TaskModal** (Modal de Detalhes)
**Arquivo:** `src/components/task-modal.tsx`

**Funcionalidades:**
- ✅ Modal fullscreen
- ✅ Visualização completa da tarefa
- ✅ Edição inline
- ✅ Sidebar de atividades
- ✅ Comentários
- ✅ Anexos
- ✅ Sub-tarefas
- ✅ Checklists
- ✅ Custom fields

### 6. **TaskDetailView** (Vista Detalhada)
**Arquivo:** `src/components/task-detail-view.tsx`

**Funcionalidades:**
- Título editável
- Descrição editável
- Status dropdown
- Prioridade dropdown
- Datas (início e vencimento)
- Assignees
- Tags
- Custom fields
- Sub-tarefas
- Checklists
- Anexos

### 7. **TaskActivitySidebar** (Sidebar de Atividades)
**Arquivo:** `src/components/task-activity-sidebar.tsx`

**Funcionalidades:**
- Abas: Comentários e Atividades
- Input de comentários com @mentions
- Timeline de atividades
- Histórico de mudanças

### 8. **TaskTemplateSelector** (Seletor de Templates)
**Arquivo:** `src/components/task-template-selector.tsx`

**Funcionalidades:**
- Modal de seleção de templates
- Categorias: Pessoal, Trabalho, TI, Geral
- Templates pré-definidos
- Criação de tarefa com template

---

## 🎨 TIPOS E INTERFACES

### Task (Principal)
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  start_date: string | null;
  created_at: string;
  completed_at: string | null;
  assignee_ids: string[];
  creator_id: string;
  tag_ids: string[];
  project_id: string | null;
  list_id: string | null;
  parent_task_id: string | null;
  custom_fields: CustomField[];
  location?: string;
  workspace?: string;
}
```

### TaskWithDetails (Completo)
```typescript
interface TaskWithDetails extends Task {
  subtasks: Task[];
  checklists: Checklist[];
  attachments: Attachment[];
  comments: Comment[];
  activities: Activity[];
}
```

### TaskGroups (Agrupamento)
```typescript
interface TaskGroups {
  hoje: Task[];
  em_atraso: Task[];
  proximo: Task[];
  nao_programado: Task[];
}
```

### Outros Tipos
- `User` - Usuários
- `Comment` - Comentários
- `Activity` - Atividades/Histórico
- `Checklist` - Checklists
- `Attachment` - Anexos
- `CustomField` - Campos customizados
- `TaskTemplate` - Templates

---

## 🔧 HOOKS CUSTOMIZADOS

### useTasksCard
**Arquivo:** `src/hooks/use-tasks-card.ts`

**Funcionalidades:**
- Carrega tarefas do localStorage
- Filtra tarefas por aba (Pendente, Feito, Delegado)
- Agrupa tarefas por período (Hoje, Em Atraso, Próximo, Não Programado)
- Ordena por prioridade e data
- Gerencia grupos expandidos/recolhidos
- Refetch de dados

**Retorno:**
```typescript
{
  tasks: Task[] | TaskGroups,
  activeTab: TaskTab,
  setActiveTab: (tab: TaskTab) => void,
  loading: boolean,
  refetch: () => void,
  toggleGroup: (group: string) => void,
  isGroupExpanded: (group: string) => boolean,
}
```

---

## 💾 SISTEMA DE STORAGE

### LocalStorage Keys
```typescript
'tasks_data'      // Array de Tasks
'users_data'      // Array de Users
'comments_data'   // Array de Comments
'activities_data' // Array de Activities
'current_user_id' // ID do usuário atual
```

### Funções Principais
**Arquivo:** `src/lib/tasks-storage.ts`

```typescript
// Tasks
getTasks(): Task[]
getTask(id: string): Task | undefined
createTask(task: Task): void
updateTask(id: string, updates: Partial<Task>): void
deleteTask(id: string): void
saveTasks(tasks: Task[]): void

// Users
getUsers(): User[]
getUser(id: string): User | undefined
saveUsers(users: User[]): void
getCurrentUserId(): string

// Comments
getComments(taskId: string): Comment[]
createComment(comment: Comment): void
saveComments(comments: Comment[]): void

// Activities
getActivities(taskId: string): Activity[]
createActivity(activity: Activity): void
saveActivities(activities: Activity[]): void
```

---

## 📊 DADOS DE EXEMPLO

### Sample Tasks
**Arquivo:** `src/lib/sample-tasks-data.ts`

**Inclui:**
- 10+ tarefas de exemplo
- Diferentes status e prioridades
- Datas variadas
- Assignees múltiplos
- Localizações e workspaces
- Sub-tarefas
- Checklists
- Comentários
- Atividades

---

## 🎯 FEATURES PRINCIPAIS

### 1. Sistema de Abas
- **Pendente:** Tarefas não concluídas agrupadas por período
- **Feito:** Tarefas concluídas em lista
- **Delegado:** Tarefas criadas por mim mas atribuídas a outros

### 2. Agrupamento Inteligente
- **Em Atraso:** Tarefas com data passada (vermelho)
- **Hoje:** Tarefas com vencimento hoje (amarelo)
- **Próximo:** Tarefas futuras (verde)
- **Não Programado:** Sem data definida (cinza)

### 3. Prioridades
- 🔴 **Urgent** - Vermelho
- 🟠 **High** - Laranja
- 🟡 **Medium** - Amarelo
- 🟢 **Low** - Verde

### 4. Status
- **Todo** - A fazer
- **In Progress** - Em progresso
- **Review** - Em revisão
- **Done** - Concluído

### 5. Atalhos de Teclado
- `Ctrl/Cmd + M` - Nova tarefa
- `ESC` - Fechar modal

### 6. Templates
Categorias:
- **Pessoal:** Tarefas pessoais
- **Trabalho:** Tarefas profissionais
- **TI:** Tarefas técnicas
- **Geral:** Tarefas gerais

### 7. Funcionalidades Avançadas
- ✅ Sub-tarefas
- ✅ Checklists
- ✅ Anexos
- ✅ Comentários com @mentions
- ✅ Histórico de atividades
- ✅ Custom fields
- ✅ Múltiplos assignees
- ✅ Tags
- ✅ Datas de início e vencimento

---

## 🔄 ARQUIVOS DUPLICADOS (REMOVER)

### Para Deletar:
```
❌ package.json          // Já existe no projeto principal
❌ vite.config.ts        // Já existe no projeto principal
❌ index.html            // Já existe no projeto principal
❌ src/main.tsx          // Entry point standalone
❌ src/App.tsx           // App standalone
❌ README.md             // Documentação standalone
```

### Para Mesclar:
```
⚠️ src/index.css         // Mesclar styles com projeto principal
```

### Para Manter:
```
✅ src/components/       // Todos os componentes
✅ src/hooks/            // Hooks customizados
✅ src/lib/              // Utilitários
✅ src/types/            // TypeScript types
```

---

## 🚀 PLANO DE INTEGRAÇÃO

### Fase 1: Limpeza
1. ✅ Deletar arquivos duplicados
2. ✅ Mesclar styles necessários
3. ✅ Remover App.tsx e main.tsx standalone

### Fase 2: Adaptação
1. ✅ Mover componentes para `src/components/tasks/`
2. ✅ Adaptar imports
3. ✅ Integrar com Supabase (substituir localStorage)
4. ✅ Adicionar traduções (i18n)
5. ✅ Adicionar workspace_id aos dados

### Fase 3: Integração
1. ✅ Criar TasksCard no dashboard
2. ✅ Adicionar drag handle
3. ✅ Integrar com ResizableCard
4. ✅ Adicionar ao sistema de cards

### Fase 4: Melhorias
1. ✅ Conectar com projetos existentes
2. ✅ Sincronização real-time
3. ✅ Notificações
4. ✅ Filtros avançados

---

## 📝 COMPONENTES UI USADOS

### Radix UI
- Accordion
- Alert Dialog
- Avatar
- Checkbox
- Dialog
- Dropdown Menu
- Label
- Popover
- Progress
- Radio Group
- Scroll Area
- Select
- Separator
- Switch
- Tabs
- Tooltip

### Lucide Icons
- Plus, X, MoreVertical
- Calendar, Clock
- User, Users
- CheckCircle, Circle
- Flag (prioridades)
- MessageSquare (comentários)
- Paperclip (anexos)
- Activity (atividades)

### Outros
- Sonner (toasts)
- @dnd-kit (drag & drop)
- date-fns (formatação de datas)

---

## 🎨 DESIGN SYSTEM

### Cores de Prioridade
```css
urgent:  text-red-600    bg-red-50
high:    text-orange-600 bg-orange-50
medium:  text-yellow-600 bg-yellow-50
low:     text-green-600  bg-green-50
```

### Cores de Status
```css
todo:        text-gray-600
in_progress: text-blue-600
review:      text-purple-600
done:        text-green-600
```

### Cores de Grupos
```css
em_atraso:       text-red-600
hoje:            text-yellow-600
proximo:         text-green-600
nao_programado:  text-gray-600
```

---

## 🔧 DEPENDÊNCIAS NECESSÁRIAS

### Já Existem no Projeto
- ✅ React
- ✅ Radix UI (todos)
- ✅ Lucide React
- ✅ Tailwind
- ✅ Sonner
- ✅ date-fns

### Novas (Adicionar)
- ⚠️ @dnd-kit/core
- ⚠️ @dnd-kit/sortable
- ⚠️ @dnd-kit/utilities

---

## 📊 ESTATÍSTICAS

### Componentes
- **Total:** 15 componentes
- **Principais:** 8 componentes
- **UI:** 48 componentes (Radix)

### Linhas de Código
- **TasksCard:** ~250 linhas
- **TaskDetailView:** ~400 linhas
- **TaskModal:** ~200 linhas
- **Total:** ~2000 linhas

### Funcionalidades
- ✅ 3 abas
- ✅ 4 grupos
- ✅ 4 prioridades
- ✅ 4 status
- ✅ Templates
- ✅ Sub-tarefas
- ✅ Checklists
- ✅ Anexos
- ✅ Comentários
- ✅ Atividades

---

## 🎉 CONCLUSÃO

### Pronto para Integração
O sistema de tarefas está **completo e funcional**, com:
- ✅ UI moderna e responsiva
- ✅ Funcionalidades avançadas
- ✅ Código bem estruturado
- ✅ TypeScript completo
- ✅ Dados de exemplo

### Próximos Passos
1. Limpar arquivos duplicados
2. Mover para estrutura do projeto
3. Integrar com Supabase
4. Adicionar traduções
5. Testar e ajustar

**Sistema pronto para ser o novo TasksCard do ISACAR!** 🚀✨
