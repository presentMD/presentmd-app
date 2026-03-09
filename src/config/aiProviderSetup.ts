import type { ProviderId } from './aiProviders';

export interface SetupStep {
  text: string;
  /** Inline code snippet shown after the text */
  code?: string;
  /** External link appended to the step */
  link?: { href: string; label: string };
  /** Render the step in amber/warning style */
  warn?: boolean;
}

export interface ProviderSetup {
  /** One-line prereq summary */
  prereqs: string;
  /** Numbered installation/configuration steps */
  steps: SetupStep[];
  /** Short pricing summary */
  pricing: string;
  /** Highlight pricing line in amber (for paid-only providers) */
  pricingWarn?: boolean;
}

export const PROVIDER_SETUP: Record<ProviderId, ProviderSetup> = {
  gemini: {
    prereqs: 'A Google account — no credit card required',
    steps: [
      {
        text: 'Open Google AI Studio',
        link: { href: 'https://aistudio.google.com/apikey', label: 'aistudio.google.com/apikey' },
      },
      { text: 'Sign in with your Google account' },
      { text: 'Click "Create API Key" → select or create a project → copy the key' },
      { text: 'Paste the key above — it starts with', code: 'AIzaSy…' },
    ],
    pricing: 'Free tier: 15 req/min · 1,500 req/day · 1 M tokens/day — no credit card ever required',
  },

  anthropic: {
    prereqs: 'A separate Anthropic API account + billing credits (not included with claude.ai)',
    steps: [
      {
        text: 'Go to the Anthropic Console',
        link: { href: 'https://console.anthropic.com', label: 'console.anthropic.com' },
      },
      {
        text: 'This is a different account from claude.ai — sign up separately',
        warn: true,
      },
      { text: 'Add billing credits under Plans & Billing' },
      { text: 'Go to API Keys → "Create Key" → copy it' },
      { text: 'Paste the key above — it starts with', code: 'sk-ant-…' },
    ],
    pricing: 'Pay-per-use — no free tier · claude-opus-4-5: ~$0.05–0.15 per typical presentation',
    pricingWarn: true,
  },

  ollama: {
    prereqs: 'A macOS, Linux, or Windows machine with ~4 GB+ free RAM per model',
    steps: [
      {
        text: 'Download & install Ollama',
        link: { href: 'https://ollama.com', label: 'ollama.com' },
      },
      {
        text: 'Pull a model (run in your terminal):',
        code: 'ollama pull llama3.2',
      },
      {
        text: 'Start Ollama with browser CORS enabled:',
        code: 'OLLAMA_ORIGINS=* ollama serve',
      },
      {
        text: 'On Windows PowerShell:',
        code: '$env:OLLAMA_ORIGINS="*"; ollama serve',
      },
      { text: 'Enter the host and model name above, then generate' },
      {
        text: 'HTTPS deployments (e.g. Netlify) cannot reach plain-HTTP Ollama. Run presentMD locally for best results.',
        warn: true,
      },
    ],
    pricing: '100% free · runs entirely on your machine · no data leaves your device · no usage limits',
  },
};

/** Popular Ollama models with RAM requirements */
export const OLLAMA_MODELS = [
  { id: 'llama3.2',         label: 'Llama 3.2 3B',         ram: '~2 GB RAM' },
  { id: 'llama3.2:1b',      label: 'Llama 3.2 1B (tiny)',  ram: '~1 GB RAM' },
  { id: 'llama3.1:8b',      label: 'Llama 3.1 8B',         ram: '~5 GB RAM' },
  { id: 'mistral',          label: 'Mistral 7B',            ram: '~4 GB RAM' },
  { id: 'gemma3:4b',        label: 'Gemma 3 4B',            ram: '~3 GB RAM' },
  { id: 'qwen2.5:7b',       label: 'Qwen 2.5 7B',          ram: '~5 GB RAM' },
  { id: 'phi4',             label: 'Phi-4 14B',             ram: '~9 GB RAM' },
  { id: 'llama3.3:70b',     label: 'Llama 3.3 70B',        ram: '~40 GB RAM' },
];
