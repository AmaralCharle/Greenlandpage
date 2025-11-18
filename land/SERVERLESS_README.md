Serverless proxy helper

This repo contains two example serverless proxies that you can deploy to allow your frontend (hosted on GitHub Pages or another static host) to read the API JSON despite upstream CORS restrictions.

Options included:

1) Netlify Function
   - File: `netlify/functions/proxy-tracks.js`
   - Endpoint after deploy: `https://<your-netlify-site>/.netlify/functions/proxy-tracks`
   - Behavior: fetches `https://painful.aksaraymalaklisi.net/api/tracks/` and returns the JSON with `Access-Control-Allow-Origin: *`.

2) Vercel Serverless Function
   - File: `vercel/api/proxy-tracks.js`
   - Endpoint after deploy: `https://<your-vercel-domain>/api/proxy-tracks`
   - Behavior: same as Netlify function.

How to use from the frontend

- If you deploy one of the functions, set an environment variable / update `src/config.js` to point to that proxy endpoint (instead of the upstream API).
  Example: if you deployed to Vercel at https://my-proxy.vercel.app then set API_BASE_URL to `https://my-proxy.vercel.app/`.

Deploy notes

- Netlify: drop the `netlify/functions` folder into a repo connected to Netlify and deploy. Netlify will publish functions that live under `.netlify/functions/<name>`.
- Vercel: place the `vercel/api` folder at the project root and deploy the project; the function will be available at `/api/proxy-tracks`.

Security note

- These proxies simply forward the upstream content and add permissive CORS headers. For production, you might want to add rate limiting, caching and origin validation.
