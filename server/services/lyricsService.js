import axios from 'axios';
import * as cheerio from 'cheerio';

class LyricsService {
    async searchAndGetLyrics(query) {
        try {
            console.log(`🔍 Searching lyrics for: ${query}`);

            // Perform a search on Google (via basic scraping with a realistic user agent)
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' letras acordes')}`;

            const { data: searchHtml } = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
                }
            });

            const $ = cheerio.load(searchHtml);

            // Try to find links to known lyrics sites
            const knownSites = [
                'lacuerda.net',
                'letras.com',
                'musixmatch.com',
                'genius.com',
                'azlyrics.com'
            ];

            let targetUrl = null;

            // Look for links in search results
            $('a').each((i, el) => {
                const href = $(el).attr('href');
                if (href && href.startsWith('/url?q=')) {
                    const actualUrl = href.split('/url?q=')[1].split('&')[0];
                    if (knownSites.some(site => actualUrl.includes(site))) {
                        targetUrl = decodeURIComponent(actualUrl);
                        return false; // break loop
                    }
                } else if (href && knownSites.some(site => href.includes(site))) {
                    targetUrl = href;
                    return false;
                }
            });

            if (!targetUrl) {
                console.warn('⚠️ No known lyrics site found in search results. Returning search snippet.');
                const snippets = [];
                $('.VwiC3b').each((i, el) => snippets.push($(el).text()));
                return snippets.join('\n');
            }

            console.log(`🎯 Found lyrics source: ${targetUrl}`);

            // Fetch the actual lyrics page
            const { data: lyricsHtml } = await axios.get(targetUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
                }
            });

            const $lyrics = cheerio.load(lyricsHtml);

            // Basic extraction of main content (this is a fuzzy approach)
            // Most lyrics sites put content in <pre>, <div class="lyrics">, etc.
            let content = $lyrics('pre').text() ||
                $lyrics('.lyric-content').text() ||
                $lyrics('.lyrics').text() ||
                $lyrics('article').text();

            // If still empty, just grab high-frequency text elements
            if (!content || content.length < 100) {
                content = $lyrics('p').map((i, el) => $lyrics(el).text()).get().join('\n');
            }

            return content.substring(0, 5000); // Limit context size

        } catch (error) {
            console.error('❌ Lyrics Search Error:', error.message);
            return null;
        }
    }
}

export const lyricsService = new LyricsService();
