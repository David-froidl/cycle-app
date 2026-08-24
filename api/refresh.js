export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { refresh_token, client_id } = req.body || {};
  const client_secret = process.env.GOOGLE_CLIENT_SECRET;

  if (!refresh_token || !client_id) {
    return res.status(400).json({ error: 'Missing refresh_token or client_id' });
  }
  if (!client_secret) {
    return res.status(500).json({ error: 'Server misconfigured: GOOGLE_CLIENT_SECRET fehlt in den Vercel Environment Variables' });
  }

  try {
    const params = new URLSearchParams({
      refresh_token,
      client_id,
      client_secret,
      grant_type: 'refresh_token'
    });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const data = await tokenRes.json();

    if (!tokenRes.ok) {
      return res.status(tokenRes.status).json({ error: data.error_description || data.error || 'Refresh failed' });
    }

    // data contains: access_token, expires_in, scope, token_type
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
