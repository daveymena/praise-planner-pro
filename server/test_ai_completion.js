import { aiService } from './services/aiService.js';
import dotenv from 'dotenv';
dotenv.config();

async function testAiCompletion() {
    const fragment = `
    Te amo Dios, Tu amor nunca me falla
    Mi existir en Tus manos está
    Desde el momento que despierto Hasta el anochecer
    Yo cantaré de la bondad de Dios
    
    [CORO]
    En mi vida has sido bueno
    En mi vida has sido tan fiel
    Con mi ser, con cada aliento
    Yo cantaré de la bondad de Dios
    `;

    console.log("🧪 Testing AI completion for fragment...");
    try {
        const result = await aiService.extractSongData(`[FRAGMENTO DE CANCIÓN]:\n${fragment}\n\n[NOMBRE]: Bondad de Dios`);
        console.log("\n✅ AI COMPLETED LYRICS:");
        console.log("--------------------------------------------------");
        console.log(result.lyrics);
        console.log("--------------------------------------------------");
        console.log("\n🎸 AI CHORDS:");
        console.log(result.chords);
    } catch (e) {
        console.error("❌ AI Error:", e.message);
    }
}

testAiCompletion();
