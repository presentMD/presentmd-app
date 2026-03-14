import { describe, it, expect } from 'vitest'
import { getProvider, AI_PROVIDERS, DEFAULT_PROVIDER_ID } from '../aiProviders'

describe('aiProviders', () => {
  describe('getProvider', () => {
    it('returns the matching provider by id', () => {
      const provider = getProvider('gemini')
      expect(provider.id).toBe('gemini')
    })

    it('returns the first provider as fallback when id is not found', () => {
      // Cast to bypass type system — simulates an unknown/stale id at runtime
      const provider = getProvider('unknown' as Parameters<typeof getProvider>[0])
      expect(provider).toBe(AI_PROVIDERS[0])
    })
  })

  describe('DEFAULT_PROVIDER_ID', () => {
    it('is a valid provider id present in AI_PROVIDERS', () => {
      const ids = AI_PROVIDERS.map(p => p.id)
      expect(ids).toContain(DEFAULT_PROVIDER_ID)
    })
  })
})
