const fetch = require('node-fetch');

// Netlify Function: proxy /.netlify/functions/proxy-tracks -> remote API
// Deployar em Netlify (basta colocar este arquivo em netlify/functions)

exports.handler = async function (event, context) {
  const target = 'https://painful.aksaraymalaklisi.net/api/tracks/';
  try {
    const res = await fetch(target, { method: 'GET' });
    const data = await res.text();
    return {
      statusCode: res.status,
      headers: {
        'Content-Type': res.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: data,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: String(err) }),
    };
  }
};
