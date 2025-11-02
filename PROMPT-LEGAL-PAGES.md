# 📋 PROMPT: Criação de Páginas Legais - ISACAR Platform

## 🎯 Objetivo
Criar páginas completas e profissionais de **Política de Privacidade** e **Termos de Uso** para a plataforma ISACAR, incluindo implementação React, rotas, e links no footer e formulário de registro.

---

## 📝 PARTE 1: Informações da Empresa (PREENCHER ANTES DE IMPLEMENTAR)

### 1. Informação Corporativa

**Nome da Empresa:**
```
[PREENCHER] Ex: ISACAR Technologies Ltda.
```

**Razão Social Completa:**
```
[PREENCHER] Ex: ISACAR Technologies Desenvolvimento de Software LTDA
```

**CNPJ/Tax ID:**
```
[PREENCHER] Ex: XX.XXX.XXX/0001-XX
```

**Endereço Completo:**
```
[PREENCHER] Ex: Rua Exemplo, 123, Sala 456
Bairro Centro, São Paulo - SP
CEP: 01234-567, Brasil
```

**Email de Contato (Suporte/Legal):**
```
[PREENCHER] Ex: legal@isacar.dev ou privacy@isacar.dev
```

**Website:**
```
[PREENCHER] Ex: https://isacar.dev
```

**Telefone de Contato (opcional):**
```
[PREENCHER] Ex: +55 (11) 1234-5678
```

---

### 2. Descrição do Serviço

**Descrição Principal da Plataforma:**
```
[PREENCHER] 
Ex: A ISACAR é uma plataforma SaaS de gestão de projetos e colaboração em equipe, 
oferecendo ferramentas para gerenciamento de documentos, analytics, whiteboard colaborativo, 
e integração de times distribuídos.
```

**Principais Funcionalidades Oferecidas:**
```
[PREENCHER - Marque as que se aplicam]
✅ Gestão de projetos
✅ Documentos colaborativos
✅ Analytics e relatórios
✅ Whiteboard digital
✅ Gestão de equipes
✅ Notificações em tempo real
✅ Sistema de assinaturas/billing
✅ Armazenamento de arquivos
✅ [Adicionar outras]
```

**Tipo de Dados Coletados:**
```
[PREENCHER - Marque todos que se aplicam]
✅ Email
✅ Nome completo
✅ Telefone (opcional)
✅ Senha (hash)
✅ Foto de perfil
✅ Informações de projeto/documentos criados
✅ Logs de atividade/analytics
✅ Dados de pagamento (via Stripe/outro)
✅ Cookies e dados de navegação
✅ Endereço IP
✅ [Adicionar outros]
```

---

### 3. Aspectos Legais e de Privacidade

**País/Jurisdição Principal:**
```
[PREENCHER] Ex: Brasil, Estados Unidos, União Europeia
```

**Conformidade com Regulamentações:**
```
[PREENCHER - Marque todas aplicáveis]
✅ LGPD (Lei Geral de Proteção de Dados - Brasil)
✅ GDPR (General Data Protection Regulation - EU)
✅ CCPA (California Consumer Privacy Act - USA)
✅ Outras: [especificar]
```

**Uso de Cookies:**
```
[PREENCHER]
✅ Sim - cookies essenciais
✅ Sim - cookies de analytics (Google Analytics, etc.)
✅ Sim - cookies de marketing
❌ Não usamos cookies
```

**Serviços de Terceiros Utilizados:**
```
[PREENCHER - Liste todos]
✅ Supabase (autenticação e banco de dados)
✅ Vercel/Netlify (hospedagem)
✅ Stripe (pagamentos) - [se aplicável]
✅ Google Analytics (analytics)
✅ SendGrid/AWS SES (email)
✅ [Adicionar outros]
```

**Retenção de Dados:**
```
[PREENCHER]
Quanto tempo mantemos os dados após cancelamento da conta?
Ex: 30 dias, 90 dias, até solicitação de exclusão
```

**Idade Mínima de Uso:**
```
[PREENCHER] Ex: 18 anos, 13 anos, 16 anos
```

---

### 4. Política de Uso e Restrições

**Conteúdo Proibido na Plataforma:**
```
[PREENCHER]
Ex: 
- Conteúdo ilegal, ofensivo ou discriminatório
- Spam ou atividades maliciosas
- Violação de propriedade intelectual
- [Adicionar outros]
```

**Limitações de Uso (Rate Limits, Storage, etc.):**
```
[PREENCHER]
Ex:
- Plano Free: 100 MB storage, 5 projetos
- Plano Pro: 10 GB storage, projetos ilimitados
- Rate limit de API: 1000 requisições/hora
```

**Política de Cancelamento e Reembolso:**
```
[PREENCHER]
Ex: Reembolso integral dentro de 7 dias. Após 7 dias, não há reembolso.
Cancelamento pode ser feito a qualquer momento pelo painel de configurações.
```

---

### 5. Responsabilidades e Limitações

**Garantias Oferecidas (SLA):**
```
[PREENCHER]
Ex: Uptime de 99.9%, suporte em até 24h úteis
```

**Limitação de Responsabilidade:**
```
[PREENCHER]
Ex: A empresa não se responsabiliza por perda de dados causada por 
ações do usuário, falhas de terceiros, ou eventos fora de nosso controle.
```

**Propriedade Intelectual:**
```
[PREENCHER]
Ex: O usuário mantém todos os direitos sobre o conteúdo que cria na plataforma.
A ISACAR mantém direitos sobre o código, design e funcionalidades da plataforma.
```

---

## 🏗️ PARTE 2: Estrutura de Implementação

### Arquivos que Serão Criados:

1. **Páginas React:**
   - `src/pages/privacy-policy.tsx`
   - `src/pages/terms-of-service.tsx`

2. **Componente de Footer:**
   - `src/components/footer.tsx`

3. **Atualização de Rotas:**
   - `src/App.tsx` (adicionar rotas)

4. **Atualização de Links:**
   - `src/components/auth-form-minimal.tsx` (linkar termos no checkbox)

---

## 🎨 Design das Páginas

### Layout Proposto:
```
┌─────────────────────────────────────┐
│  [Logo] ISACAR.DEV                  │
├─────────────────────────────────────┤
│                                     │
│  [Título: Privacy Policy]           │
│  Last Updated: [Data]               │
│                                     │
│  [Índice/Table of Contents]         │
│                                     │
│  [Conteúdo Estruturado]             │
│  - Seção 1: Introdução             │
│  - Seção 2: Dados Coletados        │
│  - Seção 3: Como Usamos            │
│  - etc...                          │
│                                     │
├─────────────────────────────────────┤
│  [Footer com links]                 │
└─────────────────────────────────────┘
```

### Características de Design:
- ✅ Responsivo (mobile-first)
- ✅ Modo claro e escuro
- ✅ Tipografia legível (fonte serifada para títulos)
- ✅ Índice clicável com scroll suave
- ✅ Seções bem separadas
- ✅ Links para outras páginas legais
- ✅ Data de última atualização visível

---

## 📑 Estrutura de Conteúdo

### POLÍTICA DE PRIVACIDADE - Seções:

1. **Introdução**
   - Quem somos
   - Comprometimento com privacidade

2. **Informações que Coletamos**
   - Dados fornecidos pelo usuário
   - Dados coletados automaticamente
   - Dados de terceiros

3. **Como Usamos Suas Informações**
   - Provimento do serviço
   - Comunicação
   - Melhorias e analytics
   - Marketing (se aplicável)

4. **Compartilhamento de Dados**
   - Serviços de terceiros
   - Requisitos legais
   - Transferência de negócio

5. **Segurança dos Dados**
   - Medidas técnicas
   - Criptografia
   - Controle de acesso

6. **Seus Direitos (LGPD/GDPR)**
   - Acesso
   - Correção
   - Exclusão
   - Portabilidade
   - Revogação de consentimento

7. **Cookies e Tecnologias de Rastreamento**
   - Tipos de cookies
   - Como desabilitar

8. **Retenção de Dados**
   - Período de armazenamento
   - Exclusão de conta

9. **Transferências Internacionais**
   - Se aplicável

10. **Crianças e Menores**
    - Idade mínima
    - Proteção de menores

11. **Atualizações desta Política**
    - Como notificamos mudanças

12. **Contato**
    - Email do DPO/Privacidade
    - Endereço

---

### TERMOS DE USO - Seções:

1. **Aceitação dos Termos**
   - Acordo vinculativo
   - Capacidade legal

2. **Descrição do Serviço**
   - O que oferecemos
   - Disponibilidade

3. **Cadastro e Conta**
   - Requisitos
   - Responsabilidades do usuário
   - Segurança da conta

4. **Uso Aceitável**
   - Condutas permitidas
   - Condutas proibidas
   - Consequências de violação

5. **Propriedade Intelectual**
   - Direitos da plataforma
   - Direitos do usuário sobre seu conteúdo
   - Licença concedida à plataforma

6. **Conteúdo do Usuário**
   - Responsabilidade pelo conteúdo
   - Moderação
   - Backup e perda de dados

7. **Planos e Pagamentos**
   - Tipos de plano
   - Política de pagamento
   - Renovação automática
   - Cancelamento e reembolso

8. **Limitação de Responsabilidade**
   - Isenções
   - Danos não cobertos
   - Limites monetários

9. **Garantias e Isenções**
   - Serviço "as is"
   - Disponibilidade não garantida

10. **Modificação dos Termos**
    - Direito de alterar
    - Notificação

11. **Rescisão**
    - Por parte do usuário
    - Por parte da empresa
    - Efeitos da rescisão

12. **Disputas e Lei Aplicável**
    - Jurisdição
    - Arbitragem (se aplicável)
    - Lei aplicável

13. **Disposições Gerais**
    - Cessão
    - Acordo integral
    - Separabilidade

14. **Contato**

---

## 🔗 Integração com a Aplicação

### 1. Links no Formulário de Registro

**Localização:** `src/components/auth-form-minimal.tsx` (linhas 528-535)

**Atualizar de:**
```tsx
<a href="#" className="text-primary hover:underline">
  Terms of Service
</a>
```

**Para:**
```tsx
<Link to="/terms-of-service" className="text-primary hover:underline">
  Terms of Service
</Link>
```

**E de:**
```tsx
<a href="#" className="text-primary hover:underline">
  Privacy Policy
</a>
```

**Para:**
```tsx
<Link to="/privacy-policy" className="text-primary hover:underline">
  Privacy Policy
</Link>
```

### 2. Footer em Todas as Páginas

**Criar componente:** `src/components/footer.tsx`

**Incluir em:**
- Dashboard Layout
- Páginas de auth
- Páginas públicas

**Conteúdo do Footer:**
```
┌──────────────────────────────────────────────┐
│  ISACAR.DEV                                  │
│                                              │
│  © 2025 ISACAR Technologies                 │
│  Privacy Policy | Terms of Service          │
│  Contact | Support                          │
└──────────────────────────────────────────────┘
```

### 3. Rotas no App.tsx

**Adicionar:**
```tsx
<Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
<Route path="/terms-of-service" element={<TermsOfServicePage />} />
```

---

## 🚀 Checklist de Implementação

Quando você receber todas as informações preenchidas, vou implementar:

- [ ] Criar `src/pages/privacy-policy.tsx` com conteúdo completo
- [ ] Criar `src/pages/terms-of-service.tsx` com conteúdo completo
- [ ] Criar `src/components/footer.tsx` com links
- [ ] Atualizar `src/App.tsx` com novas rotas
- [ ] Atualizar `src/components/auth-form-minimal.tsx` com Links
- [ ] Adicionar Footer no `src/components/dashboard-layout.tsx`
- [ ] Adicionar Footer em `src/pages/auth.tsx`
- [ ] Atualizar traduções i18n (se necessário)
- [ ] Testar navegação e responsividade
- [ ] Verificar modo claro/escuro
- [ ] Build e commit

---

## ⚠️ IMPORTANTE: Legal Disclaimer

**ATENÇÃO:** O conteúdo gerado será baseado em templates padrão e nas informações fornecidas, mas **NÃO SUBSTITUI REVISÃO JURÍDICA PROFISSIONAL**.

Recomendamos fortemente que você:
1. ✅ Consulte um advogado especializado em direito digital
2. ✅ Revise todos os termos com seu departamento jurídico
3. ✅ Adapte para sua jurisdição específica
4. ✅ Mantenha documentação de todas as versões

**Este prompt gera um ponto de partida sólido, mas você deve sempre validar juridicamente antes de publicar.**

---

## 📞 Próximos Passos

1. **VOCÊ PREENCHE**: Todas as seções marcadas com `[PREENCHER]` acima
2. **ME CONFIRMA**: "Pode implementar com essas informações"
3. **EU IMPLEMENTO**: Crio todas as páginas, componentes, rotas e links
4. **VOCÊ REVISA**: Com seu time jurídico antes de publicar

---

**Status:** ⏳ **AGUARDANDO INFORMAÇÕES**

Quando tiver preenchido as informações necessárias, me avise com: 
> "Pode implementar as páginas legais"

Ou se preferir, posso criar com **valores placeholder** que você ajusta depois?
