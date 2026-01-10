import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function testConnection() {
  console.log('🔍 Probando conexión a PostgreSQL...');
  console.log('');
  
  // Configuraciones a probar
  const configs = [
    {
      name: 'Configuración actual (.env)',
      config: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }
    },
    {
      name: 'Configuración EasyPanel con IP externa',
      config: {
        host: '164.68.122.3',
        port: 5434,
        database: 'alabanza',
        user: 'postgres',
        password: '67E5320Oet',
      }
    },
    {
      name: 'Configuración EasyPanel con host interno',
      config: {
        host: 'ollama_postgres-db',
        port: 5434,
        database: 'alabanza',
        user: 'postgres',
        password: '67E5320Oet',
      }
    }
  ];

  for (const { name, config } of configs) {
    console.log(`📋 Probando: ${name}`);
    console.log(`   Host: ${config.host}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   User: ${config.user}`);
    
    const pool = new Pool(config);
    
    try {
      const client = await pool.connect();
      console.log('✅ ¡Conexión exitosa!');
      
      // Probar una query simple
      const result = await client.query('SELECT version()');
      console.log(`📊 PostgreSQL Version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
      
      client.release();
      await pool.end();
      
      console.log('🎉 Esta configuración funciona!');
      console.log('');
      console.log('📝 Actualiza tu archivo server/.env con estos datos:');
      console.log(`DB_HOST=${config.host}`);
      console.log(`DB_PORT=${config.port}`);
      console.log(`DB_NAME=${config.database}`);
      console.log(`DB_USER=${config.user}`);
      console.log(`DB_PASSWORD=${config.password}`);
      
      return; // Salir si encontramos una configuración que funciona
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      await pool.end();
    }
    
    console.log('');
  }
  
  console.log('❌ Ninguna configuración funcionó.');
  console.log('');
  console.log('🔧 POSIBLES SOLUCIONES:');
  console.log('');
  console.log('1. 📡 Verifica que PostgreSQL esté corriendo en EasyPanel');
  console.log('2. 🔑 Confirma usuario y contraseña');
  console.log('3. 🌐 Si EasyPanel está en un servidor remoto, usa la IP externa');
  console.log('4. 🔒 Verifica que el puerto 5432 esté abierto');
  console.log('5. 📋 Revisa los logs de EasyPanel para más detalles');
}

testConnection().catch(console.error);