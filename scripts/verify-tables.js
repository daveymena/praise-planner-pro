import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kqlolqqgeqgqzdtxmfwm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxbG9scXFnZXFncXpkdHhtZndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0NzE2NzQsImV4cCI6MjA1MzA0NzY3NH0.sb_publishable_j5cLODKxrfN1GLOF0-NE3g_Dpuboeu4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTables() {
  console.log('🔍 Verificando tablas en tu proyecto...');
  
  try {
    // Verificar members
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('count')
      .limit(1);
    
    if (membersError) {
      console.log('❌ Tabla members:', membersError.message);
    } else {
      console.log('✅ Tabla members: OK');
    }

    // Verificar songs
    const { data: songs, error: songsError } = await supabase
      .from('songs')
      .select('count')
      .limit(1);
    
    if (songsError) {
      console.log('❌ Tabla songs:', songsError.message);
    } else {
      console.log('✅ Tabla songs: OK');
    }

    // Verificar rehearsals
    const { data: rehearsals, error: rehearsalsError } = await supabase
      .from('rehearsals')
      .select('count')
      .limit(1);
    
    if (rehearsalsError) {
      console.log('❌ Tabla rehearsals:', rehearsalsError.message);
    } else {
      console.log('✅ Tabla rehearsals: OK');
    }

    console.log('');
    console.log('🎉 Si ves "OK" en todas las tablas, ¡todo está funcionando!');
    console.log('🔄 Recarga tu aplicación en http://localhost:8080');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verifyTables();