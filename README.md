# ISACAR.IO

Plataforma moderna de gestão com tema dark profissional.

## 🚀 Stack Tecnológica

- **Framework:** Vite + React 18
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Componentes UI:** Shadcn/ui + Radix UI
- **Ícones:** Lucide React
- **Animações:** Framer Motion
- **Validação:** Zod
- **Backend:** Supabase (Auth + Database + Storage)

## 🎨 Design System

### Tema Dark Moderno
- **Background:** slate-950, slate-900
- **Cards:** slate-800/50 com backdrop-blur-sm
- **Texto:** slate-50 (títulos), slate-400 (secundário)
- **Primary:** Gradiente indigo-500 → violet-500
- **Success:** emerald-500
- **Error:** red-500
- **Warning:** amber-500

### Logo ISACAR
Gradiente vibrante: azul → verde → amarelo → rosa

## 🛠️ Instalação

```bash
# Instalar dependências
npm install

# Criar arquivo de variáveis de ambiente
cp .env.example .env.local

# Configurar suas credenciais Supabase no .env.local

# Rodar servidor de desenvolvimento (porta 3005)
npm run dev
```

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── ui/              # Componentes Shadcn/ui
│   └── logo.tsx         # Logo ISACAR com gradiente
├── lib/
│   ├── utils.ts         # Utilitários (cn, etc)
│   └── validations.ts   # Schemas Zod
├── pages/
│   └── auth.tsx         # Tela de login/cadastro
├── App.tsx
├── main.tsx
└── index.css            # Tema e variáveis CSS
```

## 🔐 Segurança

- **RLS (Row Level Security)** ativo em todas as tabelas
- **Variáveis de ambiente** nunca commitadas
- **Validação** client e server-side
- **Autenticação** via Supabase Auth

## 📱 Responsividade

- **Mobile-first** design
- **Breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px)
- Totalmente adaptável a tablets e desktops

## 🎯 Próximas Features

- [ ] Dashboard com cards drag & drop
- [ ] Sidebar com navegação
- [ ] Fluxo completo de onboarding
- [ ] Página de projetos
- [ ] Analytics e gráficos
- [ ] Chat IA
- [ ] Sistema de notificações

## 📄 Licença

© 2025 ISACAR. Todos os direitos reservados.
