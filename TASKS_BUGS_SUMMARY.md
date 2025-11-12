# 🐛 RESUMO DE BUGS - MÓDULO TASKS

## ❌ BUGS FUNCIONAIS CRÍTICOS

### 1. **Botão "Adicionar Responsável" não funciona**
- **Causa:** Dados não carregados ou handlers quebrados
- **Impacto:** Não consegue atribuir tarefas

### 2. **Botão "Adicionar Anexo" não funciona**
- **Causa:** Handler não implementado ou quebrado
- **Impacto:** Não consegue anexar arquivos

### 3. **Botão "Adicionar Subtarefa" não funciona**
- **Causa:** Handler não implementado ou quebrado
- **Impacto:** Não consegue criar subtarefas

### 4. **Erro: `Cannot read properties of undefined (reading 'includes')` (linha 410)**
- **Arquivo:** `task-detail-view.tsx`
- **Causa:** `task.tag_ids` pode ser `undefined`
- **Impacto:** Crash ao abrir detalhes da tarefa

### 5. **Erro: `Cannot read properties of undefined (reading 'map')` (linha 135)**
- **Arquivo:** `task-activity-sidebar.tsx`
- **Causa:** `comments` pode ser `undefined`
- **Impacto:** Crash ao abrir sidebar de atividades

### 6. **Erro 404: `team_members` table not found**
- **Causa:** Código busca tabela inexistente
- **Solução:** Usar `workspace_members` + `profiles`
- **Impacto:** Falha ao carregar usuários

---

## ⚠️ WARNINGS (Não quebram funcionalidade)

### 7. **DialogTitle missing**
- **Tipo:** Acessibilidade
- **Impacto:** Leitores de tela não funcionam bem
- **Solução:** Adicionar `<DialogTitle>` ou `<VisuallyHidden>`

### 8. **Function components cannot be given refs**
- **Tipo:** Warning do React
- **Componentes:** `DropdownMenu`, `Badge`, `DropdownMenuTrigger`
- **Impacto:** Nenhum (apenas warning)
- **Solução:** Usar `React.forwardRef()`

---

## 🔧 CORREÇÕES NECESSÁRIAS

### **PRIORIDADE ALTA** 🔴

1. ✅ Corrigir `task-detail-view.tsx:410` - tag_ids undefined
2. ✅ Corrigir `task-activity-sidebar.tsx:135` - comments undefined
3. ❌ Implementar handler "Adicionar Responsável"
4. ❌ Implementar handler "Adicionar Anexo"
5. ❌ Implementar handler "Adicionar Subtarefa"
6. ❌ Corrigir erro 404 `team_members`

### **PRIORIDADE MÉDIA** 🟡

7. Adicionar `DialogTitle` em todos os `Dialog`
8. Adicionar `forwardRef` em componentes com refs

---

## 📝 DETALHES DOS ERROS

### **Erro task-detail-view.tsx:410**
```typescript
// ❌ PROBLEMA
{users.filter(u => task.tag_ids.includes(u.id))}
// task.tag_ids pode ser undefined

// ✅ SOLUÇÃO
{users.filter(u => (task.tag_ids || []).includes(u.id))}
```

### **Erro task-activity-sidebar.tsx:135**
```typescript
// ❌ PROBLEMA
{comments.map(c => ...)}
// comments pode ser undefined

// ✅ SOLUÇÃO
{(comments || []).map(c => ...)}
```

### **Erro team_members 404**
```
GET /rest/v1/team_members?select=email,name,user_id&user_id=eq.xxx
404 Not Found
```

**Causa:** Tabela `team_members` não existe no schema do Supabase.

**Tabelas corretas:**
- ✅ `workspace_members`
- ✅ `profiles`

---

## 🎯 PLANO DE AÇÃO

1. **Corrigir crashes** (task-detail-view e task-activity-sidebar)
2. **Implementar handlers** (responsável, anexo, subtarefa)
3. **Corrigir team_members** (substituir por workspace_members)
4. **Adicionar DialogTitle** (acessibilidade)
5. **Adicionar forwardRef** (warnings)

---

## 📊 STATUS ATUAL

| Item | Status |
|------|--------|
| Dados mockados removidos | ✅ |
| Async/await corrigido | ✅ |
| customFields undefined | ✅ |
| comments undefined (linha 66) | ✅ |
| assigneeIds undefined (linha 260) | ✅ |
| user_name undefined | ✅ |
| tag_ids undefined (linha 410) | ❌ |
| comments map (linha 135) | ❌ |
| Handlers não funcionam | ❌ |
| team_members 404 | ❌ |
| DialogTitle missing | ❌ |
| forwardRef warnings | ❌ |
