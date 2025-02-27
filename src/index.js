import { Hono } from 'hono';

const app = new Hono();

const allowedOrigins = [
  'https://retroverse-emulator.vercel.app',
  'https://booksverse.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5500',
];

app.get('/', (c) => c.json({ error: 'Not Found' }, 404));

app.get('/api/proxy', async (c) => {
  const targetUrl = c.req.query('url');
  if (!targetUrl) return c.json({ error: 'URL parameter is required' }, 400);

  try {
    const decodedUrl = decodeURIComponent(targetUrl);
    const response = await fetch(decodedUrl);

    if (!response.ok) return c.json({ error: 'Failed to fetch the resource' }, response.status);

    const body = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const origin = c.req.headers?.get('Origin');
    const corsHeaders = allowedOrigins.includes(origin) ? {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    } : {};

    return c.body(body, {
      status: 200,
      headers: { 'Content-Type': contentType, ...corsHeaders },
    });
  } catch (error) {
    console.error('Error fetching the resource:', error);
    return c.json({ error: 'Failed to fetch the resource', details: error.message }, 500);
  }
});

app.all('*', (c) => c.json({ error: 'Not Found' }, 404));

export default app;