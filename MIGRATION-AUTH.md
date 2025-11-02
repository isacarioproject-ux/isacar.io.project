# Guia de Migração - Auth Form

## 🔄 Migração Rápida do Componente de Autenticação

Este guia mostra como migrar do componente antigo `AuthForm` para o novo `AuthFormMinimal`.

## ⚡ Migração em 3 Passos

### 1️⃣ Encontre onde o AuthForm está sendo usado

```bash
# Buscar usos do componente antigo
grep -r "AuthForm" src/
```

### 2️⃣ Substitua os imports

```tsx
// ❌ ANTES
import { AuthForm } from '@/components/auth-form';

// ✅ DEPOIS
import { AuthFormMinimal } from '@/components/auth-form-minimal';
```

### 3️⃣ Substitua o componente

```tsx
// ❌ ANTES
<AuthForm
  onSuccess={handleSuccess}
  onClose={handleClose}
  initialMode="login"
  className="custom-class"
/>

// ✅ DEPOIS
<AuthFormMinimal
  onSuccess={handleSuccess}
  onClose={handleClose}
  initialMode="login"
  className="custom-class"
/>
```

## 📋 Checklist de Compatibilidade

As props são **100% compatíveis**:

- ✅ `onSuccess` - Mantém mesma assinatura
- ✅ `onClose` - Mantém mesma assinatura
- ✅ `initialMode` - Mantém mesmas opções ('login' | 'signup' | 'reset')
- ✅ `className` - Mantém mesmo comportamento

## 🎨 Diferenças Visuais

### Componente Antigo
- Design mais complexo
- Múltiplas etapas de registro
- Indicador de força de senha
- Mais campos e opções

### Componente Novo (Minimal)
- Design limpo e minimalista
- Fluxo simplificado
- Interface moderna
- Foco na experiência do usuário

## 🔍 Exemplo Prático

### Antes (auth-form.tsx)

```tsx
import { AuthForm } from '@/components/auth-form';

export function LoginPage() {
  const handleSuccess = (userData: { email: string; name?: string }) => {
    console.log('Login successful:', userData);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl">
        <AuthForm
          onSuccess={handleSuccess}
          initialMode="login"
        />
      </div>
    </div>
  );
}
```

### Depois (auth-form-minimal.tsx)

```tsx
import { AuthFormMinimal } from '@/components/auth-form-minimal';

export function LoginPage() {
  const handleSuccess = (userData: { email: string; name?: string }) => {
    console.log('Login successful:', userData);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
        <AuthFormMinimal
          onSuccess={handleSuccess}
          initialMode="login"
        />
      </div>
    </div>
  );
}
```

## 🎯 Casos de Uso Comuns

### 1. Modal de Login

```tsx
import { useState } from 'react';
import { AuthFormMinimal } from '@/components/auth-form-minimal';
import { X } from 'lucide-react';

export function LoginModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Login</button>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4">
              <X />
            </button>
            <AuthFormMinimal
              onSuccess={(data) => {
                console.log(data);
                setIsOpen(false);
              }}
              onClose={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
```

### 2. Página Dedicada de Login

```tsx
import { AuthFormMinimal } from '@/components/auth-form-minimal';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();

  const handleSuccess = (userData: { email: string; name?: string }) => {
    // Salvar no contexto de autenticação
    // Redirecionar para dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthFormMinimal onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
```

### 3. Com Integração Supabase

```tsx
import { AuthFormMinimal } from '@/components/auth-form-minimal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';

export function AuthPage() {
  const { setUser } = useAuth();

  const handleSuccess = async (userData: { email: string; name?: string }) => {
    try {
      // Obter usuário atual do Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  return <AuthFormMinimal onSuccess={handleSuccess} />;
}
```

## 🔐 Integração com Backend

### Supabase

```tsx
// No componente
const handleSubmit = async (formData) => {
  if (authMode === 'login') {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });
  } else if (authMode === 'signup') {
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { full_name: formData.name },
      },
    });
  }
};
```

### API REST

```tsx
const handleSubmit = async (formData) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.email,
      password: formData.password,
    }),
  });

  const data = await response.json();
  
  if (data.token) {
    localStorage.setItem('token', data.token);
    onSuccess?.(data.user);
  }
};
```

## 🧪 Testando a Migração

### 1. Teste Visual
- Abra a página com o novo componente
- Verifique se o design está correto
- Teste no modo claro e escuro
- Teste em diferentes tamanhos de tela

### 2. Teste Funcional
- Tente fazer login
- Tente criar conta
- Teste a recuperação de senha
- Verifique validações de formulário

### 3. Teste de Integração
- Verifique se o `onSuccess` é chamado
- Confirme que os dados estão corretos
- Teste redirecionamentos
- Verifique persistência de dados

## 📝 Notas Importantes

1. **Componente Antigo Mantido**: O arquivo `auth-form.tsx` original foi mantido intacto
2. **Migração Gradual**: Você pode migrar página por página
3. **Sem Breaking Changes**: As props são compatíveis
4. **Rollback Fácil**: Basta reverter o import se necessário

## 🚀 Próximos Passos

1. ✅ Testar o novo componente em ambiente de desenvolvimento
2. ✅ Migrar uma página por vez
3. ✅ Validar funcionalidades
4. ✅ Remover componente antigo quando toda migração estiver completa

## ❓ FAQ

**Q: Posso usar os dois componentes simultaneamente?**
A: Sim! O componente antigo foi mantido intacto.

**Q: Preciso mudar minha lógica de autenticação?**
A: Não, as callbacks mantêm a mesma assinatura.

**Q: O que acontece com o componente antigo?**
A: Ele permanece no projeto. Você pode removê-lo quando completar a migração.

**Q: Como desfazer a migração?**
A: Basta reverter os imports para `AuthForm`.

## 🛠️ Suporte

Se encontrar problemas durante a migração, verifique:
1. Imports corretos
2. Props passadas corretamente
3. Tailwind CSS configurado
4. Dark mode provider (se usar)

---

✨ **Migração completa! Aproveite seu novo componente minimalista.**
