# REMOVER WHITEBOARD - LISTA DE AÇÕES

## ❌ ARQUIVOS PARA DELETAR (pastas/arquivos completos):
```
src/components/whiteboard/
src/pages/whiteboard/
src/pages/minha-empresa/
src/hooks/use-whiteboard.ts
```

## ✏️ ARQUIVOS PARA MODIFICAR:

### 1. `src/integrations/config.ts`
**Procurar e mudar estas linhas:**
```typescript
WHITEBOARD_TO_TASKS: false,           // mudar para false
WHITEBOARD_TO_GERENCIADOR: false,     // mudar para false
```

### 2. `src/integrations/handlers/whiteboard-to-tasks.ts`
**Substituir TODA a função por:**
```typescript
export function initWhiteboardToTasks() {
  return; // Desabilitado - whiteboard removido
}
```

### 3. `src/integrations/handlers/whiteboard-to-gerenciador.ts`
**Substituir TODA a função por:**
```typescript
export function initWhiteboardToGerenciador() {
  return; // Desabilitado - whiteboard removido
}
```

### 4. `src/App.tsx` (ou arquivo de rotas)
**Procurar e REMOVER/COMENTAR linhas com:**
- `whiteboard`
- `minha-empresa`
- Rotas relacionadas

### 5. `src/pages/dashboard.tsx`
**Procurar e REMOVER/COMENTAR cards:**
- Tarefas da Empresa
- Planos da Empresa
- Estrutura da Jornada
- Minha Empresa
- Qualquer card que abra whiteboard

## ✅ TESTAR DEPOIS:
```bash
npm run dev
```

Verificar se:
- Compila sem erros
- Dashboard abre
- Nenhum console.error
- Outros módulos funcionam (Tasks, Gerenciador, Finance)

## 💾 GIT:
```bash
git add .
git commit -m "Remove whiteboard e página minha empresa"
```