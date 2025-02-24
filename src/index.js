addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);

    if (url.pathname === '/' || url.pathname.startsWith('/api/proxy')) {
        return handleProxyRequest(request);
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

async function handleProxyRequest(request) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
        return new Response(JSON.stringify({ error: 'URL parameter is required' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    try {
        const decodedUrl = decodeURIComponent(targetUrl);
        const response = await fetch(decodedUrl);

        if (!response.ok) {
            return new Response(JSON.stringify({ error: 'Failed to fetch the resource' }), {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const body = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'application/octet-stream';

        const headers = {
            'Content-Type': contentType,
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': ['https://retroverse-emulator.vercel.app', 'https://booksverse.vercel.app', 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5500'].includes(request.headers.get('Origin'))
                ? request.headers.get('Origin')
                : ''
        };

        return new Response(body, { headers });
    } catch (error) {
        console.error('Error fetching the resource:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch the resource' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}