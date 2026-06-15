// Vercel Serverless Function
// Proxies Google Calendar iCal private feed URLs to bypass browser CORS constraints securely

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed. Use GET.' });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing required query parameter: url' });
  }

  // Security check: Only allow calendar.google.com domain to prevent open proxy abuse
  if (!url.startsWith('https://calendar.google.com/')) {
    return res.status(403).json({ error: 'Access Denied: Only Google Calendar URLs are allowed.' });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: `Google Calendar server returned status ${response.status}` });
    }

    const text = await response.text();
    
    // Set appropriate content type for iCal calendar feed
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    return res.status(200).send(text);
  } catch (error) {
    console.error('Calendar proxy error:', error);
    return res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
}
