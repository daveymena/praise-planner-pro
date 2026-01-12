import dotenv from 'dotenv';
dotenv.config();

// Use the external URL
process.env.OLLAMA_URL = 'https://ollama-ollama.ginee6.easypanel.host';

import { lyricsService } from './services/lyricsService.js';
import { aiService } from './services/aiService.js';

async function testLongExtraction() {
    const song = "La Bondad de Dios letra y acordes";
    console.log(`🧪 Testing long extraction for: ${song}`);

    try {
        const lyrics = await lyricsService.searchAndGetLyrics(song);
        if (!lyrics) {
            console.error('❌ Could not find lyrics');
            return;
        }
        console.log(`✅ Lyrics found: ${lyrics.length} characters`);

        const data = await aiService.extractSongData(lyrics);
        console.log('\n--- EXTRACTED DATA ---');
        console.log(`Name: ${data.name}`);
        console.log(`Lyrics Length: ${data.lyrics?.length || 0}`);
        console.log(`Chords Length: ${data.chords?.length || 0}`);

        if (data.lyrics?.length > 1000) {
            console.log('\n✨ SUCCESS: Extraction looks complete!');
        } else {
            console.log('\n⚠️ WARNING: Extraction might still be truncated.');
            console.log('Sample of lyrics end:', data.lyrics?.slice(-100));
        }
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testLongExtraction();
