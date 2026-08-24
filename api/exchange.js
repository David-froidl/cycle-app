export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, client_id, redirect_uri } = req.body || {};
  const client_secret = process.env.GOOGLE_CLIENT_SECRET;

  if (!code || !client_id || !redirect_uri) {
    return res.status(400).json({ error: 'Missing code, client_id, or redirect_uri' });
  }
  if (!client_secret) {
    return res.status(500).json({ error: 'Server misconfigured: GOOGLE_CLIENT_SECRET fehlt in den Vercel Environment Variables' });
  }

  try {
    const params = new URLSearchParams({
      code,
      client_id,
      client_secret,
      redirect_uri,
      grant_type: 'authorization_code'
    });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const data = await tokenRes.json();

    if (!tokenRes.ok) {
      return res.status(tokenRes.status).json({ error: data.error_description || data.error || 'Token exchange failed' });
    }

    // data contains: access_token, refresh_token (only on first consent), expires_in, scope, token_type
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
