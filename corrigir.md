CORRIGIR REDIRECT URI NO GOOGLE LOGIN

Arquivo: src/components/auth/google-login-button.tsx

PROBLEMA: redirectTo está usando window.location.origin (localhost)
SOLUÇÃO: Remover redirectTo para usar URL padrão do Supabase

SUBSTITUIR ESTA PARTE:
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
})
```

POR ESTE CÓDIGO:
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
})
```

Apenas REMOVER a linha redirectTo, manter o resto igual.

Salvar e me avisar quando terminar.