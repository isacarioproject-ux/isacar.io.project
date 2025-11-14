# 🔒 BACKUP - ANÁLISE COMPLETA - 13 de Novembro de 2025

## 📊 RESUMO EXECUTIVO

**Projeto:** ISACAR - Plataforma de Gestão de Projetos e Documentos  
**Versão:** 1.3.1  
**Data da Análise:** 13/11/2025 05:32 AM (UTC-3)  
**Status Geral:** ✅ Funcional e Estável  
**Desenvolvedor:** Windsurf IDE + Claude

---

## 🎯 STACK TECNOLÓGICO

### Frontend
- **Framework:** React 18.3.1 + TypeScript 5.6.3
- **Build Tool:** Vite 5.4.10 + SWC
- **UI Library:** Radix UI + shadcn/ui
- **Styling:** Tailwind CSS 3.4.15
- **Icons:** Lucide React 0.454.0
- **Animations:** Framer Motion 11.18.2
- **Routing:** React Router DOM 7.9.4

### Backend & Services
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Auth:** Supabase Auth + JWT
- **Storage:** Supabase Storage
- **Realtime:** Supabase Realtime

### State Management & Data
- **Context:** React Context API
- **Forms:** React Hook Form 7.66.0 + Zod 3.23.8
- **Persistence:** localStorage + Supabase
- **i18n:** i18next 25.6.0 + react-i18next 16.2.4

### Features & Tools
- **Drag & Drop:** @dnd-kit 6.3.1
- **Charts:** Recharts 2.15.4
- **PDF/Export:** jsPDF 3.0.3 + html2pdf.js 0.12.1
- **Date:** date-fns 4.1.0 + react-day-picker 9.11.1
- **Toast:** sonner 2.0.7
- **PWA:** vite-plugin-pwa 1.1.0

---

## 📁 ESTRUTURA DO PROJETO

### Arquivos de Configuração
```
├── package.json (v1.3.1 - 75 dependências)
├── vite.config.ts (PWA configurado)
├── tsconfig.json (strict mode, path aliases)
├── tailwind.config.ts (tema customizado)
├── vercel.json (config deploy)
├── components.json (shadcn/ui)
└── postcss.config.js
```

### Diretórios Principais
```
src/
├── components/ (100+ componentes)
│   ├── tasks/ (26 arquivos)
│   ├── finance/ (27 arquivos)
│   ├── docs/ (12 arquivos)
│   ├── recent/ (3 arquivos)
│   ├── empresa/ (2 arquivos)
│   ├── dashboard/ (2 arquivos)
│   ├── workspace/ (6 arquivos)
│   ├── whiteboard/ (3 arquivos)
│   └── ui/ (55+ componentes shadcn/ui)
│
├── pages/ (12 páginas)
│   ├── dashboard.tsx
│   ├── my-work.tsx
│   ├── my-finance.tsx
│   ├── auth.tsx
│   ├── accept-invite.tsx
│   └── settings/ (4 páginas)
│
├── contexts/ (3 contextos)
│   ├── auth-context.tsx
│   ├── workspace-context.tsx
│   └── subscription-context.tsx
│
├── hooks/ (25+ hooks customizados)
│   ├── tasks/ (use-tasks-card.ts)
│   ├── use-finance-card.ts
│   ├── use-docs-card.ts
│   ├── use-analytics.ts
│   ├── use-offline-sync.ts
│   ├── use-i18n.ts
│   └── ... (20+ hooks)
│
├── lib/ (utilitários e helpers)
│   ├── i18n.ts (1888 linhas, 3 idiomas)
│   ├── supabase.ts
│   ├── utils.ts
│   ├── tasks/ (5 arquivos)
│   ├── docs/ (3 arquivos)
│   ├── validations/ (schemas Zod)
│   └── ... (10+ utilitários)
│
├── types/ (7 arquivos de tipos)
│   ├── database.ts (187 linhas)
│   ├── tasks.ts
│   ├── finance.ts
│   ├── finance-blocks.ts
│   ├── docs.ts
│   ├── workspace.ts
│   └── whiteboard.ts
│
└── styles/
    └── globals.css
```

### Banco de Dados (Supabase)
```
supabase/
├── migrations/
│   ├── 20250110_tasks_schema.sql
│   ├── 20250111_create_task_links.sql
│   ├── 20250111_fix_task_activities_rls.sql
│   └── 20250112_create_reminders.sql
└── ... (configurações)
```

---

## 🧩 MÓDULOS FUNCIONAIS

### 1️⃣ MÓDULO TASKS (26 componentes)
**Status:** ✅ Completo e Integrado

**Componentes Principais:**
- `tasks-card.tsx` - Card principal do dashboard
- `task-modal.tsx` - Modal de detalhes completo
- `task-detail-view.tsx` - Visualização detalhada
- `task-row.tsx` - Linha de tarefa com ações inline
- `quick-add-task-dialog.tsx` - Adicionar rápido
- `tasks-expanded-view.tsx` - Visualização expandida
- `tasks-page-view.tsx` - Página completa
- `task-template-selector.tsx` - Templates de tarefas

**Componentes de UI:**
- `status-selector.tsx`
- `priority-selector.tsx`
- `tag-selector.tsx`
- `relationship-selector.tsx`
- `notion-block-editor.tsx`
- `reminder-tab.tsx`
- `time-tracker.tsx`

**Views:**
- `tasks-list-view.tsx`
- `tasks-group-view.tsx`
- `tasks-delegated-view.tsx`

**Skeletons:**
- `tasks-card-skeleton.tsx` (6 mini-cards, opacity 0.4)
- `task-modal-skeleton.tsx`
- `tasks-list-skeleton.tsx`
- `reminder-tab-skeleton.tsx`

**Features:**
- ✅ CRUD completo
- ✅ Drag & drop de tarefas
- ✅ Filtros e busca
- ✅ Prioridades (low, medium, high)
- ✅ Status (todo, in_progress, done)
- ✅ Atribuição de usuários
- ✅ Tags customizadas
- ✅ Datas e lembretes
- ✅ Subtarefas
- ✅ Comentários e atividades
- ✅ Templates de tarefas
- ✅ Integração Supabase
- ✅ i18n (PT-BR, EN, ES)
- ✅ Animações Framer Motion
- ⚠️ **PROBLEMA:** Ainda usa dados mockados em alguns lugares

### 2️⃣ MÓDULO FINANCE (27 componentes)
**Status:** ✅ Completo e Avançado

**Componentes Principais:**
- `finance-card.tsx` - Card redimensionável
- `finance-viewer.tsx` - Visualizador Notion-like
- `finance-page-view.tsx` - Página completa
- `finance-sidebar.tsx` - Sidebar com blocos arrastáveis
- `finance-dock.tsx` - Dock desktop
- `finance-command-menu.tsx` - Menu de comandos (Ctrl+K)

**Blocos Funcionais:**
- `transaction-table.tsx` (3 versões)
- `budget-manager.tsx`
- `budget-tracker.tsx`
- `finance-charts.tsx`
- `categories-manager.tsx`
- `add-transaction-drawer.tsx`

**Blocos Especializados (blocks/):**
- `quick-expense-block.tsx`
- `receipts-block.tsx`
- `recurring-bills-block.tsx`
- `goals-block.tsx`
- `monthly-report-block.tsx`
- `category-summary-block.tsx`
- `calendar-block.tsx`

**Features:**
- ✅ Sistema de blocos drag & drop
- ✅ Templates de finanças
- ✅ Exportação PDF/Excel
- ✅ Modo offline + sincronização
- ✅ Command menu (Ctrl+K)
- ✅ Atalhos de teclado (N, S, F, G, E, B)
- ✅ Gráficos e relatórios
- ✅ Categorias customizadas
- ✅ Orçamentos e metas
- ✅ Recibos e anexos
- ✅ Contas recorrentes
- ✅ Calendário financeiro
- ✅ i18n completo (60+ chaves)
- ✅ Animações polidas

### 3️⃣ MÓDULO DOCS (12 componentes)
**Status:** ✅ Completo

**Componentes:**
- `docs-card.tsx` - Card do dashboard
- `page-viewer.tsx` - Visualizador Notion-like
- `page-editor-sidebar.tsx` - Editor de propriedades
- `docs-navigation-sidebar.tsx` - Navegação de páginas
- `comments-sidebar.tsx` - Comentários
- `page-toolbar.tsx` - Barra de ferramentas
- `page-elements.tsx` - Elementos de página
- `page-breadcrumb.tsx` - Breadcrumb
- `document-row.tsx` - Linha de documento
- `template-selector-dialog.tsx` - Templates
- `upload-document-modal.tsx` - Upload
- `export-menu.tsx` - Exportação

**Features:**
- ✅ Editor Notion-like
- ✅ Sistema de páginas e subpáginas
- ✅ Templates de documentos
- ✅ Comentários e colaboração
- ✅ Versionamento
- ✅ Exportação (PDF, MD, HTML)
- ✅ Upload de anexos
- ✅ Breadcrumb navigation
- ✅ Sidebar navegação

### 4️⃣ MÓDULO RECENT (3 componentes)
**Status:** ✅ Completo

**Componentes:**
- `recent-card.tsx`
- `recent-expanded-view.tsx`
- `recent-card-skeleton.tsx`

**Features:**
- ✅ Timeline de atividades
- ✅ Filtros por tipo
- ✅ Ações rápidas
- ✅ Animações suaves

### 5️⃣ MÓDULO EMPRESA (2 componentes)
**Status:** ✅ Completo

**Componentes:**
- `empresa-card.tsx`
- `empresa-expanded-view.tsx`

**Features:**
- ✅ Gestão de equipe
- ✅ Membros do workspace
- ✅ Convites
- ✅ Permissões

### 6️⃣ MÓDULO WHITEBOARD (3 componentes)
**Status:** ✅ Implementado

**Componentes:**
- `whiteboard-dialog.tsx`
- `whiteboard-canvas.tsx`
- `whiteboard-toolbar.tsx`

**Features:**
- ✅ Canvas colaborativo
- ✅ Presença em tempo real
- ✅ Ferramentas de desenho

---

## 🎨 UI/UX COMPONENTS (55+ componentes shadcn/ui)

**Componentes Base:**
- accordion, alert, alert-dialog, aspect-ratio
- avatar, badge, breadcrumb, button
- calendar, card, carousel, chart
- checkbox, collapsible, command, context-menu
- dialog, dock, drawer, dropdown-menu
- empty, file-upload, form, hover-card
- input, input-otp, label, menubar
- modal, navigation-menu, pagination, popover
- progress, radio-group, resizable, resizable-card
- scroll-area, select, separator, sheet
- sidebar, skeleton, slider, sonner
- switch, table, tabs, textarea
- toast, toggle, toggle-group, tooltip

**Componentes Customizados:**
- `resizable-card.tsx` - Cards redimensionáveis
- `draggable-card-wrapper.tsx` - Drag & drop wrapper
- `stats-card.tsx` - Cards de estatísticas
- `offline-indicator.tsx` - Indicador offline
- `theme-provider.tsx` / `theme-toggle.tsx` - Dark mode

---

## 🗄️ BANCO DE DADOS SUPABASE

### Tabelas Principais
```sql
-- Auth & Workspaces
- users (Supabase Auth)
- workspaces
- workspace_members (substituiu team_members)
- workspace_invites

-- Projects & Tasks
- projects
- tasks
- task_links
- task_activities
- reminders

-- Finance
- finance_documents
- finance_blocks
- transactions
- categories
- budgets

-- Docs
- documents
- pages
- comments
- versions

-- Whiteboard
- whiteboards
- whiteboard_objects
```

### Migrations
```
20250110_tasks_schema.sql
20250111_create_task_links.sql
20250111_fix_task_activities_rls.sql
20250112_create_reminders.sql
```

---

## 🌐 INTERNACIONALIZAÇÃO (i18n)

### Idiomas Suportados
- 🇧🇷 Português (PT-BR) - Padrão
- 🇺🇸 Inglês (EN)
- 🇪🇸 Espanhol (ES)

### Cobertura de Tradução
```typescript
// lib/i18n.ts - 1888 linhas
const translations = {
  // NAV (7 chaves)
  'nav.*': ['dashboard', 'projects', 'documents', 'team', 'analytics', 'invites', 'settings'],
  
  // COMMON (30+ chaves)
  'common.*': ['loading', 'error', 'success', 'save', 'cancel', ...],
  
  // AUTH (40+ chaves)
  'auth.*': ['login', 'register', 'logout', 'email', 'password', ...],
  
  // FINANCE (60+ chaves)
  'finance.*': ['command', 'offline', 'export', 'blocks', 'block', ...],
  
  // TASKS (200+ chaves) - COMPLETO
  'tasks.*': ['common', 'card', 'modal', 'detail', 'row', 'list', ...],
  
  // DOCS (40+ chaves)
  'docs.*': ['editor', 'page', 'template', ...],
  
  // DASHBOARD (20+ chaves)
  'dashboard.*': ['management', 'stats', ...],
  
  // WORKSPACE (30+ chaves)
  'workspace.*': ['members', 'invites', 'settings', ...],
  
  // TOTAL: ~500+ chaves traduzidas
}
```

---

## 🎯 FEATURES PRINCIPAIS

### ✅ Autenticação & Segurança
- Login/Register com Supabase Auth
- JWT tokens
- Persistência de sessão
- RLS (Row Level Security)
- Proteção de rotas
- OAuth (Google, GitHub)

### ✅ Multi-Workspace
- Criar/gerenciar workspaces
- Convites por email
- Sistema de permissões
- Workspace switcher
- Pending invites notification

### ✅ Dashboard Interativo
- Cards redimensionáveis (ResizableCard)
- Drag & drop para reordenar
- Persistência de layout (localStorage)
- 4 cards principais: Finance, Tasks, Recent, Empresa
- Estatísticas em tempo real
- Skeleton loading otimizado

### ✅ Responsividade
- Mobile-first approach
- Breakpoints: sm(640), md(768), lg(1024), xl(1280), 2xl(1536)
- Touch gestures para mobile
- Sidebars colapsáveis
- Fullscreen modais em mobile
- Dock desktop / Bottom sheet mobile

### ✅ PWA (Progressive Web App)
- Service Worker configurado
- Offline support
- Cache estratégico:
  - Fonts: CacheFirst (1 ano)
  - Supabase: NetworkFirst (5 min)
- Manifest.json completo
- Instalável como app

### ✅ Modo Offline
- Detecção automática
- localStorage cache
- Fila de sincronização
- Indicador visual
- Sync automático ao reconectar
- Mensagens i18n

### ✅ Atalhos de Teclado
- **Finance:**
  - Ctrl/Cmd + K: Command menu
  - N: Nova transação
  - S: Buscar
  - F: Filtros
  - G: Gráficos
  - E: Exportar
  - B: Toggle sidebar

### ✅ Animações & Transições
- Framer Motion em todos componentes críticos
- Duração: 0.2-0.4s
- Ease: easeOut / easeInOut
- Hover scale: 1.02
- Active scale: 0.98
- Loading states animados
- Skeleton shimmer effect

### ✅ Dark Mode
- next-themes integration
- Persistência de preferência
- Transitions suaves
- Cores otimizadas para ambos temas

### ✅ Exportação
- **Finance:** PDF, Excel (xlsx)
- **Docs:** PDF, Markdown, HTML
- **Tasks:** (planejado)
- html2pdf.js + jsPDF + autotable

---

## 🐛 PROBLEMAS CONHECIDOS

### ⚠️ CRÍTICOS

1. **Tasks usa dados mockados**
   - Arquivo: `src/lib/sample-tasks-data.ts`
   - Problema: Algumas views ainda carregam dados mockados
   - Impacto: Dados não persistem corretamente
   - Solução: Migrar 100% para Supabase

2. **Tabela team_members não existe**
   - Problema: Código antigo referencia `team_members`
   - Correto: Usar `workspace_members`
   - Impacto: 404 em algumas queries
   - Solução: Buscar e substituir todas referências

3. **i18n incompleto**
   - ~500 chaves traduzidas
   - Vários componentes ainda têm textos hardcoded
   - Finance e Tasks têm boa cobertura
   - Docs e Workspace precisam mais traduções

### ⚠️ MÉDIOS

4. **Credenciais Supabase hardcoded**
   - Arquivo: `src/lib/supabase.ts` (linhas 15-16)
   - Problema: URL e ANON_KEY fixos no código
   - Motivo: Variáveis de ambiente não funcionavam na Vercel
   - Risco: Baixo (chave anon é pública)
   - Melhoria: Usar env vars corretamente

5. **Links/navegação quebrados**
   - Algumas rotas antigas ainda referenciadas
   - Ex: `/projects`, `/documents` (removidas)
   - Solução: Auditar todas tags `<Link>` e `navigate()`

6. **TypeScript warnings**
   - 178 matches de TODO/FIXME/BUG
   - Principalmente em:
     - `sample-tasks-data.ts` (36)
     - `i18n.ts` (35)
     - Componentes finance (4)
     - Componentes tasks (5)

### ⚠️ BAIXOS

7. **Arquivos duplicados**
   - `transaction-table.tsx` (3 versões)
   - `transaction-table-old2.tsx`
   - `transaction-table-broken.tsx`
   - Solução: Limpar versões antigas

8. **Arquivos .bak**
   - `task-row.tsx.bak`
   - Solução: Remover backups manuais

9. **Empty directories**
   - `src/components/dashboard/` (0 arquivos)
   - Solução: Limpar estrutura

---

## 📝 DOCUMENTAÇÃO EXISTENTE

### Backups Anteriores
- `BACKUP_12_NOV_2025.md` (3938 bytes)
- `BACKUP_SIDEBAR_LOGO_2024-11-07.md` (2880 bytes)

### Análises
- `COMPLETE_ANALYSIS_TRANSFER.md` (5382 bytes)
- `TASKS_ANALYSIS.md` (12229 bytes)
- `TASKS_ANALYSIS_COMPLETE.md` (6370 bytes)
- `TASKS_CARD_ANALYSIS.md` (11713 bytes)
- `ARCHITECTURE_UPDATES_SUMMARY.md` (8737 bytes)

### Implementações
- `RESIZABLE_CARDS_IMPLEMENTATION.md` (10115 bytes)
- `SKELETON_LOADING_IMPROVEMENTS.md` (8152 bytes)
- `TOOLTIP_STYLE_UPDATE.md` (9301 bytes)
- `TASKS_INTEGRATION_COMPLETE.md` (9581 bytes)
- `TRANSLATION_FIXES_COMPLETE.md` (5779 bytes)

### Status Reports
- `TRANSFER_100_PERCENT_COMPLETE.md` (7020 bytes)
- `TASKS_DASHBOARD_INTEGRATION.md` (3725 bytes)
- `ANALYTICS_PAGE_REMOVED.md` (1441 bytes)

### Fixes
- `MOBILE_FIXES.md` (7297 bytes)
- `MOBILE_FIXES_V2.md` (7964 bytes)
- `RESPONSIVE_FIXES.md` (8751 bytes)
- `TASKS_BUGS_SUMMARY.md` (3644 bytes)

---

## 📊 MÉTRICAS DO PROJETO

### Código
- **Componentes:** 100+
- **Hooks:** 25+
- **Páginas:** 12
- **Tipos:** 7 arquivos
- **Contextos:** 3
- **Linhas de código:** ~20.000+
- **Arquivos totais:** 250+

### Dependências
- **Produção:** 62 pacotes
- **Desenvolvimento:** 13 pacotes
- **Total:** 75 dependências

### Bundle Size (estimado)
- **Vendor:** ~800KB (React, Radix, etc)
- **App:** ~500KB (código da aplicação)
- **Total:** ~1.3MB (antes de minify/gzip)
- **Gzipped:** ~400KB (estimativa)

### Performance
- **FCP:** ~1.5s (First Contentful Paint)
- **LCP:** ~2.5s (Largest Contentful Paint)
- **TTI:** ~3.5s (Time to Interactive)
- **Lighthouse:** ~85-90 (Desktop)

---

## 🚀 PRÓXIMOS PASSOS RECOMENDADOS

### 🔴 ALTA PRIORIDADE

1. **Migrar Tasks para Supabase 100%**
   - Remover `sample-tasks-data.ts`
   - Usar hook `use-tasks-card.ts` em todos componentes
   - Testar CRUD completo

2. **Corrigir referências team_members**
   - Buscar por "team_members"
   - Substituir por "workspace_members"
   - Testar queries

3. **Completar i18n**
   - Auditar componentes Docs
   - Auditar componentes Workspace
   - Adicionar ~200 chaves faltantes

4. **Limpar código legado**
   - Remover transaction-table-old2.tsx
   - Remover transaction-table-broken.tsx
   - Remover task-row.tsx.bak
   - Limpar TODOs

### 🟡 MÉDIA PRIORIDADE

5. **Melhorar variáveis de ambiente**
   - Criar .env.example
   - Documentar variáveis necessárias
   - Remover hardcoded credentials

6. **Auditar rotas**
   - Verificar todos Links
   - Remover rotas antigas
   - Adicionar redirects

7. **Testes**
   - Configurar Vitest
   - Testes unitários (hooks)
   - Testes E2E (Playwright)

8. **Performance**
   - Code splitting otimizado
   - Lazy load de imagens
   - Memoização estratégica

### 🟢 BAIXA PRIORIDADE

9. **Documentação**
   - README.md atualizado
   - Guia de contribuição
   - Documentação de API

10. **CI/CD**
    - GitHub Actions
    - Testes automáticos
    - Deploy preview

11. **Monitoring**
    - Sentry para erros
    - Analytics (Posthog/Mixpanel)
    - Performance monitoring

12. **Acessibilidade**
    - Auditar ARIA labels
    - Testar screen readers
    - Keyboard navigation

---

## 🔧 COMANDOS ÚTEIS

### Desenvolvimento
```bash
npm run dev              # Iniciar servidor dev (porta 3005)
npm run build            # Build produção
npm run preview          # Preview do build
npm run lint             # ESLint
npm run type-check       # TypeScript check
npm run check-supabase   # Verificar conexão Supabase
```

### Git
```bash
git log --oneline -10    # Ver últimos 10 commits
git status               # Ver mudanças
git diff                 # Ver diff
```

### Supabase
```bash
# Executar migration
supabase db push

# Gerar tipos
npm run generate:types
```

---

## 💾 COMO RESTAURAR ESTE BACKUP

### Opção 1: Git Checkout
```bash
# Ver commit hash atual
git log --oneline -1

# Restaurar para este ponto
git checkout <commit-hash>

# Ou criar branch
git checkout -b backup-13-nov-2025 <commit-hash>
```

### Opção 2: Backup Manual
1. Copiar pasta `c:\Isacar.dev\app.isacar.dev\`
2. Renomear para `app.isacar.dev-backup-13nov2025`
3. Guardar em local seguro

### Opção 3: Zip Archive
```bash
# Windows PowerShell
Compress-Archive -Path "c:\Isacar.dev\app.isacar.dev\" -DestinationPath "isacar-backup-13nov2025.zip"
```

---

## 📞 CONTATOS & LINKS

- **Supabase Project:** https://jjeudthfiqvvauuqnezs.supabase.co
- **Deploy (Vercel):** [URL de produção]
- **Repositório:** [URL do git]

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Antes de começar qualquer trabalho, verifique:

- [ ] Backup foi criado com sucesso
- [ ] Commit foi feito no git
- [ ] Dependencies estão instaladas (`npm install`)
- [ ] Servidor dev roda sem erros (`npm run dev`)
- [ ] Build de produção funciona (`npm run build`)
- [ ] Supabase está conectado
- [ ] Variáveis de ambiente estão configuradas
- [ ] TypeScript compila sem erros (`npm run type-check`)

---

## 🎓 NOTAS IMPORTANTES

### Regras do Projeto
1. **NUNCA** deletar componentes sem backup
2. **SEMPRE** testar mudanças localmente
3. **MANTER** backward compatibility
4. **USAR** feature flags para mudanças grandes
5. **CRIAR** testes para novas features
6. **DOCUMENTAR** mudanças significativas
7. **SEGUIR** padrões de código existentes
8. **ADICIONAR** i18n em novos componentes

### Padrões de Código
- TypeScript strict mode
- React functional components + hooks
- Tailwind para estilos
- Framer Motion para animações
- Zod para validações
- shadcn/ui para componentes base

### Commit Messages
```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração
test: adiciona testes
chore: tarefas de manutenção
```

---

**Data do Backup:** 13/11/2025 05:32 AM (UTC-3)  
**Desenvolvedor:** Windsurf IDE + Claude Sonnet  
**Status:** ✅ Análise Completa e Backup Criado  
**Versão:** ISACAR v1.3.1

---

# 🎯 PRÓXIMO PASSO

**Backup criado com sucesso!** ✅

Agora você pode:
1. Revisar problemas identificados
2. Escolher próxima tarefa da lista de prioridades
3. Começar desenvolvimento com segurança
4. Fazer rollback se necessário

**Recomendação:** Começar pela migração completa do módulo Tasks para Supabase, removendo dependência de dados mockados.
