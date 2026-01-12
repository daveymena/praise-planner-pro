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
        const extractedData = await aiService.extractSongData(context);
        console.log('✅ AI Extraction Complete');

        res.json({
            source: 'ai',
            data: extractedData
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
