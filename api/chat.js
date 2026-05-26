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
    ]
  }),
});
