import { lyricsService } from './services/lyricsService.js';

async function debugSearch() {
    console.log("🧪 Testing search with detailed logging...\n");

    const result = await lyricsService.searchAndGetLyrics("Bondad de Dios - Bethel Music");

    if (result) {
        console.log(`\n✅ FINAL RESULT: ${result.length} characters`);
        console.log("\n📄 Content preview:");
        console.log(result.substring(0, 300));
        console.log("\n...\n");
        console.log(result.substring(result.length - 200));
    } else {
        console.log("\n❌ No result");
    }
}

debugSearch();
