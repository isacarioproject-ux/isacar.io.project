# 🔍 DIAGNÓSTICO: Realtime não está funcionando

## 🚨 PROBLEMA ATUAL:
Tasks não aparecem instantaneamente em outras abas após serem criadas.

---

## ✅ PASSO 1: VERIFICAR SUPABASE REALTIME

### A) Acessar Dashboard:
1. Abra: https://supabase.com/dashboard/project/jjeudthfiqvvauuqnezs
2. Vá em: **Settings → API**
3. Role até **Realtime**

### B) Verificar se está ENABLED:
- ✅ Deve estar: **Realtime enabled**
- ❌ Se estiver OFF → **LIGAR AGORA**

### C) Verificar tabelas permitidas:
- Vá em: **Database → Replication**
- Procure: Tabela `tasks`
- Status: Deve estar **✓ Enabled**
- Se não estiver → Clique em **Enable Replication** para `tasks`

---

## ✅ PASSO 2: VERIFICAR RLS (Row Level Security)

### A) Acessar políticas:
1. **Database → Tables → tasks**
2. Clique na aba **RLS policies**

### B) Verificar política de SELECT:
Deve ter uma política como:
```sql
-- Política: Users can view tasks in their workspace
CREATE POLICY "Users can view tasks in their workspace"
ON tasks FOR SELECT
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()
  )
);
```

### C) Se NÃO tiver política de SELECT:
Execute no SQL Editor:

```sql
-- Habilitar RLS na tabela tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Política de SELECT (necessária para Realtime funcionar)
CREATE POLICY "Users can view tasks in their workspace"
ON tasks FOR SELECT
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()
  )
);

-- Política de INSERT
CREATE POLICY "Users can create tasks in their workspace"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()
  )
);

-- Política de UPDATE
CREATE POLICY "Users can update tasks in their workspace"
ON tasks FOR UPDATE
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()
  )
);

-- Política de DELETE
CREATE POLICY "Users can delete tasks in their workspace"
ON tasks FOR DELETE
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()
  )
);
```

---

## ✅ PASSO 3: TESTAR REALTIME COM SCRIPT

### A) Abrir arquivo de teste:
1. Abra no navegador: `http://localhost:5173/test-realtime.html`
2. Ou abra diretamente: `C:\Isacar.dev\app.isacar.dev\test-realtime.html`

### B) Executar testes na ordem:
1. **Botão 1: Testar Conexão**
   - Deve mostrar: "✅ Conectado: seu@email.com"
   - Deve listar seus workspaces

2. **Botão 2: Testar Subscrição**
   - Deve mostrar: "🟢 Realtime ativo e escutando..."
   - Logs devem mostrar: "Status do canal: SUBSCRIBED"

3. **Botão 3: Simular INSERT**
   - Deve criar uma task
   - **IMPORTANTE:** Deve aparecer "🎉 EVENTO REALTIME RECEBIDO!" nos logs
   - Se NÃO aparecer → Realtime NÃO está funcionando

---

## ✅ PASSO 4: VERIFICAR CONSOLE DO NAVEGADOR

### A) Abrir DevTools:
- Pressione **F12**
- Vá na aba **Console**

### B) Procurar por logs do Realtime:
Deve aparecer:
```
🔄 [useRealtimeTasks] Iniciando subscrição
✨ [Realtime] Criando channel "tasks:workspace-abc-123"
📡 [Realtime] Status do channel: SUBSCRIBED
```

### C) Se NÃO aparecer "SUBSCRIBED":
- Problema de conexão WebSocket
- Vá em **DevTools → Network → WS**
- Deve ter uma conexão WebSocket **OPEN** (verde)

---

## ✅ PASSO 5: VERIFICAR SE TASK TEM WORKSPACE_ID

### A) Criar uma task pela aplicação

### B) Ir no Supabase:
1. **Database → Tables → tasks**
2. Ver a task recém-criada
3. Verificar coluna `workspace_id`
4. **Deve ter um UUID válido** (não null!)

### C) Se workspace_id estiver NULL:
O problema é no código de criação. Execute:

```sql
-- Ver tasks sem workspace_id
SELECT id, title, workspace_id 
FROM tasks 
WHERE workspace_id IS NULL
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🐛 PROBLEMAS COMUNS E SOLUÇÕES:

### ❌ "Canal não se conecta (status: CHANNEL_ERROR)"
**Solução:**
- Verifique se Realtime está ENABLED no Supabase
- Verifique se a tabela `tasks` tem Replication habilitada

### ❌ "Evento não dispara ao criar task"
**Solução:**
- Verifique RLS policies (PASSO 2)
- A política de SELECT é OBRIGATÓRIA para Realtime funcionar
- Execute as políticas SQL acima

### ❌ "workspace_id está NULL nas tasks"
**Solução:**
- O problema está no código
- Verifique se `currentWorkspace?.id` existe ao criar task
- Abra console e veja se há erros

### ❌ "Task aparece, mas demora 5-10 segundos"
**Solução:**
- Isso é normal se estiver usando Supabase Free Tier
- O delay pode variar de 1-10 segundos
- Para latência < 1s, precisa de plano pago

### ❌ "Websocket não conecta (Network → WS vazio)"
**Solução:**
- Firewall ou antivírus bloqueando WebSocket
- Tente em uma aba anônima
- Verifique se proxy/VPN está interferindo

---

## 📊 COMO SABER SE ESTÁ FUNCIONANDO:

### ✅ SUCESSO:
1. Badge "Ao vivo" verde pulsando no TasksCard
2. Console mostra: "📡 [Realtime] Status: SUBSCRIBED"
3. Criar task em Aba 1 → Aparece em Aba 2 em **< 2 segundos**
4. Toast: "Nova tarefa criada" aparece
5. Script de teste mostra: "🎉 EVENTO REALTIME RECEBIDO!"

### ❌ FALHA:
1. Badge "Ao vivo" NÃO aparece ou está vermelho
2. Console mostra: "CHANNEL_ERROR" ou nada
3. Task só aparece após F5 (reload)
4. Script de teste NÃO mostra evento recebido
5. DevTools → Network → WS está vazio

---

## 🚀 DEPOIS DE CORRIGIR:

### A) Testar novamente:
1. Abra 2 abas: `http://localhost:5173/dashboard`
2. Crie uma task na Aba 1
3. Veja se aparece na Aba 2 sem F5

### B) Verificar logs:
```
Console → deve mostrar:
📨 [Realtime] Evento recebido em "tasks:workspace-abc-123"
   eventType: "INSERT"
   new: { id: "...", title: "...", workspace_id: "..." }
```

### C) Se AINDA não funcionar:
Me envie:
1. Screenshot do console (F12)
2. Screenshot do Supabase → Settings → API → Realtime
3. Screenshot do Database → Replication → tasks
4. Resultado do script de teste (`test-realtime.html`)

---

## 📞 SUPORTE ADICIONAL:

Se nada disso resolver, é provável que seja:
1. **Realtime desabilitado no Supabase** (PASSO 1)
2. **RLS bloqueando SELECT** (PASSO 2)
3. **Replication não habilitada** (PASSO 1.C)
4. **Firewall/antivírus bloqueando WebSocket**

Execute os PASSOs na ordem e me avise onde travou! 🚀
