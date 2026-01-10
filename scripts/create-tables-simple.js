import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://hnkezsvlnwtlwyggindg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhua2V6c3Zsbnd0bHd5Z2dpbmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5OTc4MDUsImV4cCI6MjA4MzU3MzgwNX0.uWgN-j3TgICuC07Rds03EMyXLVZwYxAdczIauGSCbBw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('🚀 Intentando crear tablas...');
  
  // Crear tabla simple de prueba
  const createMembersTable = `
    CREATE TABLE IF NOT EXISTS members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE,
      phone VARCHAR(20),
      role VARCHAR(50) NOT NULL,
      instruments TEXT[],
      voice_type VARCHAR(20),
      is_active BOOLEAN DEFAULT true,
      joined_date DATE DEFAULT CURRENT_DATE,
      notes TEXT,
      avatar_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: createMembersTable });
    
    if (error) {
      console.error('❌ Error creando tabla:', error);
      console.log('');
      console.log('🔑 NECESITAS PERMISOS DE ADMINISTRADOR');
      console.log('');
      console.log('📋 SOLUCIÓN FÁCIL:');
      console.log('1. Ve a https://supabase.com/dashboard');
      console.log('2. Busca tu proyecto: hnkezsvlnwtlwyggindg');
      console.log('3. Ve a "SQL Editor"');
      console.log('4. Copia y pega el contenido de: supabase/migrations/001_initial_schema.sql');
      console.log('5. Haz clic en "Run"');
      console.log('6. Luego copia y pega: supabase/seed.sql');
      console.log('7. Haz clic en "Run" otra vez');
      console.log('');
      console.log('¡Y listo! Las tablas estarán creadas.');
    } else {
      console.log('✅ Tabla creada exitosamente');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTables();