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

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOrder() {
  const dummyOrder = {
    id: Math.floor(100000 + Math.random() * 900000).toString(),
    customerName: 'Cliente Teste',
    total: 150,
    remainingAmount: 150,
    paid: false
  };

  const { error } = await supabase.from('orders').upsert(dummyOrder);
  if (error) {
    console.error('ERRO AO SALVAR:', error.message);
  } else {
    console.log('SUCESSO AO SALVAR PEDIDO!');
  }
}

testOrder();
