import { lyricsService } from './services/lyricsService.js';

async function testExtraction(songName) {
    console.log(`\n--- Testing: "${songName}" ---`);
    try {
        const result = await lyricsService.searchAndGetLyrics(songName);
        if (!result) {
            console.log("❌ Result: NULL (Not found)");
            return;
        }

        const separated = lyricsService.separateLyricsAndChords(result);

        console.log(`✅ Raw Length: ${result.length} chars`);
        console.log(`📝 Lyrics Length: ${separated.lyrics.length} chars`);
        console.log(`🎸 Chords Length: ${separated.chords.length} chars`);

        console.log("\n--- LYRICS PREVIEW (First 500 chars) ---");
        console.log(separated.lyrics.substring(0, 500));
        console.log("...\n");

        if (separated.lyrics.length < 200) {
            console.warn("⚠️ WARNING: Lyrics seem very short! Possible incomplete extraction.");
        }
    } catch (e) {
        console.error("❌ Error:", e.message);
    }
}

async function runTests() {
    await testExtraction("Sinach - Way Maker");
    await testExtraction("Barak - Ven Espiritu Santo");
    await testExtraction("Miel San Marcos - No Hay Lugar Mas Alto");
    await testExtraction("Marcos Witt - Renuevame");
}

runTests();
