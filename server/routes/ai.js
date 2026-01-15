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

            // Start both searches in parallel
            const [fullContent, ytVideo] = await Promise.all([
                lyricsService.searchAndGetLyrics(query),
                youtubeService.searchVideo(query)
            ]);

            if (fullContent) {
                console.log(`✅ Backend extracted ${fullContent.length} characters`);

                // Try logic-based separation first (NO AI)
                const separated = lyricsService.separateLyricsAndChords(fullContent);
                const detectedKey = lyricsService.detectKey(fullContent);

                // Improved logic-based extraction check:
                // Only skip AI if we have BOTH good structure AND sufficient length
                const hasStructure = /\[(CORO|VERSO|BRIDGE|PUENTE|ESTROFA|INTRO)\]/i.test(separated.lyrics);
                const isLongEnough = separated.lyrics.length > 800;
                const hasMultipleSections = (separated.lyrics.match(/\[/g) || []).length >= 3;

                // NEW: Check for "cleanliness" - if names or messy strings are detected, force AI
                const isMessy = /([a-z][A-Z])/.test(separated.lyrics) || // Case stickiness like "estoyTengo"
                    /(By:|Escrita por|Owner|Lyrics|Letra de|Copyright)/i.test(separated.lyrics) ||
                    (separated.lyrics.length < fullContent.length * 0.4); // Too much lost in cleaning? Or too little cleaned?

                // Only use logic-based if we have a complete, well-structured AND clean song
                if (hasStructure && isLongEnough && hasMultipleSections && !isMessy) {
                    console.log(`✅ Using logic-based extraction (Complete & Structured)`);
                    const finalData = {
                        name: query.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                        type: 'Adoración',
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

                // Otherwise, use AI to complete/organize the content
                console.log(`🤖 Content needs AI enhancement (${separated.lyrics.length} chars, ${(separated.lyrics.match(/\[/g) || []).length} sections)`);
                context = `[CONTENIDO EXTRAÍDO DE INTERNET]:\n${fullContent}\n\n[VIDEO YOUTUBE]: ${ytVideo?.url || 'No encontrado'}\n\n[INSTRUCCIÓN ESPECIAL]: La letra parece incompleta. Por favor, complétala usando tu conocimiento de esta canción.`;
                sourceInfo = "Web Extraction + AI Completion";

                // Store fallback data in case AI fails
                req.fallbackData = {
                    name: query.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    type: 'Adoración',
                    key: detectedKey,
                    youtube_url: ytVideo?.url || '',
                    lyrics: separated.lyrics,
                    chords: separated.chords
                };
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

        // Prepend any specific user query context if needed, but instructions are in aiService
        context = `Song Request: ${query || 'Unknown'}\n\n` + context;

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

        const responsePayload = {
            source: sourceInfo,
            data: finalData
        };

        console.log(`📤 Sending response to client: ${sourceInfo}`);
        console.log(`   - Name: ${finalData.name}`);
        console.log(`   - Lyrics: ${finalData.lyrics?.length || 0} chars`);
        console.log(`   - Chords: ${finalData.chords?.length || 0} chars`);

        res.json(responsePayload);

    } catch (error) {
        console.error('❌ Extraction Failed:', error.message);

        // If we have fallback data from web scraping, use it instead of failing
        if (req.fallbackData) {
            console.log('⚠️ AI failed, using fallback web extraction data');
            return res.json({
                source: 'Web Extraction (AI Timeout Fallback)',
                data: req.fallbackData
            });
        }

        res.status(500).json({
            error: 'Extraction failed',
            details: error.message,
            debug: error.stack?.substring(0, 100)
        });
    }
});

export default router;
