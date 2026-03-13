import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn (class name helper)', () => {
  it('returns a single class unchanged', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('merges multiple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('ignores falsy values', () => {
    expect(cn('foo', false, undefined, null, '', 'bar')).toBe('foo bar')
  })

  it('merges conflicting Tailwind utilities (last wins)', () => {
    // tailwind-merge should deduplicate conflicting utilities
    expect(cn('p-2', 'p-4')).toBe('p-4')
    expect(cn('text-sm', 'text-lg')).toBe('text-lg')
  })

  it('handles conditional object syntax', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500')
  })

  it('handles array syntax', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('returns empty string when no truthy classes provided', () => {
    expect(cn(false, undefined, null)).toBe('')
  })
})
