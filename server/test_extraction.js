import { lyricsService } from './services/lyricsService.js';

async function debugSong(query) {
    console.log(`\n\n==================================================`);
    console.log(`🔎 TESTING: "${query}"`);
    console.log(`==================================================`);

    try {
        const result = await lyricsService.searchAndGetLyrics(query);

        if (!result) {
            console.log("❌ NO RESULT FOUND at all.");
            return;
        }

        console.log(`✅ RAW CONTENT LENGTH: ${result.length} chars`);

        const processed = lyricsService.separateLyricsAndChords(result);

        console.log(`\n🧹 PROCESSED LYRICS LENGTH: ${processed.lyrics.length}`);
        console.log("--------------------------------------------------");
        console.log(processed.lyrics.substring(0, 1000) + (processed.lyrics.length > 1000 ? "..." : ""));
        console.log("--------------------------------------------------");

    } catch (error) {
        console.error("🚨 ERROR:", error);
    }
}

debugSong("Bondad de Dios - Bethel Music");
