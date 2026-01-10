import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hnkezsvlnwtlwyggindg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Necesitarás esta clave

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY no está configurada');
  console.log('Para obtener esta clave:');
  console.log('1. Ve a tu proyecto en https://supabase.com/dashboard');
  console.log('2. Ve a Settings > API');
  console.log('3. Copia la "service_role" key');
  console.log('4. Ejecuta: set SUPABASE_SERVICE_ROLE_KEY=tu_clave_aqui');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Iniciando configuración de la base de datos...');
    
    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Ejecutando migración inicial...');
    
    // Ejecutar la migración
    const { error: migrationError } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (migrationError) {
      console.error('❌ Error ejecutando migración:', migrationError);
      return;
    }
    
    console.log('✅ Migración ejecutada exitosamente');
    
    // Leer y ejecutar los datos de ejemplo
    const seedPath = path.join(__dirname, '..', 'supabase', 'seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    console.log('🌱 Insertando datos de ejemplo...');
    
    const { error: seedError } = await supabase.rpc('exec_sql', {
      sql: seedSQL
    });
    
    if (seedError) {
      console.error('❌ Error insertando datos de ejemplo:', seedError);
      return;
    }
    
    console.log('✅ Datos de ejemplo insertados exitosamente');
    console.log('🎉 ¡Base de datos configurada completamente!');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Función alternativa usando SQL directo
async function runMigrationDirect() {
  try {
    console.log('🚀 Iniciando configuración de la base de datos (método directo)...');
    
    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Ejecutando migración inicial...');
    
    // Dividir el SQL en statements individuales
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        if (error) {
          console.error('❌ Error en statement:', statement.substring(0, 100) + '...');
          console.error('Error:', error);
          continue;
        }
      }
    }
    
    console.log('✅ Migración ejecutada exitosamente');
    
    // Ejecutar datos de ejemplo
    const seedPath = path.join(__dirname, '..', 'supabase', 'seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    console.log('🌱 Insertando datos de ejemplo...');
    
    const seedStatements = seedSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of seedStatements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        if (error) {
          console.error('❌ Error en seed statement:', statement.substring(0, 100) + '...');
          console.error('Error:', error);
          continue;
        }
      }
    }
    
    console.log('✅ Datos de ejemplo insertados exitosamente');
    console.log('🎉 ¡Base de datos configurada completamente!');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar la migración
runMigrationDirect();