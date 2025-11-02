# AuthFormMinimal - Componente de Autenticação Minimalista

## 🎨 Design

Componente de autenticação com design limpo e minimalista, seguindo as melhores práticas de UX.

## ✨ Características

- **Design Minimalista**: Interface limpa e moderna
- **Responsivo**: Funciona perfeitamente em todos os dispositivos
- **Modo Escuro**: Suporte total para tema escuro
- **Validação em Tempo Real**: Feedback instantâneo para o usuário
- **Acessibilidade**: Seguindo padrões WCAG
- **TypeScript**: Totalmente tipado para segurança de tipos

## 📦 Funcionalidades

1. **Login**: Autenticação de usuários existentes
   - Email e senha
   - Lembrar-me
   - Esqueci minha senha

2. **Sign Up**: Registro de novos usuários
   - Nome completo
   - Email
   - Senha (com confirmação)
   - Telefone (opcional)
   - Aceite de termos

3. **Reset Password**: Recuperação de senha
   - Email para reset

## 🚀 Como Usar

### Uso Básico

```tsx
import { AuthFormMinimal } from '@/components/auth-form-minimal';

function App() {
  const handleSuccess = (userData) => {
    console.log('Login successful:', userData);
    // Redirecionar ou atualizar estado
  };

  return (
    <AuthFormMinimal
      onSuccess={handleSuccess}
      initialMode="login"
    />
  );
}
```

### Uso em Modal

```tsx
import { AuthModalExample } from '@/components/auth-modal-example';

function App() {
  return <AuthModalExample />;
}
```

### Props

```typescript
interface AuthFormMinimalProps {
  onSuccess?: (userData: { email: string; name?: string }) => void;
  onClose?: () => void;
  initialMode?: 'login' | 'signup' | 'reset';
  className?: string;
}
```

## 🎯 Integração com Backend

### Exemplo com Supabase

```tsx
import { supabase } from '@/lib/supabase';

const handleSuccess = async (userData: { email: string; name?: string }) => {
  // Para login
  const { data, error } = await supabase.auth.signInWithPassword({
    email: userData.email,
    password: formData.password,
  });

  // Para signup
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: formData.password,
    options: {
      data: {
        full_name: userData.name,
      },
    },
  });
};
```

### Exemplo com API Customizada

```tsx
const handleSuccess = async (userData: { email: string; name?: string }) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (data.success) {
      // Salvar token, redirecionar, etc.
      localStorage.setItem('token', data.token);
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

## 🔄 Substituindo o Componente Antigo

### Passo 1: Importar o novo componente

```tsx
// Antes
import { AuthForm } from '@/components/auth-form';

// Depois
import { AuthFormMinimal } from '@/components/auth-form-minimal';
```

### Passo 2: Substituir no código

```tsx
// Antes
<AuthForm onSuccess={handleSuccess} />

// Depois
<AuthFormMinimal onSuccess={handleSuccess} />
```

## 🎨 Customização de Cores

O componente usa classes Tailwind padrão. Para customizar:

```tsx
<AuthFormMinimal
  className="custom-styles"
  onSuccess={handleSuccess}
/>
```

Ou modificar diretamente as cores no arquivo `auth-form-minimal.tsx`:

```tsx
// Mudar cor do botão principal
className="bg-black dark:bg-white" // Linha do botão

// Mudar cor de destaque
className="text-blue-600" // Links e elementos de destaque
```

## 📱 Responsividade

O componente é totalmente responsivo e funciona em:
- Desktop (max-w-md)
- Tablet
- Mobile

## ♿ Acessibilidade

- Labels apropriados para screen readers
- Navegação por teclado
- Contraste adequado (WCAG AA)
- Mensagens de erro descritivas

## 🔒 Segurança

- Validação client-side
- Máscaramento de senha
- Validação de formato de email
- Requisitos de senha configuráveis

## 📝 Notas

- O componente antigo `auth-form.tsx` foi mantido intacto
- Você pode usar ambos os componentes simultaneamente
- Migre gradualmente de um para outro

## 🐛 Troubleshooting

### Estilo não está aplicando
Certifique-se de que o Tailwind CSS está configurado corretamente.

### Validação não funciona
Verifique se você está passando os dados corretos para `onSuccess`.

### Dark mode não funciona
Certifique-se de ter o provedor de tema configurado.

## 📞 Suporte

Se tiver problemas ou sugestões, abra uma issue no repositório.
