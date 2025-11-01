// Script para verificar se variáveis existem durante o build
console.log('========================================');
console.log('🔍 VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE');
console.log('========================================');

const hasUrl = !!process.env.VITE_SUPABASE_URL;
const hasKey = !!process.env.VITE_SUPABASE_ANON_KEY;

console.log('VITE_SUPABASE_URL:', hasUrl ? '✅ EXISTE' : '❌ NÃO EXISTE');
console.log('VITE_SUPABASE_ANON_KEY:', hasKey ? '✅ EXISTE' : '❌ NÃO EXISTE');

if (hasUrl) {
  console.log('URL (primeiros 30 chars):', process.env.VITE_SUPABASE_URL.substring(0, 30) + '...');
}

console.log('========================================');

if (!hasUrl || !hasKey) {
  console.error('❌ ERRO: Variáveis não encontradas!');
  console.error('Verifique o Dashboard da Vercel → Settings → Environment Variables');
  process.exit(1);
}

console.log('✅ Variáveis OK! Continuando build...');
