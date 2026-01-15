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
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Harmony Browser</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                        .card { background: white; padding: 2.5rem; border-radius: 1.5rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); width: 90%; max-width: 480px; text-align: center; }
                        h2 { color: #0f172a; margin: 0 0 0.5rem 0; font-weight: 800; letter-spacing: -0.025em; }
                        p { color: #64748b; margin: 0 0 2rem 0; font-size: 0.95rem; }
                        input { width: 100%; padding: 0.875rem 1rem; border: 2px solid #e2e8f0; border-radius: 0.75rem; margin-bottom: 1rem; box-sizing: border-box; font-size: 1rem; outline: none; transition: all 0.2s; }
                        input:focus { border-color: #3b82f6; ring: 2px solid #3b82f6; }
                        button { width: 100%; padding: 0.875rem; background: #3b82f6; color: white; border: none; border-radius: 0.75rem; cursor: pointer; font-weight: 700; font-size: 1rem; hover: background: #2563eb; transition: all 0.2s; }
                        button:hover { background: #2563eb; transform: translateY(-1px); }
                        .divider { display: flex; items-center; margin: 2rem 0; color: #94a3b8; font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
                        .divider::before, .divider::after { content: ""; flex: 1; height: 1px; background: #e2e8f0; }
                        .divider::before { margin-right: 1rem; }
                        .divider::after { margin-left: 1rem; }
                        .links { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
                        .link-btn { background: #f1f5f9; color: #475569; padding: 0.75rem; text-decoration: none; border-radius: 0.75rem; font-size: 0.875rem; font-weight: 600; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
                        .link-btn:hover { background: #e2e8f0; color: #1e293b; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h2>Navegador Harmony</h2>
                        <p>Tu portal de recursos musicales</p>
                        
                        <form action="/api/proxy" method="GET">
                            <input type="text" name="url" placeholder="https://..." required autofocus autocomplete="off">
                            <button type="submit">Ir a la sitio web</button>
                        </form>

                        <div class="divider">Sitios Sugeridos</div>

                        <div class="links">
                            <a href="/api/proxy?url=https://www.lacuerda.net" class="link-btn">🎸 LaCuerda.net</a>
                            <a href="/api/proxy?url=https://www.letras.com" class="link-btn">🎵 Letras.com</a>
                            <a href="/api/proxy?url=https://www.cifraclub.com" class="link-btn">🎼 CifraClub</a>
                            <a href="/api/proxy?url=https://www.google.com" class="link-btn">🔍 Google</a>
                        </div>
                    </div>
                </body>
                </html>
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

        // Whitelist allowed domains for security - DISABLED for free browsing
        // const allowedDomains = [
        //     'letras.com',
        //     'www.letras.com',
        //     'cifraclub.com',
        //     'www.cifraclub.com',
        //     'lacuerda.net',
        //     'www.lacuerda.net',
        //     'genius.com',
        //     'www.genius.com',
        //     'google.com',
        //     'www.google.com',
        //     'google.es',
        //     'www.google.es',
        //     'bing.com',
        //     'www.bing.com',
        //     'musixmatch.com',
        //     'www.musixmatch.com'
        // ];

        // if (!allowedDomains.includes(targetUrl.hostname)) {
        //     return res.status(403).json({
        //         error: 'Domain not allowed',
        //         allowed: allowedDomains
        //     });
        // }

        console.log(`🔄 Proxying request to: ${url}`);

        // Fetch the page
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Upgrade-Insecure-Requests': '1'
            },
            timeout: 15000,
            maxRedirects: 5,
            validateStatus: (status) => status < 400 // Reject 4xx/5xx explicitly
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
