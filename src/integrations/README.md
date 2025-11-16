# Sistema de Integrações - ISACAR.DEV

## ⚠️ STATUS: EM DESENVOLVIMENTO

**Fase Atual:** 1 - Setup Base ✅  
**Próxima Fase:** 2 - Adapters

---

## O que é?

Sistema modular que permite módulos conversarem entre si sem modificar código existente.

## Como funciona?

1. **Event Bus**: Módulos disparam eventos
2. **Handlers**: Ouvem eventos e executam ações
3. **Adapters**: Ponte para código existente

## Como usar?

### Disparar evento:
```typescript
import { eventBus } from '@/lib/event-bus';

eventBus.emit('whiteboard.action-item.created', {
  content: 'Nova tarefa',
  whiteboardId: 'wb-123',
  elementId: 'el-456'
});
```

### Ouvir evento:
```typescript
import { eventBus } from '@/lib/event-bus';

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

---

## Estrutura de Arquivos:

```
src/integrations/
├── README.md                    ← Este arquivo
├── config.ts                    ← Feature flags
├── index.ts                     ← (Fase 4) Inicializador central
│
├── types/
│   └── integration-events.ts    ← ✅ FASE 1 - Tipos
│
├── adapters/                    ← (Fase 2) Ponte para módulos
│   ├── tasks-adapter.ts
│   ├── gerenciador-adapter.ts
│   └── finance-adapter.ts
│
└── handlers/                    ← (Fase 3) Lógica de integração
    ├── whiteboard-to-tasks.ts
    ├── whiteboard-to-gerenciador.ts
    └── tasks-to-finance.ts
```

---

**Versão**: 1.0.0  
**Status**: Seguro - não afeta código existente  
**Reversível**: Sim - deletar pasta volta ao normal
