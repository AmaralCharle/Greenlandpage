const fetch = require('node-fetch');

// Netlify Function: proxy image fetch
// Usage: /.netlify/functions/proxy-image?url=<encoded-absolute-image-url>

exports.handler = async function (event, context) {
  const q = event.queryStringParameters || {};
  const target = q.url;
  if (!target) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing url parameter' }),
      headers: { 'Access-Control-Allow-Origin': '*' },
    };
  }

  try {
    const res = await fetch(target, { method: 'GET' });
    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return {
      statusCode: res.status || 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        // Allow caching by CDN if desired
        'Cache-Control': 'public, max-age=3600',
      },
      isBase64Encoded: true,
      body: base64,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: String(err) }),
    };
  }
};
