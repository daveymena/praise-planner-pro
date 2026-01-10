import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

export async function getDatabase() {
  if (db) {
    return db;
  }

  const dbPath = path.join(__dirname, '..', 'database.sqlite');

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON');

  // Initialize tables if they don't exist
  await initializeTables();

  return db;
}

async function initializeTables() {
  const createTablesSQL = `
    -- Members table
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      instruments TEXT, -- JSON array
      role TEXT DEFAULT 'member',
      is_active INTEGER DEFAULT 1,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Songs table
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT DEFAULT 'worship', -- worship, special, hymn
      key TEXT,
      tempo INTEGER,
      is_favorite INTEGER DEFAULT 0,
      lyrics TEXT,
      chords TEXT,
      notes TEXT,
      youtube_url TEXT,
      duration_minutes INTEGER,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES members(id)
    );

    -- Rehearsals table
    CREATE TABLE IF NOT EXISTS rehearsals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date DATE NOT NULL,
      start_time TIME,
      end_time TIME,
      location TEXT,
      notes TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES members(id)
    );

    -- Services table
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date DATE NOT NULL,
      start_time TIME,
      end_time TIME,
      location TEXT,
      service_type TEXT DEFAULT 'regular', -- regular, special, conference
      notes TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES members(id)
    );

    -- Ministry Rules table
    CREATE TABLE IF NOT EXISTS ministry_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      order_position INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES members(id)
    );

    -- Rehearsal Songs (many-to-many)
    CREATE TABLE IF NOT EXISTS rehearsal_songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rehearsal_id INTEGER NOT NULL,
      song_id INTEGER NOT NULL,
      order_position INTEGER DEFAULT 0,
      leader_id INTEGER,
      notes TEXT,
      FOREIGN KEY (rehearsal_id) REFERENCES rehearsals(id) ON DELETE CASCADE,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
      FOREIGN KEY (leader_id) REFERENCES members(id)
    );

    -- Service Songs (many-to-many)
    CREATE TABLE IF NOT EXISTS service_songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER NOT NULL,
      song_id INTEGER NOT NULL,
      order_position INTEGER DEFAULT 0,
      leader_id INTEGER,
      notes TEXT,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
      FOREIGN KEY (leader_id) REFERENCES members(id)
    );

    -- Rehearsal Attendance
    CREATE TABLE IF NOT EXISTS rehearsal_attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rehearsal_id INTEGER NOT NULL,
      member_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending', -- confirmed, declined, pending
      notes TEXT,
      FOREIGN KEY (rehearsal_id) REFERENCES rehearsals(id) ON DELETE CASCADE,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
      UNIQUE(rehearsal_id, member_id)
    );

    -- Service Attendance
    CREATE TABLE IF NOT EXISTS service_attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER NOT NULL,
      member_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending', -- confirmed, declined, pending
      notes TEXT,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
      UNIQUE(service_id, member_id)
    );
  `;

  await db.exec(createTablesSQL);

  // Insert sample data if tables are empty
  await insertSampleData();
}

async function insertSampleData() {
  // Check if we already have data
  const memberCount = await db.get('SELECT COUNT(*) as count FROM members');
  if (memberCount.count > 0) {
    return; // Data already exists
  }

  console.log('🌱 Data seeding skipped for production cleanup.');
  /*
  console.log('🌱 Insertando datos de ejemplo...');

  // Insert sample members
  await db.run(`
    INSERT INTO members (name, email, instruments, role) VALUES
    ('David Mena', 'david@example.com', '["guitar", "vocals"]', 'leader'),
    ('María González', 'maria@example.com', '["vocals", "piano"]', 'member'),
    ('Carlos Rodríguez', 'carlos@example.com', '["drums"]', 'member'),
    ('Ana López', 'ana@example.com', '["bass"]', 'member'),
    ('Pedro Martínez', 'pedro@example.com', '["vocals"]', 'member')
  `);

  // Insert sample songs
  await db.run(`
    INSERT INTO songs (name, type, key, tempo, is_favorite, created_by) VALUES
    ('Amazing Grace', 'hymn', 'G', 80, 1, 1),
    ('How Great Thou Art', 'hymn', 'C', 75, 1, 1),
    ('Blessed Be Your Name', 'worship', 'A', 120, 1, 1),
    ('10,000 Reasons', 'worship', 'G', 85, 1, 1),
    ('Way Maker', 'worship', 'E', 90, 1, 1),
    ('Goodness of God', 'worship', 'C', 95, 0, 1),
    ('Reckless Love', 'worship', 'F', 100, 0, 1),
    ('Great Are You Lord', 'worship', 'D', 88, 1, 1)
  `);

  // Insert sample rehearsals
  await db.run(`
    INSERT INTO rehearsals (name, date, start_time, location, created_by) VALUES
    ('Ensayo Semanal', '2025-01-15', '19:00', 'Salón Principal', 1),
    ('Preparación Domingo', '2025-01-18', '17:00', 'Salón Principal', 1),
    ('Ensayo Especial', '2025-01-22', '19:30', 'Salón Principal', 1)
  `);

  // Insert sample ministry rules
  await db.run(`
    INSERT INTO ministry_rules (title, description, category, order_position, created_by) VALUES
    ('Puntualidad', 'Llegar 15 minutos antes del ensayo', 'Ensayos', 1, 1),
    ('Preparación', 'Estudiar las canciones antes del ensayo', 'Ensayos', 2, 1),
    ('Vestimenta', 'Vestir apropiadamente para los servicios', 'Servicios', 1, 1),
    ('Actitud', 'Mantener una actitud de adoración', 'General', 1, 1),
    ('Compromiso', 'Confirmar asistencia con anticipación', 'General', 2, 1)
  `);

  console.log('✅ Datos de ejemplo insertados correctamente');
  */
}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}