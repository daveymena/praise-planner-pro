import { getDatabase } from './config/sqlite-database.js';
import axios from 'axios';

async function verify() {
    console.log('🚀 Starting Verification of Backend Fixes...');
    const db = await getDatabase();

    try {
        // 1. Check Schema
        const tableInfo = await db.all("PRAGMA table_info(songs)");
        const tempoCol = tableInfo.find(c => c.name === 'tempo');
        console.log(`📊 Schema Check: tempo column type is ${tempoCol?.type}`);

        if (tempoCol?.type !== 'TEXT') {
            console.log('🔄 Attempting to update schema to TEXT...');
            await db.exec(`
                ALTER TABLE songs RENAME TO songs_old;
                CREATE TABLE songs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    type TEXT DEFAULT 'worship',
                    key TEXT,
                    tempo TEXT,
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
                INSERT INTO songs SELECT * FROM songs_old;
                DROP TABLE songs_old;
            `);
            console.log('✅ Schema updated to TEXT.');
        }

        // 2. Test CRUD (directly via DB first)
        console.log('\n2. Testing DB Create/Update...');
        const insert = await db.run(
            'INSERT INTO songs (name, tempo, type, key) VALUES (?, ?, ?, ?)',
            ['Test Song', 'Moderado', 'Adoración', 'G']
        );
        const songId = insert.lastID;
        console.log(`✅ Created test song with ID: ${songId}`);

        await db.run(
            'UPDATE songs SET name = ?, tempo = ? WHERE id = ?',
            ['Updated Test Song', 'Rápido', songId]
        );
        const updated = await db.get('SELECT * FROM songs WHERE id = ?', [songId]);
        console.log(`✅ Updated song name: ${updated.name}, tempo: ${updated.tempo}`);

        if (updated.tempo === 'Rápido') {
            console.log('✨ Success: String tempo saved correctly!');
        } else {
            console.error('❌ Error: Tempo was not saved as expected.');
        }

        // Clean up
        await db.run('DELETE FROM songs WHERE id = ?', [songId]);
        console.log('🧹 Cleaned up test data.');

    } catch (error) {
        console.error('❌ Verification Error:', error.message);
    }
}

verify();
