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
    // Use onboarding@resend.dev until tripzy.pro domain is verified on Resend.
    // Once verified, change to: 'Tripzy <noreply@tripzy.pro>'
    const FROM = process.env.RESEND_FROM || 'Tripzy <onboarding@resend.dev>';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: 'hello@tripzy.pro',
        subject: 'New Tripzy Launch Subscriber',
        html: `
          <h2>New subscriber for Tripzy launch!</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Date:</strong> ${new Date().toISOString()}</p>
        `,
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
