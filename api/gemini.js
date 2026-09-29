module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on Vercel yet.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const model = String(body.model || 'gemini-3.8-flash').replace(/^models\//, '');
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const systemPrompt = String(body.systemPrompt || '');

    const contents = messages
      .filter(m => m && (m.role === 'user' || m.role === 'assistant'))
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.content || '') }]
      }));

    if (!contents.length) {
      return res.status(400).json({ error: 'No chat messages were provided.' });
    }

    const payload = { contents };
    if (systemPrompt) {
      payload.systemInstruction = { parts: [{ text: systemPrompt }] };
    }

    const url =
      'https://generativelanguage.googleapis.com/v1beta/models/' +
      encodeURIComponent(model) +
      ':generateContent';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key
      },
      body: JSON.stringify(payload)
    });

    const raw = await response.text();
    let data = null;
    try { data = JSON.parse(raw); } catch {}

    if (!response.ok) {
      const message = data?.error?.message || raw.slice(0, 700) || ('Gemini HTTP ' + response.status);
      return res.status(response.status).json({ error: message });
    }

    const text = (data?.candidates?.[0]?.content?.parts || [])
      .map(p => p?.text || '')
      .join('')
      .trim();

    if (!text) {
      return res.status(502).json({ error: 'Gemini returned no displayable text.' });
    }

    return res.status(200).json({ text });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Server error' });
  }
};
