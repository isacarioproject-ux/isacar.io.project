# 🔒 GUIA DE SEGURANÇA - ISACAR.IO

## ✅ STATUS ATUAL: PROJETO SEGURO

### 📋 Checklist de Segurança:
- ✅ `.env.local` está no `.gitignore` (chaves NUNCA foram commitadas)
- ✅ Row Level Security (RLS) ativo em todas as tabelas
- ✅ Apenas chave ANON pública (segura para frontend)
- ✅ Chave SERVICE_ROLE nunca exposta no código
- ✅ Build artifacts (`dist/`) não commitados

---

## 🛡️ PROTEÇÕES ATIVAS DO SUPABASE

### 1. Row Level Security (RLS)
Todas as tabelas têm RLS habilitado:
- ✅ `whiteboards` - Usuário só vê seus próprios dados
- ✅ `projects` - Acesso apenas aos projetos que criou
- ✅ `documents` - Isolamento por usuário
- ✅ `team_members` - Apenas membros autorizados
- ✅ `subscriptions` - Dados privados por usuário

### 2. Chaves de API

#### Chave ANON (Pública) ✅
- **Pode ser exposta** no frontend
- Limitada por RLS
- Sem acesso privilegiado
- Usuário só acessa seus dados

#### Chave SERVICE_ROLE ⚠️
- **NUNCA** deve ser exposta
- **NUNCA** commit no código
- Apenas para backend/admin
- Acesso total ao banco

---

## 🔐 O QUE NUNCA COMMITAR

### ❌ Arquivos PROIBIDOS no Git:
```bash
.env                    # Variáveis de produção
.env.local              # Variáveis locais
.env.*.local            # Qualquer .env local
*.pem                   # Certificados
*.key                   # Chaves privadas
*.p12                   # Certificados
service-account.json    # Credenciais de serviço
```

### ✅ O que PODE commitar:
```bash
.env.example            # Template SEM valores reais
src/lib/supabase.ts     # Código que USA variáveis de ambiente
.gitignore              # Arquivo de proteção
```

---

## 🚨 SE VOCÊ COMMITOU UMA CHAVE POR ENGANO

### Ação Imediata:

#### 1. **Regenerar a chave no Supabase:**
```
1. Vá em: https://supabase.com/dashboard/project/SEU_PROJECT_ID/settings/api
2. Clique em "Regenerate" na chave comprometida
3. Copie a NOVA chave
4. Atualize no .env.local
```

#### 2. **Remover do histórico do Git:**
```bash
# CUIDADO: Isso reescreve o histórico!
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (se repo já foi enviado)
git push origin --force --all
```

#### 3. **Alternativa mais segura (BFG Repo-Cleaner):**
```bash
# Download: https://rpo.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files .env.local
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

---

## 🎯 BOAS PRÁTICAS

### 1. Sempre usar variáveis de ambiente:
```typescript
// ✅ CORRETO
const url = import.meta.env.VITE_SUPABASE_URL

// ❌ ERRADO
const url = 'https://abc123.supabase.co'
```

### 2. Verificar antes de commit:
```bash
# Ver o que vai ser commitado
git status
git diff

# Verificar se não há chaves
grep -r "eyJ" src/  # Procura por JWT tokens
grep -r "sk_" src/  # Procura por secret keys
```

### 3. Usar hooks do Git (opcional):
Criar `.git/hooks/pre-commit`:
```bash
#!/bin/bash
if git diff --cached --name-only | grep -E '\.(env|key|pem)$'; then
  echo "❌ Tentativa de commit de arquivo sensível detectada!"
  exit 1
fi
```

---

## 📊 EXPOSIÇÃO ATUAL

### ✅ Seguro (já está público):
| Item | Local | Seguro? |
|------|-------|---------|
| Project ID | .env.example | ✅ SIM - Apenas ID |
| URL do Projeto | .env.example | ✅ SIM - Protegido por RLS |
| Chave ANON | .env.local | ✅ SIM - Não commitada |

### ❌ Crítico (NUNCA expor):
| Item | Seguro? |
|------|---------|
| Chave SERVICE_ROLE | ✅ Não está no código |
| Senhas de usuários | ✅ Hashed no Supabase |
| Dados privados | ✅ Protegidos por RLS |

---

## 🔍 AUDITORIA RÁPIDA

### Como verificar se está seguro:
```bash
# 1. Ver o que está no Git
git ls-files | grep -E '\.(env|key|pem)'

# 2. Procurar chaves hardcoded
grep -r "eyJ" src/
grep -r "supabase.co.*eyJ" .

# 3. Verificar .gitignore
cat .gitignore | grep -E '\.env'
```

---

## 📞 EMERGÊNCIA

### Se você acha que expôs dados sensíveis:

1. ✅ **Regenerar TODAS as chaves** no Supabase
2. ✅ **Limpar histórico Git** (ver acima)
3. ✅ **Avisar usuários** se houver dados comprometidos
4. ✅ **Revisar logs** no Supabase para acessos suspeitos

### Links importantes:
- Dashboard: https://supabase.com/dashboard
- API Settings: https://supabase.com/dashboard/project/SEU_PROJECT_ID/settings/api
- Logs: https://supabase.com/dashboard/project/SEU_PROJECT_ID/logs

---

## ✅ RESUMO

**Seu projeto ESTÁ SEGURO porque:**
1. ✅ Chaves estão em `.env.local` (gitignored)
2. ✅ RLS ativo em todas as tabelas
3. ✅ Apenas chave ANON no frontend
4. ✅ Nenhuma credencial hardcoded
5. ✅ `.gitignore` configurado corretamente

**Mantenha-se seguro:**
- Sempre use `.env.local` para chaves
- Nunca commit arquivos `.env*`
- Revise antes de fazer `git push`
- Mantenha RLS ativo sempre
