import express from 'express';
import { youtubeService } from '../services/youtubeService.js';
import { aiService } from '../services/aiService.js';

const router = express.Router();

// POST /api/ai/extract-song
router.post('/extract-song', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'YouTube URL is required' });
        }

        console.log(`🔍 Extracting song data from: ${url}`);

        // 1. Fetch YouTube Data
        const videoDetails = await youtubeService.getVideoDetails(url);
        console.log(`✅ YouTube Data Fetched: ${videoDetails.title}`);

        // 2. Prepare context for AI
        const context = `
      Title: ${videoDetails.title}
      Description: ${videoDetails.description}
      Transcript/Lyrics: ${videoDetails.transcript}
    `;

        // 3. Call AI
        // 3. Call AI with Fallback/Hybrid Logic
        let extractedData = {};
        try {
            extractedData = await aiService.extractSongData(context);
            console.log('✅ AI Extraction successful');
        } catch (aiError) {
            console.warn('⚠️ AI Extraction failed or timed out. Using YouTube data as fallback.');
            console.warn(aiError.message);
            // Allow extractedData to remain empty so we fill it with YouTube data below
        }

        // 4. Merge & Validate Logic (Hybrid + Normalization)

        // Helper to normalize Enum values for Frontend Dropdowns
        const normalizeTempo = (t) => {
            if (!t) return 'Moderado';
            const lower = t.toLowerCase();
            if (lower.includes('rapido') || lower.includes('fast') || lower.includes('upbeat')) return 'Rápido';
            if (lower.includes('lento') || lower.includes('slow') || lower.includes('ballad')) return 'Lento';
            return 'Moderado';
        };

        const normalizeType = (t) => {
            if (!t) return 'Alabanza'; // Default
            const lower = t.toLowerCase();
            if (lower.includes('adoracion') || lower.includes('worship')) return 'Adoración';
            if (lower.includes('ministracion') || lower.includes('ministry')) return 'Ministración';
            if (lower.includes('congregacion')) return 'Congregacional';
            return 'Alabanza';
        };

        const finalData = {
            name: (extractedData.name && extractedData.name !== 'YouTube') ? extractedData.name : videoDetails.title,
            type: normalizeType(extractedData.type),
            key: extractedData.key || '',
            tempo: normalizeTempo(extractedData.tempo),
            lyrics: extractedData.lyrics || videoDetails.transcript || '',
            chords: extractedData.chords || ''
        };

        // Hallucination Check: If lyrics look broken (repetition), revert to transcript
        if (finalData.lyrics && finalData.lyrics.length > 50) {
            const sample = finalData.lyrics.substring(0, 50);
            if (finalData.lyrics.includes("Tranquilo, tranquilo") || finalData.lyrics.includes(sample + sample)) {
                console.warn('⚠️ Detected repetition hallucination. Reverting lyrics to raw transcript.');
                finalData.lyrics = videoDetails.transcript || '';
            }
        }

        // Remove prompt leakage if present
        if (finalData.lyrics && finalData.lyrics.includes("Full lyrics formatted")) {
            finalData.lyrics = videoDetails.transcript || '';
        }

        res.json({
            source: 'ai_hybrid',
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
