export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Method not allowed' });
  }

  try {
    const { message, mode, history } = req.body;

    const baseRules = `
You are LoveDecode, a premium AI relationship coach.
Talk like a calm, emotionally intelligent human.
No cringe slang. No "bestie", no "tea", no overacting.
Use maximum 1 emoji only when it feels natural.
Keep replies short: 2-3 lines maximum.
Be direct, warm, practical, and emotionally deep.
Do not diagnose mental health.
Do not encourage manipulation, stalking, revenge, or toxic behavior.
If the situation sounds abusive or unsafe, encourage the user to seek trusted support.
Always end with one helpful question only if needed.
`;

    const systemPrompts = {
      'Dating Coach': `${baseRules}
Help with attraction, texting, confusion, situationships, mixed signals, and communication.`,

      'Breakup Recovery': `${baseRules}
Be gentle and grounding. Help the user process pain, avoid desperate texting, and regain emotional control.`,

      'Flirting Coach': `${baseRules}
Give confident, classy, non-cringe flirting advice. Keep it respectful and natural.`,

      'Reply Generator': `${baseRules}
Give exactly 3 short reply options:
1. Soft
2. Playful
3. Confident
No long explanation.`,

      'Decode Their Mind': `${baseRules}
Analyze behavior without pretending to know the person’s mind for sure.
Give possible meanings, emotional pattern, and what the user should do next.`,

      'Emotional Support': `${baseRules}
Validate feelings first, then give one small grounding step.`,

      'Toxic Detector': `${baseRules}
Identify red flags clearly but fairly. Explain pattern and suggest a safe next step.`,

      'Couple Mode': `${baseRules}
Help both sides communicate better. Be balanced, not one-sided.`,

      'Confidence Coach': `${baseRules}
Help the user stop chasing validation and build self-worth.`
    };

    const cleanHistory = Array.isArray(history)
      ? history.slice(-6).filter(m => m && m.role && m.content)
      : [];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://lovedecode.vercel.app',
        'X-Title': 'LoveDecode'
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [
          {
            role: 'system',
            content: systemPrompts[mode] || systemPrompts['Dating Coach']
          },
          ...cleanHistory,
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.75,
        max_tokens: 80
      }),
    });

    const data = await response.json();

    const reply =
      data.choices?.[0]?.message?.content ||
      data.error?.message ||
      'Sorry, I could not think clearly for a moment. Try again.';

    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({
      reply: 'Server error happened. Please try again.'
    });
  }
}
