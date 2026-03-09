export type ProviderId = 'gemini' | 'anthropic' | 'ollama';

export interface AIProvider {
  id: ProviderId;
  name: string;
  initials: string;
  badge: string;
  badgeColor: 'green' | 'orange' | 'purple';
  description: string;
  /** Default model ID to use for this provider */
  defaultModel: string;
  /** OpenAI-compatible base URL; empty string for Anthropic (uses its own SDK) */
  baseURL: string;
  /** Label for the API key input */
  keyLabel: string;
  /** Placeholder text for the API key input */
  keyPlaceholder: string;
  /** URL where users can get/create a key */
  keyUrl: string;
  /** Whether this provider needs an API key */
  requiresKey: boolean;
  /** Whether to use the local Ollama-style URL input instead of a key */
  isLocal: boolean;
  /** Whether the OpenAI-compatible client covers this provider */
  isOpenAICompatible: boolean;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    initials: 'G',
    badge: 'Free',
    badgeColor: 'green',
    description: 'Generous free tier · no credit card required',
    defaultModel: 'gemini-2.0-flash',
    baseURL: 'https://generativelanguage.googleapis.com/openai/',
    keyLabel: 'Google AI Studio API Key',
    keyPlaceholder: 'AIzaSy...',
    keyUrl: 'https://aistudio.google.com/apikey',
    requiresKey: true,
    isLocal: false,
    isOpenAICompatible: true,
  },
  {
    id: 'anthropic',
    name: 'Claude (Anthropic)',
    initials: 'A',
    badge: 'Paid API',
    badgeColor: 'orange',
    description: 'Claude API · separate from claude.ai',
    defaultModel: 'claude-opus-4-5',
    baseURL: '', // uses @anthropic-ai/sdk directly
    keyLabel: 'Anthropic API Key',
    keyPlaceholder: 'sk-ant-...',
    keyUrl: 'https://console.anthropic.com/account/keys',
    requiresKey: true,
    isLocal: false,
    isOpenAICompatible: false,
  },
  {
    id: 'ollama',
    name: 'Ollama',
    initials: 'OL',
    badge: 'Local · Free',
    badgeColor: 'purple',
    description: 'Run models locally · completely private',
    defaultModel: 'llama3.2',
    baseURL: 'http://localhost:11434',
    keyLabel: '',
    keyPlaceholder: '',
    keyUrl: 'https://ollama.com',
    requiresKey: false,
    isLocal: true,
    isOpenAICompatible: true,
  },
];

export const DEFAULT_PROVIDER_ID: ProviderId = 'gemini';

export function getProvider(id: ProviderId): AIProvider {
  return AI_PROVIDERS.find((p) => p.id === id) ?? AI_PROVIDERS[0];
}
