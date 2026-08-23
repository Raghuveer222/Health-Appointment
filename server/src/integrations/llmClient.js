const axios = require('axios');

/**
 * Low-level client for calling LLM providers (Gemini / OpenAI / Groq / OpenRouter)
 */
const callLLMApi = async (prompt, systemInstruction = '') => {
  const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();
  const apiKey = process.env.LLM_API_KEY;
  const timeoutMs = 8000; // 8 sec timeout

  if (!apiKey) {
    throw new Error('LLM_API_KEY is not set in environment variables');
  }

  if (provider === 'gemini') {
    const model = process.env.LLM_MODEL || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const contents = [
      {
        role: 'user',
        parts: [
          { text: systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt }
        ]
      }
    ];

    const response = await axios.post(
      url,
      {
        contents,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      },
      { timeout: timeoutMs }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini API');
    return text;
  } 
  
  if (provider === 'openai' || provider === 'groq' || provider === 'openrouter') {
    let baseUrl = 'https://api.openai.com/v1/chat/completions';
    if (provider === 'groq') baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
    if (provider === 'openrouter') baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

    const model = process.env.LLM_MODEL || (provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-3.5-turbo');

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await axios.post(
      baseUrl,
      {
        model,
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.2
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: timeoutMs
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) throw new Error(`Empty response from ${provider} API`);
    return content;
  }

  throw new Error(`Unsupported LLM provider: ${provider}`);
};

module.exports = { callLLMApi };
