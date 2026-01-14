import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

/**
 * Proxy endpoint to bypass X-Frame-Options restrictions
 * Fetches external pages and serves them without iframe blocking headers
 */
router.get('/', async (req, res) => {
    const { url } = req.query;
    try {
        if (!url) {
            return res.status(400).send(`
                <div style="font-family: sans-serif; padding: 40px; text-align: center; color: #666;">
                    <h2 style="color: #2563eb;">Navegador Harmony</h2>
                    <p>Esperando una dirección URL válida para comenzar...</p>
                    <div style="margin-top: 20px; font-size: 12px; opacity: 0.5;">Harmony Pro Proxy System</div>
                </div>
            `);
        }

        // Validate URL
        let targetUrl;
        try {
            targetUrl = new URL(url);
        } catch (err) {
            return res.status(400).send(`
                <div style="font-family: sans-serif; padding: 40px; text-align: center; color: #dc2626;">
                    <h2>Dirección Inválida</h2>
                    <p>La URL "${url}" no tiene un formato correcto.</p>
                </div>
            `);
        }

        // Whitelist allowed domains for security
        const allowedDomains = [
            'letras.com',
            'www.letras.com',
            'cifraclub.com',
            'www.cifraclub.com',
            'lacuerda.net',
            'www.lacuerda.net',
            'genius.com',
            'www.genius.com',
            'google.com',
            'www.google.com',
            'google.es',
            'www.google.es',
            'bing.com',
            'www.bing.com',
            'musixmatch.com',
            'www.musixmatch.com'
        ];

        if (!allowedDomains.includes(targetUrl.hostname)) {
            return res.status(403).json({
                error: 'Domain not allowed',
                allowed: allowedDomains
            });
        }

        console.log(`🔄 Proxying request to: ${url}`);

        // Fetch the page
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Referer': 'https://www.google.com/'
            },
            timeout: 10000,
            maxRedirects: 5
        });

        console.log(`✅ Fetched ${url} - Status: ${response.status}`);
        let html = response.data;

        // Load HTML with cheerio for manipulation
        const $ = cheerio.load(html);

        // Fix ALL relative URLs to absolute and proxy internal links
        $('a, link, script, img, source, form, iframe').each((i, el) => {
            const tag = el.tagName;
            let attr = (tag === 'a' || tag === 'link' || tag === 'form') ? 'href' : 'src';
            if (tag === 'form') attr = 'action';

            let val = $(el).attr(attr);

            // Check for additional link attributes
            const dataHref = $(el).attr('data-href');
            if (dataHref) {
                try {
                    const abs = new URL(dataHref, targetUrl.origin).href;
                    $(el).attr('data-href', `/api/proxy?url=${encodeURIComponent(abs)}`);
                } catch (e) { }
            }

            if (val && !val.startsWith('http') && !val.startsWith('//') && !val.startsWith('data:') && !val.startsWith('#')) {
                try {
                    const absoluteUrl = new URL(val, targetUrl.origin).href;
                    if (tag === 'a' || tag === 'form') {
                        $(el).attr(attr, `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`);
                    } else {
                        $(el).attr(attr, absoluteUrl);
                    }
                } catch (e) {
                    // Ignore invalid URLs
                }
            } else if (val && val.startsWith('//')) {
                // Handle protocol-relative URLs
                const absoluteUrl = `https:${val}`;
                if (tag === 'a' || tag === 'form') {
                    $(el).attr(attr, `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`);
                } else {
                    $(el).attr(attr, absoluteUrl);
                }
            } else if (val && val.startsWith('http') && (tag === 'a' || tag === 'form')) {
                // If it's an absolute internal link (same domain), proxy it too
                try {
                    const checkUrl = new URL(val);
                    if (allowedDomains.includes(checkUrl.hostname)) {
                        $(el).attr(attr, `/api/proxy?url=${encodeURIComponent(val)}`);
                    }
                } catch (e) { }
            }
        });

        // Set headers to allow iframe embedding
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

        // Remove headers that block iframes
        res.removeHeader('X-Frame-Options');
        res.removeHeader('Content-Security-Policy');

        // Inject helper script for iframe navigation
        $('head').append(`
            <script>
                // Intercept clicks to ensure they stay in proxy
                document.addEventListener('click', function(e) {
                    const link = e.target.closest('a');
                    if (link && link.href && !link.href.includes('/api/proxy') && link.href.startsWith('http')) {
                        e.preventDefault();
                        window.location.href = '/api/proxy?url=' + encodeURIComponent(link.href);
                    }
                }, true);

                // Intercept forms
                document.addEventListener('submit', function(e) {
                    const form = e.target;
                    if (form.action && !form.action.includes('/api/proxy') && form.action.startsWith('http')) {
                        e.preventDefault();
                        const url = new URL(form.action);
                        const formData = new FormData(form);
                        const params = new URLSearchParams(formData);
                        window.location.href = '/api/proxy?url=' + encodeURIComponent(url.origin + url.pathname + '?' + params.toString());
                    }
                }, true);
            </script>
        `);

        res.send($.html());

    } catch (error) {
        console.error('❌ Proxy error for URL:', url);
        console.error('Error message:', error.message);

        if (error.response) {
            console.error('Target status:', error.response.status);
            return res.status(error.response.status).send(`Proxy Error: El sitio respondió con error ${error.response.status}`);
        }

        res.status(500).send(`Proxy Error: ${error.message}`);
    }
});

export default router;
