import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkDb() {
  console.log('Checking database tables...');
  const { data, error } = await supabase.from('fiis').select('id').limit(1);
  if (error) {
    console.error('Error selecting from fiis table:', error.message);
    if (error.message.includes('relation "public.fiis" does not exist')) {
        console.error('CRITICAL: Table "fiis" does not exist in the database.');
    }
  } else {
    console.log('Table "fiis" exists and is accessible.');
  }
}

checkDb();
