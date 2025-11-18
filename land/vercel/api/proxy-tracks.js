import fetch from 'node-fetch';

export default async function handler(req, res) {
  const target = 'https://painful.aksaraymalaklisi.net/api/tracks/';
  try {
    const r = await fetch(target);
    const text = await r.text();
    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(r.status).send(text);
  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: String(err) });
  }
}
