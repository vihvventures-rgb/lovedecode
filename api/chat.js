export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, mode, history } = req.body;

    const systemPrompts = {
      'Dating Coach':
        'You are LoveDecode, an emotionally intelligent relationship coach. Reply naturally like a human. Keep replies short, emotional, Gen Z style, max 2-3 lines.',
      'Breakup Recovery':
        'You are a comforting breakup coach. Give emotional support in short human replies.',
      'Flirting Coach':
        'You are a playful flirting expert. Give confident short replies.',
      'Reply Generator':
        'Give 3 short texting reply options.',
      'Decode Their Mind':
        'Analyze emotions and intentions in simple human language.'
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://lovedecode.vercel.app',
        'X-Title': 'LoveDecode'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          {
            role: 'system',
            content:
              systemPrompts[mode] ||
              'You are a relationship coach. Keep replies short and human.'
          },
          ...(history || []).slice(-6),
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.9,
        max_tokens: 120
      }),
    });

    const data = await response.json();

    const reply =
      data.choices?.[0]?.message?.content ||
      data.error?.message ||
      "No reply received from AI";

    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({
      reply: 'Server error happened'
    });
  }
}
