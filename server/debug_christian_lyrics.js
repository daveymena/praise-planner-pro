import { lyricsService } from './services/lyricsService.js';

async function debugSong(query) {
    console.log(`\n\n==================================================`);
    console.log(`🔎 DEBUGGING: "${query}"`);
    console.log(`==================================================`);

    try {
        const result = await lyricsService.searchAndGetLyrics(query);

        if (!result) {
            console.log("❌ NO RESULT FOUND at all.");
            return;
        }

        console.log(`✅ RAW CONTENT (${result.length} chars):`);
        console.log("--------------------------------------------------");
        console.log(result.substring(0, 300) + "...\n[middle of text]...\n" + result.substring(result.length - 300));
        console.log("--------------------------------------------------");

        const processed = lyricsService.separateLyricsAndChords(result);

        console.log(`\n🧹 PROCESSED LYRICS (${processed.lyrics.length} chars):`);
        console.log("--------------------------------------------------");
        console.log(processed.lyrics);
        console.log("--------------------------------------------------");

        console.log(`\n🎸 PROCESSED CHORDS (${processed.chords.length} chars):`);
        console.log("--------------------------------------------------");
        console.log(processed.chords);
        console.log("--------------------------------------------------");

    } catch (error) {
        console.error("🚨 ERROR:", error);
    }
}

async function run() {
    console.log("\n🧪 TEST CASE: Specific Bug Verification (Cámbiame)");
    const problemLine = "Vengo a Ti Señor Cámbiame renuévame\n(C) Cúbreme con tu amor";
    const result = lyricsService.separateLyricsAndChords(problemLine);

    console.log("INPUT: ", problemLine.replace(/\n/g, ' / '));
    console.log("OUTPUT LYRICS: ", result.lyrics.replace(/\n/g, ' / '));

    if (result.lyrics.includes("Cámbiame")) {
        console.log("✅ SUCCESS: 'Cámbiame' was preserved correctly!");
    } else {
        console.log("❌ FAIL: 'Cámbiame' is missing or corrupted!");
    }

    // Also verify normal chord removal
    if (!result.lyrics.includes("(C)")) {
        console.log("✅ SUCCESS: Chord (C) was removed correctly.");
    }
}

run();
