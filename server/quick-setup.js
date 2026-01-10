import { getDatabase } from './config/sqlite-database.js';

async function quickSetup() {
  console.log('🚀 Configuración rápida con SQLite...');
  
  try {
    const db = await getDatabase();
    
    console.log('📄 Creando tablas...');
    
    // Crear tablas básicas para SQLite
    await db.exec(`
      -- Members table
      CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        role TEXT NOT NULL,
        instruments TEXT, -- JSON string
        voice_type TEXT,
        is_active BOOLEAN DEFAULT 1,
        joined_date DATE DEFAULT CURRENT_DATE,
        notes TEXT,
        avatar_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Songs table
      CREATE TABLE IF NOT EXISTS songs (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        key TEXT NOT NULL,
        tempo TEXT NOT NULL,
        is_favorite BOOLEAN DEFAULT 0,
        lyrics TEXT,
        chords TEXT,
        notes TEXT,
        audio_url TEXT,
        sheet_music_url TEXT,
        youtube_url TEXT,
        duration_minutes INTEGER,
        created_by TEXT REFERENCES members(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Rehearsals table
      CREATE TABLE IF NOT EXISTS rehearsals (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        date DATE NOT NULL,
        time TIME NOT NULL,
        location TEXT NOT NULL,
        type TEXT NOT NULL,
        notes TEXT,
        is_completed BOOLEAN DEFAULT 0,
        created_by TEXT REFERENCES members(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Ministry rules table
      CREATE TABLE IF NOT EXISTS ministry_rules (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT,
        order_position INTEGER,
        is_active BOOLEAN DEFAULT 1,
        created_by TEXT REFERENCES members(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('🌱 Insertando datos de ejemplo...');
    
    // Insertar datos de ejemplo
    await db.exec(`
      -- Insert sample members
      INSERT OR IGNORE INTO members (id, name, email, phone, role, instruments, voice_type, notes) VALUES
      ('member1', 'Juan Pérez', 'juan@ministerio.com', '+1234567890', 'Director', '["Piano", "Guitarra"]', 'Tenor', 'Director musical principal'),
      ('member2', 'María González', 'maria@ministerio.com', '+1234567891', 'Vocalista', '[]', 'Soprano', 'Voz principal femenina'),
      ('member3', 'Pedro Rodríguez', 'pedro@ministerio.com', '+1234567892', 'Instrumentista', '["Batería"]', null, 'Baterista principal'),
      ('member4', 'Ana López', 'ana@ministerio.com', '+1234567893', 'Vocalista', '["Guitarra"]', 'Alto', 'Vocalista y guitarrista'),
      ('member5', 'Luis Martín', 'luis@ministerio.com', '+1234567894', 'Instrumentista', '["Bajo"]', 'Bajo', 'Bajista y coros');

      -- Insert sample songs
      INSERT OR IGNORE INTO songs (id, name, type, key, tempo, is_favorite, lyrics, notes, duration_minutes, created_by) VALUES
      ('song1', 'Cristo Vive', 'Alabanza', 'D', 'Rápido', 1, 'Cristo vive, Cristo reina, Cristo volverá...', 'Excelente para apertura de servicio', 4, 'member1'),
      ('song2', 'Digno es el Señor', 'Adoración', 'G', 'Moderado', 1, 'Digno es el Señor de recibir la gloria...', 'Muy poderosa para adoración', 5, 'member1'),
      ('song3', 'Santo Espíritu', 'Ministración', 'F', 'Lento', 0, 'Santo Espíritu ven, llena este lugar...', 'Para momentos de ministración profunda', 6, 'member2'),
      ('song4', 'Gracia Sublime', 'Adoración', 'C', 'Lento', 0, 'Sublime gracia del Señor...', 'Clásico himno', 4, 'member1'),
      ('song5', 'Tu Gracia', 'Ministración', 'E', 'Lento', 1, 'Tu gracia me alcanzó...', 'Muy emotiva', 5, 'member4'),
      ('song6', 'Grande es el Señor', 'Alabanza', 'A', 'Rápido', 0, 'Grande es el Señor y digno de suprema alabanza...', 'Energética', 3, 'member1'),
      ('song7', 'Cuan Grande es Él', 'Congregacional', 'G', 'Moderado', 1, 'Señor mi Dios, al contemplar los cielos...', 'Himno tradicional muy conocido', 4, 'member1'),
      ('song8', 'Aleluya', 'Alabanza', 'F', 'Rápido', 1, 'Aleluya, aleluya, al Señor cantad...', 'Muy alegre', 3, 'member4');

      -- Insert sample rehearsals
      INSERT OR IGNORE INTO rehearsals (id, date, time, location, type, notes, created_by) VALUES
      ('rehearsal1', '2025-01-16', '19:30', 'Templo Principal', 'General', 'Ensayo para servicio del domingo', 'member1'),
      ('rehearsal2', '2025-01-18', '16:00', 'Sala de Ensayo', 'Vocal', 'Trabajar armonías nuevas', 'member2'),
      ('rehearsal3', '2025-01-23', '19:30', 'Templo Principal', 'General', 'Preparación servicio especial', 'member1');

      -- Insert ministry rules
      INSERT OR IGNORE INTO ministry_rules (id, title, content, category, order_position, created_by) VALUES
      ('rule1', 'Puntualidad en Ensayos', 'Todos los integrantes deben llegar 15 minutos antes del horario establecido para el ensayo.', 'Ensayos', 1, 'member1'),
      ('rule2', 'Vestimenta para Servicios', 'La vestimenta debe ser formal y apropiada para el servicio. Colores sobrios y elegantes.', 'Servicios', 1, 'member1'),
      ('rule3', 'Preparación Personal', 'Cada integrante debe estudiar las canciones asignadas antes del ensayo.', 'Ensayos', 2, 'member1'),
      ('rule4', 'Actitud de Adoración', 'Mantener una actitud de reverencia y adoración durante los servicios.', 'Servicios', 2, 'member1');
    `);

    console.log('✅ Configuración completada!');
    console.log('📊 Datos insertados:');
    
    const counts = await db.all(`
      SELECT 
        (SELECT COUNT(*) FROM members) as members,
        (SELECT COUNT(*) FROM songs) as songs,
        (SELECT COUNT(*) FROM rehearsals) as rehearsals,
        (SELECT COUNT(*) FROM ministry_rules) as rules
    `);
    
    console.log(`   👥 Members: ${counts[0].members}`);
    console.log(`   🎵 Songs: ${counts[0].songs}`);
    console.log(`   🎤 Rehearsals: ${counts[0].rehearsals}`);
    console.log(`   📋 Rules: ${counts[0].rules}`);
    console.log('');
    console.log('🎉 ¡Base de datos SQLite lista!');
    console.log('🚀 Ahora puedes ejecutar: npm run server:dev');
    
  } catch (error) {
    console.error('❌ Error en configuración:', error);
  }
}

quickSetup();