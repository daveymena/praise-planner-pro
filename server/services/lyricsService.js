import axios from 'axios';
import * as cheerio from 'cheerio';

class LyricsService {
    /**
     * Extract content directly from a URL
     */
    async getLyricsFromUrl(url) {
        try {
            console.log(`🎯 Extracting from direct URL: ${url}`);
            const { data: lyricsHtml } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml'
                },
                timeout: 20000
            });

            const $lyrics = cheerio.load(lyricsHtml);
            let rawContent = "";

            // Site-specific extraction
            if (url.includes('lacuerda.net')) {
                // LaCuerda uses #tCode for lyrics+chords, or .pre/.texto for legacy
                const tCode = $lyrics('#tCode').text();
                const mTexto = $lyrics('#m_texto').text();
                const pre = $lyrics('pre').first().text();
                console.log(`🔍 LaCuerda debug - #tCode: ${tCode.length}, #m_texto: ${mTexto.length}, pre: ${pre.length}`);
                rawContent = tCode || mTexto || pre;
            } else if (url.includes('letras.com')) {
                // Letras uses .cnt-letra for lyrics, .cifra_cnt for chords
                const cntLetra = $lyrics('.cnt-letra').text();
                const lyricContent = $lyrics('#lyric-content').text();
                const cifraCnt = $lyrics('.cifra_cnt').text() || $lyrics('pre').text();
                console.log(`🔍 Letras.com debug - .cnt-letra: ${cntLetra.length}, #lyric-content: ${lyricContent.length}, cifra_cnt: ${cifraCnt.length}`);
                rawContent = cifraCnt || cntLetra || lyricContent;
            } else if (url.includes('cifraclub.com')) {
                rawContent = $lyrics('pre').first().text();
                console.log(`🔍 CifraClub debug - pre: ${rawContent.length}`);
            }

            if (!rawContent || rawContent.length < 50) {
                // Better generic fallback: find the largest text block
                let maxText = "";
                $lyrics('pre, article, main, #m_texto, .cnt-letra, .lyrics, .text-content, .lyric-content').each((i, el) => {
                    const text = $lyrics(el).text().trim();
                    if (text.length > maxText.length) {
                        maxText = text;
                    }
                });
                rawContent = maxText;
                console.log(`🔍 Generic extraction fallback result: ${rawContent.length} chars`);
            }

            if (!rawContent || rawContent.length < 50) {
                console.warn(`⚠️ Content extraction failed or too short: ${rawContent?.length || 0} chars`);
                console.log("📄 Raw HTML Preview:", lyricsHtml.substring(0, 500).replace(/\n/g, ' '));
                return null;
            }

            console.log(`✅ Extracted content: ${rawContent.substring(0, 100).replace(/\n/g, ' ')}...`);

            return rawContent
                .replace(/<!--[\s\S]*?-->/g, '')
                .replace(/\r\n/g, '\n')
                .replace(/\n{4,}/g, '\n\n\n')
                .trim();
        } catch (error) {
            console.error('❌ Direct extraction error:', error.message);
            return null;
        }
    }

    /**
     * Search and extract COMPLETE lyrics and chords from web
     * Returns raw content - NO truncation
     */
    async searchAndGetLyrics(query) {
        try {
            console.log(`🔍 Searching complete lyrics for: ${query}`);
            const knownSites = ['lacuerda.net', 'letras.com', 'cifraclub.com', 'christianlyrics.com'];
            let targetUrl = null;

            // Strategy 1: Direct site construction
            const cleanQuery = query.toLowerCase()
                .replace(/[áàä]/g, 'a')
                .replace(/[éèë]/g, 'e')
                .replace(/[íìï]/g, 'i')
                .replace(/[óòö]/g, 'o')
                .replace(/[úùü]/g, 'u')
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-');

            const directUrl = `https://www.lacuerda.net/${cleanQuery}.shtml`;
            try {
                const testResponse = await axios.head(directUrl, { timeout: 3000 });
                if (testResponse.status === 200) {
                    targetUrl = directUrl;
                }
            } catch (err) { }

            // Strategy 2: Google Search
            if (!targetUrl) {
                try {
                    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' letra completa acordes')}`;
                    const { data: searchHtml } = await axios.get(searchUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                        },
                        timeout: 10000
                    });

                    const $ = cheerio.load(searchHtml);
                    $('a').each((i, el) => {
                        const href = $(el).attr('href');
                        if (!href) return;
                        let actualUrl = "";
                        if (href.startsWith('/url?q=')) {
                            actualUrl = decodeURIComponent(href.split('/url?q=')[1].split('&')[0]);
                        } else if (href.startsWith('http')) {
                            actualUrl = href;
                        }

                        if (actualUrl && knownSites.some(site => actualUrl.includes(site))) {
                            targetUrl = actualUrl;
                            return false;
                        }
                    });
                } catch (err) { }
            }

            if (!targetUrl) return null;
            return this.getLyricsFromUrl(targetUrl);

        } catch (error) {
            console.error('❌ Lyrics extraction error:', error.message);
            return null;
        }
    }

    /**
     * Separate lyrics from chords using pattern recognition
     */
    separateLyricsAndChords(rawContent) {
        if (!rawContent) return { lyrics: '', chords: '' };

        const lines = rawContent.split('\n');
        let lyrics = [];
        let chords = [];
        let currentSection = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (/^(Intro|Verse|Verso|Chorus|Coro|Bridge|Puente|Outro|Final|Pre-?Chorus)[\s:]?/i.test(line)) {
                currentSection = line;
                lyrics.push('\n' + line);
                continue;
            }

            const isChordLine = /^[\s]*[A-G](#|b)?(m|maj|min|sus|dim|aug|\d)*[\s/]*([A-G](#|b)?(m|maj|min|sus|dim|aug|\d)*[\s/]*)*[\s]*$/.test(line);

            if (isChordLine && line.length > 0) {
                chords.push(`${currentSection}: ${line}`);
            } else if (line.length > 0) {
                // If it looks like chords + lyrics together, try to clean
                const cleanLine = line.replace(/\s{2,}[A-G](#|b)?(m|maj|sus|dim)?\s{2,}/g, ' ');
                lyrics.push(cleanLine);
            } else {
                lyrics.push('');
            }
        }

        return {
            lyrics: lyrics.join('\n').trim(),
            chords: chords.join('\n').trim()
        };
    }

    /**
     * Detect key from content
     */
    detectKey(content) {
        if (!content) return 'C';
        const chordPattern = /\b([A-G](#|b)?(m|maj)?)\b/g;
        const matches = content.match(chordPattern) || [];
        const frequency = {};
        matches.forEach(chord => {
            const root = chord.replace(/m|maj|min|sus|dim|aug|\d/g, '');
            frequency[root] = (frequency[root] || 0) + 1;
        });
        let maxChord = 'C';
        let maxCount = 0;
        for (const [chord, count] of Object.entries(frequency)) {
            if (count > maxCount) {
                maxCount = count;
                maxChord = chord;
            }
        }
        return maxChord;
    }
}

export const lyricsService = new LyricsService();
