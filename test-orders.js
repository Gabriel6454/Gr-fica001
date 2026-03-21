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

async function listOrders() {
  const { data, error } = await supabase.from('orders').select('*');
  if (error) {
    console.error('Erro ao buscar pedidos:', error.message);
  } else {
    console.log(`Encontrados ${data.length} pedidos em /orders:`);
    console.dir(data, { depth: null });
  }
}

listOrders();
