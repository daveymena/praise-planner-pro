import express from 'express';
import { youtubeService } from '../services/youtubeService.js';
import { aiService } from '../services/aiService.js';
import { lyricsService } from '../services/lyricsService.js';

const router = express.Router();

// Helper to normalize Enum values for Frontend Dropdowns
const normalizeTempo = (t) => {
    if (!t) return 'Moderado';
    const lower = t.toString().toLowerCase();
    if (lower.includes('rapido') || lower.includes('fast') || lower.includes('upbeat') || lower.includes('rápido')) return 'Rápido';
    if (lower.includes('lento') || lower.includes('slow') || lower.includes('ballad')) return 'Lento';
    return 'Moderado';
};

const normalizeType = (t) => {
    if (!t) return 'Alabanza';
    const lower = t.toString().toLowerCase();
    if (lower.includes('adoracion') || lower.includes('worship') || lower.includes('adoración')) return 'Adoración';
    if (lower.includes('ministracion') || lower.includes('ministry') || lower.includes('ministración')) return 'Ministración';
    if (lower.includes('congregacion') || lower.includes('congregacional')) return 'Congregacional';
    return 'Alabanza';
};

// POST /api/ai/extract-song
router.post('/extract-song', async (req, res) => {
    try {
        const { url, text, searchQuery, type } = req.body;
        let context = "";
        let sourceInfo = "AI Internal Knowledge";

        // Flow 1: Search Query (Backend searches web, then AI processes)
        if (type === 'search' || searchQuery) {
            const query = searchQuery || name;
            console.log(`🌐 Searching web for: ${query}`);

            // Search lyrics and youtube simultaneously
            const [webLyrics, ytVideo] = await Promise.all([
                lyricsService.searchAndGetLyrics(query),
                youtubeService.searchVideo(query)
            ]);

            if (webLyrics) {
                context += `\nWeb Search Results for lyrics/chords:\n${webLyrics}`;
                sourceInfo = "Web Search + AI";
            }

            if (ytVideo) {
                context += `\nReference YouTube Video: ${ytVideo.url}`;
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
            context = `YouTube Video Data:\nTitle: ${videoDetails.title}\nDescription: ${videoDetails.description}\nTranscript: ${videoDetails.transcript}\nURL: ${url}`;
            sourceInfo = "YouTube + AI";
        }

        // 3. Call AI
        const extractedData = await aiService.extractSongData(context);

        const finalData = {
            name: extractedData.name || searchQuery || '',
            type: normalizeType(extractedData.type),
            key: extractedData.key || '',
            tempo: normalizeTempo(extractedData.tempo),
            duration_minutes: extractedData.duration_minutes || 5,
            youtube_url: extractedData.youtube_url || url || '',
            lyrics: extractedData.lyrics || '',
            chords: extractedData.chords || ''
        };

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
