import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://enfosdagcrupiqpbwqno.supabase.co';
const supabaseKey = 'sb_publishable_Nx5_ZPyJDzDI5gAEbZj4ZA_CKZPOdVK';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIsolation() {
  console.log('--- VERIFICANDO CONFIGURAÇÃO DE ISOLAMENTO NO BANCO ---\n');
  
  // 1. Verificar se as colunas 'user_id' existem e se RLS está habilitado
  // Vamos tentar uma query que falharia se a coluna não existisse
  const tables = ['products', 'orders', 'customers', 'categories', 'settings', 'quick_messages'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('user_id').limit(1);
    
    if (error) {
      if (error.code === '42703') { // Column does not exist
        console.log(`❌ Tabela [${table}]: Coluna 'user_id' NÃO EXISTE.`);
      } else if (error.code === '42P01') { // Table does not exist
        console.log(`❌ Tabela [${table}]: NÃO EXISTE.`);
      } else {
        console.log(`⚠️ Tabela [${table}]: Erro inesperado: ${error.message}`);
      }
    } else {
      console.log(`✅ Tabela [${table}]: Coluna 'user_id' presente.`);
    }
  }

  console.log('\n--- VERIFICAÇÃO FINAL ---');
  console.log('Se todas as tabelas acima estiverem com "✅", significa que o banco está pronto.');
  console.log('Para que os dados parem de se misturar, você precisa garantir que rodou o comando SQL no painel do Supabase para ativar a segurança (RLS).');
}

checkIsolation();
