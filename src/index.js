import { Hono } from 'hono';

const app = new Hono();

app.get('/', c => c.json({ error: 'Not Found' }, 404));

app.get('/api/proxy', async (c) => {
    const targetUrl = new URL(c.req.url).searchParams.get('url');
    if (!targetUrl) return c.json({ error: 'URL parameter is required' }, 400);

    try {
        const response = await fetch(decodeURIComponent(targetUrl));
        if (!response.ok) return c.json({ error: 'Failed to fetch the resource' }, response.status);

        const body = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const allowedOrigins = ['https://retroverse-remake.vercel.app', 'https://booksverse.vercel.app', 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5500'];
        const origin = c.req.header('Origin');

        return c.body(body, 200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : ''
        });
    } catch (error) {
        console.error('Error fetching the resource:', error);
        return c.json({ error: 'Failed to fetch the resource' }, 500);
    }
});

app.all('*', c => c.json({ error: 'Not Found' }, 404));

export default app;