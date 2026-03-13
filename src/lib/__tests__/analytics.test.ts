import { describe, it, expect, beforeEach, vi } from 'vitest'
import { initGA } from '../analytics'

describe('initGA', () => {
  beforeEach(() => {
    // Clean up any scripts added during previous tests
    document.head.innerHTML = ''
    // Reset dataLayer
    delete (window as any).dataLayer
  })

  it('does nothing when gaId is an empty string', () => {
    initGA('')

    const scripts = document.head.querySelectorAll('script')
    expect(scripts).toHaveLength(0)
    expect((window as any).dataLayer).toBeUndefined()
  })

  it('appends the gtag script tag for a valid Measurement ID', () => {
    initGA('G-TEST12345')

    const scripts = Array.from(document.head.querySelectorAll('script'))
    expect(scripts).toHaveLength(1)
    expect(scripts[0].src).toContain('googletagmanager.com/gtag/js?id=G-TEST12345')
    expect(scripts[0].async).toBe(true)
  })

  it('initialises window.dataLayer', () => {
    initGA('G-TEST12345')

    expect(Array.isArray((window as any).dataLayer)).toBe(true)
  })

  it('pushes js and config commands into dataLayer', () => {
    initGA('G-TEST12345')

    const dl: any[][] = (window as any).dataLayer
    // First entry: ['js', <Date>]
    expect(dl[0][0]).toBe('js')
    expect(dl[0][1]).toBeInstanceOf(Date)
    // Second entry: ['config', 'G-TEST12345']
    expect(dl[1][0]).toBe('config')
    expect(dl[1][1]).toBe('G-TEST12345')
  })

  it('preserves an existing dataLayer array', () => {
    ;(window as any).dataLayer = [{ existingEntry: true }]
    initGA('G-ANOTHER')

    const dl: any[] = (window as any).dataLayer
    expect(dl[0]).toEqual({ existingEntry: true })
    expect(dl.length).toBeGreaterThan(1)
  })

  it('can be called multiple times without throwing', () => {
    expect(() => {
      initGA('G-FIRST')
      initGA('G-SECOND')
    }).not.toThrow()
  })
})
