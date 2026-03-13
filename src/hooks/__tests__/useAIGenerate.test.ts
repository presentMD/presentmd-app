import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// ── Mock heavy AI SDKs so the hook can be imported in jsdom ──────────────────
vi.mock('openai', () => {
  const AuthenticationError = class extends Error { status = 401; constructor(m: string) { super(m) } }
  const RateLimitError      = class extends Error { status = 429; constructor(m: string) { super(m) } }
  const APIError            = class extends Error { status = 500; constructor(m: string) { super(m) } }
  const OpenAI = vi.fn().mockImplementation(() => ({
    chat: { completions: { create: vi.fn() } },
  }))
  ;(OpenAI as any).AuthenticationError = AuthenticationError
  ;(OpenAI as any).RateLimitError      = RateLimitError
  ;(OpenAI as any).APIError            = APIError
  return { default: OpenAI }
})

vi.mock('@anthropic-ai/sdk', () => {
  const AuthenticationError  = class extends Error { constructor(m: string) { super(m) } }
  const RateLimitError       = class extends Error { constructor(m: string) { super(m) } }
  const PermissionDeniedError = class extends Error { constructor(m: string) { super(m) } }
  const APIError             = class extends Error { status = 500; constructor(m: string) { super(m) } }
  const Anthropic = vi.fn().mockImplementation(() => ({
    messages: {
      stream: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        abort: vi.fn(),
        finalMessage: vi.fn().mockResolvedValue({}),
      }),
    },
  }))
  ;(Anthropic as any).AuthenticationError  = AuthenticationError
  ;(Anthropic as any).RateLimitError       = RateLimitError
  ;(Anthropic as any).PermissionDeniedError = PermissionDeniedError
  ;(Anthropic as any).APIError             = APIError
  return { default: Anthropic }
})

import { useAIGenerate } from '../useAIGenerate'

describe('useAIGenerate — initial state', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // localStorage mock returns undefined by default → falls back to defaults
  })

  it('defaults to the gemini provider', () => {
    const { result } = renderHook(() => useAIGenerate())
    expect(result.current.providerId).toBe('gemini')
  })

  it('starts with empty generatedContent', () => {
    const { result } = renderHook(() => useAIGenerate())
    expect(result.current.generatedContent).toBe('')
  })

  it('starts with no error', () => {
    const { result } = renderHook(() => useAIGenerate())
    expect(result.current.error).toBeNull()
  })

  it('starts with isGenerating false', () => {
    const { result } = renderHook(() => useAIGenerate())
    expect(result.current.isGenerating).toBe(false)
  })
})

describe('useAIGenerate — setters', () => {
  beforeEach(() => vi.clearAllMocks())

  it('setProviderId updates the provider and persists to localStorage', () => {
    const { result } = renderHook(() => useAIGenerate())
    act(() => result.current.setProviderId('anthropic'))
    expect(result.current.providerId).toBe('anthropic')
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'presentmd_ai_provider',
      'anthropic'
    )
  })

  it('setApiKey updates the key for the current provider', () => {
    const { result } = renderHook(() => useAIGenerate())
    act(() => result.current.setApiKey('sk-test-key'))
    expect(result.current.apiKey).toBe('sk-test-key')
  })

  it('setOllamaHost updates host and persists', () => {
    const { result } = renderHook(() => useAIGenerate())
    act(() => result.current.setOllamaHost('http://localhost:5555'))
    expect(result.current.ollamaHost).toBe('http://localhost:5555')
  })

  it('setOllamaModel updates model and persists', () => {
    const { result } = renderHook(() => useAIGenerate())
    act(() => result.current.setOllamaModel('mistral'))
    expect(result.current.ollamaModel).toBe('mistral')
  })
})

describe('useAIGenerate — reset', () => {
  it('clears generatedContent and error', () => {
    const { result } = renderHook(() => useAIGenerate())
    act(() => result.current.reset())
    expect(result.current.generatedContent).toBe('')
    expect(result.current.error).toBeNull()
  })
})

describe('useAIGenerate — generate validation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sets an error when required API key is missing', async () => {
    const { result } = renderHook(() => useAIGenerate())
    // Gemini requires a key; localStorage returns undefined → empty key
    await act(async () => {
      await result.current.generate('A great presentation', 5)
    })
    expect(result.current.error).toMatch(/api key/i)
    expect(result.current.isGenerating).toBe(false)
  })

  it('sets an error when prompt is blank', async () => {
    const { result } = renderHook(() => useAIGenerate())
    // Give it a key first so key-validation passes
    act(() => result.current.setApiKey('AIzaSy-fake-key'))
    await act(async () => {
      await result.current.generate('   ', 5)
    })
    expect(result.current.error).toMatch(/describe/i)
    expect(result.current.isGenerating).toBe(false)
  })
})

describe('useAIGenerate — stop', () => {
  it('sets isGenerating to false', () => {
    const { result } = renderHook(() => useAIGenerate())
    act(() => result.current.stop())
    expect(result.current.isGenerating).toBe(false)
  })
})
