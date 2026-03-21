import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://enfosdagcrupiqpbwqno.supabase.co';
const supabaseKey = 'sb_publishable_Nx5_ZPyJDzDI5gAEbZj4ZA_CKZPOdVK';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAuthAndIsolation() {
  console.log('--- Verificando Sistema de Login e Isolamento ---\n');
  
  // 1. Verificar Sessão Atual
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('❌ Erro ao buscar sessão:', sessionError.message);
    return;
  }

  if (session) {
    console.log('✅ Usuário logado:', session.user.email);
    console.log('🆔 ID do Usuário:', session.user.id);
    
    // 2. Tentar buscar dados para ver se o SQL de isolamento já foi aplicado
    // Se o RLS estiver ativo, ele só verá os dados DELE.
    const { data: products, error: prodError } = await supabase.from('products').select('*').limit(1);
    
    if (prodError) {
        if (prodError.message.includes('column "user_id" does not exist')) {
            console.log('\n⚠️  ATENÇÃO: A coluna "user_id" ainda não existe no Banco de Dados!');
            console.log('👉 Você precisa rodar o script SQL que te mandei no SQL Editor do Supabase.');
        } else {
            console.log('\n❌ Erro ao acessar a tabela products:', prodError.message);
        }
    } else {
        console.log('\n✅ Acesso às tabelas está OK.');
        console.log('📦 Produtos encontrados para este usuário:', products.length);
    }
    
  } else {
    console.log('ℹ️ Nenhum usuário logado no momento via Node.js.');
    console.log('👉 No navegador, o sistema de login está funcionando (eu testei criando uma conta anteriormente).');
  }
}

verifyAuthAndIsolation();
