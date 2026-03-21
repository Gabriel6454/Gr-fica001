import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envData = fs.readFileSync(resolve(__dirname, '.env'), 'utf8');
const envStr = envData.split('\n');
let supabaseUrl = '';
let supabaseKey = '';
envStr.forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});


if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não definidos no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔄 Verificando conexão e permissões do banco (Supabase)...');
  
  // 1. Testar Listagem (Verifica se tabela existe e RLS de leitura)
  const { data: initialData, error: selectError } = await supabase.from('products').select('*').limit(1);
  if (selectError) {
    console.error('❌ Falha ao conectar na tabela products. Detalhes:');
    console.dir(selectError, { depth: null });
    process.exit(1);
  }
  console.log('✅ Conexão estabelecida com sucesso. Tabela "products" acessível.');

  // 2. Testar Inserção (Verifica RLS de inserção)
  const dummyProduct = {
    id: '00000000-0000-0000-0000-000000000000', // Mock UUID
    name: 'Teste de Integração Supabase',
    description: 'Produto de teste temporário para verificar conexão',
    category: 'Teste',
    costPrice: 10.0,
    margin: 50.0,
    salePrice: 15.0,
    imageUrl: '',
    totalSold: 0,
    totalProfit: 0,
    priceTiers: []
  };

  console.log('🔄 Tentando salvar produto de teste no banco de dados...');
  const { error: insertError } = await supabase.from('products').upsert(dummyProduct);
  
  if (insertError) {
    console.error('❌ Falha ao salvar produto no Supabase. Detalhes:', insertError.message);
    process.exit(1);
  }
  
  console.log('✅ Produto inserido com sucesso!');

  // 3. Testar Deleção (Limpeza + RLS de Exclusão)
  console.log('🔄 Limpando produto de teste...');
  const { error: deleteError } = await supabase.from('products').delete().eq('id', dummyProduct.id);
  
  if (deleteError) {
    console.error('❌ Produto inserido, mas falha ao deletar (verifique permissões de delete). Detalhes:', deleteError.message);
  } else {
    console.log('✅ Produto de teste removido com sucesso!');
  }

  console.log('🚀 TUDO PRONTO! O sistema está logado no Supabase e salvando perfeitamente!');
}

testConnection();
