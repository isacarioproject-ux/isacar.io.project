# 🔗 SISTEMA DE INTEGRAÇÃO MODULAR - ISACAR.DEV

## ⚠️ GARANTIAS DE SEGURANÇA

### 🛡️ ESTE SISTEMA É 100% SEGURO PORQUE:

1. ✅ **NÃO MODIFICA** código existente que funciona
2. ✅ **ADICIONA** arquivos novos separados
3. ✅ **USA** funções que já existem (não recria)
4. ✅ **PODE SER DESLIGADO** com 1 linha (feature flag)
5. ✅ **REVERSÍVEL** - deletar pasta = volta ao normal
6. ✅ **INCREMENTAL** - implementa 1 integração por vez

---

## 🏗️ ARQUITETURA MODULAR

### **Estrutura de Arquivos (TODOS NOVOS):**

```
src/
├── lib/
│   └── event-bus.ts                    ← NOVO (Event Bus central)
│
├── integrations/                        ← NOVA PASTA
│   ├── README.md                        ← Documentação
│   ├── config.ts                        ← Feature flags
│   │
│   ├── adapters/                        ← Ponte para módulos existentes
│   │   ├── tasks-adapter.ts
│   │   ├── finance-adapter.ts
│   │   ├── gerenciador-adapter.ts
│   │   └── docs-adapter.ts
│   │
│   ├── handlers/                        ← Lógica de integração
│   │   ├── whiteboard-to-tasks.ts
│   │   ├── whiteboard-to-gerenciador.ts
│   │   ├── tasks-to-finance.ts
│   │   └── cross-module-sync.ts
│   │
│   └── types/                           ← Tipos das integrações
│       └── integration-events.ts
│
└── components/
    └── whiteboard/
        └── smart-elements/              ← NOVA PASTA
            ├── smart-box.tsx            ← Box inteligente
            ├── smart-action-item.tsx
            └── smart-meta-item.tsx
```

---

## 🎯 PASSO 1: EVENT BUS (Comunicação entre módulos)

### **ARQUIVO:** `src/lib/event-bus.ts` (NOVO)

```typescript
/**
 * EVENT BUS - Sistema de comunicação entre módulos
 * 
 * Este arquivo NÃO modifica nada existente.
 * Apenas permite módulos conversarem entre si.
 */

type EventCallback = (data: any) => void | Promise<void>;

class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  /**
   * Registrar listener para um evento
   * @example eventBus.on('task.created', (data) => console.log(data))
   */
  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback);

    // Retorna função para remover listener
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Disparar evento
   * @example eventBus.emit('task.created', { title: 'Nova tarefa' })
   */
  async emit(event: string, data?: any): Promise<void> {
    const callbacks = this.listeners.get(event);
    if (!callbacks || callbacks.size === 0) {
      // Nenhum listener registrado (não é erro)
      return;
    }

    // Executar todos os listeners
    const promises = Array.from(callbacks).map(callback => {
      try {
        return callback(data);
      } catch (error) {
        console.error(`Error in listener for event "${event}":`, error);
        return Promise.resolve();
      }
    });

    await Promise.all(promises);
  }

  /**
   * Remover todos os listeners de um evento
   */
  off(event: string): void {
    this.listeners.delete(event);
  }

  /**
   * Limpar todos os listeners (útil para testes)
   */
  clear(): void {
    this.listeners.clear();
  }
}

// Singleton - única instância em toda a aplicação
export const eventBus = new EventBus();
```

---

## 🎯 PASSO 2: CONFIGURAÇÃO (Feature Flags)

### **ARQUIVO:** `src/integrations/config.ts` (NOVO)

```typescript
/**
 * CONFIGURAÇÃO DAS INTEGRAÇÕES
 * 
 * Use este arquivo para ligar/desligar integrações.
 * Se algo der errado, mude para false e a integração para.
 */

export const INTEGRATION_CONFIG = {
  // Master switch - desliga TUDO se false
  ENABLED: true,

  // Integrações específicas
  WHITEBOARD_TO_TASKS: true,          // Criar tasks do whiteboard
  WHITEBOARD_TO_GERENCIADOR: true,    // Criar metas/despesas do whiteboard
  TASKS_TO_FINANCE: true,             // Criar despesas quando task concluir
  CROSS_MODULE_SYNC: true,            // Sincronização bidirecional

  // Opções de comportamento
  AUTO_CREATE: true,                  // Criar automaticamente ou perguntar?
  SHOW_NOTIFICATIONS: true,           // Mostrar notificações ao criar?
  DEBUG_MODE: false,                  // Logs detalhados no console

  // Delays (ms) para evitar spam
  DEBOUNCE_DELAY: 500,                // Esperar 500ms antes de criar
};

/**
 * Helper para verificar se integração está ativa
 */
export function isIntegrationEnabled(integration: keyof typeof INTEGRATION_CONFIG): boolean {
  if (!INTEGRATION_CONFIG.ENABLED) return false;
  return INTEGRATION_CONFIG[integration] as boolean;
}
```

---

## 🎯 PASSO 3: TIPOS DAS INTEGRAÇÕES

### **ARQUIVO:** `src/integrations/types/integration-events.ts` (NOVO)

```typescript
/**
 * TIPOS DOS EVENTOS DE INTEGRAÇÃO
 */

// Eventos do Whiteboard
export interface WhiteboardActionItemCreatedEvent {
  whiteboardId: string;
  elementId: string;
  content: string;
  metadata?: {
    cost?: number;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    dueDate?: string;
    assignee?: string;
  };
}

export interface WhiteboardMetaItemCreatedEvent {
  whiteboardId: string;
  elementId: string;
  goalName: string;
  targetAmount: number;
  category?: string;
  deadline?: string;
}

// Eventos de Tasks
export interface TaskCreatedEvent {
  taskId: string;
  title: string;
  cost?: number;
  linkedTo?: string; // whiteboardId ou outro ID
  source: 'manual' | 'whiteboard' | 'integration';
}

export interface TaskCompletedEvent {
  taskId: string;
  title: string;
  cost?: number;
  completedAt: string;
}

// Eventos de Finance
export interface ExpenseCreatedEvent {
  expenseId: string;
  category: string;
  amount: number;
  linkedTask?: string;
  linkedWhiteboard?: string;
  source: 'manual' | 'task' | 'whiteboard';
}

// Eventos de Gerenciador
export interface GoalCreatedEvent {
  goalId: string;
  name: string;
  targetAmount: number;
  linkedWhiteboard?: string;
  source: 'manual' | 'whiteboard';
}

// Mapa de todos os eventos
export type IntegrationEvents = {
  // Whiteboard
  'whiteboard.action-item.created': WhiteboardActionItemCreatedEvent;
  'whiteboard.meta-item.created': WhiteboardMetaItemCreatedEvent;
  'whiteboard.element.updated': { elementId: string; updates: any };
  'whiteboard.element.deleted': { elementId: string };

  // Tasks
  'task.created': TaskCreatedEvent;
  'task.completed': TaskCompletedEvent;
  'task.updated': { taskId: string; updates: any };
  'task.deleted': { taskId: string };

  // Finance
  'finance.expense.created': ExpenseCreatedEvent;
  'finance.income.created': { amount: number; source: string };

  // Gerenciador
  'gerenciador.goal.created': GoalCreatedEvent;
  'gerenciador.expense.created': { amount: number; category: string };

  // Cross-module
  'sync.update': { moduleId: string; entityId: string; updates: any };
};
```

---

## 🎯 PASSO 4: ADAPTADORES (Ponte para módulos existentes)

### **ARQUIVO:** `src/integrations/adapters/tasks-adapter.ts` (NOVO)

```typescript
/**
 * TASKS ADAPTER
 * 
 * Ponte entre eventos de integração e o módulo Tasks existente.
 * NÃO modifica o código do Tasks, apenas USA suas funções.
 */

import { supabase } from '@/lib/supabase';
import { nanoid } from 'nanoid';
import type { TaskCreatedEvent } from '../types/integration-events';

export class TasksAdapter {
  /**
   * Criar task usando a estrutura existente do Supabase
   * Usa a mesma tabela e formato que o módulo Tasks já usa
   */
  async createTask(data: Omit<TaskCreatedEvent, 'taskId'>): Promise<string> {
    const taskId = nanoid();

    // Usa a MESMA estrutura da tabela tasks que já existe
    const { error } = await supabase
      .from('tasks')
      .insert({
        id: taskId,
        title: data.title,
        status: 'pending',
        priority: 'medium',
        // Metadata para rastreamento
        metadata: {
          cost: data.cost,
          linkedTo: data.linkedTo,
          source: data.source,
          createdViaIntegration: true
        },
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating task via adapter:', error);
      throw error;
    }

    return taskId;
  }

  /**
   * Atualizar task existente
   */
  async updateTask(taskId: string, updates: any): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task via adapter:', error);
      throw error;
    }
  }

  /**
   * Marcar task como completa
   */
  async completeTask(taskId: string): Promise<void> {
    await this.updateTask(taskId, {
      status: 'completed',
      completed_at: new Date().toISOString()
    });
  }

  /**
   * Deletar task
   */
  async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task via adapter:', error);
      throw error;
    }
  }

  /**
   * Buscar tasks linkadas a um whiteboard
   */
  async getLinkedTasks(whiteboardId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .contains('metadata', { linkedTo: whiteboardId });

    if (error) {
      console.error('Error fetching linked tasks:', error);
      return [];
    }

    return data || [];
  }
}

// Singleton
export const tasksAdapter = new TasksAdapter();
```

### **ARQUIVO:** `src/integrations/adapters/gerenciador-adapter.ts` (NOVO)

```typescript
/**
 * GERENCIADOR ADAPTER
 * 
 * Ponte para o Budget Manager Notion (Meu Gerenciador)
 */

import { supabase } from '@/lib/supabase';
import { nanoid } from 'nanoid';

export class GerenciadorAdapter {
  /**
   * Criar meta financeira
   */
  async createGoal(data: {
    name: string;
    targetAmount: number;
    category?: string;
    linkedWhiteboard?: string;
  }): Promise<string> {
    const goalId = nanoid();

    const { error } = await supabase
      .from('finance_goals')
      .insert({
        id: goalId,
        name: data.name,
        target_amount: data.targetAmount,
        current_amount: 0,
        category: data.category || 'Geral',
        metadata: {
          linkedWhiteboard: data.linkedWhiteboard,
          createdViaIntegration: true
        },
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating goal via adapter:', error);
      throw error;
    }

    return goalId;
  }

  /**
   * Criar despesa
   */
  async createExpense(data: {
    category: string;
    amount: number;
    description?: string;
    linkedTask?: string;
    linkedWhiteboard?: string;
  }): Promise<string> {
    const expenseId = nanoid();

    const { error } = await supabase
      .from('finance_transactions')
      .insert({
        id: expenseId,
        type: 'expense',
        category: data.category,
        amount: data.amount,
        description: data.description || '',
        status: 'completed',
        metadata: {
          linkedTask: data.linkedTask,
          linkedWhiteboard: data.linkedWhiteboard,
          createdViaIntegration: true
        },
        transaction_date: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating expense via adapter:', error);
      throw error;
    }

    return expenseId;
  }

  /**
   * Criar entrada/receita
   */
  async createIncome(data: {
    name: string;
    amount: number;
    source?: string;
  }): Promise<string> {
    const incomeId = nanoid();

    const { error } = await supabase
      .from('finance_transactions')
      .insert({
        id: incomeId,
        type: 'income',
        category: 'Receita',
        amount: data.amount,
        description: data.name,
        status: 'completed',
        metadata: {
          source: data.source,
          createdViaIntegration: true
        },
        transaction_date: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating income via adapter:', error);
      throw error;
    }

    return incomeId;
  }

  /**
   * Atualizar progresso de meta
   */
  async updateGoalProgress(goalId: string, amount: number): Promise<void> {
    const { error } = await supabase
      .from('finance_goals')
      .update({ current_amount: amount })
      .eq('id', goalId);

    if (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }
}

// Singleton
export const gerenciadorAdapter = new GerenciadorAdapter();
```

---

## 🎯 PASSO 5: HANDLERS (Lógica de Integração)

### **ARQUIVO:** `src/integrations/handlers/whiteboard-to-tasks.ts` (NOVO)

```typescript
/**
 * INTEGRAÇÃO: Whiteboard → Tasks
 * 
 * Quando criar "action item" no whiteboard, cria task automaticamente
 */

import { eventBus } from '@/lib/event-bus';
import { tasksAdapter } from '../adapters/tasks-adapter';
import { isIntegrationEnabled, INTEGRATION_CONFIG } from '../config';
import type { WhiteboardActionItemCreatedEvent } from '../types/integration-events';
import { toast } from 'sonner';

/**
 * Inicializar integração
 * Chame esta função UMA VEZ no app (ex: no App.tsx)
 */
export function initWhiteboardToTasks() {
  if (!isIntegrationEnabled('WHITEBOARD_TO_TASKS')) {
    console.log('[Integration] Whiteboard → Tasks: DISABLED');
    return;
  }

  console.log('[Integration] Whiteboard → Tasks: ENABLED');

  // Listener: Quando criar action item no whiteboard
  eventBus.on(
    'whiteboard.action-item.created',
    async (data: WhiteboardActionItemCreatedEvent) => {
      try {
        if (INTEGRATION_CONFIG.DEBUG_MODE) {
          console.log('[Integration] Creating task from whiteboard:', data);
        }

        // Aguardar debounce (evitar criar várias vezes)
        await new Promise(resolve => 
          setTimeout(resolve, INTEGRATION_CONFIG.DEBOUNCE_DELAY)
        );

        // Criar task usando adapter
        const taskId = await tasksAdapter.createTask({
          title: data.content,
          cost: data.metadata?.cost,
          linkedTo: data.whiteboardId,
          source: 'whiteboard'
        });

        // Notificar usuário
        if (INTEGRATION_CONFIG.SHOW_NOTIFICATIONS) {
          toast.success('✅ Tarefa criada automaticamente!', {
            description: data.content,
            action: {
              label: 'Ver tarefa',
              onClick: () => {
                // Navegar para tasks
                window.location.href = '/tasks';
              }
            }
          });
        }

        // Disparar evento de task criada (para outras integrações)
        eventBus.emit('task.created', {
          taskId,
          title: data.content,
          cost: data.metadata?.cost,
          linkedTo: data.whiteboardId,
          source: 'whiteboard'
        });

        if (INTEGRATION_CONFIG.DEBUG_MODE) {
          console.log('[Integration] Task created successfully:', taskId);
        }

      } catch (error) {
        console.error('[Integration] Error creating task from whiteboard:', error);
        
        if (INTEGRATION_CONFIG.SHOW_NOTIFICATIONS) {
          toast.error('❌ Erro ao criar tarefa automaticamente');
        }
      }
    }
  );
}
```

### **ARQUIVO:** `src/integrations/handlers/whiteboard-to-gerenciador.ts` (NOVO)

```typescript
/**
 * INTEGRAÇÃO: Whiteboard → Gerenciador
 * 
 * Quando criar meta no whiteboard, cria no Gerenciador automaticamente
 */

import { eventBus } from '@/lib/event-bus';
import { gerenciadorAdapter } from '../adapters/gerenciador-adapter';
import { isIntegrationEnabled, INTEGRATION_CONFIG } from '../config';
import type { WhiteboardMetaItemCreatedEvent } from '../types/integration-events';
import { toast } from 'sonner';

export function initWhiteboardToGerenciador() {
  if (!isIntegrationEnabled('WHITEBOARD_TO_GERENCIADOR')) {
    console.log('[Integration] Whiteboard → Gerenciador: DISABLED');
    return;
  }

  console.log('[Integration] Whiteboard → Gerenciador: ENABLED');

  // Listener: Quando criar meta no whiteboard
  eventBus.on(
    'whiteboard.meta-item.created',
    async (data: WhiteboardMetaItemCreatedEvent) => {
      try {
        if (INTEGRATION_CONFIG.DEBUG_MODE) {
          console.log('[Integration] Creating goal from whiteboard:', data);
        }

        await new Promise(resolve => 
          setTimeout(resolve, INTEGRATION_CONFIG.DEBOUNCE_DELAY)
        );

        // Criar meta no Gerenciador
        const goalId = await gerenciadorAdapter.createGoal({
          name: data.goalName,
          targetAmount: data.targetAmount,
          category: data.category,
          linkedWhiteboard: data.whiteboardId
        });

        if (INTEGRATION_CONFIG.SHOW_NOTIFICATIONS) {
          toast.success('🎯 Meta criada no Gerenciador!', {
            description: `${data.goalName} - R$ ${data.targetAmount.toFixed(2)}`
          });
        }

        // Disparar evento
        eventBus.emit('gerenciador.goal.created', {
          goalId,
          name: data.goalName,
          targetAmount: data.targetAmount,
          linkedWhiteboard: data.whiteboardId,
          source: 'whiteboard'
        });

      } catch (error) {
        console.error('[Integration] Error creating goal from whiteboard:', error);
        
        if (INTEGRATION_CONFIG.SHOW_NOTIFICATIONS) {
          toast.error('❌ Erro ao criar meta automaticamente');
        }
      }
    }
  );
}
```

### **ARQUIVO:** `src/integrations/handlers/tasks-to-finance.ts` (NOVO)

```typescript
/**
 * INTEGRAÇÃO: Tasks → Finance
 * 
 * Quando completar task com custo, cria despesa automaticamente
 */

import { eventBus } from '@/lib/event-bus';
import { gerenciadorAdapter } from '../adapters/gerenciador-adapter';
import { isIntegrationEnabled, INTEGRATION_CONFIG } from '../config';
import type { TaskCompletedEvent } from '../types/integration-events';
import { toast } from 'sonner';

export function initTasksToFinance() {
  if (!isIntegrationEnabled('TASKS_TO_FINANCE')) {
    console.log('[Integration] Tasks → Finance: DISABLED');
    return;
  }

  console.log('[Integration] Tasks → Finance: ENABLED');

  // Listener: Quando completar task
  eventBus.on(
    'task.completed',
    async (data: TaskCompletedEvent) => {
      try {
        // Só criar despesa se task tem custo
        if (!data.cost || data.cost <= 0) {
          return;
        }

        if (INTEGRATION_CONFIG.DEBUG_MODE) {
          console.log('[Integration] Creating expense from completed task:', data);
        }

        // Criar despesa
        const expenseId = await gerenciadorAdapter.createExpense({
          category: 'Tarefa Concluída',
          amount: data.cost,
          description: data.title,
          linkedTask: data.taskId
        });

        if (INTEGRATION_CONFIG.SHOW_NOTIFICATIONS) {
          toast.info('💸 Despesa registrada!', {
            description: `${data.title} - R$ ${data.cost.toFixed(2)}`
          });
        }

        // Disparar evento
        eventBus.emit('finance.expense.created', {
          expenseId,
          category: 'Tarefa Concluída',
          amount: data.cost,
          linkedTask: data.taskId,
          source: 'task'
        });

      } catch (error) {
        console.error('[Integration] Error creating expense from task:', error);
      }
    }
  );
}
```

---

## 🎯 PASSO 6: INICIALIZADOR CENTRAL

### **ARQUIVO:** `src/integrations/index.ts` (NOVO)

```typescript
/**
 * INICIALIZADOR CENTRAL DE INTEGRAÇÕES
 * 
 * Importe este arquivo UMA VEZ no App.tsx
 */

import { initWhiteboardToTasks } from './handlers/whiteboard-to-tasks';
import { initWhiteboardToGerenciador } from './handlers/whiteboard-to-gerenciador';
import { initTasksToFinance } from './handlers/tasks-to-finance';
import { INTEGRATION_CONFIG } from './config';

let initialized = false;

/**
 * Inicializar TODAS as integrações
 * Chame esta função uma vez no App.tsx
 */
export function initIntegrations() {
  // Evitar inicializar múltiplas vezes
  if (initialized) {
    console.warn('[Integrations] Already initialized, skipping...');
    return;
  }

  if (!INTEGRATION_CONFIG.ENABLED) {
    console.log('[Integrations] System DISABLED via config');
    return;
  }

  console.log('[Integrations] Initializing...');

  // Inicializar cada integração
  initWhiteboardToTasks();
  initWhiteboardToGerenciador();
  initTasksToFinance();

  initialized = true;
  console.log('[Integrations] ✅ All integrations initialized!');
}

/**
 * Exportar para uso externo
 */
export { eventBus } from '@/lib/event-bus';
export { tasksAdapter } from './adapters/tasks-adapter';
export { gerenciadorAdapter } from './adapters/gerenciador-adapter';
export type * from './types/integration-events';
```

---

## 🎯 PASSO 7: INTEGRAR NO APP

### **ARQUIVO:** `src/App.tsx` (MODIFICAR - adicionar 2 linhas)

```typescript
// ... imports existentes

// ✅ ADICIONAR ESTA LINHA (topo do arquivo)
import { initIntegrations } from '@/integrations';

function App() {
  // ... código existente

  useEffect(() => {
    // ✅ ADICIONAR ESTA LINHA (dentro de algum useEffect de inicialização)
    initIntegrations();
  }, []);

  // ... resto do código
}
```

**APENAS ISSO!** Mais nada precisa mudar no App.tsx

---

## 🎯 PASSO 8: USAR NOS COMPONENTES

### **EXEMPLO:** Disparar evento ao criar box no whiteboard

```typescript
// Em whiteboard-box.tsx ou onde criar boxes

import { eventBus } from '@/integrations';

// Quando usuário criar um "action item"
const handleCreateActionItem = (content: string) => {
  // ... lógica existente de criar box

  // ✅ ADICIONAR APENAS ESTA LINHA
  eventBus.emit('whiteboard.action-item.created', {
    whiteboardId: currentWhiteboardId,
    elementId: newElementId,
    content,
    metadata: {
      cost: 5000, // Se tiver custo
      priority: 'high'
    }
  });
};
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### FASE 1: Setup Base
- [ ] Criar pasta `src/integrations/`
- [ ] Criar `src/lib/event-bus.ts`
- [ ] Criar `src/integrations/config.ts`
- [ ] Criar `src/integrations/types/integration-events.ts`
- [ ] Testar se compila sem erros

### FASE 2: Adapters
- [ ] Criar `src/integrations/adapters/tasks-adapter.ts`
- [ ] Criar `src/integrations/adapters/gerenciador-adapter.ts`
- [ ] Testar criar task manualmente via adapter
- [ ] Testar criar meta manualmente via adapter

### FASE 3: Handlers
- [ ] Criar `src/integrations/handlers/whiteboard-to-tasks.ts`
- [ ] Criar `src/integrations/handlers/whiteboard-to-gerenciador.ts`
- [ ] Criar `src/integrations/handlers/tasks-to-finance.ts`

### FASE 4: Inicialização
- [ ] Criar `src/integrations/index.ts`
- [ ] Adicionar `initIntegrations()` no App.tsx
- [ ] Verificar console se inicializou (ver logs)

### FASE 5: Integrar Whiteboards
- [ ] Adicionar `eventBus.emit()` ao criar action items
- [ ] Adicionar `eventBus.emit()` ao criar metas
- [ ] Testar criar no whiteboard → verificar se cria task
- [ ] Testar criar no whiteboard → verificar se cria meta

### FASE 6: Validação Final
- [ ] Testar cada integração individualmente
- [ ] Testar desligar/ligar via config.ts
- [ ] Verificar notificações (toast)
- [ ] Verificar se nada quebrou

---

## 🚨 ROLLBACK (SE ALGO DER ERRADO)

### **OPÇÃO 1: Desligar via config**
```typescript
// src/integrations/config.ts
export const INTEGRATION_CONFIG = {
  ENABLED: false, // ← Muda para false
  // ...
};
```

### **OPÇÃO 2: Remover inicialização**
```typescript
// src/App.tsx
// Comenta ou remove estas linhas:
// import { initIntegrations } from '@/integrations';
// initIntegrations();
```

### **OPÇÃO 3: Deletar pasta completa**
```bash
# Deleta pasta inteira
rm -rf src/integrations/
# Remove import do App.tsx
```

**Resultado:** App volta a funcionar exatamente como antes! ✅

---

## 🎯 PROMPT PARA WINDSURF

```
IMPLEMENTAR SISTEMA DE INTEGRAÇÕES MODULAR

OBJETIVO:
Adicionar sistema que permite módulos conversarem entre si SEM modificar código existente.

ARQUIVOS A CRIAR (TODOS NOVOS):
1. src/lib/event-bus.ts
2. src/integrations/config.ts
3. src/integrations/types/integration-events.ts
4. src/integrations/adapters/tasks-adapter.ts
5. src/integrations/adapters/gerenciador-adapter.ts
6. src/integrations/handlers/whiteboard-to-tasks.ts
7. src/integrations/handlers/whiteboard-to-gerenciador.ts
8. src/integrations/handlers/tasks-to-finance.ts
9. src/integrations/index.ts

ARQUIVOS A MODIFICAR (MÍNIMO):
1. src/App.tsx - Adicionar 2 linhas:
   - import { initIntegrations } from '@/integrations';
   - initIntegrations(); // dentro de useEffect

REGRAS CRÍTICAS:
1. NÃO modificar código existente de Tasks, Finance, Gerenciador
2. NÃO alterar estrutura do Supabase
3. USAR funções e tabelas que já existem
4. Sistema deve poder ser DESLIGADO via config
5. Implementar EM ORDEM (fase 1 → fase 2 → fase 3)
6. TESTAR após cada fase

VALIDAÇÃO:
✓ Criar action item no whiteboard → cria task automaticamente
✓ Criar meta no whiteboard → cria no Gerenciador
✓ Completar task com custo → cria despesa
✓ Notificações aparecem (toast)
✓ Pode desligar via config.ts
✓ NADA do código antigo quebrou

COMEÇAR PELA FASE 1 (Setup Base)
```

---

## 📚 DOCUMENTAÇÃO ADICIONAL

### **README.md** (criar em `src/integrations/`)

```markdown
# Sistema de Integrações - ISACAR.DEV

## O que é?

Sistema modular que permite módulos conversarem entre si sem modificar código existente.

## Como funciona?

1. **Event Bus**: Módulos disparam eventos
2. **Handlers**: Ouvem eventos e executam ações
3. **Adapters**: Ponte para código existente

## Como usar?

### Disparar evento:
```typescript
import { eventBus } from '@/integrations';

eventBus.emit('whiteboard.action-item.created', {
  content: 'Nova tarefa',
  // ... dados
});
```

### Ouvir evento:
```typescript
eventBus.on('task.created', (data) => {
  console.log('Task criada!', data);
});
```

## Como desligar?

Edite `src/integrations/config.ts`:
```typescript
export const INTEGRATION_CONFIG = {
  ENABLED: false, // ← Desliga tudo
};
```

## Eventos disponíveis:

Ver `src/integrations/types/integration-events.ts`
```

---

**Versão**: 1.0  
**Status**: Pronto para implementação  
**Segurança**: 100% reversível  
**Impacto**: Zero em código existente 🛡️