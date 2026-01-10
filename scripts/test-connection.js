import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnkezsvlnwtlwyggindg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhua2V6c3Zsbnd0bHd5Z2dpbmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5OTc4MDUsImV4cCI6MjA4MzU3MzgwNX0.uWgN-j3TgICuC07Rds03EMyXLVZwYxAdczIauGSCbBw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔍 Probando conexión con Supabase...');
    
    // Probar conexión básica
    const { data, error } = await supabase.from('members').select('count').limit(1);
    
    if (error) {
      console.log('❌ Error (esperado si las tablas no existen):', error.message);
      console.log('📋 Código de error:', error.code);
      
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('✅ Conexión exitosa - Las tablas simplemente no existen aún');
        console.log('🚀 Necesitamos ejecutar las migraciones');
        return true;
      }
    } else {
      console.log('✅ Conexión exitosa y tablas existen:', data);
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return false;
  }
}

testConnection();