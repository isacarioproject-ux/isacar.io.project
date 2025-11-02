# 📚 DOCUMENTAÇÃO TÉCNICA COMPLETA - ISACAR v1.3.0

## 🎯 PROPÓSITO DESTE DOCUMENTO

Esta documentação foi criada para permitir que **outra IA ou desenvolvedor** possa entender **COMPLETAMENTE** a arquitetura, lógica e funcionalidades do sistema ISACAR e propor melhorias no sistema de permissões, gerenciamento de membros e colaboração em projetos.

---

## 📖 ESTRUTURA DA DOCUMENTAÇÃO

A documentação está dividida em **4 partes** para facilitar a leitura:

### **📄 PARTE 1: Arquitetura e Autenticação**
**Arquivo**: `DOCUMENTACAO-TECNICA-ISACAR-PARTE-1.md`

**Conteúdo**:
- ✅ Visão geral do sistema
- ✅ Stack técnico completo (Frontend, Backend, Deploy)
- ✅ Sistema de autenticação (Signup, Login, OAuth)
- ✅ Estrutura do banco de dados (auth.users, profiles, user_preferences)
- ✅ Sistema de projetos (tabela, RLS, hooks, relações)

### **📄 PARTE 2: Sistema de Membros e Permissões**
**Arquivo**: `DOCUMENTACAO-TECNICA-ISACAR-PARTE-2.md`

**Conteúdo**:
- ✅ Tabela team_members (estrutura, roles, status)
- ✅ RLS Policies (3 políticas simplificadas)
- ✅ Fluxos de convites (convidar, aceitar, recusar, remover)
- ✅ **PROBLEMAS CRÍTICOS** do sistema de permissões
- ✅ Sistema de documentos (tabela, RLS, upload)

### **📄 PARTE 3: Whiteboards, Assinaturas e Melhorias**
**Arquivo**: `DOCUMENTACAO-TECNICA-ISACAR-PARTE-3.md`

**Conteúdo**:
- ✅ Sistema de whiteboards (tabela, funcionalidades, RLS, real-time)
- ✅ Sistema de assinaturas e limites (planos, verificações, triggers)
- ✅ Sistema de internacionalização (i18n)
- ✅ Design system (shadcn/ui, Tailwind)
- ✅ **LISTA COMPLETA** de problemas e melhorias necessárias

### **📄 PARTE 4: Estrutura e Recomendações**
**Arquivo**: `DOCUMENTACAO-TECNICA-ISACAR-PARTE-4.md`

**Conteúdo**:
- ✅ Estrutura completa de pastas do projeto
- ✅ Componentes principais e responsabilidades
- ✅ **RECOMENDAÇÕES DE IMPLEMENTAÇÃO** (código pronto)
- ✅ Roadmap de próximas versões
- ✅ Resumo final (o que funciona, o que falta)

---

## 🚨 PROBLEMA PRINCIPAL IDENTIFICADO

### **Sistema de Permissões NÃO está Implementado**

**SITUAÇÃO ATUAL**:
- ✅ Roles estão **definidas** no banco (`owner`, `admin`, `editor`, `viewer`)
- ✅ Interface permite **selecionar** roles ao convidar
- ❌ Roles **NÃO são verificadas** em NENHUMA ação!
- ❌ Qualquer membro pode fazer **qualquer coisa**

**IMPACTO**:
- Qualquer membro pode convidar outros
- Qualquer membro pode editar/deletar projetos
- Qualquer membro pode remover outros membros
- Qualquer membro pode deletar documentos
- **Zero controle de acesso real!**

---

## 💡 SOLUÇÕES PROPOSTAS (Veja Parte 4)

A **Parte 4** contém:
1. ✅ Código completo de `lib/permissions.ts`
2. ✅ Hook `useProjectPermissions()`
3. ✅ Exemplos de uso em componentes
4. ✅ RLS Policies atualizadas com verificação de roles
5. ✅ Sistema de notificações (Edge Functions + Email)

**TUDO PRONTO PARA COPIAR E IMPLEMENTAR!**

---

## 🎯 PRINCIPAIS QUESTÕES PARA OUTRA IA RESPONDER

### **1. Arquitetura de Permissões**
- Como implementar verificação de roles em **TODAS as ações**?
- Criar tabela `project_collaborators` ou usar `team_members`?
- Como estruturar helper de permissões de forma escalável?

### **2. Convites: Organização vs Projeto**
- Manter convites de organização (`project_id = NULL`) ou simplificar?
- Como implementar fluxo de "adicionar membro da org a projeto"?
- Vale a pena criar tabela `organizations` separada?

### **3. RLS Policies**
- Como atualizar policies para verificar roles corretamente?
- Como garantir performance com EXISTS subqueries?
- Precisa criar índices específicos?

### **4. Colaboradores em Projetos**
- `ManageCollaboratorsDialog` existe mas não salva. Como implementar?
- Usar array `collaborators UUID[]` ou tabela `project_collaborators`?
- Como sincronizar colaboradores de projeto com whiteboards?

### **5. Notificações**
- Melhor forma de implementar emails de convite?
- Usar Supabase Edge Functions + Resend/SendGrid?
- Como fazer trigger de email ao criar convite?

---

## 📊 TECNOLOGIAS USADAS

**Frontend**: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui  
**Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)  
**Deploy**: Vercel  
**State**: React Context API + Custom Hooks  
**Validação**: Zod  
**Animações**: Framer Motion  

---

## 🗂️ TABELAS DO BANCO DE DADOS

1. **auth.users** - Usuários (Supabase Auth)
2. **public.profiles** - Perfis públicos
3. **public.user_preferences** - Preferências de segurança
4. **public.notification_settings** - Configurações de notificações
5. **public.projects** - Projetos dos usuários
6. **public.documents** - Documentos com upload
7. **public.team_members** - Membros e convites (⚠️ FOCO PRINCIPAL)
8. **public.whiteboards** - Whiteboards colaborativos
9. **public.subscriptions** - Assinaturas e limites
10. **public.payment_methods** - Métodos de pagamento
11. **public.invoices** - Faturas

---

## ✅ STATUS DO PROJETO

**Versão Atual**: v1.3.0  
**Build**: ✅ Passa sem erros TypeScript  
**Deploy**: ✅ Funcionando na Vercel  
**Autenticação**: ✅ 100% funcional  
**Projetos**: ✅ CRUD completo  
**Documentos**: ✅ CRUD + Upload  
**Whiteboards**: ✅ Real-time colaborativo  
**Convites**: ✅ Aceitar/Recusar funcionando  
**Permissões**: ❌ **NÃO IMPLEMENTADAS**  

---

## 📞 COMO USAR ESTA DOCUMENTAÇÃO

### **Para IA/LLM**:
1. Ler **Parte 1** para entender arquitetura
2. Ler **Parte 2** para entender sistema atual de membros
3. Ler **Parte 3** para ver problemas críticos
4. Ler **Parte 4** para ver código de implementação sugerido
5. Propor melhorias ou implementar soluções

### **Para Desenvolvedor**:
1. Clonar repo: `git clone https://github.com/isacarioproject-ux/app.isacar.dev.git`
2. Ler as 4 partes da documentação
3. Configurar `.env.local` com credenciais Supabase
4. Rodar `npm install && npm run dev`
5. Implementar melhorias de permissões conforme Parte 4

---

## 🚀 PRIORIDADES DE IMPLEMENTAÇÃO

### **🔥 URGENTE (v1.4.0)**
1. Sistema de verificação de permissões
2. Helper `getProjectRole()` e `getPermissions()`
3. Hook `useProjectPermissions()`
4. Atualizar RLS policies com verificação de roles
5. Simplificar convites (decidir: org ou só projeto)

### **📈 IMPORTANTE (v1.5.0)**
6. Tabela `project_collaborators`
7. Implementar `ManageCollaboratorsDialog`
8. Notificações de email
9. Audit log
10. Fix `whiteboard.project_id` (TEXT → UUID)

### **🎁 BÔNUS (v2.0.0)**
11. Organizações (multi-tenant)
12. SSO
13. API pública
14. Integrações (Slack, etc)

---

## 📧 INFORMAÇÕES DE ACESSO

**Supabase**: https://jjeudthfiqvvauuqnezs.supabase.co  
**Vercel**: https://app-isacar-dev.vercel.app  
**GitHub**: https://github.com/isacarioproject-ux/app.isacar.dev.git  

---

## ⚠️ AVISO IMPORTANTE

Este documento contém **TODA a lógica e código** do sistema ISACAR v1.3.0.  
As credenciais hardcoded no `supabase.ts` são **anon keys públicas** (seguro).  
As **secret keys** NÃO estão neste documento.

---

**Criado em**: Novembro 2024  
**Última Atualização**: v1.3.0  
**Objetivo**: Documentar sistema completo para implementar permissões robustas

---

**FIM DO DOCUMENTO PRINCIPAL**
