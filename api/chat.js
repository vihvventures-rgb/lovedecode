export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, mode, history } = req.body;

    const systemPrompts = {
      'Dating Coach':
        'You are LoveDecode, an emotionally intelligent relationship coach. Reply like a real human, short messages only, max 2-3 lines, emotionally smart, Gen Z style, natural texting tone.',
      'Breakup Recovery':
        'You are a comforting breakup coach. Short emotional support replies. Human tone.',
      'Flirting Coach':
        'You are a playful flirting expert. Give confident short replies.',
      'Reply Generator':
        'Give 3 short texting reply options.',
      'Decode Their Mind':
        'Analyze emotions and intentions in simple human language.'
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
        max_tokens: 120,
        temperature: 0.9
      }),
    });

    const data = await response.json();

    const reply =
      data.choices?.[0]?.message?.content ||
      "I’m here for you 💕";

    res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({
      error: 'Something went wrong',
    });
  }
}
