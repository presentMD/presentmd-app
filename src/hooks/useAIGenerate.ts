import { useState, useCallback, useRef } from 'react';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { type ProviderId, getProvider, DEFAULT_PROVIDER_ID } from '@/config/aiProviders';

// ─── Storage keys ────────────────────────────────────────────────────────────
const STORAGE = {
  provider:    'presentmd_ai_provider',
  keys:        'presentmd_ai_keys',       // JSON: { [providerId]: apiKey }
  ollamaHost:  'presentmd_ollama_host',
  ollamaModel: 'presentmd_ollama_model',
} as const;

// ─── Presentation system prompt ──────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a markdown presentation generator for presentMD — a tool that renders markdown as beautiful slide decks.

SLIDE FORMAT:
- Separate slides with --- on its own line (three dashes alone on the line)
- Each slide typically starts with # (h1) for the title
- Use ## for section headings within a slide
- Bullet lists use - or *
- Bold: **text**, Italic: *text*, Inline code: \`code\`

SPECIAL DIRECTIVES (optional, use sparingly):
- <!-- Footer: "Your footer text" --> — adds a footer bar to a slide
- <!-- Header: "Your header text" --> — adds a header bar to a slide
- <!-- Notes: Your presenter notes --> — hidden speaker notes (not shown on slide)
- <!-- _color: #hex or colorname --> — custom text color for that slide
- <!-- _backgroundColor: #hex or colorname --> — custom background color for that slide

GUIDELINES:
- Keep each slide focused on one idea — don't cram too much text
- Use short, punchy bullet points (5–7 words each) rather than long sentences
- First slide: title slide with the presentation topic as h1 and a subtitle as a paragraph
- Last slide: a closing "Thank You" or "Questions?" slide
- Generate clean, professional content suitable for business or academic contexts
- Output ONLY the markdown — no preamble, no explanation, no code fences`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function loadKeys(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(STORAGE.keys) || '{}'); }
  catch { return {}; }
}

function saveKeys(keys: Record<string, string>): void {
  localStorage.setItem(STORAGE.keys, JSON.stringify(keys));
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAIGenerate() {
  const [providerId, setProviderIdState] = useState<ProviderId>(
    () => (localStorage.getItem(STORAGE.provider) as ProviderId) || DEFAULT_PROVIDER_ID
  );
  const [apiKeys, setApiKeysState] = useState<Record<string, string>>(loadKeys);
  const [ollamaHost, setOllamaHostState] = useState(
    () => localStorage.getItem(STORAGE.ollamaHost) || 'http://localhost:11434'
  );
  const [ollamaModel, setOllamaModelState] = useState(
    () => localStorage.getItem(STORAGE.ollamaModel) || 'llama3.2'
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const abortFnRef = useRef<(() => void) | null>(null);

  // ── Setters that also persist ──────────────────────────────────────────────
  const setProviderId = useCallback((id: ProviderId) => {
    setProviderIdState(id);
    localStorage.setItem(STORAGE.provider, id);
  }, []);

  const setApiKey = useCallback((id: ProviderId, key: string) => {
    const trimmed = key.trim();
    setApiKeysState(prev => {
      const next = { ...prev, [id]: trimmed };
      saveKeys(next);
      return next;
    });
  }, []);

  const setOllamaHost = useCallback((v: string) => {
    setOllamaHostState(v);
    localStorage.setItem(STORAGE.ollamaHost, v);
  }, []);

  const setOllamaModel = useCallback((v: string) => {
    setOllamaModelState(v);
    localStorage.setItem(STORAGE.ollamaModel, v);
  }, []);

  // ── Generate ───────────────────────────────────────────────────────────────
  const generate = useCallback(async (prompt: string, slideCount: number) => {
    const provider = getProvider(providerId);
    const apiKey = apiKeys[providerId] || '';

    if (provider.requiresKey && !apiKey) {
      setError(`Please enter your ${provider.keyLabel}.`);
      return;
    }
    if (!prompt.trim()) {
      setError('Please describe what your presentation should be about.');
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');
    setError(null);

    const userMessage =
      `Create a ${slideCount}-slide presentation about: ${prompt.trim()}\n\n` +
      `Generate the presentation as markdown following the presentMD format.`;

    /* v8 ignore start -- live streaming paths require a real provider connection */
    try {
      // ── Anthropic path (native SDK, adaptive thinking) ──────────────────
      if (providerId === 'anthropic') {
        const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
        const stream = client.messages.stream({
          model: 'claude-opus-4-5',
          max_tokens: 8192,
          thinking: { type: 'adaptive' },
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userMessage }],
        });
        abortFnRef.current = () => stream.abort();
        stream.on('text', (delta) => setGeneratedContent((p) => p + delta));
        await stream.finalMessage();

      // ── OpenAI-compatible path (Gemini, Ollama) ────────────────────────
      } else {
        const baseURL = providerId === 'ollama'
          ? `${ollamaHost.replace(/\/+$/, '')}/v1`
          : provider.baseURL;

        const model = providerId === 'ollama' ? ollamaModel : provider.defaultModel;

        const client = new OpenAI({
          baseURL,
          // Ollama ignores the key, but the SDK requires a non-empty string
          apiKey: apiKey || 'no-key',
          dangerouslyAllowBrowser: true,
        });

        const abortController = new AbortController();
        abortFnRef.current = () => abortController.abort();

        const stream = await client.chat.completions.create(
          {
            model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user',   content: userMessage },
            ],
            stream: true,
            max_tokens: 8192,
          },
          { signal: abortController.signal }
        );

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? '';
          if (delta) setGeneratedContent((p) => p + delta);
        }
      }
    } catch (err) {
      // Ignore intentional aborts
      if (
        err instanceof Error &&
        (err.name === 'AbortError' || err.message.toLowerCase().includes('abort'))
      ) return;

      // Anthropic typed errors
      if (err instanceof Anthropic.AuthenticationError) {
        setError('Invalid Anthropic API key. Check your key at console.anthropic.com.');
      } else if (err instanceof Anthropic.RateLimitError) {
        setError('Anthropic rate limit hit — please wait and try again.');
      } else if (err instanceof Anthropic.PermissionDeniedError) {
        setError('Anthropic: API key lacks access. Check your plan.');
      } else if (err instanceof Anthropic.APIError) {
        setError(`Anthropic error (${err.status}): ${err.message}`);

      // OpenAI-compatible typed errors (Gemini, Ollama)
      } else if (err instanceof OpenAI.AuthenticationError) {
        setError(`Invalid API key for ${provider.name}. Double-check your key.`);
      } else if (err instanceof OpenAI.RateLimitError) {
        setError(`${provider.name} rate limit — please wait and try again.`);
      } else if (err instanceof OpenAI.APIError) {
        setError(`${provider.name} error (${err.status}): ${err.message}`);

      // Network errors (Ollama not running, etc.)
      } else if (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) {
        setError(
          providerId === 'ollama'
            ? 'Cannot reach Ollama. Is it running? Try: OLLAMA_ORIGINS=* ollama serve'
            : `Network error connecting to ${provider.name}. Check your connection.`
        );
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsGenerating(false);
      abortFnRef.current = null;
    }
    /* v8 ignore stop */
  }, [providerId, apiKeys, ollamaHost, ollamaModel]);

  const stop = useCallback(() => {
    abortFnRef.current?.();
    setIsGenerating(false);
  }, []);

  const reset = useCallback(() => {
    setGeneratedContent('');
    setError(null);
  }, []);

  return {
    providerId,
    setProviderId,
    apiKey: apiKeys[providerId] || '',
    setApiKey: (key: string) => setApiKey(providerId, key),
    ollamaHost,    setOllamaHost,
    ollamaModel,   setOllamaModel,
    isGenerating,
    generatedContent,
    error,
    generate,
    stop,
    reset,
  };
}
