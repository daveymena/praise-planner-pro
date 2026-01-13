import axios from 'axios';
import * as cheerio from 'cheerio';
import { YoutubeTranscript } from 'youtube-transcript';

export class YoutubeService {
    /**
     * Extract video ID from YouTube URL
     */
    extractVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    /**
     * Get video details and transcript
     */
    async getVideoDetails(url) {
        try {
            const videoId = this.extractVideoId(url);
            if (!videoId) {
                throw new Error('Invalid YouTube URL');
            }

            // 1. Get Video Title and Description (basic scraping)
            // Using axios + cheerio is lighter than using the official API (requires Key)
            // and sufficient for Title/Description
            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const $ = cheerio.load(data);

            // Try multiple sources for the title and description
            let title = $('meta[property="og:title"]').attr('content') ||
                $('meta[name="title"]').attr('content') ||
                $('title').text() ||
                '';

            let description = $('meta[property="og:description"]').attr('content') ||
                $('meta[name="description"]').attr('content') ||
                '';

            // Clean up title (remove " - YouTube" suffix)
            title = title.replace(/- YouTube$/, '').trim();

            // Additional cleanup (sometimes title is "Video Name - YouTube")
            if (title === 'YouTube') {
                // Try fetching from JSON-LD if available (advanced fallback)
                // or just leave it empty to trigger client-side validation
                title = '';
            }

            // 2. Get Transcript (if available)
            let transcriptText = '';
            try {
                const transcript = await YoutubeTranscript.fetchTranscript(videoId);
                transcriptText = transcript.map(item => item.text).join(' ');
            } catch (err) {
                console.log('⚠️ Could not fetch transcript (might be disabled):', err.message);
                // It's okay, we can try with just title/description
            }

            return {
                videoId,
                title,
                description,
                transcript: transcriptText
            };
        } catch (error) {
            console.error('Error in YoutubeService:', error);
            throw new Error('Failed to fetch YouTube video details');
        }
    }

    /**
     * Search for a video by query and return the first result
     */
    async searchVideo(query) {
        try {
            // Append 'letra oficial' to prioritize lyric videos or official audio which are better for church use
            const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
            const { data } = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
                }
            });

            // Extract the first valid video ID from the search results
            // matches "videoRenderer":{"videoId":"..."
            const match = data.match(/"videoRenderer":{"videoId":"([^"]+)"/);
            const videoId = match ? match[1] : null;

            if (videoId) {
                return {
                    videoId,
                    url: `https://www.youtube.com/watch?v=${videoId}`
                };
            }

            // Fallback for some YouTube UI variations
            const fallbackMatch = data.match(/"videoId":"([^"]+)"/);
            const fallbackId = fallbackMatch ? fallbackMatch[1] : null;

            if (fallbackId) {
                return {
                    videoId: fallbackId,
                    url: `https://www.youtube.com/watch?v=${fallbackId}`
                };
            }

            return null;
        } catch (error) {
            console.error('Error searching YouTube:', error.message);
            return null;
        }
    }
}

export const youtubeService = new YoutubeService();
