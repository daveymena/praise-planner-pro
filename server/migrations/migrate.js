import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  try {
    console.log('🚀 Starting database migration...');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../../supabase/migrations/001_initial_schema.sql');

    // Check if migration file exists
    if (!fs.existsSync(migrationPath)) {
      console.warn('⚠️ Migration file not found at:', migrationPath);
      console.warn('⚠️ Skipping migration.');
      return;
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Executing migration...');

    // Execute the migration
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('🎉 Database schema created/verified');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    // We categorize the error but don't crash the server entirely if it's just "relation already exists"
    // However, for a fresh deploy, we want to know it failed.
    // throw error; 
    console.error('⚠️ Migration failed but continuing server startup to allow debugging.');
  }
}