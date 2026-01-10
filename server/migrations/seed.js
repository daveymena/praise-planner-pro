import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  try {
    console.log('🌱 Database seeding skipped for production cleanup.');
    /* 
    // Original seeding logic preserved but disabled
    console.log('🌱 Starting database seeding...');
    const seedPath = path.join(__dirname, '../../supabase/seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    console.log('📄 Inserting sample data...');
    await pool.query(seedSQL);
    console.log('✅ Seeding completed successfully!');
    */

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();