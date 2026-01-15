import { lyricsService } from './services/lyricsService.js';
import dotenv from 'dotenv';
dotenv.config();

async function testDirectUrl() {
    const testUrls = [
        'https://acordes.lacuerda.net/bethel_music/bondad_de_dios.shtml',
        'https://www.letras.com/bethel-music/goodness-of-god-traducao/'
    ];

    for (const url of testUrls) {
        console.log(`\n\n🧪 Testing URL: ${url}`);
        console.log("=".repeat(60));

        try {
            const content = await lyricsService.getLyricsFromUrl(url);
            if (content) {
                console.log(`✅ Extracted ${content.length} characters`);
                console.log("\n📄 First 500 chars:");
                console.log(content.substring(0, 500));
                console.log("\n📄 Last 300 chars:");
                console.log(content.substring(content.length - 300));
            } else {
                console.log("❌ No content extracted");
            }
        } catch (e) {
            console.error("❌ Error:", e.message);
        }
    }
}

testDirectUrl();
