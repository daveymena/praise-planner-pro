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

        // Flow 1: Search Query (Backend extracts EVERYTHING, AI just organizes)
        if (type === 'search' || searchQuery) {
            const query = searchQuery || req.body.name;
            console.log(`🌐 Backend extracting FULL content for: ${query}`);

            // Get complete lyrics from web
            const fullContent = await lyricsService.searchAndGetLyrics(query);

            if (fullContent) {
                console.log(`✅ Backend extracted ${fullContent.length} characters`);

                // Try logic-based separation first (NO AI)
                const separated = lyricsService.separateLyricsAndChords(fullContent);
                const detectedKey = lyricsService.detectKey(fullContent);

                // Get YouTube video
                const ytVideo = await youtubeService.searchVideo(query);

                // If we have good separated content, use it directly
                if (separated.lyrics.length > 200) {
                    console.log(`✅ Using logic-based extraction (NO AI needed)`);
                    const finalData = {
                        name: query.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                        type: 'Adoración', // Default, user can change
                        key: detectedKey,
                        youtube_url: ytVideo?.url || '',
                        lyrics: separated.lyrics,
                        chords: separated.chords
                    };

                    return res.json({
                        source: 'Backend Extraction (Logic-Based)',
                        data: finalData
                    });
                }

                // If logic-based didn't work well, use AI to organize
                console.log(`🤖 Using AI to organize extracted content...`);
                context = `[CONTENIDO COMPLETO EXTRAÍDO DE INTERNET]:\n${fullContent}\n\n[VIDEO YOUTUBE]: ${ytVideo?.url || 'No encontrado'}`;
                sourceInfo = "Web Extraction + AI Formatting";
            } else {
                // No web content, fall back to AI knowledge
                context = `Song Name: ${query}`;
                console.warn('⚠️ Web extraction failed, using AI knowledge only');
                sourceInfo = "AI Knowledge Only";
            }
        }
        // ... (remaining cases stay mostly same but ensure context is built)
        else if (text) {
            context = `Pasted Text Content:\n${text}`;
            sourceInfo = "Manual Paste + AI";
        }
        else if (url || type === 'url') {
            const targetUrl = url.includes('api/proxy')
                ? decodeURIComponent(new URL(url, 'http://localhost').searchParams.get('url'))
                : url;

            if (targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be')) {
                console.log(`🔍 Extracting from YouTube: ${targetUrl}`);
                const videoDetails = await youtubeService.getVideoDetails(targetUrl);
                const cleanDesc = (videoDetails.description || "").substring(0, 500);
                context = `[DATOS DE YOUTUBE]\nTítulo: ${videoDetails.title}\nDescripción: ${cleanDesc}\nTranscripción: ${videoDetails.transcript}\nURL: ${targetUrl}`;
                sourceInfo = "YouTube + AI";
            } else {
                console.log(`🔍 Extracting from Website: ${targetUrl}`);
                const fullContent = await lyricsService.getLyricsFromUrl(targetUrl);
                if (fullContent) {
                    const separated = lyricsService.separateLyricsAndChords(fullContent);
                    const detectedKey = lyricsService.detectKey(fullContent);

                    // Return logic-based extraction immediately if good
                    if (separated.lyrics.length > 200) {
                        return res.json({
                            source: 'Website Extraction (Logic-Based)',
                            data: {
                                name: targetUrl.split('/').pop()?.replace(/(-|.shtml|.html)/g, ' ').toUpperCase() || 'Canción Web',
                                type: 'Adoración',
                                key: detectedKey,
                                youtube_url: '',
                                lyrics: separated.lyrics,
                                chords: separated.chords
                            }
                        });
                    }
                    context = `[CONTENIDO WEB EXTRAÍDO]:\n${fullContent}\nURL: ${targetUrl}`;
                    sourceInfo = "Website + AI Formatting";
                } else {
                    throw new Error("No se pudo extraer contenido de este sitio web");
                }
            }
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
            details: error.message,
            debug: error.stack?.substring(0, 100)
        });
    }
});

export default router;
