# 📧 Setup Google Integration - Passo a Passo

## ⚠️ ERRO ATUAL
```
Erro 406: google_integrations - tabela não existe
Erro ao buscar emails: Google não conectado neste workspace
```

## ✅ SOLUÇÃO - Execute os SQLs no Supabase

### 1️⃣ Criar Tabela Google Integrations
**Arquivo:** `supabase/migrations/create_google_integrations.sql`

**Onde executar:** Supabase Dashboard → SQL Editor → New Query

```sql
-- Cole o conteúdo do arquivo create_google_integrations.sql
```

### 2️⃣ Criar Tabela Imported Gmail Messages
**Arquivo:** `supabase/migrations/create_imported_gmail_messages.sql`

```sql
-- Cole o conteúdo do arquivo create_imported_gmail_messages.sql
```

### 3️⃣ Criar Bucket Storage
**Arquivo:** `supabase/migrations/create_finance_documents_bucket.sql`

```sql
-- Cole o conteúdo do arquivo create_finance_documents_bucket.sql
```

---

## 🔑 Configurar Google OAuth

### 1. Google Cloud Console
1. Acessar: https://console.cloud.google.com
2. Criar projeto (ou usar existente)
3. Habilitar APIs:
   - Gmail API
   - Google Calendar API
   - Google Sheets API
   - Google Drive API

4. Criar credenciais OAuth 2.0:
   - Tipo: Aplicação Web
   - Nome: ISACAR App
   - URIs autorizados:
     ```
     http://localhost:5173
     https://app.isacar.dev
     ```
   - URIs de redirecionamento:
     ```
     https://jjeudthfiqvvauuqnezs.supabase.co/auth/v1/callback
     ```

5. Copiar:
   - Client ID
   - Client Secret

### 2. Variáveis de Ambiente

**Arquivo `.env` (local):**
```env
VITE_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
```

**Supabase Edge Function (Environment Variables):**
```
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
APP_URL=https://app.isacar.dev
```

### 3. Deploy Edge Function
```bash
npx supabase functions deploy google-oauth-exchange
```

---

## 🧪 Testar Integração

### 1. Conectar Google
1. Ir em: **Configurações → Integrações**
2. Clicar em **"Conectar Google"** no card
3. Autorizar no popup do Google
4. Verificar mensagem de sucesso

### 2. Verificar no Supabase
```sql
-- Ver integrações criadas
SELECT * FROM google_integrations;
```

### 3. Testar Import Gmail
1. Ir em: **Finance → Importar Gmail** (ícone do envelope)
2. Clicar em **"Buscar Emails"**
3. Deve listar emails com boletos/faturas
4. Clicar **"Importar"** em um email
5. Preencher dados
6. Salvar

---

## 📝 Checklist

- [ ] Executar SQL: `create_google_integrations.sql`
- [ ] Executar SQL: `create_imported_gmail_messages.sql`
- [ ] Executar SQL: `create_finance_documents_bucket.sql`
- [ ] Criar projeto no Google Cloud Console
- [ ] Habilitar APIs (Gmail, Calendar, Sheets, Drive)
- [ ] Criar credenciais OAuth 2.0
- [ ] Configurar URIs de redirecionamento
- [ ] Adicionar `VITE_GOOGLE_CLIENT_ID` no `.env`
- [ ] Deploy Edge Function com variáveis de ambiente
- [ ] Testar conexão Google em Configurações
- [ ] Testar importação Gmail

---

## 🎯 Ordem de Execução

1. ✅ **SQLs no Supabase** (PRIMEIRO - resolve erro 406)
2. ✅ **Google Cloud Console** (credenciais)
3. ✅ **Variáveis de ambiente**
4. ✅ **Deploy Edge Function**
5. ✅ **Testar**

---

## 💡 Dicas

- **Erro 406**: Tabela não existe → Execute os SQLs
- **Erro 401**: Token inválido → Reconectar Google
- **Erro 403**: Sem permissão → Verificar scopes
- **Erro 404**: Email não encontrado → Verificar query

---

## 🚀 Após Setup Completo

Funcionalidades disponíveis:
- ✅ Conectar/desconectar Google
- ✅ Importar boletos do Gmail
- ✅ Download automático de PDFs
- ✅ Criar despesas no Finance
- ✅ Sistema anti-duplicatas
- ✅ Anexos salvos no Storage

**Custo:** R$ 0,00 (100% grátis!) 🎉
