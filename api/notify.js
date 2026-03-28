export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY env variable is not set');
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Tripzy <noreply@tripzy.pro>',
        to: 'hello@tripzy.pro',
        subject: 'New Launch Subscriber',
        html: `<p>I <strong>${email}</strong> want to be part of the tripzy</p>`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', JSON.stringify(data));
      return res.status(500).json({ error: data.message || 'Failed to send' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Notify error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
