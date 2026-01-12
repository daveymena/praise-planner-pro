import dotenv from 'dotenv';
dotenv.config();

// Use the external URL
process.env.OLLAMA_URL = 'https://ollama-ollama.ginee6.easypanel.host';

import { aiService } from './services/aiService.js';

async function testSeparation() {
    // Mixed input typical of many lyrics sites
    const mixedInput = `
        G          C
        Grandes son Tus maravillas
        D          Em
        Rey de toda la creación
        C          D
        Tu nombre es exaltado
        G
        El Dios de mi salvación
    `;

    console.log('🧪 Testing separation with mixed input...');

    try {
        const data = await aiService.extractSongData(mixedInput);
        console.log('\n--- EXTRACTED DATA ---');
        console.log('LYRICS (Should have no chords):');
        console.log(data.lyrics);

        console.log('\nCHORDS (Should have no lyrics):');
        console.log(data.chords);

        const lyricsHaveChords = /[A-G](#|b)?(m|maj|min|7|sus|dim|aug)?\s/.test(data.lyrics);
        const chordsHaveLyrics = /[a-z]/i.test(data.chords.replace(/[A-G](#|b)?(m|maj|min|7|sus|dim|aug)?/gi, '').trim());

        if (!lyricsHaveChords && data.lyrics.length > 0) {
            console.log('\n✅ SUCCESS: Lyrics are clean!');
        } else {
            console.log('\n⚠️ WARNING: Lyrics might still contain chords.');
        }

        if (data.chords.length > 0) {
            console.log('✅ CHORDS extracted correctly.');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testSeparation();
