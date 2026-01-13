import express from 'express';
import { youtubeService } from '../services/youtubeService.js';
import { aiService } from '../services/aiService.js';
import { lyricsService } from '../services/lyricsService.js';

const router = express.Router();

// Helper to normalize Enum values for Frontend Dropdowns
const normalizeTempo = (t) => {
    if (!t) return 'Moderado';
    const lower = t.toString().toLowerCase().trim();
    if (lower.includes('rapido') || lower.includes('fast') || lower.includes('rápido')) return 'Rápido';
    if (lower.includes('lento') || lower.includes('slow')) return 'Lento';
    return 'Moderado';
};

const normalizeType = (t) => {
    if (!t) return 'Alabanza';
    const lower = t.toString().toLowerCase().trim();
    if (lower.includes('adoracion') || lower.includes('worship') || lower.includes('adoración')) return 'Adoración';
    if (lower.includes('ministracion') || lower.includes('ministry') || lower.includes('ministración')) return 'Ministración';
    if (lower.includes('congregacion') || lower.includes('congregacional')) return 'Congregacional';
    return 'Alabanza';
};

const normalizeKey = (k) => {
    if (!k) return 'C'; // Default fallback

    const keyStr = k.toString().trim();

    // List of valid keys
    const validKeys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "Bb", "Eb", "Ab", "Db"];
    const validMinorKeys = ["Cm", "Dm", "Em", "Fm", "Gm", "Am", "Bm", "C#m", "D#m", "F#m", "G#m", "A#m"];

    // Direct match (case insensitive)
    const upperKey = keyStr.toUpperCase();
    for (const valid of [...validKeys, ...validMinorKeys]) {
        if (upperKey === valid.toUpperCase()) {
            return valid;
        }
    }

    // Extract first musical note pattern (e.g. C, G#, Am, Eb)
    const match = keyStr.match(/([A-G][#b]?(m|maj|min)?)/i);
    if (match) {
        let note = match[1];
        // Capitalize root, handle minor
        const root = note.charAt(0).toUpperCase();
        const accidental = note[1] === '#' || note[1] === 'b' ? note[1] : '';
        const quality = note.toLowerCase().includes('m') && !note.toLowerCase().includes('maj') ? 'm' : '';

        const normalized = root + accidental + quality;

        // Verify it's valid
        if ([...validKeys, ...validMinorKeys].includes(normalized)) {
            return normalized;
        }

        // Return just root + accidental if quality makes it invalid
        if (validKeys.includes(root + accidental)) {
            return root + accidental;
        }
    }

    return 'C'; // Safe fallback
};

// POST /api/ai/extract-song
router.post('/extract-song', async (req, res) => {
    try {
        const { url, text, searchQuery, type } = req.body;
        let context = "";
        let sourceInfo = "AI Internal Knowledge";

        // Flow 1: Search Query (Backend searches web, then AI processes)
        if (type === 'search' || searchQuery) {
            const query = searchQuery || req.body.name;
            console.log(`🌐 Searching web for: ${query}`);

            // Search lyrics and youtube simultaneously
            const [webLyrics, ytVideo] = await Promise.all([
                lyricsService.searchAndGetLyrics(query),
                youtubeService.searchVideo(query)
            ]);

            if (webLyrics) {
                context += `\n[FUENTE PRINCIPAL (LETRA Y ACORDES)]:\n${webLyrics}\n`;
                sourceInfo = "Web Search + AI";
            }

            if (ytVideo) {
                context += `\n[REFERENCIA VIDEO YOUTUBE]: ${ytVideo.url}\n`;
                if (!webLyrics) sourceInfo = "YouTube + AI";
            }

            if (!context) {
                context = `Song Name: ${query}`;
                console.warn('⚠️ Web search returned no results, relying on AI knowledge.');
            }
        }
        // ... (remaining cases stay mostly same but ensure context is built)
        else if (text) {
            context = `Pasted Text Content:\n${text}`;
            sourceInfo = "Manual Paste + AI";
        }
        else if (url || type === 'url') {
            console.log(`🔍 Extracting from YouTube: ${url}`);
            const videoDetails = await youtubeService.getVideoDetails(url);
            // Limit description to avoid polluting context
            const cleanDesc = (videoDetails.description || "").substring(0, 500);
            context = `[DATOS DE YOUTUBE]\nTítulo: ${videoDetails.title}\nDescripción: ${cleanDesc}\nTranscripción: ${videoDetails.transcript}\nURL: ${url}`;
            sourceInfo = "YouTube + AI";
        }

        // 3. Call AI
        const extractedData = await aiService.extractSongData(context);

        // Fail-safe: ensure lyrics and chords are strings (smaller models sometimes return objects)
        const ensureString = (val) => {
            if (typeof val === 'string') return val;
            if (!val) return '';

            // If it's an object or array, try to flatten it into readable text
            if (typeof val === 'object') {
                const parts = [];
                const flatten = (obj) => {
                    if (typeof obj === 'string') {
                        parts.push(obj);
                    } else if (Array.isArray(obj)) {
                        obj.forEach(flatten);
                    } else if (obj !== null) {
                        Object.values(obj).forEach(flatten);
                    }
                };
                flatten(val);
                return parts.join('\n').trim();
            }
            return String(val);
        };

        const finalData = {
            name: extractedData.name || searchQuery || 'Canción Sin Título',
            type: normalizeType(extractedData.type),
            key: normalizeKey(extractedData.key),
            tempo: normalizeTempo(extractedData.tempo),
            duration_minutes: extractedData.duration_minutes || 5,
            youtube_url: extractedData.youtube_url || url || '',
            lyrics: ensureString(extractedData.lyrics),
            chords: ensureString(extractedData.chords)
        };

        // Log extraction results for debugging
        console.log('✅ AI Extraction successful:');
        console.log(`   📝 Name: ${finalData.name}`);
        console.log(`   🎵 Type: ${finalData.type}`);
        console.log(`   🎹 Key: ${finalData.key}`);
        console.log(`   📺 YouTube: ${finalData.youtube_url ? 'Yes' : 'No'}`);
        console.log(`   📄 Lyrics: ${finalData.lyrics.length} chars`);
        console.log(`   🎸 Chords: ${finalData.chords.length} chars`);

        res.json({
            source: sourceInfo,
            data: finalData
        });

    } catch (error) {
        console.error('❌ Extraction Failed:', error.message);
        res.status(500).json({
            error: 'Extraction failed',
            details: error.message
        });
    }
});

export default router;
