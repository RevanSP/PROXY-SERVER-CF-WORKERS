import { Hono } from 'hono';

const app = new Hono();

app.get('/', c => c.json({ error: 'Not Found' }, 404));

app.get('/api/proxy', async (c) => {
    const targetUrl = new URL(c.req.url).searchParams.get('url');
    if (!targetUrl) return c.json({ error: 'URL parameter is required' }, 400);

    const allowedOrigins = ['https://retroverse-emulator.vercel.app', 'https://booksverse.vercel.app', 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5500'];
    const origin = c.req.header('Origin');
    const referer = c.req.header('Referer');

    const isLocalhost = ['localhost', '127.0.0.1'].includes(new URL(c.req.url).hostname);

    if (isLocalhost) {
        return handleProxyRequest(c, targetUrl, origin);
    }

    if (!allowedOrigins.includes(origin) && !allowedOrigins.includes(referer)) {
        return c.json({ error: 'Forbidden' }, 403);  
    }

    return handleProxyRequest(c, targetUrl, origin);
});

const handleProxyRequest = async (c, targetUrl, origin) => {
    try {
        const response = await fetch(decodeURIComponent(targetUrl));
        if (!response.ok) return c.json({ error: 'Failed to fetch the resource' }, response.status);

        const body = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'application/octet-stream';

        const headers = {
            'Content-Type': contentType,
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': origin
        };

        return c.body(body, { headers });
    } catch (error) {
        console.error('Error fetching the resource:', error);
        return c.json({ error: 'Failed to fetch the resource' }, 500);
    }
};

app.all('*', c => c.json({ error: 'Not Found' }, 404));

export default app;