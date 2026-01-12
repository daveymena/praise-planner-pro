import axios from 'axios';
import * as cheerio from 'cheerio';

class LyricsService {
    async searchAndGetLyrics(query) {
        try {
            console.log(`🔍 Searching lyrics for: ${query}`);
            const knownSites = ['lacuerda.net', 'letras.com', 'musixmatch.com', 'genius.com', 'azlyrics.com', 'cifraclub.com'];
            let targetUrl = null;

            // Strategy 1: Google Search
            try {
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' letras acordes site:lacuerda.net OR site:letras.com')}`;
                const { data: searchHtml } = await axios.get(searchUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                    },
                    timeout: 5000
                });

                const $ = cheerio.load(searchHtml);
                $('a').each((i, el) => {
                    const href = $(el).attr('href');
                    if (!href) return;
                    let actualUrl = "";
                    if (href.startsWith('/url?q=')) {
                        actualUrl = decodeURIComponent(href.split('/url?q=')[1].split('&')[0]);
                    } else if (href.includes('uddg=')) {
                        const parts = href.split('uddg=')[1];
                        if (parts) actualUrl = decodeURIComponent(parts.split('&')[0]);
                    } else if (href.startsWith('http')) {
                        actualUrl = href;
                    }

                    if (actualUrl && knownSites.some(site => actualUrl.includes(site))) {
                        targetUrl = actualUrl;
                        return false;
                    }
                });
            } catch (err) {
                console.warn('⚠️ Google search failed:', err.message);
            }

            // Strategy 2: DuckDuckGo Fallback
            if (!targetUrl) {
                console.log('🔄 Trying DuckDuckGo fallback...');
                try {
                    const ddgUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query + ' letras acordes lacuerda')}`;
                    const { data: ddgHtml } = await axios.get(ddgUrl, {
                        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
                    });
                    const $ddg = cheerio.load(ddgHtml);
                    $ddg('a.result__url').each((i, el) => {
                        let href = $ddg(el).attr('href');
                        if (!href) return;

                        let actualUrl = href;
                        if (href.includes('uddg=')) {
                            const parts = href.split('uddg=')[1];
                            if (parts) actualUrl = decodeURIComponent(parts.split('&')[0]);
                        } else if (href.startsWith('//')) {
                            actualUrl = `https:${href}`;
                        }

                        if (actualUrl && knownSites.some(site => actualUrl.includes(site))) {
                            targetUrl = actualUrl;
                            return false;
                        }
                    });
                } catch (err) {
                    console.warn('⚠️ DuckDuckGo search failed:', err.message);
                }
            }

            if (!targetUrl) {
                console.warn('⚠️ No specific lyrics site found. Extraction might be limited.');
                return null;
            }

            console.log(`🎯 Found lyrics source: ${targetUrl}`);
            const { data: lyricsHtml } = await axios.get(targetUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
            });

            const $lyrics = cheerio.load(lyricsHtml);
            let content = "";

            // Site-specific high-precision selectors
            if (targetUrl.includes('lacuerda.net')) content = $lyrics('pre').text();
            else if (targetUrl.includes('letras.com')) content = $lyrics('.cnt-letra').text() || $lyrics('article').text();
            else if (targetUrl.includes('cifraclub.com')) content = $lyrics('pre').text() || $lyrics('.cifra-container').text();

            // Generic fallbacks
            if (!content || content.length < 100) {
                content = $lyrics('pre').text() || $lyrics('.lyric-content').text() || $lyrics('.lyrics').text() || $lyrics('article').text();
            }

            if (!content || content.length < 100) {
                content = $lyrics('p').map((i, el) => $lyrics(el).text()).get().join('\n');
            }

            return content.trim().substring(0, 10000);

        } catch (error) {
            console.error('❌ Lyrics Search Error:', error.message);
            return null;
        }
    }
}

export const lyricsService = new LyricsService();
