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
                // LaCuerda uses different selectors depending on the page structure
                const tCode = $lyrics('#tCode').text();
                const mTexto = $lyrics('#m_texto').text();
                const allPre = $lyrics('pre').map((i, el) => $lyrics(el).text()).get().join('\n\n');

                console.log(`🔍 LaCuerda debug - #tCode: ${tCode.length}, #m_texto: ${mTexto.length}, all pre combined: ${allPre.length}`);
                rawContent = tCode || allPre || mTexto;
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

            // Aggressive cleaning to remove website UI and metadata
            let cleanedContent = rawContent
                .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
                .replace(/\r\n/g, '\n')
                .replace(/\n{4,}/g, '\n\n\n');

            // Remove common website UI elements and metadata
            const garbagePatterns = [
                /visualizaciones de letras[\s\d.,]+/gi,
                /StayInFaith/gi,
                /Letra\s*Significado\s*Traducciones?/gi,
                /Agregar a (favoritos|playlist)/gi,
                /Tamaño de la fuente/gi,
                /Acordes\s*Imprimir\s*Corregir/gi,
                /Desplazamiento automático/gi,
                /Anotaciones\s*(Habilitadas|Deshabilitadas)/gi,
                /Escrita por:.*?\.(?=\s|$)/gi,
                /¿Los datos están equivocados\?.*?Avísanos\.?/gi,
                /Enviada por.*?\.(?=\s|$)/gi,
                /Revisiones por \d+ personas?\.?/gi,
                /¿Viste algún error\?.*?revisión\.?/gi,
                /Restaurar\s*Aplicar/gi,
                /Compartir en Facebook/gi,
                /Compartilhar no Facebook/gi,
                /Tweetar/gi,
                /Google\+/gi,
                /Whatsapp/gi,
                /\d+\s*visualizaciones?/gi,
                /\d+\s*reproducciones?/gi,
                /Letra añadida por/gi,
                /Letra corregida por/gi,
                /Publicidad/gi,
                /PUBLICIDAD/gi,
                /Anuncio/gi,
                /Copyright.*?\d{4}.*?All Rights Reserved/gi,
                /Report error/gi,
                /Subscribe to newsletter/gi,
                /Follow us on.*?$/gim,
                /©\s*\d{4}.*?$/gim,
                /Acordes para.*?\d+/gi,
                /Tutorial.*?$/gim,
                /Watch later/gi,
                /Share on.*?$/gim,
                /^[A-Z\s]+- (?:Letra|Lyrics)$/gm, // "ROBERTO ORELLANA - Letra"
                /^[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+$/gm // Filter potential full author names on single lines
            ];

            for (const pattern of garbagePatterns) {
                cleanedContent = cleanedContent.replace(pattern, '');
            }

            // Remove isolated single words that are likely UI elements
            const uiWords = ['Imprimir', 'Corregir', 'Compartir', 'Enviar', 'Guardar', 'Favoritos', 'Playlist'];
            for (const word of uiWords) {
                cleanedContent = cleanedContent.replace(new RegExp(`^${word}$`, 'gm'), '');
            }

            // Clean up lines but preserve stanza breaks
            cleanedContent = cleanedContent
                .replace(/\r\n/g, '\n')
                .split('\n')
                .map(line => line.trim())
                .join('\n')
                .replace(/\n{3,}/g, '\n\n'); // Normalize multiple empty lines to exactly two

            // Ensure headers [VERSO], [CORO] always have a double break before them for clear structure
            cleanedContent = cleanedContent.replace(/([^\n])\n(\[(?:VERSO|VERSE|CORO|CHORUS|PUENTE|BRIDGE|INTRO|FINAL|OUTRO|INSTRUMENTAL)[^\]]*\])/gi, '$1\n\n$2');

            return cleanedContent.trim();
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

            // STRATEGY: Scrape First (For structure), API as Fallback
            // (User prefers structure (Verso/Coro) which scraper sites provide better than the API)

            let targetUrl = null;
            let targetContent = null;

            // STRATEGY 1: Search Engine Scraping (DuckDuckGo -> Bing -> Google)
            // We prioritize providers that separate lyrics/chords better like Letras.com
            const searchEngines = [
                {
                    name: 'DuckDuckGo',
                    url: `https://html.duckduckgo.com/html?q=${encodeURIComponent(query + ' letra y acordes christian')}`,
                    selector: '.result__a',
                    extract: ($el) => {
                        const href = $el.attr('href');
                        if (!href) return null;
                        if (href.includes('uddg=')) {
                            try {
                                return decodeURIComponent(href.split('uddg=')[1].split('&')[0]);
                            } catch (e) { return null; }
                        }
                        return href;
                    }
                },
                {
                    name: 'Google',
                    url: `https://www.google.com/search?q=${encodeURIComponent(query + ' letra completa worship')}`,
                    selector: 'a',
                    extract: ($el) => {
                        const href = $el.attr('href');
                        if (href?.startsWith('/url?q=')) return decodeURIComponent(href.split('/url?q=')[1].split('&')[0]);
                        if (href?.startsWith('http') && !href.includes('google')) return href;
                        return null;
                    }
                }
            ];

            // Try first search
            let searchPromises = searchEngines.map(async (engine) => {
                try {
                    console.log(`🔍 Trying search with ${engine.name}...`);
                    const { data: searchHtml } = await axios.get(engine.url, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                            'Accept': 'text/html,application/xhtml+xml',
                            'Accept-Language': 'es-ES,es;q=0.9'
                        },
                        timeout: 5000, // Shorter timeout for individual searches
                        validateStatus: status => status < 500
                    });

                    if (searchHtml.includes("410 Gone") || searchHtml.includes("Too Many Requests")) {
                        return null;
                    }

                    const $ = cheerio.load(searchHtml);
                    const knownProviderSites = ['letras.com', 'lacuerda.net', 'cifraclub.com', 'musica.com', 'adorale.com', 'vagalume.com', 'vagalume.com.br', 'musixmatch.com', 'genius.com', 'bethelmusic.com', 'lyrics.com'];
                    let foundUrl = null;

                    $(engine.selector).each((i, el) => {
                        const link = engine.extract($(el));
                        if (link && link.startsWith('http')) {
                            console.log(`🔗 ${engine.name} found: ${link.substring(0, 60)}...`);

                            // Filter out ads and non-lyrics pages
                            if (link.includes('duckduckgo.com/y.js') ||
                                link.includes('google.com/aclk') ||
                                link.includes('/search?') ||
                                link.includes('/preview/')) {
                                return; // Skip ads and previews
                            }

                            if (knownProviderSites.some(site => link.includes(site))) {
                                // Prioritize complete pages (e.g., .shtml from LaCuerda)
                                if (link.includes('.shtml') || link.includes('letras.com')) {
                                    foundUrl = link;
                                    return false; // Stop searching, we found a good one
                                }
                                // Otherwise, keep as fallback if we don't find better
                                if (!foundUrl) {
                                    foundUrl = link;
                                }
                            }
                        }
                    });
                    return foundUrl;
                } catch (err) {
                    return null;
                }
            });

            const results = await Promise.all(searchPromises);
            // Unique URLs
            const potentialUrls = [...new Set(results.filter(url => url !== null))];

            const knownProviderSites = ['letras.com', 'lacuerda.net', 'cifraclub.com', 'musica.com', 'adorale.com', 'vagalume.com', 'vagalume.com.br', 'musixmatch.com', 'genius.com', 'bethelmusic.com', 'lyrics.com', 'letras.mus.br', 'songselect.ccli.com'];

            console.log(`🔗 Scanned ${potentialUrls.length} links. Checking quality...`);

            for (const url of potentialUrls) {
                // Filter out clear ads or internal search engine links
                if (url.includes('duckduckgo.com/y.js') || url.includes('google.com/search')) continue;

                const content = await this.getLyricsFromUrl(url);
                if (content && content.length > 600) {
                    console.log(`✅ Acceptable content found (${content.length} chars) at: ${url}`);
                    targetContent = content;
                    targetUrl = url;
                    // If it's a very long/complete version, stop searching
                    if (content.length > 1500) break;
                }

                if (!targetContent && content) {
                    targetContent = content;
                    targetUrl = url;
                }
            }

            // If we didn't find good content, try alternative search with different keywords
            if (!targetContent || targetContent.length < 800) {
                console.log(`⚠️ First search incomplete (${targetContent?.length || 0} chars), trying alternative keywords...`);

                const altUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' letra completa full lyrics')}`;
                try {
                    const { data: searchHtml } = await axios.get(altUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Accept': 'text/html'
                        },
                        timeout: 5000,
                        validateStatus: status => status < 500
                    });

                    const $ = cheerio.load(searchHtml);
                    const betterSites = ['genius.com', 'azlyrics.com', 'songlyrics.com', 'metrolyrics.com'];

                    $('a').each((i, el) => {
                        const href = $(el).attr('href');
                        let link = null;
                        if (href?.startsWith('/url?q=')) link = decodeURIComponent(href.split('/url?q=')[1].split('&')[0]);
                        else if (href?.startsWith('http') && !href.includes('google')) link = href;

                        if (link && betterSites.some(site => link.includes(site))) {
                            potentialUrls.push(link);
                        }
                    });

                    // Try these new URLs
                    for (const url of potentialUrls.slice(-5)) { // Try last 5 new URLs
                        if (url.includes('google.com/search')) continue;
                        const content = await this.getLyricsFromUrl(url);
                        if (content && content.length > (targetContent?.length || 0)) {
                            console.log(`✅ Found better source (${content.length} chars): ${url}`);
                            targetContent = content;
                            targetUrl = url;
                            if (content.length > 1500) break;
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Alternative search failed:', e.message);
                }
            }

            // STRATEGY 2: Lyrics.ovh API (Fallback only if scraping failed)
            if (!targetContent) {
                try {
                    const cleanQueryApi = query.replace(/\(.*\)/g, '').replace(/\[.*\]/g, '').trim();
                    const parts = cleanQueryApi.split('-');
                    if (parts.length >= 2) {
                        const artist = parts[0].trim();
                        const title = parts[1].trim();
                        console.log(`🎵 Trying Lyrics.ovh API (Fallback) with: ${artist} - ${title}`);
                        const { data } = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`, { timeout: 5000 });
                        if (data && data.lyrics) {
                            return data.lyrics;
                        }
                    }
                } catch (e) { }
            }

            return targetContent;
        } catch (error) {
            console.error('❌ Lyrics extraction error:', error.message);
            return null;
        }
    }

    /**
     * Separate lyrics from chords using token-based analysis
     */
    separateLyricsAndChords(rawContent) {
        if (!rawContent) return { lyrics: '', chords: '' };

        const lines = rawContent.split('\n');
        let lyrics = [];
        let chords = [];

        // Match English (case-insensitive A-G) and Spanish (Case-sensitive Do-Si to avoid common words)
        const englishChordRegex = /^[A-G](#|b|s)?(m|maj|min|sus|dim|aug|add|M|2|4|5|6|7|9|11|13)*(\/[A-G](#|b|s)?)?$/i;
        const spanishChordRegex = /^(Do|Re|Mi|Fa|Sol|La|Si)(#|s|b)?(m|maj|min|sus|dim|aug|add|M|2|4|5|6|7|9|11|13)*(\/(Do|Re|Mi|Fa|Sol|La|Si)(#|s|b)?)?$/;

        const isChordToken = (token) => {
            const clean = token.replace(/[()\[\],.]/g, '').trim();
            if (!clean || clean.length > 8) return false;

            // Common Spanish words that shouldn't be treated as chords unless in a chord-only line
            const commonWords = ['la', 'mi', 'si', 'do', 're', 'solo'];
            if (commonWords.includes(clean.toLowerCase())) {
                // Only allow if capitalized like a chord (e.g. "Do", "Sol")
                if (clean[0] !== clean[0].toUpperCase()) return false;
            }

            if (clean.includes('-')) {
                return clean.split('-').every(part => englishChordRegex.test(part.trim()) || spanishChordRegex.test(part.trim()));
            }

            return englishChordRegex.test(clean) || spanishChordRegex.test(clean);
        };

        const isChordLineStrict = (line) => {
            if (!line || line.length > 100) return false;

            // Heuristic: Headers like "Intro:" are definitely not lyrics if followed by chords or empty
            if (/^(Intro|Preludio|Interludio|Solo|Final|Outro|Puente|Instrumental|Bridge|Chorus|Coro|Verse|Verso|Estrofa)[\s:]*$/i.test(line)) return true;

            // "Intro: G D C" detection
            if (/^(Intro|Preludio|Interludio|Solo|Final|Outro|Puente|Instrumental|Bridge|Chorus|Coro|Verse|Verso|Estrofa)[\s:]+/i.test(line)) {
                const textAfter = line.split(':')[1] || '';
                const tokens = textAfter.trim().split(/[\s,]+/);
                const validChords = tokens.filter(isChordToken).length;
                if (validChords > 0) return true;
                if (tokens.length === 0) return true; // Just a header
            }

            const tokens = line.trim().split(/\s+/);
            if (tokens.length === 0) return false;

            const chordCount = tokens.filter(isChordToken).length;

            // If it's a very short line with at least one chord, it's likely a chord line
            if (tokens.length <= 3 && chordCount >= 1) return true;

            // If > 40% of tokens are chords, it's a chord line
            return (chordCount / tokens.length) >= 0.4;
        };

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) {
                // Keep empty lines as stanza breaks
                lyrics.push('');
                chords.push('');
                continue;
            }

            // Detect Repetitions e.g. (x2), x2, (2 veces), etc.
            const repetitionMatch = line.match(/^[\(\[]?\s*x\s*\d+\s*[\)\]]?$/i) || line.match(/^[\(\[]?\s*\d+\s*veces\s*[\)\]]?$/i);
            if (repetitionMatch) {
                const rep = `[REPETIR: ${repetitionMatch[0].toUpperCase()}]`;
                lyrics.push(rep);
                chords.push(rep);
                continue;
            }

            // Detect Sections (headers)
            const sectionRegex = /^\[?((?:Intro|Introducción|Introduccion|Preludio|Interludio|Verso|Verse|Coro|Chorus|Puente|Bridge|Estrofa|Estribillo|Pre-?Chorus|Pre-?Coro|Outro|Final|Solo|Instrumental|Coda)[\s\d]*):?\]?$/i;
            const sectionMatch = line.match(sectionRegex);

            if (sectionMatch) {
                const sectionName = sectionMatch[1].replace(/[\[\]:]/g, '').trim().toUpperCase();
                const header = `[${sectionName}]`;

                // Add extra spacing before headers if not first line
                const prefix = (lyrics.length > 0 && lyrics[lyrics.length - 1] !== '') ? '\n' : '';
                lyrics.push(prefix + header);
                chords.push(prefix + header);
                continue;
            }

            if (isChordLineStrict(line)) {
                chords.push(line);
            } else {
                // Lyric Line with potential embedded chords
                // Detect inline repetitions like "blabla (x2)"
                let processedLine = line;
                const inlineRepMatch = line.match(/[\(\[]\s*x\s*\d+\s*[\)\]]$|[\(\[]\s*\d+\s*veces\s*[\)\]]$/i);
                if (inlineRepMatch) {
                    // Highlight the repetition
                    processedLine = line.replace(inlineRepMatch[0], ` **${inlineRepMatch[0].toUpperCase()}**`);
                }

                // Tokenize and filter chords from lyric lines
                const tokens = processedLine.split(/(\s+)/);
                const cleanTokens = tokens.map(token => {
                    if (!token.trim()) return token;
                    if (isChordToken(token)) {
                        // Remove if it looks like an isolated chord in a lyrics line
                        if (token.includes('(') || token.includes('[') || (token.toUpperCase() === token && token.length <= 4)) {
                            return '';
                        }
                    }
                    return token;
                });

                const cleanLine = cleanTokens.join('').replace(/\s{2,}/g, ' ').trim();

                // Advanced step: If a line seems to have multiple sentences but no breaks, try to split them
                // This fixes the "Tengo FeRoberto Orellana..." problem where names stick to lyrics
                const splitMessyLines = (text) => {
                    // Split if a word ends in lowercase and immediately followed by uppercase without space
                    // e.g. "milagro estoyTengo fe" -> "milagro estoy\nTengo fe"
                    let fixed = text.replace(/([a-z])([A-Z][a-z])/g, '$1\n$2');
                    // Split if a sentence ends (.!?) and followed by Uppercase
                    fixed = fixed.replace(/([\.!\?])([A-Z])/g, '$1\n$2');
                    return fixed;
                };

                if (cleanLine.length > 0) {
                    const finalized = splitMessyLines(cleanLine);
                    lyrics.push(finalized);
                }
            }
        }

        return {
            lyrics: lyrics.join('\n').replace(/\n{3,}/g, '\n\n').trim(),
            chords: chords.join('\n').replace(/\n{3,}/g, '\n\n').trim()
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
